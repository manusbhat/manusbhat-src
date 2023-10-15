use tracing::Level;
use tracing_subscriber::filter;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;

#[cfg(debug_assertions)]
pub fn init_log() {
    let layer = tracing_subscriber::fmt::layer();

    let filter = filter::Targets::new()
        .with_target("tower_http::trace::on_response", Level::TRACE)
        .with_target("tower_http::trace::on_request", Level::TRACE)
        .with_target("tower_http::trace::make_span", Level::DEBUG)
        .with_default(Level::INFO);

    tracing_subscriber::registry()
        .with(layer)
        .with(filter)
        .init();
}

#[cfg(not(debug_assertions))]
pub fn init_log() {
    let layer = tracing_subscriber::fmt::layer();

    let filter = filter::Targets::new()
        // .with_target("tower_http::trace::on_response", Level::TRACE)
        // .with_target("tower_http::trace::on_request", Level::TRACE)
        // .with_target("tower_http::trace::make_span", Level::DEBUG)
        .with_default(Level::INFO);

    tracing_subscriber::registry()
        .with(layer)
        .with(filter)
        .init();
}
