ALTER TABLE "analysis_requests" ADD COLUMN "user_context_json" jsonb;--> statement-breakpoint
CREATE TABLE "analysis_paid_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"analysis_result_id" uuid NOT NULL,
	"module_id" text NOT NULL,
	"theme_slug" text NOT NULL,
	"paid_result_json" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"requested_by_unlock_intent_id" uuid,
	"requested_reason" text,
	"prompt_version" text,
	"schema_version" text,
	"model" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"error_code" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"retention_expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analysis_paid_results" ADD CONSTRAINT "analysis_paid_results_analysis_result_id_analysis_results_id_fk" FOREIGN KEY ("analysis_result_id") REFERENCES "public"."analysis_results"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analysis_paid_results" ADD CONSTRAINT "analysis_paid_results_requested_by_unlock_intent_id_unlock_intents_id_fk" FOREIGN KEY ("requested_by_unlock_intent_id") REFERENCES "public"."unlock_intents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analysis_paid_results_result_idx" ON "analysis_paid_results" USING btree ("analysis_result_id");--> statement-breakpoint
CREATE INDEX "analysis_paid_results_unlock_intent_idx" ON "analysis_paid_results" USING btree ("requested_by_unlock_intent_id");--> statement-breakpoint
CREATE INDEX "analysis_paid_results_status_idx" ON "analysis_paid_results" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "analysis_paid_results_lookup_idx" ON "analysis_paid_results" USING btree ("module_id","theme_slug","status","retention_expires_at");
