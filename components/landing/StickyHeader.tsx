'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/shared/Button'

interface StickyHeaderProps {
  onDownloadClick: () => void
  onTryClick: () => void
}

export function StickyHeader({ onDownloadClick, onTryClick }: StickyHeaderProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
          className="fixed top-0 left-0 right-0 z-[1000] h-16 bg-ops-background/95 backdrop-blur-[10px] border-b border-ops-border"
        >
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 h-full flex items-center justify-between">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex-shrink-0"
            >
              <Image
                src="/images/ops-logo-white.png"
                alt="OPS"
                width={48}
                height={20}
                className="object-contain"
              />
            </button>

            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                onClick={onDownloadClick}
                className="!py-2 !px-4 !text-[14px]"
              >
                DOWNLOAD FREE
              </Button>
              <div className="hidden md:block">
                <Button
                  variant="outline"
                  onClick={onTryClick}
                  className="!py-2 !px-4 !text-[14px]"
                >
                  TRY IT FIRST
                </Button>
              </div>
            </div>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  )
}
