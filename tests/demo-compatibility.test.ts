import { describe, expect, it, vi } from 'vitest'
import { POST as sync } from '../app/api/auth/sync-user/route'
import { NextRequest } from 'next/server'
describe('retired identity binding', () => {
  it('retires token/email binding without reading the caller body or touching the network', async () => {
    const network = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('must not send'))
    const req = new NextRequest('https://try.opsapp.co/api/auth/sync-user', { method:'POST', body:'{"idToken":"different-user-token","email":"victim@example.test"}' })
    const response = await sync(req)
    expect(response.status).toBe(410)
    expect(await response.json()).toMatchObject({ destination: 'https://app.opsapp.co/register' })
    expect(network).not.toHaveBeenCalled()
    network.mockRestore()
  })
})
