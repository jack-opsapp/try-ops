-- Prepared only. No existing A/B rows/counters are migrated into new cohorts.
-- Prerequisites verified read-only: users.id/company_id UUID, company holder TEXT,
-- growth_company_milestones business view. Explicit service-only API surface.
begin;
create table public.tryops_experiments (
 id uuid primary key default gen_random_uuid(), route text not null check(route='/'),
 intent text not null check(intent='general'), hypothesis text not null check(length(hypothesis) between 10 and 1000),
 state text not null default 'draft' check(state in ('draft','validated','active','completed','inconclusive','invalid','rolled_back')),
 registry_version text not null, metric text not null default 'trial_started' check(metric='trial_started'),
 allocation numeric not null default .5 check(allocation=.5), baseline_rate numeric not null check(baseline_rate>0 and baseline_rate<1),
 baseline_source text not null check(length(baseline_source) between 10 and 1000),
 absolute_mde numeric not null check(absolute_mde>0 and absolute_mde<1),
 sample_per_arm integer not null check(sample_per_arm>=100),
 enrollment_starts_at timestamptz not null, enrollment_ends_at timestamptz not null,
 conversion_window_days integer not null check(conversion_window_days between 1 and 30),
 quality_window_days integer not null check(quality_window_days between 7 and 90),
 activation_margin numeric not null check(activation_margin>0 and activation_margin<1),
 evidence jsonb, decision jsonb, decided_at timestamptz, created_at timestamptz not null default now(),
 check(baseline_rate+absolute_mde<1),check(enrollment_ends_at>enrollment_starts_at),
 check(enrollment_ends_at<=enrollment_starts_at+interval '90 days')
);
create table public.tryops_arms (
 id uuid primary key default gen_random_uuid(),experiment_id uuid not null references public.tryops_experiments(id),
 slot text not null check(slot in ('a','b')),config jsonb not null,section_ids jsonb not null,
 content_valid_until timestamptz,config_hash text not null check(config_hash ~ '^[a-f0-9]{64}$'),
 unique(experiment_id,slot),unique(id,experiment_id,config_hash),
 check(jsonb_typeof(config->'sections')='array'),check(jsonb_array_length(config->'sections') between 4 and 12)
);
create table public.tryops_routes (
 route text primary key check(route='/'), active_experiment_id uuid references public.tryops_experiments(id),
 previous_experiment_id uuid references public.tryops_experiments(id),incumbent_arm_id uuid references public.tryops_arms(id),previous_incumbent_arm_id uuid references public.tryops_arms(id), version integer not null default 0,
 automatic_publish boolean not null default false check(automatic_publish=false),
 lease_token uuid,lease_until timestamptz
);
insert into public.tryops_routes(route) values('/');
create table public.tryops_assignments (
 id uuid primary key default gen_random_uuid(),experiment_id uuid not null references public.tryops_experiments(id),
 arm_id uuid not null,config_hash text not null,visitor_hash text not null check(visitor_hash ~ '^[a-f0-9]{64}$'),
 token_hash text not null unique check(token_hash ~ '^[a-f0-9]{64}$'),route text not null,intent text not null,
 created_at timestamptz not null default now(),expires_at timestamptz not null,excluded boolean not null default false,
 unique(visitor_hash,experiment_id),foreign key(arm_id,experiment_id,config_hash) references public.tryops_arms(id,experiment_id,config_hash),
 check(expires_at>created_at)
);
create index tryops_assignments_arm on public.tryops_assignments(arm_id);
create table public.tryops_exposures (
 assignment_id uuid primary key references public.tryops_assignments(id),exposed_at timestamptz not null default now()
);
create table public.tryops_events (
 id uuid primary key,assignment_id uuid not null references public.tryops_assignments(id),
 event_type text not null check(event_type in ('page_view','exposure','section_view','section_dwell','element_click','scroll_depth','signup_start','app_store_click')),
 section_name text check(length(section_name)<=80),element_id text check(length(element_id)<=80),
 dwell_ms integer check(dwell_ms between 0 and 1800000),value numeric check(value between 0 and 100),
 received_at timestamptz not null default now()
);
create index tryops_events_assignment on public.tryops_events(assignment_id,received_at);
create unique index tryops_section_once on public.tryops_events(assignment_id,section_name) where event_type='section_view';
create table public.tryops_signup_bindings (
 actor_id uuid primary key references public.users(id),assignment_id uuid not null references public.tryops_assignments(id),
 first_received_at timestamptz not null default now(),next_attempt_at timestamptz not null default now(),last_attempt_at timestamptz,attempts integer not null default 0,
 state text not null default 'pending' check(state in ('pending','attached','rejected')),
 last_reason text,company_id uuid references public.companies(id)
);
create index tryops_pending_bindings on public.tryops_signup_bindings(next_attempt_at,first_received_at) where state='pending';
create table public.tryops_trial_links (
 company_id uuid primary key references public.companies(id),assignment_id uuid not null unique references public.tryops_assignments(id),
 actor_id uuid not null references public.users(id),trial_started_at timestamptz not null,
 attached_at timestamptz not null default now()
);
create table public.tryops_outcomes (
 company_id uuid not null references public.companies(id),milestone text not null check(milestone in ('trial_started','activated','paid')),
 assignment_id uuid not null references public.tryops_assignments(id),occurred_at timestamptz not null,received_at timestamptz not null default now(),
 primary key(company_id,milestone)
);
create index tryops_outcomes_assignment on public.tryops_outcomes(assignment_id,milestone);
create table public.tryops_exclusions (
 subject_hash text primary key,kind text not null check(kind in ('visitor','company','actor')),reason text not null,
 created_at timestamptz not null default now()
);
create table public.tryops_runs (
 id uuid primary key default gen_random_uuid(),idempotency_key text not null unique check(length(idempotency_key) between 8 and 128),
 request_hash text not null default '',operation text not null check(operation in ('prepare','validate','publish','promote','rollback','evaluate','health')),
 state text not null default 'running' check(state in ('running','succeeded','failed')),
 lease_token uuid not null,started_at timestamptz not null default now(),finished_at timestamptz,
 result jsonb,error_code text
);
create table public.tryops_health_notifications (
 dedupe_key text primary key,run_id uuid references public.tryops_runs(id),reason text not null,
 payload jsonb not null,created_at timestamptz not null default now(),delivered_at timestamptz,notification_id uuid references public.notifications(id),next_attempt_at timestamptz not null default now(),attempts integer not null default 0,last_error text
);
create unique index notifications_tryops_health_durable on public.notifications(user_id,company_id,type,dedupe_key) where type='tryops_experiment_health';
create index tryops_health_due on public.tryops_health_notifications(next_attempt_at,created_at) where delivered_at is null;
create function public.drain_tryops_health_notifications(p_user_id uuid,p_company_id uuid,p_limit integer default 20)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare u public.users;c public.companies;n record;receipt uuid;can_open boolean;delivered integer:=0;failed integer:=0;pending integer;title text;body text;
begin
 if p_limit is null or p_limit<1 or p_limit>100 then raise exception 'Invalid notification limit';end if;
 select * into u from public.users where id=p_user_id and company_id=p_company_id and is_active=true and deleted_at is null;
 select * into c from public.companies where id=p_company_id and deleted_at is null;
 if u.id is null or c.id is null or (coalesce(u.is_company_admin,false) or c.account_holder_id=p_user_id::text or p_user_id::text=any(coalesce(c.admin_ids,array[]::text[]))) is not true then return jsonb_build_object('status','rejected','reason','invalid_recipient');end if;
 can_open:=exists(select 1 from public.admins where email=u.email);
 for n in select * from public.tryops_health_notifications where delivered_at is null and next_attempt_at<=now() order by next_attempt_at,created_at,dedupe_key limit p_limit for update skip locked loop
  begin
   receipt:=null;
   title:=case when n.reason='winner_pending_publication' then 'Experiment ready for review' else 'Experiment needs attention' end;
   body:=case n.reason when 'winner_pending_publication' then 'A trial result is ready. Publication requires review.' when 'completed_cohort_changed' then 'Business evidence changed after this result was recorded.' when 'signup_staging_failed' then 'A signup could not be linked. Hold this experiment result for review.' when 'collection_failed' then 'Landing measurement is incomplete. Hold this experiment result for review.' else 'The experiment worker could not finish. Review the recorded run before continuing.' end;
   select id into receipt from public.notifications where user_id=p_user_id::text and company_id=p_company_id::text and type='tryops_experiment_health' and dedupe_key='tryops-health:v1:'||n.dedupe_key;
   if receipt is null then
    -- Review alerts use the standard rail acknowledgement/dismissal lifecycle.
    select notification_id into receipt from public.create_notification_if_new_with_identity(p_user_id,p_company_id,'tryops_experiment_health',title,body,false,case when can_open then '/admin/analytics' else null end,case when can_open then 'Review' else null end,null,null,'tryops-health:v1:'||n.dedupe_key);
   end if;
   if receipt is null then raise exception 'Notification receipt unavailable';end if;
   update public.tryops_health_notifications set delivered_at=now(),notification_id=receipt,attempts=attempts+1,last_error=null where dedupe_key=n.dedupe_key;
   delivered:=delivered+1;
  exception when others then
   update public.tryops_health_notifications set attempts=attempts+1,last_error='notification_persistence_failed',next_attempt_at=now()+interval '5 minutes' where dedupe_key=n.dedupe_key;
   failed:=failed+1;
  end;
 end loop;
 select count(*) into pending from public.tryops_health_notifications where delivered_at is null;
 return jsonb_build_object('status','drained','delivered',delivered,'pending',pending,'failed',failed);
end $$;
create table public.tryops_collection_failures (
 idempotency_key text primary key check(length(idempotency_key) between 8 and 128),
 experiment_id uuid references public.tryops_experiments(id),assignment_id uuid references public.tryops_assignments(id),
 reason text not null check(reason in ('signup_staging_failed','collection_failed')),received_at timestamptz not null default now(),resolved_at timestamptz
);
create index tryops_failure_experiment on public.tryops_collection_failures(experiment_id);
-- One eligibility predicate for collection, serving, losses and cohort aggregation.
-- Late operator exclusions change current cohort evidence and trigger frozen-result review.
create function public.tryops_assignment_is_eligible(p_assignment_id uuid)
returns boolean language sql stable security invoker set search_path='' as $$
 select exists(select 1 from public.tryops_assignments x where x.id=p_assignment_id and not x.excluded
 and not exists(select 1 from public.tryops_exclusions q where
 (q.kind='visitor' and q.subject_hash=x.visitor_hash)
 or (q.kind='actor' and exists(select 1 from public.tryops_signup_bindings b where b.assignment_id=x.id and b.actor_id::text=q.subject_hash))
 or (q.kind='company' and (exists(select 1 from public.tryops_trial_links l where l.assignment_id=x.id and l.company_id::text=q.subject_hash)
 or exists(select 1 from public.tryops_signup_bindings b join public.users u on u.id=b.actor_id where b.assignment_id=x.id and u.company_id::text=q.subject_hash)))))
$$;
create function public.report_tryops_collection_failure(p_key text,p_reason text,p_assignment_id uuid default null,p_token_hash text default null,p_actor_id text default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare x public.tryops_assignments;eid uuid;
begin
 if p_token_hash is null or p_token_hash !~ '^[a-f0-9]{64}$' then return jsonb_build_object('status','rejected','reason','invalid_assignment');end if;
 select * into x from public.tryops_assignments where token_hash=p_token_hash and (p_assignment_id is null or id=p_assignment_id);
 if x.id is null or not public.tryops_assignment_is_eligible(x.id) then return jsonb_build_object('status','rejected','reason','invalid_assignment');end if;
 if p_reason='signup_staging_failed' then
  if p_token_hash is null or p_token_hash !~ '^[a-f0-9]{64}$' or p_actor_id is null or p_actor_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then return jsonb_build_object('status','rejected','reason','invalid_actor');end if;
  if exists(select 1 from public.tryops_exclusions q left join public.users u on u.id=p_actor_id::uuid where (q.kind='actor' and q.subject_hash=p_actor_id) or (q.kind='company' and q.subject_hash=u.company_id::text)) or not exists(select 1 from public.users where id=p_actor_id::uuid and deleted_at is null and is_active=true) or exists(select 1 from public.tryops_signup_bindings where actor_id=p_actor_id::uuid and assignment_id<>x.id) then return jsonb_build_object('status','rejected','reason','invalid_actor');end if;
 end if;
 eid:=x.experiment_id;
 insert into public.tryops_collection_failures(idempotency_key,experiment_id,assignment_id,reason) values(p_key,eid,x.id,p_reason) on conflict do nothing;
 insert into public.tryops_health_notifications(dedupe_key,reason,payload) values('tryops:'||coalesce(eid::text,'unknown')||':'||p_reason,p_reason,jsonb_build_object('title','Experiment measurement needs review','persistent',false,'actionUrl','/admin/analytics','actionLabel','Review','experimentId',eid)) on conflict do nothing;
 return jsonb_build_object('status','recorded');
end $$;
-- Existing OPS rail can drain this service-only durable outbox. Nothing sends externally.

create function public.tryops_immutable() returns trigger language plpgsql set search_path='' as $$
begin
 if TG_TABLE_NAME='tryops_arms' then raise exception 'Frozen arm cannot change'; end if;
 if old.state<>'draft' and (to_jsonb(new)-array['state','evidence','decision','decided_at'])<>(to_jsonb(old)-array['state','evidence','decision','decided_at']) then raise exception 'Frozen experiment plan cannot change'; end if;
 if old.decision is not null and new.decision is distinct from old.decision then raise exception 'Completed evidence cannot change'; end if;
 return new;
end $$;
create trigger tryops_frozen_arm before update or delete on public.tryops_arms for each row execute function public.tryops_immutable();
create trigger tryops_frozen_plan before update on public.tryops_experiments for each row execute function public.tryops_immutable();

create function public.assign_tryops_experiment(p_visitor_hash text,p_token_hash text,p_route text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare e public.tryops_experiments; a public.tryops_arms; x public.tryops_assignments; chosen_slot text;
begin
 if p_visitor_hash !~ '^[a-f0-9]{64}$' or p_token_hash !~ '^[a-f0-9]{64}$' then raise exception 'Invalid identity'; end if;
 select ex.* into e from public.tryops_routes r join public.tryops_experiments ex on ex.id=r.active_experiment_id
 where r.route=p_route and ex.state='active' and now()>=ex.enrollment_starts_at and now()<ex.enrollment_ends_at;
 if not found then return jsonb_build_object('status','no_experiment'); end if;
 if exists(select 1 from public.tryops_exclusions where kind='visitor' and subject_hash=p_visitor_hash) then return jsonb_build_object('status','excluded'); end if;
 chosen_slot:=case when random()<.5 then 'a' else 'b' end;
 select * into a from public.tryops_arms where experiment_id=e.id and slot=chosen_slot;
 if not found then raise exception 'Missing arm'; end if;
 insert into public.tryops_assignments(experiment_id,arm_id,config_hash,visitor_hash,token_hash,route,intent,expires_at)
 values(e.id,a.id,a.config_hash,p_visitor_hash,p_token_hash,e.route,e.intent,least(now()+interval '30 days',e.enrollment_ends_at+make_interval(days=>e.conversion_window_days)))
 on conflict(visitor_hash,experiment_id) do nothing returning * into x;
 if x.id is null then
  select * into x from public.tryops_assignments where visitor_hash=p_visitor_hash and experiment_id=e.id;
  -- A missing/replaced bearer must never change arm or recover another token.
  return jsonb_build_object('status','existing_assignment');
 end if;
 return jsonb_build_object('status','assigned','assignment_id',x.id,'expires_at',x.expires_at);
end $$;

create function public.resolve_tryops_assignment(p_token_hash text,p_route text)
returns jsonb language sql security invoker set search_path='' as $$
 select jsonb_build_object('assignment_id',x.id,'experiment_id',x.experiment_id,'arm_id',x.arm_id,'config_hash',x.config_hash,'config',a.config,'expires_at',x.expires_at)
 from public.tryops_assignments x join public.tryops_arms a on a.id=x.arm_id join public.tryops_experiments e on e.id=x.experiment_id
 join public.tryops_routes r on r.active_experiment_id=e.id and r.route=x.route
 where x.token_hash=p_token_hash and x.route=p_route and public.tryops_assignment_is_eligible(x.id) and now()<x.expires_at and e.state='active'
 and not exists(select 1 from public.tryops_exclusions where kind='visitor' and subject_hash=x.visitor_hash)
$$;

create function public.collect_tryops_event(p_token_hash text,p_assignment_id uuid,p_arm_id uuid,p_route text,p_event jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare x public.tryops_assignments;e public.tryops_experiments;t text:=p_event->>'event_type';
begin
 select * into x from public.tryops_assignments where id=p_assignment_id and token_hash=p_token_hash and arm_id=p_arm_id and route=p_route for update;
 if not found or not public.tryops_assignment_is_eligible(x.id) or now()>=x.expires_at then return jsonb_build_object('status','rejected','reason','invalid_assignment'); end if;
 select * into e from public.tryops_experiments where id=x.experiment_id;
 if (select count(*) from public.tryops_events where assignment_id=x.id and received_at>now()-interval '1 day')>=1000 then return jsonb_build_object('status','rejected','reason','event_limit');end if;
 if e.state<>'active' or exists(select 1 from public.tryops_exclusions where kind='visitor' and subject_hash=x.visitor_hash) then return jsonb_build_object('status','rejected','reason','inactive_assignment'); end if;
 if t not in ('page_view','exposure','section_view','section_dwell','element_click','scroll_depth','signup_start','app_store_click') then return jsonb_build_object('status','rejected','reason','invalid_event'); end if;
 if t='exposure' and (now()<e.enrollment_starts_at or now()>=e.enrollment_ends_at) then return jsonb_build_object('status','rejected','reason','enrollment_closed'); end if;
 -- Enforce arm identity and server-received time. Replay ID cannot add exposure.
 insert into public.tryops_events(id,assignment_id,event_type,section_name,element_id,dwell_ms,value)
 values((p_event->>'event_id')::uuid,x.id,t,p_event->>'section_name',p_event->>'element_id',(p_event->>'dwell_ms')::integer,(p_event->>'value')::numeric) on conflict do nothing;
 if not found then
  update public.tryops_collection_failures set resolved_at=now() where idempotency_key=p_event->>'event_id' and assignment_id=x.id and reason='collection_failed';
  return jsonb_build_object('status','duplicate');
 end if;
 update public.tryops_collection_failures set resolved_at=now() where idempotency_key=p_event->>'event_id' and assignment_id=x.id and reason='collection_failed';
 if t='exposure' then insert into public.tryops_exposures(assignment_id) values(x.id) on conflict do nothing; end if;
 return jsonb_build_object('status','collected');
end $$;

create function public.stage_tryops_experiment_signup(p_token text,p_actor_id text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare x public.tryops_assignments;b public.tryops_signup_bindings;actor uuid;
begin
 if p_actor_id is null or p_actor_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then return jsonb_build_object('status','rejected','reason','invalid_actor'); end if;
 actor:=p_actor_id::uuid;
 if exists(select 1 from public.tryops_exclusions q left join public.users u on u.id=actor where (q.kind='actor' and q.subject_hash=actor::text) or (q.kind='company' and q.subject_hash=u.company_id::text)) or not exists(select 1 from public.users where id=actor and deleted_at is null and is_active=true) then return jsonb_build_object('status','rejected','reason','invalid_actor'); end if;
 if p_token is null or p_token !~ '^[A-Za-z0-9_-]{43}$' then return jsonb_build_object('status','rejected','reason','invalid_token'); end if;
 select * into x from public.tryops_assignments where token_hash=encode(extensions.digest(p_token,'sha256'),'hex');
 if not found or not public.tryops_assignment_is_eligible(x.id) then return jsonb_build_object('status','rejected','reason','invalid_token'); end if;
 select * into b from public.tryops_signup_bindings where actor_id=actor;
 if b.assignment_id=x.id then return jsonb_build_object('status','already_staged'); end if;
 if b.actor_id is not null then return jsonb_build_object('status','rejected','reason','actor_already_staged'); end if;
 if now()>=x.expires_at then return jsonb_build_object('status','rejected','reason','expired_assignment'); end if;
 insert into public.tryops_signup_bindings(actor_id,assignment_id) values(actor,x.id) on conflict do nothing;
 select * into b from public.tryops_signup_bindings where actor_id=actor;
 if b.assignment_id<>x.id then return jsonb_build_object('status','rejected','reason','actor_already_staged'); end if;
 if not exists(select 1 from public.tryops_exposures where assignment_id=x.id) then return jsonb_build_object('status','pending','reason','no_exposure'); end if;
 return jsonb_build_object('status','staged');
end $$;

create function public.retry_tryops_experiment_trial(p_actor_id text,p_company_id uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare b public.tryops_signup_bindings;x public.tryops_assignments;e public.tryops_experiments;c public.companies;exposure timestamptz;reason text;link public.tryops_trial_links;
begin
 if p_actor_id is null or p_actor_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then return jsonb_build_object('status','rejected','reason','invalid_actor'); end if;
 select * into b from public.tryops_signup_bindings where actor_id=p_actor_id::uuid for update;
 if not found then return jsonb_build_object('status','rejected','reason','no_staged_assignment'); end if;
 select * into c from public.companies where id=p_company_id;
 if not found or c.deleted_at is not null or c.account_holder_id is distinct from p_actor_id or not exists(select 1 from public.users where id=p_actor_id::uuid and company_id=p_company_id and deleted_at is null and is_active=true) then
  -- Terminal only when this is the actor's actual current company; a wrong
  -- arbitrary company argument must not destroy a recoverable binding.
  if exists(select 1 from public.users where id=p_actor_id::uuid and company_id=p_company_id) then
   update public.tryops_signup_bindings set state='rejected',last_reason='ineligible_company',attempts=attempts+1,last_attempt_at=now(),company_id=p_company_id where actor_id=b.actor_id;
  end if;
  return jsonb_build_object('status','rejected','reason','ineligible_company');
 end if;
 select * into x from public.tryops_assignments where id=b.assignment_id for update;
 select * into e from public.tryops_experiments where id=x.experiment_id;
 select * into link from public.tryops_trial_links where company_id=p_company_id;
 if link.assignment_id=x.id and link.actor_id=p_actor_id::uuid then return jsonb_build_object('status','already_attached','assignment_id',x.id,'experiment_id',x.experiment_id,'arm_id',x.arm_id,'trial_started_at',link.trial_started_at); end if;
 if link.company_id is not null then reason:='company_already_attributed';
 elsif exists(select 1 from public.tryops_trial_links where assignment_id=x.id) then reason:='assignment_already_attributed';
 elsif x.excluded or exists(select 1 from public.tryops_exclusions where (kind='visitor' and subject_hash=x.visitor_hash) or (kind='company' and subject_hash=p_company_id::text) or (kind='actor' and subject_hash=p_actor_id)) then reason:='ineligible_company';
 elsif c.trial_start_date is null then reason:='trial_not_ready';
 elsif c.trial_start_date>=x.expires_at or b.first_received_at>=x.expires_at then reason:='expired_assignment';
 else
  select exposed_at into exposure from public.tryops_exposures where assignment_id=x.id;
  if exposure is null then reason:='no_exposure';
  elsif c.trial_start_date<exposure then reason:='trial_before_exposure';
  elsif c.trial_start_date>=exposure+make_interval(days=>e.conversion_window_days) then reason:='outside_conversion_window';
  end if;
 end if;
 update public.tryops_signup_bindings set attempts=attempts+1,last_attempt_at=now(),next_attempt_at=now()+interval '5 minutes',company_id=p_company_id,last_reason=reason where actor_id=b.actor_id;
 if reason is not null then
  if reason in ('no_exposure','trial_not_ready') and now()<x.expires_at+interval '1 day' then return jsonb_build_object('status','pending','reason',reason); end if;
  update public.tryops_signup_bindings set state='rejected' where actor_id=b.actor_id;
  return jsonb_build_object('status','rejected','reason',reason);
 end if;
 insert into public.tryops_trial_links(company_id,assignment_id,actor_id,trial_started_at) values(p_company_id,x.id,b.actor_id,c.trial_start_date) on conflict do nothing;
 if not found then return jsonb_build_object('status','rejected','reason','company_already_attributed'); end if;
 insert into public.tryops_outcomes(company_id,assignment_id,milestone,occurred_at) values(p_company_id,x.id,'trial_started',c.trial_start_date) on conflict do nothing;
 update public.tryops_signup_bindings set state='attached',last_reason=null where actor_id=b.actor_id;
 return jsonb_build_object('status','attached','assignment_id',x.id,'experiment_id',x.experiment_id,'arm_id',x.arm_id,'trial_started_at',c.trial_start_date);
end $$;
create function public.attach_tryops_experiment_trial(p_token text,p_company_id uuid,p_actor_id text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb;
begin
 result:=public.stage_tryops_experiment_signup(p_token,p_actor_id);
 if result->>'status'='rejected' then return result;end if;
 return public.retry_tryops_experiment_trial(p_actor_id,p_company_id);
end $$;

create function public.reconcile_tryops_experiments() returns jsonb language plpgsql security invoker set search_path='' as $$
declare b record;r jsonb;attempted integer:=0;
begin
 for b in select s.actor_id,u.company_id from public.tryops_signup_bindings s join public.users u on u.id=s.actor_id where s.state='pending' and s.next_attempt_at<=now() and u.company_id is not null order by s.next_attempt_at,s.first_received_at,s.actor_id limit 100 for update of s skip locked loop
  r:=public.retry_tryops_experiment_trial(b.actor_id::text,b.company_id);attempted:=attempted+1;
 end loop;
 insert into public.tryops_outcomes(company_id,assignment_id,milestone,occurred_at)
 select l.company_id,l.assignment_id,v.milestone,v.occurred_at from public.tryops_trial_links l
 join public.growth_company_milestones m on m.company_id=l.company_id
 cross join lateral(values('activated',m.activated_at),('paid',m.first_paid_at)) v(milestone,occurred_at)
 where v.occurred_at is not null on conflict do nothing;
 insert into public.tryops_health_notifications(dedupe_key,reason,payload)
 select 'tryops:completed-cohort:'||e.id::text,'completed_cohort_changed',jsonb_build_object('title','Experiment evidence changed','persistent',false,'actionUrl','/admin/analytics','actionLabel','Review','experimentId',e.id)
 from public.tryops_experiments e where e.decision is not null and e.decision->'cohort'->'arms' is distinct from public.tryops_cohort(e.id)->'arms'
 on conflict do nothing;
 return jsonb_build_object('status','reconciled','attempted',attempted);
end $$;

create function public.claim_tryops_run(p_key text,p_operation text,p_request_hash text default '') returns jsonb language plpgsql security invoker set search_path='' as $$
declare r public.tryops_runs;token uuid:=gen_random_uuid();
begin
 -- Lock the route first, then read fresh run state. A paused claimant cannot
 -- overwrite a success committed while it waited for the exclusive route.
 perform 1 from public.tryops_routes where route='/' for update;
 select * into r from public.tryops_runs where idempotency_key=p_key for update;
 if r.id is not null and (r.operation<>p_operation or r.request_hash<>p_request_hash) then raise exception 'Idempotency payload mismatch';end if;
 if r.state='succeeded' then return jsonb_build_object('status','complete','result',r.result,'run_id',r.id);end if;
 update public.tryops_routes set lease_token=token,lease_until=now()+interval '120 seconds' where route='/' and (lease_until is null or lease_until<now());
 if not found then return jsonb_build_object('status','busy');end if;
 insert into public.tryops_runs(idempotency_key,operation,lease_token,request_hash) values(p_key,p_operation,token,p_request_hash)
 on conflict(idempotency_key) do update set state='running',lease_token=excluded.lease_token,started_at=now(),finished_at=null,error_code=null
 returning * into r;
 if r.operation<>p_operation then raise exception 'Idempotency key operation mismatch';end if;
 return jsonb_build_object('status','claimed','run_id',r.id,'lease_token',token);
end $$;
create function public.finish_tryops_run(p_run_id uuid,p_lease_token uuid,p_result jsonb,p_error text default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
begin
 perform 1 from public.tryops_routes where route='/' and lease_token=p_lease_token and lease_until>now() for update;
 if not found then raise exception 'Stale lease';end if;
 update public.tryops_runs set state=case when p_error is null then 'succeeded' else 'failed' end,result=p_result,error_code=p_error,finished_at=now() where id=p_run_id and lease_token=p_lease_token and state='running';
 if not found then raise exception 'Stale run';end if;
 if p_error is not null then
 insert into public.tryops_health_notifications(dedupe_key,run_id,reason,payload)
 values('tryops:'||p_error||':'||current_date::text,p_run_id,p_error,jsonb_build_object('title','Experiment needs attention','persistent',false,'actionUrl','/admin/analytics','actionLabel','Review','reason',p_error)) on conflict do nothing;
 end if;
 update public.tryops_routes set lease_token=null,lease_until=null where route='/' and lease_token=p_lease_token;
 return jsonb_build_object('status',case when p_error is null then 'succeeded' else 'failed' end);
end $$;
create function public.prepare_tryops_experiment(p_spec jsonb,p_control jsonb,p_challenger jsonb)
returns uuid language plpgsql security invoker set search_path='' as $$
declare eid uuid;required numeric;pa numeric:=(p_spec->>'baselineRate')::numeric;delta numeric:=(p_spec->>'absoluteMde')::numeric;pool numeric;
begin
 pool:=pa+delta/2;
 required:=ceil(power(1.959963984540054*sqrt(2*pool*(1-pool))+.8416212335729143*sqrt(pa*(1-pa)+(pa+delta)*(1-pa-delta)),2)/power(delta,2));
 if (p_spec->>'samplePerArm')::integer<required then raise exception 'Underpowered experiment';end if;
 insert into public.tryops_experiments(route,intent,hypothesis,registry_version,baseline_rate,baseline_source,absolute_mde,sample_per_arm,enrollment_starts_at,enrollment_ends_at,conversion_window_days,quality_window_days,activation_margin)
 values('/', 'general',p_spec->>'hypothesis',p_spec->>'registryVersion',pa,p_spec->>'baselineSource',delta,(p_spec->>'samplePerArm')::integer,(p_spec->>'enrollmentStartsAt')::timestamptz,(p_spec->>'enrollmentEndsAt')::timestamptz,(p_spec->>'conversionWindowDays')::integer,(p_spec->>'qualityWindowDays')::integer,(p_spec->>'activationNonInferiorityMargin')::numeric) returning id into eid;
 insert into public.tryops_arms(experiment_id,slot,config,section_ids,content_valid_until,config_hash)
 select eid,v.slot,v.body->'config',v.body->'sectionIds',(v.body->>'validUntil')::timestamptz,encode(extensions.digest((v.body->'config')::text,'sha256'),'hex') from (values('a',p_control),('b',p_challenger)) v(slot,body);
 return eid;
end $$;
create function public.validate_tryops_experiment(p_experiment_id uuid,p_evidence jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare a text;b text;
begin
 select config_hash into a from public.tryops_arms where experiment_id=p_experiment_id and slot='a';
 select config_hash into b from public.tryops_arms where experiment_id=p_experiment_id and slot='b';
 if exists(select 1 from public.tryops_arms where experiment_id=p_experiment_id and content_valid_until<=now()) then raise exception 'Approved content expired';end if;
 if a is null or b is null or p_evidence->>'controlHash' is distinct from a or p_evidence->>'challengerHash' is distinct from b then raise exception 'Evidence hash mismatch';end if;
 if not (p_evidence @> '{"content":true,"desktop":true,"mobile":true,"cta":true,"accessibility":true,"tracking":true,"signup":true,"aa":true}'::jsonb)
 or coalesce(length(p_evidence->>'artifactRef'),0)<10 then raise exception 'Incomplete publication evidence';end if;
 update public.tryops_experiments set state='validated',evidence=p_evidence where id=p_experiment_id and state='draft';
 if not found then raise exception 'Draft unavailable';end if;
 return jsonb_build_object('status','validated');
end $$;
create function public.publish_tryops_experiment(p_experiment_id uuid,p_expected_version integer,p_lease_token uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare e public.tryops_experiments;r public.tryops_routes;
begin
 select * into r from public.tryops_routes where route='/' for update;
 if p_lease_token is null or r.lease_until is null or r.version<>p_expected_version or r.lease_token is distinct from p_lease_token or r.lease_until<=now() then raise exception 'Stale publication';end if;
 select * into e from public.tryops_experiments where id=p_experiment_id for update;
 if e.state<>'validated' or e.evidence is null or e.enrollment_starts_at>now() or e.enrollment_ends_at<=now() then raise exception 'Experiment not publishable';end if;
 if exists(select 1 from public.tryops_arms where experiment_id=e.id and content_valid_until<=now()) then raise exception 'Approved content expired';end if;
 -- Cannot destroy a running cohort to start another one.
 if exists(select 1 from public.tryops_experiments where id=r.active_experiment_id and state='active') then raise exception 'Incumbent still enrolling or maturing';end if;
 update public.tryops_experiments set state='active' where id=e.id;
 update public.tryops_routes set previous_experiment_id=active_experiment_id,previous_incumbent_arm_id=incumbent_arm_id,incumbent_arm_id=(select id from public.tryops_arms where experiment_id=e.id and slot='a'),active_experiment_id=e.id,version=version+1 where route='/';
 return jsonb_build_object('status','published','experiment_id',e.id,'version',r.version+1);
end $$;
create function public.promote_tryops_winner(p_experiment_id uuid,p_expected_version integer,p_lease_token uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare r public.tryops_routes;e public.tryops_experiments;winner uuid;
begin
 select * into r from public.tryops_routes where route='/' for update;
 if p_lease_token is null or r.lease_until is null or r.version<>p_expected_version or r.lease_token is distinct from p_lease_token or r.lease_until<=now() then raise exception 'Stale promotion';end if;
 select * into e from public.tryops_experiments where id=p_experiment_id for update;
 if e.state<>'completed' or e.decision->>'status' is distinct from 'promote_challenger' or r.active_experiment_id is distinct from e.id or e.evidence is null then raise exception 'Winner not approved for promotion';end if;
 if e.decision->'cohort'->'arms' is distinct from public.tryops_cohort(e.id)->'arms' then raise exception 'Completed cohort changed';end if;
 select id into winner from public.tryops_arms where experiment_id=e.id and slot='b' and (content_valid_until is null or content_valid_until>now());
 if winner is null then raise exception 'Winner content expired';end if;
 if r.incumbent_arm_id=winner then return jsonb_build_object('status','already_published','arm_id',winner,'version',r.version);end if;
 update public.tryops_routes set previous_experiment_id=active_experiment_id,previous_incumbent_arm_id=incumbent_arm_id,incumbent_arm_id=winner,version=version+1 where route='/';
 return jsonb_build_object('status','winner_published','arm_id',winner,'version',r.version+1);
end $$;
create function public.rollback_tryops_experiment(p_expected_version integer,p_lease_token uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare r public.tryops_routes;
begin
 select * into r from public.tryops_routes where route='/' for update;
 if p_lease_token is null or r.lease_until is null or r.version<>p_expected_version or r.lease_token is distinct from p_lease_token or r.lease_until<=now() then raise exception 'Stale rollback';end if;
 update public.tryops_experiments set state='rolled_back' where id=r.active_experiment_id;
 -- Previous experiment remains frozen. Renderer serves its approved control, without enrollment.
 update public.tryops_routes set active_experiment_id=previous_experiment_id,previous_experiment_id=null,incumbent_arm_id=previous_incumbent_arm_id,previous_incumbent_arm_id=null,version=version+1 where route='/';
 return jsonb_build_object('status','rolled_back','version',r.version+1);
end $$;
create function public.tryops_cohort(p_experiment_id uuid)
returns jsonb language sql security invoker set search_path='' as $$
 select jsonb_build_object('plan',to_jsonb(e),'arms',(
 select jsonb_agg(jsonb_build_object('slot',a.slot,'arm_id',a.id,'assigned',
 (select count(*) from public.tryops_assignments x where x.arm_id=a.id and public.tryops_assignment_is_eligible(x.id)),
 'exposed',(select count(*) from public.tryops_assignments x join public.tryops_exposures p on p.assignment_id=x.id where x.arm_id=a.id and public.tryops_assignment_is_eligible(x.id) and p.exposed_at<e.enrollment_ends_at),
 'trials',(select count(*) from public.tryops_trial_links l join public.tryops_assignments x on x.id=l.assignment_id join public.tryops_exposures p on p.assignment_id=x.id join public.companies c on c.id=l.company_id where x.arm_id=a.id and public.tryops_assignment_is_eligible(x.id) and c.deleted_at is null and l.trial_started_at>=p.exposed_at and l.trial_started_at<p.exposed_at+make_interval(days=>e.conversion_window_days) and p.exposed_at<e.enrollment_ends_at),
 'activated',(select count(*) from public.tryops_trial_links l join public.tryops_assignments x on x.id=l.assignment_id join public.tryops_exposures p on p.assignment_id=x.id join public.growth_company_milestones g on g.company_id=l.company_id where x.arm_id=a.id and public.tryops_assignment_is_eligible(x.id) and g.activated_at is not null and g.activated_at<l.trial_started_at+make_interval(days=>e.quality_window_days) and l.trial_started_at>=p.exposed_at and l.trial_started_at<p.exposed_at+make_interval(days=>e.conversion_window_days) and p.exposed_at<e.enrollment_ends_at),
 'collectionFailures',(select count(*) from public.tryops_collection_failures f where f.experiment_id=e.id and f.resolved_at is null and public.tryops_assignment_is_eligible(f.assignment_id))) order by a.slot) from public.tryops_arms a where a.experiment_id=e.id)) from public.tryops_experiments e where e.id=p_experiment_id
$$;
create function public.complete_tryops_experiment(p_experiment_id uuid,p_decision jsonb,p_lease_token uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare e public.tryops_experiments;
begin
 perform 1 from public.tryops_routes where route='/' and lease_token=p_lease_token and lease_until>now() for update;
 if not found then raise exception 'Stale lease';end if;
 select * into e from public.tryops_experiments where id=p_experiment_id for update;
 if e.decision is not null then return e.decision;end if;
 if e.state<>'active' or now()<e.enrollment_ends_at+make_interval(days=>e.conversion_window_days+e.quality_window_days) then raise exception 'Cohort not mature';end if;
 if p_decision->'cohort' is distinct from public.tryops_cohort(p_experiment_id) then raise exception 'Cohort changed before freeze';end if;
 if p_decision->>'status' not in ('inconclusive','invalid','retain_control','promote_challenger') or p_decision->'cohort' is null then raise exception 'Invalid decision';end if;
 update public.tryops_experiments set state=case when p_decision->>'status' in ('inconclusive','invalid') then p_decision->>'status' else 'completed' end,decision=p_decision,decided_at=now() where id=e.id;
 if p_decision->>'status'='promote_challenger' then
 insert into public.tryops_health_notifications(dedupe_key,reason,payload) values('tryops:winner-review:'||e.id::text,'winner_pending_publication',jsonb_build_object('title','Experiment ready for review','persistent',false,'actionUrl','/admin/analytics','actionLabel','Review','experimentId',e.id)) on conflict do nothing;
 end if;
 return p_decision;
end $$;
-- Mutations and durable success are one transaction. A dropped response can safely
-- retry the same key; it cannot create a second draft or publish a second time.
create function public.execute_tryops_operation(p_run_id uuid,p_lease_token uuid,p_operation text,p_payload jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb;eid uuid;
begin
 perform 1 from public.tryops_routes where route='/' and lease_token=p_lease_token and lease_until>now() for update;
 if not found then raise exception 'Stale lease';end if;
 perform 1 from public.tryops_runs where id=p_run_id and lease_token=p_lease_token and state='running' and operation=p_operation for update;
 if not found then raise exception 'Run mismatch';end if;
 case p_operation
 when 'prepare' then
  eid:=public.prepare_tryops_experiment(p_payload->'spec',p_payload->'control',p_payload->'challenger');
  result:=jsonb_build_object('status','draft','experimentId',eid);
 when 'validate' then result:=public.validate_tryops_experiment((p_payload->>'experimentId')::uuid,p_payload->'evidence');
 when 'publish' then result:=public.publish_tryops_experiment((p_payload->>'experimentId')::uuid,(p_payload->>'expectedVersion')::integer,p_lease_token);
 when 'promote' then result:=public.promote_tryops_winner((p_payload->>'experimentId')::uuid,(p_payload->>'expectedVersion')::integer,p_lease_token);
 when 'rollback' then result:=public.rollback_tryops_experiment((p_payload->>'expectedVersion')::integer,p_lease_token);
 when 'evaluate' then result:=public.complete_tryops_experiment((p_payload->>'experimentId')::uuid,p_payload->'decision',p_lease_token);
 else raise exception 'Unsupported atomic operation';
 end case;
 perform public.finish_tryops_run(p_run_id,p_lease_token,result);
 return result;
end $$;
-- Full SQL aggregation: diagnostic denominators are unique eligible exposed assignments.
create function public.tryops_section_diagnostics(p_experiment_id uuid)
returns jsonb language sql security invoker set search_path='' as $$
 with eligible as(select x.id,x.arm_id from public.tryops_assignments x join public.tryops_exposures p on p.assignment_id=x.id where x.experiment_id=p_experiment_id and public.tryops_assignment_is_eligible(x.id)),
 totals as(select arm_id,count(*) as denominator from eligible group by arm_id),
 stats as(select x.arm_id,e.section_name,count(distinct e.assignment_id) filter(where event_type='section_view') as viewers,
 count(distinct e.assignment_id) filter(where event_type='element_click') as clickers,
 coalesce(sum(dwell_ms) filter(where event_type='section_dwell'),0) as dwell from public.tryops_events e join eligible x on x.id=e.assignment_id where section_name is not null group by x.arm_id,e.section_name)
 select coalesce(jsonb_agg(jsonb_build_object('armId',s.arm_id,'sectionName',s.section_name,'exposedVisitors',t.denominator,'uniqueViewers',s.viewers,'viewRate',s.viewers::numeric/nullif(t.denominator,0),'clickRate',s.clickers::numeric/nullif(t.denominator,0),'avgVisibleDwellMs',s.dwell/nullif(s.viewers,0))),'[]'::jsonb) from stats s join totals t on t.arm_id=s.arm_id
$$;

DO $$ declare r record;begin
 for r in select tablename from pg_tables where schemaname='public' and tablename like 'tryops_%' loop
 execute format('alter table public.%I enable row level security',r.tablename);
 execute format('revoke all on public.%I from public,anon,authenticated',r.tablename);
 execute format('grant select,insert,update,delete on public.%I to service_role',r.tablename);
 end loop;
 for r in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and (p.proname like '%tryops%') loop
 execute format('revoke all on function %s from public,anon,authenticated',r.signature);
 execute format('grant execute on function %s to service_role',r.signature);
 end loop;
end $$;
commit;
