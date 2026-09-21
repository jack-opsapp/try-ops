# Try OPS product-fidelity rebuild — implementation plan

**Goal:** Replace the rejected generic demo with a short, faithful, phone-first simulation of one job's information surviving the handoff from customer correspondence to completed field work.
**Architecture:** Fixture-only React views reproduce actual native OPS screen hierarchy and selected controls. One durable state machine owns progress, attached sample photos, selected crew, task status, the editable crew note and recorded sample payment. Checklist answers, measurements and the appointment are prepared sample context. Review navigation preserves completed work. The existing signed native trial handoff remains the signup boundary.
**Tech stack:** Next.js 14, React 18, TypeScript, CSS modules/canonical tokens, existing Framer Motion. No authenticated product hooks in the public simulation.
**Design system:** ops-design-system/project/DESIGN.md, mobile/MOBILE.md, vendored app/ops-tokens.css. Actual native component hierarchy takes priority over old illustrative UI kits.
**Required skills:** custom-skills:executing-plans, ops-design, frontend-design, interface-design, mobile-ux-design, ui-ux-pro-max, wireframe, ops-copywriter, tutorial-studio app-analyzer/onboarding-strategist/flow-architect/tutorial-interface/tutorial-ux-design/tutorial-copywriter, animation-architect/interactive-scenes/web-animations, Elite Animations, audit-design-system, wizard-audit, verification-before-completion.

## Product understanding and evidence

Read the three domain reports in docs/artifacts/tryops-demo-product-fidelity-2026-09-21/research. Native source d18609c9, web e26310f4 with relevant comparisons to cached origin/main6bb01d7c4. Actual native rendered artifacts confirm site visit, pinned notes, Activity author/photo row and site-visit record. After the initial source investigation, root inspected the current live web app read-only. There is no fresh native-device run; prior native artifacts and current source remain the native fidelity evidence. Root owns the exact browser evidence and verification record.

- Connected Gmail/M365 new-work correspondence can create a linked lead. Booking needs explicit bilateral agreement on one time, assigned owner, permission/conflict checks. Show the proposal and acceptance.
- Site visit is LEAD → CHECKLIST → NOTES, with PHOTO/NOTE/MEASURE toolbar, DONE → REVIEW VISIT → COMPLETE VISIT. Evidence carries to the project. A generic checklist does not generate a priced quote automatically.
- Prepared estimate has labor and material items. Native MARK APPROVED uses the accepted-estimate-to-job transaction. Every accepted LABOR item is carried into task work, including labor without a task template; grouped typed items can share a task through task scopes. This sample has two separate labor tasks, Patio preparation and Patio installation. Materials do not become labor tasks. Both tasks exist before crew assignment. Estimate-email delivery was not verified in current send action paths; do not animate a fictitious delivery.
- Project opens on ACTIVITY, with photo carousel/composer/pinned notes/feed. DETAILS has document + TASKS, native third tab EXPENSES. Core assignment edits the existing installation task: ASSIGN TEAM opens the native-shaped inline roster; individual selections stay in a draft until DONE, and CANCEL/collapse discards them. Quick Add is a real learned task+crew shortcut but is deliberately omitted from this story to avoid duplicating an estimate-derived task. Assignment leaves the task UNSCHEDULED; passage to a separately scheduled workday is explicit.
- Conversion carries the linked visit and its photos into the project. It does not automatically author a project description or copy access instructions into newly generated task notes. Accordingly, this sample has no pinned project description, and the project/task NOTES fields show `—`. The linked visit record contains the scope, access, measurements and photo; it is the automatic evidence handoff.
- Selected-task COMPLETE is separate from posting photos and a note. Project completion is not implied by one task completion. Owner sees the exact crew record beside the original visit.
- Payment is received outside OPS and recorded. No checkout. Accounting is one provider connection, not simultaneous providers; unrestricted two-way sync is not promised.

## Conversion research and narrative judgment

Sources: https://www.navattic.com/report/state-of-the-interactive-product-demo-2026 ; https://docs.navattic.com/help/best-practices ; https://www.nngroup.com/articles/onboarding-tutorials/ . Vendor observational data is directional, not causal evidence or a promised OPS lift. Favor a short flow, minimal contextual copy, actual interface interaction, no signup gate before value, and a conversion offer immediately after visible proof. Design target 60–90 seconds; not a measured performance claim.

One fictional client: Alex Morgan / Cedar Lane Cafe. Project: Cedar Lane patio, 184 Cedar Lane. Same site image, scope, measurements and access note persist. Sample photos are illustrative assets, not customer testimonials or real jobs. Main story focuses on field handoff. Billing/accounting is an optional branch after payoff.

### Five chapters / state sequence

1. **Inquiry** (`inquiry`, `booked`): the native lead's continuous dossier, not project tabs, with a compact email thread. Specific owner proposal and client acceptance are visible. Open the booked visit; show named estimator/time. No inbox setup or actual email ingestion occurs in the demo.
2. **Site visit** (`visit`, `review`): prepared checklist, measurements and access note. Visitor attaches the supplied site photo using PHOTO, sees evidence attach, chooses DONE then COMPLETE VISIT. NOTE reveals the existing captured note; measurement is prepared context rather than a simulated camera/measurement tool. Real capture/review anatomy with a bounded set of sample actions.
3. **Job ready** (`estimate`, `project`): explicit later/prepared estimate state. Review two labor rows and one materials row, then MARK APPROVED; native project opens with the same site evidence and both generated labor tasks. DETAILS → Patio installation → ASSIGN TEAM → select Pete, Nick or both → DONE. No crew is preselected. The committed names persist, and the installation task stays UNSCHEDULED. A separate narrative control, View crew on the workday, moves to a later scheduled workday; preparation is already completed in that later scenario.
4. **In the field** (`crew`, `compose`): the first selected crew member becomes the sample operator and eventual post author. Selected task, Activity/Details/Expenses chrome and the original site-visit record stay available. The visit record holds the instructions. COMPLETE changes the installation task only. A separate Post a photo update action opens the composer. Attach the supplied completion photo and POST a short editable note. No camera access or file permissions are requested.
5. **One record** (`activity`): switch role outside app chrome; owner receives exactly that note/photo with author/time, alongside original visit. CTA Start my free trial. Optional See billing leads to a sample invoice and a Record payment action with money already received; optional accounting provider detail. Restart/back/exit always usable.

No timer advances any state. Time skips are explicitly labeled (visit day / estimate prepared / scheduled workday). Guidance stays outside app chrome. Core action feedback is immediate. Activity keeps the same order before and after the post: gallery → composer → chronological feed, including the original site visit. Native pinned content is conditional and absent here because this project has no authored description. The completed photo enters both the gallery and the crew's note; either image opens a viewport-contained modal viewer. The note entry contains the real author/time, exact posted text and photo attachment, without fabricated task-status metadata. The composer is editable in the crew posting step; elsewhere its sample context is a working disclosure. Back to compose retains the note/photo and can post again without a dead end. The crew completion/post action dock sticks to the scrolling container's bottom with safe-area padding.

The shortest implemented core path takes 16 taps through the owner's completion record, or 17 when assigning both crew members. Opening the full photo and optional detail disclosures adds interactions. The 60–90 second target remains unmeasured and must not appear as a proven customer outcome.

## Delegation and ownership

- PM/root: shared state machine/types/fixture; DemoExperience shell; shared primitives/tokens CSS; signup diagnostics adapter; tests, final integration/browser proof, plan/Bible/report.
- P2-5: VisitScenes.tsx + visit-scenes.module.css only, using provided shared interface. Native capture, review, prepared estimate.
- P2-6: ProjectScenes.tsx + project-scenes.module.css only. Real Activity/Details/Expenses, existing-task crew assignment, crew complete, composer/photo, owner payoff. Root owns state persistence and selected-crew storage. Final source-fidelity review and documentation handoff are also assigned to P2-6.
- P2-4: IntakeBillingScenes.tsx + intake-billing.module.css only. Faithful lead/correspondence/appointment; optional invoice/payment/provider. No live APIs.

## Implementation contracts

All scenes receive `{ state, dispatch }` from lifecycle-state.ts and use primitives exported by DemoPrimitives.tsx. Shared scenario exported by lifecycle-data.ts. Root alone edits these files. Scene interfaces exported as named components; no default route/outer page chrome. Private CSS may import shared demo-ui.module.css classes. Every visible control performs its supported sample action, opens a real sample detail, or is rendered noninteractive context. No inert fake buttons.

Local resume revision is `job-lifecycle-v2`, stored in session storage. `assignedCrew` stores the exact nonempty Pete/Nick selection; selection order determines the demonstrated crew operator. The production diagnostics protocol remains `crew-job-v1` with its existing assign/crew/complete reporting groups. Its legacy `task_completed` event fires at task completion, before the new photo-post payoff, so it must not be reported as proof that a visitor saw the owner's completed record. No new database fields, APIs or production collection changes are required for this local simulation.

## Deliberate scope and evidence limits

- This is an illustrative native-shaped web simulation, not a live iPhone session, real company or actual ingestion/booking run. Sample media is supplied artwork.
- The estimate is already priced and accepted by the customer; the visitor records approval. Quote authoring, estimate email delivery, client portal acceptance, crew scheduling and invoice sending are not simulated actions.
- Both labor tasks are generated, but the visitor assigns and completes only installation. Preparation completion is later-workday context. The project itself is not automatically marked complete.
- The demo posts one editable sample note/photo pair; revisiting and posting replaces that sample post. It is not a general-purpose activity editor. Crew reassignment, free-form task creation and arbitrary uploads are outside the bounded flow.
- Payment recording models a bank transfer already received outside OPS. Accounting is an optional single-provider preview for QuickBooks or Sage; no account connects, no OAuth begins and no sync success is claimed.
- Trial links continue to canonical registration. A click is signup intent, not a captured account, created trial, sent welcome email or established funnel conversion.
- Source review establishes workflow correspondence. Parent-owned browser QA, automated test totals, production build result and screenshots must be recorded separately; no live release, physical-phone performance, usability timing or conversion lift is implied by this plan.

## Verification

- Meaningful state tests: prerequisites; duplicate taps; back/refresh preserve work; restart clears; malformed storage; note and photo identity retained; payment independent of task/project state; unsupported future navigation rejected.
- Component journey tests exercise real controls and meaningful output; signup/exit anchors survive storage/analytics failure.
- Preserve existing funnel/API/auth tests. Existing diagnostics protocol stays compatible; lifecycle revision stored separately. Old assign/crew/complete protocol steps are reporting groups, not the visual chapter names. No database migration required for the existing signup capture.
- Browser phone320/390/430 + desktop1280/1440: real interactions, scroll, no horizontal overflow, min44 controls, no clipped action bar, meaningful reduced-motion alternative, imagery loads, source fidelity comparison to native proof.
- Tests + production build + local preview. No push/deploy as part of local correction. Update Bible accurately and report the exact proof limits.
