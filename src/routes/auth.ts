import express, { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";

const router: Router = express.Router();
const SECRET = "herogr@m2022";

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