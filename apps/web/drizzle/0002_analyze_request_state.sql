ALTER TABLE "analysis_requests" ADD COLUMN "status" text DEFAULT 'completed' NOT NULL;--> statement-breakpoint
ALTER TABLE "analysis_requests" ADD COLUMN "started_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "analysis_requests" ADD COLUMN "completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "analysis_requests" ADD COLUMN "failed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "analysis_requests" ADD COLUMN "error_code" text;--> statement-breakpoint
ALTER TABLE "analysis_requests" ADD COLUMN "error_category" text;--> statement-breakpoint
ALTER TABLE "analysis_requests" ADD COLUMN "result_id" uuid;--> statement-breakpoint
ALTER TABLE "analysis_requests" ADD COLUMN "last_heartbeat_at" timestamp with time zone;--> statement-breakpoint
UPDATE "analysis_requests"
SET
  "started_at" = COALESCE("started_at", "created_at"),
  "completed_at" = COALESCE("completed_at", "created_at"),
  "last_heartbeat_at" = COALESCE("last_heartbeat_at", "created_at")
WHERE "status" = 'completed';--> statement-breakpoint
ALTER TABLE "analysis_requests" ALTER COLUMN "status" SET DEFAULT 'created';--> statement-breakpoint
CREATE INDEX "analysis_requests_status_idx" ON "analysis_requests" USING btree ("status","created_at");
