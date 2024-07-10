ARG NODE_VERSION=20.13.1
FROM node:${NODE_VERSION}-alpine

WORKDIR /usr/src/app

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --production --frozen-lockfile

USER node

COPY . .

EXPOSE 80

CMD yarn run nodemon --inspect=0.0.0.0:9229 app.ts
