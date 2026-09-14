# TryOps Conversion Rebuild Implementation Plan

> Executing agents: use `custom-skills:executing-plans`. Jackson authorized planning and delegated execution on September 14, 2026. The PM owns engineering decisions, review, and integration. Do not add a founder technical-plan approval gate.

**Goal:** Build a persuasive TryOps acquisition experience whose experiments measure real trials and cannot publish an invalid page or declare an unsupported winner.

**Architecture:** Preserve the section renderer and existing company/attribution business truth. Introduce versioned content, fresh experiment arms, durable assignments/exposures, server-confirmed conversion attachment, and an atomic draft-to-active lifecycle. The default landing experience remains available when measurement or generation fails; automatic promotion stays disabled until the full evidence gate passes.

**Stack:** Existing Next.js/React/TypeScript/Tailwind, Supabase/Postgres, existing auth and analytics integrations. No new paid vendor, ad spend, model API run, or external publishing is authorized.

**Design system:** `/Users/jacksonsweet/Projects/OPS/ops-design-system/project/DESIGN.md` and `colors_and_type.css`, including the marketing kit. Existing skill examples with Kosugi/Bebas, obsolete colors, or spring motion do not override this source.

**Required skills:** `superpowers:brainstorming`, `custom-skills:writing-plans`, `custom-skills:executing-plans`, `superpowers:using-git-worktrees`, `superpowers:systematic-debugging`, `superpowers:test-driven-development`, `superpowers:verification-before-completion`, plus each owner's domain skills below. Apply skills by reading their actual SKILL.md and relevant references; naming them in a final answer is not evidence of use.

## Authority, coordination, and delivery

- PM task: `01a0a1a5-3b37-77f2-93cc-92d940ef5566`, titled `AUDIT TRY OPS`.
- Initiative: `TRYOPS CONVERSION`. First build phase: P1. Spawn ordinals 1, 2, 3 are engine, attribution, experience. P2 is integrated verification and release preparation.
- Implement, test, and make atomic local commits in assigned worktrees. Do not push, deploy, modify live database/configuration, change Google Ads, send external messages, or make real accounts. Production migrations and environment changes are prepared only.
- Read-only Supabase/Vercel access is authorized. Inspect live schemas/RLS before queries. Local browser verification must not write production telemetry or create business records.
- Existing Google Ads campaigns remain outside this implementation's mutation authority. Last year's data informs mobile priority and concrete language, not a promise of channel ROI.
- Do not modify the primary dirty OPS-Web or Bible checkouts. Do not stash/reset/restore others' work, sweep-stage files, or rewrite shared history.
- Report milestones, integration contracts, and blockers to the PM using `send_message_to_thread`; also write durable reports under the shared artifact directory below. Continue independent work while contract questions are resolved. Do not make Jackson act as messenger or technical reviewer.
- Do not spawn additional sessions without PM coordination. Serialize expensive builds and SQL harnesses using an atomic directory lease at `docs/artifacts/tryops-conversion-build-2026-09-14/build-lock`; put owner and PID inside, release only your lease. Focused tests can run independently. Never clear another active owner's lock.
- Completion report must contain exact commits, changed paths, tests and actual results, screenshots for visual work, skills/plugins used with applications, local/live distinction, known limits, and a release/rollback checklist.

## Inputs and baselines

- Audit: `/Users/jacksonsweet/Projects/OPS/docs/artifacts/tryops-conversion-review-2026-09-14/review.md`; evidence and screenshots beside it.
- Shared build artifacts/reports: `/Users/jacksonsweet/Projects/OPS/docs/artifacts/tryops-conversion-build-2026-09-14/`.
- TryOps production observed in audit: `525b64b8598de334a1442f29f3b7f66fc50c3d71`. Reverify production identity when needed; this is a dated audit snapshot.
- All new TryOps work starts at `bde201b`, comprising local main `ab2b3f1` with the existing paid telemetry repair `da0b609`, plus the existing FAQ correction from `e5b899a`.
- OPS-Web starts at local main `5f4b1e59b41a6c334f75fb9ae561b80ebdf5b463`. Bible worktree starts at `3b23314`. The primary Bible has additional uncommitted analytics notes: read them for context, never overwrite them.
- Consult Bible `21_ANALYTICS_SYSTEM.md`, `22_GROWTH_MEASUREMENT_CONTRACT.md`, `03_DATA_ARCHITECTURE.md`, `04_API_AND_INTEGRATION.md`, and the Google Ads measurement plan/spec. These older documents contain historical release permissions: they do not authorize production writes in this project.
- Existing business definitions must remain intact: trial = server-established eligible company/owner; activation = the established first real project milestone; paid = confirmed billing truth. Do not add a competing Google conversion uploader or redefine business milestones.

## Product direction

The selected approach is a controlled rebuild of measurement and publishing, paired with a stronger control page. A visual-only refresh leaves invalid learning intact; a complete application replacement discards useful rendering infrastructure. We retain the infrastructure that earns its place.

Primary action on the rebuilt root and paid acquisition pages: start a free trial through `https://app.opsapp.co/register`. Retain the legacy tutorial routes and explicit download path for their existing users. Do not change OPS-Site's organic acquisition strategy.

Keep the root control headline: **JOB MANAGEMENT YOUR CREW WILL ACTUALLY USE**. Working supporting direction: put the address, schedule, job notes, and photos in one place; the crew knows what to do and the owner stops chasing updates. Verify every capability/offer before publishing copy. CTA labels must describe their real action. No invented testimonials, customer identities, ROI, migration services, offline coverage, or roadmap availability.

Preserve seven paid routes and tailor their first answer to intent. Do not start seven simultaneous experiments. Job-management visitors need a clear owner outcome and readable crew screen; pricing visitors need crew-size prices immediately; switchers need honest fit/switching guidance; trade pages need a concrete supported workflow. No hidden UTM headline substitutions under one treatment identity.

### Layout exploration and selected structure

Four structural alternatives were considered:

1. Hierarchical: promise/action → product screen → proof → outcomes → prices → FAQ. Strongest general acquisition control.
2. Grid: overview of capabilities/prices in parallel panels. Useful for returning evaluators, too much scanning for a new mobile visitor.
3. Flow: guided demo followed by signup. Useful as optional exploration, adds an unnecessary gate before trying the product.
4. Hybrid: concise promise/action plus immediate comparison, then product proof. Selected for competitor/pricing routes.

General desktop: `[promise + reassurance + CTA] [legible real product screen]`, then outcome/proof content, compact price comparison, objections, repeated CTA.

Phone: `[promise] [useful subhead] [CTA + trial reassurance] [legible product screen] [outcomes/evidence] [three prices] [FAQ] [CTA]`. Natural scrolling; no forced snapping or sideways pricing discovery. Keep vital text visible on initial render and with reduced motion.

Competitor phone: `[specific comparison promise] [clear crew-size price comparison with currency/billing terms] [CTA] [product proof] [fit + honest switching FAQ]`. Do not hide the promised comparison behind a full viewport device animation.

Use the canonical black canvas, Mohave content/display, Cake Mono authority, JetBrains Mono numbers, `--text`, `--text-2`, `--text-3`, `--line`, `--ops-accent`, `--r-btn`, and `--unit`-derived spacing. Use named production token mappings; import a portable vendored copy of the canonical token stylesheet first so deployment does not depend on the parent workspace. Numbers use tabular lining/slashed zero. No decorative muted text for essential reassurance. Focus must remain visible.

Motion decision: the meaningful beat is confidence through immediate clarity. Show front-facing product proof at rest; use only purposeful optional interaction. Existing motion work uses `--ease-smooth`, `--d-hover` and `--d-panel`; no spring, bounce, mandatory reveal, or autoplay spectacle. Honor reduced motion. No new motion library is needed.

## P1-1: Experiment engine, collection, and safe publishing

**Worktree:** `/Users/jacksonsweet/Projects/OPS/.worktrees/tryops-conversion-engine`, branch `feat/tryops-conversion-engine`.

**Owner paths:** `lib/ab/` except `seed-config.ts` and `registry.ts`; `components/ab/`; `middleware.ts`; `app/page.tsx`; `app/api/ab-*`; new experiment migrations/modules and engine tests. Own `lib/ab/types.ts` and schema changes. Coordinate registry additions with P1-3. P1-3 owns `lib/landing/cta-mode.tsx`; preserve its tracking exports and agree any API changes before editing callers.

**Skills/plugins:** executing-plans; systematic-debugging; test-driven-development; Supabase skill/plugin and Postgres best practices; verification-before-completion; browser skill/plugin for runtime evidence; Vercel plugin read-only for current deployment/cron evidence. For model content rules read ops-copywriter and coordinate the approved content registry with P1-3. Use current official technical documentation for unresolved statistical/API questions.

1. Read the audit and code; run focused baseline tests. Verify the current database schema/RLS via Supabase read-only. Record which failures are baseline and which the change introduces.
2. Before implementing cross-surface storage, publish `experiment-contract.md` in the shared artifact directory and send it to P1-2 and PM. Define cookie/opaque assignment identity, expiration, experiment/arm/config identity, route/intent, eligible exposure uniqueness, server conversion attachment API, allowed lifecycle states, migration ownership and failure semantics. Obtain counterpart agreement through task messages; the founder is not the schema reviewer.
3. Build durable experiment-scoped assignment, independent of tutorial A/B/C, with explicit allocation and fresh arms on every test. Freeze config hashes/versions per arm. URL preview overrides must be excluded from production experiment evidence. Suppress internal/bot/QA traffic without claiming perfect human identification. Preserve first-touch marketing attribution separately.
4. Make exposure idempotent per eligible visitor/experiment and conversion idempotent per company/milestone. Use bounded validated diagnostics and server-received time. Never accept browser `signup_complete` as business truth. Preserve fixed-page telemetry repair without forcing string IDs into UUID columns. Distinguish page views, exposure, clicks, and verified conversion.
5. Build the experiment decision function from cohort events, never stored legacy rates. Predeclare metric, allocation, MDE/sample requirement, enrollment horizon and conversion maturity window; use a reviewed fixed-horizon inference method with matching power calculation, SRM checks, guardrails, and explicit inconclusive/invalid states. Zero/zero cannot win; insufficient sample cannot win; immutable completed data cannot be pooled into the next comparison. Default experiments cannot start until a real baseline/planned sample is configured. Do not invent a current OPS conversion rate.
6. Replace unsafe rotation with durable run state and an exclusive lease/CAS. Keep current approved content available while generating a draft. Validate and stage; promotion atomically changes the active pointer only after required evidence. Transaction failure preserves the incumbent. Idempotent retry and rollback must work. Automatic publication defaults off; authenticated operator tooling can prepare/validate without production changes. No requirement to build a new dashboard if existing admin tooling can safely carry this workflow.
7. Restrict generation to a declared hypothesis and approved facts/testimonial IDs. Schema validation also requires valid hero, coherent primary action, required offer/pricing, permitted claims, supported image references and valid section ordering. Do not silently sanitize into a different treatment; rejected drafts retain failure reasons. Use fixtures for model tests; do not invoke a metered generator.
8. Correct section diagnostics for first exposure, visible-tab dwell, exit/unload and duplicates. Calculate supporting rates with explicit cohort denominators and complete aggregation; diagnostics never choose the winner.
9. Provide durable health/run failures with meaningful HTTP status and a deduplicated integration point to OPS's existing notification rail. Do not send Slack/email during verification. Separate low traffic, no mature cohort, collection failure, invalid draft, and worker failure.
10. Add meaningful tests for zero/zero, replayed events, cross-experiment reuse, tampered/expired assignment, wrong route/config, browser conversion spoofing, SRM, late conversion, concurrency, stale lease, generation failure, rollback and missing migration. A local SQL runtime test must exercise important constraints/transactions; do not apply DDL to production. Give the PM exact evidence when local database infrastructure is unavailable, while continuing all other checks.
11. Commit coherent changes and send contract/tests/migration/runbook report to PM. Mirror migration documentation through the PM's Bible owner; do not edit the primary Bible.

## P1-2: Web signup continuity and verified attribution

**Worktree:** `/Users/jacksonsweet/Projects/OPS/.worktrees/tryops-conversion-web`, branch `feat/tryops-conversion-attribution`.

**Owner paths:** OPS-Web `src/lib/pmf/` experiment attachment helpers; `src/app/api/setup/progress/route.ts`; `src/app/(auth)/register/page.tsx` and directly relevant registration/auth handoff helpers; targeted tests. Do not refactor global auth or admin redirects. No TryOps writes: request changes from P1-1/P1-3. P1-1 owns experiment SQL; do not create competing migrations.

**Skills/plugins:** executing-plans; systematic-debugging; test-driven-development; Supabase/plugin and Postgres best practices; ops-copywriter; ops-design; frontend-design; interface-design; ui-ux-pro-max; wizard-audit; audit-design-system; browser/plugin; verification-before-completion. Use motion skills if changing transitions.

1. Verify the actual company-creation, first-touch attribution, growth milestone and Google conversion-outbox code. Inspect Supabase schema/RLS read-only. Reconcile analytics task `01a053ef-0899-7430-ae29-5d36c1805ac9` ownership and unpublished signup/source fixes through the PM before overlapping edits.
2. Independently inspect register → auth → company setup behavior and error paths while P1-1 prepares the storage contract. Confirm precisely when an eligible trial exists; do not count an email/password attempt or auth account alone.
3. Agree `experiment-contract.md` with P1-1. Carry a trustworthy, bounded assignment from TryOps into authenticated setup, across email and provider redirects. It must survive refresh/retry and resist tampering; an unsigned browser statement of experiment/arm is insufficient. Do not overwrite acquisition first touch, propagate PII in URLs, or fabricate iOS attribution.
4. Attach assignment to server-confirmed eligible company creation using authenticated identity and an idempotent server/RPC path. Preserve original exposure and trial timestamps and maturity rules. Retry safely when attribution persistence fails; signup must still work and the missing link must be observable/recoverable. Do not introduce a silent one-shot catch that permanently loses the measurement. Preserve existing company outcome and Google Ads outbox semantics.
5. Connect activation/paid outcomes through established business facts with no duplicate uploads. Unknown or unsupported iOS assignment remains unknown. Check demo/deleted/test-company exclusion against the canonical growth contract.
6. Carry the verified 30-day/no-card offer into registration with restrained existing design tokens and useful context. Do not add a questionnaire, redefine the offer, or broadly redesign auth. Validate any route/intent context against a small allowlist and retain accessible error/retry states.
7. Add tests for valid assignment, missing assignment, expired/tampered identity, provider redirect, replay, existing account/company, wrong company actor, failure/retry, and client fake conversions. Use mocks/local SQL fixtures; no synthetic production company or Google Ads upload. Browser proof covers labels, redirects and local simulated submission paths, with live proof explicitly outstanding where appropriate.
8. Commit and send PM the exact interface agreement, touched files, tests and screenshots, evidence gaps and release requirements. Report source and business truth separately from actual production delivery.

## P1-3: Landing experience, copy, and approved content

**Worktree:** `/Users/jacksonsweet/Projects/OPS/.worktrees/tryops-conversion-design`, branch `feat/tryops-conversion-design`.

**Owner paths:** `components/landing/`; `lib/landing/` including CTA routing and page configs; `lib/ab/seed-config.ts` and `registry.ts`; `app/(paid)/`; token/style configuration and required public assets; UI/copy tests. Do not edit `components/ab/`, root assignment `app/page.tsx`, `middleware.ts`, `lib/ab/types.ts`, or API routes; coordinate their interfaces with P1-1.

**Skills/plugins:** executing-plans; frontend-design; ops-design with DESIGN.md and marketing kit; ops-copywriter with relevant voice/format/proven-copy references; ops-market-intel Copy Audit; ui-ux-pro-max including applicable UX/search guidance; wireframe; mobile-ux-design for phone behavior; animation-architect, web-animations, marketing-hero and Elite Animations for motion changes; audit-design-system; browser/plugin; verification-before-completion. If a skill bundles stale OPS facts, current product source and canonical brand rules win. No image-generation plugin is needed to fabricate product screens: use real approved product assets and mask private data if necessary.

1. Read audit screenshots, actual configs, canonical tokens, real product capabilities and current billing truth. Build a source-backed content registry with availability/platform limitations, offer/pricing source, approved CTA labels, and testimonial provenance. Give P1-1 a concrete machine-readable contract to consume. No substantiated customer quote available means omit the quote, not invent one. Founder voice is not customer evidence.
2. Resolve the four layout alternatives above into the hierarchical general control and hybrid comparison control. Produce compact local wireframes and self-critique against the buyer's immediate questions before implementation; do not ask Jackson to approve code-level decisions.
3. Rebuild the hero using a legible front-facing product view, useful copy and immediate CTA. Remove mandatory reveal delays and large empty device spectacle. Make first meaningful copy and action visible in server output. Use real product UI, not invented features or a fake screenshot.
4. Rework all seven paid configs and the root seed/control to this strategy. Retain route relevance and supported distinctions. Remove generic filler, duplicate founder quote, unverified endorsements, stale roadmap, unsupported migration/offline claims and copy that disguises account creation as an email newsletter.
5. Replace tall mobile pricing carousel with scannable crew-size prices and explicit currency/terms. Verify current OPS prices and competitor sources; competitor comparisons need source URL, checked date, equivalent billing/seat basis, and an expiry/fallback policy. If a competitor requires a quote, say so. Do not convert currencies without an explicit current source/rate/date or claim identical currencies.
6. Make every primary action independent of optional sections. Paid/root web-trial controls must link to registration; any retained explicit App Store/download control must have a real fallback destination on desktop. Honor reduced motion for scroll behavior. Preserve tracking helper APIs or coordinate changes before use.
7. Import portable canonical tokens first, fix token mappings across touched components, use existing fonts/assets and concise accessible contrast. Natural mobile scroll, visible keyboard focus, coherent labels, no horizontal overflow, no decorative low-contrast reassurance. Maintain metadata/canonical/robots/schema behavior appropriate to these ad routes; no mass SEO index policy change.
8. Browser-verify all seven routes plus root on narrow phone and desktop. Capture representative full page and first-screen screenshots; test every CTA, keyboard path, FAQ, image load, reduced motion, and pricing visibility. Use local/preview fixtures with production analytics suppressed. Measure what the tooling supports; do not report lab timing as rural-LTE or customer Core Web Vitals proof.
9. Run copy audit and design-system audit on touched first-party UI; remedy violations. Deliver a content-provenance report, screenshots, per-route check results, tests/typecheck/build evidence and atomic commits to PM.

## P2: PM integration, independent verification, and release preparation

**Integration worktree:** `/Users/jacksonsweet/Projects/OPS/.worktrees/tryops-conversion-integration`, branch `feat/tryops-conversion-rebuild`.

**Bible worktree:** `/Users/jacksonsweet/Projects/OPS/.worktrees/tryops-conversion-bible`, branch `docs/tryops-conversion-rebuild`; PM is sole writer.

1. Review each milestone and interface agreement; reconcile source changes in dependency order. Return defects to their owners. Do not accept a passing isolated test as integrated proof.
2. Integrate coherent TryOps commits locally; keep OPS-Web changes separately reviewable. Resolve content schema/CTA/tracking contracts and ensure the new control is safe before any experiment enrollment.
3. Independently review statistical decisions, schema permissions, atomic publishing, failure recovery, source-backed copy, design tokens and route behavior. Spawn a bounded QA session after build outputs exist, using the initiative naming sequence and required relevant skills. It reports findings to PM; fixes are completed before readiness.
4. Run focused suites and changed-surface typecheck/builds, local SQL contract tests, and cross-origin local end-to-end flow with isolated data. Reproduce audit failures and show corrected outcomes: valid desktop CTA, no zero-conversion winner, no stale/lifetime rates, no generated endorsement, fixed-page ingestion, correct server trial attachment.
5. Update Bible architecture/API/analytics documentation and migration mirrors in the owned worktree in the same project. Distinguish code-prepared changes from live systems; preserve sibling analytics edits at eventual integration.
6. Prepare exact migration ordering, environment prerequisites, activation/config steps, rollback and post-release canary. The control must work safely before migrations; missing migration disables experimentation and surfaces health failure rather than breaking signup or silently claiming success. Keep automatic promotion dormant until validated.
7. Present Jackson the working visual result and a concise verified summary. Request only exact push/deployment/production migration approvals when the release bundle is concrete. No new ad campaign activation or spend is included in that approval.

## Definition of ready

- All known critical/high audit defects in the assigned scope have a implemented correction and meaningful proof, with no invented live results.
- Strong mobile/desktop control and seven routes use truthful offer/copy, legible product evidence and functioning actions.
- Verified server trials attach to eligible experiment cohorts; invalid, duplicate, historical and unlinked events cannot manufacture a winner.
- Publishing requires valid content and evidence, is concurrency-safe and reversible, and never removes the working control during draft generation.
- Independent QA findings resolved; skills/plugins use evidenced; documentation and release/rollback bundle prepared.
- Local readiness is separate from customer-live state. No push, deployment, migration, experiment activation or spend occurs without its required approval.
