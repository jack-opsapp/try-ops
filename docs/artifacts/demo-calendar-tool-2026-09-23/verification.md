# Calendar handoff and Deck Designer verification

Date: 2026-09-23. Scope: local TryOps demo revision `job-lifecycle-v6`.

## Product changes

- The measurement record separates its label and value with a layout gap.
- The project is named **184 Cedar Lane** throughout the sample.
- Deck Designer uses the native canvas and floating-control hierarchy, with one working width interaction and disclosed sample takeoff.
- Crew assignment automatically opens a Wednesday-to-Thursday calendar sequence. Task statuses change in place. No progress photo or extra workday action is shown.
- The completed calendar holds a tappable **184 Cedar Lane Complete** notification. The tap opens Activity and the finished photo/note. Reload preserves the pending handoff; replay leaves completed facts intact.

## Verification

### Automated checks

- `vitest run --maxWorkers=2`: **386/386 tests, 36/36 files** (final run 16:09:28, 6.11 seconds).
- `tsc --noEmit`: exit 0, no diagnostics.
- `next build`: exit 0; production build compiled successfully.
- Source token audit: all CSS token references in the five changed style modules resolve; no hardcoded hex colors. Canonical easing and reduced-motion alternatives remain in place.
- `git diff --check`: clean.

The first run caught a Crew task/project-status regression and a test reading the Unscheduled field from the wrong tab. The app preserves Crew project status, and the assertion now reads Details. The compact calendar copy required its date/owner assertion to match the visible context. Final suite is green.

### Browser observations

Checked the local production preview through the real UI at **390×844, 320×740, and 1440×1000**:

- Measurement label/value occupy separate grid rows with a measured **4px gap**.
- New project title reads **184 Cedar Lane** in visit, estimate, tool and project surfaces.
- Assigning Pete + Nick opens Wednesday Schedule immediately. Playback advances to Thursday and changes the two task statuses; no intermediate photo is rendered.
- Both task statuses and the completion rollup remain visible during the 320px cutscene. The Thursday card remains mounted as its status changes (also covered by the component test).
- Automatic completion holds the calendar and exposes the exact **184 Cedar Lane Complete** button. The button fills the notification card (352×107.8px at 390px); it is not a tiny text link.
- Reload of the completed calendar retains that notification. Tapping it opens Activity with **2 photos**, the original visit and the finished job, plus Pete’s exact note. There is no progress-photo record.
- Back returns to the calendar; replay finishes at the same waiting notification. Returning to the assigned project exposes View calendar without requiring another assignment.
- Billing completes without invoice/payment clicks. The accounting beta notice appears there, and the existing trial link remains available. No financial service is invoked.
- Deck Designer opens at the start of its surface with a full dotted drafting grid and separated chrome/drawing lanes. Tested 12/16/20 ft controls: shape, area and stock-board count update; returning restores the unchanged **$4,200** prepared estimate.
- Width and close controls measure **44px** high; the footer return action is **52px** high. No page-level horizontal overflow at 320px or 1440px. The desktop preview retains its internal vertical scrolling.
- No browser console errors captured in the final check. Responsive override reset after verification.

### Evidence

- `measurements-390.png`
- `calendar-thursday-320.png`
- `completion-notification-390.png`
- `calendar-desktop.png`
- `deck-designer-390.png`
- `deck-designer-320.png`
- `deck-designer-desktop.png`
- `tests.log`, `typecheck.log`, `build.log`

The local production server is retained at `http://127.0.0.1:3144/demo`. Build/browser work was serialized with IOS BUG PM; the slot was explicitly released after verification.

## Boundary

This is a local preview. No push, deployment, production records, real invoice/payment, account-creation canary, physical-phone performance result or conversion-lift claim is included. Deck Designer is a source-informed bounded preview, not the full native engine.
