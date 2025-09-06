import redis, { RedisClientType } from "redis";
import "dotenv/config";

const client: RedisClientType = redis.createClient({
  url: process.env.REDIS_URL!,
});

export default client;
