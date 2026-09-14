# Experiment operation and release boundary

Local source only; no deployment, production migration, model call, experiment enrollment, ad spend, or external message was executed.

## Release ordering

1. Review integrated content/CTA/registration proof and SQL/tests. Apply the single new TryOps migration only with explicit production migration approval. Existing ab_* historical rows remain historical; no counters/rates are copied.
2. Deploy coordinated TryOps + OPS-Web source only with explicit push/deploy approval. The revised approved root works without migrations. Missing new infrastructure never revives legacy generation/rotation and operator calls return 503.
3. Required existing secrets: server-only SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY, AB_ADMIN_SECRET, CRON_SECRET. Assignment is an opaque HttpOnly shared cookie; no signing secret or public token query string. No new paid vendor.
4. AB_EXPERIMENTS_ENABLED defaults off. AB_GENERATION_ENABLED defaults off. AB_PUBLISH_ENABLED defaults off. Database automatic_publish is constrained false. Existing daily cron invokes recovery/health only; it cannot generate, decide, or publish.
5. Establish measured eligible baseline/source and A/A evidence, then predeclare sample/MDE/enrollment/conversion/quality windows. No default enrollment. For root only, use approved general.* section IDs and CONTENT_REGISTRY_VERSION. Seven paid pages remain fixed diagnostic sources.
6. Authenticated POST /api/ab-rotate takes a bounded operation, unique key, and required payload. Operations are prepare (approved section selection or explicitly enabled model adapter), validate (exact arm hashes + content/desktop/mobile/CTA/accessibility/tracking/signup/A-A evidence + artifact reference), publish (expected route version), evaluate (fixed-horizon decision only), promote (explicit reviewed winner publication and expected version), rollback (expected version), health. Legacy force rotation is rejected. Operator credentials remain server-only.
7. Prepare leaves incumbent serving. Publish is a short SQL pointer transaction under current lease/CAS; incomplete evidence, stale version/token, active incumbent cohort, or expired enrollment rejects atomically. A failed run is durable and its deduplicated outbox row is consumed by OPS-Web’s existing analytics-health daily cron at10:46UTC. The drain uses create_notification_if_new_with_identity and atomically records the exact notification ID. Existing read/resolved receipt lookup and a scoped durable unique index avoid duplicates. Persistence failure stays pending; five-minute due time prevents tight retries, but actual retry latency is the existing daily schedule. No external email/push/Slack send. This coordinated consumer is locally implemented/tested, not deployed.
8. Before enabling measured enrollment, confirm browser-exposure collection, server trial attachment, recovery, and loss reporting on approved isolated/canary evidence. Model costs remain the existing metered OpenAI integration: no calls were made; research/approve configured-model cost before enabling generation.

## Runtime failures and recovery

500/503 is never converted into an empty successful cohort. Event route validates signed-equivalent opaque cookie lookup, arm, assignment, route, bounded diagnostics and server-received timestamps. Fixed paid IDs still use onboarding_events. Browser signup_complete never establishes an experiment conversion.

Service-only stage/retry binding owns actor/assignment reference and timestamps, not a raw bearer. The web owner uses authenticated canonical users.id. Worker reconciliation drains due pending bindings without a revisit, ordered by due time and first receipt. Terminal ineligible rows stop retrying; pending rows move forward five minutes so later eligible rows cannot starve. Delayed actual exposure is not backdated. Canonical trial must precede original expiry and conversion window; only already-staged bindings recover after bearer expiry.

Exhausted pre-staging recovery is recorded by report_tryops_collection_failure with exact SHA256 token hash and verified active actor. Unknown hash, conflicting assignment identity, or invalid actor is rejected with no mutation. A valid known loss prevents inference. Visitor, staged actor and company exclusions use one central eligibility predicate across serving, collection, losses and cohort metrics. If PostgreSQL itself remains unavailable, no DB-backed recovery mechanism can guarantee persistence; structured web measurement_lost logs with correlation ID must be reviewed and affected studies held from inference. Do not claim universal durability.

A lease lasts 120 seconds. Model request timeout is 90 seconds, no automatic metered retries. Lost/stale workers cannot publish or finish another worker's run; retry uses the same key and completed work returns its prior result. Every mutation and successful result commit together in execute_tryops_operation. The route lock precedes the fresh run lookup; a blocked same-key caller sees success committed while it waited. Failed preparation retains its failure reason in run state. No half-published pointer. Evaluation never changes serving; explicit promote compares frozen/current evidence and changes the incumbent once. A repeated promote under a different key preserves rollback history.

## Landing availability and health

Middleware and rendering each have one600ms total lookup deadline shared across sequential queries, using abort and a promise race even for an uncooperative client. Worst case two sequential phases add about1200ms, excluding platform scheduling, rendering and other work. This is locally tested behavior, not observed customer latency. Deadline fallback never claims an assignment/exposure. Operator/recovery RPCs retain their separately controlled lease/timeout behavior.

No experiment, zero assigned traffic, assigned-but-no-confirmed-exposure, immature cohort, mature review and collection failure are distinct health states. measurement_unverified includes assigned/exposed counts and a review instruction; it neither fabricates tracking failure nor promotes a winner.

## Rollback and canary

Disable enrollment with AB_EXPERIMENTS_ENABLED=false to serve current approved code control immediately; this is a production config change requiring approval. Operator rollback under enabled explicit publishing gate requires current route version/lease and restores the previous pointer (or seed if none). It never pools the old experiment into a new one. Keep DB ledger for audit; no destructive down-migration required.

After authorized release, verify exact deployed commit/migration identity, root/7 routes and CTA destination, cookie attributes on TryOps/app subdomains, a naturally occurring server-established eligible trial and safe retry readback, cohort uniqueness, runtime failure records and existing rail delivery. Local tests are not a live authenticated canary or customer performance proof. iOS attribution remains unknown unless separately supported.

## Exact prelaunch A/A protocol

The validation evidence field aa:true means the local no-effect protocol below passed. It does not assert a live A/A enrollment or replace a production canary. Production identical-arm studies are not supported by the operator: prepare rejects identical_treatment. A future production A/A study would need a deliberate study-mode extension; this release does not claim it exists.

1. Use only the disposable PostgreSQL fixture, loading tests/sql/experiment-fixture.sql, the exact existing-notification-function.sql, the new migration, then experiment-contract.sql. The contract fixture supplies identical control/challenger section configurations with distinct frozen arm IDs, runs1000 random assignments and checks balanced allocation, uniqueness, visible exposure, authenticated trial recovery and exact replay. Each fixture rolls back.
2. Run tests/experiment-decision.test.ts. The local A/A case has equal5000 exposed visitors,100 verified trials and80 activated visitors in each fully mature arm and must return inconclusive/no_supported_difference with zero effect. Zero outcomes, insufficient sample, collection failure and SRM fixtures also must never promote.
3. Record those local logs with the reviewed source/migration identity in artifactRef alongside the actual treatment hashes and separate content/desktop/mobile/CTA/accessibility/tracking/signup checks. Only then set aa:true for validation of a distinct-content A/B draft. It is an operator evidence attestation, not an automatic claim of causal validity or production data quality.
