export const PRODUCTION_ANALYTICS_HOSTNAME = 'try.opsapp.co'

export function isProductionAnalyticsHostname(hostname: string): boolean {
  return (
    hostname.trim().toLowerCase().replace(/\.$/, '') ===
    PRODUCTION_ANALYTICS_HOSTNAME
  )
}

export function shouldCollectProductionAnalytics(): boolean {
  return (
    typeof window !== 'undefined' &&
    isProductionAnalyticsHostname(window.location.hostname)
  )
}

export function isProductionAnalyticsRequestUrl(url: string | URL): boolean {
  try {
    const parsed = typeof url === 'string' ? new URL(url) : url
    return isProductionAnalyticsHostname(parsed.hostname)
  } catch {
    return false
  }
}

export function buildAnalyticsBootstrapScript(
  measurementId: string,
  adsConversionId?: string | null,
): string {
  const adsConfig =
    adsConversionId && adsConversionId !== 'AW-XXXXXXXXX'
      ? `gtag('config', ${JSON.stringify(adsConversionId)});`
      : ''

  return `
    (function() {
      var analyticsHostname = window.location.hostname.toLowerCase().replace(/\\.$/, '');
      if (analyticsHostname !== ${JSON.stringify(PRODUCTION_ANALYTICS_HOSTNAME)}) return;
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      window.gtag = window.gtag || gtag;
      gtag('js', new Date());
      gtag('config', ${JSON.stringify(measurementId)});
      ${adsConfig}
    })();
  `
}
