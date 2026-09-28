# Deck Designer demo source reference

The current embedded OPS editor is `DeckBuilderView` plus `DeckCanvasView`; no current `DeckDesignerView` or `DeckDrawingCanvas` symbols exist under `ops-ios/OPS`.

## Native source used

- `ops-ios/OPS/DeckBuilder/Views/DeckBuilderView.swift`
  - Full-bleed 2D canvas with floating chrome.
  - One compact title card: close, parent project name, 2D/3D mode, settings.
  - A second floating row for Length/Area and undo/redo/import.
  - Bottom toolbar overlays the canvas rather than shrinking it.
- `ops-ios/OPS/DeckBuilder/Views/DeckCanvasView.swift`
  - Dotted snap grid, subtle surface fill, crisp white edges and vertices.
  - Architectural hatch for the house edge.
  - Dark monospaced dimension pills kept readable as the drawing scales.
  - Selected dimensions enter editing from the drawing itself.
- `ops-ios/OPS/DeckBuilder/Views/DeckToolbar.swift`
  - Context changes with the selected geometry.
  - An edge selection exposes Dimension, Move XY and Properties rather than a generic permanent width tool.
- `ops-ios/OPS/Styles/OPSStyle.swift`
  - Black canvas, dense floating surfaces, hairline borders, tokenized spacing, 44-point native controls and the single OPS motion curve.
- `ops-software-bible/07_SPECIALIZED_FEATURES.md`
  - Embedded OPS and standalone OPS Decks have separate capability boundaries. This demo must not present the standalone full editor as a standard production feature.
- `public/images/demo/deck-site.png`
  - The sample job is a house-backed rectangle with railings on both side edges and one broad centered lower step.

## Web demo translation

`components/demo/SpecTool.tsx` recreates that hierarchy as a bounded 2D preview: the real sample project name, full canvas, dotted grid, house edge, side railings, broad step, dimension pills, floating title/metric/edit clusters, and edge-selection toolbar. Tapping the width dimension opens the only active instrument and dispatches the existing `SET_DECK_WIDTH` action for 12, 16, or 20 feet. Area, perimeter, and the exported `sampleDeckTakeoff` update from that state.

The 3D, settings, undo/redo/import, Move XY, and Properties controls are shown only as disabled visual context. The preview does not mutate the prepared estimate or claim to provide the production designer.
