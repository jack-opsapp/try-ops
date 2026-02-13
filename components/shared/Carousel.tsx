'use client'

import { useState, useRef, useEffect, Children } from 'react'
import { motion, useMotionValue, useAnimation, PanInfo } from 'framer-motion'

interface CarouselProps {
  children: React.ReactNode
  gap?: number
  className?: string
}

export function Carousel({ children, gap = 16, className = '' }: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [cardWidth, setCardWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const controls = useAnimation()
  const items = Children.toArray(children)
  const count = items.length

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setCardWidth(containerRef.current.offsetWidth - 48)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const snapTo = (index: number) => {
    // Wrap around
    let wrapped = index
    if (wrapped > count - 1) wrapped = 0
    if (wrapped < 0) wrapped = count - 1

    setActiveIndex(wrapped)
    controls.start({
      x: -wrapped * (cardWidth + gap),
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    })
  }

  const handleDragEnd = (_: never, info: PanInfo) => {
    const offset = info.offset.x
    const velocity = info.velocity.x

    if (Math.abs(velocity) > 500) {
      // Fast flick
      snapTo(velocity < 0 ? activeIndex + 1 : activeIndex - 1)
    } else if (Math.abs(offset) > cardWidth * 0.3) {
      // Dragged past threshold
      snapTo(offset < 0 ? activeIndex + 1 : activeIndex - 1)
    } else {
      // Snap back
      snapTo(activeIndex)
    }
  }

  if (!cardWidth) {
    return <div ref={containerRef} className={`overflow-hidden ${className}`} />
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden max-w-[100vw] ${className}`}
      style={{ overscrollBehaviorX: 'contain' }}
    >
      <motion.div
        className="flex cursor-grab active:cursor-grabbing"
        style={{ x, gap, touchAction: 'pan-y' }}
        drag="x"
        dragElastic={0.1}
        dragDirectionLock
        dragConstraints={{
          left: -(count - 1) * (cardWidth + gap),
          right: 0,
        }}
        animate={controls}
        onDragEnd={handleDragEnd}
      >
        {items.map((child, i) => (
          <div
            key={i}
            className="flex-shrink-0"
            style={{ width: cardWidth }}
          >
            {child}
          </div>
        ))}
      </motion.div>

      {/* Arrow buttons — desktop only */}
      {count > 1 && (
        <>
          <button
            onClick={() => snapTo(activeIndex - 1)}
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={() => snapTo(activeIndex + 1)}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {count > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => snapTo(i)}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                i === activeIndex ? 'bg-white' : 'bg-ops-gray-400'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
