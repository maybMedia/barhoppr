import { NextRequest, NextResponse } from "next/server";
import { desc, eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { drink, pub, pubLog, pubLogDrinks, users } from "@/lib/db/schema";
import { VisitSchema } from "@/lib/visit-validation";
import { publishVisit, VisitWriteError } from "@/lib/publish-visit";

type Context = { params: Promise<{ id: string }> };
const parseId = (value: string) =>
  /^\d+$/.test(value) &&
  Number.isSafeInteger(Number(value)) &&
  Number(value) > 0
    ? Number(value)
    : null;

export async function GET(_request: NextRequest, context: Context) {
  const id = parseId((await context.params).id);
  if (!id)
    return NextResponse.json({ error: "Venue not found." }, { status: 404 });
  try {
    const venue = await db
      .select({ id: pub.id })
      .from(pub)
      .where(eq(pub.id, id))
      .limit(1);
    if (!venue.length)
      return NextResponse.json({ error: "Venue not found." }, { status: 404 });
    const posts = await db
      .select({
        id: pubLog.id,
        name: pubLog.name,
        description: pubLog.description,
        rating: pubLog.rating,
        createdAt: pubLog.created_At,
        author: users.name,
      })
      .from(pubLog)
      .leftJoin(users, eq(pubLog.user_Id, users.id))
      .where(eq(pubLog.pub_Id, id))
      .orderBy(desc(pubLog.created_At), desc(pubLog.id))
      .limit(30);
    const linkedDrinks = posts.length
      ? await db
          .select({
            postId: pubLogDrinks.pub_Log_Id,
            id: drink.id,
            name: drink.name,
          })
          .from(pubLogDrinks)
          .innerJoin(drink, eq(pubLogDrinks.drink_Id, drink.id))
          .where(
            inArray(
              pubLogDrinks.pub_Log_Id,
              posts.map((post) => post.id),
            ),
          )
      : [];
    return NextResponse.json(
      posts.map((post) => ({
        ...post,
        author: post.author || "A fellow local",
        drinks: linkedDrinks
          .filter((drink) => drink.postId === post.id)
          .map(({ id, name }) => ({ id, name })),
      })),
    );
  } catch (error) {
    console.error("Failed to load visits:", error);
    return NextResponse.json(
      { error: "We couldn’t load the visits. Please try again." },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest, context: Context) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json(
      { error: "Please sign in again to share your visit." },
      { status: 401 },
    );
  const userId = session.user.id;
  const origin = request.headers.get("origin");
  if (
    !origin ||
    origin !== request.nextUrl.origin ||
    !request.headers.get("content-type")?.startsWith("application/json")
  )
    return NextResponse.json(
      {
        error:
          "This request could not be verified. Please refresh and try again.",
      },
      { status: 403 },
    );
  const id = parseId((await context.params).id);
  if (!id)
    return NextResponse.json({ error: "Venue not found." }, { status: 404 });
  let input;
  try {
    input = VisitSchema.safeParse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Please send a valid visit." },
      { status: 400 },
    );
  }
  if (!input.success)
    return NextResponse.json(
      {
        error:
          "Check your title, notes, rating, and drink details. Choose up to 30 drinks, including up to 5 new drinks.",
      },
      { status: 400 },
    );
  try {
    const result = await publishVisit(db, id, userId, input.data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof VisitWriteError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    console.error("Failed to save visit:", error);
    return NextResponse.json(
      { error: "We couldn’t save your visit. Please try again." },
      { status: 503 },
    );
  }
}
