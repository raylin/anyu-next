# Drizzle Migration Practice

Runtime schema is managed by checked-in SQL migrations under `apps/web/drizzle/`.

## Current Practice

- `apps/web/src/lib/db/schema.ts` defines the application schema.
- `apps/web/drizzle/*.sql` contains ordered migration SQL.
- `apps/web/drizzle/meta/_journal.json` must include every checked-in SQL migration tag so future agents can reason from the repo.
- Snapshot JSON files may lag older hand-authored SQL migrations; when that happens, this file and the journal are the source-of-truth for migration ordering.

## Runtime Config

- `0014_runtime_config.sql` creates `runtime_config_values` and `runtime_config_events`, then seeds active payment runtime config baselines only.
- `0015_deactivate_unwired_delivery_runtime_config.sql` deactivates prior delivery runtime config rows if they exist from an earlier seed. Delivery keys are not active v0 controls until sender code reads them.

## Verification

To verify schema presence without printing private data:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('runtime_config_values', 'runtime_config_events');
```

To verify active v0 keys:

```sql
select key, scope_type, scope_key, active
from runtime_config_values
where key in ('payment.window.enabled', 'payment.global.disabled');
```

