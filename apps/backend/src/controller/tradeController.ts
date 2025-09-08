import { tradePusher } from "@repo/redis/queue";
import { Request, Response } from "express";
import { responseLoopObj } from "../utils/responseLoop";
import { closeOrderSchema, createOrderSchema } from "@repo/types/zodSchema";
import prismaClient from "@repo/db/client";

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

  const userId = (req as unknown as { userId: string }).userId;
  const reqId = Date.now().toString() + crypto.randomUUID();
  const tradeInfo = JSON.stringify(validInput.data);

  try {
    await tradePusher.xAdd("stream:app:info", "*", {
      type: "trade-open",
      tradeInfo,
      userId,
      reqId,
    });

    const orderId = await responseLoopObj.waitForResponse(reqId);
    res.json({ message: "trade executed", orderId });
  } catch (err) {
    console.log(err);
    res.status(411).json({ message: "Trade not executed", err });
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

  const userId = (req as unknown as { userId: string }).userId;
  const reqId = Date.now().toString() + crypto.randomUUID();
  const orderId = validInput.data.orderId;

  console.log("sending to engine");

  try {
    await tradePusher.xAdd("stream:app:info", "*", {
      type: "trade-close",
      reqId,
      userId,
      orderId,
    });

    await responseLoopObj.waitForResponse(reqId);
    res.json({ message: "Trade Closed" });
  } catch (err) {
    console.log(err);
    res.status(411).json({ message: "Trade Not executed" });
  }
};

export const fetchClosedTrades = async (req: Request, res: Response) => {
  const userId = (req as unknown as { userId: string }).userId;
  try {
    const trades = await prismaClient.existingTrades.findMany({
      where: { userId },
    });

    res.json({
      trades,
    });
  } catch (err) {
    console.log(err);

    res.status(411).json({
      message: "Faced some error",
    });
  }
};
