import type { Config } from "drizzle-kit";
 
export default {
  schema: "./app/(server)/_schema/",
  out: "./migrations",
} satisfies Config;