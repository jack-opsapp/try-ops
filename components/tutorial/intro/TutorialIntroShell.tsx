'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Sequence1 } from './Sequence1'
import { Sequence1B } from './Sequence1B'
import { Sequence2 } from './Sequence2'
import { BreakpointButtons } from './BreakpointButtons'

type SequenceState = '1' | '1B' | '2-setup' | '2-carousel' | '2-archive' | 'complete'

export function TutorialIntroShell() {
  const router = useRouter()
  const [sequence, setSequence] = useState<SequenceState>('1')
  const [showBreakpoint1, setShowBreakpoint1] = useState(false)
  const [showBreakpoint2, setShowBreakpoint2] = useState(false)
  const [showSequence2Back, setShowSequence2Back] = useState(false)

  // Sequence 1 completion → advance to 1B
  const handleSequence1Complete = () => {
    setSequence('1B')
  }

  // Sequence 1B completion → show breakpoint 1
  const handleSequence1BComplete = () => {
    setShowBreakpoint1(true)
  }

  // Breakpoint 1: "Got it" → advance to Sequence 2
  const handleBreakpoint1Continue = () => {
    setShowBreakpoint1(false)
    setSequence('2-setup')
    setShowSequence2Back(true)
  }

  // Breakpoint 1: "Back" → replay from Sequence 1
  const handleBreakpoint1Back = () => {
    setShowBreakpoint1(false)
    setSequence('1')
  }

  // Sequence 2 completion → show breakpoint 2
  const handleSequence2Complete = () => {
    setShowSequence2Back(false)
    setShowBreakpoint2(true)
  }

  // Sequence 2 back button → return to Sequence 1
  const handleSequence2Back = () => {
    setShowSequence2Back(false)
    setSequence('1')
  }

  // Breakpoint 2: "Begin Tutorial" → navigate to interactive tutorial
  const handleBreakpoint2Continue = () => {
    router.push('/tutorial-interactive')
  }

  // Breakpoint 2: "Skip" → navigate to signup (TBD)
  const handleBreakpoint2Skip = () => {
    router.push('/signup/credentials')
  }

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

        {(sequence === '2-setup' || sequence === '2-carousel' || sequence === '2-archive') && (
          <Sequence2
            onComplete={handleSequence2Complete}
            initialState={sequence}
          />
        )}
      </div>

      {/* Breakpoint Buttons */}
      <AnimatePresence>
        {showBreakpoint1 && (
          <BreakpointButtons
            variant="gotit"
            onContinue={handleBreakpoint1Continue}
            onBack={handleBreakpoint1Back}
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
