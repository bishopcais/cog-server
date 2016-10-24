# Central Watcher Server for crun

Step 1: Install npm libraries
`npm install`

Step 2: Create a settings file by copying from sample
`cp settings.js.sample settings.js`

Step 3: Create an admin user using a provided script
`node scripts/create-admin.js`

Step 4: Launch
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