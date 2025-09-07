import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { getAssetBalanceController, getUsdBalanceController } from "../controller/balanceController";

const balanceRouter: Router = Router();

balanceRouter.use(authMiddleware);
balanceRouter.get("/", getAssetBalanceController);
balanceRouter.get("/usd", getUsdBalanceController);

export default balanceRouter;
