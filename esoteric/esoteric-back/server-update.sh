#!/bin/bash
set -e
SERVICES=("auth" "enss" "sync" "text")

# finish build
cd stage/esoteric-back
cargo build --release 
cd ..

find . -name ".DS_Store" -delete

for SERVICE in "${SERVICES[@]}"; do
    mkdir -p "$SERVICE"
    cp esoteric-back/target/release/esoteric_"$SERVICE" "$SERVICE"
done
cd ..

ESOTERIC_ROOT=/var/www/esoteric

# mark if we need to update nginx config
NEW_WWW_CONFIG=./stage/esoteric.manubhat.com
OLD_WWW_CONFIG=$ESOTERIC_ROOT/esoteric.manubhat.com
NEW_API_CONFIG=./stage/api.esoteric.manubhat.com
OLD_API_CONFIG=$ESOTERIC_ROOT/api.esoteric.manubhat.com

if    ! [ -f "$OLD_WWW_CONFIG" ] \
   || ! [ -f "$OLD_API_CONFIG" ] \
   || ! diff "$OLD_WWW_CONFIG" "$NEW_WWW_CONFIG" &>/dev/null \
   || ! diff "$OLD_API_CONFIG" "$NEW_API_CONFIG" &>/dev/null; then
    cp "$NEW_WWW_CONFIG" /etc/nginx/sites-available/esoteric.manubhat.com
    cp "$NEW_API_CONFIG" /etc/nginx/sites-available/api.esoteric.manubhat.com
    
    cp $NEW_WWW_CONFIG $ESOTERIC_ROOT
    cp $NEW_API_CONFIG $ESOTERIC_ROOT
   
    sudo certbot --nginx
    nginx -s reload # technically makes more sense to put after server starts, but whatever
fi

# stop current services (maybe move to buffered mechanism in the future?)
for SERVICE in "${SERVICES[@]}"; do
    pkill -f esoteric_"$SERVICE" || true
done

## binaries
for SERVICE in "${SERVICES[@]}"; do
    mkdir -p $ESOTERIC_ROOT/"$SERVICE"
    cp stage/"$SERVICE"/esoteric_"$SERVICE" $ESOTERIC_ROOT/"$SERVICE"
done

# load in environment variables
source $ESOTERIC_ROOT/.env

# start servers
for SERVICE in "${SERVICES[@]}"; do
    cd $ESOTERIC_ROOT/"$SERVICE"
    nohup ./esoteric_"$SERVICE" &>> "$SERVICE".log &
done

echo "----FINISHED SERVER UPDATE----"