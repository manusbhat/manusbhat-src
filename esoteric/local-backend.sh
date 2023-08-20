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

# start servers
mkdir -p local

source local/.env

for SERVICE in "${SERVICES[@]}"; do
    mkdir -p local/$SERVICE
    mkdir -p local/$SERVICE/log

    cp esoteric-back/target/debug/esoteric_$SERVICE local/$SERVICE

    if [ "$SERVICE" = "enss" ]; then
        cp -r esoteric-back/enss/problem_sets local/enss
        cp -r esoteric-back/enss/libgrade local/enss
        mkdir -p local/enss/submissions
    elif [ "$SERVICE" = "text" ]; then
        rm -rf local/text/tags

        cp -r esoteric-back/text/tags local/text
    fi
done

COMMANDS=()
for SERVICE in "${SERVICES[@]}"; do
    COMMANDS+=("cd local/$SERVICE && ./esoteric_$SERVICE")
done

parallel --lb ::: "${COMMANDS[@]}" 
