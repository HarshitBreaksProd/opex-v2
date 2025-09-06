import { Request, Response } from "express";
import { authBodySchema } from "@repo/types/zodSchema";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail";
import { httpPusher } from "@repo/redis/queue";
import { responseLoopObj } from "../utils/responseLoop";

(async () => {
  await httpPusher.connect();
})();

export const emailGenController = async (req: Request, res: Response) => {
  const validInput = authBodySchema.safeParse(req.body);

  if (!validInput.success) {
    res.status(404).json({
      message: "Invalid input",
    });
    return;
  }

  const email = validInput.data.email;

  const jwtToken = jwt.sign(email, process.env.JWT_SECRET!);

  try {
    const resId = Date.now().toString() + crypto.randomUUID();

    await httpPusher.xAdd("stream:app:info", "*", {
      type: "user-signup",
      email: email,
      resId,
    });

    await responseLoopObj.waitForResponse(resId);

    console.log("recieved");

    // const { data, error } = await sendEmail(email, jwtToken);

    // if (error) {
    //   res.status(400).json({ error });
    //   return;
    // }

    res.json({
      message: "Email sent",
    });
  } catch (err) {
    res.status(400).json({
      message: "Could not sign in",
    });
  }
};

export const signinController = async (req: Request, res: Response) => {
  const token = req.query.token?.toString();

  if (!token) {
    console.log("Token not found");
    res.status(411).json({
      message: "Token not found",
    });
    return;
  }

  res.cookie("jwt", token);

  res.status(301).redirect("http://localhost:3000/trade/");
};
