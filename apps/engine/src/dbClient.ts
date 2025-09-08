import { MongoClient } from "mongodb";
import "dotenv/config";

export const mongodbClient = new MongoClient(process.env.MONGODB_URL!);
export type TypeOfMongoClient = MongoClient;
