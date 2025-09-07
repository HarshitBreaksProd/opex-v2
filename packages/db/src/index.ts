import { PrismaClient } from "./generated/prisma";

let prismaClient: PrismaClient;

if ((globalThis as unknown as { prismaClient: PrismaClient }).prismaClient) {
  prismaClient = (globalThis as unknown as { prismaClient: PrismaClient })
    .prismaClient;
} else {
  prismaClient = new PrismaClient();
  (globalThis as unknown as { prismaClient: PrismaClient }).prismaClient =
    prismaClient;
}

export default prismaClient;
