import { Router } from "express";
import { openTradeController } from "../controller/tradeController";
import { authMiddleware } from "../middleware/authMiddleware";

const tradeRouter: Router = Router();

tradeRouter.use(authMiddleware);
tradeRouter.get("/open", openTradeController);

export default tradeRouter;
