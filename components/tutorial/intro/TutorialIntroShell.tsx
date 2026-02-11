'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { Sequence1 } from './Sequence1'
import { Sequence1B } from './Sequence1B'
import { Sequence1C } from './Sequence1C'
import { Sequence2 } from './Sequence2'
import { Sequence3 } from './Sequence3'
import { ProjectFolder } from './ProjectFolder'
import { BreakpointButtons } from './BreakpointButtons'

type Phase =
  | 'seq1'
  | 'seq1b'
  | 'cp1'
  | 'seq1c'
  | 'cp2'
  | 'seq2'
  | 'cp3'
  | 'seq3'
  | 'cp4'

export function TutorialIntroShell() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('seq1')

  // Sequence completions
  const handleSeq1Complete = useCallback(() => setPhase('seq1b'), [])
  const handleSeq1BComplete = useCallback(() => setPhase('cp1'), [])
  const handleSeq1CComplete = useCallback(() => setPhase('cp2'), [])
  const handleSeq2Complete = useCallback(() => setPhase('cp3'), [])
  const handleSeq3Complete = useCallback(() => setPhase('cp4'), [])

  // Checkpoint continues
  const handleCp1Continue = useCallback(() => setPhase('seq1c'), [])
  const handleCp2Continue = useCallback(() => setPhase('seq2'), [])
  const handleCp3Continue = useCallback(() => setPhase('seq3'), [])
  const handleCp4Continue = useCallback(() => router.push('/tutorial-interactive'), [router])

  // Checkpoint backs — each replays the preceding sequence
  const handleCp1Back = useCallback(() => setPhase('seq1'), [])
  const handleCp2Back = useCallback(() => setPhase('seq1c'), [])
  const handleCp3Back = useCallback(() => setPhase('seq2'), [])
  const handleCp4Back = useCallback(() => setPhase('seq3'), [])

  // Skip at final checkpoint
  const handleSkip = useCallback(() => router.push('/signup/credentials'), [router])

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Sequence / checkpoint content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {phase === 'seq1' && (
          <Sequence1 onComplete={handleSeq1Complete} />
        )}

        {phase === 'seq1b' && (
          <Sequence1B onComplete={handleSeq1BComplete} />
        )}

        {/* CP1 static background: plain white folder (1B final state) */}
        {phase === 'cp1' && (
          <ProjectFolder color="#FFFFFF" />
        )}

        {phase === 'seq1c' && (
          <Sequence1C onComplete={handleSeq1CComplete} />
        )}

        {/* CP2 static background: folder with label (1C final state) */}
        {phase === 'cp2' && (
          <ProjectFolder color="#FFFFFF" label="OFFICE REMODEL" />
        )}

        {phase === 'seq2' && (
          <Sequence2
            onComplete={handleSeq2Complete}
            initialState="2-setup"
            folderLabel="OFFICE REMODEL"
          />
        )}

        {/* CP3 static background: folder with label (Seq2 final state — white, centered) */}
        {phase === 'cp3' && (
          <ProjectFolder color="#FFFFFF" label="OFFICE REMODEL" />
        )}

        {phase === 'seq3' && (
          <Sequence3 onComplete={handleSeq3Complete} />
        )}

        {/* CP4: no static background — zoom-through cleared everything */}
      </div>

      {/* Checkpoint / navigation buttons */}
      <AnimatePresence>
        {phase === 'cp1' && (
          <BreakpointButtons
            key="cp1"
            message="GOT IT SO FAR?"
            continueLabel="GOT IT"
            onContinue={handleCp1Continue}
            onBack={handleCp1Back}
          />
        )}

        {phase === 'cp2' && (
          <BreakpointButtons
            key="cp2"
            message="THAT'S A PROJECT."
            continueLabel="NEXT"
            onContinue={handleCp2Continue}
            onBack={handleCp2Back}
          />
        )}

        {phase === 'cp3' && (
          <BreakpointButtons
            key="cp3"
            message="THAT'S THE LIFECYCLE."
            continueLabel="KEEP GOING"
            onContinue={handleCp3Continue}
            onBack={handleCp3Back}
          />
        )}

        {phase === 'cp4' && (
          <BreakpointButtons
            key="cp4"
            message="NOW TRY IT YOURSELF"
            largeMessage
            continueLabel="BEGIN TUTORIAL"
            onContinue={handleCp4Continue}
            onBack={handleCp4Back}
            skipLabel="I'LL FIGURE IT OUT. SKIP TUTORIAL."
            onSkip={handleSkip}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
