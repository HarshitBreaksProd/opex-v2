import { Router } from "express";
import { openTradeController } from "../controller/tradeController";

const tradeRouter: Router = Router();

tradeRouter.get("/open", openTradeController);

export default tradeRouter;
