import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import { parse } from "dotenv";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { pushSQLiteSchema } from "drizzle-kit/api";
import * as schema from "../src/lib/db/schema";

async function main() {
  if (process.env.NODE_ENV === "production")
    throw new Error("Local database setup is disabled in production.");
  const envPath = resolve(".env");
  let envText = "";
  try {
    envText = await readFile(envPath, "utf8");
  } catch {
    /* A fresh checkout may not have an environment file yet. */
  }
  const existing = parse(envText);
  const localUrl = "file:.data/barhoppr.db";
  if (envText && existing.TURSO_DATABASE_URL !== localUrl) {
    const backup = resolve(`.env.production.backup-${Date.now()}`);
    await copyFile(envPath, backup, constants.COPYFILE_EXCL);
    console.log(
      "Preserved the existing environment in an ignored .env.production.backup-* file.",
    );
  }
  function setEnv(key: string, value: string) {
    const pattern = new RegExp(
      `^[ \\t]*(?:export[ \\t]+)?${key}[ \\t]*=.*$`,
      "m",
    );
    const line = `${key}=${JSON.stringify(value)}`;
    envText = pattern.test(envText)
      ? envText.replace(pattern, line)
      : `${envText.trimEnd()}\n${line}\n`;
  }
  setEnv("TURSO_DATABASE_URL", localUrl);
  setEnv("TURSO_AUTH_TOKEN", "");
  setEnv("AUTH_URL", "http://localhost:3000");
  if (existing.NEXTAUTH_URL) setEnv("NEXTAUTH_URL", "http://localhost:3000");
  if (existing.TURSO_DATABASE_URL !== localUrl || !existing.AUTH_SECRET)
    setEnv("AUTH_SECRET", randomBytes(32).toString("base64url"));
  setEnv("AUTH_GITHUB_ID", existing.AUTH_GITHUB_ID || "");
  setEnv("AUTH_GITHUB_SECRET", existing.AUTH_GITHUB_SECRET || "");
  setEnv("NEXT_PUBLIC_DEMO_DATA", "true");
  await writeFile(envPath, envText, "utf8");
  await mkdir(resolve(".data"), { recursive: true });

  // Intentionally use a fixed local URL, never the former environment connection.
  const client = createClient({ url: localUrl });
  const db = drizzle(client);
  try {
    const tables = await client.execute(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
    );
    if (!tables.rows.length) {
      const changes = await pushSQLiteSchema(schema, db);
      if (
        changes.hasDataLoss ||
        changes.statementsToExecute.some((sql) =>
          /(?:^|;)\s*(DROP|DELETE|TRUNCATE)\b/i.test(sql),
        )
      ) {
        throw new Error(
          "Local schema setup would remove data. Review the schema manually.",
        );
      }
      await changes.apply();
    } else {
      const required = [
        "pub",
        "drink",
        "pub_drinks",
        "pubLog",
        "pub_log_drinks",
        "user",
        "session",
        "account",
      ];
      if (
        required.some(
          (name) => !tables.rows.some((table) => table.name === name),
        )
      ) {
        throw new Error(
          "The local database has an incomplete schema. Review it before adding demo data; existing records were kept.",
        );
      }
      const columns = await client.execute('PRAGMA table_info("pubLog")');
      if (!columns.rows.some((column) => column.name === "rating")) {
        await client.execute(
          await readFile(
            new URL("../drizzle/0001_visit_rating.sql", import.meta.url),
            "utf8",
          ),
        );
      }
    }
    const existingPubs = await db
      .select({ id: schema.pub.id })
      .from(schema.pub)
      .limit(1);
    if (!existingPubs.length) {
      const venues = [
        {
          name: "The Hoppy Corner",
          area: "Surry Hills",
          lat: -33.8847,
          long: 151.2118,
          description:
            "A sunny Surry Hills corner with a soft spot for crisp lagers, long catch-ups, and a really good beer garden.",
        },
        {
          name: "Golden Hour Social",
          area: "Newtown",
          lat: -33.8976,
          long: 151.1795,
          description:
            "Newtown’s easygoing meeting spot. Think hazy ales, warm afternoon light, and a table for the whole crew.",
        },
        {
          name: "The Local Taproom",
          area: "Parramatta",
          lat: -33.8152,
          long: 151.0035,
          description:
            "A friendly Parramatta taproom championing a rotating lineup of craft beer and familiar favourites.",
        },
        {
          name: "Foam & Friends",
          area: "Marrickville",
          lat: -33.9106,
          long: 151.1563,
          description:
            "A laid-back Marrickville neighbourhood bar for pale ales, a game of cards, and very good company.",
        },
        {
          name: "The Malt House",
          area: "Toongabbie",
          lat: -33.7866,
          long: 150.9512,
          description:
            "Toongabbie’s cosy local hideout. Settle into a booth and discover your new favourite stout or lager.",
        },
        {
          name: "Sunday Club",
          area: "Manly",
          lat: -33.7973,
          long: 151.2872,
          description:
            "A breezy Manly escape for coastal afternoons. Cold cider, easy-drinking beer, and a little extra sunshine.",
        },
      ];
      await db.transaction(async (tx) => {
        const drinks = await tx
          .insert(schema.drink)
          .values([
            {
              name: "Golden Lager",
              slug: "demo-golden-lager",
              description: "Crisp, clean, and made for a sunny afternoon.",
              type: "Beer",
              brewery: "Neighbourhood Brewing",
              style: "Lager",
              abv: 4.5,
            },
            {
              name: "Hazy Days",
              slug: "demo-hazy-days",
              description: "Tropical, soft, and full of character.",
              type: "Beer",
              brewery: "Good Company Brewing",
              style: "Hazy Pale Ale",
              abv: 5.2,
            },
            {
              name: "Sunday Pale",
              slug: "demo-sunday-pale",
              description: "Bright citrus hops with a refreshing finish.",
              type: "Beer",
              brewery: "Neighbourhood Brewing",
              style: "Pale Ale",
              abv: 4.8,
            },
            {
              name: "Orchard Cider",
              slug: "demo-orchard-cider",
              description: "Juicy apples with a crisp, dry finish.",
              type: "Cider",
              brewery: "Little Orchard",
              style: "Apple Cider",
              abv: 4.2,
            },
            {
              name: "Midnight Stout",
              slug: "demo-midnight-stout",
              description: "Roasted malt, cocoa, and a smooth finish.",
              type: "Beer",
              brewery: "Good Company Brewing",
              style: "Stout",
              abv: 5.5,
            },
            {
              name: "Easy IPA",
              slug: "demo-easy-ipa",
              description: "Big hop flavour with an easygoing attitude.",
              type: "Beer",
              brewery: "Local Legends",
              style: "IPA",
              abv: 6.1,
            },
            {
              name: "Lemon, Lime & Bitters",
              slug: "demo-lemon-lime",
              description: "The refreshing pub classic.",
              type: "Soft drink",
              style: "Pub classic",
              abv: 0,
            },
            {
              name: "No Worries Pale",
              slug: "demo-no-worries",
              description: "All the flavour for an alcohol-free round.",
              type: "Alcohol-free",
              brewery: "Local Legends",
              style: "Pale Ale",
              abv: 0,
            },
          ])
          .returning({ id: schema.drink.id });
        const pubs = await tx
          .insert(schema.pub)
          .values(
            venues.map((venue, i) => ({
              name: venue.name,
              lat: venue.lat,
              long: venue.long,
              description: venue.description,
              image_Url: `/venues/local-${i + 1}.svg`,
            })),
          )
          .returning({ id: schema.pub.id });
        const offerings = [
          [0, 1, 2, 6],
          [1, 3, 5, 7],
          [0, 2, 4, 5, 7],
          [1, 2, 5, 6],
          [0, 3, 4, 6],
          [0, 1, 3, 7],
        ];
        await tx.insert(schema.pubDrinks).values(
          pubs.flatMap((pub, i) =>
            offerings[i].map((index) => ({
              pub_Id: pub.id,
              drink_Id: drinks[index].id,
            })),
          ),
        );
        await tx.insert(schema.users).values([
          {
            id: "local-demo-alex",
            name: "Alex · Demo visitor",
            email: "alex@example.invalid",
          },
          {
            id: "local-demo-sam",
            name: "Sam · Demo visitor",
            email: "sam@example.invalid",
          },
        ]);
        const posts = await tx
          .insert(schema.pubLog)
          .values(
            pubs.map((pub, i) => ({
              name: i % 2 ? "A very good afternoon" : "Found my kind of local",
              description:
                i % 2
                  ? "A relaxed spot for a catch-up. Tried something new from the drinks list and would happily come back."
                  : "Cold beer, friendly atmosphere, and a great place to catch up with friends. The sunny seats were a bonus.",
              rating: i % 2 ? 4 : 5,
              lat: venues[i].lat,
              long: venues[i].long,
              pub_Id: pub.id,
              user_Id: i % 2 ? "local-demo-sam" : "local-demo-alex",
              created_At: Date.now() - (i + 1) * 86400000,
            })),
          )
          .returning({ id: schema.pubLog.id });
        await tx.insert(schema.pubLogDrinks).values(
          posts.map((post, i) => ({
            pub_Log_Id: post.id,
            drink_Id: drinks[offerings[i][0]].id,
          })),
        );
      });
      console.log(
        "Created 6 fictional local venues, 8 drinks, and sample visits. No production data was copied or changed.",
      );
    } else console.log("Local venues already exist. Existing data was kept.");
    console.log(
      "Development now uses .data/barhoppr.db. Restart the app to load the local environment.",
    );
  } finally {
    client.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Local setup failed.");
  process.exitCode = 1;
});
