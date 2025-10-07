import { Beer } from "./beer";

export interface Log {
    id: string;
    user: string;
    beers: Beer[];
    rating: number; // Rating out of 5
    comment: string;
    createdAt: Date;
}