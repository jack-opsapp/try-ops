import { demoRpc } from './server'
/** Optional schema failure is explicit and never prevents the existing worker. */
export async function reconcileDemo() {
  try {
    const result = await demoRpc('reconcile_tryops_demo', {}, 6000)
    if (!['reconciled', 'busy'].includes(String(result.status))) throw new Error('invalid_response')
    return result
  } catch {
    console.error('[demo] reconciliation_unavailable')
    return { status: 'unavailable' }
  }
}
