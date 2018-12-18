FROM node:10-alpine

WORKDIR /srv

COPY . /srv

RUN addgroup -S cisl \
    && adduser -S cisl -G cisl \
    && chown cisl:cisl -R /srv

USER cisl

RUN npm install --only=production \
    && mv /srv/cog.sample.json /srv/cog.json

ENTRYPOINT [ "node", "/srv/scripts/create-admin.js" ]
EXPOSE 7777
CMD [ "node", "/srv/server.js" ]
