import express, { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { createPoll, votePoll, getPoll } from "../pollManager";
import { Server } from "socket.io";
import { query } from "../db";
import { config } from "dotenv";
config();

const SECRET = process.env.SECRET;
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
    async (req: Request<{}, {}, CreatePollRequestBody>, res: Response) => {
      const { question, options, expiresAt } = req.body;
      const id = createPoll({ question, options, expiresAt });
      const result = await query(
        "INSERT INTO polls (question, options, expires_at) VALUES ($1, $2, $3) RETURNING id",
        [question, options, expiresAt]
      );
      res.json({ id: result.rows[0].id });
      // res.json({ id });
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
        // const result = votePoll(id, user.uid, optionIndex);
        // console.log("RESULT", result);

        const savedVote = await query(
          "INSERT INTO votes (poll_id, user_id, option_index) VALUES ($1, $2, $3) RETURNING id",
          [id, user.uid, optionIndex]
        );

        // console.log("Result: ", result);

        if (savedVote) {
          const result = await query(
            "SELECT poll_id, option_index, COUNT(*) AS vote_count FROM votes WHERE poll_id =$1 GROUP BY poll_id, option_index",
            [id]
          );
          console.log("Result: ", result.rows, result.rows.length);
          let total = 0;
          let tally: number[] = [];
          if (result.rows.length > 0) {
            for (let i = 0; i < result.rows.length; i++) {
              const element = result.rows[i];
              tally[element.option_index] = Number(element.vote_count);
              console.log("TALLY: ", tally);

              total += Number(element.vote_count);
            }
          }

          console.log("DATA: ", { delta: tally, total });

          io.to(`poll/${id}`).emit("vote", { delta: tally, total });
        }
        res.json({ success: true });
      } catch (err: any) {
        res.status(400).json({ error: err.message });
      }
    }
  );

  router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
    try {
      const poll_id = req.params.id;
      const result = await query("SELECT * FROM polls WHERE id = $1", [
        poll_id,
      ]);
      if (result.rows.length === 0) {
        throw new Error("Poll not found");
      }
      res.json(result.rows[0]);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  return router;
}
