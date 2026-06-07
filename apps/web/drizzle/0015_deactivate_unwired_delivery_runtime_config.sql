WITH deactivated AS (
  UPDATE "runtime_config_values"
  SET
    "active" = false,
    "reason" = 'inactive_unwired_delivery_runtime_config_v0',
    "updated_by" = 'migration',
    "updated_at" = now()
  WHERE "key" IN ('delivery.line.enabled', 'delivery.email.enabled')
    AND "active" = true
  RETURNING
    "environment",
    "key",
    "scope_type",
    "scope_key",
    "value_json"
)
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
  "environment",
  "key",
  "scope_type",
  "scope_key",
  'deactivate',
  "value_json",
  "value_json",
  'inactive_unwired_delivery_runtime_config_v0',
  'migration'
FROM deactivated;
