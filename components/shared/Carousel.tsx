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
    const clamped = Math.max(0, Math.min(index, count - 1))
    setActiveIndex(clamped)
    controls.start({
      x: -clamped * (cardWidth + gap),
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
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <motion.div
        className="flex cursor-grab active:cursor-grabbing"
        style={{ x, gap }}
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
