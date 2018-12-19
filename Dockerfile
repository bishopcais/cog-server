FROM node:10-alpine

EXPOSE 7777

WORKDIR /srv

COPY . /srv

RUN addgroup -S cisl \
    && adduser -S cisl -G cisl \
    && chown cisl:cisl -R /srv

USER cisl

RUN npm install --only=production \
    && cp -u /srv/cog.sample.json /srv/cog.json

CMD [ "node", "/srv/server.js" ]
