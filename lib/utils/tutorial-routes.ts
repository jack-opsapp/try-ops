export type TutorialVariant = 'a' | 'b' | 'c'

const TUTORIAL_ROUTES: Record<TutorialVariant, string> = {
  a: '/tutorial-interactive',
  b: '/tutorial/1',
  c: '/tutorial-intro',
}

export function getTutorialRoute(variant: string): string {
  return TUTORIAL_ROUTES[variant as TutorialVariant] || TUTORIAL_ROUTES.a
}
