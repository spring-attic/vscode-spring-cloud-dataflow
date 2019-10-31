#!/bin/bash
set -e

buildversion=`date '+%Y-%m-%d-%H-%M-%S'`

pushd git-repo > /dev/null
envsubst < ~/.npmrc > ~/.npmrc.tmp && mv  ~/.npmrc.tmp ~/.npmrc
npm install && npm run build && npm run vsix-next
mkdir -p org/springframework/cloud/dataflow/vscode-spring-cloud-dataflow
mv *.vsix org/springframework/cloud/dataflow/vscode-spring-cloud-dataflow/
mv org ../distribution-repository/
popd > /dev/null

pushd triggers > /dev/null
mkdir ${BUILD_NAME}
touch ${BUILD_NAME}/trigger-${buildversion}
popd > /dev/null
