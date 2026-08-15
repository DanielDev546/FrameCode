import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { env } from "$env/dynamic/private";
import * as schema from "./schema.js";

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured");
}

const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql, {
  schema,
});
