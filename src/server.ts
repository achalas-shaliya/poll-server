// filepath: poll-server/src/server.ts
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import helmet from "helmet";
import authRoutes from "./routes/auth";
import pollRoutes from "./routes/poll";
import setupWebSocket from "./webSocket";

// runMigrations();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/poll", pollRoutes(io));

// WebSocket setup + auto poll closer
setupWebSocket(io);

server.listen(3000, () => {
  console.log("Server listening on http://localhost:3000");
});
