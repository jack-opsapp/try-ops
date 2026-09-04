import assert from 'node:assert/strict'
import test from 'node:test'
import { runInNewContext } from 'node:vm'
import { readFile } from 'node:fs/promises'
import {
  buildAnalyticsBootstrapScript,
  isProductionAnalyticsHostname,
  isProductionAnalyticsRequestUrl,
  shouldCollectProductionAnalytics,
} from './production-boundary.ts'

function executeBootstrap(hostname) {
  const context = { location: { hostname } }
  context.window = context
  runInNewContext(
    buildAnalyticsBootstrapScript('G-TEST123', 'AW-123456789'),
    context,
  )
  return Array.from(context.dataLayer ?? [], (entry) => Array.from(entry))
}

test('accepts only the exact production landing-page hostname', () => {
  assert.equal(isProductionAnalyticsHostname('try.opsapp.co'), true)
  assert.equal(isProductionAnalyticsHostname('TRY.OPSAPP.CO.'), true)

  for (const hostname of [
    'localhost',
    '127.0.0.1',
    '::1',
    'try-ops-git-feature.vercel.app',
    'try.opsapp.co.evil.example',
    'opsapp.co',
  ]) {
    assert.equal(isProductionAnalyticsHostname(hostname), false, hostname)
  }
})

test('persists analytics API requests only on the production host', () => {
  assert.equal(
    isProductionAnalyticsRequestUrl(
      'https://try.opsapp.co/api/onboarding-events',
    ),
    true,
  )
  assert.equal(
    isProductionAnalyticsRequestUrl('http://localhost:3000/api/onboarding-events'),
    false,
  )
  assert.equal(
    isProductionAnalyticsRequestUrl(
      'https://try-ops-preview.vercel.app/api/tutorial-log',
    ),
    false,
  )
  assert.equal(isProductionAnalyticsRequestUrl('not a URL'), false)
})

test('client event collection follows the same exact-host boundary', () => {
  const originalWindow = globalThis.window
  try {
    globalThis.window = { location: { hostname: 'localhost' } }
    assert.equal(shouldCollectProductionAnalytics(), false)

    globalThis.window = { location: { hostname: 'try.opsapp.co' } }
    assert.equal(shouldCollectProductionAnalytics(), true)
  } finally {
    if (originalWindow === undefined) delete globalThis.window
    else globalThis.window = originalWindow
  }
})

test('does not initialize GA or Ads away from production', () => {
  assert.deepEqual(executeBootstrap('localhost'), [])
  assert.deepEqual(executeBootstrap('try-ops-git-feature.vercel.app'), [])
})

test('configures GA and Ads on try.opsapp.co', () => {
  const calls = executeBootstrap('try.opsapp.co')
  assert.equal(calls[0]?.[0], 'js')
  assert.deepEqual(calls.slice(1), [
    ['config', 'G-TEST123'],
    ['config', 'AW-123456789'],
  ])
})

test('every first-party analytics sender and sink applies the production boundary', async () => {
  const expectedGuards = [
    ['../../lib/hooks/useAnalytics.ts', 'shouldCollectProductionAnalytics()'],
    [
      '../../components/tutorial/narrative/utils/analytics.ts',
      'shouldCollectProductionAnalytics()',
    ],
    [
      '../../components/tutorial/intro/TutorialIntroShell.tsx',
      'shouldCollectProductionAnalytics()',
    ],
    [
      '../../app/api/onboarding-events/route.ts',
      'isProductionAnalyticsRequestUrl(req.url)',
    ],
    [
      '../../app/api/tutorial-log/route.ts',
      'isProductionAnalyticsRequestUrl(request.url)',
    ],
  ]

  for (const [relativePath, guard] of expectedGuards) {
    const source = await readFile(new URL(relativePath, import.meta.url), 'utf8')
    assert.ok(source.includes(guard), `${relativePath} must use ${guard}`)
  }
})
