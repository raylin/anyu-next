DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'payment_recovery_contact_secrets'
      AND c.relkind IN ('v', 'm')
  ) THEN
    DROP VIEW public.payment_recovery_contact_secrets;
  END IF;
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'paid_result_recovery_links'
      AND c.relkind IN ('v', 'm')
  ) THEN
    DROP VIEW public.paid_result_recovery_links;
  END IF;
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'payment_recovery_contacts'
      AND c.relkind IN ('v', 'm')
  ) THEN
    DROP VIEW public.payment_recovery_contacts;
  END IF;
END $$;
--> statement-breakpoint
DO $$
DECLARE
  reset_tables text[];
BEGIN
  SELECT array_agg(format('%I.%I', schemaname, tablename))
  INTO reset_tables
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN (
      'paid_result_recovery_links',
      'payment_recovery_contact_secrets',
      'payment_recovery_contacts',
      'paid_result_access_links',
      'payment_access_link_contact_secrets',
      'payment_access_link_contacts'
    );

  IF reset_tables IS NOT NULL THEN
    EXECUTE 'TRUNCATE TABLE ' || array_to_string(reset_tables, ', ') || ' CASCADE';
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF to_regclass('public.payment_access_link_contacts') IS NULL
    AND EXISTS (
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = 'payment_recovery_contacts'
        AND c.relkind = 'r'
    )
  THEN
    ALTER TABLE public.payment_recovery_contacts RENAME TO payment_access_link_contacts;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF to_regclass('public.paid_result_access_links') IS NULL
    AND EXISTS (
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = 'paid_result_recovery_links'
        AND c.relkind = 'r'
    )
  THEN
    ALTER TABLE public.paid_result_recovery_links RENAME TO paid_result_access_links;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF to_regclass('public.payment_access_link_contact_secrets') IS NULL
    AND EXISTS (
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = 'payment_recovery_contact_secrets'
        AND c.relkind = 'r'
    )
  THEN
    ALTER TABLE public.payment_recovery_contact_secrets RENAME TO payment_access_link_contact_secrets;
  END IF;
END $$;
--> statement-breakpoint
ALTER INDEX IF EXISTS payment_recovery_contacts_result_idx RENAME TO payment_access_link_contacts_result_idx;
--> statement-breakpoint
ALTER INDEX IF EXISTS payment_recovery_contacts_payment_intent_idx RENAME TO payment_access_link_contacts_payment_intent_idx;
--> statement-breakpoint
ALTER INDEX IF EXISTS payment_recovery_contacts_entitlement_idx RENAME TO payment_access_link_contacts_entitlement_idx;
--> statement-breakpoint
ALTER INDEX IF EXISTS payment_recovery_contacts_contact_lookup_idx RENAME TO payment_access_link_contacts_contact_lookup_idx;
--> statement-breakpoint
ALTER INDEX IF EXISTS payment_recovery_contacts_result_contact_active_idx RENAME TO payment_access_link_contacts_result_contact_active_idx;
--> statement-breakpoint
ALTER INDEX IF EXISTS payment_recovery_contacts_payment_contact_active_idx RENAME TO payment_access_link_contacts_payment_contact_active_idx;
--> statement-breakpoint
ALTER INDEX IF EXISTS paid_result_recovery_links_token_hash_idx RENAME TO paid_result_access_links_token_hash_idx;
--> statement-breakpoint
ALTER INDEX IF EXISTS paid_result_recovery_links_entitlement_idx RENAME TO paid_result_access_links_entitlement_idx;
--> statement-breakpoint
ALTER INDEX IF EXISTS paid_result_recovery_links_contact_idx RENAME TO paid_result_access_links_contact_idx;
--> statement-breakpoint
ALTER INDEX IF EXISTS paid_result_recovery_links_result_module_idx RENAME TO paid_result_access_links_result_module_idx;
--> statement-breakpoint
ALTER INDEX IF EXISTS paid_result_recovery_links_active_lookup_idx RENAME TO paid_result_access_links_active_lookup_idx;
--> statement-breakpoint
ALTER INDEX IF EXISTS payment_recovery_contact_secrets_contact_idx RENAME TO payment_access_link_contact_secrets_contact_idx;
--> statement-breakpoint
ALTER INDEX IF EXISTS payment_recovery_contact_secrets_recipient_lookup_idx RENAME TO payment_access_link_contact_secrets_recipient_lookup_idx;
--> statement-breakpoint
ALTER INDEX IF EXISTS payment_recovery_contact_secrets_active_contact_idx RENAME TO payment_access_link_contact_secrets_active_contact_idx;
--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payment_recovery_contacts_analysis_result_id_analysis_results_id_fk'
      AND conrelid = 'public.payment_access_link_contacts'::regclass
  ) THEN
    ALTER TABLE public.payment_access_link_contacts
      RENAME CONSTRAINT payment_recovery_contacts_analysis_result_id_analysis_results_id_fk
      TO payment_access_link_contacts_analysis_result_id_analysis_results_id_fk;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payment_recovery_contacts_payment_intent_id_payment_intents_id_fk'
      AND conrelid = 'public.payment_access_link_contacts'::regclass
  ) THEN
    ALTER TABLE public.payment_access_link_contacts
      RENAME CONSTRAINT payment_recovery_contacts_payment_intent_id_payment_intents_id_fk
      TO payment_access_link_contacts_payment_intent_id_payment_intents_id_fk;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payment_recovery_contacts_entitlement_id_entitlements_id_fk'
      AND conrelid = 'public.payment_access_link_contacts'::regclass
  ) THEN
    ALTER TABLE public.payment_access_link_contacts
      RENAME CONSTRAINT payment_recovery_contacts_entitlement_id_entitlements_id_fk
      TO payment_access_link_contacts_entitlement_id_entitlements_id_fk;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'paid_result_recovery_links_analysis_result_id_analysis_results_id_fk'
      AND conrelid = 'public.paid_result_access_links'::regclass
  ) THEN
    ALTER TABLE public.paid_result_access_links
      RENAME CONSTRAINT paid_result_recovery_links_analysis_result_id_analysis_results_id_fk
      TO paid_result_access_links_analysis_result_id_analysis_results_id_fk;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'paid_result_recovery_links_payment_intent_id_payment_intents_id_fk'
      AND conrelid = 'public.paid_result_access_links'::regclass
  ) THEN
    ALTER TABLE public.paid_result_access_links
      RENAME CONSTRAINT paid_result_recovery_links_payment_intent_id_payment_intents_id_fk
      TO paid_result_access_links_payment_intent_id_payment_intents_id_fk;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'paid_result_recovery_links_entitlement_id_entitlements_id_fk'
      AND conrelid = 'public.paid_result_access_links'::regclass
  ) THEN
    ALTER TABLE public.paid_result_access_links
      RENAME CONSTRAINT paid_result_recovery_links_entitlement_id_entitlements_id_fk
      TO paid_result_access_links_entitlement_id_entitlements_id_fk;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'paid_result_recovery_links_recovery_contact_id_payment_recovery_contacts_id_fk'
      AND conrelid = 'public.paid_result_access_links'::regclass
  ) THEN
    ALTER TABLE public.paid_result_access_links
      RENAME CONSTRAINT paid_result_recovery_links_recovery_contact_id_payment_recovery_contacts_id_fk
      TO paid_result_access_links_recovery_contact_id_payment_access_link_contacts_id_fk;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payment_recovery_contact_secrets_recovery_contact_id_payment_recovery_contacts_id_fk'
      AND conrelid = 'public.payment_access_link_contact_secrets'::regclass
  ) THEN
    ALTER TABLE public.payment_access_link_contact_secrets
      RENAME CONSTRAINT payment_recovery_contact_secrets_recovery_contact_id_payment_recovery_contacts_id_fk
      TO payment_access_link_contact_secrets_recovery_contact_id_payment_access_link_contacts_id_fk;
  END IF;
  ALTER TABLE public.payment_access_link_contact_secrets
    DROP CONSTRAINT IF EXISTS payment_recovery_contact_secrets_purpose_check,
    DROP CONSTRAINT IF EXISTS payment_access_link_contact_secrets_purpose_check;
  ALTER TABLE public.payment_access_link_contact_secrets
    ADD CONSTRAINT payment_access_link_contact_secrets_purpose_check
    CHECK (purpose IN ('access_link_delivery'));
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payment_recovery_contact_secrets_channel_check'
      AND conrelid = 'public.payment_access_link_contact_secrets'::regclass
  ) THEN
    ALTER TABLE public.payment_access_link_contact_secrets
      RENAME CONSTRAINT payment_recovery_contact_secrets_channel_check
      TO payment_access_link_contact_secrets_channel_check;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payment_recovery_contact_secrets_status_check'
      AND conrelid = 'public.payment_access_link_contact_secrets'::regclass
  ) THEN
    ALTER TABLE public.payment_access_link_contact_secrets
      RENAME CONSTRAINT payment_recovery_contact_secrets_status_check
      TO payment_access_link_contact_secrets_status_check;
  END IF;
END $$;
