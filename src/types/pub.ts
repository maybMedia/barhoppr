import { Beer } from "./beer";
import { Log } from "./log";

export interface Pub {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    beersOnTap: Beer[];
    images: string[];
    log: Log[];
}