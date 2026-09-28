# TryOps hero motion concept — Claude handoff

Status: creative recommendation for Jackson's requested photo-versus-motion experiment. The animation and experiment are not implemented or launched.

## The idea

Show one task moving from a clear crew instruction to visible completion evidence in the owner's job record. The emotional payoff is: **I can know what is happening without another call.** This supports the existing headline, “RUN THE JOB. STOP CHASING THE DETAILS.”

Use one explicitly labeled sample job, one crew member, and the same job identity throughout. Base the interface on actual OPS screens and the verified demo/product contracts. Crop to the information that matters so it is readable on a phone.

## Storyboard

| Timing | Picture | What the visitor understands |
|---|---|---|
| 0–2 seconds | A crew member's assigned task: job name, address, short instruction. The plan is already readable in the opening frame. | My crew knows the job. |
| 2–5 seconds | A deliberate action completes that task. A separate action adds a genuine sample completion photo and a short job note. | The person doing the work records it. |
| 5–8 seconds | Maintain the job name and photo through a restrained transition into the owner's view. Show that crew member's update, task status, and photo together. | I can see the work on the right job. |
| End | Hold the owner view. Provide replay. | Certainty is the final impression. |

Treat the timing as a starting point; preserve legibility over packing in extra actions. Completion of one task must not imply that every task or the whole project is complete. Show user actions explicitly. Do not imply instant guaranteed synchronization, automatic photo capture, automated estimates, or payment processing. Use illustrative sample content, never fabricated customer proof.

## Presentation

- Keep the existing headline, supporting copy, offer, trial CTA, and optional demo link stationary and available from the first frame.
- Place the motion inside the hero's product-evidence area, with the same reserved space as the static treatment. No page-layout shift or scroll-controlled playback.
- Use the canonical OPS design system at `/Users/jacksonsweet/Projects/OPS/ops-design-system/project/DESIGN.md`, including its typography, colors, tokens, and `cubic-bezier(0.22, 1, 0.36, 1)` easing. Canonical brand rules override stale skill examples.
- Use crisp transitions and preserve spatial continuity. Keep the actual photo, task, and author recognizable across the handoff. The presentation must read at 320px and 390px viewport widths as well as desktop.
- Silent autoplay once when visible, pause/replay controls, and a settled final frame. Pause offscreen or when the tab is hidden.
- Render useful static product evidence immediately while motion assets load. Reduced-motion users receive the final meaningful composition with at most a brief opacity transition. A loading or playback failure keeps that same evidence visible.
- Keep load performance within the current landing budget. Defer animation code and avoid delaying the heading or trial link.

## Handoff and experiment

Claude should return a self-contained hero presentation component, responsive layouts, required assets, the final static poster, and the public props/interface. Reuse the project's current React/animation dependencies where they fit. Do not build a separate randomizer or change the demo.

The TryOps engine owns assignment, immutable treatment versions, exposure tracking, and outcome attribution. Keep all other page content and placement the same between arms. Control is the current approved static product visual; treatment is this product story. This measures which complete visual treatment converts better; because the story also changes, it does not isolate motion alone. A still-versus-animated version of the identical composition would answer that narrower question.

Primary decision metric: canonical trial starts per eligible assigned visitor, with activation and paid outcomes as downstream checks. Demo plays, replay clicks, scroll depth, and watch time are diagnostic only. Preserve honest assignment even when a device receives the reduced-motion or failed-load fallback, and record fallback/render success separately. Do not announce a winner from early or low-volume results.

## Research basis

- [Nielsen Norman Group: The Role of Animation and Motion in UX](https://www.nngroup.com/articles/animation-purpose-ux/) — motion can communicate feedback and state changes, but also competes for attention. This supports a short, causal product demonstration; it does not establish conversion lift for TryOps.
- [Google web.dev: Video performance](https://web.dev/learn/performance/video-performance) — video delivery and loading choices affect performance. The implementation must protect the initial landing experience.
- [W3C: Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) — automatically moving content lasting over five seconds alongside other content needs a pause, stop, or hide mechanism, subject to the criterion's exceptions.

Skills consulted: `superpowers:brainstorming`, `animation-studio:animation-architect`, `animation-studio:marketing-hero`, `ops-copywriter:ops-copywriter`, and `custom-skills:ops-design`.
