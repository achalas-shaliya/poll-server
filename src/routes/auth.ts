import express, { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

const router: Router = express.Router();

const SECRET = process.env.SECRET;

interface UserPayload {
  uid: string;
}

router.post("/anon", (req: Request, res: Response) => {
  const payload: UserPayload = { uid: Date.now().toString() };
  const token = jwt.sign(payload, SECRET, { expiresIn: "5m" });
  console.log("Generated token:", token);

  res.json({ token });
});

export default router;
