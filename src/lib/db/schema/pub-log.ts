import { sql } from 'drizzle-orm';
import { int, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { users } from "./auth";
import { pub } from "./pub";

export const pubLog = sqliteTable("pubLog", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text().notNull(),
  lat: real().notNull(),
  long: real().notNull(),
  drinks: text().notNull().default(sql`(json_array())`),
  pubId: int().notNull().references(() => pub.id),
  userId: int().notNull().references(() => users.id),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});