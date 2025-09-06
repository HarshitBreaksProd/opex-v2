import z from "zod";

export const authBodySchema = z.object({
  email: z.email(),
});

export const createOrderSchema = z.object({
  asset: z.string(),
  type: z.enum(["long", "short"]),
  margin: z.number(),
  leverage: z.number(),
  slippage: z.number(),
});

export const closeOrderSchema = z.object({ orderId: z.string() });

