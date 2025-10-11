import { int, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { drink } from "./drink";

export const pub = sqliteTable("pub", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  image_Url: text().notNull().unique(),
  description: text().notNull(),
  lat: real().notNull(),
  long: real().notNull(),
  created_At: int().notNull().$default(() => Date.now()),
  updated_At: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});

export const pubDrinks = sqliteTable("pub_drinks", {
  id: int().primaryKey({ autoIncrement: true }),
  pub_Id: int().notNull().references(() => pub.id, { onDelete: 'cascade' }),
  drink_Id: int().notNull().references(() => drink.id, { onDelete: 'cascade' }),
  created_At: int().notNull().$default(() => Date.now()),
});