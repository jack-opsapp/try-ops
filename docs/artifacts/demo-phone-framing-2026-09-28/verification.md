# Demo phone framing — September 28, 2026

## Scope and result

Resumed from released TryOps commit `4efa053`. At 390 × 667 the previous calendar cutscene began at y=252.8 and ended at y=773, below the visible screen. This pass gives mobile playback a viewport-sized product frame. The role header, notification and timeline reserve space within it; playback fills the remainder. Explicit scene entry frames the app. Automatic completion reframes only when the app is still visible and never changes keyboard focus. Pause and individual beats do not reframe.

The same framing applies to inquiry, delegated-work and billing playback. Ordinary interactive screens retain natural page scrolling. Short phones retain calendar/content scrolling rather than shrinking text or hiding content.

Operator completion notes now persist their sample `@Mike` mention as part of the authored message. Activity renders the saved note verbatim, including Crew-authored notes. No role, business action, financial operation or analytics definition changed.

## Automated verification

- 141/141 tests passed across six focused files: `demo-playback-framing`, `demo-automatic-updates`, `demo-crew-context`, `demo-lifecycle-state`, `demo-cutscene`, `demo-experience`.
- Four new framing checks cover phone scene entry, automatic completion without focus movement, preserving deliberate scroll-away, and unchanged desktop behavior.
- Next.js production build exited 0, including lint/type validation and all 46 routes.
- `git diff --check` passed. Added CSS dimensions derive from the existing `--unit` token and viewport/percentage sizing; no new colors, fonts or motion curves.

## Browser verification

Production build served locally on port 3144; real demo controls used, without injecting state.

- **390 × 667:** calendar frame top 7.8, bottom 658.8; playback controls, schedule and app tabs visible together. Direct pointer pause preserves framing. Replay returns to the first calendar beat. Persistent **184 Cedar Lane Complete** notification opens Activity with the completion note/photo and Mike's marked-up handoff. Billing automatically advances through invoice and payment; beta disclosure remains accessible. After completion, **Start my free trial** is visible at y=41–97. Inquiry starts inside the same fitted frame.
- **320 × 568:** product top 7.8, bottom 559.8. Internal calendar scrolling reaches the task-completion summary while controls and tabs remain reachable. No horizontal overflow (document width316, viewport320).
- **1440 × 900:** existing desktop chapter/product arrangement preserved; product bounds x758–1278, y120–863.4, inside viewport. The browser capture surface was narrower than this emulated width; the 1440 screenshot is only a partial capture.
- **1100 × 800:** full desktop inquiry screenshot confirms side-by-side guide and playback.
- Browser error log returned no entries for this walkthrough.

## Evidence

- `calendar-before-390x667.png`: original clipped Thursday sequence.
- `calendar-after-390x667.png`: corrected Wednesday sequence, paused by direct pointer.
- `calendar-320x568.png` and `calendar-320x568-scrolled.png`: compact viewport and reachable lower content.
- `completion-notification-390x667.png`: persistent incoming completion action.
- `billing-playback-390x667.png` and `billing-signup-390x667.png`: automatic billing and visible final trial invitation.
- `inquiry-entry-390x667.png`, `inquiry-desktop-1100x800.png`: phone/desktop conversation framing.
- `calendar-desktop-1440x900.png`: partial desktop capture; use measured bounds above for viewport fit, not image dimensions.

## Boundary

Local refinements only; no push/deployment in this pass. Browser viewport emulation is not physical-device testing. No production signup, invoice, payment, accounting connection, beta-access email or conversion-lift test was performed. Existing untracked September21 build log was left untouched.
