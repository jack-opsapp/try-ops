import type { Metadata } from 'next'
import './globals.css'
import { AnalyticsProvider } from '@/components/layout/AnalyticsProvider'

export const metadata: Metadata = {
  title: 'OPS - Job Management Your Crew Will Actually Use',
  description:
    'Field-first job management built for trades crews. No training required. Works offline. Built by a crew lead who needed something that just works.',
  openGraph: {
    title: 'OPS - Job Management Your Crew Will Actually Use',
    description:
      'Field-first job management built for trades crews. No training required. Works offline.',
    url: 'https://try.opsapp.co',
    siteName: 'OPS',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OPS - Job Management Your Crew Will Actually Use',
    description:
      'Field-first job management built for trades crews. No training required. Works offline.',
  },
  other: {
    'theme-color': '#0A0A0A',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'OPS',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'iOS',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    ratingCount: '500',
  },
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
        <link
          rel="preload"
          href="/fonts/BebasNeue-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
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
