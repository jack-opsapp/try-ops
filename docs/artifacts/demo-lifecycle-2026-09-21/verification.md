# Try OPS lifecycle demo — local verification

Date: September 21, 2026. Local replacement of released demo source 29679e5. No push, deployment, production migration or analytics configuration change.

## Result

One fictional job follows five chapters: email correspondence and booked visit; site capture/review; prepared estimate and existing-task crew assignment; crew completion and a separate photo/note; the owner’s Activity record. The core shortest path is 16 taps, with billing and accounting optional after the crew-photo proof. No completion-time or conversion-uplift claim is established.

Native UI source and rendered artifacts informed the reconstruction. The actual signed-in web Projects view and project Activity presentation were inspected read-only; no live records were changed. Native iPhone source is d18609c9; relevant released web paths e26310f4 were compared with cached origin/main 6bb01d7c4. Domain source reports and final fidelity handoff are in OPS/docs/artifacts/tryops-demo-product-fidelity-2026-09-21/research/.

## Verified

- 274/274 tests across 30 files; TypeScript type check passes. Tests include malformed/blocked storage, refresh and Back, duplicate actions, selected crew identity, exact photo/note preservation, task-versus-post/payment independence, missing photos, failing diagnostics, keyboard tabs, native trial links, live reduced-motion preference changes, scene scroll reset and receipt heading focus.
- Next.js production build passes. Demo route: 49.8 kB route JavaScript, 143 kB first load including shared JavaScript (build output; not field performance).
- Local production server on 127.0.0.1:3144. Full core flow completed at 390×844 using Nick; earlier full phone flow used Pete. Photo viewer, Back and refreshed sample state verified. Task completion and posting remain separate actions.
- Narrow phone 320×740: inquiry, owner record and billing inspected; header fits, no horizontal overflow. Large phone 430×932: receipt review, recorded balance and Sage provider preview verified; no undersized visible action/label targets in that view. Desktop 1280×900 and 1440×900: owner record, conversion offer and retained visit evidence inspected. These are browser viewport checks, not physical-device certification.
- Visible sample images load. Gallery/feed sizes request thumbnail-sized optimized assets; full photo viewer remains available. Evidence inside collapsed visit records loads when opened.
- Phone scene transitions return to the beginning with heading focus. Main capture/complete actions remain in sticky bottom docks. The final trial offer follows the project record in phone reading order.
- No errors returned by the browser console check on the final local production page.
- GET /demo/start-trial independently returns 303, Location https://app.opsapp.co/register, private/no-store and no-referrer. Browser activation reaches OPS; the already-authenticated session redirects onward to dashboard. No new account was created and no welcome email was sent.

## Truth and measurement boundaries

The email exchange, checklist measurements, priced/customer-approved estimate and later scheduled workday are prepared sample context. General checklist capture does not automatically price the estimate. Estimate email delivery was not established by the reviewed send-action paths and is not simulated. All accepted labor items become task work; assignment does not automatically schedule it. The original visit is linked, but project/task notes are not magically authored. Completing the selected task does not automatically complete the project. Bank transfer is received outside OPS, then recorded. QuickBooks/Sage is a provider preview only.

The unchanged production diagnostics contract is crew-job-v1. The new local resume revision is job-lifecycle-v2. task_completed fires before the photo-post owner reveal; it cannot measure that new aha milestone. Signup click is intent, not account or trial capture. Canonical verified account/company/trial attribution remains unchanged and is covered by its existing tests; this rebuild did not repeat a live new-account canary.

## Evidence

- phone-visit-review.png — production visit review at 390×844.
- phone-crew-completed.png — production selected task completed with separate photo update action.
- phone-owner-record.png — complete production phone owner page, including the crew post and signup offer.
- desktop-owner-record.png — production 1280×900 owner presentation.
- phone-photo-viewer.png — photo-viewer layout from the development walkthrough; final viewer code unchanged.
- build.log; tests.log.

Sample images are illustrative, not testimonials or customer project proof. Only fictional demo content is retained in screenshots.

## Skills applied

OPS design and audit-design-system governed tokens/native anatomy; frontend-design, interface-design, mobile-ux-design and ui-ux-pro-max guided layout and touch controls. OPS copywriter and Tutorial Studio app-analyzer, flow-architect, onboarding-strategist and tutorial-auditor informed the story and source review. Animation Studio animation-architect, interactive-scenes and web-animations informed bounded transitions, progressive feedback and reduced motion. Custom writing/executing plans and wizard-audit governed implementation and failure checks. Agent source-review findings were resolved before browser sign-off.

## Release boundary

This is local work only. The landing persuasion change is a separate clean commit 4936074f114d9f37c7d5aa22bddbacac18ce4e02 and does not overlap demo files. Coordinate both if a release is later authorized. Existing production API/schema contracts need no migration for this UI replacement. Rollback of this UI restores prior demo source 29679e5 without changing business records.
