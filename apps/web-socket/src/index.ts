import { WebSocketServer } from "ws";
import { subscriber } from "@repo/redis/pubsub";
import "dotenv/config";

const wss = new WebSocketServer({ port: Number(process.env.WS_PORT!) });

(async () => {
  console.log("Start ws");
  try {
    await subscriber.connect();
  } catch (err) {
    console.log(err);
    console.log("Did not connect to redis");
  }

  console.log("sub connected");

  await subscriber.subscribe("ws:price:update", async (msg) => {
    // console.log(msg);
    wss.clients.forEach((client) => {
      client.send(msg);
    });
  });
})();

wss.on("connection", () => {
  console.log("Connected to ws");
});
