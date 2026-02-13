'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface StickyCTAProps {
  onDownloadClick: () => void
}

export function StickyCTA({ onDownloadClick }: StickyCTAProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('hero')
    const footer = document.getElementById('footer')
    if (!hero) return

    let heroPast = false
    let nearFooter = false

    const update = () => setVisible(heroPast && !nearFooter)

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        heroPast = !entry.isIntersecting
        update()
      },
      { threshold: 0 }
    )
    heroObserver.observe(hero)

    let footerObserver: IntersectionObserver | undefined
    if (footer) {
      footerObserver = new IntersectionObserver(
        ([entry]) => {
          nearFooter = entry.isIntersecting
          update()
        },
        { threshold: 0 }
      )
      footerObserver.observe(footer)
    }

    return () => {
      heroObserver.disconnect()
      footerObserver?.disconnect()
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
          className="fixed z-[999] ultra-thin-material border border-white/10 flex items-center justify-center gap-2.5 left-4 right-4 rounded-ops-card px-6 py-3 md:left-auto md:right-auto md:left-1/2 md:-translate-x-1/2 md:rounded-full md:px-8 md:py-3.5"
          style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
          onClick={onDownloadClick}
        >
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          <span className="font-mohave font-medium text-[14px] uppercase tracking-[0.03em] text-white whitespace-nowrap">
            DOWNLOAD iPHONE APP FREE
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
