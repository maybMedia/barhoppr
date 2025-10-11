import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pub, drink, pubDrinks } from "@/lib/db/schema";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
  try {
    // Fetch pubs
    const pubsData = await db.select().from(pub);

    // Fetch all pub-drink relationships in one go
    const pubDrinkRelations = await db
      .select({
        pubId: pubDrinks.pub_Id,
        drinkId: pubDrinks.drink_Id,
      })
      .from(pubDrinks);

    // Fetch all drinks
    const drinksData = await db.select().from(drink);

    // Map drinks to their pubs
    const pubsWithDrinks = pubsData.map((p) => {
      const relatedDrinkIds = pubDrinkRelations
        .filter((pd) => pd.pubId === p.id)
        .map((pd) => pd.drinkId);

      const pubDrinksList = drinksData.filter((d) =>
        relatedDrinkIds.includes(d.id)
      );

      return { ...p, drinks: pubDrinksList };
    });

    return NextResponse.json(pubsWithDrinks);
  } catch (error) {
    console.error("Failed to fetch pubs:", error);
    return NextResponse.json(
      { error: "Failed to fetch pubs" },
      { status: 500 }
    );
  }
}
