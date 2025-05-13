// This file exports custom TypeScript types and interfaces used throughout the application.

export interface User {
    id: string;
    username: string;
    password: string; // Consider using a hashed password in practice
}

export interface Poll {
    id: string;
    question: string;
    options: PollOption[];
    createdAt: Date;
    updatedAt: Date;
}

export interface PollOption {
    id: string;
    text: string;
    votes: number;
}

export interface Vote {
    pollId: string;
    optionId: string;
    userId: string;
}