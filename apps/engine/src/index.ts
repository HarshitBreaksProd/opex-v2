import prismaClient from "@repo/db/client";
import { enginePuller, enginePusher } from "@repo/redis/queue";
import {
  FilteredDataType,
  OpenOrders,
  OrderType,
  UserBalance,
} from "@repo/types/types";

const currentPrice: Record<string, FilteredDataType> = {
  BTC_USDC_PERP: {
    ask_price: 0,
    bid_price: 0,
    decimal: 0,
  },
  SOL_USDC_PERP: {
    ask_price: 0,
    bid_price: 0,
    decimal: 0,
  },
  ETH_USDC_PERP: {
    ask_price: 0,
    bid_price: 0,
    decimal: 0,
  },
};

const openOrders: Record<string, OpenOrders[]> = {};

const userBalances: Record<string, UserBalance> = {};

(async () => {
  await enginePuller.connect();
  await enginePusher.connect();

  while (true) {
    const res = await enginePuller.xRead(
      { key: "stream:app:info", id: "$" },
      {
        BLOCK: 0,
        COUNT: 1,
      }
    );

    if (res) {
      let reqId = res[0]?.messages[0]?.message.reqId!;
      const reqType = res[0]?.messages[0]?.message.type;

      // User Signup and Signin
      if (reqType === "user-signup" || reqType === "user-signin") {
        const user = JSON.parse(res[0]?.messages[0]?.message.user!);

        if (!userBalances[user.id]) {
          userBalances[user.id] = {
            balance: user.balance,
            decimal: user.decimal,
          };
        }
        if (!openOrders[user.id]) {
          openOrders[user.id] = [];
        }

        await enginePusher.xAdd("stream:engine:response", "*", {
          type: "user-signup/in-ack",
          reqId,
          response: JSON.stringify({
            message: "User added to in memory successfully",
          }),
        });

        console.log(userBalances);
        console.log(openOrders);
      } else if (reqType === "price-update") {
        const tradePrices = JSON.parse(
          res[0]!.messages[0]?.message.tradePrices!
        );

        for (const [key, value] of Object.entries(tradePrices)) {
          currentPrice[key] = value as unknown as FilteredDataType;
        }

        // console.log(currentPrice);
        // Trade Open
      } else if (reqType === "trade-open") {
        const tradeInfo = JSON.parse(res[0]!.messages[0]?.message.tradeInfo!);
        const userId = res[0]!.messages[0]?.message.userId;

        if (!userBalances[userId!]) {
          await enginePusher.xAdd("stream:engine:response", "*", {
            type: "trade-open-err",
            reqId,
            response: JSON.stringify({
              message:
                "User does not exists (User not found in balances array)",
            }),
          });
          continue;
        }

        const assetCurrentPrice = currentPrice[tradeInfo.asset];

        let openPrice: number;
        let priceDiff: number;

        if (tradeInfo.type === "long") {
          openPrice = assetCurrentPrice?.ask_price!;
          priceDiff = Math.abs(
            assetCurrentPrice!.ask_price! - tradeInfo.openPrice
          );
        } else {
          openPrice = assetCurrentPrice?.bid_price!;
          priceDiff = Math.abs(
            assetCurrentPrice!.bid_price! - tradeInfo.openPrice
          );
        }
        const priceDiffInBips = (priceDiff! / tradeInfo.openPrice) * 100;

        if (priceDiffInBips > tradeInfo.slippage / 100) {
          await enginePusher.xAdd("stream:engine:response", "*", {
            type: "trade-open-err",
            reqId,
            response: JSON.stringify({
              message: "Price slippage exceded",
            }),
          });
          continue;
        }

        const margin = (openPrice * tradeInfo.quantity) / 10 ** 4;

        console.log("after Margin");
        console.log(openPrice, tradeInfo.quantity);

        const marginStr = margin.toFixed(4);
        const marginIntStr = marginStr.split(".")[0] + marginStr.split(".")[1]!;
        const marginInt = Number(marginIntStr);

        console.log("almost Margin");
        console.log(margin, marginInt);

        const currentBalance = userBalances[userId!]!.balance;
        const newBal = currentBalance! - marginInt;

        if (newBal < 0) {
          console.log("fail bal");
          console.log(currentBalance, newBal);
          await enginePusher.xAdd("stream:engine:response", "*", {
            type: "trade-open-err",
            reqId,
            response: JSON.stringify({
              message: "User does not have enough balance",
            }),
          });
          continue;
        }

        const orderId = crypto.randomUUID();

        const order: OpenOrders = {
          id: orderId,
          type: tradeInfo.type as unknown as OrderType,
          leverage: tradeInfo.leverage,
          asset: tradeInfo.asset,
          margin: marginInt,
          quantity: tradeInfo.quantity,
          openPrice,
        };

        if (!openOrders[userId!]?.length) {
          openOrders[userId!] = [];
        }

        openOrders[userId!]?.push(order);

        userBalances[userId!] = {
          balance: newBal,
          decimal: userBalances[userId!]!.decimal!,
        };

        await enginePusher.xAdd("stream:engine:response", "*", {
          type: "trade-open-ack",
          reqId,
          response: JSON.stringify({
            message: "Order Created",
            orderId,
          }),
        });

        console.log(currentPrice);
        console.log(userBalances);
        console.log(openOrders);

        // Trade Close
      } else if (reqType === "trade-close") {
        const orderId = res[0]?.messages[0]?.message.orderId!;
        const userId = res[0]?.messages[0]?.message.userId!;

        if (!userBalances[userId]) {
          await enginePusher.xAdd("stream:engine:response", "*", {
            type: "trade-close-err",
            reqId,
            response: JSON.stringify({
              message:
                "User does not exists (User not found in balances array)",
            }),
          });
          continue;
        }

        const order = openOrders[userId]?.filter((o) => {
          o.id === orderId;
        })[0];

        if (!order) {
          await enginePusher.xAdd("stream:engine:response", "*", {
            type: "trade-close-err",
            reqId,
            response: JSON.stringify({
              message: "Order does not exists (Order not found in OpenOrders)",
            }),
          });
          continue;
        }

        const assetCurrentPrice = currentPrice[order.asset];
        let closePrice: number;
        let priceChange: number;
        let pnl: number;

        if (order.type === "long") {
          closePrice = assetCurrentPrice?.bid_price!;
          priceChange = closePrice - order.openPrice;
        } else {
          closePrice = assetCurrentPrice?.ask_price!;
          priceChange = order.openPrice - closePrice;
        }

        pnl = priceChange * order.leverage * order.quantity;

        const pnlStr = pnl.toFixed(4);
        const pnlIntStr = pnlStr.split(".")[0] + pnlStr.split(".")[1]!;
        const pnlInt = Number(pnlIntStr);

        const newBalChange = pnlInt + order.margin;

        userBalances[userId] = {
          balance: userBalances[userId].balance + newBalChange,
          decimal: 4,
        };

        openOrders[userId] = openOrders[userId]!.filter(
          (o) => o.id !== orderId
        );

        const closedOrder = {
          ...order,
          closePrice,
          pnl: pnlInt,
          decimal: 4,
          liquidated: false,
          userId,
        };

        await prismaClient.existingTrades.create({
          data: {
            ...closedOrder,
          },
        });

        await enginePusher.xAdd("stream:engine:response", "*", {
          type: "trade-close-ack",
          reqId,
          response: JSON.stringify({
            message: "Order Closed",
            orderId,
          }),
        });

        console.log(currentPrice);
        console.log(userBalances);
        console.log(openOrders);
      }
    }
  }
})();
