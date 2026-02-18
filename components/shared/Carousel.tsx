'use client'

import { useState, useRef, useEffect, Children } from 'react'
import { motion, useMotionValue, useAnimation, PanInfo } from 'framer-motion'

interface CarouselProps {
  children: React.ReactNode
  gap?: number
  className?: string
  startIndex?: number
}

export function Carousel({ children, gap = 16, className = '', startIndex = 0 }: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(startIndex)
  const [cardWidth, setCardWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const controls = useAnimation()
  const items = Children.toArray(children)
  const count = items.length
  const initialSnapped = useRef(false)

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

  // Snap to startIndex once cardWidth is measured
  useEffect(() => {
    if (cardWidth > 0 && startIndex > 0 && !initialSnapped.current) {
      initialSnapped.current = true
      const offset = -startIndex * (cardWidth + gap)
      x.set(offset)
      controls.set({ x: offset })
    }
  }, [cardWidth, startIndex, gap, x, controls])

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
      snapTo(velocity < 0 ? activeIndex + 1 : activeIndex - 1)
    } else if (Math.abs(offset) > cardWidth * 0.3) {
      snapTo(offset < 0 ? activeIndex + 1 : activeIndex - 1)
    } else {
      snapTo(activeIndex)
    }
  }

  if (!cardWidth) {
    return <div ref={containerRef} className={`overflow-hidden ${className}`} />
  }

  return (
    <div className={className}>
      {/* Outer wrapper for arrows positioned outside */}
      <div className="relative md:px-14">
        {/* Arrow buttons — desktop only, positioned outside carousel */}
        {count > 1 && (
          <>
            <button
              onClick={() => snapTo(activeIndex - 1)}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-ops-border hover:bg-ops-border-emphasis transition-colors duration-200"
              aria-label="Previous slide"
            >
              <svg className="w-5 h-5 text-ops-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={() => snapTo(activeIndex + 1)}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-ops-border hover:bg-ops-border-emphasis transition-colors duration-200"
              aria-label="Next slide"
            >
              <svg className="w-5 h-5 text-ops-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </button>
          </>
        )}

        {/* Carousel track */}
        <div
          ref={containerRef}
          className="overflow-hidden max-w-[100vw]"
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
        </div>
      </div>

      {/* Dot indicators — outside overflow container for proper centering */}
      {count > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => snapTo(i)}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                i === activeIndex ? 'bg-ops-text-primary' : 'bg-ops-text-disabled'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
