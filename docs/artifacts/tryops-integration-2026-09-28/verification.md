# TryOps landing and demo integration — September 28, 2026

Status: verified local integration; not pushed or deployed by this task.

## Source

- Landing persuasion revision: `4936074f114d9f37c7d5aa22bddbacac18ce4e02`.
- Released demo/main: `4efa0532c00e4265bbfbd91233fa7bb334efd897`.
- Production deployment confirmed READY: `dpl_BtqPuYYPnvUQLQWjJLDqhYb6wQp2`, canonical `https://try.opsapp.co`, serving `4efa053`.
- Merged the released demo into the existing isolated persuasion checkout without conflicts, then incorporated the demo task's finalized local commits `0381508` and `ce4a3ab`. No demo implementation file differs from `ce4a3ab` in this integration.
- The integrated refinements preserve authored Activity notes and fit phone playback/notification handoffs within the viewport. Their focused verification and screenshots are in `docs/artifacts/demo-phone-framing-2026-09-28/verification.md`.

## Fresh verification

- **406/406 tests passed in 39 files** on the final combined tree, superseding the earlier 402-test checkpoint. Full suite, two workers.
- **Production build passed**, including lint/type validation and page generation.
- **8/8 local production landing routes passed**: root, job-management, three comparison pages, three trade pages. Each renders the two approved testimonials, unique section IDs, workflow and first-job guidance, its canonical URL, native trial links, and one correctly attributed demo destination.
- Browser: general landing at 390px; Jobber comparison at 320px; desktop at 1100px and 1440px. Measured document widths were within their viewports. Real product image loaded. Screenshot switching changed the selected evidence and caption correctly.
- Clicking the general landing's “See it in action” link opened the released role-based demo, with both Operator and Crew choices and the native trial/exit links.
- Clicking the demo's trial link reached the already-authenticated web-app dashboard. An independent HTTP read confirmed `/demo/start-trial` returns **303** to `https://app.opsapp.co/register`, with `private, no-store` and `no-referrer` headers. This is navigation proof, not a newly created account or signup-conversion canary.
- Browser diagnostics contained no errors. A third-party in-browser Babel warning appeared after visiting the signed-in app; no claim of a warning-free cross-app session is made.
- New landing CSS remains token-based; no new raw color or pixel values in the integration's added CSS. The final demo source is preserved exactly from `ce4a3ab`.
- `git diff 4efa053 --check` passed. Whitespace in a previously released demo build log is pre-existing and outside the landing revision.
- After integrating the final demo refinements, all eight route checks passed again on a fresh production build. A fresh 390×667 browser walkthrough entered Operator playback and paused it: product top **7.8px**, bottom **658.8px**, document width **386px**, viewport width **390px**. The complete playback frame and controls fit inside the viewport. The earlier signed-in trial navigation check remains applicable because the navigation implementation is unchanged.

Complete test/build/route evidence: `/Users/jacksonsweet/Projects/OPS/docs/artifacts/tryops-integration-2026-09-28/` (`tests.json`, `build.log`, `production-route-checks.json`, and the route-check script).

## Hero experiment request

Jackson plans to have Claude build the animation. The creative handoff is `docs/plans/2026-09-28-tryops-hero-motion-brief.md`. The recommended story is assigned task → crew completion/photo/note → the owner's record of that same job. No animation implementation, randomized treatment, or production experiment is introduced by this integration.

No production configuration, experiment flags, database, advertising, account, or email mutation occurred. No conversion lift is established. The two source revisions' prior proof/capability limits remain in force.
