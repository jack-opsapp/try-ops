'use client'

import { useRef, useEffect, useState } from 'react'
import { MobileFrame } from '@/components/layout/MobileFrame'

interface TutorialVideoProps {
  src: string
  durationMs: number
  autoAdvance?: boolean
  onComplete?: () => void
  className?: string
}

export function TutorialVideo({
  src,
  durationMs,
  autoAdvance = false,
  onComplete,
  className = '',
}: TutorialVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [progress, setProgress] = useState(0)
  const [hasVideo, setHasVideo] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress(video.currentTime / video.duration)
      }
    }

    const handleEnded = () => {
      setProgress(1)
      if (autoAdvance && onComplete) {
        setTimeout(onComplete, 500)
      }
    }

    const handleError = () => {
      setHasVideo(false)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)

    video.play().catch(() => {
      // Autoplay failed, that's ok
    })

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
    }
  }, [src, autoAdvance, onComplete])

  return (
    <div className={className}>
      {/* Desktop: show in phone frame */}
      <div className="hidden md:block">
        <MobileFrame>
          {hasVideo ? (
            <video
              ref={videoRef}
              src={src}
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <VideoPlaceholder durationMs={durationMs} />
          )}
        </MobileFrame>
      </div>

      {/* Mobile: show full-width */}
      <div className="md:hidden rounded-ops overflow-hidden border border-white/10">
        {hasVideo ? (
          <video
            ref={videoRef}
            src={src}
            muted
            playsInline
            className="w-full aspect-[9/16] object-cover"
          />
        ) : (
          <VideoPlaceholder durationMs={durationMs} />
        )}
      </div>

      {/* Progress bar under video */}
      <div className="mt-3 h-0.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-ops-accent transition-all duration-200 rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  )
}

function VideoPlaceholder({ durationMs }: { durationMs: number }) {
  return (
    <div className="w-full aspect-[9/16] bg-ops-card flex flex-col items-center justify-center gap-3 p-6">
      <div className="w-16 h-16 rounded-full border-2 border-ops-accent/30 flex items-center justify-center">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="text-ops-accent ml-1"
        >
          <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
        </svg>
      </div>
      <p className="font-kosugi text-ops-small text-ops-text-tertiary text-center">
        Video placeholder ({(durationMs / 1000).toFixed(0)}s)
      </p>
    </div>
  )
}
