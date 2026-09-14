# Local conversion rebuild verification — 2026-09-14

Production source `d2bfbfc` matches reviewed owner `293900a`. The main integration passed 137 TryOps tests across 14 files, a full Next production build with 43 static pages, and standalone typechecking. Final root and seven-route phone/desktop browser proof was independently inspected. OPS-Web conversion source `818e1aefc` is integrated on fetched main `adc336307`; PM reran 94 related tests across seven files and checked all 16 changed TypeScript files with zero diagnostics.

The final database-only correction makes experiment review alerts dismissible through the existing notification rail. Targeted SQL reproduced the old failure and passed with the correction for linked and actionless recipients. Acknowledgement removes the unread alert, and receipt replay neither duplicates nor reopens it. This does not change the application code covered by the preceding build and browser proof.

Local SQL evidence includes 121 mixed pending bindings, 1,000 assignments, eight concurrent workers and waiting same-key replay, explicit winner promotion and rollback, plus notification-helper failure/retry/deduplication. Independent QA checked service permissions, source identity and the real rail lifecycle. Final migration SHA256: `4892b40fe14023235f9fbb3274f9ad6ee15a802b5180f9c34ff595a30e68e9f4` (46,010 bytes).

Full session evidence is retained at `/Users/jacksonsweet/Projects/OPS/docs/artifacts/tryops-conversion-build-2026-09-14/`. Its `release-readiness.md` and `qa/review-final.md` record exact source, runtime and artifact identities. Web browser evidence is committed under `docs/artifacts/tryops-attribution/` in its integration checkout. Local test fixtures remain under `tests/sql` and `tests/`. An existing-helper fixture's trailing blank-line cleanup changes no SQL behavior.

See `docs/experiments/operations.md`, `contract.md` and `statistical-method.md` for operation and release contracts. This is local acceptance only. No production migration, source push/deployment, experiment enrollment, ad-spend change or paid model call occurred. The initial study covers root only; local A/A protocol evidence does not establish a live identical-arm study. Daily worker cadence and total-outage measurement limits are explicit in the runbook. Production price mapping and the authenticated/business canary remain release checks.

## Approved production release

Jackson approved deployment and the named migration on September 14. Production ledger `20260914222840` stores the exact approved SQL; independent readback verifies 22 function bodies, 13 RLS-enabled tables, no browser table/function privileges, zero experiments and inactive route pointers. OPS-Web `b4a715072` completed its full Vercel production build (484 pages and type check) and reached READY at `app.opsapp.co`. The first TryOps release `e1defcd` reached READY at `try.opsapp.co`; live root/seven-route browser checks passed.

The final helper correction `5f29035` preserves the explicit SUPABASE_URL override and falls back to the existing NEXT_PUBLIC_SUPABASE_URL. It still requires the private service-role key. Focused actual-client tests, type checks and import-boundary inspection passed; it changes no UI, database or experiment state. Its final deployment identity is retained in the external release report.

Production environment metadata requests returned HTTP 403. Exact deployed price mappings, alert recipient and flag values remain unverified. No account was fabricated, no experiment enrolled, and no claim of live trial attribution, real alert delivery or conversion lift is made.
