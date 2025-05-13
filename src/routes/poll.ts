import express, { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { createPoll, votePoll, getPoll } from "../pollManager";
import { Server } from "socket.io";

const SECRET = "herogr@m2022";
const limiter = new RateLimiterMemory({ points: 5, duration: 1 });

interface UserPayload {
  uid: string;
}

interface CreatePollRequestBody {
  question: string;
  options: string[];
  expiresAt?: string;
}

interface VotePollRequestBody {
  id: string;
  optionIndex: number;
}

export default function (io: Server): Router {
  const router = express.Router();

  router.post(
    "/",
    (req: Request<{}, {}, CreatePollRequestBody>, res: Response) => {
      const { question, options, expiresAt } = req.body;
      const id = createPoll({ question, options, expiresAt });
      res.json({ id });
    }
  );

  router.post(
    "/vote",
    async (
      req: Request<{}, {}, VotePollRequestBody>,
      res: Response
    ): Promise<void> => {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        res.status(401).json({ error: "Token required" });
        return;
      }

      let user: UserPayload;
      try {
        user = jwt.verify(token, SECRET) as UserPayload;
      } catch {
        res.status(403).json({ error: "Invalid token" });
        return;
      }

      try {
        await limiter.consume(user.uid);
      } catch {
        res.status(429).json({ error: "Too many votes" });
        return;
      }

      const { optionIndex, id } = req.body;
      console.log("REQ", req.body);
      
      try {
        const result = votePoll(id, user.uid, optionIndex);
        if (result) {
          io.to(`poll/${id}`).emit("vote", result);
        }
        res.json({ success: true });
      } catch (err: any) {
        res.status(400).json({ error: err.message });
      }
    }
  );

  router.get("/:id", (req: Request<{ id: string }>, res: Response) => {
    try {
      const poll = getPoll(req.params.id);
      console.log("POLL", poll);

      res.json(poll);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  return router;
}
