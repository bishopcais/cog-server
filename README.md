crun-server
===========

This is a central watcher server for crun and the crun-cli interface.

## Requirements
* Postgresql

## Installation
```bash
npm install
node_modules/.bin/sequelize --url 'postgres://localhost:5432/cir' db:migrate
```

## Usage
```bash
node server.js
```

## Default User
You can create a default user for the system by doing:
```bash
node_modules/.bin/sequelize --url 'postgres://localhost:5432/cir' db:seed:all
```
This will create a user named `admin` with password `password` to use when logging
in. The user will also have one key setup with the value `key`.

## crun-cli
To integrate into crun-cli, you must add a user and key to crun-cli. You can do this
by doing:
```
crun config -u <user> -k <key>
```