# Automatic demo updates

**Goal:** Visitors act only on their own work. Incoming approval, invoice and payment events appear as in-screen sample notifications.
**Architecture:** Keep the fixture reducer and add visibility-aware, cancellable presentation timers. Financial effects remain local sample state. V4 resets old interactive-approval saves. Completed events never replay on Back/reload.
**Design system:** OPS DESIGN.md and MOBILE.md; existing ops-tokens.css. Dense glass, neutral hairlines, mono labels, canonical ease and reduced-motion fade.
**Skills:** custom writing/executing plans, OPS design/copy, frontend/interface/mobile, animation architect/web/interactive/Elite, tutorial auditor/wizard and design audit.

## Implementation

1. Root: acceptance interlude automatically advances after client approval. Billing runs invoice-sent then later external-payment-recorded events. Keep native trial available. Pause/resume and hidden-tab handling preserve remaining visible time; Back/restart cancel pending events. Notifications do not steal focus.
2. P3-1: self-contained, tokenized push-style notification in reserved space at the top of the sample screen; one polite status region and optional dismiss.
3. P3-2: task/picker focus and auto-scroll happen only after relevant user actions, never on passive review. Strengthen current target. Accounting badge appears only in billing.
4. P3-3: adapt existing journey/diagnostic tests. Root adds timer interruption/resume/order tests, checks browser paths/mobile, runs suite/types/build, updates local-only Bible notes and commits locally.

## Truth boundary

The user explicitly requested automated billing as a beta sample narrative. The demo shows that requested behavior; current production invoice-suggestion code still requires approval. It does not send actual estimates/invoices, record real payments, connect accounts or request browser push permission. Payment arrives outside OPS. No deployment is authorized.
