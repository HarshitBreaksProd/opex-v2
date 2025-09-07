import { Router } from "express";
import { closeTradeController, openTradeController } from "../controller/tradeController";
import { authMiddleware } from "../middleware/authMiddleware";

const tradeRouter: Router = Router();

tradeRouter.use(authMiddleware);
tradeRouter.post("/open", openTradeController);
tradeRouter.post("/close", closeTradeController);

export default tradeRouter;
