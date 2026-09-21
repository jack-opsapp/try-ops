'use client'

import { useEffect, useId, useRef } from 'react'
import { ArrowLeft, Ruler } from 'lucide-react'
import { Action, AppHeader } from './DemoPrimitives'
import { FeatureCallout } from './FeatureCallout'
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

/** Axonometric sample geometry: x follows the deck width, z its fixed depth,
 * and vertical screen offset represents the raised deck edge/supports. */
function point(x: number, z: number, drop = 0) {
  return `${112 + x * 8 - z * 5},${62 + x * 3 + z * 4 + drop}`
}

export function SpecTool({ state, dispatch, onClose }: SceneProps & { onClose: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null)
  const id = useId()
  const width = state.deckWidth
  const takeoff = sampleDeckTakeoff(width)

  useEffect(() => { heading.current?.focus({ preventScroll: true }) }, [])
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') { event.preventDefault(); onClose() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return <section className={styles.tool} aria-label="Deck designer preview">
    <AppHeader title="Deck designer" titleRef={heading}
      left={<button className={styles.backButton} type="button" aria-label="Return to estimate" onClick={onClose}><ArrowLeft /></button>} />
    <div className={styles.body}>
      <FeatureCallout kind="spec" />
      <div className={styles.intro}>
        <h3>Change the drawing. See the takeoff.</h3>
        <p>Try a different deck width.</p>
      </div>
      <figure className={styles.drawing}>
        <div className={styles.drawingHeader}><span>Deck plan</span><span>Perspective</span></div>
        <div className={styles.drawingCanvas}>
        <svg className={styles.preview} viewBox="0 0 360 264" role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
          <title id={`${id}-title`}>{width} by {DEPTH_FT} foot sample deck</title>
          <desc id={`${id}-description`}>A raised rectangular deck shown in perspective. Changing the width updates the drawing and sample material quantities.</desc>
          <defs>
            <pattern id={`${id}-grid`} width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" className={styles.gridLine} fill="none" /></pattern>
          </defs>
          <rect width="360" height="264" fill={`url(#${id}-grid)`} />
          <g key={width} className={styles.geometry}>
            <polygon points={`${point(0, 0, 46)} ${point(width, 0, 46)} ${point(width, DEPTH_FT, 46)} ${point(0, DEPTH_FT, 46)}`} className={styles.footprint} />
            {[0, width / 2, width].map(x => <g key={x} className={styles.supports}>
              <path d={`M ${point(x, 0, 8)} L ${point(x, 0, 46)} M ${point(x, DEPTH_FT, 8)} L ${point(x, DEPTH_FT, 46)}`} />
            </g>)}
            <polygon points={`${point(0, DEPTH_FT)} ${point(width, DEPTH_FT)} ${point(width, DEPTH_FT, 9)} ${point(0, DEPTH_FT, 9)}`} className={styles.frontEdge} />
            <polygon points={`${point(width, 0)} ${point(width, DEPTH_FT)} ${point(width, DEPTH_FT, 9)} ${point(width, 0, 9)}`} className={styles.sideEdge} />
            <polygon points={`${point(0, 0)} ${point(width, 0)} ${point(width, DEPTH_FT)} ${point(0, DEPTH_FT)}`} className={styles.deckSurface} />
            {Array.from({ length: 23 }, (_, index) => (index + 1) / 2).map(z => <path key={z} d={`M ${point(0, z)} L ${point(width, z)}`} className={styles.boardLine} />)}
            <path d={`M ${point(0, DEPTH_FT + 3)} L ${point(width, DEPTH_FT + 3)}`} className={styles.dimensionLine} />
            <path d={`M ${point(0, DEPTH_FT + 2.5)} L ${point(0, DEPTH_FT + 3.5)} M ${point(width, DEPTH_FT + 2.5)} L ${point(width, DEPTH_FT + 3.5)}`} className={styles.dimensionLine} />
          </g>
        </svg>
        {/* DOM labels retain the minimum readable font size as the drawing scales. */}
        <span className={styles.dimensionLabel} style={{ left: `${(112 + width * 4 - (DEPTH_FT + 3) * 5) / 360 * 100}%`, top: `${(62 + width * 1.5 + (DEPTH_FT + 3) * 4 + 14) / 264 * 100}%` }} aria-hidden="true">{width} FT</span>
        <span className={styles.dimensionLabel} style={{ left: `${(112 + width * 8 - DEPTH_FT * 2.5 + 28) / 360 * 100}%`, top: `${(62 + width * 3 + DEPTH_FT * 2) / 264 * 100}%` }} aria-hidden="true">12 FT</span>
        </div>
        <figcaption>Sample drawing · {width} × {DEPTH_FT} ft</figcaption>
      </figure>
      <fieldset className={styles.widthControl} data-demo-next="true">
        <legend><Ruler aria-hidden="true" />Deck width</legend>
        <div className={styles.widthOptions}>
          {WIDTHS.map(value => <button type="button" key={value} aria-pressed={value === width}
            onClick={() => dispatch({ type: 'SET_DECK_WIDTH', value })}>{value} ft</button>)}
        </div>
      </fieldset>
      <div className={styles.takeoff} aria-live="polite" aria-atomic="true">
        <dl>
          <div><dt>Deck area</dt><dd>{takeoff.area}<span>sq ft</span></dd></div>
          <div><dt>Sample board order</dt><dd>{takeoff.boards}<span>16 ft boards</span></dd></div>
        </dl>
        <details className={styles.assumptions}>
          <summary>Sample takeoff assumptions</summary>
          <p>Fixed 12 ft depth. Decking uses 6 in coverage, 10% waste and 16 ft stock. Framing, railings and structural requirements are excluded.</p>
        </details>
      </div>
      <p className={styles.limit}>This preview is separate from your prepared estimate. Changing the drawing does not change the quote.</p>
    </div>
    <div className={styles.footer}><Action secondary onClick={onClose}><ArrowLeft aria-hidden="true" />Return to estimate</Action></div>
  </section>
}
