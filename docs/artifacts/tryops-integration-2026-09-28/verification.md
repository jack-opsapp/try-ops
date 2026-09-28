# TryOps landing and demo integration — September 28, 2026

Status: verified local integration; not pushed or deployed by this task.

## Source

- Landing persuasion revision: `4936074f114d9f37c7d5aa22bddbacac18ce4e02`.
- Released demo/main: `4efa0532c00e4265bbfbd91233fa7bb334efd897`.
- Production deployment confirmed READY: `dpl_BtqPuYYPnvUQLQWjJLDqhYb6wQp2`, canonical `https://try.opsapp.co`, serving `4efa053`.
- Merged the released demo into the existing isolated persuasion checkout without conflicts. No demo implementation file differs from that released demo in this integration.
- The separate demo task is preparing additional phone-framing and Activity-message fixes. Those uncommitted changes are not included in this record.

## Fresh verification

- **402/402 tests passed in 38 files** on the combined tree. Full suite, two workers.
- **Production build passed**, including lint/type validation and page generation.
- **8/8 local production landing routes passed**: root, job-management, three comparison pages, three trade pages. Each renders the two approved testimonials, unique section IDs, workflow and first-job guidance, its canonical URL, native trial links, and one correctly attributed demo destination.
- Browser: general landing at 390px; Jobber comparison at 320px; desktop at 1100px and 1440px. Measured document widths were within their viewports. Real product image loaded. Screenshot switching changed the selected evidence and caption correctly.
- Clicking the general landing's “See it in action” link opened the released role-based demo, with both Operator and Crew choices and the native trial/exit links.
- Clicking the demo's trial link reached the already-authenticated web-app dashboard. An independent HTTP read confirmed `/demo/start-trial` returns **303** to `https://app.opsapp.co/register`, with `private, no-store` and `no-referrer` headers. This is navigation proof, not a newly created account or signup-conversion canary.
- Browser diagnostics contained no errors. A third-party in-browser Babel warning appeared after visiting the signed-in app; no claim of a warning-free cross-app session is made.
- New landing CSS remains token-based; no new raw color or pixel values in the integration's added CSS. The demo source is preserved exactly.
- `git diff 4efa053 --check` passed. Whitespace in a previously released demo build log is pre-existing and outside the landing revision.

Complete test/build/route evidence: `/Users/jacksonsweet/Projects/OPS/docs/artifacts/tryops-integration-2026-09-28/` (`tests.json`, `build.log`, `production-route-checks.json`, and the route-check script).

## Hero experiment request

Jackson plans to have Claude build the animation. The creative handoff is `docs/plans/2026-09-28-tryops-hero-motion-brief.md`. The recommended story is assigned task → crew completion/photo/note → the owner's record of that same job. No animation implementation, randomized treatment, or production experiment is introduced by this integration.

No production configuration, experiment flags, database, advertising, account, or email mutation occurred. No conversion lift is established. The two source revisions' prior proof/capability limits remain in force.
