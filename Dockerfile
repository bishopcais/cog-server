FROM ubuntu:bionic as builder

WORKDIR /src

COPY . /src

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates \
    && curl -L https://deb.nodesource.com/setup_12.x | bash - \
    && apt-get install -y --no-install-recommends \
        g++ \
        nodejs \
        python3 \
        make

RUN npm install \
    && mv /src/.docker/cog.omnibus.json /src/cog.json \
    && npm run build

##################################

FROM mongo:4.4-bionic

ENV NODE_ENV=production

WORKDIR /home/cisl/server
EXPOSE 7777

RUN groupadd cisl \
    && useradd -s /bin/bash -g cisl cisl

COPY . /home/cisl/server

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && curl -sL https://deb.nodesource.com/setup_12.x | bash - \
    && apt-get install -y --no-install-recommends \
        nodejs \
        psmisc \
    && rm -rf /var/lib/apt/lists/* \
    && chown -R cisl:cisl /home/cisl \
    && chmod +x /home/cisl/server/.docker/entrypoint.sh

USER cisl

RUN npm install \
    && cp /home/cisl/server/.docker/cog.omnibus.json /home/cisl/server/cog.json

COPY --from=builder /src/dist /home/cisl/server/
COPY --from=builder /src/public/index.html /home/cisl/server/public/index.html

USER root

RUN /bin/bash -c "mongod &" \
    && sleep 10 \
    && runuser -p -u cisl node /home/cisl/server/scripts/create-admin.js

ENTRYPOINT ["/home/cisl/server/.docker/entrypoint.sh"]
