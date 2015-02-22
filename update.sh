#!/bin/bash

# VARIABLES
DEPLOY_PATH=/var/node-www/datagamer
REPO=https://github.com/Wifsimster/datagamer.git
BRANCH=master

echo "* Stop datagamer-api server"
service datagamer stop

echo "* Updating repository datagamer"
git pull $REPO $BRANCH

echo "* Installing/updating back-end modules"
npm install

echo "* Installing/updating front-end modules"
bower install --allow-root

echo "* Starting datagamer service"
service datagamer start
