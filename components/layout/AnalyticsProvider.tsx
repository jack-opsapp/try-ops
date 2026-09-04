'use client'

import Script from 'next/script'
import { buildAnalyticsBootstrapScript } from '@/lib/analytics/production-boundary'

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID

export function AnalyticsProvider() {
  if (!GA_ID || GA_ID === 'G-XXXXXXXXXX') return null

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: buildAnalyticsBootstrapScript(GA_ID, ADS_ID),
        }}
      />
    </>
  )
}
