import type { Metadata } from 'next'
import './globals.css'
import { AnalyticsProvider } from '@/components/layout/AnalyticsProvider'

export const metadata: Metadata = {
  title: 'OPS - Job Management Your Crew Will Actually Use',
  description: 'Built by trades, for trades. OPS is the operational project system that makes managing crews and projects simple. Try it free for 30 days.',
  openGraph: {
    title: 'OPS - Built By Trades. For Trades.',
    description: 'Job management your crew will actually use. Try OPS free for 30 days.',
    url: 'https://try.opsapp.co',
    siteName: 'OPS',
    type: 'website',
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
      </head>
      <body className="min-h-screen bg-ops-background text-ops-text-primary font-mohave">
        <AnalyticsProvider />
        {children}
      </body>
    </html>
  )
}
