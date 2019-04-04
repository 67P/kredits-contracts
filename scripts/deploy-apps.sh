#!/bin/bash

set -e

rootDir=`pwd`

echo "## Kredits app bootstrap"
echo ""
echo "Setting up each aragon app in ./apps"
echo "a new app version will be deployed"
echo "----"

./scripts/every-app.sh "npm install"
./scripts/every-app.sh "aragon apm publish major"

echo "Done, new versions of all apps deployed"
