import { Drink } from "./drink";

export interface Log {
    id: string;
    user: string;
    beers: Drink[];
    rating: number; // Rating out of 5
    comment: string;
    createdAt: Date;
}