import { boolean, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  moduleId: text("module_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id"),
  eventName: text("event_name").notNull(),
  moduleId: text("module_id").notNull(),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const analysisResults = pgTable("analysis_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  moduleId: text("module_id").notNull(),
  sessionId: uuid("session_id"),
  status: text("status").notNull().default("placeholder"),
  inputSummary: text("input_summary"),
  resultPayload: jsonb("result_payload"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const unlockIntents = pgTable("unlock_intents", {
  id: uuid("id").defaultRandom().primaryKey(),
  moduleId: text("module_id").notNull(),
  sessionId: uuid("session_id"),
  priceLabel: text("price_label"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  moduleId: text("module_id").notNull(),
  channel: text("channel").notNull(),
  value: text("value").notNull(),
  consent: boolean("consent").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
