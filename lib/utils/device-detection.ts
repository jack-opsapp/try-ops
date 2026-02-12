export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

export function getDeviceType(): 'mobile' | 'desktop' {
  return isMobile() ? 'mobile' : 'desktop'
}
