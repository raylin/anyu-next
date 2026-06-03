ALTER TABLE "paid_result_recovery_links" ADD COLUMN "provider_message_id" text;
--> statement-breakpoint
ALTER TABLE "paid_result_recovery_links" ADD COLUMN "last_send_attempt_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "paid_result_recovery_links" ADD COLUMN "send_attempt_count" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "paid_result_recovery_links" ADD COLUMN "last_failure_category" text;
--> statement-breakpoint
ALTER TABLE "paid_result_recovery_links" ADD COLUMN "last_provider_status" text;
