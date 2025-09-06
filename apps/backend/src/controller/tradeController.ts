import { engineResponsePuller, tradePusher } from "@repo/redis/queue";
import { Request, Response } from "express";
import { ResponseLoop } from "../utils/responseLoop";

(async () => {
  await tradePusher.connect();
})();

const responseLoopObj = new ResponseLoop();

export const openTradeController = async (req: Request, res: Response) => {
  // simulating user body:
  const id = Date.now().toString();

  const info = { id, trade: "buy", asset: "SOL_USDC_PERP" };

  try {
    await tradePusher.xAdd("stream:trade:info", "*", {
      type: "trade-info",
      trade: JSON.stringify(info),
    });

    await responseLoopObj.waitForResponse(id);
    res.json({ message: "trade executed", id: id });
  } catch (err) {
    console.log(err);
    res.status(411).json({ message: "Trade not executed" });
  }
};
