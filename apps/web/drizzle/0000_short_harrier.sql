CREATE TABLE "analysis_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" text NOT NULL,
	"theme_slug" text NOT NULL,
	"experiment_id" text NOT NULL,
	"prompt_version" text NOT NULL,
	"schema_version" text NOT NULL,
	"anonymous_session_id" text,
	"situation_type" text,
	"input_char_count" integer NOT NULL,
	"raw_input_redacted" text,
	"privacy_flags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"retention_expires_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analysis_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"module_id" text NOT NULL,
	"theme_slug" text NOT NULL,
	"experiment_id" text NOT NULL,
	"visual_variant" text NOT NULL,
	"prompt_version" text NOT NULL,
	"schema_version" text NOT NULL,
	"score" integer,
	"score_bucket" text,
	"state_label" text,
	"normalized_result_json" jsonb NOT NULL,
	"provider" text,
	"provider_model" text,
	"provider_raw_json" jsonb,
	"retention_expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"result_id" uuid,
	"unlock_intent_id" uuid,
	"module_id" text NOT NULL,
	"theme_slug" text NOT NULL,
	"anonymous_session_id" text,
	"email" text,
	"line_id" text,
	"consent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_name" text NOT NULL,
	"module_id" text NOT NULL,
	"theme_slug" text NOT NULL,
	"experiment_id" text NOT NULL,
	"visual_variant" text NOT NULL,
	"prompt_version" text NOT NULL,
	"schema_version" text NOT NULL,
	"situation_type" text,
	"score_bucket" text,
	"anonymous_session_id" text,
	"metadata_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"anonymous_session_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unlock_intents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"result_id" uuid NOT NULL,
	"module_id" text NOT NULL,
	"theme_slug" text NOT NULL,
	"anonymous_session_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analysis_results" ADD CONSTRAINT "analysis_results_request_id_analysis_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."analysis_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_result_id_analysis_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."analysis_results"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_unlock_intent_id_unlock_intents_id_fk" FOREIGN KEY ("unlock_intent_id") REFERENCES "public"."unlock_intents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unlock_intents" ADD CONSTRAINT "unlock_intents_result_id_analysis_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."analysis_results"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analysis_requests_module_idx" ON "analysis_requests" USING btree ("module_id","theme_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "analysis_results_request_id_idx" ON "analysis_results" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "analysis_results_module_idx" ON "analysis_results" USING btree ("module_id","theme_slug");--> statement-breakpoint
CREATE INDEX "contact_submissions_result_idx" ON "contact_submissions" USING btree ("result_id");--> statement-breakpoint
CREATE INDEX "contact_submissions_unlock_idx" ON "contact_submissions" USING btree ("unlock_intent_id");--> statement-breakpoint
CREATE INDEX "events_event_name_idx" ON "events" USING btree ("event_name");--> statement-breakpoint
CREATE INDEX "events_module_theme_idx" ON "events" USING btree ("module_id","theme_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_anonymous_session_id_idx" ON "sessions" USING btree ("anonymous_session_id");--> statement-breakpoint
CREATE INDEX "unlock_intents_result_id_idx" ON "unlock_intents" USING btree ("result_id");