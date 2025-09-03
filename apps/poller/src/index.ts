import { WebSocket } from "ws";
import "dotenv/config";
import { publisher } from "@repo/redis/pubsub";
import { BackpackDataType, FilteredDataType } from "@repo/types/types";

const ws = new WebSocket(process.env.BACKPACK_URL!);

(async () => {
  await publisher.connect();
})();

ws.onopen = () => {
  console.log("Connected to the backpack WebSocket");

  ws.send(
    JSON.stringify({
      method: "SUBSCRIBE",
      params: [
        "bookTicker.BTC_USDC_PERP",
        "bookTicker.ETH_USDC_PERP",
        "bookTicker.SOL_USDC_PERP",
      ],
      id: 1,
    })
  );

  console.log("Subscribed to Backpack");
};

ws.onmessage = async (msg) => {
  const data: BackpackDataType = JSON.parse(msg.data.toString()).data;

  const askPriceStr = Number(data.a).toFixed(4);
  const askPriceIntStr =
    askPriceStr.split(".")[0]! + askPriceStr.split(".")[1]!;
  const ask_price = Number(askPriceIntStr);

  const bidPriceStr = Number(data.b).toFixed(4);
  const bidPriceIntStr = bidPriceStr.split(".")[0] + bidPriceStr.split(".")[1]!;
  const bid_price = Number(bidPriceIntStr);

  const filteredData: FilteredDataType = {
    asset: data.s,
    ask_price,
    bid_price,
    decimal: 4,
  };

  await publisher.publish("trade-info", JSON.stringify(filteredData));
};
