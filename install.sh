#!/usr/bin/env bash

set -e

bash preinstall.sh

# If docker-compose is installed and if docker-compose.yml is found then, stop the stack.
if [[ $(which docker-compose) ]]; then
    if [ -f ./docker-compose.yml ]; then
        sudo -E docker-compose -f docker-compose.yml stop || true
    fi
fi

npm run start

echo "We will need to wait ~5-10 minutes for things to settle down, migrations to finish, and TLS certs to be issued"
echo ""
echo "⏳ Waiting for OneUptime to boot (this will take a few minutes)"
bash -c 'while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' localhost/api/status)" != "200" ]]; do sleep 5; done'
echo "Progress 1/5"
bash -c 'while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' localhost/dashboard/status)" != "200" ]]; do sleep 5; done'
echo "Progress 2/5"
bash -c 'while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' localhost/status)" != "200" ]]; do sleep 5; done'
echo "Progress 3/5"
bash -c 'while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' localhost/staus-page/status)" != "200" ]]; do sleep 5; done'
echo "Progress 4/5"
echo "⌛️ OneUptime is up!"
echo ""
echo "🎉🎉🎉  Done! 🎉🎉🎉"

echo "We would like to hear your feedback to make this product better for you and for other users, please email us at hello@oneuptime.com."
echo " - If you notice a bug, we will fix it for you."
echo " - If you need a feature, we will add that to the roadmap and let you know the estimated time to ship."
echo "We would love to hear your feedback. Email: hello@oneuptime.com"