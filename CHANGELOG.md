# Changelog

## v1.5.0

* Fix typo in Dockerfile entrypoint
* Move jsx files from `client/src` to `src/client`
* Move `socket/io.js` -> `src/server/io.js`, `api` -> `src/server/api`, `models/` -> `src/server/models`, 
* Begin work on Services feature
* Fix import in scripts/create-admin.js
* Fix remaining old-style font awesome icons
* Add additional left/right padding on cog buttons
* Fix broken label on SIGHUP button
* Fix cog-cli crash when clicking icon on button
* Improve styling of ANSI blue color
* Hitting clear on cog now persists cleared log through reloads
* Add button to send SIGUSR2 signal
* Fix crash when second instance of cog-cli on one machine attempts to connect
* Remove console log of credentials when logging in

## v1.4.0

* Set `restart: always` for all docker-compose.yml containers
* Move Dockerfile folder for crun-server from `/srv` to `/home/cisl/server`
* Move from `@cisl/celio` to `@cisl/io` library
* Move from `@cisl/express` to regular `express`
* Rewrite frontend in React from backbone with webpack for building
    * Under development (e.g. `process.env.NODE_ENV !== 'production'`), webpack will hot reload on any source file changes
* Start publishing container (with mongo included) on Docker Hub: [bishopcais/cog-server](https://hub.docker.com/r/bishopcais/cog-server)

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
