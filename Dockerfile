FROM node:14-alpine

WORKDIR /usr/src/puttServer

COPY . .

RUN npm install
RUN npm run tsc

CMD npm start