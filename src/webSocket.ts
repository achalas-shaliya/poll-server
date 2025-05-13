import { Server, Socket } from "socket.io";
import { closeExpiredPolls } from "./pollManager";

export default function setupWebSocket(io: Server): void {
  io.on("connection", (socket: Socket) => {
    socket.on("join_poll", (pollId: string) => {
      socket.join(`poll/${pollId}`);
    });
  });

  setInterval(() => {
    closeExpiredPolls(io);
  }, 1000); // every second
}