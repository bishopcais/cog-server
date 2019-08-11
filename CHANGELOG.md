# Changelog

## v1.4.0
* Set `restart: always` for all docker-compose.yml containers
* Move Dockerfile folder for crun-server from `/srv` to `/home/cisl/server`
* Move from `@cisl/celio` to `@cisl/io@1.0.0-dev4` library
* Update to `@cisl/express` to `1.0.0-dev2

## v1.3.0
* Use [ansi_up](https://github.com/drudru/ansi_up#readme) for rendering console output
* Use [bcryptjs](https://www.npmjs.com/package/bcryptjs) instead of [bcrypt](https://www.npmjs.com/package/bcrypt)
* Upgrade to fontawesome 5
* Allow scrolling right/left in console output
* Properly handle error if crun-cli passes cog without an id
* Add docker-compose.yml for running crun-server
* Record PID for running cogs as number
* Move Start/Stop button out of expanded view for cog
* Add button for sending SIGHUP and SIGUSR1
