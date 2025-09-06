import { Router } from "express";
import userRouter from "./userRouter";
import tradeRouter from "./tradeRouter";

const router: Router = Router();

router.use("/auth", userRouter);
router.use("/trade", tradeRouter);

export default router;
