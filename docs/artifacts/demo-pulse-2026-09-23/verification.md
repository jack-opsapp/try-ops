# Desired-action perimeter pulse — local verification

## Result

The demo uses one inset SVG perimeter pulse across existing desired-action markers. A steel-blue trail and bright head travel around the target, pause and repeat. The persistent outline remains between passes. Target corner radius comes from the underlying control. No dependency, funnel, lifecycle or production behavior changed.

## Automated checks

- 389 tests passed across 37 files, including three new guidance behavior tests.
- TypeScript `--noEmit` passed.
- Production build passed. A second build after the browser-discovered CSS interpolation correction also passed.
- Independent source review found and resolved the nullable React ref type. No remaining source blocker was reported.

## Browser proof

Tested the built app at `http://127.0.0.1:3144/demo`:

- 320px: role group, assignee group, Details tab, clipped task row, assignment action, crew picker and Done. Exactly one marker/pulse through handoffs; document width did not exceed viewport width.
- 390px: full-card completion notification remains tappable. Crew task completion, photo attachment, editable note and Post all work. The note-field pulse bounds exactly matched the textarea (320 × 104.28px); SVG pointer events are `none`.
- 1440px: notification target and SVG bounds matched (484 × 88.23px), with no horizontal overflow.
- Continuous motion readback: task-row dash offset changed from `-22.3466px` to `-97.9057px`; leading edge offset retained its 11-unit separation. Matching CSS length units fixed an initial discrete-interpolation defect.
- Inquiry and calendar context scenes had no action pulse; their resulting user actions regained guidance.
- Crew note `Deck complete. Site clean.` posted successfully and appeared in Activity; the final Crew exit remained Get OPS / Sign in to join your team.
- No browser console errors were recorded. Restored the normal viewport and left the demo at Choose your role.

## Accessibility and motion audit

- SVG is hidden from assistive technology, cannot receive focus and does not capture pointer events. Keyboard focus remains separate from guidance.
- Automated behavior tests cover target replacement/removal, disabled actions, textarea integrity, offscreen/background pause and observer cleanup.
- Reduced-motion CSS disables the animation and hides the SVG while retaining the static outline. This fallback was source-reviewed; the browser tool did not expose a reduced-motion emulation control.
- Colors, stroke thickness, layout and duration derive from OPS tokens. Dash lengths are normalized SVG path coordinates, not layout spacing. The canonical easing curve is retained.

Screenshots: `task-row-320.png`, `crew-note-390.png`, `desktop-notification.png`. `phone-notification.png` records the initial geometry pass before the interpolation correction; the final desktop capture and fractional-offset readback prove the corrected motion implementation.

This is local verification only. No push, deployment or conversion-lift claim.
