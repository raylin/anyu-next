CREATE TABLE "payment_recovery_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_slug" text NOT NULL,
	"analysis_result_id" uuid NOT NULL,
	"payment_intent_id" uuid,
	"entitlement_id" uuid,
	"contact_type" text NOT NULL,
	"contact_hash" text NOT NULL,
	"contact_encrypted" text,
	"line_user_hash" text,
	"email_hash" text,
	"transactional_consent_at" timestamp with time zone NOT NULL,
	"marketing_opt_in_at" timestamp with time zone,
	"source" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"last_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_recovery_contacts_analysis_result_id_analysis_results_id_fk" FOREIGN KEY ("analysis_result_id") REFERENCES "public"."analysis_results"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "payment_recovery_contacts_payment_intent_id_payment_intents_id_fk" FOREIGN KEY ("payment_intent_id") REFERENCES "public"."payment_intents"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "payment_recovery_contacts_entitlement_id_entitlements_id_fk" FOREIGN KEY ("entitlement_id") REFERENCES "public"."entitlements"("id") ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX "payment_recovery_contacts_result_idx" ON "payment_recovery_contacts" USING btree ("analysis_result_id");
--> statement-breakpoint
CREATE INDEX "payment_recovery_contacts_payment_intent_idx" ON "payment_recovery_contacts" USING btree ("payment_intent_id");
--> statement-breakpoint
CREATE INDEX "payment_recovery_contacts_entitlement_idx" ON "payment_recovery_contacts" USING btree ("entitlement_id");
--> statement-breakpoint
CREATE INDEX "payment_recovery_contacts_contact_lookup_idx" ON "payment_recovery_contacts" USING btree ("contact_type","contact_hash");
--> statement-breakpoint
CREATE UNIQUE INDEX "payment_recovery_contacts_result_contact_active_idx" ON "payment_recovery_contacts" USING btree ("analysis_result_id","contact_type","contact_hash") WHERE ("status" <> 'revoked');
--> statement-breakpoint
CREATE UNIQUE INDEX "payment_recovery_contacts_payment_contact_active_idx" ON "payment_recovery_contacts" USING btree ("payment_intent_id","contact_type","contact_hash") WHERE (("payment_intent_id" IS NOT NULL) AND ("status" <> 'revoked'));
