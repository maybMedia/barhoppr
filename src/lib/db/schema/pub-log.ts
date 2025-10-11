import { int, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { users } from "./auth";
import { pub } from "./pub";
import { drink } from './drink';

export const pubLog = sqliteTable("pubLog", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text().notNull(),
  lat: real().notNull(),
  long: real().notNull(),
  pub_Id: int().notNull().references(() => pub.id),
  user_Id: text().notNull().references(() => users.id),
  created_At: int().notNull().$default(() => Date.now()),
  updated_At: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});

export const pubLogDrinks = sqliteTable("pub_log_drinks", {
  id: int().primaryKey({ autoIncrement: true }),
  pub_Log_Id: int().notNull().references(() => pubLog.id, { onDelete: 'cascade' }),
  drink_Id: int().notNull().references(() => drink.id, { onDelete: 'cascade' }),
  created_At: int().notNull().$default(() => Date.now()),
});