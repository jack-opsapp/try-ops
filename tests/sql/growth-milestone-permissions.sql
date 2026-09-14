-- Read-only regression against a database with the canonical growth view and
-- both TryOps migrations installed. The old table-only fixture cannot prove
-- SECURITY INVOKER dependency permissions. Run with psql -v ON_ERROR_STOP=1.
\set ON_ERROR_STOP on
begin read only;
set local statement_timeout = '5s';

do $$
declare source record; col record; caller text; privilege text;
begin
  if not exists (
    select 1 from pg_class
    where oid = 'public.growth_company_milestones'::regclass
      and relkind = 'v' and reloptions @> array['security_invoker=true']
  ) then
    raise exception 'Canonical SECURITY INVOKER growth view required';
  end if;

  for source in select * from (values
    ('task_mutation_events', array['company_id','event_type','created_at']),
    ('project_status_lifecycle_outbox', array['company_id','new_status','requested_at'])
  ) as sources(name, allowed_columns) loop
    if not (select relrowsecurity from pg_class
      where oid = format('public.%I', source.name)::regclass) then
      raise exception 'RLS disabled for %', source.name;
    end if;
    foreach caller in array array['anon','authenticated','service_role'] loop
      foreach privilege in array array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'] loop
        if has_table_privilege(caller, format('public.%I',source.name), privilege) then
          raise exception 'Unexpected table privilege: % % %', caller, source.name, privilege;
        end if;
      end loop;
      for col in select attname from pg_attribute
        where attrelid = format('public.%I',source.name)::regclass
          and attnum > 0 and not attisdropped loop
        if has_column_privilege(caller, format('public.%I',source.name), col.attname, 'SELECT')
          is distinct from (caller = 'service_role' and col.attname = any(source.allowed_columns)) then
          raise exception 'Unexpected column read privilege: % %.%', caller, source.name, col.attname;
        end if;
        foreach privilege in array array['INSERT','UPDATE','REFERENCES'] loop
          if has_column_privilege(caller,format('public.%I',source.name),col.attname,privilege) then
            raise exception 'Unexpected column write privilege: % %.% %',caller,source.name,col.attname,privilege;
          end if;
        end loop;
      end loop;
    end loop;
  end loop;
end $$;

set local role service_role;
-- PostgreSQL checks all nested view permissions even with no returned records.
-- Before the repair this raises 42501 on task_mutation_events, then on the
-- project lifecycle outbox if only the first dependency is fixed.
select company_id, activated_at, first_paid_at
from public.growth_company_milestones limit 0;
rollback;
