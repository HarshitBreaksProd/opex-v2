import { tradePusher } from "@repo/redis/queue";
import { Request, Response } from "express";
import { ResponseLoop, responseLoopObj } from "../utils/responseLoop";
import { closeOrderSchema, createOrderSchema } from "@repo/types/zodSchema";

(async () => {
  await tradePusher.connect();
})();

export const openTradeController = async (req: Request, res: Response) => {
  const validInput = createOrderSchema.safeParse(req.body);

  if (!validInput.success) {
    res.status(411).json({
      message: "Invalid Input",
    });
    return;
  }

  const email = (req as unknown as { email: string }).email;

  const id = Date.now().toString() + crypto.randomUUID(); // same of order id and response catching

  const info = { id, ...validInput.data };

  try {
    await tradePusher.xAdd("stream:app:info", "*", {
      type: "trade-open",
      trade: JSON.stringify(info),
    });

    await responseLoopObj.waitForResponse(id);
    res.json({ message: "trade executed", id: id });
  } catch (err) {
    console.log(err);
    res.status(411).json({ message: "Trade not executed" });
  }
};

export const closeTradeController = async (req: Request, res: Response) => {
  const validInput = closeOrderSchema.safeParse(req.body);

  if (!validInput.success) {
    res.status(411).json({
      message: "Invalid Input",
    });
    return;
  }

  const resId = Date.now().toString() + crypto.randomUUID();

  const orderId = validInput.data.orderId;

  try {
    await tradePusher.xAdd("stream:app:info", "*", {
      type: "trade-close",
      resId,
      orderId,
    });

    await responseLoopObj.waitForResponse(resId);
    res.json({ message: "Trade Closed" });
  } catch (err) {
    console.log(err);
    res.status(411).json({ message: "Trade Not executed" });
  }
};
