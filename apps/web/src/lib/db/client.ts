import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/lib/db/schema";

export type AppDatabase = NeonHttpDatabase<typeof schema>;

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb(): AppDatabase | null {
  if (!isDbConfigured()) {
    return null;
  }

  const sql = neon(process.env.DATABASE_URL as string);
  return drizzle(sql, { schema });
}

export function requireDb(): AppDatabase {
  const db = getDb();

  if (!db) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return db;
}
