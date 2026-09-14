import type { Metadata } from 'next'
import './globals.css'
import { APPROVED_OFFER } from '@/lib/landing/content-registry'
import { AnalyticsProvider } from '@/components/layout/AnalyticsProvider'

export const metadata: Metadata = {
  metadataBase: new URL('https://try.opsapp.co'),
  title: 'OPS — Job Management Your Crew Will Actually Use | Try Free',
  description:
    'Job management for trades crews. Keep the address, schedule, job notes and photos together. Try OPS free for 30 days. No credit card.',
  openGraph: {
    title: 'OPS — Job Management Your Crew Will Actually Use',
    description:
      'Job details, crew scheduling and project photos. Try OPS free for 30 days. No credit card.',
    url: 'https://try.opsapp.co',
    siteName: 'OPS',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OPS — Job Management Your Crew Will Actually Use',
    description:
      'Job details, crew scheduling and project photos. Try OPS free for 30 days. No credit card.',
  },
  alternates: {
    canonical: 'https://try.opsapp.co',
  },
  // Color-scheme-aware SVG favicons. app/apple-icon.png + app/favicon.ico
  // auto-convention files remain as raster fallbacks.
  icons: {
    icon: [
      { url: '/brand/icon-light.svg', media: '(prefers-color-scheme: light)', type: 'image/svg+xml' },
      { url: '/brand/icon-dark.svg', media: '(prefers-color-scheme: dark)', type: 'image/svg+xml' },
    ],
  },
  other: {
    'theme-color': '#000000',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'OPS',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'iOS, Web',
  url: 'https://opsapp.co',
  description: 'Job management for trades crews on web and iPhone. A 30-day trial requires no credit card. Paid plans are billed monthly in Canadian dollars; taxes are additional.',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: String(APPROVED_OFFER.plans[0].monthly),
    highPrice: String(APPROVED_OFFER.plans[2].monthly),
    priceCurrency: APPROVED_OFFER.currency,
    offerCount: String(APPROVED_OFFER.plans.length),
    url: 'https://opsapp.co/plans',
  },
  creator: {
    '@type': 'Organization',
    name: 'OPS',
    url: 'https://opsapp.co',
  },
  featureList: 'Project Management, Crew Scheduling, Photo Documentation, Job Board, Client Management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-ops-background text-ops-text-primary font-mohave">
        <AnalyticsProvider />
        {children}
      </body>
    </html>
  )
}
