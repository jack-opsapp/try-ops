'use client'

import { useEffect, useId, useRef, useState } from 'react'
import {
  ArrowLeft,
  Move,
  PlusCircle,
  Redo2,
  Ruler,
  Settings,
  SlidersHorizontal,
  Undo2,
  X,
} from 'lucide-react'
import { Action, NumericText } from './DemoPrimitives'
import { FeatureCallout } from './FeatureCallout'
import { SAMPLE } from './lifecycle-data'
import type { SceneProps } from './lifecycle-state'
import styles from './spec-tool.module.css'

const DEPTH_FT = 12
const WIDTHS = [12, 16, 20] as const

/** Illustrative takeoff, separate from the prepared estimate. Six-inch board
 * coverage gives two linear feet per square foot; 10% waste is added before
 * rounding up to 16-foot stock boards. This is not an engineering calculator. */
export function sampleDeckTakeoff(width: number) {
  const area = width * DEPTH_FT
  return { area, boards: Math.ceil(area * 2 * 1.1 / 16) }
}

function ToolGlyph({ icon: Icon, label, active = false, disabled = false }: {
  icon: typeof Ruler
  label: string
  active?: boolean
  disabled?: boolean
}) {
  return <span className={styles.toolGlyph} data-active={active || undefined} data-disabled={disabled || undefined} aria-disabled={disabled || undefined}>
    <Icon aria-hidden="true" />
    <span>{label}</span>
  </span>
}

export function SpecTool({ state, dispatch, onClose }: SceneProps & { onClose: () => void }) {
  const tool = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const id = useId()
  const [editingWidth, setEditingWidth] = useState(true)
  const width = state.deckWidth
  const takeoff = sampleDeckTakeoff(width)
  const perimeter = (width + DEPTH_FT) * 2
  const deckWidth = width * 9
  const deckDepth = DEPTH_FT * 9
  const deckX = (360 - deckWidth) / 2
  const deckY = 66
  const deckBottom = deckY + deckDepth
  const deckRight = deckX + deckWidth

  useEffect(() => {
    tool.current?.scrollIntoView?.({ block: 'start', behavior: 'auto' })
    heading.current?.focus({ preventScroll: true })
  }, [])
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') { event.preventDefault(); onClose() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return <section ref={tool} className={styles.tool} aria-label="Deck designer preview">
    <div className={styles.body}>
      <FeatureCallout kind="spec" />

      <div className={styles.workspace}>
        <div className={styles.floatingHeader}>
          <div className={styles.titleBar}>
            <button className={styles.iconButton} type="button" aria-label="Return to estimate" onClick={onClose}>
              <X aria-hidden="true" />
            </button>
            <h2 ref={heading} tabIndex={-1}><NumericText>{SAMPLE.project}</NumericText></h2>
            <div className={styles.modeSwitch} aria-label="Drawing view">
              <span data-active="true">2D</span>
              <span aria-disabled="true" title="Available in the full Deck Designer">3D</span>
            </div>
            <span className={styles.iconPlaceholder} aria-hidden="true"><Settings /></span>
          </div>

          <div className={styles.instrumentRow}>
            <div className={styles.metrics} aria-live="polite" aria-atomic="true">
              <span><small>Length</small><strong>{perimeter} ft</strong></span>
              <i aria-hidden="true" />
              <span><small>Area</small><strong>{takeoff.area} sq ft</strong></span>
            </div>
            <div className={styles.editCluster} aria-label="Edit controls unavailable in this preview">
              <span aria-hidden="true"><Undo2 /></span>
              <i aria-hidden="true" />
              <span aria-hidden="true"><Redo2 /></span>
              <i aria-hidden="true" />
              <span aria-hidden="true"><PlusCircle /></span>
            </div>
          </div>
        </div>

        <div className={styles.drawingViewport}>
          <div className={styles.drawingPlane}>
        <svg className={styles.canvas} viewBox="0 0 360 300" role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
          <title id={`${id}-title`}>{width} by {DEPTH_FT} foot deck plan</title>
          <desc id={`${id}-description`}>A top-down deck drawing with a dotted drafting grid, a house edge, stairs, vertices and dimension labels.</desc>
          <g key={width} className={styles.geometry}>
            <rect className={styles.deckSurface} x={deckX} y={deckY} width={deckWidth} height={deckDepth} />
            <line className={styles.houseEdge} x1={deckX} y1={deckY} x2={deckRight} y2={deckY} />
            {Array.from({ length: Math.floor(deckWidth / 18) + 1 }, (_, index) => deckX + index * 18)
              .filter(x => x < deckRight)
              .map(x => <line key={x} className={styles.houseHatch} x1={x} y1={deckY} x2={x + 10} y2={deckY - 10} />)}
            <line className={styles.railLine} x1={deckX} y1={deckY} x2={deckX} y2={deckBottom} />
            <line className={styles.railLine} x1={deckRight} y1={deckY} x2={deckRight} y2={deckBottom} />
            <line className={styles.deckEdge} x1={deckX} y1={deckY} x2={deckX} y2={deckBottom} />
            <line className={styles.deckEdge} x1={deckRight} y1={deckY} x2={deckRight} y2={deckBottom} />
            <line className={styles.deckEdge} x1={deckX} y1={deckBottom} x2={deckRight} y2={deckBottom} />

            <g className={styles.step}>
              <rect x="142" y={deckBottom} width="76" height="22" />
              <line x1="142" y1={deckBottom + 22} x2="218" y2={deckBottom + 22} />
            </g>

            {[[deckX, deckY], [deckRight, deckY], [deckX, deckBottom], [deckRight, deckBottom]].map(([x, y]) =>
              <circle key={`${x}-${y}`} className={styles.vertex} cx={x} cy={y} r="5" />)}

            <line className={styles.dimensionGuide} x1={deckX} y1={deckBottom + 46} x2={deckRight} y2={deckBottom + 46} />
            <line className={styles.dimensionGuide} x1={deckX} y1={deckBottom + 40} x2={deckX} y2={deckBottom + 52} />
            <line className={styles.dimensionGuide} x1={deckRight} y1={deckBottom + 40} x2={deckRight} y2={deckBottom + 52} />
          </g>
        </svg>

        <span
          className={styles.depthDimensionLabel}
          style={{ left: `${(deckRight + 40) / 360 * 100}%`, top: `${(deckY + deckDepth / 2) / 300 * 100}%` }}
          aria-hidden="true"
        >
          <span>12&apos; 0&quot;</span>
          <small>Depth</small>
        </span>

        <button
          className={styles.widthDimension}
          type="button"
          aria-expanded={editingWidth}
          aria-controls={`${id}-width-controls`}
          style={{ top: `${(deckBottom + 46) / 300 * 100}%` }}
          onClick={() => setEditingWidth(value => !value)}
        >
          <span>{width}&apos; 0&quot;</span>
          <small>Width</small>
        </button>

        <p className={styles.canvasHint}>[Tap the width label to edit]</p>
          </div>
        </div>

        <div className={styles.bottomChrome}>
          {editingWidth && <fieldset className={styles.dimensionRack} id={`${id}-width-controls`}>
            <legend><Ruler aria-hidden="true" />Width</legend>
            <div>
              {WIDTHS.map(value => <button type="button" key={value} aria-pressed={value === width}
                onClick={() => dispatch({ type: 'SET_DECK_WIDTH', value })}>{value}&apos; 0&quot;</button>)}
            </div>
          </fieldset>}
          <div className={styles.toolbar} aria-label="Deck Designer tool layout">
            <span className={styles.contextLabel}>Edge</span>
            <i aria-hidden="true" />
            <ToolGlyph icon={Ruler} label="Dimension" active={editingWidth} />
            <ToolGlyph icon={Move} label="Move XY" disabled />
            <ToolGlyph icon={SlidersHorizontal} label="Properties" disabled />
            <i aria-hidden="true" />
            <span className={styles.previewScope}>Preview</span>
          </div>
        </div>
      </div>

      <div className={styles.takeoff}>
        <div aria-live="polite" aria-atomic="true">
          <span><small>Sample board order</small><strong>{takeoff.boards}</strong><em>16 ft boards</em></span>
          <details className={styles.assumptions}>
            <summary>Takeoff assumptions</summary>
            <p>Fixed 12 ft depth. Decking uses 6 in coverage, 10% waste and 16 ft stock. Framing, railings and structural requirements are excluded.</p>
          </details>
        </div>
        <p className={styles.limit}>This preview shows one dimension change. It does not change your prepared estimate.</p>
      </div>
    </div>
    <div className={styles.footer}><Action secondary onClick={onClose}><ArrowLeft aria-hidden="true" />Return to estimate</Action></div>
  </section>
}
