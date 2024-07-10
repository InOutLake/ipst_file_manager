FROM node:16

WORKDIR /usr/src/app

COPY ./app .

RUN npm install

EXPOSE 80

CMD yarn nodemon --signal SIGINT --legacy-watch --inspect=0.0.0.0:9229 --nolazy src/router.ts