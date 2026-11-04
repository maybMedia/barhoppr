import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createClient } from "@libsql/client/node";
import { drizzle } from "drizzle-orm/libsql/node";
import { pushSQLiteSchema } from "drizzle-kit/api";
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";
import { publishVisit, VisitWriteError } from "../src/lib/publish-visit";
import { drinkIdentity, VisitSchema } from "../src/lib/visit-validation";
import { filterPubs } from "../src/lib/discovery";

// Shared cache keeps the in-memory database visible to libSQL transaction
// connections. The keeper client stays open until this test worker finishes.
const client = createClient({ url: "file::memory:?cache=shared" });
const database = drizzle(client);
let initialised = false;
after(() => client.close());
async function fixture() {
  const db = database;
  if (!initialised) {
    const setup = await pushSQLiteSchema(schema, db);
    await setup.apply();
    initialised = true;
  }
  const cleanup = async () => {
    await db.delete(schema.pubLogDrinks);
    await db.delete(schema.pubDrinks);
    await db.delete(schema.pubLog);
    await db.delete(schema.drink);
    await db.delete(schema.pub);
    await db.delete(schema.users);
  };
  await cleanup();
  await db
    .insert(schema.users)
    .values({ id: "visitor", name: "Local visitor" });
  await db.insert(schema.pub).values([
    {
      id: 1,
      name: "New Local",
      description: "Surry Hills",
      image_Url: "/one.svg",
      lat: -33.88,
      long: 151.21,
    },
    {
      id: 2,
      name: "Other Local",
      description: "Newtown",
      image_Url: "/two.svg",
      lat: -33.89,
      long: 151.18,
    },
  ]);
  await db
    .insert(schema.drink)
    .values({
      id: 1,
      name: "Coastal Pale",
      brewery: "Local Brewing",
      type: "Beer",
      description: "A crisp pale ale",
    });
  await db.insert(schema.pubDrinks).values({ pub_Id: 2, drink_Id: 1 });
  return { db, cleanup };
}

const visit = (changes: Record<string, unknown> = {}) =>
  VisitSchema.parse({
    name: "A new find",
    description: "Spotted this on the drinks list today.",
    rating: 4,
    drinkIds: [],
    ...changes,
  });

test("a catalogue drink can be reported at another venue and becomes searchable there", async () => {
  const { db, cleanup } = await fixture();
  try {
    const post = await publishVisit(
      db,
      1,
      "visitor",
      visit({ drinkIds: [1, 1] }),
    );
    const links = await db
      .select()
      .from(schema.pubDrinks)
      .where(eq(schema.pubDrinks.pub_Id, 1));
    assert.deepEqual(
      links.map((link) => link.drink_Id),
      [1],
    );
    assert.equal(
      (
        await db
          .select()
          .from(schema.pubLogDrinks)
          .where(eq(schema.pubLogDrinks.pub_Log_Id, post.id))
      ).length,
      1,
    );
    const drinks = await db
      .select()
      .from(schema.drink)
      .where(eq(schema.drink.id, 1));
    assert.deepEqual(
      filterPubs(
        [
          {
            id: 1,
            name: "New Local",
            description: "Surry Hills",
            lat: -33.88,
            long: 151.21,
            drinks,
          },
        ],
        { query: "Coastal Pale" },
      ).map((pub) => pub.id),
      [1],
    );
    await publishVisit(db, 1, "visitor", visit({ drinkIds: [1] }));
    assert.equal(
      (
        await db
          .select()
          .from(schema.pubDrinks)
          .where(eq(schema.pubDrinks.pub_Id, 1))
      ).length,
      1,
      "repeat visits must not duplicate venue listings",
    );
  } finally {
    await cleanup();
  }
});

test("new drinks are reusable catalogue entries, with case and whitespace deduplication", async () => {
  const { db, cleanup } = await fixture();
  try {
    await publishVisit(
      db,
      1,
      "visitor",
      visit({
        newDrinks: [
          {
            name: "Sunny Lager",
            brewery: "Coastal Brewing",
            type: "Beer",
            abv: 4.5,
          },
        ],
      }),
    );
    await publishVisit(
      db,
      2,
      "visitor",
      visit({
        newDrinks: [
          {
            name: "  SUNNY   LAGER  ",
            brewery: "coastal brewing",
            type: "Beer",
          },
        ],
      }),
    );
    const catalogue = await db.select().from(schema.drink);
    assert.equal(catalogue.length, 2);
    const entry = catalogue.find((drink) => drink.name === "Sunny Lager")!;
    assert.equal(entry.abv, 4.5);
    assert.equal(
      (
        await db
          .select()
          .from(schema.pubDrinks)
          .where(eq(schema.pubDrinks.drink_Id, entry.id))
      ).length,
      2,
    );
    assert.equal(
      (
        await db
          .select()
          .from(schema.pubLogDrinks)
          .where(eq(schema.pubLogDrinks.drink_Id, entry.id))
      ).length,
      2,
    );
    await publishVisit(
      db,
      1,
      "visitor",
      visit({
        newDrinks: [
          { name: "Sunny Lager", brewery: "Another Brewery", type: "Beer" },
        ],
      }),
    );
    assert.equal(
      (await db.select().from(schema.drink)).length,
      3,
      "different producers must remain distinguishable",
    );
  } finally {
    await cleanup();
  }
});

test("new-drink input that matches an existing catalogue entry reuses its original ID", async () => {
  const { db, cleanup } = await fixture();
  try {
    const post = await publishVisit(
      db,
      1,
      "visitor",
      visit({
        drinkIds: [1],
        newDrinks: [
          { name: "coastal pale", brewery: " LOCAL BREWING ", type: "Beer" },
        ],
      }),
    );
    assert.equal((await db.select().from(schema.drink)).length, 1);
    assert.equal(
      (
        await db
          .select()
          .from(schema.pubLogDrinks)
          .where(eq(schema.pubLogDrinks.pub_Log_Id, post.id))
      ).length,
      1,
    );
  } finally {
    await cleanup();
  }
});

test("invalid catalogue references and missing venues leave no partial posts or drinks", async () => {
  const { db, cleanup } = await fixture();
  try {
    await assert.rejects(
      publishVisit(
        db,
        1,
        "visitor",
        visit({ drinkIds: [999], newDrinks: [{ name: "Should not exist" }] }),
      ),
      (error: unknown) =>
        error instanceof VisitWriteError && error.status === 400,
    );
    await assert.rejects(
      publishVisit(
        db,
        999,
        "visitor",
        visit({ newDrinks: [{ name: "Should not exist" }] }),
      ),
      (error: unknown) =>
        error instanceof VisitWriteError && error.status === 404,
    );
    assert.equal((await db.select().from(schema.drink)).length, 1);
    assert.equal((await db.select().from(schema.pubLog)).length, 0);
    assert.equal((await db.select().from(schema.pubDrinks)).length, 1);
  } finally {
    await cleanup();
  }
});

test("new drink details are bounded and identity includes the producer", () => {
  assert.equal(
    VisitSchema.safeParse({ ...visit(), newDrinks: [{ name: " " }] }).success,
    false,
  );
  assert.equal(
    VisitSchema.safeParse({
      ...visit(),
      newDrinks: [{ name: "A lager", abv: 101 }],
    }).success,
    false,
  );
  assert.equal(
    VisitSchema.safeParse({
      ...visit(),
      newDrinks: [{ name: "A lager", type: "Invalid" }],
    }).success,
    false,
  );
  assert.equal(
    VisitSchema.safeParse({
      ...visit(),
      newDrinks: Array.from({ length: 6 }, () => ({ name: "A lager" })),
    }).success,
    false,
  );
  assert.equal(
    drinkIdentity({ name: "  PALE   ALE ", brewery: "Local" }),
    drinkIdentity({ name: "pale ale", brewery: " local " }),
  );
  assert.notEqual(
    drinkIdentity({ name: "Pale Ale", brewery: "First" }),
    drinkIdentity({ name: "Pale Ale", brewery: "Second" }),
  );
});
