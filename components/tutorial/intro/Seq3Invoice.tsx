'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProjectFolder } from './ProjectFolder'
import { OPSStyle } from '@/lib/styles/OPSStyle'
import { TypewriterText } from '@/components/ui/TypewriterText'

interface Seq3InvoiceProps {
  onComplete: () => void
  skipToEnd?: boolean
}

const STATUS_ORDER = ['rfq', 'estimated', 'accepted', 'inProgress', 'completed', 'closed'] as const
const STATUS_LABELS = OPSStyle.StatusLabels
const STATUS_COLORS = OPSStyle.Colors.status

const ITEM_WIDTH = 250

function InvoiceIcon({ color = '#FFFFFF' }: { color?: string }) {
  return (
    <svg width="48" height="56" viewBox="0 0 48 56" fill="none">
      <path d="M4 4 H34 L44 14 V52 H4 Z" stroke={color} strokeWidth="2" fill="none" />
      <path d="M34 4 V14 H44" stroke={color} strokeWidth="2" fill="none" />
      <line x1="12" y1="24" x2="36" y2="24" stroke={color} strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="32" x2="36" y2="32" stroke={color} strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="40" x2="28" y2="40" stroke={color} strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

function CheckmarkOverlay({ color }: { color: string }) {
  return (
    <motion.svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="absolute"
      style={{ top: '50%', left: '50%', marginTop: -12, marginLeft: -12 }}
      initial={{ opacity: 0, scale: 0.3, rotate: -20 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
      <path d="M8 12 L11 15 L16 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  )
}

export function Seq3Invoice({ onComplete, skipToEnd }: Seq3InvoiceProps) {
  // Start on Completed (where Seq3Tasks left off after task completion)
  const [currentStatusIndex, setCurrentStatusIndex] = useState(4)
  const [carouselVisible, setCarouselVisible] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const [invoiceChecked, setInvoiceChecked] = useState(false)
  const [invoiceCollapsing, setInvoiceCollapsing] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const timersRef = useRef<NodeJS.Timeout[]>([])

  const currentStatus = STATUS_ORDER[currentStatusIndex]
  const folderColor = STATUS_COLORS[currentStatus] ?? '#FFFFFF'

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    timersRef.current = timers
    let t = 0

    // Invoice appears with message
    t += 400
    timers.push(setTimeout(() => {
      setShowInvoice(true)
      setShowMessage(true)
    }, t))

    // Checkmark stamps
    t += 800
    timers.push(setTimeout(() => setInvoiceChecked(true), t))

    // Hold
    t += 1200

    // Invoice collapses
    timers.push(setTimeout(() => setInvoiceCollapsing(true), t))

    t += 600
    timers.push(setTimeout(() => setShowInvoice(false), t))

    // Carousel appears at Completed, rotates to Closed
    t += 400
    timers.push(setTimeout(() => {
      setCurrentStatusIndex(4)
      setCarouselVisible(true)
    }, t))

    t += 600
    timers.push(setTimeout(() => setCurrentStatusIndex(5), t))

    // Hold on Closed
    t += 1200

    // Fade carousel
    timers.push(setTimeout(() => setCarouselVisible(false), t))

    // Complete
    t += 600
    timers.push(setTimeout(() => onComplete(), t))

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  // Skip to final frame — keep text visible
  useEffect(() => {
    if (!skipToEnd) return
    timersRef.current.forEach(clearTimeout)
    setShowMessage(true)
    setShowInvoice(false)
    setInvoiceCollapsing(true)
    setCarouselVisible(false)
    setCurrentStatusIndex(5) // Closed
  }, [skipToEnd])

  const carouselX = -(currentStatusIndex * ITEM_WIDTH + ITEM_WIDTH / 2)

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Text */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            className="absolute top-16 left-0 right-0 text-center px-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-mohave font-medium text-[20px] md:text-[24px] uppercase tracking-wider text-white">
              <TypewriterText text="GET PAID. CLOSE IT OUT." typingSpeed={30} />
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animation container */}
      <div className="relative flex flex-col items-center">
        {/* Status carousel */}
        <AnimatePresence>
          {carouselVisible && (
            <motion.div
              className="absolute"
              style={{
                bottom: 'calc(100% + 24px)',
                left: '50%',
                width: 0,
                height: 60,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="flex items-center"
                style={{ position: 'absolute', top: 0, height: 60 }}
                initial={false}
                animate={{ x: carouselX }}
                transition={{
                  duration: 0.6,
                  type: 'spring',
                  stiffness: 180,
                  damping: 16,
                }}
              >
                {STATUS_ORDER.map((status, index) => {
                  const isActive = index === currentStatusIndex
                  const isPrev = index === currentStatusIndex - 1
                  const isNext = index === currentStatusIndex + 1
                  const isVisible = isActive || isPrev || isNext

                  return (
                    <div
                      key={status}
                      className="flex-shrink-0 font-mohave font-medium uppercase tracking-wider text-center"
                      style={{
                        width: ITEM_WIDTH,
                        fontSize: isActive ? '24px' : '16px',
                        color: isActive ? STATUS_COLORS[status] : '#FFFFFF',
                        opacity: isActive ? 1 : isVisible ? 0.4 : 0,
                        transition: 'color 0.1s, fontSize 0.4s, opacity 0.5s',
                      }}
                    >
                      {STATUS_LABELS[status]}
                    </div>
                  )
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Invoice icon — above folder */}
        <AnimatePresence>
          {showInvoice && !invoiceCollapsing && (
            <motion.div
              className="absolute"
              style={{ bottom: 'calc(100% + 24px)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40, scale: 0.3 }}
              transition={{ type: 'spring', stiffness: 150, damping: 18 }}
            >
              <div className="relative">
                <InvoiceIcon color={folderColor} />
                {invoiceChecked && <CheckmarkOverlay color={folderColor} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project folder */}
        <ProjectFolder color={folderColor} label="OFFICE REMODEL" />
      </div>
    </div>
  )
}
