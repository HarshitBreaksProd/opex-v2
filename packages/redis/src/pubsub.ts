import { RedisClientType } from "redis";
import { client } from ".";

export const publisher: RedisClientType = client.duplicate();

export const subscriber: RedisClientType = client.duplicate();
