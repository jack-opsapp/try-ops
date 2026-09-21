import { SAMPLE } from './lifecycle-data'

export const LIFECYCLE_REVISION = 'job-lifecycle-v2' as const
export const LIFECYCLE_STORAGE_KEY = 'ops:demo:lifecycle:v2'
export const SCENES = ['inquiry', 'booked', 'visit', 'review', 'estimate', 'project', 'crew', 'compose', 'activity', 'billing'] as const
export type Scene = typeof SCENES[number]
export type CrewMember = 'Pete' | 'Nick'
export interface LifecycleState {
  revision: typeof LIFECYCLE_REVISION
  scene: Scene
  furthest: number
  visitPhoto: boolean
  visitCompleted: boolean
  estimateApproved: boolean
  crewAssigned: boolean
  assignedCrew: CrewMember[]
  taskCompleted: boolean
  completionPhoto: boolean
  noteDraft: string
  postedNote: string
  paymentRecorded: boolean
}
export type LifecycleAction =
  | { type: 'OPEN_BOOKING' | 'START_VISIT' | 'ADD_SITE_PHOTO' | 'REVIEW_VISIT' | 'COMPLETE_VISIT' | 'APPROVE_ESTIMATE' | 'VIEW_CREW' | 'COMPLETE_TASK' | 'OPEN_COMPOSER' | 'ADD_COMPLETION_PHOTO' | 'POST_NOTE' | 'OPEN_BILLING' | 'RECORD_PAYMENT' | 'BACK' | 'RESTART' }
  | { type: 'ASSIGN_CREW'; members?: CrewMember[] }
  | { type: 'SET_NOTE'; value: string }
  | { type: 'NAVIGATE'; scene: Scene }
export interface SceneProps { state: LifecycleState; dispatch: (action: LifecycleAction) => void }

export function initialLifecycleState(): LifecycleState {
  return { revision: LIFECYCLE_REVISION, scene: 'inquiry', furthest: 0, visitPhoto: false, visitCompleted: false, estimateApproved: false, crewAssigned: false, assignedCrew: [], taskCompleted: false, completionPhoto: false, noteDraft: SAMPLE.note, postedNote: '', paymentRecorded: false }
}
function move(state: LifecycleState, scene: Scene): LifecycleState {
  return { ...state, scene, furthest: Math.max(state.furthest, SCENES.indexOf(scene)) }
}
export function lifecycleReducer(state: LifecycleState, action: LifecycleAction): LifecycleState {
  if (action.type === 'RESTART') return initialLifecycleState()
  if (action.type === 'BACK') return SCENES.indexOf(state.scene) > 0 ? { ...state, scene: SCENES[SCENES.indexOf(state.scene) - 1] } : state
  if (action.type === 'NAVIGATE') return SCENES.includes(action.scene) && SCENES.indexOf(action.scene) <= state.furthest ? { ...state, scene: action.scene } : state
  switch (action.type) {
    case 'OPEN_BOOKING': return state.scene === 'inquiry' ? move(state, 'booked') : state
    case 'START_VISIT': return state.scene === 'booked' ? move(state, 'visit') : state
    case 'ADD_SITE_PHOTO': return state.scene === 'visit' && !state.visitPhoto ? { ...state, visitPhoto: true } : state
    case 'REVIEW_VISIT': return state.scene === 'visit' && state.visitPhoto ? move(state, 'review') : state
    case 'COMPLETE_VISIT': return state.scene === 'review' && state.visitPhoto ? move({ ...state, visitCompleted: true }, 'estimate') : state
    case 'APPROVE_ESTIMATE': return state.scene === 'estimate' && state.visitCompleted ? move({ ...state, estimateApproved: true }, 'project') : state
    case 'ASSIGN_CREW': {
      const members: CrewMember[] = action.members ?? ['Pete', 'Nick']
      if (state.scene !== 'project' || state.crewAssigned || members.length === 0 || members.length > 2 || members.some(member => member !== 'Pete' && member !== 'Nick') || new Set(members).size !== members.length) return state
      return { ...state, crewAssigned: true, assignedCrew: [...members] }
    }
    case 'VIEW_CREW': return state.scene === 'project' && state.crewAssigned ? move(state, 'crew') : state
    case 'COMPLETE_TASK': return state.scene === 'crew' && state.crewAssigned && !state.taskCompleted ? { ...state, taskCompleted: true } : state
    case 'OPEN_COMPOSER': return state.scene === 'crew' && state.taskCompleted ? move(state, 'compose') : state
    case 'ADD_COMPLETION_PHOTO': return state.scene === 'compose' && !state.completionPhoto ? { ...state, completionPhoto: true } : state
    case 'SET_NOTE': return state.scene === 'compose' ? { ...state, noteDraft: action.value.slice(0, 280) } : state
    case 'POST_NOTE': return state.scene === 'compose' && state.taskCompleted && state.completionPhoto && state.noteDraft.trim() ? move({ ...state, postedNote: state.noteDraft.trim() }, 'activity') : state
    case 'OPEN_BILLING': return state.scene === 'activity' && !!state.postedNote ? move(state, 'billing') : state
    case 'RECORD_PAYMENT': return state.scene === 'billing' && !state.paymentRecorded ? { ...state, paymentRecorded: true } : state
    default: return state
  }
}
export function restoreLifecycleState(raw: string | null): LifecycleState {
  try {
    const value: unknown = JSON.parse(raw ?? 'null')
    if (!value || typeof value !== 'object') return initialLifecycleState()
    const v = value as Record<string, unknown>
    if (v.revision !== LIFECYCLE_REVISION || !SCENES.includes(v.scene as Scene) || !Number.isInteger(v.furthest) || (v.furthest as number) < SCENES.indexOf(v.scene as Scene) || (v.furthest as number) >= SCENES.length) return initialLifecycleState()
    const booleanKeys = ['visitPhoto', 'visitCompleted', 'estimateApproved', 'crewAssigned', 'taskCompleted', 'completionPhoto', 'paymentRecorded'] as const
    if (!Array.isArray(v.assignedCrew) || v.assignedCrew.length > 2 || v.assignedCrew.some(member => member !== 'Pete' && member !== 'Nick') || new Set(v.assignedCrew).size !== v.assignedCrew.length || Boolean(v.crewAssigned) !== (v.assignedCrew.length > 0)) return initialLifecycleState()
    if (booleanKeys.some(key => typeof v[key] !== 'boolean') || typeof v.noteDraft !== 'string' || v.noteDraft.length > 280 || typeof v.postedNote !== 'string' || v.postedNote.length > 280) return initialLifecycleState()
    const furthest = v.furthest as number
    if ((v.visitCompleted && !v.visitPhoto) || (v.estimateApproved && !v.visitCompleted) || (v.crewAssigned && !v.estimateApproved) || (v.taskCompleted && !v.crewAssigned) || (v.completionPhoto && !v.taskCompleted) || (v.postedNote && (!v.completionPhoto || !v.taskCompleted || !v.postedNote.trim())) || (v.paymentRecorded && !v.postedNote)) return initialLifecycleState()
    if ((furthest >= 3 && !v.visitPhoto) || (furthest >= 4 && !v.visitCompleted) || (furthest >= 5 && !v.estimateApproved) || (furthest >= 6 && !v.crewAssigned) || (furthest >= 7 && !v.taskCompleted) || (furthest >= 8 && !v.postedNote)) return initialLifecycleState()
    if ((v.visitPhoto && furthest < 2) || (v.visitCompleted && furthest < 4) || (v.estimateApproved && furthest < 5) || (v.crewAssigned && furthest < 5) || (v.taskCompleted && furthest < 6) || (v.completionPhoto && furthest < 7) || (v.postedNote && furthest < 8) || (v.paymentRecorded && furthest < 9)) return initialLifecycleState()
    return { revision: LIFECYCLE_REVISION, scene: v.scene as Scene, furthest, visitPhoto: v.visitPhoto as boolean, visitCompleted: v.visitCompleted as boolean, estimateApproved: v.estimateApproved as boolean, crewAssigned: v.crewAssigned as boolean, assignedCrew: v.assignedCrew as CrewMember[], taskCompleted: v.taskCompleted as boolean, completionPhoto: v.completionPhoto as boolean, noteDraft: v.noteDraft, postedNote: v.postedNote, paymentRecorded: v.paymentRecorded as boolean }
  } catch { return initialLifecycleState() }
}
