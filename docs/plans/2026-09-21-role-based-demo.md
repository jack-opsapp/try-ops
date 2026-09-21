# Role-based Try OPS demo implementation plan

**Goal:** Keep visitors in their selected Operator or Crew role while showing a complete, credible sample job and clear beta/custom-tool availability.
**Architecture:** Extend the existing fixture-only state machine with role selection and assignment-driven branches. Keep canonical registration, real business services and production diagnostics contracts unchanged. Beta and custom-tool context is a shared component.
**Tech stack:** Existing Next/React/TypeScript, CSS modules, Framer Motion and native navigation.
**Design system:** OPS canonical DESIGN.md and mobile/MOBILE.md; imported app/ops-tokens.css.
**Required skills:** OPS design, frontend-design, interface-design, mobile-ux-design, OPS copywriter, Tutorial Studio flow/UX/auditor, animation architect/interactive scenes/web, Elite Animations, custom writing/executing plans and design audit.

## Approved experience

- Choose your role: Operator / Crew. Symbols and role characteristics only, no avatar/history.
- Operator sees inquiry and books/assigns the visit. Team cards (including You) carry avatars and fictional job/task-specific history.
- Self assignment opens a short capture; teammate assignment delivers that person's completed record for operator review. Identity never changes.
- Prepared estimate, sample Send estimate, later customer acceptance. OPS ACCOUNTING — BETA TESTING appears before the send action and through billing/accounting; free beta access is by request.
- Optional OPS SPEC CUSTOM TOOL demonstrates a prepared deck drawing and computed sample quantities; separate custom-build availability, never implies included in the standard plan.
- Operator assigns installation crew and sees their later completed photo/note arrive. All sample tasks must be complete before Ready to bill. Crew directly opens their assigned job, completes the final task and posts the photo/note, staying Crew through conversion.
- Billing ends the Operator core flow. Payment recording is optional and explicitly received outside OPS. QuickBooks/Sage remain optional provider previews.
- Current source explicitly disallows automatic invoice creation. Exact auto-invoice presentation is a pending product clarification; do not silently show it as released functionality.

## Work ownership

1. P3-1: RoleScenes, CharacterCard, FeatureCallout, role-scenes CSS. Scope: faithful symbol cards, real local portrait assets, sample history, reusable callouts. Canonical tokens, one accent focus, touch targets >=44px.
2. P3-2: VisitScenes and CSS, SpecTool and CSS. Scope: self confirmation/photo, delegated review, estimate send/acceptance sample, optional contained SVG preview. Motion uses canonical curve and reduced-motion fallback.
3. P3-3: read-only fidelity/funnel/media audit, then independent branch verification.
4. Root: lifecycle reducer/persistence, narrative, intake assignment, project incoming-work events, billing, signup links, integration and browser QA.

## State and proof contracts

Revision v3 resets obsolete v2 role-switching saves. Keep an explicit visited scene list for branch-aware Back and history; reject cross-role and future navigation. Preserve assignment, checklist/photo, estimate send, task completion, exact note/photo, invoice and recorded-payment state on valid reload. Crew entry uses prepared context; do not emit synthetic job-assignment/task-completion metrics for prepared or teammate work. New UI remains inside existing bounded diagnostic groups.

Verify all three journeys, cancelled assignments, selecting a different teammate, empty crew note, duplicate actions, branch isolation, back/refresh, damaged saved state, native signup/exit on failures, beta callouts before estimate send and billing, role cards without stats, team cards with stats, and reduced motion. Inspect 390/320 mobile and desktop views. One meaningful current action cue; no forced waits. Full test suite, type check and one serialized production build; restart local 3144 preview. Store evidence under docs/artifacts. Update Bible local-only notes. No push/deploy.
