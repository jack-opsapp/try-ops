'use client'

import { User } from 'lucide-react'

interface TutorialCrewAvatarProps {
  name: string
  tint: string
  size?: number
}

/**
 * Crew member avatar — Lucide User icon with tinted background circle.
 * No real images. SF Symbol equivalent for web.
 */
export function TutorialCrewAvatar({ name, tint, size = 32 }: TutorialCrewAvatarProps) {
  return (
    <div
      className="relative rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: `${tint}33`,
        border: `1px solid ${tint}66`,
      }}
      aria-label={name}
      role="img"
    >
      <User size={size * 0.55} color={tint} strokeWidth={1.5} />
    </div>
  )
}
