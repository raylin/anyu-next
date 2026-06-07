CREATE TABLE IF NOT EXISTS "runtime_config_values" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "environment" text NOT NULL,
  "key" text NOT NULL,
  "scope_type" text NOT NULL,
  "scope_key" text NOT NULL,
  "value_type" text NOT NULL,
  "value_json" jsonb NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "reason" text NOT NULL,
  "updated_by" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "runtime_config_values_identity_idx"
  ON "runtime_config_values" ("environment", "key", "scope_type", "scope_key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "runtime_config_values_environment_idx"
  ON "runtime_config_values" ("environment");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "runtime_config_values_key_scope_idx"
  ON "runtime_config_values" ("key", "scope_type", "scope_key");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "runtime_config_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "environment" text NOT NULL,
  "key" text NOT NULL,
  "scope_type" text NOT NULL,
  "scope_key" text NOT NULL,
  "action" text NOT NULL,
  "value_before_json" jsonb,
  "value_after_json" jsonb,
  "reason" text NOT NULL,
  "actor" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "runtime_config_events_identity_created_idx"
  ON "runtime_config_events" ("environment", "key", "scope_type", "scope_key", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "runtime_config_events_action_idx"
  ON "runtime_config_events" ("action", "created_at");
--> statement-breakpoint
INSERT INTO "runtime_config_values" (
  "environment",
  "key",
  "scope_type",
  "scope_key",
  "value_type",
  "value_json",
  "active",
  "reason",
  "updated_by"
)
VALUES
  ('production', 'payment.window.enabled', 'module', 'ai-temperature', 'boolean', 'false'::jsonb, true, 'baseline_seed_scoped_runtime_config_v0', 'migration'),
  ('staging', 'payment.window.enabled', 'module', 'ai-temperature', 'boolean', 'true'::jsonb, true, 'baseline_seed_scoped_runtime_config_v0', 'migration'),
  ('production', 'payment.global.disabled', 'global', 'global', 'boolean', 'false'::jsonb, true, 'baseline_seed_scoped_runtime_config_v0', 'migration'),
  ('staging', 'payment.global.disabled', 'global', 'global', 'boolean', 'false'::jsonb, true, 'baseline_seed_scoped_runtime_config_v0', 'migration'),
  ('production', 'delivery.line.enabled', 'global', 'global', 'boolean', 'true'::jsonb, true, 'baseline_seed_scoped_runtime_config_v0', 'migration'),
  ('staging', 'delivery.line.enabled', 'global', 'global', 'boolean', 'true'::jsonb, true, 'baseline_seed_scoped_runtime_config_v0', 'migration'),
  ('production', 'delivery.line.enabled', 'module', 'ai-temperature', 'boolean', 'true'::jsonb, true, 'baseline_seed_scoped_runtime_config_v0', 'migration'),
  ('staging', 'delivery.line.enabled', 'module', 'ai-temperature', 'boolean', 'true'::jsonb, true, 'baseline_seed_scoped_runtime_config_v0', 'migration'),
  ('production', 'delivery.email.enabled', 'global', 'global', 'boolean', 'true'::jsonb, true, 'baseline_seed_scoped_runtime_config_v0', 'migration'),
  ('staging', 'delivery.email.enabled', 'global', 'global', 'boolean', 'true'::jsonb, true, 'baseline_seed_scoped_runtime_config_v0', 'migration'),
  ('production', 'delivery.email.enabled', 'module', 'ai-temperature', 'boolean', 'true'::jsonb, true, 'baseline_seed_scoped_runtime_config_v0', 'migration'),
  ('staging', 'delivery.email.enabled', 'module', 'ai-temperature', 'boolean', 'true'::jsonb, true, 'baseline_seed_scoped_runtime_config_v0', 'migration')
ON CONFLICT ("environment", "key", "scope_type", "scope_key") DO NOTHING;
--> statement-breakpoint
INSERT INTO "runtime_config_events" (
  "environment",
  "key",
  "scope_type",
  "scope_key",
  "action",
  "value_before_json",
  "value_after_json",
  "reason",
  "actor"
)
SELECT
  values_seed.environment,
  values_seed.key,
  values_seed.scope_type,
  values_seed.scope_key,
  'set',
  NULL::jsonb,
  values_seed.value_json,
  'baseline_seed_scoped_runtime_config_v0',
  'migration'
FROM (
  VALUES
    ('production', 'payment.window.enabled', 'module', 'ai-temperature', 'false'::jsonb),
    ('staging', 'payment.window.enabled', 'module', 'ai-temperature', 'true'::jsonb),
    ('production', 'payment.global.disabled', 'global', 'global', 'false'::jsonb),
    ('staging', 'payment.global.disabled', 'global', 'global', 'false'::jsonb),
    ('production', 'delivery.line.enabled', 'global', 'global', 'true'::jsonb),
    ('staging', 'delivery.line.enabled', 'global', 'global', 'true'::jsonb),
    ('production', 'delivery.line.enabled', 'module', 'ai-temperature', 'true'::jsonb),
    ('staging', 'delivery.line.enabled', 'module', 'ai-temperature', 'true'::jsonb),
    ('production', 'delivery.email.enabled', 'global', 'global', 'true'::jsonb),
    ('staging', 'delivery.email.enabled', 'global', 'global', 'true'::jsonb),
    ('production', 'delivery.email.enabled', 'module', 'ai-temperature', 'true'::jsonb),
    ('staging', 'delivery.email.enabled', 'module', 'ai-temperature', 'true'::jsonb)
) AS values_seed(environment, key, scope_type, scope_key, value_json)
WHERE NOT EXISTS (
  SELECT 1
  FROM "runtime_config_events" existing
  WHERE existing.environment = values_seed.environment
    AND existing.key = values_seed.key
    AND existing.scope_type = values_seed.scope_type
    AND existing.scope_key = values_seed.scope_key
    AND existing.reason = 'baseline_seed_scoped_runtime_config_v0'
    AND existing.actor = 'migration'
);
