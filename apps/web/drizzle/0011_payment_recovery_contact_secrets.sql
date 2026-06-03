CREATE TABLE "payment_recovery_contact_secrets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recovery_contact_id" uuid NOT NULL,
	"channel" text NOT NULL,
	"purpose" text NOT NULL,
	"recipient_hash" text NOT NULL,
	"encrypted_recipient" text NOT NULL,
	"key_version" text DEFAULT 'v1' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"failure_category" text,
	"last_used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_recovery_contact_secrets_recovery_contact_id_payment_recovery_contacts_id_fk" FOREIGN KEY ("recovery_contact_id") REFERENCES "public"."payment_recovery_contacts"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "payment_recovery_contact_secrets_channel_check" CHECK ("channel" IN ('line')),
	CONSTRAINT "payment_recovery_contact_secrets_purpose_check" CHECK ("purpose" IN ('recovery_link_delivery')),
	CONSTRAINT "payment_recovery_contact_secrets_status_check" CHECK ("status" IN ('active','revoked','failed'))
);
--> statement-breakpoint
CREATE INDEX "payment_recovery_contact_secrets_contact_idx" ON "payment_recovery_contact_secrets" USING btree ("recovery_contact_id");
--> statement-breakpoint
CREATE INDEX "payment_recovery_contact_secrets_recipient_lookup_idx" ON "payment_recovery_contact_secrets" USING btree ("channel","purpose","recipient_hash");
--> statement-breakpoint
CREATE UNIQUE INDEX "payment_recovery_contact_secrets_active_contact_idx" ON "payment_recovery_contact_secrets" USING btree ("recovery_contact_id","channel","purpose") WHERE ("status" = 'active');
