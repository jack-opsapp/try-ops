# TryOps visual refinement implementation plan

**Goal:** Give the approved landing experience a deliberate, cohesive visual hierarchy, with useful product proof early on a phone.

**Authorization:** Jackson approved the previously proposed hero, screenshot framing and mobile pacing refinement. This is a bounded evolution of existing presentation. Local implementation and review are authorized; pushing, deployment and activation are separate.

**Architecture:** Preserve the schema-driven sections, approved hero copy, real iOS assets, native signup action and all measurement/experiment code. Refine Hero, ProductProof, SolutionSection and their scoped CSS. Keep pricing and comparison claims intact. No new dependencies or generated app imagery.

**Design system:** `ops-design-system/project/DESIGN.md` and canonical `colors_and_type.css`, already imported through `app/ops-tokens.css`. Black `--bg`, text hierarchy `--text/--text-2/--text-3`, primary-only `--ops-accent`, `--font-mohave`, `--font-mono`, `--font-cakemono`, `--unit`, `--line`, `--r-panel`, `--r-btn`. New layout measures derive from these tokens. Image crops and responsive breakpoints are content constraints.

**Required skills:** superpowers:brainstorming; custom-skills:writing-plans; custom-skills:executing-plans; frontend-design:frontend-design; custom-skills:ops-design; custom-skills:ui-ux-pro-max; custom-skills:wireframe; ops-copywriter:ops-copywriter; custom-skills:audit-design-system; browser:control-in-app-browser; superpowers:verification-before-completion. Motion assessment used animation-studio:animation-architect and custom-skills:Elite Animations: retain existing immediate CSS feedback, add no entrance or ambient animation.

## Direction and alternatives

1. Hierarchical: title, action, full phone, benefits. Clear phone order but a long full-height screenshot delays everything else.
2. Grid: hero plus several equal product cards. Rejected: fragments attention and invents more product surfaces than the evidence needs.
3. Flow: headline, guided demo, action. Rejected: makes learning precede signup; the separate demo task owns that optional route.
4. Integrated editorial composition (selected): a larger headline anchored beside a bounded, clearly captioned real product view; action and terms sit with the promise. On phones, action/terms lead immediately into the useful product view, then the secondary price detail. Comparison pages retain their comparison before the action/product.

Typography supplies the dominant gesture. The screenshot panel is a clearly identified product excerpt with a native full-image link, not a fake phone or simulated app. Controls follow the image rather than delaying it. Below it, a substantial benefit heading sits beside stacked outcome rows; pricing remains a distinct semantic comparison, FAQ a quieter reading section.

## Ownership

- PM: implementation, visual inspection, contract/build verification, final artifact and isolated commit.
- TRYOPS - P4-1: independent art direction/mobile critique and final screenshot review; report-only.
- TRYOPS - P4-2: copy and claim review; report-only.
- TRY OPS DEMO PM owns `/demo`, signup handoff and demo measurement. Its existing ProductProof `proof-demo-link` seam follows proof-heading. Preserve/reconcile that native link and its safe `from` path once the complete demo branch is integrated. Do not import an incomplete demo dependency chain here.

## Execution

1. Record clean released baseline `1f069341` and create the local refinement branch in the existing isolated checkout.
2. Restructure Hero so price details can follow proof on phones while remaining adjacent to the action on desktop. Keep comparison content, headline, subtext and PrimaryAction untouched.
3. Refine ProductProof framing, crop and selected-view caption using the actual schedule/job-board assets. Retain image dimensions, responsive sizing, keyboard buttons, visible example label and native full-image access.
4. Restructure SolutionSection as a lead heading plus benefit rows. Render every supplied feature and its source-backed copy; no positional capability assumptions.
5. Replace corresponding CSS rules using tokens, with natural wrapping from 320px through wide desktop and 200% text/zoom behavior. Preserve reduced-motion and visible focus.
6. Run existing landing/CTA/config tests; add only meaningful coverage for changed ordering and accessible screenshot selection if absent.
7. Start one local preview with no production credentials. Inspect root, representative trade and all comparison pages at phone/desktop/landscape sizes; verify no overflow and useful screenshot content above the first phone fold on the general page. Inspect keyboard focus, alternate image, FAQ, image failure and no-JavaScript signup continuity.
8. Have independent reviewers critique actual final screenshots. Fix findings before acceptance. Run a bounded production build and design-token scan, then commit the coherent local change and update Bible presentation documentation.

## Evidence and completion

Artifacts live under `/Users/jacksonsweet/Projects/OPS/docs/artifacts/tryops-visual-refinement-2026-09-14/`. Preserve before/after screenshots at matching viewports. Final report distinguishes local preview, test/build proof, deployed state and unmeasured conversion results. No experiment, ad campaign or production configuration is changed by this pass.

## Completed local acceptance

- Implemented the four-file presentation change on `feat/tryops-visual-refinement`, based on released source `1f069341c2fefe9d7b18489a7bd6664e68bab480`.
- Independent art-direction, copy/claims and source/accessibility/token reviewers accepted the final result. The initial schedule crop cut a job; the final proportional frame shows two complete jobs on desktop.
- Full existing suite: 142 tests across 15 files passed. Production build passed, including lint, type checking and 43 generated pages. No runtime dependencies were added.
- Browser evidence covers root plus all seven paid routes at phone width, desktop root/comparison/benefits, 320px, tablet and landscape layouts, and the exact 480/481px and 800/801px boundaries. No horizontal overflow was observed. The first root phone job appears near y=765 in a 390×844 viewport.
- Both real image selections, loaded image state, selected-button state, matching native full-image destination and native FAQ expansion were verified. Native registration continuity is covered by the existing SSR tests and unchanged action source.
- Focus styles and reduced-motion behavior passed source review. Physical-device use, an actual 200% browser zoom session, keyboard-only traversal, forced image failure and a full JavaScript-disabled registration journey were not exercised; this report does not represent those as observed browser proof.
- The complete demo candidate is owned by the separate demo PM. They will combine this accepted visual commit with their verified demo dependencies and recheck the native optional entry. The visual branch does not contain a partial demo implementation.

This completes the bounded local visual refinement. Deployment and measured conversion outcomes are separate states.
