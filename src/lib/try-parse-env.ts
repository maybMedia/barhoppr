import { ZodError, type ZodObject, type ZodRawShape } from "zod";

/**
 * Parses and validates environment variables using a Zod schema.
 * 
 * Throws a descriptive error if required environment variables are missing or invalid.
 */
export function parseEnv<T extends ZodRawShape>(
  schema: ZodObject<T>,
  buildEnv: Record<string, string | undefined> = process.env,
) {
  try {
    return schema.parse(buildEnv);
  } catch (error) {
    if (error instanceof ZodError) {
      const missing = error.issues.map((issue) => `- ${issue.path.join(".")}`).join("\n");
      console.error("\x1b[31m%s\x1b[0m", "❌ Invalid or missing environment variables:\n" + missing);
      process.exit(1);
    }
    throw error;
  }
}
