import { Request, Response } from "express";
import { authBodySchema } from "@repo/types/zodSchema";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail";

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

  const { data, error } = await sendEmail(email, jwtToken);

  if (error) {
    res.status(400).json({ error });
    return;
  }

  res.json({
    message: "Email sent",
  });
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

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);

  res.cookie("jwt", token);
  res.cookie("email", decodedToken.toString());

  res.json({
    message: "Logged in",
  });
};
