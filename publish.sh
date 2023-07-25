#!/bin/zsh

if [ "$#" -ne 1 ]; then 
    echo "Usage: ./publish.sh \"[commit message]\""
    exit 1
fi

echo "~~~~INSERT DATE~~~~"

d=$(date "+%B %d, %Y")
echo "Git last commit date: $d"

find src -type f -name "*.tsx" -exec sed -i "" "s|<span id=\"git-last-commit-date\">.*</span>|<span id=\"git-last-commit-date\">$d</span>|g" {} \;

#publish
echo "~~~~BUILD PHASE~~~~"
npm run build
echo $?
if [ "$?" -ne 0]; then
    echo "Error running npm run build" "$?"
    exit 1
fi


echo "~~~~COPY README~~~~"
cp README.md build/README.md


echo "~~~~CHANGE DIRECTORIES~~~~"
cd build/

echo "~~~~NOW IN~~~~"
pwd

echo "~~~~START GIT~~~~"

ignore="#os and misc\n.DS_Store\n.env.local\n.env.development.local\n.env.test.local\n.env.production.local\n*.swp\n#manifests\n"

echo "$ignore" > ".gitignore"

git init
git add -A
git commit -m $1
git branch -M main

git remote add origin https://github.com/manusbhat/manusbhat.github.io
git push -u origin main --force

echo "~~~~FINISH~~~~"
