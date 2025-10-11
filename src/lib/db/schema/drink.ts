import { int, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const drink = sqliteTable("drink", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  slug: text().unique(),
  image_Url: text(),
  description: text().notNull(),
  type: text().notNull(),
  brewery: text(),
  style: text(),
  abv: real(),
  created_At: int().notNull().$default(() => Date.now()),
  updated_At: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});