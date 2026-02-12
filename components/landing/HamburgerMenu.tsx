'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface HamburgerMenuProps {
  onDownloadClick: () => void
  onTryClick: () => void
}

const sections = [
  { label: 'TOP', id: 'hero' },
  { label: 'THE PROBLEM', id: 'pain' },
  { label: 'FEATURES', id: 'solution' },
  { label: 'ROADMAP', id: 'roadmap' },
  { label: 'PRICING', id: 'pricing' },
  { label: 'FAQ', id: 'faq' },
]

export function HamburgerMenu({ onDownloadClick, onTryClick }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const close = useCallback(() => setIsOpen(false), [])

  // ESC to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, close])

  const scrollTo = (id: string) => {
    close()
    setTimeout(() => {
      if (id === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }
    }, 300)
  }

  return (
    <>
      {/* Floating hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-[1100] w-12 h-12 rounded-full bg-ops-background/80 backdrop-blur-md border border-ops-border flex items-center justify-center"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <div className="w-5 h-4 relative flex flex-col justify-between">
          <motion.span
            className="block w-5 h-[2px] bg-ops-gray-100 origin-center"
            animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            className="block w-5 h-[2px] bg-ops-gray-100 origin-center"
            animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="block w-5 h-[2px] bg-ops-gray-100 origin-center"
            animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[1050]"
              style={{
                background: 'linear-gradient(to left, rgba(0,0,0,0.9), transparent 80%)',
              }}
              onClick={close}
            />

            {/* Panel */}
            <motion.nav
              initial={{ x: 280 }}
              animate={{ x: 0 }}
              exit={{ x: 280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-[1060] w-[280px] bg-ops-background/95 backdrop-blur-md border-l border-ops-border flex flex-col"
            >
              <div className="flex-1 pt-20 px-8">
                {sections.map((section, i) => (
                  <motion.button
                    key={section.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
                    onClick={() => scrollTo(section.id)}
                    className="block w-full text-left font-mohave font-medium text-[16px] uppercase tracking-[0.08em] text-ops-gray-200 hover:text-white py-4 border-b border-ops-border transition-colors"
                  >
                    {section.label}
                  </motion.button>
                ))}
              </div>

              {/* CTAs at bottom */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="px-8 pb-10 space-y-3"
              >
                <button
                  onClick={() => { close(); onDownloadClick() }}
                  className="w-full bg-ops-accent text-white font-mohave font-medium text-[14px] uppercase tracking-[0.03em] rounded-[4px] px-6 py-4 hover:brightness-110 transition-all"
                >
                  DOWNLOAD FREE
                </button>
                <button
                  onClick={() => { close(); onTryClick() }}
                  className="w-full bg-transparent border-2 border-ops-gray-300 text-ops-gray-200 font-mohave font-medium text-[14px] uppercase tracking-[0.03em] rounded-[4px] px-6 py-3 hover:border-white hover:text-white transition-all"
                >
                  TRY IT FIRST
                </button>
              </motion.div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
