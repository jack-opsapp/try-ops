-- Run only against an isolated database after the additive demo migration.
-- Every synthetic row rolls back. Business truth cannot be created by diagnostics.
\set ON_ERROR_STOP on
begin;
do $$
declare token text:=repeat('f',64); other_token text:=repeat('e',64); e uuid:=gen_random_uuid(); result jsonb; i integer; before_trials bigint;
begin
 select count(*) into before_trials from public.tryops_demo_trials;
 result:=public.create_tryops_demo_session(token,null,false);
 if result->>'status'<>'rejected' then raise exception 'caller-selected identity accepted'; end if;
 perform public.create_tryops_demo_session(token,null,true);
 perform public.create_tryops_demo_session(other_token,null,true);
 result:=public.collect_tryops_demo_event(token,e,'started','assign',0,null);
 if result->>'status'<>'recorded' then raise exception 'valid event rejected'; end if;
 result:=public.collect_tryops_demo_event(token,e,'started','assign',0,null);
 if result->>'status'<>'duplicate' then raise exception 'exact retry not idempotent'; end if;
 result:=public.collect_tryops_demo_event(token,e,'started','assign',1,null);
 if result->>'reason'<>'event_conflict' then raise exception 'mutated retry accepted'; end if;
 result:=public.collect_tryops_demo_event(other_token,e,'started','assign',0,null);
 if result->>'reason'<>'event_conflict' then raise exception 'cross-session event accepted'; end if;
 result:=public.collect_tryops_demo_event(token,gen_random_uuid(),'started','crew',4,null);
 if result->>'status'<>'duplicate' then raise exception 'refresh milestone inflated'; end if;
 result:=public.collect_tryops_demo_event(token,gen_random_uuid(),'job_assigned','complete',1,null);
 if result->>'reason'<>'invalid_event' then raise exception 'invalid milestone accepted'; end if;
 for i in 1..255 loop
  result:=public.collect_tryops_demo_event(token,gen_random_uuid(),'back','assign',i,null);
  if result->>'status'<>'recorded' then raise exception 'bounded event unexpectedly lost'; end if;
 end loop;
 result:=public.collect_tryops_demo_event(token,gen_random_uuid(),'back','assign',256,null);
 if result->>'reason'<>'session_limit' then raise exception 'event cap not enforced'; end if;
 if (select count(*) from public.tryops_demo_trials)<>before_trials then raise exception 'diagnostic fabricated trial'; end if;
end $$;
rollback;
