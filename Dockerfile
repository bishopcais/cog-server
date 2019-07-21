FROM node:10-alpine

COPY . /srv

WORKDIR /srv

RUN apk add --virtual build-dependencies --no-cache \
        g++ \
        make \
        python \
    && addgroup -S cisl \
    && adduser -S cisl -G cisl \
    && chown cisl:cisl -R /srv

USER cisl
COPY .npmrc /home/cisl/.npmrc

RUN npm install

USER root

RUN apk del build-dependencies

USER cisl
# We assume that you've installed the node_modules already
# before attempting to build this image
RUN rm -f /home/cisl/.npmrc && \
    mv /srv/.docker/cog.json /srv/cog.json && \
    mv /srv/.docker/init.sh /srv/init.sh && \
    chmod +x init.sh

EXPOSE 7777

ENTRYPOINT [ "./init.sh" ]
