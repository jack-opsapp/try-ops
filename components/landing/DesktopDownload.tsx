'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
}

export function DesktopDownload() {
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorDetail, setErrorDetail] = useState('')

  const handleSend = async () => {
    if (!phone.trim()) return
    setStatus('sending')
    setErrorDetail('')
    try {
      const res = await fetch('/api/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      if (res.ok) {
        setStatus('sent')
      } else {
        const data = await res.json().catch(() => ({}))
        setErrorDetail(data?.detail || `Status ${res.status}`)
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section
      id="desktop-download"
      className="hidden lg:flex lg:flex-col lg:justify-center lg:min-h-[100svh] snap-start snap-always"
    >
      <motion.div
        className="max-w-[800px] mx-auto px-4 md:px-6 lg:px-10"
        {...fadeInUp}
      >
        <h2 className="font-bebas text-[32px] text-ops-gray-50 uppercase tracking-[0.05em] mb-10">
          GET OPS ON YOUR PHONE
        </h2>

        <div className="flex items-start justify-center gap-12">
          {/* QR Code */}
          <div className="text-center">
            <div className="w-[200px] h-[200px] rounded-ops-card overflow-hidden bg-white p-3">
              <Image
                src="/images/app-store-qr.png"
                alt="Scan to download OPS from the App Store"
                width={200}
                height={200}
                className="w-full h-full object-contain"
              />
            </div>
            <p className="font-kosugi text-[14px] text-ops-text-secondary mt-3">
              Scan with your iPhone
            </p>
          </div>

          {/* OR divider */}
          <div className="flex flex-col items-center justify-center h-[200px]">
            <div className="w-px h-16 bg-ops-border" />
            <span className="font-mohave text-[14px] text-ops-text-tertiary my-3">OR</span>
            <div className="w-px h-16 bg-ops-border" />
          </div>

          {/* SMS form + Direct link */}
          <div className="space-y-8">
            <div>
              <h3 className="font-mohave font-medium text-[16px] uppercase text-white mb-4">
                TEXT ME THE LINK
              </h3>
              <div className="flex gap-3">
                <input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-ops-card border border-ops-border rounded-[4px] px-4 py-3 font-kosugi text-[16px] text-ops-gray-50 w-[240px] focus:border-ops-gray-300 focus:outline-none transition-colors placeholder:text-ops-text-tertiary"
                />
                <button
                  onClick={handleSend}
                  disabled={status === 'sending' || status === 'sent'}
                  className="bg-ops-accent text-white font-mohave font-medium text-[14px] uppercase px-6 py-3 rounded-[4px] hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {status === 'sending' ? 'SENDING...' : status === 'sent' ? 'SENT!' : 'SEND LINK →'}
                </button>
              </div>
              {status === 'sent' && (
                <p className="font-kosugi text-[14px] text-ops-gray-200 mt-2">
                  Check your phone for the download link!
                </p>
              )}
              {status === 'error' && (
                <p className="font-kosugi text-[14px] text-ops-error mt-2">
                  Something went wrong. Try again.{errorDetail && ` (${errorDetail})`}
                </p>
              )}
            </div>

            <div>
              <h3 className="font-mohave font-medium text-[16px] uppercase text-white mb-4">
                DIRECT LINK
              </h3>
              <a
                href="https://apps.apple.com/app/ops-app/id6503204873"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-ops-accent text-white font-mohave font-medium text-[14px] uppercase px-6 py-3 rounded-[4px] hover:brightness-110 transition-all"
              >
                TAKE ME TO THE APP STORE →
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
