import { v4 as uuidv4 } from "uuid";
import { Server } from "socket.io";

interface Poll {
  id: string;
  question: string;
  options: string[];
  expiresAt: Date;
  votes: Record<string, number>;
  tally: number[];
  closed: boolean;
}

interface CreatePollParams {
  question: string;
  options: string[];
  expiresAt: string;
}

const polls: Map<string, Poll> = new Map();

export function createPoll({
  question,
  options,
  expiresAt,
}: CreatePollParams): string {
  const id = uuidv4();
  polls.set(id, {
    id,
    question,
    options,
    expiresAt: new Date(expiresAt),
    votes: {},
    tally: Array(options.length).fill(0),
    closed: false,
  });
  return id;
}

export function votePoll(
  id: string,
  userId: string,
  optionIndex: number
): { delta: number[]; total: number } | null {
  const poll = polls.get(id);
  if (!poll || poll.closed || new Date() > poll.expiresAt) {
    throw new Error("Poll closed or not found");
  }
  console.log("POLL_1: ", id, userId, optionIndex);

  const prevVote = poll.votes[userId];
  if (prevVote !== undefined) {
    if (prevVote === optionIndex) return null;
    poll.tally[prevVote]--;
  }

  poll.votes[userId] = optionIndex;
  poll.tally[optionIndex]++;
  console.log("POLL_2: ", poll);
  const total:number = poll.tally.reduce((a, b) => a + b, 0);

  return { delta: poll.tally, total:total };
}

export function getPoll(id: string): Omit<Poll, "votes"> {
  const poll = polls.get(id);
  if (!poll) throw new Error("Not found");
  return {
    id,
    question: poll.question,
    options: poll.options,
    tally: poll.tally,
    expiresAt: poll.expiresAt,
    closed: poll.closed,
  };
}

export function closeExpiredPolls(io: Server): void {
  for (const poll of polls.values()) {
    if (!poll.closed && new Date() > poll.expiresAt) {
      poll.closed = true;
      io.to(`poll/${poll.id}`).emit("poll_closed", poll.tally);
    }
  }
}
