import redis, { RedisClientType } from "redis";
import "dotenv/config";

export const client: RedisClientType = redis.createClient({
  url: process.env.REDI_URL!,
});
