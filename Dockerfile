FROM node:17-bullseye-slim

WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm install

WORKDIR /app/plugins
COPY plugins/package.json plugins/package-lock.json /app/plugins/
RUN npm install

WORKDIR /app
COPY . /app/

ENV PLUGIN_FOLDER=/app/plugins

CMD ["node", "index.js"]
