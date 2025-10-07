import { z } from "zod";
import { parseEnv } from "./lib/try-parse-env";

const EnvSchema = z.object({
  TURSO_DATABASE_URL: z.url(),
  TURSO_AUTH_TOKEN: z.string(),
});

export type EnvSchema = z.infer<typeof EnvSchema>;

parseEnv(EnvSchema);

export default EnvSchema.parse(process.env);
