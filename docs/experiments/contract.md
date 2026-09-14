# TryOps experiment contract v1 — agreed September 14, 2026

Owners: P1-1 engine/schema; P1-2 authenticated OPS-Web handoff; P1-3 approved landing content. Local implementation only. Current signatures below supersede all earlier proposals.

## Identity and transport

`__ops_experiment`: opaque 32-byte random bearer, 43 base64url characters. Secure, HttpOnly, SameSite=Lax, Path=/, Domain=.opsapp.co, maximum cookie age 30 days. DB stores only SHA256 hex. No PII or unsigned arm/config claims; no URL propagation. OPS-Web reads this cookie server-side through auth/provider returns. Never put it in user-editable setup_progress JSON or logs.

A host-only HttpOnly `__ops_experiment_visitor` holds a separate random visitor identity. One assignment per visitor-hash/experiment; cookies approximate browsers, not humans. Tutorial ops_variant and marketing __ops_first_touch are independent. Missing bearer does not reassign an existing visitor or recover plaintext from its hash.

Immutable assignment identity: UUID, experiment UUID, fresh arm UUID, frozen config hash, route=/, intent=general, server created_at and expires_at. Expiry is min(created+30 days, enrollment end+conversion window). P1 begins with root only; seven paid pages remain approved fixed pages. Preview URL flags, QA/internal flags, known bot signatures and local/preview hosts are excluded. Detection is not perfect human identification.

Renderer receives config, variantId (arm UUID or fixed paid:*/fallback identity), optional assignmentId, ctaMode=web-signup. Experimental content has no hidden UTM substitutions. Preview visits never create evidence. CTA uses native registration link; no assignment JS/query parameter is needed.

## Exposure and diagnostics

POST /api/ab-events requires bounded event_id UUID, assignment_id UUID, variant_id arm UUID, route=/ and the opaque cookie for experimental events. Server resolves the exact cookie/assignment/arm/route; browser timestamp is never accepted. Event ID is replay safe; exposure is unique per assignment and must first arrive during enrollment. First visible-tab exposure starts the cohort. Section views occur on first visibility, unique per assignment/section; dwell counts visible-tab intervals and flushes once on exit/pagehide. Diagnostics never choose a winner.

Browser signup_complete is rejected for experiments and never increments a business counter. Existing fixed-page telemetry remains in onboarding_events, including legacy diagnostic signup events, with no UUID coercion and no canonical conversion effect (repair da0b609).

## Authenticated server handoff

P1-2 verifies the session and resolves canonical public.users.id (UUID serialized text), not Firebase UID. SQL functions below are SECURITY INVOKER, revoked from PUBLIC/anon/authenticated, granted service_role only. No public browser can call them directly. Company holder, user company membership, deletion/exclusion, real trial timing and assignment uniqueness are rechecked in SQL.

`stage_tryops_experiment_signup(p_token text,p_actor_id text) -> jsonb`

Stores actor + assignment ID + first_received_at; no plaintext bearer. Returns staged, already_staged, pending with reason=no_exposure, or rejected with invalid_actor, invalid_token, actor_already_staged, expired_assignment. Stage must first be received before assignment expiry. Existing matching staging may be retried after expiry. Pending no_exposure retains the binding; it never creates/backdates exposure.

`retry_tryops_experiment_trial(p_actor_id text,p_company_id uuid) -> jsonb`

Returns attached/already_attached with assignment_id,experiment_id,arm_id,trial_started_at; pending with no_exposure/trial_not_ready; or rejected with invalid_actor,no_staged_assignment,ineligible_company,company_already_attributed,assignment_already_attributed,expired_assignment,trial_before_exposure,outside_conversion_window. Pending is bounded to assignment expiry+one day. Original trial must occur at/after real exposure and before both assignment expiry and exposure+conversion window. Delayed persistence after expiry is allowed only when original stage and trial qualify. Company and assignment are each globally unique trial links, so replays cannot inflate visitor conversion.

`attach_tryops_experiment_trial(p_token text,p_company_id uuid,p_actor_id text) -> jsonb`

Atomically stages then retries. Same outcomes. Missing migration, network errors and database errors are retryable infrastructure failures, not successful empty results. Signup remains usable on measurement failure.

`reconcile_tryops_experiments() -> {status:'reconciled',attempted:number}`

Worker drains due staged users with company membership, ordered by next_attempt_at/first_received_at/actor_id and bounded to 100 per run. Pending rows get a five-minute next due time; ineligible current-company bindings become terminal. Old pending rows cannot monopolize every run. Records attempt/time/reason. No user revisit required after durable staging. Canonical growth_company_milestones supplies activation and paid; one company/milestone row. No new Google conversion uploader/outbox semantics and no invented iOS linkage.

## Pre-staging failure and integrity

P1-2 uses bounded postresponse server recovery after the initial staging write fails. Only exhausted recovery reports terminal measurement loss; a transient recovered attempt must not poison the study. If a failure occurs before any durable write and the database stays unavailable, no DB-backed promise of recovery is possible. Emit structured measurement_lost with a correlation key and keep affected inference behind runtime/collection health review.

`report_tryops_collection_failure(p_key text,p_reason text,p_assignment_id uuid DEFAULT NULL,p_token_hash text DEFAULT NULL,p_actor_id text DEFAULT NULL) -> jsonb`

For signup loss: reason=signup_staging_failed, token SHA256 hash + canonical active actor required. For event collection loss: reason=collection_failed and validated hash/assignment pair. Every supplied identity must agree. Unknown hash, mismatched ID/hash, excluded assignment, invalid/inactive actor, or conflicting prior actor binding returns rejected with invalid_assignment/invalid_actor and causes ZERO mutation. No route-wide fallback. A valid known loss returns recorded, is idempotent by p_key, maps only to the exact experiment, and prevents inference. Successful event retry resolves that event's collection failure; staging loss is emitted only after recovery is exhausted. Raw token/hash is never logged.

## Content and experiment lifecycle

P1-3 exports CONTENT_REGISTRY_VERSION and source-backed APPROVED_* facts from lib/landing/content-registry.ts; APPROVED_SECTIONS from page-configs.ts maps exact ID to {section,factIds,validUntil}. Root draft selections use general.* IDs. Empty approved testimonials mean no fabricated endorsements. Hero product-proof/comparisonRival schema is owned by P1-1. Required acquisition order: Hero first, PricingSection/FAQSection present, ClosingCTA last, one of each type, coherent web-trial action. Exact section copy is immutable; rejected model output retains failure reason instead of being sanitized.

Draft -> validated -> active -> completed/inconclusive/invalid; rollback -> rolled_back. Each comparison creates fresh arm IDs/hashes, predeclared baseline/source, MDE/sample/horizon/maturity/activation guardrail. Fixed-horizon balanced two-proportion inference; no default baseline, no zero/zero winner, no insufficient-sample winner, SRM/collection failure invalid. Completed decision stores frozen cohort snapshot.

Run leases/CAS protect exclusive prepare/validate/publish/promote/rollback/evaluate. The route row is locked before a fresh same-key run read; completed same-key operations replay the exact stored result. A request hash binds keys to their original payload. execute_tryops_operation commits each business mutation and run success in the same transaction, preventing duplicate drafts after a lost response. Incumbent stays available during preparation. Exact-hash evidence includes content, desktop, mobile, CTA, accessibility, tracking, signup and local A/A proof. aa:true specifically attests the disposable identical-config SQL allocation/replay fixture and equal-nonzero-cohort no-effect decision test in engine/operations.md. It never claims a production identical-arm study; operator prepare rejects identical_treatment, so that production study mode is unsupported. Pointer change is atomic. Statistical evaluate stores a frozen decision only and never changes incumbent_arm_id. Explicit gated promote rechecks current cohort against the frozen snapshot and current registry/content expiry before publishing the winner. Repeating promotion under a new key preserves the prior incumbent and version; rollback still restores control. Automatic publish is always false; enrollment, model generation, and explicit operator publishing gates each default off. Existing model adapter is functional but no metered call is executed in this build. Cron only runs recovery/health. Missing migration serves approved control and returns operator/collection 503. Landing middleware and rendering each share a total 600ms lookup budget across sequential calls. Deadline abort plus promise race returns approved control even if a client ignores abort. Two serial phases can add about1200ms plus platform/rendering work; this is a code/test bound, not customer performance proof. A timed-out middleware result provides no assignment cookie/exposure identity.

Health distinguishes no_experiment, low_traffic (zero assigned), measurement_unverified (assigned visits with zero confirmed exposures, actual counts + review message), no_mature_cohort, ready_for_fixed_horizon_review, decision_complete and collection_failure. No inference from empty/missing collection. Central eligibility applies visitor, staged actor and linked/current company exclusions consistently to resolver, events, loss records and cohort/section metrics. Frozen cohorts remain immutable; changed current evidence queues review.

`drain_tryops_health_notifications(p_user_id uuid,p_company_id uuid,p_limit integer DEFAULT20)` returns {status:drained,delivered,pending,failed} or {status:rejected,reason:invalid_recipient}. Configured active company holder/admin is rechecked in SQL. This is called by the existing OPS-Web analytics-health daily cron (10:46 UTC). Exact notification receipt + outbox delivery commit atomically. Fixed server copy ignores payload title/action; only verified OPS admins receive the admin analytics action. Failure remains pending with five-minute next due time; the existing daily consumer determines actual retry cadence. A partial durable notification dedupe index plus exact receipt lookup prevents duplicates even after read/resolved. No email/push/Slack sender added.

Migration ownership: P1-1 only, supabase/migrations/20260914211447_tryops_trustworthy_experiments.sql. No production DDL/write authorized. PM owns Bible mirrors and release coordination. Local proof and release limits are in engine/operations.md and engine/statistical-method.md.
