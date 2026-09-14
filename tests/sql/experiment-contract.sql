\set ON_ERROR_STOP on
begin;
DO $$
declare eid uuid;aid uuid;xid uuid;lease uuid;runid uuid;r jsonb;ev jsonb;
 actor uuid:='00000000-0000-4000-8000-000000000001';company uuid:='00000000-0000-4000-8000-000000000002';
 actor2 uuid:='00000000-0000-4000-8000-000000000003';company2 uuid:='00000000-0000-4000-8000-000000000004';
 tok text:=repeat('A',43);th text:=encode(extensions.digest(repeat('A',43),'sha256'),'hex');
 spec jsonb;arm jsonb;before_count integer;original jsonb; i integer; n_a integer;
begin
 if has_function_privilege('anon','public.attach_tryops_experiment_trial(text,uuid,text)','execute') then raise exception 'anon attachment access';end if;
 if has_function_privilege('authenticated','public.stage_tryops_experiment_signup(text,text)','execute') then raise exception 'authenticated staging access';end if;
 if exists(select 1 from pg_tables where schemaname='public' and tablename like 'tryops_%' and not rowsecurity) then raise exception 'missing RLS';end if;
 insert into public.users(id,company_id) values(actor,company),(actor2,company2);
 insert into public.companies(id,account_holder_id,trial_start_date) values(company,actor::text,now()),(company2,actor2::text,now());
 spec:=jsonb_build_object('hypothesis','One declared hypothesis','registryVersion','fixture-v1','baselineRate',.02,'baselineSource','Isolated baseline fixture','absoluteMde',.01,'samplePerArm',3826,'enrollmentStartsAt',now()-interval '1 hour','enrollmentEndsAt',now()+interval '1 day','conversionWindowDays',7,'qualityWindowDays',7,'activationNonInferiorityMargin',.01);
 arm:='{"config":{"sections":[{"type":"Hero"},{"type":"PricingSection"},{"type":"FAQSection"},{"type":"ClosingCTA"}]},"sectionIds":["h","p","f","c"]}'::jsonb;
 eid:=public.prepare_tryops_experiment(spec,arm,arm);
 select id into aid from public.tryops_arms where experiment_id=eid and slot='a';
 begin update public.tryops_arms set config='{}' where id=aid;raise exception 'mutable arm';exception when raise_exception then if SQLERRM='mutable arm' then raise;end if;end;
 begin perform public.validate_tryops_experiment(eid,'{}');raise exception 'bad evidence accepted';exception when raise_exception then if SQLERRM='bad evidence accepted' then raise;end if;end;
 select jsonb_build_object('controlHash',max(config_hash) filter(where slot='a'),'challengerHash',max(config_hash) filter(where slot='b'),'content',true,'desktop',true,'mobile',true,'cta',true,'accessibility',true,'tracking',true,'signup',true,'aa',true,'artifactRef','isolated SQL fixture') into ev from public.tryops_arms where experiment_id=eid;
 perform public.validate_tryops_experiment(eid,ev);
 r:=public.claim_tryops_run('fixture-publish','publish');lease:=(r->>'lease_token')::uuid;runid:=(r->>'run_id')::uuid;
 if public.claim_tryops_run('fixture-concurrent','publish')->>'status'<>'busy' then raise exception 'parallel lease';end if;
 begin perform public.publish_tryops_experiment(eid,999,lease);raise exception 'bad CAS accepted';exception when raise_exception then if SQLERRM='bad CAS accepted' then raise;end if;end;
 begin perform public.publish_tryops_experiment(eid,0,null);raise exception 'null lease accepted';exception when raise_exception then if SQLERRM='null lease accepted' then raise;end if;end;
 perform public.execute_tryops_operation(runid,lease,'publish',jsonb_build_object('experimentId',eid,'expectedVersion',0));
 if (select state from public.tryops_runs where id=runid)<>'succeeded' then raise exception 'publish success not atomic';end if;
 if public.claim_tryops_run('fixture-publish','publish')->>'status'<>'complete' then raise exception 'run retry not idempotent';end if;
 perform setseed(.31415);
 for i in 1..1000 loop
  r:=public.assign_tryops_experiment(encode(extensions.digest('visitor-'||i::text,'sha256'),'hex'),encode(extensions.digest('token-'||i::text,'sha256'),'hex'),'/');
  if r->>'status'<>'assigned' then raise exception 'eligible random assignment failed';end if;
 end loop;
 select count(*) into n_a from public.tryops_assignments x join public.tryops_arms a on a.id=x.arm_id where x.experiment_id=eid and a.slot='a';
 if n_a<430 or n_a>570 then raise exception '50/50 allocation distorted: %',n_a;end if;
 r:=public.assign_tryops_experiment(repeat('1',64),th,'/');xid:=(r->>'assignment_id')::uuid;
 if xid is null then raise exception 'no assignment';end if;
 select arm_id into aid from public.tryops_assignments where id=xid;
 if public.assign_tryops_experiment(repeat('1',64),repeat('2',64),'/')->>'status'<>'existing_assignment' then raise exception 'visitor reassigned';end if;
 if public.resolve_tryops_assignment(th,'/wrong') is not null then raise exception 'wrong route';end if;
 if public.resolve_tryops_assignment(repeat('f',64),'/') is not null then raise exception 'tampered token';end if;
 r:=public.collect_tryops_event(th,xid,aid,'/',jsonb_build_object('event_id','00000000-0000-4000-8000-000000000010','event_type','page_view'));
 r:=public.collect_tryops_event(th,xid,aid,'/',jsonb_build_object('event_id','00000000-0000-4000-8000-000000000010','event_type','exposure'));
 if r->>'status'<>'duplicate' or exists(select 1 from public.tryops_exposures where assignment_id=xid) then raise exception 'replayed ID manufactured exposure';end if;
 if public.stage_tryops_experiment_signup(tok,actor::text)->>'status'<>'pending' then raise exception 'no-exposure not pending';end if;
 if public.retry_tryops_experiment_trial(actor::text,company)->>'status'<>'pending' then raise exception 'premature attach';end if;
 perform public.collect_tryops_event(th,xid,aid,'/',jsonb_build_object('event_id',gen_random_uuid(),'event_type','exposure'));
 perform public.collect_tryops_event(th,xid,aid,'/',jsonb_build_object('event_id',gen_random_uuid(),'event_type','exposure'));
 if (select count(*) from public.tryops_exposures where assignment_id=xid)<>1 then raise exception 'duplicate exposure';end if;
 if public.collect_tryops_event(th,xid,aid,'/',jsonb_build_object('event_id',gen_random_uuid(),'event_type','signup_complete'))->>'status'<>'rejected' then raise exception 'browser conversion trusted';end if;
 if public.retry_tryops_experiment_trial(actor::text,company2)->>'reason'<>'ineligible_company' then raise exception 'wrong company actor';end if;
 -- Advance the persisted due time to simulate the five-minute recovery interval.
 update public.tryops_signup_bindings set next_attempt_at=now() where actor_id=actor;
 -- Worker, with no browser revisit, drains staging and derives business outcomes.
 insert into public.growth_company_milestones(company_id,trial_started_at,activated_at,first_paid_at) values(company,now(),now()+interval '1 day',now()+interval '15 days');
 perform public.reconcile_tryops_experiments();
 if (select count(*) from public.tryops_trial_links where company_id=company)<>1 then raise exception 'worker did not attach';end if;
 if (select count(*) from public.tryops_outcomes where company_id=company)<>3 then raise exception 'canonical outcomes missing';end if;
 if public.attach_tryops_experiment_trial(tok,company,actor::text)->>'status'<>'already_attached' then raise exception 'attach replay';end if;
 perform public.stage_tryops_experiment_signup(tok,actor2::text);
 if public.retry_tryops_experiment_trial(actor2::text,company2)->>'reason'<>'assignment_already_attributed' then raise exception 'one visitor counted twice';end if;
 -- Never poison a healthy cohort with a random/invented hash or invalid actor.
 select count(*) into before_count from public.tryops_collection_failures;
 r:=public.report_tryops_collection_failure('unknown-hash-fixture','signup_staging_failed',null,repeat('0',64),actor::text);
 if r->>'status'<>'rejected' or (select count(*) from public.tryops_collection_failures)<>before_count then raise exception 'unknown hash poisoned experiment';end if;
 r:=public.report_tryops_collection_failure('wrong-hash-with-known-id','signup_staging_failed',xid,repeat('0',64),actor::text);
 if r->>'status'<>'rejected' or (select count(*) from public.tryops_collection_failures)<>before_count then raise exception 'public UUID bypassed hash';end if;
 r:=public.report_tryops_collection_failure('conflicting-known-identities','signup_staging_failed',xid,encode(extensions.digest('token-1','sha256'),'hex'),actor::text);
 if r->>'status'<>'rejected' or (select count(*) from public.tryops_collection_failures)<>before_count then raise exception 'conflicting identities poisoned experiment';end if;
 r:=public.report_tryops_collection_failure('invalid-actor-fixture','signup_staging_failed',null,th,'not-an-actor');
 if r->>'status'<>'rejected' or (select count(*) from public.tryops_collection_failures)<>before_count then raise exception 'invalid actor poisoned experiment';end if;
 r:=public.report_tryops_collection_failure('known-loss-fixture','signup_staging_failed',null,th,actor::text);
 perform public.report_tryops_collection_failure('known-loss-fixture','signup_staging_failed',null,th,actor::text);
 if r->>'status'<>'recorded' or (select count(*) from public.tryops_collection_failures where experiment_id=eid)<>1 then raise exception 'known loss not idempotent';end if;
 if (public.tryops_cohort(eid)->'arms'->0->>'collectionFailures')::integer<>1 then raise exception 'loss invisible to inference';end if;
 -- Late exclusions remove the same assignment from every measurement surface.
 insert into public.tryops_exclusions(subject_hash,kind,reason) values(repeat('1',64),'visitor','Local fixture');
 if public.tryops_assignment_is_eligible(xid) or public.resolve_tryops_assignment(th,'/') is not null then raise exception 'visitor exclusion still served';end if;
 if public.collect_tryops_event(th,xid,aid,'/',jsonb_build_object('event_id',gen_random_uuid(),'event_type','exposure'))->>'status'<>'rejected' then raise exception 'excluded event collected';end if;
 if public.report_tryops_collection_failure('excluded-loss-fixture','collection_failed',xid,th)->>'status'<>'rejected' then raise exception 'excluded loss counted';end if;
 if (public.tryops_cohort(eid)->'arms'->0->>'collectionFailures')::integer<>0 then raise exception 'excluded loss retained';end if;
 delete from public.tryops_exclusions where subject_hash=repeat('1',64);
 insert into public.tryops_exclusions(subject_hash,kind,reason) values(actor::text,'actor','Local fixture');
 if public.tryops_assignment_is_eligible(xid) then raise exception 'actor exclusion ignored';end if;
 delete from public.tryops_exclusions where subject_hash=actor::text;
 insert into public.tryops_exclusions(subject_hash,kind,reason) values(company::text,'company','Local fixture');
 if public.tryops_assignment_is_eligible(xid) then raise exception 'company exclusion ignored';end if;
 delete from public.tryops_exclusions where subject_hash=company::text;
 update public.users set is_active=false where id=actor;
 if public.stage_tryops_experiment_signup(tok,actor::text)->>'status'<>'rejected' or public.report_tryops_collection_failure('inactive-actor-fixture','signup_staging_failed',null,th,actor::text)->>'status'<>'rejected' then raise exception 'inactive actor accepted';end if;
 update public.users set is_active=true where id=actor;
 -- Stale lease fails and its retry can acquire a fresh lease.
 r:=public.claim_tryops_run('fixture-rollback','rollback');lease:=(r->>'lease_token')::uuid;runid:=(r->>'run_id')::uuid;
 update public.tryops_routes set lease_until=now()-interval '1 second' where route='/';
 begin perform public.rollback_tryops_experiment(1,lease);raise exception 'expired lease rollback';exception when raise_exception then if SQLERRM='expired lease rollback' then raise;end if;end;
 r:=public.claim_tryops_run('fixture-rollback','rollback');lease:=(r->>'lease_token')::uuid;
 perform public.rollback_tryops_experiment(1,lease);
 if (select active_experiment_id from public.tryops_routes where route='/') is not null then raise exception 'rollback pointer';end if;
 perform public.finish_tryops_run(runid,lease,'{"status":"rolled_back"}');
 raise notice 'PASS: permissions, immutable arms, evidence, CAS, leases, assignment uniqueness, replay, spoofing, staged worker recovery, milestones, exact loss, rollback';
end $$;
rollback;
begin;
DO $$
declare e uuid;e2 uuid;a uuid;a2 uuid;x uuid;x2 uuid;actor uuid:=gen_random_uuid();c uuid:=gen_random_uuid();token text:=repeat('B',43);hash text:=encode(extensions.digest(repeat('B',43),'sha256'),'hex');r jsonb;lease uuid;runid uuid;snapshot jsonb;
begin
 insert into public.users(id,company_id) values(actor,c);
 insert into public.companies(id,account_holder_id,trial_start_date) values(c,actor::text,now()-interval '1 day');
 insert into public.tryops_experiments(route,intent,hypothesis,registry_version,baseline_rate,baseline_source,absolute_mde,sample_per_arm,enrollment_starts_at,enrollment_ends_at,conversion_window_days,quality_window_days,activation_margin)
 values('/','general','Temporal fixture hypothesis','v1',.02,'Temporal fixture baseline',.01,3826,now()-interval '30 days',now()-interval '20 days',7,7,.01) returning id into e;
 insert into public.tryops_arms(experiment_id,slot,config,section_ids,config_hash) values(e,'a','{"sections":[1,2,3,4]}','[]',repeat('a',64)) returning id into a;
 insert into public.tryops_arms(experiment_id,slot,config,section_ids,config_hash) values(e,'b','{"sections":[1,2,3,4]}','[]',repeat('b',64));
 insert into public.tryops_assignments(experiment_id,arm_id,config_hash,visitor_hash,token_hash,route,intent,created_at,expires_at) values(e,a,repeat('a',64),repeat('c',64),hash,'/','general',now()-interval '10 days',now()+interval '1 day') returning id into x;
 perform public.stage_tryops_experiment_signup(token,actor::text);
 insert into public.tryops_exposures(assignment_id,exposed_at) values(x,now());
 if public.retry_tryops_experiment_trial(actor::text,c)->>'reason'<>'trial_before_exposure' then raise exception 'late received exposure backdated';end if;
 update public.tryops_exposures set exposed_at=now()-interval '9 days' where assignment_id=x;
 if public.retry_tryops_experiment_trial(actor::text,c)->>'reason'<>'outside_conversion_window' then raise exception 'late trial counted';end if;
 update public.tryops_exposures set exposed_at=now()-interval '2 days' where assignment_id=x;
 update public.tryops_assignments set expires_at=now()-interval '1 second' where id=x;
 update public.tryops_signup_bindings set first_received_at=now()-interval '2 days',state='pending' where actor_id=actor;
 if public.resolve_tryops_assignment(hash,'/') is not null then raise exception 'expired assignment rendered';end if;
 -- Delayed attachment is valid because both stage receipt and trial were before original expiry.
 if public.retry_tryops_experiment_trial(actor::text,c)->>'status'<>'attached' then raise exception 'valid delayed trial lost';end if;
 if public.retry_tryops_experiment_trial(actor::text,c)->>'status'<>'already_attached' then raise exception 'expired replay lost';end if;
 -- New actors cannot stage an already expired bearer.
 actor:=gen_random_uuid();insert into public.users(id) values(actor);
 if public.stage_tryops_experiment_signup(token,actor::text)->>'reason'<>'expired_assignment' then raise exception 'expired bearer staged';end if;
 -- Fresh experiments always use fresh arms; FK forbids pooling old arm identity.
 insert into public.tryops_experiments(route,intent,hypothesis,registry_version,baseline_rate,baseline_source,absolute_mde,sample_per_arm,enrollment_starts_at,enrollment_ends_at,conversion_window_days,quality_window_days,activation_margin)
 values('/','general','Fresh experiment hypothesis','v1',.02,'Fresh fixture baseline',.01,3826,now(),now()+interval '1 day',7,7,.01) returning id into e2;
 begin insert into public.tryops_assignments(experiment_id,arm_id,config_hash,visitor_hash,token_hash,route,intent,expires_at) values(e2,a,repeat('a',64),repeat('d',64),repeat('e',64),'/','general',now()+interval '1 day');raise exception 'cross experiment arm reused';exception when foreign_key_violation then null;end;
 update public.tryops_experiments set state='active' where id=e;
 r:=public.claim_tryops_run('freeze-fixture','evaluate');lease:=(r->>'lease_token')::uuid;runid:=(r->>'run_id')::uuid;
 snapshot:=jsonb_build_object('status','inconclusive','reason','insufficient_sample','cohort',public.tryops_cohort(e));
 perform public.complete_tryops_experiment(e,snapshot,lease);
 begin update public.tryops_experiments set decision='{}' where id=e;raise exception 'frozen decision overwritten';exception when raise_exception then if SQLERRM='frozen decision overwritten' then raise;end if;end;
 if public.complete_tryops_experiment(e,snapshot,lease) is distinct from snapshot then raise exception 'completed retry changed snapshot';end if;
 perform public.finish_tryops_run(runid,lease,'{"status":"frozen"}');
 raise notice 'PASS: no backdating, late trials, original-time delayed recovery, expired tokens/replays, cross-experiment reuse blocked, frozen decisions';
end $$;
rollback;

begin;
DO $$
declare r jsonb;res jsonb;spec jsonb;arm jsonb;runid uuid;lease uuid;n integer;
begin
 spec:=jsonb_build_object('hypothesis','Atomic fixture hypothesis','registryVersion','v1','baselineRate',.02,'baselineSource','Isolated atomic fixture','absoluteMde',.01,'samplePerArm',3826,'enrollmentStartsAt',now(),'enrollmentEndsAt',now()+interval '1 day','conversionWindowDays',7,'qualityWindowDays',7,'activationNonInferiorityMargin',.01);
 arm:='{"config":{"sections":[1,2,3,4]},"sectionIds":["h","p","f","c"]}';
 r:=public.claim_tryops_run('atomic-prepare','prepare','payload-hash');runid:=(r->>'run_id')::uuid;lease:=(r->>'lease_token')::uuid;
 res:=public.execute_tryops_operation(runid,lease,'prepare',jsonb_build_object('spec',spec,'control',arm,'challenger',arm));
 if public.claim_tryops_run('atomic-prepare','prepare','payload-hash')->'result' is distinct from res then raise exception 'lost-response retry not idempotent';end if;
 if (select count(*) from public.tryops_experiments)<>1 then raise exception 'duplicate draft';end if;
 begin perform public.claim_tryops_run('atomic-prepare','prepare','different-hash');raise exception 'key reused across payload';exception when raise_exception then if SQLERRM='key reused across payload' then raise;end if;end;
 r:=public.claim_tryops_run('atomic-failure','prepare','bad-payload');runid:=(r->>'run_id')::uuid;lease:=(r->>'lease_token')::uuid;
 select count(*) into n from public.tryops_experiments;
 begin perform public.execute_tryops_operation(runid,lease,'prepare',jsonb_build_object('spec',spec,'control',arm,'challenger','{}'::jsonb));raise exception 'invalid draft persisted';exception when not_null_violation then null;end;
 if (select count(*) from public.tryops_experiments)<>n then raise exception 'half draft survived failure';end if;
 perform public.finish_tryops_run(runid,lease,'{"status":"failed"}','invalid_draft');
 if (select state from public.tryops_runs where id=runid)<>'failed' then raise exception 'failure state missing';end if;
 raise notice 'PASS: mutation and success atomic, lost-response retry, payload binding, failure rollback, durable failure';
end $$;
rollback;
begin;
DO $$
declare e uuid;a uuid;x uuid;u uuid;c uuid;last_company uuid;i integer;before_pointer uuid;r jsonb;lease uuid;runid uuid;winner uuid;decision jsonb;
begin
 insert into public.tryops_experiments(route,intent,hypothesis,registry_version,baseline_rate,baseline_source,absolute_mde,sample_per_arm,enrollment_starts_at,enrollment_ends_at,conversion_window_days,quality_window_days,activation_margin,state,evidence)
 values('/','general','Fair recovery hypothesis','v1',.02,'Fair recovery fixture',.01,3826,now()-interval '1 day',now()+interval '1 day',7,7,.01,'active','{}') returning id into e;
 insert into public.tryops_arms(experiment_id,slot,config,section_ids,config_hash) values(e,'a','{"sections":[1,2,3,4]}','[]',repeat('a',64)) returning id into a;
 insert into public.tryops_arms(experiment_id,slot,config,section_ids,config_hash) values(e,'b','{"sections":[1,2,3,4]}','[]',repeat('b',64)) returning id into winner;
 update public.tryops_routes set active_experiment_id=e,incumbent_arm_id=a where route='/';
 for i in 1..121 loop
  u:=gen_random_uuid();c:=gen_random_uuid();
  insert into public.users(id,company_id) values(u,c);
  insert into public.companies(id,account_holder_id,trial_start_date) values(c,case when i<=20 then gen_random_uuid()::text else u::text end,now());
  insert into public.tryops_assignments(experiment_id,arm_id,config_hash,visitor_hash,token_hash,route,intent,expires_at) values(e,a,repeat('a',64),encode(extensions.digest('fairvisitor'||i::text,'sha256'),'hex'),encode(extensions.digest('fairtoken'||i::text,'sha256'),'hex'),'/','general',now()+interval '1 day') returning id into x;
  insert into public.tryops_signup_bindings(actor_id,assignment_id,first_received_at) values(u,x,now()-interval '1 day'+i*interval '1 second');
  if i=121 then insert into public.tryops_exposures(assignment_id) values(x);last_company:=c;end if;
 end loop;
 perform public.reconcile_tryops_experiments();
 if (select count(*) from public.tryops_signup_bindings where state='rejected')<>20 then raise exception 'ineligible bindings not terminal';end if;
 perform public.reconcile_tryops_experiments();
 if not exists(select 1 from public.tryops_trial_links where company_id=last_company) then raise exception '>100 older bindings starved eligible trial';end if;
 if exists(select 1 from public.tryops_signup_bindings where state='pending' and next_attempt_at<=now()) then raise exception 'pending rows still monopolize due queue';end if;
 raise notice 'PASS: 121 mixed bindings; terminal ineligible rows, fair pending retry, later eligible trial recovered without revisit';
 -- Test decision-vs-serving contract on a fixture matured before this transaction.
 alter table public.tryops_experiments disable trigger tryops_frozen_plan;
 update public.tryops_experiments set enrollment_starts_at=now()-interval '30 days',enrollment_ends_at=now()-interval '20 days' where id=e;
 alter table public.tryops_experiments enable trigger tryops_frozen_plan;
 decision:=jsonb_build_object('status','promote_challenger','reason','statistical-fixture','cohort',public.tryops_cohort(e));
 r:=public.claim_tryops_run('evaluate-no-publish','evaluate');lease:=(r->>'lease_token')::uuid;runid:=(r->>'run_id')::uuid;
 perform public.execute_tryops_operation(runid,lease,'evaluate',jsonb_build_object('experimentId',e,'decision',decision));
 if (select incumbent_arm_id from public.tryops_routes where route='/')<>a then raise exception 'evaluation published winner';end if;
 r:=public.claim_tryops_run('explicit-promote','promote');lease:=(r->>'lease_token')::uuid;runid:=(r->>'run_id')::uuid;
 perform public.execute_tryops_operation(runid,lease,'promote',jsonb_build_object('experimentId',e,'expectedVersion',0));
 if (select incumbent_arm_id from public.tryops_routes where route='/')<>winner then raise exception 'explicit winner publication failed';end if;
 r:=public.claim_tryops_run('repeat-promote-new-key','promote');lease:=(r->>'lease_token')::uuid;runid:=(r->>'run_id')::uuid;
 if public.execute_tryops_operation(runid,lease,'promote',jsonb_build_object('experimentId',e,'expectedVersion',1))->>'status'<>'already_published' then raise exception 'repeat promotion not idempotent';end if;
 if (select previous_incumbent_arm_id from public.tryops_routes where route='/')<>a then raise exception 'repeat promotion erased rollback';end if;
 r:=public.claim_tryops_run('rollback-promoted-winner','rollback');lease:=(r->>'lease_token')::uuid;runid:=(r->>'run_id')::uuid;
 perform public.execute_tryops_operation(runid,lease,'rollback','{"expectedVersion":1}');
 if (select incumbent_arm_id from public.tryops_routes where route='/')<>a then raise exception 'winner rollback lost control';end if;
 raise notice 'PASS: evaluate keeps serving unchanged; explicit promotion, repeat under new key, rollback to control';
end $$;
rollback;

begin;
DO $$
declare u uuid:=gen_random_uuid();c uuid:=gen_random_uuid();r jsonb;receipt uuid;
begin
 insert into public.users(id,company_id,email) values(u,c,'operator-fixture@example.invalid');
 insert into public.companies(id,account_holder_id) values(c,u::text);
 insert into public.admins(email) values('operator-fixture@example.invalid');
 insert into public.tryops_health_notifications(dedupe_key,reason,payload) values('health-fixture','signup_staging_failed','{"title":"UNTRUSTED TITLE","actionUrl":"https://invalid.example"}');
 r:=public.drain_tryops_health_notifications(gen_random_uuid(),c,20);
 if r->>'status'<>'rejected' or exists(select 1 from public.notifications) then raise exception 'unknown recipient received notification';end if;
 r:=public.drain_tryops_health_notifications(u,c,20);
 if (r->>'delivered')::integer<>1 then raise exception 'rail delivery failed: %',r;end if;
 select notification_id into receipt from public.tryops_health_notifications where dedupe_key='health-fixture';
 if receipt is null or not exists(select 1 from public.notifications where id=receipt and user_id=u::text and company_id=c::text and type='tryops_experiment_health' and persistent=true and action_url='/admin/analytics' and title<>'UNTRUSTED TITLE') then raise exception 'rail recipient/content receipt mismatch';end if;
 -- A lost delivery receipt can reconcile even after the operator read/resolved it.
 update public.notifications set is_read=true,resolved_at=now() where id=receipt;
 update public.tryops_health_notifications set delivered_at=null,notification_id=null where dedupe_key='health-fixture';
 perform public.drain_tryops_health_notifications(u,c,20);
 if (select count(*) from public.notifications)<>1 then raise exception 'resolved rail replay duplicated';end if;
 if (select notification_id from public.tryops_health_notifications where dedupe_key='health-fixture')<>receipt then raise exception 'lost exact receipt';end if;
 raise notice 'PASS: actual notification helper, exact recipient, fixed copy/action, atomic durable receipt, dedupe after read/resolution';
end $$;
rollback;

begin;
create function public.fixture_notification_fail() returns trigger language plpgsql as $$ begin raise exception 'fixture delivery unavailable';end $$;
create trigger fixture_notification_fail before insert on public.notifications for each row execute function public.fixture_notification_fail();
DO $$
declare u uuid:=gen_random_uuid();c uuid:=gen_random_uuid();r jsonb;
begin
 insert into public.users(id,company_id) values(u,c);
 insert into public.companies(id) values(c);
 insert into public.tryops_health_notifications(dedupe_key,reason,payload) values('retry-health-fixture','collection_failed','{}');
 if public.drain_tryops_health_notifications(u,c,20)->>'status'<>'rejected' then raise exception 'nonadmin null-holder recipient allowed';end if;
 update public.companies set account_holder_id=u::text where id=c;
 r:=public.drain_tryops_health_notifications(u,c,20);
 if r->>'failed'<>'1' or r->>'pending'<>'1' or exists(select 1 from public.notifications) or exists(select 1 from public.tryops_health_notifications where delivered_at is not null or notification_id is not null) then raise exception 'failed delivery falsely receipted: %',r;end if;
 drop trigger fixture_notification_fail on public.notifications;
 -- Simulate the next scheduled due run after a transient persistence failure.
 update public.tryops_health_notifications set next_attempt_at=now();
 r:=public.drain_tryops_health_notifications(u,c,20);
 if r->>'delivered'<>'1' or r->>'pending'<>'0' or (select count(*) from public.notifications where action_url is null)<>1 then raise exception 'delivery recovery failed: %',r;end if;
 raise notice 'PASS: invalid nonadmin recipient; notification failure stays pending; retry creates exactly one receipt without unauthorized admin link';
end $$;
rollback;
