import { SamplePhoto } from './DemoPrimitives'
import { SAMPLE } from './lifecycle-data'
import styles from './project-scenes.module.css'

const MARKS = [
  'M 865 718 C 956 708 1179 749 1280 778 C 1349 826 1241 850 1119 814 C 1001 790 836 759 865 718 Z',
  'M 1040 934 Q 1110 897 1120 819 M 1090 842 L 1120 819 L 1135 854',
]

/** Prepared annotation layer over the original site photo, like the native
 * photo viewer. The source photo stays unchanged and keeps its aspect ratio. */
export function MarkedSitePhoto() {
  return <span className={styles.markedPhoto}>
    <SamplePhoto src={SAMPLE.beforePhoto} alt="Site photo with the front fascia beside the steps circled for replacement" />
    <svg viewBox="0 0 1536 1024" aria-hidden="true" focusable="false" style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}>
      {MARKS.map(d => <g key={d}><path className={styles.markupUnderlay} d={d} /><path className={styles.markupInk} d={d} /></g>)}
    </svg>
  </span>
}
