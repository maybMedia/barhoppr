export interface PubDrink {
  id: number;
  name: string;
  brewery?: string | null;
  style?: string | null;
  type?: string;
  abv?: number | null;
  image_Url?: string | null;
  description?: string;
  lastReportedAt?: number | null;
}

export interface Pub {
  id: number;
  name: string;
  description: string;
  image_Url?: string;
  lat: number;
  long: number;
  drinks?: PubDrink[];
}

export interface VisitPost {
  id: number;
  name: string;
  description: string;
  rating: number | null;
  createdAt: number;
  author: string;
  drinks: { id: number; name: string }[];
}
