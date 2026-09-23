# Inquiry conversation — local verification

Date: September 23, 2026. Local production preview: http://127.0.0.1:3144/demo.

## Result

The inquiry now builds as a persistent conversation. Alex’s emails enter from the left; the Operator reply enters from the right. One subject header, sender/time labels and compact email signatures preserve the email context. OPS creates the lead and books the confirmed visit through inline system updates. Earlier messages stay mounted and are available by scrolling the thread.

The five inquiry beats, 18 seconds of visible reading time, selected role, v5 persisted state, Pause/Resume, Skip and Replay remain intact. Other context scenes retain their single-event presentation. The visitor still does not click to perform automatic or another person’s actions.

## Automated checks

- Full suite: **378 tests in 35 files pass** (`tests.log`). Seven new checks cover progressive disclosure, stable earlier email nodes, subject/signatures/times, restored context and replay, accessible controls, internal-only scrolling, reduced-motion positioning and preservation of other context scenes.
- TypeScript: `tsc --noEmit` passes (`typecheck.log`, successful empty output).
- Production build: passes (`build.log`). `/demo`: 65.5kB route JS / 159kB first load; previous build was 64.2kB / 158kB. No dependencies added.
- Canonical token audit: every CSS variable resolves; color, spacing, type, borders, radii and motion use existing OPS tokens. The only pixel literal is the 390px responsive breakpoint.
- CSS uses opposing transform/opacity entrances and canonical easing. Reduced motion removes entrance movement and uses immediate scrolling. Pause does not restart scroll effects. The keyboard-focusable internal region retains visible focus treatment, and one live announcement avoids duplicate screen-reader narration.

## Browser checks

Observed against the rebuilt production preview:

- **390×844:** incoming email → inline lead → outgoing reply retained earlier conversation content; incoming and outgoing bubbles align to opposite sides. Message body is 16px; metadata is 11px. Screenshot: `phone-conversation.png`.
- Paused on the Operator reply, reloaded, then paused again: the restored third beat contained the original inquiry, lead update and reply; future client confirmation/booking remained hidden.
- **320×740:** no horizontal overflow (document and thread content 316px within the 320px viewport). Pause/Skip are each 44px high. Incoming/outgoing message left edges differ by roughly 32px. The thread can be focused and scrolled by keyboard. Long content remains within its own vertical scroll region; ordinary page scrolling reveals the lower portion on this small screen. Screenshot: `narrow-conversation.png`.
- Resumed and observed the fifth beat with all three emails, followed by the inline **OPS booked the site visit** confirmation and matching time/address. Playback then returned automatically to the booked lead with Assign site visit available.
- **1440×1000:** checked the desktop layout and 516px conversation width inside the existing app panel, with no document horizontal overflow. Screenshot: `desktop-inquiry.png` (the in-app browser’s full-page capture includes extra black canvas; layout dimensions were checked separately).
- Skip and Restart return to role choice; viewport override reset, preview left ready for Jackson. Browser error log: empty.

Existing build advisories (Browserslist, Vitest environmentMatchGlobs, optional Next sharp/domains configuration) did not fail validation. No push, deployment, production data write, signup experiment or physical-phone performance measurement was performed.
