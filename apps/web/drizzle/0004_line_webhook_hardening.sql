CREATE TABLE "line_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dedupe_key" text NOT NULL,
	"event_type" text NOT NULL,
	"status" text DEFAULT 'processing' NOT NULL,
	"error_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE UNIQUE INDEX "line_webhook_events_dedupe_key_idx" ON "line_webhook_events" USING btree ("dedupe_key");
--> statement-breakpoint
CREATE INDEX "line_webhook_events_status_idx" ON "line_webhook_events" USING btree ("status","created_at");
--> statement-breakpoint
CREATE TABLE "line_webhook_rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"line_user_id_hash" text NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"invalid_attempt_count" integer DEFAULT 1 NOT NULL,
	"last_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "line_webhook_rate_limits_user_idx" ON "line_webhook_rate_limits" USING btree ("line_user_id_hash");
--> statement-breakpoint
CREATE INDEX "line_webhook_rate_limits_window_idx" ON "line_webhook_rate_limits" USING btree ("window_start","invalid_attempt_count");
