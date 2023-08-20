#!/bin/zsh
set -e
SERVICES=("auth" "enss" "sync" "text")

# local build
# 1. backend is built on server for easier compilation

: '
cross compilation is just tricky in general

echo ----BUILD BACKEND----
cd esoteric-back/
export CARGO_TARGET_X86_64_UNKNOWN_LINUX_GNU_LINKER=x86_64-linux-gnu-gcc
export CC_x86_64_unknown_linux_gnu=x86_64-linux-gnu-gcc
export CXX_x86_64_unknown_linux_gnu=x86_64-linux-gnu-g++
export AR_x86_64_unknown_linux_gnu=x86_64-linux-gnu-ar
cargo build --release --target=x86_64-unknown-linux-gnu
'

# 2. build frontend
echo "----BUILD FRONTEND----"

cd esoteric-front/

# update git last commit date
d=$(date "+%B %d, %Y")
echo "Git last commit date: $d"

find src -type f -name "*.tsx" -exec sed -i "" "s|<span id=\"git-last-commit-date\">.*</span>|<span id=\"git-last-commit-date\">$d</span>|g" {} \;

yarn build


# 3. local stage
echo "----LOCAL STAGE----"
cd ..
if [ -d "stage" ]; then
    rm -rf stage
fi

mkdir stage

# globals
cp esoteric-back/api.esoteric.manubhat.com stage/
cp esoteric-back/esoteric.manubhat.com stage/
cp esoteric-back/server-update.sh stage/

# build materials
mkdir stage/esoteric-back
cp esoteric-back/Cargo.toml stage/esoteric-back
cp -r esoteric-back/src stage/esoteric-back

# enss special
cp -r esoteric-back/enss stage/esoteric-back

# text special
cp -r esoteric-back/text stage/esoteric-back

#front 
mv esoteric-front/build stage/static

# 4. push local stage (see how to exclude .DS_Store?)
scp -r stage root@esoteric.manubhat.com:/root/

echo "----Finished Staging (remember to manually deploy)----"
