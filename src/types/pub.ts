export interface Pub {
  id: number;
  name: string;
  description: string;
  lat: number;
  long: number;
  drinks?: {
    id: number;
    name: string;
  }[];
}
