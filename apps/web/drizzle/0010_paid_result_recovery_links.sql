CREATE TABLE "paid_result_recovery_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_slug" text NOT NULL,
	"analysis_result_id" uuid NOT NULL,
	"payment_intent_id" uuid,
	"entitlement_id" uuid NOT NULL,
	"recovery_contact_id" uuid,
	"token_hash" text NOT NULL,
	"purpose" text NOT NULL,
	"channel" text NOT NULL,
	"status" text DEFAULT 'created' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "paid_result_recovery_links_analysis_result_id_analysis_results_id_fk" FOREIGN KEY ("analysis_result_id") REFERENCES "public"."analysis_results"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "paid_result_recovery_links_payment_intent_id_payment_intents_id_fk" FOREIGN KEY ("payment_intent_id") REFERENCES "public"."payment_intents"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "paid_result_recovery_links_entitlement_id_entitlements_id_fk" FOREIGN KEY ("entitlement_id") REFERENCES "public"."entitlements"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "paid_result_recovery_links_recovery_contact_id_payment_recovery_contacts_id_fk" FOREIGN KEY ("recovery_contact_id") REFERENCES "public"."payment_recovery_contacts"("id") ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX "paid_result_recovery_links_token_hash_idx" ON "paid_result_recovery_links" USING btree ("token_hash");
--> statement-breakpoint
CREATE INDEX "paid_result_recovery_links_entitlement_idx" ON "paid_result_recovery_links" USING btree ("entitlement_id");
--> statement-breakpoint
CREATE INDEX "paid_result_recovery_links_contact_idx" ON "paid_result_recovery_links" USING btree ("recovery_contact_id");
--> statement-breakpoint
CREATE INDEX "paid_result_recovery_links_result_module_idx" ON "paid_result_recovery_links" USING btree ("analysis_result_id","module_slug");
--> statement-breakpoint
CREATE INDEX "paid_result_recovery_links_active_lookup_idx" ON "paid_result_recovery_links" USING btree ("status","expires_at");
