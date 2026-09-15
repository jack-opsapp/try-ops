export type TutorialVariant = 'a' | 'b' | 'c'

/** Old variant links share the supported demo; this never enrolls an experiment. */
export function getTutorialRoute(_variant: string): string {
  return '/demo'
}
