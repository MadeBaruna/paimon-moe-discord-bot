FROM node:16.11.1-alpine3.14 AS builder
WORKDIR /bot
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN pnpm run lint
RUN pnpm run typecheck

FROM node:16.11.1-alpine3.14
WORKDIR /bot
COPY . .
RUN npm install -g pnpm
RUN pnpm install --prod
CMD [ "pnpm", "start" ]
