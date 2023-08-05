#!/bin/zsh
set -e
SERVICES=("auth" "enss" "sync" "text")

cd esoteric-back/
cargo build
cd ..

# establish nginx link (only api server is needed)
## replace cors (not relevant locally)
sed 's/https:\/\/esoteric\.manubhat\.com/*/g' esoteric-back/api.esoteric.manubhat.com > /opt/homebrew/etc/nginx/servers/localhost
nginx -s reload

# stop servers
for SERVICE in "${SERVICES[@]}"; do
    pkill -f esoteric_$SERVICE || true
done
# start servers
mkdir -p local

source local/.env

for SERVICE in "${SERVICES[@]}"; do
    mkdir -p local/$SERVICE
    mkdir -p local/$SERVICE/log

    cp esoteric-back/target/debug/esoteric_$SERVICE local/$SERVICE

    cd local/$SERVICE
    # do not redirect output
    nohup ./esoteric_$SERVICE &>> log/$SERVICE.log &
    cd ../..
done
