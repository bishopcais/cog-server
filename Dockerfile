FROM node:10-alpine

<<<<<<< HEAD
EXPOSE 7777

WORKDIR /srv

COPY . /srv

RUN addgroup -S cisl \
    && adduser -S cisl -G cisl \
    && chown cisl:cisl -R /srv

USER cisl

RUN npm install --only=production \
    && cp -u /srv/cog.sample.json /srv/cog.json

=======
COPY . /srv

WORKDIR /srv

RUN apk add --virtual build-dependencies --no-cache \
        g++ \
        make \
        python \
    && addgroup -S cisl \
    && adduser -S cisl -G cisl \
    && chown cisl:cisl -R /srv

COPY .npmrc /home/cisl/.npmrc

USER cisl

RUN npm install

USER root

RUN apk del build-dependencies \
    && rm -f /home/cisl/.npmrc

USER cisl
# We assume that you've installed the node_modules already
# before attempting to build this image
RUN mv /srv/cog.sample.json /srv/cog.json

# ENTRYPOINT [ "node", "/srv/scripts/create-admin.js" ]
EXPOSE 7777
>>>>>>> develop
CMD [ "node", "/srv/server.js" ]
