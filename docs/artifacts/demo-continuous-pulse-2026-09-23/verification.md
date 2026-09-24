# Continuous outer action pulse

User correction: separate the highlight from the target and remove the visible stop/start between laps.

## Changes

- Static outline offset is 4px, derived from half the OPS spacing unit.
- SVG geometry expands outside the target, with a visible gap instead of an inset stroke.
- Linear timing completes one full normalized lap every 3.2 seconds. No opacity keyframes, dwell or entrance easing remain in the orbit.
- Task-list and crew-picker containers allow the outside stroke. Task-container child corners remain rounded. The detached guide uses a uniform corner derived from the largest native corner and expands it with the full path outset.
- Pointer behavior, background/offscreen pause and reduced-motion static outline remain unchanged.

## Fresh verification

- TypeScript check: passed.
- Production build: passed.
- 320px browser: walked Operator from role choice through delegated visit, estimate, Details, task, assignment picker, Done and completed calendar. The role group and task highlight visibly clear their controls, with no clipping or horizontal overflow.
- 1440px browser: notification target measured 484 × 88.23px; its outer path measured 496 × 100.23px. Outline offset was 4px. No horizontal overflow.
- Browser computed animation: `linear`, opacity `1`, dash readbacks `-2.60313px` and `-92.1687px`. The late-lap stroke stays visible and moving; the full-lap dash period joins identically at the loop boundary.
- Browser console: no errors. Normal viewport restored and updated preview left on the completion notification.
- Screenshots: `task-320.png`, `notification-1440.png`.

The preceding implementation's 389/389 test result is predecessor evidence; no expanded test suite was run for this scoped styling correction. Reduced-motion behavior was retained and source-reviewed, not re-emulated in the browser. Local preview only; no push or deployment.
