# Calendar handoff and native tool fidelity

**Goal:** Apply Jackson’s requested measurement spacing, address-based project name, native Deck Designer fidelity and automatic calendar-to-notification handoff.

**Architecture:** Keep the existing fixed-role demo and visible-time playback engine. Revision v6 introduces a durable `calendar` scene after crew assignment. Assignment starts the three-beat workday sequence automatically; finish/skip records the completed sample tasks/photo/note while remaining on the calendar. A persistent `184 Cedar Lane Complete` notification opens Activity only when tapped. Replay is read-only, back navigation cancels unfinished playback, and revisit resumes an unfinished calendar sequence. Existing production diagnostics are unchanged.

**Design system:** `ops-design-system/project/DESIGN.md`, mobile `MOBILE.md`, globally imported `app/ops-tokens.css`. Use black/glass/hairlines, Mohave body, mono numbers, Cake labels, canonical motion easing, reduced motion and existing touch-target tiers.

**Skills:** custom-skills:writing-plans and executing-plans; tutorial-studio:app-analyzer; OPS design; frontend/interface/mobile UX; OPS copywriter; animation-architect followed by web-animations/interactive-scenes; design-system audit and wizard audit. Existing session skills and source-driven references apply. Jackson already supplied the direction and delegated implementation judgment; no additional product approval gate.

## Work ownership

1. Root: measurement record uses a real layout gap; `SAMPLE.project` becomes `184 Cedar Lane`; v6 reducer, playback integration, persistent clickable notification, remove progress photos and manual workday button. Validate legal resume/history states and preserve signup/billing/role behavior.
2. TRYOPS DEMO - P5-1 (GPT-5.6): inspect the embedded native Deck Designer and rebuild only the optional web preview’s component/styles. Reproduce native canvas/tool hierarchy and retain a bounded working dimension interaction, honest sample limits and return-to-estimate behavior. Write exact source references.
3. TRYOPS DEMO - P5-2 (GPT-5.6): inspect native Calendar/week/task components; build a persistent calendar with Wednesday/Thursday selection and task status changes. Mike handles the prepared preparation task; the selected crew handles resurfacing. No photo cutscene. Parent owns all timing; pause/reduced motion must work.
4. TRYOPS DEMO - P5-3 (GPT-5.6): migrate existing tests and add calendar/notification/reload/replay/role invariants. No app-source ownership.

## Verification and release boundary

Only source work until IOS BUG PM grants the compiler slot. Then stop owned production preview, fresh global process check, serial bounded tests/typecheck/build under the existing shared lock, restart local production preview3144 and check desktop/390px/320px. Exercise spacing, optional Deck Designer controls, automatic calendar sequence, notification tap, Activity completed photo, reload/Back/replay, billing and Crew role regressions. Source and visual audits must trace the native references and tokens. Update Bible in this session. Local commits only; no push/deployment.
