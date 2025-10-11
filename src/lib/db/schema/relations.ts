import { relations } from "drizzle-orm";
import { pub, pubDrinks, pubLog, pubLogDrinks, drink } from ".";

export const pubRelations = relations(pub, ({ many }) => ({
  drinks: many(pubDrinks),
  logs: many(pubLog),
}));

export const pubDrinksRelations = relations(pubDrinks, ({ one }) => ({
  pub: one(pub, {
    fields: [pubDrinks.pub_Id],
    references: [pub.id],
  }),
  drink: one(drink, {
    fields: [pubDrinks.drink_Id],
    references: [drink.id],
  }),
}));

export const pubLogRelations = relations(pubLog, ({ one, many }) => ({
  pub: one(pub, {
    fields: [pubLog.pub_Id],
    references: [pub.id],
  }),
  drinks: many(pubLogDrinks),
}));

export const pubLogDrinksRelations = relations(pubLogDrinks, ({ one }) => ({
  pubLog: one(pubLog, {
    fields: [pubLogDrinks.pub_Log_Id],
    references: [pubLog.id],
  }),
  drink: one(drink, {
    fields: [pubLogDrinks.drink_Id],
    references: [drink.id],
  }),
}));

export const drinkRelations = relations(drink, ({ many }) => ({
  pubs: many(pubDrinks),
  pubLogs: many(pubLogDrinks),
}));