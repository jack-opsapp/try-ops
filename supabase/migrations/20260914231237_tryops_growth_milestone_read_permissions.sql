-- growth_company_milestones is a SECURITY INVOKER view. Its callers need
-- access to each referenced source column, even when selecting only activation
-- and paid timestamps. Recovery previously failed with SQLSTATE 42501.
-- Grant only the event facts used by that canonical view. Do not grant table
-- SELECT, snapshots, actor/task identifiers, queue state, or any write access.
-- RLS, browser revokes, immutable-proof triggers and view authority are unchanged.
begin;

grant select (company_id, event_type, created_at)
  on public.task_mutation_events to service_role;

grant select (company_id, new_status, requested_at)
  on public.project_status_lifecycle_outbox to service_role;

commit;
