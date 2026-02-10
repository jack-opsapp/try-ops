'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { Sequence1 } from './Sequence1'
import { Sequence1B } from './Sequence1B'
import { Sequence1C } from './Sequence1C'
import { Sequence2 } from './Sequence2'
import { Sequence3 } from './Sequence3'
import { BreakpointButtons } from './BreakpointButtons'

type SequenceState = '1' | '1B' | '1C' | '2-setup' | '2-carousel' | '2-archive' | '3' | 'complete'

export function TutorialIntroShell() {
  const router = useRouter()
  const [sequence, setSequence] = useState<SequenceState>('1')
  const [showBreakpoint1, setShowBreakpoint1] = useState(false)
  const [showBreakpoint2, setShowBreakpoint2] = useState(false)
  const [showSequence2Back, setShowSequence2Back] = useState(false)

  // Memoize all handlers so sequence useEffects (which depend on onComplete)
  // don't re-run when the shell re-renders after state changes.

  // Sequence 1 completion → advance to 1B
  const handleSequence1Complete = useCallback(() => {
    setSequence('1B')
  }, [])

  // Sequence 1B completion → show breakpoint 1
  const handleSequence1BComplete = useCallback(() => {
    setShowBreakpoint1(true)
  }, [])

  // Breakpoint 1: "Got it" → advance to Sequence 1C
  const handleBreakpoint1Continue = useCallback(() => {
    setShowBreakpoint1(false)
    setSequence('1C')
  }, [])

  // Breakpoint 1: "Back" → replay from Sequence 1
  const handleBreakpoint1Back = useCallback(() => {
    setShowBreakpoint1(false)
    setSequence('1')
  }, [])

  // Sequence 1C completion → advance to Sequence 2
  const handleSequence1CComplete = useCallback(() => {
    setSequence('2-setup')
    setShowSequence2Back(true)
  }, [])

  // Sequence 2 completion → advance to Sequence 3
  const handleSequence2Complete = useCallback(() => {
    setShowSequence2Back(false)
    setSequence('3')
  }, [])

  // Sequence 2 back button → return to Sequence 1
  const handleSequence2Back = useCallback(() => {
    setShowSequence2Back(false)
    setSequence('1')
  }, [])

  // Sequence 3 completion → show breakpoint 2
  const handleSequence3Complete = useCallback(() => {
    setShowBreakpoint2(true)
  }, [])

  // Breakpoint 2: "Begin Tutorial" → navigate to interactive tutorial
  const handleBreakpoint2Continue = useCallback(() => {
    router.push('/tutorial-interactive')
  }, [router])

  // Breakpoint 2: "Skip" → navigate to signup (TBD)
  const handleBreakpoint2Skip = useCallback(() => {
    router.push('/signup/credentials')
  }, [router])

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Sequences */}
      <div className="absolute inset-0 flex items-center justify-center">
        {sequence === '1' && (
          <Sequence1 onComplete={handleSequence1Complete} />
        )}

        {sequence === '1B' && (
          <Sequence1B onComplete={handleSequence1BComplete} />
        )}

        {sequence === '1C' && (
          <Sequence1C onComplete={handleSequence1CComplete} />
        )}

        {(sequence === '2-setup' || sequence === '2-carousel' || sequence === '2-archive') && (
          <Sequence2
            onComplete={handleSequence2Complete}
            initialState={sequence}
            folderLabel="OFFICE REMODEL"
          />
        )}

        {sequence === '3' && (
          <Sequence3 onComplete={handleSequence3Complete} />
        )}
      </div>

      {/* Breakpoint Buttons */}
      <AnimatePresence>
        {showBreakpoint1 && (
          <BreakpointButtons
            variant="gotit"
            onContinue={handleBreakpoint1Continue}
            onBack={handleBreakpoint1Back}
            message="GOT IT SO FAR?"
          />
        )}

        {showSequence2Back && (
          <BreakpointButtons
            variant="back-only"
            onContinue={() => {}}
            onBack={handleSequence2Back}
          />
        )}

        {showBreakpoint2 && (
          <BreakpointButtons
            variant="begin"
            onContinue={handleBreakpoint2Continue}
            onBack={handleBreakpoint2Skip}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
