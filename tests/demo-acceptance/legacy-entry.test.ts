import { describe, expect, it } from 'vitest'
import { getTutorialRoute } from '@/lib/utils/tutorial-routes'

// Regression: an existing visitor's old a/b/c cookie must never send them
// into a retired video, narrative, or animated tutorial.
describe('legacy tutorial visitor entry', () => {
  it.each(['a', 'b', 'c', '', 'unknown', '../signup/ready', 'https://example.test']) (
    'routes the legacy variant %j to the supported sample demo',
    variant => {
      expect(getTutorialRoute(variant)).toBe('/demo')
    },
  )
})
