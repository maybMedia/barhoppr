import { Log } from "./log";

export interface User {
    id: string;
    username?: string;
    bio?: string;
    favoriteBeers?: string[]; // Array of Beer IDs
    avatarUrl?: string; // Optional URL to user's avatar image
    joinedAt: Date;

    logs?: Log[]; // Array of user's reviews/logs
    visitedPubs?: string[]; // Array of Pub IDs
}