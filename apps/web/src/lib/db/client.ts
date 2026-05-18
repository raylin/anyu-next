import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/lib/db/schema";

export type AppDatabase = NeonHttpDatabase<typeof schema>;

export function getDb(): AppDatabase | null {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return null;
  }

  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}
