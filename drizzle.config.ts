import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import Env from '@/env';

const tursoUrl = Env.TURSO_DATABASE_URL;
const tursoAuthToken = Env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoAuthToken) {
  throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in environment variables.');
}

export default defineConfig({
  out: './db/migrations',
  schema: './src/lib/db/schema/index.ts',
  casing: "snake_case",
  dialect: "turso",
  dbCredentials: {
    url: tursoUrl,
    authToken: tursoAuthToken,
  },
});
