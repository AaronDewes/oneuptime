#!/usr/bin/env bash
echo "
This script changes version of every project
"
function version {
  cd $1
  npm version "3.0.$CI_PIPELINE_IID"
  cd ..
}

curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs

version dashboard
version accounts 
version backend
version home 
version status-page 
version api-docs
version probe
version admin-dashboard
version init-script
version licensing
version helm-chart
version js-sdk
version php-sdk
version .