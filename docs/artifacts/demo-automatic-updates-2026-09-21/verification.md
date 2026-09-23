# Automatic demo updates — verified locally

Final browser verification: September 22, 2026. Implementation and automated suite: September 21.

## Result

- The visitor sends the sample estimate; client approval arrives automatically as an in-screen notification and opens the project.
- The accounting beta callout appears only in Billing.
- Opening Details reveals and focuses the highlighted resurfacing task. Opening that task reveals Assign team; roster selection reveals Done; committing the assignment reveals the next workday action.
- Billing automatically shows Invoice sent, then Payment recorded for money received outside OPS. There are no required approval, invoice-create or payment-record buttons.
- Pause/resume retains the remaining visible reading time. Hidden tabs and the accounting preview pause updates. Back/restart cancel pending events; completed facts do not replay.

## Automated proof

- Vitest: **354 passed, 33 files passed** (`tests.log`; two workers).
- TypeScript: `tsc --noEmit` passed.
- Next.js optimized production build: passed (`build.log`). Existing Browserslist age and webpack cache-size warnings are non-blocking.
- `git diff --check`: passed.
- Ten new automation cases cover timing, ordering, visibility, pause, accounting preview, Back/restart, restore, StrictMode, dismissal and focus. Six task-guidance cases cover revealing targets and preserving keyboard/reduced-motion behavior.
- Independent GPT-5.6 source/design/wizard review returned no P0/P1/P2 findings in the changed scope.

## Browser proof

The rebuilt production bundle was served at `http://127.0.0.1:3144/demo` and traversed through Operator → Mike → estimate → automatic approval → Details → resurfacing → Pete → completed work → Billing → automatic invoice → pause/resume → automatic payment. No manual financial action was taken.

- [Approval notification, 390px](estimate-notification-390.png)
- [Task revealed and highlighted, 390px](task-guidance-390.png)
- [Invoice notification while paused, 390px](invoice-notification-390.png)
- [Payment notification, 390px](payment-notification-390.png)
- [Payment notification, 320px](payment-notification-320.png)
- [Desktop billing and notification](payment-notification-desktop.png)

At 320px the document content width was 316px with no horizontal overflow. Notifications remained readable and did not cover a control. The built walkthrough reported no captured browser warnings or errors. The preview was reset to role selection and the temporary viewport override was removed.

## Boundaries

These are local sample-state changes. They send no estimate/invoice, process no payment, connect no accounting provider and perform no business-table write. The demo-only automatic billing narrative is authorized by the user; production invoice suggestions still require approval. Trial links and canonical account/company/trial capture are unchanged. No new-account/email-delivery canary, physical-phone performance measurement, deployment or conversion lift is claimed.
