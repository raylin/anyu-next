CREATE TABLE "payment_intents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"provider_environment" text DEFAULT 'unknown' NOT NULL,
	"merchant_order_no" text NOT NULL,
	"module_slug" text NOT NULL,
	"analysis_request_id" uuid NOT NULL,
	"analysis_result_id" uuid NOT NULL,
	"unlock_intent_id" uuid,
	"amount_minor" integer NOT NULL,
	"currency" text DEFAULT 'TWD' NOT NULL,
	"status" text DEFAULT 'created' NOT NULL,
	"provider_status" text,
	"provider_trade_no" text,
	"provider_payment_type" text,
	"provider_response_code" text,
	"provider_message_category" text,
	"checkout_started_at" timestamp with time zone,
	"notify_received_at" timestamp with time zone,
	"return_received_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"expired_at" timestamp with time zone,
	"refund_requested_at" timestamp with time zone,
	"refunded_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_intents_analysis_request_id_analysis_requests_id_fk" FOREIGN KEY ("analysis_request_id") REFERENCES "public"."analysis_requests"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "payment_intents_analysis_result_id_analysis_results_id_fk" FOREIGN KEY ("analysis_result_id") REFERENCES "public"."analysis_results"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "payment_intents_unlock_intent_id_unlock_intents_id_fk" FOREIGN KEY ("unlock_intent_id") REFERENCES "public"."unlock_intents"("id") ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE "entitlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entitlement_type" text NOT NULL,
	"source" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"module_slug" text NOT NULL,
	"analysis_request_id" uuid NOT NULL,
	"analysis_result_id" uuid NOT NULL,
	"payment_intent_id" uuid,
	"unlock_intent_id" uuid,
	"generation_job_id" uuid,
	"line_user_ref" text,
	"paid_access_token_hash" text,
	"paid_access_token_expires_at" timestamp with time zone,
	"paid_access_token_last_used_at" timestamp with time zone,
	"paid_access_token_last_rotated_at" timestamp with time zone,
	"remaining_uses" integer,
	"expires_at" timestamp with time zone,
	"activated_at" timestamp with time zone,
	"consumed_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"refunded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "entitlements_analysis_request_id_analysis_requests_id_fk" FOREIGN KEY ("analysis_request_id") REFERENCES "public"."analysis_requests"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "entitlements_analysis_result_id_analysis_results_id_fk" FOREIGN KEY ("analysis_result_id") REFERENCES "public"."analysis_results"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "entitlements_payment_intent_id_payment_intents_id_fk" FOREIGN KEY ("payment_intent_id") REFERENCES "public"."payment_intents"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "entitlements_unlock_intent_id_unlock_intents_id_fk" FOREIGN KEY ("unlock_intent_id") REFERENCES "public"."unlock_intents"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "entitlements_generation_job_id_generation_jobs_id_fk" FOREIGN KEY ("generation_job_id") REFERENCES "public"."generation_jobs"("id") ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX "payment_intents_merchant_order_no_idx" ON "payment_intents" USING btree ("merchant_order_no");
--> statement-breakpoint
CREATE INDEX "payment_intents_provider_trade_idx" ON "payment_intents" USING btree ("provider","provider_trade_no");
--> statement-breakpoint
CREATE INDEX "payment_intents_result_idx" ON "payment_intents" USING btree ("analysis_result_id");
--> statement-breakpoint
CREATE INDEX "payment_intents_status_created_idx" ON "payment_intents" USING btree ("status","created_at");
--> statement-breakpoint
CREATE INDEX "payment_intents_module_created_idx" ON "payment_intents" USING btree ("module_slug","created_at");
--> statement-breakpoint
CREATE UNIQUE INDEX "entitlements_paid_access_token_hash_idx" ON "entitlements" USING btree ("paid_access_token_hash") WHERE "paid_access_token_hash" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX "entitlements_payment_intent_idx" ON "entitlements" USING btree ("payment_intent_id");
--> statement-breakpoint
CREATE INDEX "entitlements_result_idx" ON "entitlements" USING btree ("analysis_result_id");
--> statement-breakpoint
CREATE INDEX "entitlements_module_status_idx" ON "entitlements" USING btree ("module_slug","status");
--> statement-breakpoint
CREATE INDEX "entitlements_expires_at_idx" ON "entitlements" USING btree ("expires_at");
