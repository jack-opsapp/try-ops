import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoExperience } from '@/components/demo/DemoExperience'
import { SAMPLE } from '@/components/demo/lifecycle-data'
import { LIFECYCLE_STORAGE_KEY } from '@/components/demo/lifecycle-state'
import DemoPage from '@/app/demo/page'
import DemoError from '@/app/demo/error'
import { renderToString } from 'react-dom/server'

const diagnostics = vi.hoisted(() => ({ track: vi.fn() }))
vi.mock('@/lib/demo/use-demo-funnel', () => ({
  useDemoFunnel: () => ({ signupHref: '/demo/start-trial', track: diagnostics.track }),
}))
function click(name: string) { fireEvent.click(screen.getByRole('button', { name })) }
function skipScene() { click('Skip scene') }
function goBack() { fireEvent.click(within(screen.getByRole('contentinfo')).getByRole('button', { name: 'Back' })) }
function chooseVisit(name: 'You' | 'Mike' | 'Nick' = 'You') {
  click('Choose Operator'); skipScene(); click('Assign site visit'); click(`Select ${name}`)
  click(name === 'You' ? 'Assign to me' : `Assign to ${name}`)
  if (name !== 'You') skipScene()
}
function confirmScope() { fireEvent.click(screen.getByRole('checkbox', { name: 'Confirm the deck scope with Alex' })) }
function reachEstimate() { chooseVisit(); confirmScope(); click('Photo'); click('Done'); click('Complete visit'); skipScene() }
function reachProject() { reachEstimate(); click('Send estimate'); skipScene() }
function assignInstallationCrew(name = 'Pete') {
  fireEvent.click(screen.getByRole('tab', { name: 'details' }))
  click('Open resurfacing task'); click('Assign team to this task'); click(`Select ${name}`); click('Done')
}
function reachOperatorActivity(name = 'Pete') { reachProject(); assignInstallationCrew(name); skipScene(); click('184 Cedar Lane Complete') }
function reachComposer() { click('Choose Crew'); skipScene(); click('Complete'); click('Post a photo update') }
function postUpdate(note: string = SAMPLE.note) {
  fireEvent.change(screen.getByRole('textbox', { name: 'Project note' }), { target: { value: note } })
  click('Attach completion photo'); click('Post crew update')
}
function popScene(scene: string) {
  act(() => { window.dispatchEvent(new PopStateEvent('popstate', { state: { opsLifecycleScene: scene } })) })
}
function expectNativeTrial(name = 'Start my free trial') {
  const link = screen.getByRole('link', { name })
  expect(link.tagName).toBe('A')
  expect(link.getAttribute('href')).toBe('/demo/start-trial')
}
function originalPhoto(image: HTMLElement) {
  const src = image.getAttribute('src') ?? ''
  return new URL(src, window.location.origin).searchParams.get('url') ?? src
}

beforeEach(() => {
  vi.useFakeTimers()
  sessionStorage.clear()
  diagnostics.track.mockReset()
  window.history.replaceState({}, '', '/demo')
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
})
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks() })

describe('the visitor sample job', () => {
  it('guides one current action through the Operator path without changing identity', () => {
    const { container } = render(<DemoExperience />)
    const expectCue = (target: Element) => expect(Array.from(container.querySelectorAll('[data-demo-next="true"]'))).toEqual([target])
    const button = (name: string) => screen.getByRole('button', { name })
    expectCue(button('Choose Operator').parentElement!)
    click('Choose Operator'); skipScene()
    expect(screen.getByText('YOU · OPERATOR')).toBeTruthy()
    expectCue(button('Assign site visit'))
    click('Assign site visit'); expectCue(button('Select You').parentElement!)
    click('Select You'); expectCue(button('Assign to me'))
    click('Assign to me')
    expectCue(screen.getByRole('checkbox', { name: 'Confirm the deck scope with Alex' }).closest('label')!)
    confirmScope(); expectCue(button('Photo'))
    click('Photo'); expectCue(button('Done'))
    click('Done'); expectCue(button('Complete visit'))
    click('Complete visit'); skipScene(); expectCue(button('Send estimate'))
    click('Send estimate'); skipScene()
    expect(screen.queryByRole('button', { name: 'Mark approved' })).toBeNull()
    expectCue(screen.getByRole('tab', { name: 'details' }))
    fireEvent.click(screen.getByRole('tab', { name: 'details' }))
    expectCue(button('Open resurfacing task'))
    click('Open resurfacing task'); expectCue(button('Assign team to this task'))
    click('Assign team to this task'); expectCue(screen.getByRole('region', { name: 'Choose installation crew' }))
    click('Select Nick'); expectCue(button('Done'))
    click('Done'); skipScene(); expectCue(button('184 Cedar Lane Complete'))
    expect(screen.queryByRole('button', { name: 'Dismiss notification' })).toBeNull()
    click('184 Cedar Lane Complete')
    expect(screen.getByText('YOU · OPERATOR')).toBeTruthy()
    expectCue(button('View billing'))
    click('View billing'); skipScene(); expectCue(screen.getByRole('link', { name: 'Start my free trial' }))
    expect(screen.queryByRole('button', { name: 'Create invoice' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Record payment' })).toBeNull()
    expectCue(screen.getByRole('link', { name: 'Start my free trial' }))
  })

  it('guides Crew through documenting their own work and a team-joining exit', () => {
    const { container } = render(<DemoExperience />)
    const expectCue = (target: Element) => expect(Array.from(container.querySelectorAll('[data-demo-next="true"]'))).toEqual([target])
    const button = (name: string) => screen.getByRole('button', { name })
    click('Choose Crew'); skipScene()
    expect(screen.getByText('YOU · CREW')).toBeTruthy()
    expectCue(button('Complete'))
    click('Complete'); expectCue(button('Post a photo update'))
    click('Post a photo update'); expectCue(button('Attach completion photo'))
    fireEvent.change(screen.getByRole('textbox', { name: 'Project note' }), { target: { value: '' } })
    click('Attach completion photo'); expectCue(screen.getByRole('textbox', { name: 'Project note' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Project note' }), { target: { value: 'Deck complete.' } })
    expectCue(button('Post crew update'))
    click('Post crew update')
    expect(screen.getByText('YOU · CREW')).toBeTruthy()
    expectCue(screen.getByRole('link', { name: 'Get OPS' }))
    expect(screen.getByRole('link', { name: 'Get OPS' }).getAttribute('href')).toBe('/download')
    expect(screen.getByRole('link', { name: 'Sign in to join your team' }).getAttribute('href')).toBe('https://app.opsapp.co/login')
    expect(screen.queryByRole('button', { name: 'View billing' })).toBeNull()
  })

  it('shows a neutral server state and native exits while saved progress is being restored', () => {
    const html = renderToString(<DemoExperience />)
    expect(html).toContain('Opening your sample job.')
    expect(html).not.toContain('SITE VISIT BOOKED')
    expect(html).toContain('href="/demo/start-trial"')
    expect(html).toContain('Exit demo')
  })

  it.each([['/for/roofing', '/for/roofing'], ['https://example.com', '/'], ['//example.com', '/']])('exits safely from %s', async (from, destination) => {
    render(await DemoPage({ searchParams: Promise.resolve({ from }) }))
    expect(screen.getByRole('link', { name: 'Exit demo' }).getAttribute('href')).toBe(destination)
  })

  it('offers retry and a native trial link after a render failure', () => {
    const reset = vi.fn()
    render(<DemoError reset={reset} />)
    click('Try again')
    expect(reset).toHaveBeenCalledOnce()
    expectNativeTrial()
  })

  it('uses owned browser history for repeated Back and does not count Forward as Back', () => {
    const entries: Array<Record<string, unknown>> = []
    const nativePush = window.history.pushState.bind(window.history)
    const push = vi.spyOn(window.history, 'pushState').mockImplementation((state, title, url) => {
      entries.push({ ...(state as Record<string, unknown>) })
      nativePush(state, title, url)
    })
    render(<DemoExperience />)
    reachEstimate()
    const review = entries.filter(entry => entry.opsLifecycleScene === 'review').at(-1)!
    const estimate = entries.filter(entry => entry.opsLifecycleScene === 'estimate').at(-1)!
    click('Send estimate'); skipScene()
    const project = { ...(window.history.state as Record<string, unknown>) }
    expect(screen.getByRole('tab', { name: 'details' })).toBeTruthy()

    const targets = [estimate, review]
    const browserBack = vi.spyOn(window.history, 'back').mockImplementation(() => {
      const target = targets.shift()
      if (target) window.dispatchEvent(new PopStateEvent('popstate', { state: target }))
    })
    push.mockClear()
    diagnostics.track.mockReset()

    goBack()
    expect(browserBack).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Draft')).toBeTruthy()
    goBack()
    expect(browserBack).toHaveBeenCalledTimes(2)
    expect(screen.getByText('Site visit · You')).toBeTruthy()
    expect(push).not.toHaveBeenCalled()
    expect(diagnostics.track.mock.calls.filter(([event]) => event.action === 'back')).toHaveLength(2)

    act(() => { window.dispatchEvent(new PopStateEvent('popstate', { state: estimate })) })
    expect(screen.getByText('Draft')).toBeTruthy()
    act(() => { window.dispatchEvent(new PopStateEvent('popstate', { state: project })) })
    expect(screen.getByRole('tab', { name: 'details' })).toBeTruthy()
    expect(diagnostics.track.mock.calls.filter(([event]) => event.action === 'back')).toHaveLength(2)
  })

  it('falls back to durable lifecycle Back after a resumed session without owned history', () => {
    const first = render(<DemoExperience />)
    reachProject()
    first.unmount()
    window.history.replaceState({}, '', '/demo')
    const browserBack = vi.spyOn(window.history, 'back').mockImplementation(() => {})
    const nativePush = window.history.pushState.bind(window.history)
    const push = vi.spyOn(window.history, 'pushState').mockImplementation((state, title, url) => nativePush(state, title, url))
    render(<DemoExperience />)
    browserBack.mockClear()
    push.mockClear()

    goBack()
    expect(browserBack).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'View project' })).toBeTruthy()
    goBack()
    expect(browserBack).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
    expect(screen.getByText('Draft')).toBeTruthy()
  })

  it('falls back to durable lifecycle Back when browser history is unavailable', () => {
    render(<DemoExperience />)
    click('Choose Operator'); skipScene()
    const browserBack = vi.spyOn(window.history, 'back').mockImplementation(() => { throw new Error('history unavailable') })

    goBack()

    expect(browserBack).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'Choose Operator' })).toBeTruthy()
  })

  it('rebases stale browser history after Restart before starting a new journey', () => {
    render(<DemoExperience />)
    const oldJourneyRole = { ...(window.history.state as Record<string, unknown>) }
    click('Choose Operator'); skipScene()
    click('Restart demo')
    const restarted = { ...(window.history.state as Record<string, unknown>) }
    expect(restarted).toMatchObject({ opsLifecycleScene: 'role', opsLifecyclePosition: 0, opsLifecycleGeneration: 1 })

    act(() => { window.dispatchEvent(new PopStateEvent('popstate', { state: oldJourneyRole })) })
    const rebasedRole = { ...(window.history.state as Record<string, unknown>) }
    expect(rebasedRole).toMatchObject({ opsLifecycleScene: 'role', opsLifecyclePosition: 0, opsLifecycleGeneration: 1 })
    expect(screen.getByRole('button', { name: 'Choose Crew' })).toBeTruthy()

    click('Choose Crew')
    vi.spyOn(window.history, 'back').mockImplementationOnce(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: rebasedRole }))
    })
    goBack()
    expect(screen.getByRole('button', { name: 'Choose Crew' })).toBeTruthy()
  })

  it('carries an Operator’s own site evidence through the assigned project and incoming crew update', () => {
    render(<DemoExperience />)
    click('Choose Operator'); skipScene()
    expect(screen.getByRole('heading', { name: SAMPLE.project })).toBeTruthy()
    expect(screen.getByText(/We can visit Tuesday/)).toBeTruthy()
    expect(screen.getByText(/works. I’ll be home to show you the deck/)).toBeTruthy()
    expectNativeTrial('Try OPS free')
    click('Assign site visit'); click('Select You'); click('Assign to me')
    expect(screen.getByRole('button', { name: 'Done' }).hasAttribute('disabled')).toBe(true)
    confirmScope(); click('Photo')
    const before = originalPhoto(screen.getByRole('img', { name: /Sample site visit: the deck area/ }))
    click('Done')
    expect(originalPhoto(screen.getByRole('img', { name: /Sample site visit: the deck area/ }))).toBe(before)
    click('Complete visit'); skipScene()
    expect(screen.queryByText('OPS ACCOUNTING — BETA TESTING')).toBeNull()
    click('Send estimate'); skipScene()
    expect(screen.getByRole('tab', { name: 'activity' }).getAttribute('aria-selected')).toBe('true')
    expect(originalPhoto(screen.getByRole('img', { name: 'The existing deck documented at the site visit' }))).toBe(before)
    fireEvent.click(screen.getByRole('tab', { name: 'details' }))
    expect(screen.getAllByText('Unscheduled').length).toBeGreaterThan(0)
    assignInstallationCrew()
    skipScene(); click('184 Cedar Lane Complete')
    const post = within(screen.getByRole('article', { name: "Pete's completion update" }))
    expect(post.getByText(SAMPLE.note, { exact: true })).toBeTruthy()
    expect(post.getByText('Pete', { exact: true })).toBeTruthy()
    expect(originalPhoto(post.getByRole('img', { name: 'The completed deck Pete shared with the team' }))).toBe(SAMPLE.afterPhoto)
    expect(originalPhoto(screen.getByRole('img', { name: 'The existing deck documented at the site visit' }))).toBe(before)
    expect(screen.getByText('2 photos')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'View progress photo' })).toBeNull()
    expect(screen.queryByText('shared a progress photo')).toBeNull()
    expect(screen.getByText('YOU · OPERATOR')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Complete' })).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }))
    expect(screen.queryByText('OPS ACCOUNTING — BETA TESTING')).toBeNull()
    click('View billing'); skipScene()
    expect(screen.getByText('OPS ACCOUNTING — BETA TESTING')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Request free beta access' }).getAttribute('href')).toBe('mailto:jack@opsapp.co?subject=Request%20free%20accounting%20beta%20access')
    expectNativeTrial()
  })

  it.each(['Mike', 'Nick'])('lets %s’s completed visit arrive without asking the Operator to capture it', name => {
    render(<DemoExperience />)
    chooseVisit(name as 'Mike' | 'Nick')
    expect(screen.getByText(`${name} completed the site visit. Your record is ready to review.`)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Photo' })).toBeNull()
    expect(screen.queryByRole('checkbox', { name: 'Confirm the deck scope with Alex' })).toBeNull()
    expect(screen.getByText('YOU · OPERATOR')).toBeTruthy()
    click('Review estimate'); skipScene()
    expect(screen.getByText(`${name} has prepared the sample quote. Review the scope and send it to Alex.`)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Send estimate' })).toBeTruthy()
  })

  it('keeps original visit evidence and shows separately prepared task instructions', () => {
    render(<DemoExperience />)
    reachProject()
    expect(screen.queryByRole('region', { name: 'Pinned project instructions' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Project description' })).toBeNull()
    const visit = screen.getByText('completed a site visit').closest('details') as HTMLDetailsElement
    fireEvent.click(visit.querySelector('summary')!)
    expect(visit.open).toBe(true)
    expect(within(visit).getByText(SAMPLE.access)).toBeTruthy()
    expect(within(visit).getByText(SAMPLE.scope)).toBeTruthy()
    fireEvent.click(screen.getByRole('tab', { name: 'details' })); click('Open resurfacing task')
    const details = within(screen.getByRole('tabpanel', { name: 'details' }))
    const labels = details.getAllByText('Notes', { selector: 'dt' })
    expect(labels).toHaveLength(2)
    expect(labels[0].nextElementSibling?.textContent).toBe('—')
    for (const note of SAMPLE.resurfacingNotes) expect(labels[1].nextElementSibling?.textContent).toContain(note)
    expect(details.queryByText(SAMPLE.access)).toBeNull()
    expect(details.queryByText(SAMPLE.scope)).toBeNull()
  })

  it('posts the Crew visitor’s exact note and photo without changing to the Operator', () => {
    render(<DemoExperience />)
    reachComposer()
    expect(screen.getByRole('button', { name: 'Post crew update' }).hasAttribute('disabled')).toBe(true)
    const note = 'Deck finished. Side gate locked.'
    fireEvent.change(screen.getByRole('textbox', { name: 'Project note' }), { target: { value: note } })
    click('Attach completion photo')
    const completedPhoto = originalPhoto(screen.getByRole('img', { name: /Completion photo attached/ }))
    click('Post crew update')
    const post = within(screen.getByRole('article', { name: 'Your completion update' }))
    expect(post.getByText(note, { exact: true })).toBeTruthy()
    expect(post.getByText('You', { exact: true })).toBeTruthy()
    expect(originalPhoto(post.getByRole('img', { name: /The completed deck .* shared with the team/ }))).toBe(completedPhoto)
    expect(screen.getByText('YOU · CREW')).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Start my free trial' })).toBeNull()
  })

  it('preserves posted Crew work through Back, refresh and browser navigation while keeping edits unsent', () => {
    const first = render(<DemoExperience />)
    reachComposer(); postUpdate('Original completion note.')
    vi.spyOn(window.history, 'back').mockImplementationOnce(() => popScene('compose'))
    click('Back')
    const note = screen.getByRole('textbox', { name: 'Project note' }) as HTMLTextAreaElement
    expect(note.value).toBe('Original completion note.')
    expect(screen.getByRole('img', { name: /Completion photo attached/ })).toBeTruthy()
    fireEvent.change(note, { target: { value: 'An unsent correction.' } })
    first.unmount(); render(<DemoExperience />)
    expect(screen.getByText('Your sample job is where you left it.')).toBeTruthy()
    expect((screen.getByRole('textbox', { name: 'Project note' }) as HTMLTextAreaElement).value).toBe('An unsent correction.')
    popScene('activity')
    expect(within(screen.getByRole('article', { name: 'Your completion update' })).getByText('Original completion note.')).toBeTruthy()
    popScene('billing'); popScene('inquiry')
    expect(screen.queryByRole('heading', { name: SAMPLE.invoiceNumber })).toBeNull()
    expect(screen.getByRole('article', { name: 'Your completion update' })).toBeTruthy()
    popScene('compose'); click('Post crew update')
    expect(within(screen.getByRole('article', { name: 'Your completion update' })).getByText('An unsent correction.')).toBeTruthy()
    click('Restart demo')
    const saved = JSON.parse(sessionStorage.getItem(LIFECYCLE_STORAGE_KEY) ?? '{}')
    expect(saved).toMatchObject({ role: null, scene: 'role', postedNote: '', completionPhoto: false, taskCompleted: false, paymentRecorded: false })
    expect(window.history.state).toMatchObject({ opsLifecycleScene: 'role', opsLifecyclePosition: 0 })
    expect(screen.getByRole('button', { name: 'Back' }).hasAttribute('disabled')).toBe(true)
  })

  it('requires a nonblank note and photo, and restores an unfinished draft without publishing', () => {
    const first = render(<DemoExperience />)
    reachComposer()
    fireEvent.change(screen.getByRole('textbox', { name: 'Project note' }), { target: { value: ' \n ' } })
    click('Attach completion photo')
    expect(screen.getByRole('button', { name: 'Post crew update' }).hasAttribute('disabled')).toBe(true)
    fireEvent.change(screen.getByRole('textbox', { name: 'Project note' }), { target: { value: 'Ready for the owner to check.' } })
    first.unmount(); render(<DemoExperience />)
    expect((screen.getByRole('textbox', { name: 'Project note' }) as HTMLTextAreaElement).value).toBe('Ready for the owner to check.')
    expect(screen.getByRole('img', { name: /Completion photo attached/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Post crew update' }).hasAttribute('disabled')).toBe(false)
    expect(screen.queryByRole('article', { name: 'Your completion update' })).toBeNull()
  })

  it('discards a cancelled crew choice and attributes incoming work only to the selected person', () => {
    const first = render(<DemoExperience />)
    reachProject()
    fireEvent.keyDown(screen.getByRole('tab', { name: 'activity' }), { key: 'ArrowRight' })
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'details' }))
    click('Open resurfacing task'); click('Assign team to this task')
    expect(screen.getByRole('button', { name: 'Done' }).hasAttribute('disabled')).toBe(true)
    click('Select Pete'); click('Cancel')
    expect(screen.queryByRole('button', { name: '184 Cedar Lane Complete' })).toBeNull()
    click('Assign team to this task')
    expect(screen.getByRole('button', { name: 'Select Pete' }).getAttribute('aria-pressed')).toBe('false')
    click('Select Nick'); click('Done'); skipScene(); click('184 Cedar Lane Complete')
    first.unmount(); render(<DemoExperience />)
    const post = within(screen.getByRole('article', { name: "Nick's completion update" }))
    expect(post.getByText('Nick', { exact: true })).toBeTruthy()
    expect(post.getByRole('img', { name: 'The completed deck Nick shared with the team' })).toBeTruthy()
    expect(screen.queryByRole('article', { name: "Pete's completion update" })).toBeNull()
    const saved = JSON.parse(sessionStorage.getItem(LIFECYCLE_STORAGE_KEY) ?? '{}')
    expect(saved).toMatchObject({ role: 'operator', assignedCrew: ['Nick'] })
  })

  it('shows billing updates without manual financial actions and keeps accounting connection optional', () => {
    render(<DemoExperience />)
    reachOperatorActivity()
    expect(screen.queryByRole('link', { name: 'Start my free trial' })).toBeNull()
    click('View billing')
    expect(screen.queryByRole('button', { name: /Record payment/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /Create invoice/ })).toBeNull()
    skipScene()
    expectNativeTrial()
    expect(screen.getByRole('heading', { name: SAMPLE.invoiceNumber })).toBeTruthy()
    fireEvent.click(screen.getByText('Invoice details', { selector: 'summary' }))
    expect(screen.getByText('Deck preparation')).toBeTruthy()
    for (const price of ['$800', '$1,600', '$1,800']) expect(screen.getByText(price)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Pay now/i })).toBeNull()
    expectNativeTrial()
    expect(screen.queryByRole('button', { name: 'Preview payment recording' })).toBeNull()
    expect(screen.getByText('Paid in full')).toBeTruthy()
    expect(screen.getByText('$0 DUE')).toBeTruthy()
    click('Connect accounting software'); fireEvent.click(screen.getByRole('radio', { name: 'Sage' }))
    expect(screen.getByText(/the next step is Sage sign-in/)).toBeTruthy()
    expect(screen.getByText('PREVIEW ONLY · NO ACCOUNT CONNECTED')).toBeTruthy()
    click('Close preview')
    vi.spyOn(window.history, 'back').mockImplementationOnce(() => popScene('activity'))
    click('Back')
    expect(within(screen.getByRole('article', { name: "Pete's completion update" })).getByText(SAMPLE.note)).toBeTruthy()
    click('View billing')
    expect(screen.getByText('Paid in full')).toBeTruthy()
    expectNativeTrial()
  })

  it('keeps the Operator journey and native signup usable when storage and analytics both fail', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    diagnostics.track.mockImplementation(() => { throw new Error('analytics unavailable') })
    render(<DemoExperience />)
    reachOperatorActivity(); click('View billing'); skipScene()
    expectNativeTrial(); expectNativeTrial('Try OPS free')
    const trial = screen.getByRole('link', { name: 'Start my free trial' })
    const nativeClick = new MouseEvent('click', { bubbles: true, cancelable: true })
    let interceptedBeforeBrowser = true
    window.addEventListener('click', event => { interceptedBeforeBrowser = event.defaultPrevented; event.preventDefault() }, { once: true })
    expect(() => trial.dispatchEvent(nativeClick)).not.toThrow()
    expect(interceptedBeforeBrowser).toBe(false)
    expect(screen.getByRole('heading', { name: SAMPLE.invoiceNumber })).toBeTruthy()
  })

  it('keeps the saved visit usable if the photo asset fails to load', () => {
    render(<DemoExperience />)
    chooseVisit(); confirmScope(); click('Photo')
    fireEvent.error(screen.getByRole('img', { name: /Sample site visit: the deck area/ }))
    expect(screen.getByText('Sample photo unavailable. You can continue.')).toBeTruthy()
    click('Done'); click('Complete visit'); skipScene()
    expect(screen.getByRole('button', { name: 'Send estimate' })).toBeTruthy()
  })

  it('does not skip the assignment on repeated activation of the inquiry action', () => {
    render(<DemoExperience />)
    click('Choose Operator'); skipScene()
    const open = screen.getByRole('button', { name: 'Assign site visit' })
    act(() => { fireEvent.click(open); fireEvent.click(open) })
    expect(screen.getByRole('button', { name: 'Select You' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Photo' })).toBeNull()
  })
})
