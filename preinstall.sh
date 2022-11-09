#!/usr/bin/env bash

set -e

ONEUPTIME_SECRET=$(openssl rand -hex 12)
export ONEUPTIME_SECRET=$ONEUPTIME_SECRET

DATABASE_PASSWORD=$(openssl rand -hex 12)
export DATABASE_PASSWORD=$DATABASE_PASSWORD.

REDIS_PASSWORD=$(openssl rand -hex 12)
export REDIS_PASSWORD=$REDIS_PASSWORD

ENCRYPTION_SECRET=$(openssl rand -hex 12)
export ENCRYPTION_SECRET=$ENCRYPTION_SECRET

INTERNAL_SMTP_PASSWORD=$(openssl rand -hex 12)
export INTERNAL_SMTP_PASSWORD=$INTERNAL_SMTP_PASSWORD

# Talk to the user
echo "Welcome to the OneUptime 🟢 Runner"
echo ""
echo "⚠️  You really need 8gb or more of memory to run this stack ⚠️"
echo ""
echo ""

echo "Please enter your sudo password now:"
sudo echo ""
echo "Thanks! 🙏"
echo ""
echo "Ok! We'll take it from here 🚀"

echo "Making sure any stack that might exist is stopped"

# If docker-compose is installed and if docker-compose.yml is found then, stop the stack.
if [[ $(which docker-compose) ]]; then
    if [ -f ./docker-compose.yml ]; then
        sudo -E docker-compose -f docker-compose.yml stop || true
    fi
fi


# If Mac
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [[ ! $(which brew) ]]; then
        echo "Homebrew not installed. Please install homebrew and restart installer"
        exit
    fi
fi

# If linux
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "Grabbing latest apt caches"
    sudo apt update
fi

# clone oneuptime
echo "Installing OneUptime 🟢"
if [[ ! $(which git) ]]; then
    if [[ "$OSTYPE" != "darwin"* ]]; then
        sudo apt install -y git
    fi
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install git
    fi
fi

GIT_REPO_URL=$(git config --get remote.origin.url)

if [[ $GIT_REPO_URL != *oneuptime* ]] # * is used for pattern matching
then
  git clone https://github.com/OneUptime/oneuptime.git || true
  cd oneuptime
fi


# if this script is not running in CI/CD
if [ -z "$CI_PIPELINE_ID" ]
then
# try to clone - if folder is already there pull latest for that branch
git pull
cd ..
fi

if [[ ! $(which node) && ! $(node --version) ]]; then
    if [[ "$OSTYPE" != "darwin"* ]]; then
        echo "Setting up NodeJS"
        sudo apt-get install -y nodejs
        sudo apt-get install -y npm
    fi

    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install nodejs
    fi
fi

if [[ ! $(which gomplate) ]]; then
    sudo npm install -g gomplate
fi

if [[ ! $(which ts-node) ]]; then
    sudo npm install -g ts-node
fi


cd oneuptime

# Create .env file if it does not exist. 
touch config.env

#Run a scirpt to merge config.env.tpl to config.env
ts-node-esm ./Scripts/Install/MergeEnvTemplate.ts

cat config.env.temp | gomplate > config.env

rm config.env.temp

# Load env values from config.env
export $(grep -v '^#' config.env | xargs)

# Write env vars in config files. 


for directory_name in $(find . -type d -maxdepth 1) ; do
    if [ -f "$directory_name/.env.tpl" ]; then
        cat $directory_name/.env.tpl | gomplate > $directory_name/.env
    fi

    if [ -f "$directory_name/Dockerfile.tpl" ]; then
        cat $directory_name/Dockerfile.tpl | gomplate > $directory_name/Dockerfile
    fi
done

# Convert template to docker-compose. 
cat docker-compose.tpl.yml | gomplate > docker-compose.yml