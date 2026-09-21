# TryOps persuasion revision

Approved direction: Jackson approved rebuilding the landing argument around the owner's desired result, specific operational relief, authentic proof, realistic effort, and a useful first step. This plan executes that direction without another design-approval gate.

## Ownership and boundaries

- PM: approved copy, capability/proof registry, section schemas, experiment compatibility, integration and verification.
- TRYOPS - P5-1: independent provenance and product-capability audit; evidence artifact only.
- TRYOPS - P5-2: landing presentation and new workflow/start sections; no configuration, experiment or demo edits.
- TRYOPS - P5-3: independent final copy, UX and safety review.
- Separate demo PM owns `/demo` and its lifecycle rebuild. Preserve its existing link/attribution contract. No demo source changes here.
- Base: remote main `29679e5a818e35b69fcfa4cef23040c32b024cac`, verified September 21. Work in an isolated checkout. No production flag, data, advertising, push or deployment changes in this phase.

## Reader and sales argument

An owner running a small trades crew arrives from a phone ad, between jobs or after work. They recognize coordination overhead, but do not want another implementation project. They need to see what changes in their working day, how OPS makes that plausible, whether their crew fits, and how to evaluate it without moving everything.

Recommended structure: owner outcome and recognizable situation → real product screen → authentic, attributed customer proof where confirmed → a connected job workflow with explicit web/iPhone roles → one real job as the first-value test → clear price → adoption/switching/device objections → trial action. Comparison traffic retains price and competitor context near the opening; trade traffic gets specific situations rather than interchangeable trade names.

No invented time or money savings, review ratings, customer numbers, setup duration, concierge service, blanket offline claim, integrations, or trial guarantee. Historical testimonials have inconsistent attribution. The subsequent July 6 platform plan explicitly records Jackson’s verification of Ryan and Jorge; their exact text and current attribution are restored from that record. Harrison/Brandon, Bobby and invented variant identities remain excluded. No fresh private-message verification is claimed.

## Layout exploration

1. Hierarchical: `[outcome + screen] / [quote] / [connected work] / [first job] / [price] / [objections] / [action]`. Clear reading order for paid mobile traffic.
2. Dashboard: `[outcome] / [feature cards + metrics] / [price]`. Rejected: presents product inventory and implies unsupported metrics.
3. Flow: `[situation] → [interactive demo] → [signup]`. Rejected as the default: forces exploration and overlaps the separately owned demo.
4. Hybrid: `[intent-specific outcome + screen/price] / [quote] / [job progression] / [first job] / [price] / [objections]`. Selected: hierarchical reading with a concrete lifecycle and a faster comparison opening.

The memorable design is the job progression: one continuous record from enquiry through field work to the invoice, rather than equal feature cards. Early real iPhone evidence grounds the promise. Preserve the quiet black canvas, white typography, hairlines, and one steel-blue primary action. Mohave display/body, Cake Mono action text and JetBrains Mono numerals trace to the existing canonical token import. Mobile is a readable vertical sequence; no carousels, hidden proof, forced scrolling, decorative animation or sticky overlap.

## Implementation

1. Audit original testimonials and capabilities against sources and the Bible. Keep a claim ledger with limits. Ask only for evidence that cannot be recovered independently.
2. Add typed `WorkflowSection`, `GettingStartedSection` and ID-based `CustomerProofSection` contracts in `lib/ab/types.ts`; register components in `lib/ab/registry.ts`. Customer proof resolves approved immutable records; never accept generated quote/name/location text.
3. Implement presentation in `components/landing/` and `app/landing.css`. Reuse the native primary action and optional demo link. Preserve accessibility and approved product images.
4. Rewrite `lib/landing/page-configs.ts` for general, comparison and trade intent. Expand capability references only where verified. Version approved content so the new revision cannot masquerade as old experiment content. Ensure generated drafts can only select approved references and cannot bypass proof requirements.
5. Update metadata and written acquisition contract as needed. No claim that conversion lift has been proven. The hypothesis concerns qualified trials and activation, not clicks alone.
6. Run existing baseline tests, focused new checks for proof resolution and approved draft boundaries, the complete relevant suite and production build. Inspect narrow phone and desktop pages, keyboard behavior, screenshot switcher, FAQ, CTA and demo destinations. Independent review fixes before completion.
7. Record source evidence, screenshots, test/build outcomes and remaining customer-proof limitations. Update the Bible for changed landing/experiment behavior. Commit this coherent local revision; request deployment only after reviewable results exist.

## Skills used

`superpowers:brainstorming`, `custom-skills:writing-plans`, `custom-skills:executing-plans`, `superpowers:using-git-worktrees`, `ops-copywriter:ops-copywriter`, `ops-market-intel:Copy Audit`, `custom-skills:ops-design`, `frontend-design:frontend-design`, `custom-skills:ui-ux-pro-max`, `custom-skills:wireframe`, `custom-skills:audit-design-system`, and browser verification guidance. Canonical OPS design and current verified product facts override outdated example copy/styles inside skills.

## Success criteria

- Every prominent promise is matched to a current product mechanism or authenticated customer account.
- A visitor can see the useful first job, platform fit, cost and next action without opening the FAQ or completing the demo.
- Ad intent remains specific; the trial is the primary action and the demo optional.
- No unknown customer quote or generated attribution can render through the approved experiment path.
- All changed behavior passes relevant checks; visual proof covers mobile and desktop. No conversion-lift claim without a valid experiment.
