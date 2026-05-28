CREATE TABLE "generation_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_type" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"priority" integer DEFAULT 50 NOT NULL,
	"module_slug" text NOT NULL,
	"input_ref_type" text NOT NULL,
	"input_ref_id" uuid NOT NULL,
	"output_ref_type" text,
	"output_ref_id" uuid,
	"trigger_source" text NOT NULL,
	"dedupe_key" text NOT NULL,
	"entitlement_ref_id" uuid,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"next_run_at" timestamp with time zone DEFAULT now() NOT NULL,
	"locked_at" timestamp with time zone,
	"locked_by" text,
	"last_error_category" text,
	"last_error_code" text,
	"last_error_at" timestamp with time zone,
	"model_provider" text,
	"model_name" text,
	"prompt_version" text,
	"schema_version" text,
	"source" text,
	"operator_test" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "generation_jobs_dedupe_key_idx" ON "generation_jobs" USING btree ("dedupe_key");
--> statement-breakpoint
CREATE INDEX "generation_jobs_status_next_run_idx" ON "generation_jobs" USING btree ("status","next_run_at");
--> statement-breakpoint
CREATE INDEX "generation_jobs_type_status_next_run_idx" ON "generation_jobs" USING btree ("job_type","status","next_run_at");
--> statement-breakpoint
CREATE INDEX "generation_jobs_input_ref_idx" ON "generation_jobs" USING btree ("input_ref_type","input_ref_id");
--> statement-breakpoint
CREATE INDEX "generation_jobs_output_ref_idx" ON "generation_jobs" USING btree ("output_ref_type","output_ref_id");
--> statement-breakpoint
CREATE INDEX "generation_jobs_module_created_idx" ON "generation_jobs" USING btree ("module_slug","created_at");
--> statement-breakpoint
CREATE INDEX "generation_jobs_trigger_created_idx" ON "generation_jobs" USING btree ("trigger_source","created_at");
