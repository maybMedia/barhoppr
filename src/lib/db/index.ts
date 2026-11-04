import { drizzle } from "drizzle-orm/libsql/node";
import Env from "@/env";

// Explicitly select the Node driver: Turbopack can resolve the generic entry
// to the web client, which cannot open a local file: database.
const db = drizzle({
  connection: {
    url: Env.TURSO_DATABASE_URL,
    authToken: Env.TURSO_AUTH_TOKEN,
  },
});

export { db };
