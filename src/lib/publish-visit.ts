import { createHash } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { drink, pub, pubDrinks, pubLog, pubLogDrinks } from "./db/schema";
import { drinkIdentity, type VisitInput } from "./visit-validation";

export class VisitWriteError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** A visit and its drink sightings are published together, or not at all. */
export async function publishVisit(
  database: LibSQLDatabase,
  venueId: number,
  userId: string,
  input: VisitInput,
) {
  return database.transaction(async (tx) => {
    const [venue] = await tx
      .select()
      .from(pub)
      .where(eq(pub.id, venueId))
      .limit(1);
    if (!venue) throw new VisitWriteError("Venue not found.", 404);

    // Drinks may come from anywhere in the catalogue, not just this venue.
    const selected = input.drinkIds.length
      ? await tx
          .select({ id: drink.id })
          .from(drink)
          .where(inArray(drink.id, input.drinkIds))
      : [];
    if (input.drinkIds.some((id) => !selected.some((drink) => drink.id === id)))
      throw new VisitWriteError(
        "One of those drinks is no longer available in the catalogue. Please refresh and try again.",
        400,
      );
    const resolved = new Set(input.drinkIds);
    const catalogue = input.newDrinks.length
      ? await tx
          .select({
            id: drink.id,
            name: drink.name,
            brewery: drink.brewery,
            type: drink.type,
          })
          .from(drink)
      : [];
    const identities = new Map(
      catalogue.map((entry) => [drinkIdentity(entry), entry.id]),
    );
    for (const entry of input.newDrinks) {
      const identity = drinkIdentity(entry);
      let id = identities.get(identity);
      if (!id) {
        // A stable unique slug also handles concurrent submissions of a new drink.
        const slug = `community-${createHash("sha256").update(identity).digest("hex")}`;
        const [created] = await tx
          .insert(drink)
          .values({
            ...entry,
            brewery: entry.brewery || null,
            style: entry.style || null,
            description: "",
            slug,
          })
          .onConflictDoNothing({ target: drink.slug })
          .returning({ id: drink.id });
        id = created?.id;
        if (!id) {
          const [existing] = await tx
            .select({ id: drink.id })
            .from(drink)
            .where(eq(drink.slug, slug))
            .limit(1);
          id = existing?.id;
        }
        if (!id) throw new Error("Could not resolve the new drink.");
        identities.set(identity, id);
      }
      resolved.add(id);
    }

    const [post] = await tx
      .insert(pubLog)
      .values({
        name: input.name,
        description: input.description,
        rating: input.rating,
        pub_Id: venueId,
        user_Id: userId,
        lat: venue.lat,
        long: venue.long,
      })
      .returning({ id: pubLog.id });
    const ids = [...resolved];
    if (ids.length) {
      await tx
        .insert(pubLogDrinks)
        .values(ids.map((id) => ({ pub_Log_Id: post.id, drink_Id: id })));
      const existingLinks = await tx
        .select({ id: pubDrinks.drink_Id })
        .from(pubDrinks)
        .where(eq(pubDrinks.pub_Id, venueId));
      const missing = ids.filter(
        (id) => !existingLinks.some((link) => link.id === id),
      );
      if (missing.length)
        await tx
          .insert(pubDrinks)
          .values(missing.map((id) => ({ pub_Id: venueId, drink_Id: id })));
    }
    return post;
  });
}
