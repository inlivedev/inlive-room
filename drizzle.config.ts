import type { Config } from "drizzle-kit";
 
export default {
  schema: "./app/(server)/_features/**/schema.ts",
  out: "./migrations",
} satisfies Config;

