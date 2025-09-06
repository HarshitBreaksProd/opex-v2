import { Router } from "express";
import userRouter from "./userRouter";
import tradeRouter from "./tradeRouter";
import balanceRouter from "./balanceRouter";

const router: Router = Router();

router.use("/auth", userRouter);
router.use("/trade", tradeRouter);
router.use("/balance", balanceRouter);
// router.use("/supportedAssets");

export default router;
