# cog-server

A dashboard server to make easy managing running cogs within a CAIS.

# Usage

## Docker

Use [docker-compose](https://docs.docker.com/compose/):

```bash
docker-compose up
```

## Locally

This additionally requires an available MongoDB running somewhere.

### Setup:

```bash
npm install
cp cog.sample.json cog.json
```

Edit `cog.json` and point `mongo` to the connection details. See
the documentation for [@cisl/io](https://github.com/cislrpi/io) for details.

Then, run `node scripts/create-admin.js` to create an admin user to use.

### Running it:

```bash
node server.js
```

# Usage with crun-cli

To have crun-cli be able to communicate with crun-server, you will need to
configure it to use either the user that was created as part of `create-admin.js`
or that you create via the `Users` tab on cog-server.

Then, within [cog-cli](https://github.com/bishopcais/cog-cli), run:

```bash
cog config -u <user> -k <key>
```

which for the above script would be:

```bash
cog config -u admin -k key
```
