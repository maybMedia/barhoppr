import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import Env from "@/env";

const tursoUrl = Env.TURSO_DATABASE_URL;
const tursoAuthToken = Env.TURSO_AUTH_TOKEN;

if (!tursoUrl || (!tursoUrl.startsWith("file:") && !tursoAuthToken)) {
  throw new Error(
    "Set TURSO_DATABASE_URL and, for a remote database, TURSO_AUTH_TOKEN.",
  );
}

export default defineConfig({
  out: "./db/migrations",
  schema: "./src/lib/db/schema/index.ts",
  casing: "snake_case",
  dialect: "turso",
  dbCredentials: {
    url: tursoUrl,
    authToken: tursoAuthToken,
  },
});
