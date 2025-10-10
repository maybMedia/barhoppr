import { sql } from "drizzle-orm";
import { int, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const drink = sqliteTable("drink", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  slug: text().unique(),
  imageUrl: text(),
  description: text().notNull(),
  type: text().notNull(),
  brewery: text(),
  style: text(),
  abv: real(),
  createdAt: int().notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: int().notNull().default(sql`(unixepoch() * 1000)`),
});