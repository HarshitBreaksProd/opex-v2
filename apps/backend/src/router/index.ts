import { Router } from "express";
import userRouter from "./userRouter";
import tradeRouter from "./tradeRouter";
import balanceRouter from "./balanceRouter";

const router: Router = Router();

router.use("/auth", userRouter);
router.use("/trade", tradeRouter);
router.use("/balance", balanceRouter);
router.get("/supportedAssets", (req, res) => {
  res.json({
    assets: [
      {
        symbol: "BTC_USDC_PERP",
        name: "Bitcoin",
      },
      {
        symbol: "ETH_USDC_PERP",
        name: "Ethereum",
      },
      {
        symbol: "SOL_USDC_PERP",
        name: "Solana",
      },
    ],
  });
});

export default router;
