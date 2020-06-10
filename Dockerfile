FROM node:10-alpine

WORKDIR /home/cisl/server
EXPOSE 7777

COPY . /home/cisl/server

RUN apk add --virtual build-dependencies --no-cache \
        g++ \
        make \
        python \
    && addgroup -S cisl && adduser -S cisl -G cisl \
    && chown cisl:cisl -R /home/cisl/server \
    && npm install -g npm

USER cisl

RUN npm install \
    && mv /home/cisl/server/.docker/cog.json /home/cisl/server/cog.json

USER root

RUN apk del build-dependencies

USER cisl

ENTRYPOINT [ "/bin/sh", "/home/cisl/server/.docker/init.sh" ]
