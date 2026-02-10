'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useTutorialState, type TutorialState } from './useTutorialState'

const TutorialContext = createContext<TutorialState | null>(null)

export function TutorialProvider({ children }: { children: ReactNode }) {
  const state = useTutorialState()

  return (
    <TutorialContext.Provider value={state}>
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial(): TutorialState {
  const ctx = useContext(TutorialContext)
  if (!ctx) {
    throw new Error('useTutorial must be used within TutorialProvider')
  }
  return ctx
}
