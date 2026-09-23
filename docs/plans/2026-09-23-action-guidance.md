# Consistent action guidance

## Decision

Keep the existing one-next-action flow. Replace the expanding rings with one short perimeter pass: a steel-blue trail and bright leading edge, followed by a quiet pause. Keep a steady inset outline between passes. This directs attention without changing the native control or shifting the layout.

## Implementation

- Follow the existing `data-demo-next` markers, including locally revealed task/crew controls.
- Place an inert SVG inside each target, with a sibling overlay for the textarea. Use a normalized rectangle path so the same motion follows short controls, wide rows and grouped choices.
- Inherit each target's corner shape. Inset the stroke to prevent clipping inside native task groups.
- Use existing OPS accent/text, hairline and duration tokens with the canonical easing curve.
- Pause outside the viewport and in hidden tabs. Disconnect observers when targets change or the demo unmounts.
- Preserve keyboard focus, pointer behavior, choice neutrality, automated cutscenes and funnel behavior. Reduced motion keeps the static outline.

## Verification

- Behavioral tests: target handoff/removal, disabled controls, textarea integrity, offscreen/hidden pause and observer cleanup.
- Existing lifecycle tests retain exactly one next-action marker through Operator and Crew paths.
- Browser: phone and desktop, clipped task row, assignment picker, completion notification and crew composer; inspect actual SVG motion and reduced-motion fallback.
- Build and type check in the explicitly granted shared validation slot.
