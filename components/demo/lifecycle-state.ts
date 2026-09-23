import { SAMPLE } from './lifecycle-data'

export const LIFECYCLE_REVISION = 'job-lifecycle-v4' as const
export const LIFECYCLE_STORAGE_KEY = 'ops:demo:lifecycle:v4'
export const SCENES = ['role', 'inquiry', 'booked', 'visit', 'review', 'estimate', 'accepted', 'project', 'crew', 'compose', 'activity', 'billing'] as const
export type Scene = typeof SCENES[number]
export type DemoRole = 'operator' | 'crew'
export type CrewMember = 'Pete' | 'Nick'
export type VisitAssignee = 'You' | 'Mike' | 'Nick'
export interface LifecycleState {
  revision: typeof LIFECYCLE_REVISION
  role: DemoRole | null
  scene: Scene
  visited: Scene[]
  furthest: number
  visitAssignee: VisitAssignee | null
  scopeConfirmed: boolean
  visitPhoto: boolean
  visitCompleted: boolean
  estimateSent: boolean
  estimateApproved: boolean
  crewAssigned: boolean
  assignedCrew: CrewMember[]
  taskCompleted: boolean
  completionPhoto: boolean
  noteDraft: string
  postedNote: string
  invoiceCreated: boolean
  paymentRecorded: boolean
  deckWidth: 12 | 16 | 20
}
export type LifecycleAction =
  | { type: 'OPEN_BOOKING' | 'START_VISIT' | 'CONFIRM_SCOPE' | 'ADD_SITE_PHOTO' | 'REVIEW_VISIT' | 'COMPLETE_VISIT' | 'SEND_ESTIMATE' | 'APPROVE_ESTIMATE' | 'ADVANCE_WORKDAY' | 'VIEW_CREW' | 'COMPLETE_TASK' | 'OPEN_COMPOSER' | 'ADD_COMPLETION_PHOTO' | 'POST_NOTE' | 'OPEN_BILLING' | 'CREATE_INVOICE' | 'RECORD_PAYMENT' | 'BACK' | 'RESTART' }
  | { type: 'SELECT_ROLE'; role: DemoRole }
  | { type: 'ASSIGN_VISIT'; member: VisitAssignee }
  | { type: 'ASSIGN_CREW'; members?: CrewMember[] }
  | { type: 'SET_NOTE'; value: string }
  | { type: 'SET_DECK_WIDTH'; value: 12 | 16 | 20 }
  | { type: 'NAVIGATE'; scene: Scene }
export interface SceneProps { state: LifecycleState; dispatch: (action: LifecycleAction) => void }

export function initialLifecycleState(): LifecycleState {
  return { revision: LIFECYCLE_REVISION, role: null, scene: 'role', visited: ['role'], furthest: 0, visitAssignee: null, scopeConfirmed: false, visitPhoto: false, visitCompleted: false, estimateSent: false, estimateApproved: false, crewAssigned: false, assignedCrew: [], taskCompleted: false, completionPhoto: false, noteDraft: SAMPLE.note, postedNote: '', invoiceCreated: false, paymentRecorded: false, deckWidth: 16 }
}
function move(state: LifecycleState, scene: Scene): LifecycleState {
  return { ...state, scene, visited: state.visited.includes(scene) ? state.visited : [...state.visited, scene], furthest: Math.max(state.furthest, SCENES.indexOf(scene)) }
}
export function lifecycleReducer(state: LifecycleState, action: LifecycleAction): LifecycleState {
  if (action.type === 'RESTART') return initialLifecycleState()
  if (action.type === 'BACK') {
    const index = state.visited.indexOf(state.scene)
    return index > 0 ? { ...state, scene: state.visited[index - 1] } : state
  }
  if (action.type === 'NAVIGATE') return state.visited.includes(action.scene) ? { ...state, scene: action.scene } : state
  switch (action.type) {
    case 'SELECT_ROLE': {
      if (state.scene !== 'role' || !['operator', 'crew'].includes(action.role)) return state
      const next = { ...initialLifecycleState(), role: action.role }
      if (action.role === 'operator') return move(next, 'inquiry')
      // Prepared sample context, not actions taken by this visitor.
      return move({ ...next, visitAssignee: 'Mike', scopeConfirmed: true, visitPhoto: true, visitCompleted: true, estimateSent: true, estimateApproved: true, crewAssigned: true, assignedCrew: ['Pete'] }, 'crew')
    }
    case 'OPEN_BOOKING': return state.role === 'operator' && state.scene === 'inquiry' ? move(state, 'booked') : state
    case 'ASSIGN_VISIT': {
      if (state.role !== 'operator' || state.scene !== 'booked' || state.visitAssignee || !['You', 'Mike', 'Nick'].includes(action.member)) return state
      return action.member === 'You' ? move({ ...state, visitAssignee: 'You' }, 'visit')
        : move({ ...state, visitAssignee: action.member, scopeConfirmed: true, visitPhoto: true, visitCompleted: true }, 'review')
    }
    case 'START_VISIT': return state.role === 'operator' && state.scene === 'booked' && state.visitAssignee ? move(state, state.visitAssignee === 'You' ? 'visit' : 'review') : state
    case 'CONFIRM_SCOPE': return state.scene === 'visit' && state.visitAssignee === 'You' && !state.visitCompleted ? { ...state, scopeConfirmed: !state.scopeConfirmed } : state
    case 'ADD_SITE_PHOTO': return state.scene === 'visit' && state.visitAssignee === 'You' && !state.visitPhoto ? { ...state, visitPhoto: true } : state
    case 'REVIEW_VISIT': return state.scene === 'visit' && state.scopeConfirmed && state.visitPhoto ? move(state, 'review') : state
    case 'COMPLETE_VISIT': return state.scene === 'review' && state.scopeConfirmed && state.visitPhoto ? move({ ...state, visitCompleted: true }, 'estimate') : state
    case 'SET_DECK_WIDTH': return state.scene === 'estimate' && [12, 16, 20].includes(action.value) ? { ...state, deckWidth: action.value } : state
    case 'SEND_ESTIMATE': return state.scene === 'estimate' && state.visitCompleted ? move({ ...state, estimateSent: true }, 'accepted') : state
    case 'APPROVE_ESTIMATE': return state.scene === 'accepted' && state.estimateSent ? move({ ...state, estimateApproved: true }, 'project') : state
    case 'ASSIGN_CREW': {
      const members: CrewMember[] = action.members ?? ['Pete', 'Nick']
      if (state.role !== 'operator' || state.scene !== 'project' || state.crewAssigned || members.length === 0 || members.length > 2 || members.some(member => member !== 'Pete' && member !== 'Nick') || new Set(members).size !== members.length) return state
      return { ...state, crewAssigned: true, assignedCrew: [...members] }
    }
    case 'ADVANCE_WORKDAY': return state.role === 'operator' && state.scene === 'project' && state.crewAssigned ? move({ ...state, taskCompleted: true, completionPhoto: true, postedNote: SAMPLE.note }, 'activity') : state
    case 'VIEW_CREW': return state // Roles never change mid-story.
    case 'COMPLETE_TASK': return state.role === 'crew' && state.scene === 'crew' && state.crewAssigned && !state.taskCompleted ? { ...state, taskCompleted: true } : state
    case 'OPEN_COMPOSER': return state.role === 'crew' && state.scene === 'crew' && state.taskCompleted ? move(state, 'compose') : state
    case 'ADD_COMPLETION_PHOTO': return state.scene === 'compose' && !state.completionPhoto ? { ...state, completionPhoto: true } : state
    case 'SET_NOTE': return state.scene === 'compose' ? { ...state, noteDraft: action.value.slice(0, 280) } : state
    case 'POST_NOTE': return state.scene === 'compose' && state.taskCompleted && state.completionPhoto && state.noteDraft.trim() ? move({ ...state, postedNote: state.noteDraft.trim() }, 'activity') : state
    case 'OPEN_BILLING': return state.role === 'operator' && state.scene === 'activity' && state.taskCompleted && !!state.postedNote ? move(state, 'billing') : state
    case 'CREATE_INVOICE': return state.role === 'operator' && state.scene === 'billing' && state.taskCompleted && !!state.postedNote && !state.invoiceCreated ? { ...state, invoiceCreated: true } : state
    case 'RECORD_PAYMENT': return state.role === 'operator' && state.scene === 'billing' && state.invoiceCreated && !state.paymentRecorded ? { ...state, paymentRecorded: true } : state
    default: return state
  }
}
export function restoreLifecycleState(raw: string | null): LifecycleState {
  try {
    const value: unknown = JSON.parse(raw ?? 'null')
    if (!value || typeof value !== 'object') return initialLifecycleState()
    const v = value as LifecycleState
    const booleanKeys = ['scopeConfirmed', 'visitPhoto', 'visitCompleted', 'estimateSent', 'estimateApproved', 'crewAssigned', 'taskCompleted', 'completionPhoto', 'invoiceCreated', 'paymentRecorded'] as const
    if (v.revision !== LIFECYCLE_REVISION || !SCENES.includes(v.scene) || ![null, 'operator', 'crew'].includes(v.role) || ![null, 'You', 'Mike', 'Nick'].includes(v.visitAssignee) || ![12, 16, 20].includes(v.deckWidth)) return initialLifecycleState()
    if (booleanKeys.some(key => typeof v[key] !== 'boolean') || typeof v.noteDraft !== 'string' || v.noteDraft.length > 280 || typeof v.postedNote !== 'string' || v.postedNote.length > 280) return initialLifecycleState()
    if (!Array.isArray(v.visited) || v.visited[0] !== 'role' || !v.visited.includes(v.scene) || new Set(v.visited).size !== v.visited.length || v.visited.some(scene => !SCENES.includes(scene)) || v.furthest !== Math.max(...v.visited.map(scene => SCENES.indexOf(scene)))) return initialLifecycleState()
    if (!Array.isArray(v.assignedCrew) || v.assignedCrew.length > 2 || v.assignedCrew.some(member => !['Pete', 'Nick'].includes(member)) || new Set(v.assignedCrew).size !== v.assignedCrew.length || v.crewAssigned !== (v.assignedCrew.length > 0)) return initialLifecycleState()
    if (!v.role) return v.scene === 'role' && v.visited.length === 1 ? initialLifecycleState() : initialLifecycleState()
    if ((v.visitCompleted && (!v.visitPhoto || !v.scopeConfirmed)) || (v.estimateSent && !v.visitCompleted) || (v.estimateApproved && !v.estimateSent) || (v.crewAssigned && !v.estimateApproved) || (v.taskCompleted && !v.crewAssigned) || (v.completionPhoto && !v.taskCompleted) || (v.postedNote && (!v.completionPhoto || !v.taskCompleted || !v.postedNote.trim())) || (v.invoiceCreated && (!v.postedNote || v.role !== 'operator')) || (v.paymentRecorded && !v.invoiceCreated)) return initialLifecycleState()
    const expected: Scene[] = v.role === 'crew' ? ['role', 'crew', 'compose', 'activity'] : ['role', 'inquiry', 'booked', ...(v.visitAssignee === 'You' ? ['visit' as const] : []), 'review', 'estimate', 'accepted', 'project', 'activity', 'billing']
    if (v.visited.some((scene, index) => scene !== expected[index])) return initialLifecycleState()
    const reached = (scene: Scene) => v.visited.includes(scene)
    if ((reached('visit') && v.visitAssignee !== 'You') || (reached('review') && (!v.visitAssignee || !v.visitPhoto || !v.scopeConfirmed)) || (reached('estimate') && !v.visitCompleted) || (reached('accepted') && !v.estimateSent) || (reached('project') && !v.estimateApproved) || (reached('crew') && !v.crewAssigned) || (reached('compose') && !v.taskCompleted) || (reached('activity') && !v.postedNote)) return initialLifecycleState()
    if (v.role === 'operator' && ((v.visitAssignee && !reached(v.visitAssignee === 'You' ? 'visit' : 'review')) || (v.visitPhoto && !reached('visit') && !reached('review')) || (v.estimateSent && !reached('accepted')) || (v.estimateApproved && !reached('project')) || (v.crewAssigned && !reached('project')) || (v.taskCompleted && !reached('activity')) || (v.invoiceCreated && !reached('billing')))) return initialLifecycleState()
    if (v.role === 'crew' && (v.visitAssignee !== 'Mike' || !v.crewAssigned || v.assignedCrew.length !== 1 || v.assignedCrew[0] !== 'Pete' || (v.completionPhoto && !reached('compose')))) return initialLifecycleState()
    return { ...initialLifecycleState(), ...v, visited: [...v.visited], assignedCrew: [...v.assignedCrew] }
  } catch { return initialLifecycleState() }
}
