import { Router } from "express";
import {
  closeTradeController,
  fetchClosedTrades,
  openTradeController,
} from "../controller/tradeController";
import { authMiddleware } from "../middleware/authMiddleware";

const tradeRouter: Router = Router();

tradeRouter.use(authMiddleware);
tradeRouter.post("/open", openTradeController);
tradeRouter.post("/close", closeTradeController);
tradeRouter.get("/closed", fetchClosedTrades);

export default tradeRouter;
