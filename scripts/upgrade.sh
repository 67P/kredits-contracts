#!/bin/bash

set -e

rootDir=`pwd`

app=$1
daoAddress=$2
if [ -z "$VAR" ]; then
  daoAddress=$KREDITS_DAO_ADDRESS
fi

echo "## Deploying $app for $daoAddress"

set -x
cd "apps/$app"
aragon apm publish major
cd $rootDir
aragon dao upgrade $daoAddress kredits-$app
npm run build-json
set +x

echo "Done"
