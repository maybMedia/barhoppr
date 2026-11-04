import { z } from "zod";

const label = (limit: number) =>
  z
    .string()
    .trim()
    .max(limit)
    .transform((value) => value.replace(/\s+/g, " "));
export const DrinkTypes = [
  "Beer",
  "Cider",
  "Wine",
  "Spirits",
  "Cocktail",
  "Soft drink",
  "Alcohol-free",
  "Other",
] as const;
export const NewDrinkSchema = z.object({
  name: label(100).pipe(z.string().min(2)),
  brewery: label(100).optional(),
  type: z.enum(DrinkTypes).default("Beer"),
  style: label(80).optional(),
  abv: z.number().min(0).max(100).optional(),
});
export type NewDrink = z.infer<typeof NewDrinkSchema>;

export const VisitSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(2000).default(""),
    rating: z.number().int().min(1).max(5),
    drinkIds: z
      .array(z.number().int().positive())
      .max(30)
      .default([])
      .transform((ids) => [...new Set(ids)]),
    newDrinks: z.array(NewDrinkSchema).max(5).default([]),
  })
  .refine((visit) => visit.drinkIds.length + visit.newDrinks.length <= 30, {
    message: "Choose up to 30 drinks per visit.",
  });

export type VisitInput = z.infer<typeof VisitSchema>;

export function drinkIdentity(drink: {
  name: string;
  brewery?: string | null;
  type?: string;
}) {
  const normalise = (value: string) =>
    value.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
  return JSON.stringify([
    normalise(drink.name),
    normalise(drink.brewery || ""),
    normalise(drink.type || "Beer"),
  ]);
}
