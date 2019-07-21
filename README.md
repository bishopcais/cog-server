# Central Watcher Server for crun

# Running under Docker
## Setup
crun-server is setup to run using `docker-compose` which will run the service
and connect a database for it to use. Note, before attempting to build the
container, you will probably need to copy in a `.npmrc` file that has been
authenticated to use `--scope=@cisl`.

For example, to do this on a Linux/macOS:
```
npm login --registry=https://internal.cisl.rpi.edu/npm/ --scope=@cisl
cp ~/.npmrc .
```

## Usage
Use [docker-compose](https://docs.docker.com/compose/):
```
docker-compose up
```

# Running under Local Machine
Make sure that you can install packages from `--scope=@cisl` locally. This
additionally requires an available MongoDB running somewhere.

## Setup:
```
npm install
cp cog.sample.json cog.json
```

Edit `cog.json` and point `mongo` to the connection details. See
the documentation for 
[@cisl/celio](https://internal.cisl.rpi.edu/code/libraries/node/cisl/celio)
for details.

Then, run `node scripts/create-admin.js` to create an admin user to use.


## Usage:
```
node server.js
```

# Usage with crun-cli
To have crun-cli be able to communicate with crun-server, you will need to
configure it to use either the user that was created as part of `create-admin.js`
or that you create via the `Users` tab on crun-server.

Then, within crun-cli, run:
```
crun config -u <user> -k <key>
```

which for the above script would be:
```
crun config -u admin -k key
```
