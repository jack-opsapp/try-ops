'use client'

import { useState, useEffect, useRef } from 'react'

interface TypewriterTextProps {
  text: string
  className?: string
  typingSpeed?: number
  startDelay?: number
  onComplete?: () => void
}

export function TypewriterText({
  text,
  className = '',
  typingSpeed = 40,
  startDelay = 0,
  onComplete,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    setDisplayText('')
    setIsComplete(false)

    const startTimeout = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        i++
        setDisplayText(text.slice(0, i))
        if (i >= text.length) {
          clearInterval(interval)
          setIsComplete(true)
          onCompleteRef.current?.()
        }
      }, typingSpeed)

      return () => clearInterval(interval)
    }, startDelay)

    return () => clearTimeout(startTimeout)
  }, [text, typingSpeed, startDelay])

  return (
    <span className={className}>
      {displayText}
      {!isComplete && (
        <span className="animate-cursor-blink text-ops-accent">|</span>
      )}
    </span>
  )
}
