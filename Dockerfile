FROM node:14.16.0-alpine3.13 AS builder
WORKDIR /bot
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN pnpm run lint
RUN pnpm run typecheck

FROM node:14.16.0-alpine3.13
WORKDIR /bot
COPY . .
RUN npm install -g pnpm
RUN pnpm install --prod
CMD [ "pnpm", "start" ]
