'use client'

import { motion } from 'framer-motion'

interface PhoneMockupProps {
  children?: React.ReactNode
  className?: string
}

export function PhoneMockup({ children, className = '' }: PhoneMockupProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
    >
      {/* Blue glow behind device */}
      <div className="absolute inset-0 rounded-[40px] blur-2xl bg-ops-accent/20 scale-105" />

      {/* iPhone frame */}
      <div className="relative bg-black rounded-[40px] border-2 border-gray-700 p-3 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-black rounded-b-2xl z-10" />

        {/* Screen */}
        <div className="relative bg-ops-background rounded-[32px] overflow-hidden aspect-[9/19.5]">
          {children || (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center p-6">
                <div className="text-ops-accent font-bebas text-3xl tracking-wider mb-2">OPS</div>
                <div className="text-ops-text-secondary font-kosugi text-sm">
                  Job management your crew will actually use
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-gray-600 rounded-full" />
      </div>
    </motion.div>
  )
}
