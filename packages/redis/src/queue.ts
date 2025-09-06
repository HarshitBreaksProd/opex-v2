import { RedisClientType } from "redis";
import redisClient from "./index";

export const priceUpdatePusher: RedisClientType = redisClient.duplicate();

export const tradePusher: RedisClientType = redisClient.duplicate();

export const enginePuller: RedisClientType = redisClient.duplicate();

export const enginePusher: RedisClientType = redisClient.duplicate();

export const engineResponsePuller: RedisClientType = redisClient.duplicate();