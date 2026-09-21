# Demo action guidance and viewing roles

Updated the local demo after feedback that the next action and role changes were confusing.

- Exactly one current action is outlined, with three restrained pulse rings on arrival. Reduced-motion mode keeps the static outline.
- Explicit owner, estimator and selected crew viewing labels. Copy announces the return to the owner.
- An interaction test follows every action through the optional payment-recording scene, checking that exactly one cue exists and that Nick's selected identity is reflected.
- Automated suite: 275 tests passed across 30 files. Type checking and production build passed.
- Browser walkthrough at 390 × 844: owner entry, estimator photo, crew picker and crew completion cue. No horizontal overflow observed. The CSS pulse animation is active on the single selected action.
- Changed styles use existing OPS accent, spacing, border, duration and easing tokens. No new hardcoded palette, spacing or type values.
- Screenshots: `phone-estimator-cue.png`, `phone-crew-cue.png`.
- Refreshed local production preview at http://127.0.0.1:3144/demo. No push or deployment.
