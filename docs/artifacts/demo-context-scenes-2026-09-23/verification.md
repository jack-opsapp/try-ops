# Try OPS context scenes — local verification

Date: September 23, 2026. Worktree: `OPS/.worktrees/tryops-demo-integration`.

## Changes

Seven short sequences (21 beats) explain the events between visitor actions: inquiry/reply/confirmation/booking, delegated site visit, prepared quote, customer acceptance/project creation, Crew briefing, Operator workday photos, and invoice/external payment. The selected Operator/Crew role stays fixed. Only the currently relevant event is visible.

The opening takes 18 seconds of visible reading time. Each scene has Pause/Resume and Skip; completed scenes can be replayed. Job photos load before their reading time begins. Hidden/off-screen scenes do not consume their reading time. Reload restores the active beat with a fresh reading interval. Back cancels playback; completed financial facts remain completed, and Replay remains available.

No new packages, analytics protocol, API route, business writes, or payment processing. The OPS Accounting beta callout remains Billing-only; OPS Spec remains an optional custom-tool illustration. Production invoice approval behavior is unchanged.

## Automated verification

- Full suite: **371/371 tests in 34 files pass**, including 16 new scene state/visible-time/photo readiness tests and the Back/Forward/Restart regressions (`tests.log`).
- TypeScript: `tsc --noEmit` passes (`typecheck.log`, empty successful output).
- Production build: Next 14.2.35 build passes; `/demo` is 64.2kB route JS / 158kB first load (`build.log`).
- Final source includes history position/generation guards, so Restart cannot restore an abandoned role journey; native Forward does not emit false Back analytics. Duplicate payment notification content retains the existing announcement.

## Browser verification

Against the locally built production server on port3144:

- 390×844: watched inquiry → outgoing reply → confirmation/booking land automatically at Assign site visit with the booking notification.
- Delegated Mike path: watched site visit/photo/submission return to Operator review; quote-preparation context identifies Mike and the fixed prepared amount. No role switch or client approval action.
- Acceptance automatically opens the project; DETAILS focuses/reveals the resurfacing task, Assign team reveals the roster, and Done reveals the workday action.
- Assigned Pete + Nick; watched workday context and Pete’s completion photo/note arrive in Activity. Both tasks complete; billing then shows the external bank-transfer record and native trial invitation.
- 320×740: checked the paused site-photo scene, no document horizontal overflow, and 44px Pause/Skip targets above scrollable content.
- 1440×1000: inspected full desktop layout and DOM bounds; the app panel is 520px wide within the page (no horizontal overflow). The in-app browser’s full-page screenshot includes extra black canvas; DOM dimensions were checked separately.
- Final build: reload retained paid billing; Restart → raw browser Back stayed at role choice; choose Crew → footer Back → browser Forward kept the Crew perspective. Crew briefing completed, then the visitor marked their own task complete and posted the photo/note to Activity. Download/invitation links appeared, without Operator billing/trial controls.
- Browser console: no errors observed. Viewport reset and preview left at role choice.

Screenshots: `phone-inquiry.png`, `narrow-site-visit.png`, `desktop-quote.png`, `phone-workday.png` (resulting Activity), `phone-billing.png`, and `phone-crew-complete.png`.

Existing build/runtime advisories: stale Browserslist data, Vitest environmentMatchGlobs deprecation, and optional Next sharp/domains configuration notices. They did not fail the checks.

## Source/design review

- Existing canonical OPS tokens resolve for every cutscene CSS variable; no new hardcoded color/font/spacing values.
- Transform/opacity entrances use the 250ms page token and canonical easing. Reduced motion uses the 150ms opacity fade; no springs or animation timers.
- Pause/Skip controls use 44px minimum targets, remain above the scrollable scene content, and have accessible names and keyboard focus treatment.
- Existing generated job photos and roster avatars are reused. Photo author, visit time, estimate acceptance wording, amount and chronology match the resulting records.
- Billing has no visitor approval/payment-recording action; the bank transfer is explicitly received outside OPS.

## Proof boundary

Local implementation and automated/browser checks do not establish a deployed experiment, signup conversion lift, physical-phone performance or a new-account welcome-email canary. No push/deployment was performed.
