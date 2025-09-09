import { Router } from "express";
import {
  closeTradeController,
  fetchClosedTrades,
  fetchOpenTrades,
  openTradeController,
} from "../controller/tradeController";
import { authMiddleware } from "../middleware/authMiddleware";

const tradeRouter: Router = Router();

tradeRouter.use(authMiddleware);
tradeRouter.post("/open", openTradeController);
tradeRouter.get("/open", fetchOpenTrades);
tradeRouter.post("/close", closeTradeController);
tradeRouter.get("/closed", fetchClosedTrades);

export default tradeRouter;
