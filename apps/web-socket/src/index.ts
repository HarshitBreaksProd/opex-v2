import { WebSocketServer } from "ws";
import { subscriber } from "@repo/redis/pubsub";
import "dotenv/config";

const wss = new WebSocketServer({ port: Number(process.env.WS_PORT!) });

(async () => {
  await subscriber.connect();

  console.log("sub connected");

  await subscriber.subscribe("trade-info", async (msg) => {
    console.log(msg);

    wss.clients.forEach((client) => {
      client.send(msg);
    });
  });
})();

wss.on("connection", () => {
  console.log("Connected to ws");
});
