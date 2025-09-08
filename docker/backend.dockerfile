FROM node:24-alpine AS base

RUN npm i -g pnpm typescript

WORKDIR /usr/src/app

COPY ./apps/backend/package.json ./apps/backend/tsconfig.json ./

RUN pnpm i

COPY ./apps/backend/src ./





