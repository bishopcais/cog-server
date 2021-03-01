#!/usr/bin/env bash

runuser -p -u cisl -- NODE_ENV=production node /home/cisl/server/server.js &

exec /bin/bash "/usr/local/bin/docker-entrypoint.sh" "$@"
