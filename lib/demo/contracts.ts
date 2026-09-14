/** Diagnostics only. None of these events establishes a trial or experiment exposure. */
export const DEMO_VERSION = 'crew-job-v1' as const
export const DEMO_SIGNUP_HREF = '/demo/start-trial' as const
export const DEMO_STEPS = ['assign', 'crew', 'complete'] as const
export const DEMO_ACTIONS = ['started', 'job_assigned', 'crew_viewed', 'task_completed', 'back', 'restart', 'exit', 'signup_clicked', 'error'] as const
export type DemoStep = typeof DEMO_STEPS[number]
export type DemoAction = typeof DEMO_ACTIONS[number]
export interface DemoEvent {
  action: DemoAction
  step: DemoStep
  elapsedMs: number
  /** No exception messages, URLs, names or other free text. */
  errorCode?: 'asset_unavailable' | 'storage_unavailable' | 'render_failed'
}
export type DemoDelivery = 'recorded' | 'excluded' | 'rejected' | 'unavailable'
