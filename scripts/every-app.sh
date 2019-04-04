#!/bin/bash

set -e

rootDir=`pwd`

for dir in ./apps/*/; do
  set -x
  cd $dir
  eval $1
  cd $rootDir
  set +x
done

