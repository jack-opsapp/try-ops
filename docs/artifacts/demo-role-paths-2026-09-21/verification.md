# Role-based demo verification — 2026-09-21

Status: local implementation and production build verified at http://127.0.0.1:3144/demo. Not pushed or deployed.

## Delivered

- Fixed Operator and Crew paths with symbol-based role cards; member selection alone shows sample work history.
- Self capture and delegated completed-visit review converge at the prepared estimate. Selected member identity persists.
- Accounting beta callout precedes sample estimate sending and billing; its free-access link opens an explicit email request.
- Operator assigns crew and sees later progress/completion evidence without performing crew actions. Completed tasks make the sample billable; a separate approval creates a draft invoice.
- Crew completes a task, posts a photo and editable note, and receives app-download/team-login exits. Task completion does not mark the project itself Complete.
- Optional labelled OPS Spec deck preview updates drawing/sample quantities without changing the quote.
- Three generated residential-deck images share the site and construction scope. Next Image serves responsive optimized images.
- Current-action cue, keyboard focus, reduced motion, branch-aware resume and native conversion links remain intact. Mobile trial CTA appears immediately after the completed story, ahead of optional invoice details.

## Automated evidence

- 31 test files, **337 tests passed** (Vitest).
- TypeScript no-emit check passed.
- Optimized Next production build passed; `/demo` first-load JavaScript reported 150 kB.
- `git diff --check` passed.
- Read-only peer review surfaced four P2 issues; all corrected: undefined panel token, Crew avatar identity, task/project status distinction, and card accessible descriptions. Regression tests cover card descriptions and project status.

## Browser evidence

CUA checks completed on the local demo at 390×844, 320×740 and 1280×900:

- Operator self: choose self, confirm scope, attach photo, review own saved site record.
- Operator delegate: assign Mike, review Mike's incoming record, send sample estimate, later client acceptance, assign Pete, receive later crew evidence, review billing, create invoice.
- Crew: complete assigned task, attach image, post exact sample note, inspect own Activity post and native download/login links.
- Optional deck width/quantities, return to estimate/focus and updated outer guidance.
- Optional external payment record and single accounting provider preview.
- Final production build smoke: full delegated Operator path through invoice and full Crew path through post.
- No horizontal overflow observed at narrow mobile. Final 390px billing has one current-action cue and its native trial button at y=301–357, visible without scrolling. Visible image thumbnails loaded through the Next image optimizer; collapsed/lazy record images are not eagerly required.
- Actual native trial handoff reached `app.opsapp.co/dashboard` because the browser was already authenticated. No sign-out, new-account creation or email delivery was performed.

Screenshots: `role-selection-320.png`, `role-selection-desktop.png`, `crew-complete-mobile.png`, `operator-complete-mobile.png`, `invoice-trial-mobile.png`. Build output: `build.log`.

## Explicit limits

- Auto-invoicing remains an unresolved product decision. Current app source forbids automatic invoice creation; this demo depicts review and draft creation, with no auto-invoice checkbox.
- The existing diagnostic `task_completed` event measures the Crew action only. It does not claim Operator completion or photo-post completion; the current diagnostics contract is unchanged.
- No live estimate email, invoice, payment, accounting connection, new account or other business record was created. Beta request mailto was inspected, not sent.
- Browser emulation is not physical-device or field-network performance proof. Conversion lift requires subsequent real-user measurement. Existing build warnings concern outdated Browserslist data and the current image-domain configuration; build passed.
