ALTER TABLE "unlock_intents" ADD COLUMN "fulfillment_code_hash" text;--> statement-breakpoint
ALTER TABLE "unlock_intents" ADD COLUMN "fulfillment_token" text;--> statement-breakpoint
ALTER TABLE "unlock_intents" ADD COLUMN "fulfillment_token_hash" text;--> statement-breakpoint
ALTER TABLE "unlock_intents" ADD COLUMN "fulfillment_status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "unlock_intents" ADD COLUMN "fulfillment_channel" text;--> statement-breakpoint
ALTER TABLE "unlock_intents" ADD COLUMN "line_user_id" text;--> statement-breakpoint
ALTER TABLE "unlock_intents" ADD COLUMN "line_bound_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "unlock_intents" ADD COLUMN "fulfilled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "unlock_intents" ADD COLUMN "fulfillment_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "unlock_intents" ADD COLUMN "unlock_token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "unlock_intents" ADD COLUMN "delivery_attempt_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "unlock_intents" ADD COLUMN "last_delivery_error" text;--> statement-breakpoint
ALTER TABLE "unlock_intents" ADD COLUMN "last_delivery_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "unlock_intents_fulfillment_code_hash_idx" ON "unlock_intents" USING btree ("fulfillment_code_hash");--> statement-breakpoint
CREATE INDEX "unlock_intents_fulfillment_token_hash_idx" ON "unlock_intents" USING btree ("fulfillment_token_hash");--> statement-breakpoint
CREATE INDEX "unlock_intents_fulfillment_status_idx" ON "unlock_intents" USING btree ("fulfillment_status","fulfillment_expires_at");
