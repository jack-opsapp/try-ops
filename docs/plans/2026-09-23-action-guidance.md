# Consistent action guidance

## Decision

Keep the existing one-next-action flow. Use a steel-blue trail and bright leading edge orbiting continuously around the action, separated from it by a 4px token-derived gap. Keep a steady outer outline beneath the moving pulse. This directs attention without covering the control or shifting the layout.

## Implementation

- Follow the existing `data-demo-next` markers, including locally revealed task/crew controls.
- Place an inert SVG inside each target, with a sibling overlay for the textarea. Use a normalized rectangle path so the same motion follows short controls, wide rows and grouped choices.
- Inherit each target's corner shape and expand it with the outer gap. Allow the task group and crew picker to show the outer stroke while preserving rounded child surfaces.
- Use existing OPS accent/text, hairline, spacing and duration tokens. Use linear timing for this continuous orbit, as requested; entrance easing would create a visible slowdown at every lap boundary.
- Pause outside the viewport and in hidden tabs. Disconnect observers when targets change or the demo unmounts.
- Preserve keyboard focus, pointer behavior, choice neutrality, automated cutscenes and funnel behavior. Reduced motion keeps the static outline.

## Verification

- Behavioral tests: target handoff/removal, disabled controls, textarea integrity, offscreen/hidden pause and observer cleanup.
- Existing lifecycle tests retain exactly one next-action marker through Operator and Crew paths.
- Browser: phone and desktop, clipped task row, assignment picker, completion notification and crew composer; inspect actual SVG motion and reduced-motion fallback.
- Build and type check in the explicitly granted shared validation slot.
