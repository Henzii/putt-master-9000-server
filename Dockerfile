FROM node:18-alpine

WORKDIR /usr/src/puttServer

COPY . .

RUN npm install
RUN npm run tsc

CMD npm start