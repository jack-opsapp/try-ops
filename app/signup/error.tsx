'use client'

export default function SignupError({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <h1 className="font-mohave text-[28px] font-semibold text-text-primary uppercase tracking-wide">
        SOMETHING WENT WRONG
      </h1>
      <p className="font-mono text-[13px] text-text-tertiary mt-2 mb-6">
        We hit a snag. Let&apos;s try that again.
      </p>
      <button
        onClick={reset}
        className="h-12 px-8 rounded-lg bg-text-primary font-mohave text-[14px] font-semibold text-background uppercase tracking-wide transition-all hover:bg-white"
      >
        TRY AGAIN
      </button>
    </div>
  )
}
