# Context before control

## Decision

Use a short, automatically paced scene whenever another person, elapsed time, or background work changes the job. Keep the visitor in their selected role. Return to the actual sample interface as soon as the cause and result are clear.

## Story

1. Operator opening: customer email → OPS creates the lead → the operator's sample reply → customer confirms → visit booked.
2. Delegated visit: selected teammate on site → photo and checklist captured → completed form returned to the operator.
3. Quote preparation: captured scope → prepared sample estimate. This does not claim automatic pricing.
4. Sent estimate: estimate reaches client → client accepts → project and labor tasks are ready.
5. Crew opening: assigned task and visit context → later, work is finished and the visitor can mark their task complete.
6. Operator workday: crew on site → progress photo → completion photo and update arrive.
7. Billing: all tasks complete → sample invoice sent → later external payment recorded.

## Execution

- P4-1, GPT-5.6: responsive presentation component and tokenized CSS. One focal event at a time; actor, time and direction visible; calendar and job-photo compositions. Transform/opacity with canonical easing and reduced-motion fade.
- P4-2, GPT-5.6: bounded scripts and reading durations; OPS/tutorial copy skills.
- P4-3, GPT-5.6: adapt existing role, resume, automation and integration tests.
- Root: versioned reducer, visible-time playback, root integration, new state/timing tests, browser verification, Bible update and local commits.

## Architecture and safeguards

V5 stores the active scene and beat with the sample state. A requestAnimationFrame clock waits for each job photo to load (or fail without blocking the journey), then advances only visible reading time and stops for pause, hidden tabs, off-screen content, Back/restart and unmount. Reload resumes the current beat; completed scenes do not replay unless requested. Skip completes the local narrative; replay changes no completed facts. No new business calls, diagnostics schema or conversion definitions.

Use existing global OPS tokens and compositor CSS (250ms canonical entrance, 150ms reduced-motion fade); no new animation dependency. Primary task controls are absent during playback. Pause/skip stay reachable; replay is optional after landing. Beta callout remains Billing-only. Invoice/payment remain fictional, and payment is explicitly received outside OPS.

## Verification

Reducer order and malformed restore, role invariants, skip/replay idempotence, hidden/pause/off-screen/cancellation timing; existing full suite and type/build checks. Watch full opening and representative later transitions at 390px, narrow 320px and desktop; inspect that information arrives in readable order and controls remain usable.
