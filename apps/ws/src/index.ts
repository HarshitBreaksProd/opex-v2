import { WebSocketServer } from "ws";
import { subscriber } from "@repo/redis/pubsub";

const wss = new WebSocketServer({ port: 8080 });

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
