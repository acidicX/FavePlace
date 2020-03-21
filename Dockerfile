FROM node:12-alpine AS build-env

WORKDIR /usr/src/app-build

COPY ./client client
COPY ./backend backend

WORKDIR /usr/src/app-build/client

RUN npm ci

RUN npm run build

WORKDIR /usr/src/app-build/backend

RUN npm ci

RUN npm run build

FROM node:12-alpine

WORKDIR /usr/src/app

COPY backend/package*.json ./
RUN npm ci --production

COPY --from=build-env /usr/src/app-build/backend/dist /usr/src/app/dist
COPY --from=build-env /usr/src/app-build/client/build/ /usr/src/app/client

CMD ["npm", "run", "start"]
