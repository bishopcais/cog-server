#!/usr/bin/env bash

runuser -p -u cisl -- node /home/cisl/server/server.js &

exec sh "/usr/local/bin/docker-entrypoint.sh" "$@"
