/**
 * Fire an element_click event to the A/B events API.
 * Call this from CTA handlers before navigating away.
 */
export function trackABClick(sectionName: string, elementId: string) {
  if (typeof window === 'undefined') return

  const variantId = sessionStorage.getItem('ops_ab_variant')
  const sessionId = sessionStorage.getItem('ops_ab_session')
  if (!variantId || !sessionId) return

  const deviceType = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'

  fetch('/api/ab-events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      variant_id: variantId,
      session_id: sessionId,
      event_type: 'element_click',
      section_name: sectionName,
      element_id: elementId,
      device_type: deviceType,
    }),
  }).catch(() => {}) // fire-and-forget
}
