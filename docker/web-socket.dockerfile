FROM node:24-alpine AS base

RUN npm i -g pnpm typescript

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

COPY ./apps/web-socket/package.json ./apps/web-socket/

COPY ./packages/redis/package.json ./packages/redis/
COPY ./packages/types/package.json ./packages/types/
COPY ./packages/typescript-config/package.json ./packages/typescript-config/

RUN pnpm install

COPY ./packages/redis/ ./packages/redis/
COPY ./packages/types/ ./packages/types/
COPY ./packages/typescript-config/ ./packages/typescript-config/

COPY ./apps/web-socket/ ./apps/web-socket/

RUN pnpm run build

CMD ["pnpm", "run", "start:web-socket"]