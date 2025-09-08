import z from "zod";

export const authBodySchema = z.object({
  email: z.email(),
});

export const createOrderSchema = z.object({
  asset: z.string(),
  type: z.enum(["long", "short"]),
  quantity: z.number(),
  leverage: z.number(),
  slippage: z.number(),
  openPrice: z.number(),
  decimal: z.number(),
});

export const closeOrderSchema = z.object({ orderId: z.string() });

// Engine Message Schemas:

export const BaseMsg = z.object({ reqId: z.string(), type: z.string() });

export const UserAuthMsg = BaseMsg.extend({
  type: z.enum(["user-signup", "user-signin"]),
  user: z.string(),
});

export const PriceUpdateMsg = BaseMsg.extend({
  type: z.literal("price-update"),
  tradePrices: z.string(),
});

export const TradeOpenMsg = BaseMsg.extend({
  type: z.literal("trade-open"),
  tradeInfo: z.string(),
  userId: z.string(),
});

export const TradeCloseMsg = BaseMsg.extend({
  type: z.literal("trade-close"),
  orderId: z.string(),
  userId: z.string(),
});

export const GetAssetBalMsg = BaseMsg.extend({
  type: z.literal("get-asset-bal"),
  userId: z.string(),
});

export const GetUserBalMsg = BaseMsg.extend({
  type: z.literal("get-user-bal"),
  userId: z.string(),
});

export const MessageSchema = z.discriminatedUnion("type", [
  UserAuthMsg,
  PriceUpdateMsg,
  TradeOpenMsg,
  TradeCloseMsg,
  GetAssetBalMsg,
  GetUserBalMsg,
]);

export type Message = z.infer<typeof MessageSchema>;
