import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { drink } from "@/lib/db/schema";

export async function GET() {
  try {
    const drinks = await db
      .select()
      .from(drink)
      .orderBy(asc(drink.name), asc(drink.brewery));
    return NextResponse.json(drinks, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to load drink catalogue:", error);
    return NextResponse.json(
      { error: "We couldn’t load the drinks. Please try again." },
      { status: 503 },
    );
  }
}
