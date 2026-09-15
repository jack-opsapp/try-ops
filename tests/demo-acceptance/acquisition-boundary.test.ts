import { afterEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'

const database = vi.hoisted(() => ({ rpc: vi.fn() }))
vi.mock('@/lib/ab/supabase', () => ({ getABSupabase: () => database }))

afterEach(() => {
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

describe('optional demo acquisition boundaries', () => {
  // Real middleware still runs its eligibility, header, and cookie behavior.
  // Only its external database is replaced so no QA write is possible.
  it.each([
    '/demo', '/demo/start-trial', '/tutorial-interactive', '/tutorial-intro',
    '/tutorial/6', '/tutorial/complete', '/signup/ready', '/download',
    '/job-management', '/for/roofing', '/for/landscaping', '/for/cleaning',
    '/compare/jobber', '/compare/servicetitan', '/compare/housecall-pro',
  ])('never enrolls or rewrites experiment identity on %s', async pathname => {
    vi.stubEnv('AB_EXPERIMENTS_ENABLED', 'true')
    const response = await middleware(new NextRequest(`https://try.opsapp.co${pathname}`, {
      headers: {
        cookie: '__ops_experiment=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA; ops_variant=c',
        'user-agent': 'Mozilla/5.0',
      },
    }))
    expect(database.rpc).not.toHaveBeenCalled()
    expect(response.headers.get('set-cookie') ?? '').not.toContain('__ops_experiment=')
    expect(response.headers.get('set-cookie') ?? '').not.toContain('__ops_experiment_visitor=')
  })
})
