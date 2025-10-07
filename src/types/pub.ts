import { Drink } from "./drink";
import { Log } from "./log";

export interface Pub {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    beersOnTap: Drink[];
    images: string[];
    log: Log[];
}