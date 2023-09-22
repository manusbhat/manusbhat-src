use std::collections::{HashMap};
use std::{env, fs};
use std::net::SocketAddr;
use std::sync::{Arc};
use std::time::Duration;

use axum::{routing::{get, delete, put, post}, Router, Json};
use axum::extract::{Path, State, WebSocketUpgrade};
use axum::extract::ws::{Message, WebSocket};
use axum::response::IntoResponse;
use fcm_v1::{auth, Client};
use serde::{Deserialize, Serialize};
use sqlx::migrate::MigrateDatabase;
use sqlx::{Executor, Sqlite, SqlitePool};
use tokio::sync::{Mutex, oneshot};
use tower_http::trace::TraceLayer;
use futures::{sink::SinkExt, stream::StreamExt};
use esoteric_back::auth::UserClaim;

use esoteric_back::handlers::{stats, status};
use esoteric_back::logging::init_log;
use esoteric_back::state::{AppState, Error, UserID};

const DATABASE_URL: &str = "sqlite:sync.db";
const PORT: u16 = 3194;

type UUID = String;
type Bucket = String;
type Slaves = HashMap<(UserID, Bucket), Option<oneshot::Sender<()>>>;

pub struct SingleThreadSyncState {
    slaves: Slaves,
    fcm: Client,

    nutq_interrupt: tokio::sync::mpsc::Sender<()>,
    nutq_queue: nutq::NotificationQueue
}

pub type SyncState = AppState<Arc<Mutex<SingleThreadSyncState>>>;

mod nutq {
    use std::cmp::max;
    use std::collections::{HashMap, HashSet};
    use axum::extract::{Path, State};
    use chrono::{DateTime, Duration, Local, LocalResult, TimeZone, Utc};
    use fcm_v1::apns::ApnsConfig;
    use fcm_v1::message;
    use serde::{Deserializer, Serializer};
    use serde_json::Value;
    use tokio::fs;
    use tokio::time::sleep;
    use esoteric_back::auth::UserClaim;
    use esoteric_back::state::{Error, UserID};
    use crate::{SyncState, UUID};
    use super::{Serialize, Deserialize};

    pub(crate) const NUTQ_BUCKET: &str = "nutq";
    const NUTQ_IDENTIFIER: &str = "com.enigmadux.nutqdarwin";
    const NUTQ_MAIN_CATEGORY: &str = "nutq-reminder";

    const FUTURE_DURATION_DAYS: i64 = 7;
    const PAST_NOTIF_LOOKBACK: i64 = 60;
    const QUICK_UPDATE_TIMEOUT: i64 = 60;
    const REMINDER_OFFSET: i64 = 0;
    const EVENT_OFFSET: i64 = 60 * -10; // -10 minutes
    const ASSIGNMENT_OFFSET: i64 = 3600 * -2; // -2 hours
    const ENDING_MAXIMUM: i64 = 3600; // 10 minutes after the actual end

    #[derive(Debug, Serialize, Deserialize)]
    struct BlockRepeat {
        blocks: i32,
        remainders: Vec<i32>,
        modulus: i32,
        block_unit: f64
    }

    // makes serde easier..
    #[derive(Debug, Serialize, Deserialize)]
    struct IdentityHolder { }

    #[derive(Debug, Serialize, Deserialize)]
    struct BlockHolder { block: BlockRepeat }

    #[derive(Debug, Serialize, Deserialize)]
    enum SchemeRepeat {
        None(IdentityHolder),
        Block(BlockHolder),
    }

    #[derive(Debug, Serialize, Deserialize)]
    struct SchemeSingularState {
        progress: i32,
        delay: f64
    }

    const SWIFT_SERIALIZATION_OFFSET: i64 = 978307200;
    // swift keeps on overriding user setting and giving seconds since 2001.. (978307200 seconds)
    fn deserialize_unix_timestamp<'de, D>(deserializer: D) -> Result<Option<DateTime<Local>>, D::Error>
        where D: Deserializer<'de>,
    {
        let timestamp: f64 = match Option::deserialize(deserializer) {
            Ok(None) => return Ok(None),
            Ok(Some(time)) => time,
            Err(e) => return Err(e)
        };

        // don't really care about nsecs
        match Local.timestamp_opt( SWIFT_SERIALIZATION_OFFSET + timestamp as i64, 0) {
            LocalResult::Single(res) => Ok(Some(res)),
            _ => Ok(None)
        }
    }

    fn serialize_unix_timestamp<S>(datetime: &Option<DateTime<Local>>, serializer: S)
        -> Result<S::Ok, S::Error> where S: Serializer
    {
        match datetime {
            Some(dt) => {
                let timestamp = (dt.timestamp() - SWIFT_SERIALIZATION_OFFSET) as f64;

                timestamp.serialize(serializer)
            }
            None => None::<f64>.serialize(serializer), // Serialize as JSON null
        }
    }

    #[derive(Debug, Serialize, Deserialize)]
    struct SchemeItem {
        id: UUID,

        state: Vec<SchemeSingularState>,
        text: String,

        // local is pacific (hosted in fremont), which is generally what i want
        // however, if i'm ever travelling, this may cause problems...

        #[serde(deserialize_with = "deserialize_unix_timestamp", serialize_with="serialize_unix_timestamp")]
        start: Option<DateTime<Local>>,
        #[serde(deserialize_with = "deserialize_unix_timestamp", serialize_with="serialize_unix_timestamp")]
        end: Option<DateTime<Local>>,

        repeats: SchemeRepeat,

        indentation: i32
    }

    fn dst_add(base: DateTime<Local>, duration: Duration) -> DateTime<Local> {
        let std = base + duration;
        let old = base.offset().local_minus_utc();
        let new = std.offset().local_minus_utc();

        return std + Duration::seconds((old - new) as i64);
    }

    impl SchemeItem {

        fn notifications(&self,
                         dump: &mut Vec<Notification>,
                         user: UserID,
                         scheme: &UUID,
                         scheme_title: &str
        )  {
            if self.start == None && self.end == None {
                return
            }

            // todo: don't assume we're in pacific all the time
            // also, we kind of assume a lot of stuff... (such as only assuming day repeats)

            for (i, state) in self.state.iter().enumerate() {
                if state.progress == -1 {
                    continue
                }

                let base_offset = match &self.repeats {
                    SchemeRepeat::Block(BlockHolder { block} ) => {
                        let m = block.remainders.len();
                        let seconds= (block.block_unit as i32) * (i as i32 / m as i32 * block.modulus + block.remainders[i % m]);

                        Duration::seconds(seconds as i64)
                    },
                    SchemeRepeat::None(_) => Duration::seconds(0)
                };

                let delay_offset = Duration::seconds(state.delay as i64);

                let (start, end, time) =
                    match (self.start, self.end) {
                        (Some(start), Some(end)) =>
                            (Some(dst_add(start.clone(), base_offset)), Some(dst_add(end, base_offset)),
                             dst_add(start, base_offset + delay_offset + Duration::seconds(EVENT_OFFSET))),
                        (Some(start), None) =>
                            (Some(dst_add(start.clone(), base_offset)), None,
                             dst_add(start, base_offset + delay_offset + Duration::seconds(REMINDER_OFFSET))),
                        (None, Some(end)) =>
                            (None, Some(dst_add(end.clone(), base_offset)),
                             dst_add(end, base_offset + delay_offset + Duration::seconds(ASSIGNMENT_OFFSET))),
                        _ => continue
                    };

                if time >= Local::now() - Duration::seconds(PAST_NOTIF_LOOKBACK) {
                    dump.push(Notification {
                        user,
                        scheme: scheme.to_string(),
                        scheme_title: scheme_title.to_string(),
                        item: self.id.clone(),
                        item_title: self.text.clone(),
                        index: i as i32,
                        start,
                        end,
                        delay_nonce: delay_offset.num_seconds(),
                        dispatch_time: time
                    });
                }
            }
        }
    }

    #[derive(Debug, Serialize, Deserialize)]
    struct SchemeList {
        schemes: Vec<SchemeItem>
    }

    #[derive(Debug, Serialize, Deserialize)]
    struct Scheme {
        id: UUID,

        name: String,
        syncs_to_gsync: bool,
        color_index: i32,

        scheme_list: SchemeList
    }

    impl Scheme {
        fn notifications(&self, dump: &mut Vec<Notification>, user: UserID)  {
            for item in self.scheme_list.schemes.iter() {
                item.notifications(dump, user, &self.id, &self.name);
            }
        }
    }

    #[derive(Debug, Serialize, Deserialize)]
    struct SchemeHandle {
        schemes: Vec<Scheme>
    }

    impl SchemeHandle {
        fn notifications(&self, user: UserID) -> Vec<Notification> {
            // last thing and we're done!!
            let mut ret = Vec::new();
            for scheme in self.schemes.iter() {
                scheme.notifications(&mut ret, user);
            }

            ret
        }

        fn state_for(&mut self, scheme: UUID, item: UUID, index: usize)
            -> Option<&mut SchemeSingularState> {
            return self.schemes.iter_mut()
                .find(|test_scheme| test_scheme.id == scheme)
                .and_then(|scheme| scheme.scheme_list.schemes
                    .iter_mut()
                    .find(|test_item| test_item.id == item)
                )
                .and_then(|item| item.state.get_mut(index));
        }
    }

    #[derive(Debug, Clone, Hash, Eq, PartialEq)]
    pub(crate) struct Notification {
        user: UserID,

        scheme: UUID,
        scheme_title: String,

        item: UUID,
        item_title: String,

        index: i32,
        start: Option<DateTime<Local>>,
        end: Option<DateTime<Local>>,

        delay_nonce: i64,
        dispatch_time: DateTime<Local>,
    }

    pub(crate) struct NotificationQueue {
        user_queues: HashMap<UserID, Vec<Notification>>,
        finished: HashSet<Notification>
    }

    impl NotificationQueue {
        fn next(&self) -> Option<Notification> {
            let mut best: Option<&Notification> = None;
            for (_, q) in self.user_queues.iter() {
                for n in q.iter() {
                    if (best.is_none() || n.dispatch_time < best.unwrap().dispatch_time)
                        && !self.finished.contains(n) {
                        best = Some(n)
                    }
                }
            }

            return best.cloned();
        }

        fn del(&mut self, notif: Notification) {
            self.finished.insert(notif);
        }

        pub(crate) fn new() -> Self {
            Self {
                user_queues: HashMap::new(),
                finished: HashSet::new()
            }
        }
    }

    fn notif_content(notif: &Notification) -> String {
        let long = "%B %d, %H:%M";
        let short = "%H:%M";
        let now = Local::now().date_naive();

        match (notif.start, notif.end) {
            (Some(start), Some(end)) => {
                format!("{} \u{2192} {}", start.format(if start.date_naive() == now { short } else { long }), end.format(short))
            },
            (Some(start), None) => {
                format!("{} \u{2192}", start.format(if start.date_naive() == now { short } else { long}))
            },
            (None, Some(end)) => {
                format!("\u{2192} {}", end.format(if end.date_naive() == now { short } else { long}))
            },
            _ => "None".to_string()
        }
    }

    #[derive(Debug, Serialize)]
    struct SchemePath {
        scheme_id: UUID,
        item_id: UUID,
        index: usize
    }

    #[derive(Debug, Serialize)]
    struct ApsPayload {
        category: String
    }

    #[derive(Debug, Serialize)]
    struct DateHolder {
        #[serde(deserialize_with = "deserialize_unix_timestamp", serialize_with="serialize_unix_timestamp")]
        dispatch_time: Option<DateTime<Local>>
    }

    async fn notify_user(state: &SyncState, notification: Notification) -> Result<(), ()> {

        let device_ids: Vec<(String,)> = sqlx::query_as("SELECT device_id FROM devices WHERE user_id = ?")
            .bind(notification.user)
            .fetch_all(state.db())
            .await
            .map_err(|_| ())?;

        let title = format!("{} [{}]", notification.item_title, notification.scheme_title);
        let content = notif_content(&notification);

        let mut path = HashMap::new();
        path.insert("scheme_id".to_string(), Value::String(notification.scheme.clone()));
        path.insert("item_id".to_string(), Value::String(notification.item.clone()));
        path.insert("index".to_string(), Value::String(notification.index.to_string()));

        let aps = ApsPayload {
            category: NUTQ_MAIN_CATEGORY.to_string()
        };
        let aps_value: Value = serde_json::to_value(aps).unwrap();

        state.aux.lock().await.nutq_queue.del(notification);

        let mut apns = ApnsConfig::default();

        let mut payload = HashMap::new();
        payload.insert("aps".to_string(), aps_value);

        let mut aps_header = HashMap::new();
        aps_header.insert("apns-topic".to_string(), Value::String(NUTQ_IDENTIFIER.to_string()));
        aps_header.insert("apns-priority".to_string(), Value::String("5".to_string()));

        apns.payload = Some(payload);
        apns.headers = Some(aps_header);

        for (id, ) in device_ids {
            let mut notification = message::Notification::default();
            notification.title = Some(title.clone());
            notification.body = Some(content.clone());

            let mut message = message::Message::default();
            message.notification = Some(notification);
            message.token = Some(id);
            message.apns = Some(apns.clone());
            message.data = Some(path.clone());

            state.aux.lock().await.fcm.send(&message).await
                .map_err(|err| {
                    println!("Err {:?}", err);
                    ()
                })?;
        }

        Ok(())
    }

    async fn load_handle(user: UserID) -> Option<SchemeHandle> {
        fs::read_to_string(format!("./buckets/{}/{}.json", NUTQ_BUCKET, user)).await
            .ok()
            .and_then(|str| serde_json::from_str(&str).ok())
    }

    async fn save_handle(user: UserID, handle: &SchemeHandle) {
        if let Ok(str) = serde_json::to_string(handle) {
            let _ = fs::write(format!("./buckets/{}/{}.json", NUTQ_BUCKET, user), str).await;
        }
    }

    async fn startup(state: &SyncState) -> Result<(), ()> {
        // initialize notification queues
        let users: Vec<UserID> = sqlx::query_as("SELECT DISTINCT user_id FROM devices")
            .fetch_all(state.db()).await
            .map_err(|_| ())?
            .into_iter()
            .map(|(id, )| id)
            .collect();

        for user in users {
            if let Some(handle) = load_handle(user).await {
                state.aux.lock().await
                    .nutq_queue.user_queues.insert(user, handle.notifications(user));
            }
        }

        Ok(())
    }

    pub async fn notification_dispatch(state: SyncState, mut interrupt_rx: tokio::sync::mpsc::Receiver<()>) {
        startup(&state).await.expect("Could not start up notification dispatch");

        // either wait for interrupt, or wait for reminder event
        loop {
            let top = state.aux.lock().await.nutq_queue.next();
            let next_notif_time = top.as_ref()
                .map(|n| n.dispatch_time)
                .unwrap_or(Local::now() + Duration::days(FUTURE_DURATION_DAYS));


            // either wait till the next notification, or theres been a chnage to the notification queueut
            tokio::select! {
                _ = interrupt_rx.recv() => {
                    // special case where we essentially skipped over the last notification
                    // so we need to dispatch it now
                    if Utc::now() > next_notif_time {
                        if let Some(notif) = top {
                            match notify_user(&state, notif).await {
                                Err(_) => println!("Failed to notify user"),
                                _ => {}
                            }
                        }
                    }
                }

                // we don't really care about if it's off by one second or not
                _ = tokio::time::sleep(
                    tokio::time::Duration::from_secs(max(0, (next_notif_time - Local::now()).num_seconds()) as u64)
                ) => {
                    if let Some(notif) = top {
                        // dispatch reminder
                        match notify_user(&state, notif).await {
                            Err(_) => println!("Failed to notify user"),
                            _ => {}
                        }
                    }
                }
            }
        }
    }

    pub async fn interrupt(state: &SyncState, json: &serde_json::Value, user_id: UserID) -> Result<(), ()> {
        // recreate new list of notifications
        let schemes: SchemeHandle = serde_json::from_value(json.clone())
            .map_err(|_| ())?;

        let mut lock = state.aux.lock().await;

        lock.nutq_queue.user_queues.insert(user_id, schemes.notifications(user_id));

        lock.nutq_interrupt.send(()).await
            .map_err(|_| ())
    }

    async fn wait_for_empty_slave(state: &SyncState, user: UserID) -> Result<(), ()> {
        for _ in 0 .. QUICK_UPDATE_TIMEOUT {
            if !state.aux.lock().await.slaves.contains_key(&(user, NUTQ_BUCKET.to_string())) {
                return Ok(())
            }

            sleep(tokio::time::Duration::from_secs(1)).await
        }

        Err(())
    }

    async fn reminder_quick_helper(state: State<SyncState>,
                                   user: UserClaim,
                                   (scheme, item, index): (UUID, UUID, usize),
                                   func: impl FnOnce(&mut SchemeSingularState) + Send + Sync + 'static,
                                   interrupt: bool
    ) -> Result<(), Error> {
        // not the greatest thing ever, but basically just terminate the scheme, then we'll
        // update the results ourselves
        // really only inefficient due because of the entire recache on client side, but thats a general
        // problem anyways
        let id = user.id();
        let bucket = NUTQ_BUCKET.to_string();

        if state.aux.lock().await.slaves.contains_key(&(id, bucket)) {
            super::kill_slave(state.clone(), user, Path(NUTQ_BUCKET.to_string())).await?;
        }

        let State(inner_state) = state;

        tokio::spawn(async move {
            match wait_for_empty_slave(&inner_state, id).await {
                Err(_) => return,
                _ => {}
            }

            // load
            let handle = load_handle(id).await;

            // modify and save
            if let Some(mut handle) = handle {
                if let Some(state) = handle.state_for(scheme, item, index) {
                    func(state);

                    save_handle(id, &handle).await;
                }

                if interrupt {
                    let mut lock = inner_state.aux.lock().await;
                    lock.nutq_queue.user_queues.insert(id, handle.notifications(id));

                    let _ = lock.nutq_interrupt.send(()).await;
                }
            }
        });

        Ok(())
    }


    pub async fn remind_later(state: State<SyncState>,
                              user: UserClaim,
                              Path(path): Path<(UUID, UUID, usize)>,
                              // Json(new_time): Json<DateHolder>
    ) -> Result<(), Error> {
        reminder_quick_helper(state, user, path, move |handle| {
            // if let Some(new_time) = new_time.dispatch_time {
            //     // todo
            //     handle.delay += 0.0
            // }
        }, true).await
    }

    pub async fn complete(state: State<SyncState>,
                          user: UserClaim,
                          Path(path): Path<(UUID, UUID, usize)>
    ) -> Result<(), Error> {
        reminder_quick_helper(state, user, path, |handle| {
            handle.progress = -1;
        }, false).await
    }
}

async fn bucket_dispatch(temp_state: &SyncState, value: &serde_json::Value, bucket: &str, user: UserID) {
    match bucket {
        nutq::NUTQ_BUCKET => { let _ = nutq::interrupt(temp_state, &value, user).await; },
        _ => { }
    }
}

#[derive(Debug, Serialize, Deserialize)]
enum DeltaType {
    Create,
    Delete
}

#[derive(Debug, Serialize, Deserialize)]
struct Delta {
    // numbers or strings
    path: Vec<serde_json::Value>,
    delta_type: DeltaType,
    value: serde_json::Value
}

fn apply_updates(value: &mut serde_json::Value, deltas: Vec<Delta>) {
    'delta: for delta in deltas {
        let mut current = &mut *value;

        for path in delta.path[..delta.path.len() - 1].iter() {
            if current.is_array() {
                if let serde_json::Value::Number(num) = path {
                    current = current.get_mut(num.as_u64().unwrap() as usize).unwrap();
                    continue
                }
            }

            else if current.is_object() {
                if let Some(str) = path.as_str() {
                    current = current.get_mut(str).unwrap();
                    continue
                }
            }

            continue 'delta;
        }

        if let (Some(obj), Some(num)) = (
            current.as_array_mut(),
            delta.path.last().and_then(|x| x.as_u64())
        ) {
            match delta.delta_type {
                DeltaType::Create => { obj.insert(num as usize, delta.value); }
                DeltaType::Delete => { obj.remove(num as usize); }
            }
        }
        else if let (Some(obj), Some(str)) = (
            current.as_object_mut(),
            delta.path.last().and_then(|x| x.as_str())
        ) {
            match delta.delta_type {
                DeltaType::Create => { obj.insert(str.to_string(), delta.value); },
                DeltaType::Delete => { obj.remove(str); }
            }
        }
    }
}

async fn establish_slave(State(state): State<SyncState>,
                         ws: WebSocketUpgrade,
                         user: UserClaim,
                         Path(bucket): Path<Bucket>
) -> impl IntoResponse {
    ws.on_upgrade(|socket| slave_connection(socket, State(state), user, bucket))
}

async fn slave_connection(mut socket: WebSocket, State(state): State<SyncState>, user: UserClaim, bucket: Bucket) {
    // cancel if already connected
    // should probably be done with raii
    // but thats a bit hard to work with tokio (mainly cause of the async lock)
    let mut state_guard = state.aux.lock().await;
    if state_guard.slaves.contains_key(&(user.id(), bucket.clone())) {
        match socket.send(Message::Text("\"Resource in Use\"".to_string())).await {
            Ok(_) => { }
            Err(_) => { return; }
        }

        return;
    }

    let (kill_tx, kill_rx) = oneshot::channel();
    state_guard.slaves.insert((user.id(), bucket.clone()), Some(kill_tx));
    drop(state_guard);

    let file_contents = fs::read_to_string(format!("./buckets/{}/{}.json", bucket, user.id()))
        .unwrap_or_else(|_| {
            let res = "{}".to_string();

            fs::create_dir_all(format!("./buckets/{}", bucket))
                .expect("Error creating directory");

            fs::write(format!("./buckets/{}/{}.json", bucket, user.id()), res.clone())
                .expect("Error writing file");

            res
        });

    let mut json_value: serde_json::Value = serde_json::from_str(&file_contents)
        .expect("JSON data should be consistent");

    // first send current state
    let skip = match socket.send(Message::Text(json_value.to_string())).await {
        Ok(_) => false,
        Err(_) => true
    };

    let (mut socket_tx, mut socket_rx) = socket.split();

    // keep receiving updates (once socket is closed by either us or someone else, we exit the connection)
    tokio::spawn(async move {
        match kill_rx.await {
            Ok(_) => {
                socket_tx.send(Message::Text("\"Slave stolen\"".to_string())).await
                    .expect("Error sending close message");
            }
            Err(_) => { }
        }
    });

    while !skip {
        match socket_rx.next().await {
            Some(Ok(Message::Text(msg))) => {
                let cont: serde_json::error::Result<Vec<Delta>> = serde_json::from_str(&msg);
                match cont {
                    Ok(cont) => {
                        apply_updates(&mut json_value, cont);
                        bucket_dispatch(&state, &json_value, &bucket, user.id()).await;
                        fs::write(format!("./buckets/{}/{}.json", bucket, user.id()), json_value.to_string())
                            .expect("Error writing file");
                    }
                    Err(_) => { }
                }
            }
            None => { break; }
            Some(Err(_)) => { break; }
            Some(Ok(Message::Close(_))) => { break; }
            _ => continue
        }
    }

    // remove from slaves
    let mut state_guard = state.aux.lock().await;
    state_guard.slaves.remove(&(user.id(), bucket));
}

async fn kill_slave(State(state): State<SyncState>, user: UserClaim, Path(bucket): Path<Bucket>) -> Result<(), Error> {
    let mut state_guard = state.aux.lock().await;
    if let Some(slave) = state_guard.slaves.get_mut(&(user.id(), bucket.clone()))
    {
        if let Some(inner_tx) = slave.take() {
            inner_tx.send(()).expect("Error sending kill signal");
            return Ok(());
        }
    }

    Err(Error::InvalidArgument("Slave not found".to_string()))
}

// not guaranteed to be absolute latest, but generally good enough
async fn try_read_bucket(user: UserClaim, Path(bucket): Path<Bucket>)
    -> Result<Json<serde_json::Value>, Error> {
    let file_content = fs::read_to_string(format!("./buckets/{}/{}.json", bucket, user.id()))
        .map_err(|_| Error::ServerError("Error reading data block".to_string()))?;

    let json_value: serde_json::Value = serde_json::from_str(&file_content)
        .map_err(|_| Error::ServerError("Error parsing data block".to_string()))?;

    Ok(Json(json_value))
}

async fn register_device(State(state): State<SyncState>, user: UserClaim, Path(device_id): Path<String>)
    -> Result<(), Error> {
    sqlx::query("INSERT INTO devices(user_id, device_id) VALUES (?, ?)")
        .bind(user.id())
        .bind(device_id)
        .execute(state.db())
        .await
        .map_err(|_| Error::ServerError("Error registering device".to_string()))?;

    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    init_log();

    if !Sqlite::database_exists(DATABASE_URL).await.expect("Error checkin") {
        Sqlite::create_database(DATABASE_URL).await.expect("Error creating database");
    }

    let db = SqlitePool::connect(DATABASE_URL).await.expect("Error connecting to database");
    create_tables(&db).await;

    let creds_path = "./nutqdarwin.json";
    let project_id = env::var("GOOGLE_PROJECT_ID").unwrap();

    let authenticator = auth::Authenticator::service_account_from_file(creds_path)
        .await
        .unwrap();

    let client = Client::new(authenticator, project_id, false, Duration::from_secs(10));

    let slaves: Slaves = HashMap::new();
    let (nutq_tx, nutq_rx) = tokio::sync::mpsc::channel(1);
    let arc_state = Arc::new(Mutex::new(SingleThreadSyncState {
        slaves,
        fcm: client,
        nutq_interrupt: nutq_tx,
        nutq_queue: nutq::NotificationQueue::new()
    }));

    let state = SyncState::new(Arc::new(db), arc_state)?;
    tokio::spawn(nutq::notification_dispatch(state.clone(), nutq_rx));

    let app = Router::new()
        /* health functions */
        .route("/sync/status", get(status))
        .route("/sync/stats", get(stats))
        /* sync functions */
        .route("/sync/slave/:bucket", get(establish_slave))
        .route("/sync/steal/:bucket", delete(kill_slave)) // prob should be slave, but nginx...
        .route("/sync/bucket/:bucket", get(try_read_bucket))
        .route("/sync/device/:device_id", post(register_device))
        /* nutq functions */
        .route("/sync/nutq/complete/:scheme_id/:item_id/:index", put(nutq::complete))
        .route("/sync/nutq/delay/:scheme_id/:item_id/:index", put(nutq::remind_later))
        .with_state(state)
        .layer(TraceLayer::new_for_http());

    let addr = SocketAddr::from(([127, 0, 0, 1], PORT));

    println!("sync::init");
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();

    Ok(())
}

async fn create_tables(db: &SqlitePool) {
    db.execute("
        CREATE TABLE IF NOT EXISTS
        devices (
            device_id STRING PRIMARY_KEY NOT NULL UNIQUE,
            user_id INTEGER NOT NULL
        )
    ").await.expect("Error creating devices table");
}
