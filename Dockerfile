# syntax=docker/dockerfile:1

FROM node:16.16
#ENV NODE_ENV=production

RUN useradd -ms /bin/bash drone

WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN chown -R drone:drone /app
USER drone
RUN npm install
USER root
