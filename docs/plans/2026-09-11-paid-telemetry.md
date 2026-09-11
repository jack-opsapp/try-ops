# Paid landing telemetry repair

**Goal:** Fix bug 80737019 without changing production schema, configuration or business records.
**Architecture:** Keep UUID experiments in `ab_events`. Route known `paid:<route>` and `fallback` identities to the existing text/JSON `onboarding_events` ledger using `landing_<event_type>` names, preserving every accepted telemetry field. This prevents paid-page identifiers from entering UUID columns or experiment counters. Apply the existing production-host collection boundary to this endpoint before any database access.
**Tech stack:** Next.js 14, TypeScript, Supabase, Vitest.
**Design system:** N/A; server telemetry only, no UI or marketing copy.
**Required skills:** systematic-debugging, custom-skills:writing-plans, custom-skills:executing-plans, using-git-worktrees, test-driven-development, verification-before-completion.

1. Prove the live schema and deployed page identifier. Done read-only: UUID constraint; paid:job-management in rendered props; pg_input_is_valid=false. Independently claim the deduplicated report before edits.
2. Add route tests using the real Supabase client and a fake HTTP transport that enforces the observed UUID/FK/event-type boundary. Prove paid events currently fail. Verify accepted metadata, organic counters, missing/unknown identities, malformed input, denied hosts and downstream errors.
3. Implement the route correction. Restrict fixed identities to the actual paid route registry plus fallback; validate supported event types. Do not invent experiment rows or report successful writes on database rejection.
4. Run focused tests, the existing suite, TypeScript, production build without live credentials, and git diff --check. Compare unrelated baseline failures with origin/main.
5. Commit only task files. Preflight a merge with clean local main, integrate locally, independently repeat focused checks. Keep the release branch and evidence; no push or deploy.
6. Document the new collection contract in Bible chapters 04 and 21. Guardedly release bug ownership, recording local-main commit, exact checks and release-needed marker; independently read back and prove replay changes zero rows.
