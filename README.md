# cog-server

[![Docker Automated build](https://img.shields.io/docker/automated/bishopcais/cog-server)](https://hub.docker.com/r/bishopcais/cog-server)
[![Docker Image Version (latest semver)](https://img.shields.io/docker/v/bishopcais/cog-server)](https://hub.docker.com/r/bishopcais/cog-server)

A dashboard server to make easy managing running cogs within a CAIS.

## Usage

### Docker

```bash
docker run --rm --name cog-server bishopcais/cog-server
```

### Locally

This additionally requires an available MongoDB running somewhere.

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
node server.js
```

## Usage with crun-cli

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
