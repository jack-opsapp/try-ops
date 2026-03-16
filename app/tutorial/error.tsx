'use client'

import { useRouter } from 'next/navigation'

export default function TutorialError({ reset }: { reset: () => void }) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <h1 className="font-mohave text-[28px] font-semibold text-text-primary uppercase tracking-wide">
        SOMETHING WENT WRONG
      </h1>
      <p className="font-kosugi text-[13px] text-text-tertiary mt-2 mb-6">
        The tutorial hit a snag.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="h-12 px-6 rounded-lg border border-border bg-background-elevated font-mohave text-[14px] font-medium text-text-secondary uppercase tracking-wide transition-colors hover:text-text-primary"
        >
          RETRY
        </button>
        <button
          onClick={() => router.push('/')}
          className="h-12 px-6 rounded-lg bg-text-primary font-mohave text-[14px] font-semibold text-background uppercase tracking-wide transition-all hover:bg-white"
        >
          START OVER
        </button>
      </div>
    </div>
  )
}
