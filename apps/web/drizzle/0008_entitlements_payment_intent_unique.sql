CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "entitlements_payment_intent_unique_idx" ON "entitlements" USING btree ("payment_intent_id") WHERE "payment_intent_id" IS NOT NULL;--> statement-breakpoint
DROP INDEX CONCURRENTLY IF EXISTS "entitlements_payment_intent_idx";
