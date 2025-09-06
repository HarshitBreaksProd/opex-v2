import { enginePuller, enginePusher } from "@repo/redis/queue";
import { FilteredDataType, UserBalance } from "@repo/types/types";

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

const openOrders: Record<string, > = {};

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
      // res[0]?.messages.forEach((msg) => {
      //   const tradeField = msg.message.trade as string | undefined;
      //   if (tradeField) {
      //     const trade = JSON.parse(tradeField) as Record<
      //       string,
      //       FilteredDataType
      //     >;

      //     for (const [symbol, data] of Object.entries(trade)) {
      //       currentPrice[symbol] = data;
      //     }

      //     console.log(currentPrice);
      //   }
      // });

      if (
        res[0]?.messages[0]?.message.type === "trade-info" &&
        res[0].messages[0].message.trade
      ) {
        let trade = JSON.parse(res[0].messages[0].message.trade);

        // business logic takes place

        await enginePusher.xAdd("stream:engine:response", "*", {
          type: "trade-acknowledgement",
          message: JSON.stringify({
            resId: trade.id,
            message: "Trade executed succesfully",
          }),
        });

        console.log("Response Sent");
      }

      if (
        res[0]?.messages[0]?.message.type === "user-signup" &&
        res[0].messages[0].message
      ) {
        const { email, resId } = res[0].messages[0].message;
      }
    }
  }
})();
