# Recovery worker production correction

The first deployed health run failed with PostgreSQL 42501. The canonical
`growth_company_milestones` view uses SECURITY INVOKER and references two
protected event ledgers. Table-only SQL fixtures had hidden their permissions.

Migration source `20260914231237_tryops_growth_milestone_read_permissions.sql`
grants service-role SELECT on only six referenced columns. Production applied
it as ledger `20260914231519`, 699 bytes, SHA256
`2e898c6b7a72af1ea8c891567f374783c52cf6da392b5edf0cac64d842c5427e`.
It grants no table-level SELECT, writes, snapshots, actor/task identifiers or
browser access. RLS and the canonical view's definition/authority are unchanged.

## Verification

- Local PostgreSQL 17.11/PostgREST 16.2 reproduced both missing dependencies as
  actual service-role HTTP 42501 failures, then passed using the exact migration.
- A connected source-module acceptance journey passed assignment/exposure,
  actual company creation/trial initialization, Web attachment/replay,
  postresponse staging recovery, reconciliation, notification retry and dedupe.
  External identity and business records were isolated local fixtures.
- `tests/sql/growth-milestone-permissions.sql` is a portable read-only regression
  for a database with the canonical growth view and both TryOps migrations.
  PM executed it successfully against production after repair. It asserts
  exact column privileges, all other column/DML/browser denials, RLS and a real
  service-role view query. It returns no business records.
- The deployed TryOps worker retried at 23:15:54 UTC on September 14, returned
  HTTP 200 and persisted `no_experiment` / `reconciled` at 23:15:55 UTC.
- The original failure's real in-app alert was delivered exactly once by the
  deployed Web worker. Exact recipient eligibility and dismissal semantics
  passed readback. No duplicate alert appeared after recovery.

No experiment, campaign, account, model call or payment was created. A live
customer's attributed trial and measured conversion lift require real eligible
traffic; synthetic acceptance is never counted as that evidence.
