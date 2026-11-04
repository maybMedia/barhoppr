import { NextResponse } from "next/server";
import { eq, max } from "drizzle-orm";
import { db } from "@/lib/db";
import { pub, drink, pubDrinks, pubLog, pubLogDrinks } from "@/lib/db/schema";

export async function GET() {
  try {
    const [pubs, links, drinks, sightings] = await Promise.all([
      db.select().from(pub),
      db
        .select({ pubId: pubDrinks.pub_Id, drinkId: pubDrinks.drink_Id })
        .from(pubDrinks),
      db.select().from(drink),
      db
        .select({
          pubId: pubLog.pub_Id,
          drinkId: pubLogDrinks.drink_Id,
          lastReportedAt: max(pubLog.created_At),
        })
        .from(pubLogDrinks)
        .innerJoin(pubLog, eq(pubLogDrinks.pub_Log_Id, pubLog.id))
        .groupBy(pubLog.pub_Id, pubLogDrinks.drink_Id),
    ]);
    const catalogue = new Map(drinks.map((drink) => [drink.id, drink]));
    const lastReported = new Map(
      sightings.map((sighting) => [
        `${sighting.pubId}:${sighting.drinkId}`,
        sighting.lastReportedAt,
      ]),
    );
    const venueDrinks = new Map<number, Set<number>>();
    for (const link of links) {
      if (!venueDrinks.has(link.pubId)) venueDrinks.set(link.pubId, new Set());
      venueDrinks.get(link.pubId)!.add(link.drinkId);
    }
    return NextResponse.json(
      pubs.map((venue) => ({
        ...venue,
        drinks: [...(venueDrinks.get(venue.id) || [])].flatMap((id) => {
          const entry = catalogue.get(id);
          return entry
            ? [
                {
                  ...entry,
                  lastReportedAt: lastReported.get(`${venue.id}:${id}`) ?? null,
                },
              ]
            : [];
        }),
      })),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Failed to fetch pubs:", error);
    return NextResponse.json(
      { error: "Failed to fetch pubs" },
      { status: 500 },
    );
  }
}
