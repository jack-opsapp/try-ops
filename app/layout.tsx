import type { Metadata } from 'next'
import './globals.css'
import { AnalyticsProvider } from '@/components/layout/AnalyticsProvider'

export const metadata: Metadata = {
  metadataBase: new URL('https://try.opsapp.co'),
  title: 'OPS — Job Management Your Crew Will Actually Use | Try Free',
  description:
    'The job management app your crew will actually use. Crew scheduling, project tracking, photo documentation, and invoicing for service-based businesses and trades crews. No training required. Free to start.',
  openGraph: {
    title: 'OPS — Job Management Your Crew Will Actually Use',
    description:
      'Crew scheduling, project tracking, photo docs. Built by trades for field crews. No training required. Free to start.',
    url: 'https://try.opsapp.co',
    siteName: 'OPS',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OPS — Job Management Your Crew Will Actually Use',
    description:
      'Crew scheduling, project tracking, photo docs. Built by trades for field crews. Free to start.',
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
  description: 'Field-first job management app for service-based businesses and trades crews and field crews. Project tracking, crew scheduling, photo documentation, invoicing. No training required.',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '0',
    highPrice: '190',
    priceCurrency: 'USD',
    offerCount: '4',
  },
  creator: {
    '@type': 'Organization',
    name: 'OPS',
    url: 'https://opsapp.co',
  },
  featureList: 'Project Management, Crew Scheduling, Photo Documentation, Job Board, Client Management, Invoicing, Offline Mode',
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
