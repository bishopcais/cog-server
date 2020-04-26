FROM node:10-alpine

RUN addgroup -S cisl && adduser -S cisl -G cisl
COPY . /home/cisl/server

WORKDIR /home/cisl/server

RUN apk add --virtual build-dependencies --no-cache \
        g++ \
        make \
        python \
    && chown cisl:cisl -R /home/cisl/server \
    && chown cisl:cisl /home/cisl/.npmrc \
    && npm install -g npm

USER cisl

RUN npm install

USER root

RUN apk del build-dependencies

USER cisl
# We assume that you've installed the node_modules already
# before attempting to build this image
RUN rm -f /home/cisl/.npmrc && \
    mv /home/cisl/server/.docker/cog.json /home/cisl/server/cog.json && \
    mv /home/cisl/server/.docker/init.sh /home/cisl/server/init.sh && \
    chmod +x /home/cisl/server/init.sh

EXPOSE 7777

ENTRYPOINT [ "/home/cisl/server/init.sh" ]
