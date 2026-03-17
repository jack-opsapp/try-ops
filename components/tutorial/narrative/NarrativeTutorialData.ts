// All static data for the narrative tutorial.
// Zero external dependencies — colors are hardcoded hex strings
// matching OPSStyle.Colors.status.* values.

// ─── Types ─────────────────────────────────────────────────────────

export type LineItemType = 'labor' | 'material'

export interface LineItem {
  id: string
  name: string
  type: LineItemType
  amount: number
}

export interface TaskCard {
  id: string
  name: string
  crew: string
  color: string
}

export interface ReviewCard {
  id: string
  task: string
  project: string
  client: string
  daysAgo: number
  color: string
}

// ─── Phases ────────────────────────────────────────────────────────

export const PHASES = [
  'leadArrives',
  'sendEstimate',
  'estimateApproved',
  'crewExecutes',
  'weeklyReview',
  'invoiceAndPay',
] as const

export type Phase = (typeof PHASES)[number]

export const PHASE_CONFIG: Record<Phase, { interactive: boolean; index: number }> = {
  leadArrives:      { interactive: true,  index: 0 },
  sendEstimate:     { interactive: true,  index: 1 },
  estimateApproved: { interactive: false, index: 2 },
  crewExecutes:     { interactive: false, index: 3 },
  weeklyReview:     { interactive: true,  index: 4 },
  invoiceAndPay:    { interactive: true,  index: 5 },
}

export const TOTAL_STEPS = PHASES.length

// ─── Client ────────────────────────────────────────────────────────

export const CLIENT_NAME = 'Sarah Chen'
export const CLIENT_COMPANY = 'Chen Residential'

// ─── Estimate / Invoice ────────────────────────────────────────────

export const PROJECT_TITLE = 'Kitchen Renovation'
export const INVOICE_NUMBER = 'INV-0001'
export const ESTIMATE_TOTAL = 12_000

export const LINE_ITEMS: LineItem[] = [
  { id: 'li-1', name: 'Demolition',        type: 'labor',    amount: 2_500 },
  { id: 'li-2', name: 'Framing',           type: 'labor',    amount: 4_000 },
  { id: 'li-3', name: 'Plumbing Rough-In', type: 'labor',    amount: 3_500 },
  { id: 'li-4', name: 'Materials',         type: 'material', amount: 2_000 },
]

export const LABOR_ITEMS = LINE_ITEMS.filter((li) => li.type === 'labor')

// ─── Tasks (from labor line items) ─────────────────────────────────

export const TASK_CARDS: TaskCard[] = [
  { id: 'tc-1', name: 'Demolition',        crew: 'Mike R.', color: '#BCBCBC' },
  { id: 'tc-2', name: 'Framing',           crew: 'John S.', color: '#8195B5' },
  { id: 'tc-3', name: 'Plumbing Rough-In', crew: 'Mike R.', color: '#B5A381' },
]

// ─── Review Cards (Step 5) ─────────────────────────────────────────

export const REVIEW_CARDS: ReviewCard[] = [
  { id: 'rc-1', task: 'Deck Staining',    project: 'Riverside Cabin',    client: 'Tom Walsh',     daysAgo: 3, color: '#9DB582' },
  { id: 'rc-2', task: 'Final Inspection', project: 'Kitchen Renovation', client: 'Sarah Chen',    daysAgo: 1, color: '#B5A381' },
  { id: 'rc-3', task: 'Touch-Up Paint',   project: 'Office Remodel',    client: 'Apex Holdings', daysAgo: 5, color: '#8195B5' },
  { id: 'rc-4', task: 'Fixture Install',  project: 'Bathroom Reno',     client: 'Lisa Park',     daysAgo: 2, color: '#B58289' },
]

// ─── Crew ──────────────────────────────────────────────────────────

export const CREW_AVATARS: { name: string; tint: string }[] = [
  { name: 'Mike R.', tint: '#8195B5' },
  { name: 'John S.', tint: '#9DB582' },
]

// ─── Status colors (hardcoded, no OPSStyle dependency) ─────────────

export const STATUS_COLORS = {
  success: '#A5B368',
  warning: '#C4A868',
  error: '#93321A',
  inactive: '#8E8E93',
} as const

// ─── Formatting ────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`
}
