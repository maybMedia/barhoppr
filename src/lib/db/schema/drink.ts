import { int, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const drink = sqliteTable("drink", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  slug: text().unique(),
  imageUrl: text(),
  description: text().notNull(),
  brewery: text(),
  style: text(),
  abv: real(),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});