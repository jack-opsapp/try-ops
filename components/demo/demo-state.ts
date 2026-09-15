import { DEMO_VERSION, type DemoStep } from '@/lib/demo/contracts'

export const DEMO_STORAGE_KEY = 'ops:sample-job:v1'
export interface DemoState {
  version: typeof DEMO_VERSION
  step: DemoStep
  progress: 'unassigned' | 'assigned' | 'completed'
}
export type DemoCommand = 'assign' | 'complete' | 'back' | 'restart'
type DemoStorage = Pick<Storage, 'getItem' | 'setItem'>

export function initialDemoState(): DemoState {
  return { version: DEMO_VERSION, step: 'assign', progress: 'unassigned' }
}

/** View navigation never undoes sample work. Each command belongs to one screen. */
export function transitionDemo(state: DemoState, command: DemoCommand): DemoState {
  if (command === 'restart') return initialDemoState()
  if (command === 'assign' && state.step === 'assign') {
    return { ...state, step: 'crew', progress: state.progress === 'completed' ? 'completed' : 'assigned' }
  }
  if (command === 'complete' && state.step === 'crew' && state.progress !== 'unassigned') {
    return { ...state, step: 'complete', progress: 'completed' }
  }
  if (command === 'back' && state.step !== 'assign') {
    return { ...state, step: state.step === 'complete' ? 'crew' : 'assign' }
  }
  return state
}

export function restoreDemoState(raw: string | null): DemoState {
  try {
    const value: unknown = JSON.parse(raw ?? 'null')
    if (!value || typeof value !== 'object') return initialDemoState()
    const { version, step, progress } = value as Record<string, unknown>
    if (version !== DEMO_VERSION || !['assign', 'crew', 'complete'].includes(String(step))
      || !['unassigned', 'assigned', 'completed'].includes(String(progress))
      || (step === 'crew' && progress === 'unassigned')
      || (step === 'complete' && progress !== 'completed')) return initialDemoState()
    return { version: DEMO_VERSION, step: step as DemoStep, progress: progress as DemoState['progress'] }
  } catch { return initialDemoState() }
}

/** Access the Storage object inside try: privacy settings may throw on the getter. */
export function readDemoState(getStorage: () => DemoStorage) {
  try {
    const state = restoreDemoState(getStorage().getItem(DEMO_STORAGE_KEY))
    return { state, available: true, resumed: state.progress !== 'unassigned' }
  } catch { return { state: initialDemoState(), available: false, resumed: false } }
}

export function saveDemoState(getStorage: () => DemoStorage, state: DemoState): boolean {
  try {
    getStorage().setItem(DEMO_STORAGE_KEY, JSON.stringify(state))
    return true
  } catch { return false }
}
