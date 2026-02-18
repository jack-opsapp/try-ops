'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sequence1 } from './Sequence1'
import { Sequence1B } from './Sequence1B'
import { Sequence1C } from './Sequence1C'
import { Sequence2 } from './Sequence2'
import { Sequence3 } from './Sequence3'

const PHASES = ['seq1', 'seq1b', 'seq1c', 'seq2', 'seq3'] as const
type Phase = (typeof PHASES)[number]

// Estimated durations per phase (ms) — for progress bar fill animation
const PHASE_DURATIONS: Record<Phase, number> = {
  seq1: 5300,
  seq1b: 9500,
  seq1c: 8800,
  seq2: 15600,
  seq3: 16000,
}

// ── Story Progress Bar ───────────────────────────────────────────
function StoryProgressBar({
  currentIndex,
  phaseStartTime,
  durations,
  paused = false,
}: {
  currentIndex: number
  phaseStartTime: number
  durations: number[]
  paused?: boolean
}) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setNow(Date.now()), 60)
    return () => clearInterval(id)
  }, [paused])

  return (
    <div
      className="absolute top-0 left-0 right-0 z-[60] flex gap-1 px-3"
      style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
    >
      {durations.map((dur, i) => {
        let fill = 0
        if (i < currentIndex) fill = 100
        else if (i === currentIndex) {
          fill = paused ? 100 : Math.min(100, ((now - phaseStartTime) / dur) * 100)
        }
        return (
          <div key={i} className="flex-1 h-[2px] rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
              style={{
                width: `${fill}%`,
                transition: i === currentIndex ? 'width 0.1s linear' : 'none',
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

// ── Main Shell ───────────────────────────────────────────────────
export function TutorialIntroShell() {
  const router = useRouter()
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [seqKey, setSeqKey] = useState(0) // increment to force-remount sequence
  const [phaseStartTime, setPhaseStartTime] = useState(Date.now())
  // 'playing' = sequence animating, 'complete' = sequence finished (last frame visible),
  // 'checkpoint' = navigated here via BACK (no sequence rendered)
  const [sequenceState, setSequenceState] = useState<'playing' | 'complete' | 'checkpoint'>('playing')

  // Step duration tracking
  const [stepDurations, setStepDurations] = useState<string[]>([])
  const phaseStartRef = useRef(Date.now())
  const totalStartRef = useRef(Date.now())

  const phase = PHASES[phaseIndex]

  const postTutorialLog = useCallback((durations: string[]) => {
    const totalTime = Date.now() - totalStartRef.current
    fetch('/api/tutorial-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepDuration: durations, totalTime }),
    }).catch(() => {}) // fire-and-forget
  }, [])

  const finishTutorial = useCallback(
    (durations: string[]) => {
      postTutorialLog(durations)
      router.push('/tutorial-interactive')
    },
    [postTutorialLog, router]
  )

  // Sequence finished — pause here, show buttons (no auto-advance)
  const handleSequenceComplete = useCallback(() => {
    setSequenceState('complete')
  }, [])

  // Tap right — skip to next phase (always plays)
  const handleTapRight = useCallback(() => {
    const currentPhase = PHASES[phaseIndex]
    const ms = Date.now() - phaseStartRef.current

    if (phaseIndex >= PHASES.length - 1) {
      finishTutorial([...stepDurations, `${currentPhase}:${ms}`])
      return
    }

    setStepDurations(prev => [...prev, `${currentPhase}:${ms}`])
    phaseStartRef.current = Date.now()
    setPhaseIndex(prev => prev + 1)
    setSeqKey(prev => prev + 1)
    setPhaseStartTime(Date.now())
    setSequenceState('playing')
  }, [phaseIndex, stepDurations, finishTutorial])

  // Tap left — go to previous phase and replay it
  const handleTapLeft = useCallback(() => {
    if (phaseIndex <= 0) return
    phaseStartRef.current = Date.now()
    setStepDurations(prev => prev.slice(0, -1))
    setPhaseIndex(prev => prev - 1)
    setSeqKey(prev => prev + 1)
    setPhaseStartTime(Date.now())
    setSequenceState('playing')
  }, [phaseIndex])

  const durations = PHASES.map(p => PHASE_DURATIONS[p])
  const showButtons = sequenceState === 'complete' || sequenceState === 'checkpoint'
  const showSequence = sequenceState === 'playing' || sequenceState === 'complete'

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Progress bar */}
      <StoryProgressBar
        currentIndex={phaseIndex}
        phaseStartTime={phaseStartTime}
        durations={durations}
        paused={showButtons}
      />

      {/* Tap zones */}
      <div
        className="absolute top-0 left-0 w-1/2 h-full z-50 cursor-pointer"
        onClick={handleTapLeft}
      />
      <div
        className="absolute top-0 right-0 w-1/2 h-full z-50 cursor-pointer"
        onClick={handleTapRight}
      />

      {/* Sequence content — visible while playing and when just completed (shows last frame) */}
      {showSequence && (
        <div className="absolute inset-0 flex items-center justify-center">
          {phase === 'seq1' && (
            <Sequence1 key={seqKey} onComplete={handleSequenceComplete} />
          )}

          {phase === 'seq1b' && (
            <Sequence1B key={seqKey} onComplete={handleSequenceComplete} />
          )}

          {phase === 'seq1c' && (
            <Sequence1C key={seqKey} onComplete={handleSequenceComplete} />
          )}

          {phase === 'seq2' && (
            <Sequence2
              key={seqKey}
              onComplete={handleSequenceComplete}
              initialState="2-setup"
              folderLabel="OFFICE REMODEL"
            />
          )}

          {phase === 'seq3' && (
            <Sequence3 key={seqKey} onComplete={handleSequenceComplete} />
          )}
        </div>
      )}

      {/* Action bar — appears when sequence finishes */}
      {showButtons && (
        <div
          className="absolute left-0 right-0 z-[60] flex items-center gap-3 px-6"
          style={{
            bottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))',
            animation: 'fadeInUp 0.3s ease-out',
          }}
        >
          {phaseIndex > 0 && (
            <button
              onClick={handleTapLeft}
              className="h-12 px-5 rounded-ops border border-ops-border bg-ops-surface font-mohave font-medium text-ops-label uppercase text-ops-text-secondary tracking-wide transition-colors hover:text-ops-text-primary"
            >
              BACK
            </button>
          )}
          <button
            onClick={handleTapRight}
            className="flex-1 h-12 rounded-ops bg-ops-accent font-mohave font-medium text-ops-label uppercase text-ops-text-primary tracking-wide transition-all hover:brightness-110 active:scale-[0.98]"
          >
            {phaseIndex >= PHASES.length - 1 ? 'START TUTORIAL' : 'CONTINUE'}
          </button>
        </div>
      )}

    </div>
  )
}
