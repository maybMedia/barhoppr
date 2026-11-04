import "dotenv/config";
import { createClient } from "@libsql/client";
import { readFile } from "node:fs/promises";

if (!process.env.TURSO_DATABASE_URL)
  throw new Error("Set TURSO_DATABASE_URL before running the migration.");
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
try {
  const columns = await client.execute('PRAGMA table_info("pubLog")');
  if (!columns.rows.length)
    throw new Error(
      "The pubLog table is missing. Initialise the existing database schema first.",
    );
  if (columns.rows.some((column) => column.name === "rating"))
    console.log("Visit rating column is already present. No changes needed.");
  else {
    const migration = await readFile(
      new URL("../drizzle/0001_visit_rating.sql", import.meta.url),
      "utf8",
    );
    await client.execute(migration);
    console.log("Visit rating column added. Existing visits were preserved.");
  }
} finally {
  client.close();
}
