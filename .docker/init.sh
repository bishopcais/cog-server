#!/bin/sh

node /home/cisl/server/scripts/create-admin.js

if [ $? != 0 ]; then
    >&2 echo 'Failed to create/verify admin user!'
    exit 1
fi

node /home/cisl/server/server.js
exit $?
