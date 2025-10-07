export interface Beer{
    id: string;
    name: string;
    brewery: string;
    style: string;
    abv: number; // Alcohol by volume percentage
    imageUrl?: string; // Optional URL to an image of the beer
}