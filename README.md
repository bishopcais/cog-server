# Central Watcher Server for crun

To use it install packages with
`npm install`

Then to launch
`node server.js`

Requires mongodb

To create a new user, simply run `node user-setup.js`.

This will create a new user `admin` with password `password`.

To use this user, you must add an API key to the user by going to Users tab on
on crun-watch site, edit the user and add a key. Then you can use this user
from the crun-cli by doing:
```
crun config -u <user> -k <key>
```