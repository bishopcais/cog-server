# cog-server

[![Lint](https://github.com/bishopcais/cog-server/actions/workflows/lint.yml/badge.svg)](https://github.com/bishopcais/cog-server/actions/workflows/lint.yml)
[![Docker Automated build](https://img.shields.io/docker/cloud/automated/bishopcais/cog-server)](https://hub.docker.com/r/bishopcais/cog-server)

A dashboard server to make easy managing running cogs within a CAIS.

## Usage

Following either of the two methods (Docker or Natively), cog-server will be available at http://localhost:7777.

### Docker

We make available a docker image that you can use, pulling it down [Docker Hub](https://hub.docker.com/r/bishopcais/cog-server):
```bash
docker run --name cog-server -d -p 7777:7777 bishopcais/cog-server
```

This image contains both a MongoDB instance exclusive for cog-server to use as well as the necessary components to run the server.

Within this repo, you can also build the image yourself:

```bash
docker build -t bishopcais/cog-server .
```

### Natively

These instructions are for if you wish to forgo running cog-server through Docker and would prefer the
bare metal. A requirement of this is that you will need to setup your own MongoDB instance. It is
recommended to use MongoDB 4+, but 3.6+ should work (though is untested).

#### Setup:

```bash
npm install
cp cog.sample.json cog.json
```

Edit `cog.json` and point `mongo` to the connection details. See
the documentation for [@cisl/io](https://github.com/cislrpi/io) for details.

Then, run `node scripts/create-admin.js` to create an admin user to use.

#### Running it:

```bash
npm start
```

## Usage with cog-cli

To have cog-cli be able to communicate with crun-server, you will need to
configure it to use either the user that was created as part of `create-admin.js`
or that you create via the `Users` tab on cog-server.

Then, within [cog-cli](https://github.com/bishopcais/cog-cli), run:

```bash
cog config username <user>
cog config key <key>
```

To utilize the dummy admin user that `create-admin.js` makes, you would use:

```bash
cog config username admin
cog config key key
```

## Contributing

We are open to contributions.

* The software is provided under the [MIT license](LICENSE). Contributions to
this project are accepted under the same license.
* Please also ensure that each commit in the series has at least one
`Signed-off-by:` line, using your real name and email address. The names in
the `Signed-off-by:` and `Author:` lines must match. If anyone else
contributes to the commit, they must also add their own `Signed-off-by:`
line. By adding this line the contributor certifies the contribution is made
under the terms of the
[Developer Certificate of Origin (DCO)](DeveloperCertificateOfOrigin.txt).
* Questions, bug reports, et cetera are raised and discussed on the issues page.
* Please make merge requests into the master branch.
