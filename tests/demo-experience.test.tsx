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
function reachVisit() { click('Open booked visit'); click('Start site visit') }
function reachProject() { reachVisit(); click('Photo'); click('Done'); click('Complete visit'); click('Mark approved') }
function assignInstallationCrew() {
  fireEvent.click(screen.getByRole('tab', { name: 'details' }))
  click('Open patio installation task'); click('Assign team to this task'); click('Pete'); click('Done')
}
function reachCrew() { reachProject(); assignInstallationCrew(); click('View crew on the workday') }
function reachComposer() { reachCrew(); click('Complete'); click('Post a photo update') }
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
  sessionStorage.clear()
  diagnostics.track.mockReset()
  window.history.replaceState({}, '', '/demo')
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('the visitor sample job', () => {
  it('guides one next action at a time and names each viewing role', () => {
    const { container } = render(<DemoExperience />)
    const expectCue = (target: Element) => {
      expect(Array.from(container.querySelectorAll('[data-demo-next="true"]'))).toEqual([target])
    }
    const button = (name: string) => screen.getByRole('button', { name })
    expect(screen.getByText('YOUR VIEW · OWNER')).toBeTruthy()
    expectCue(button('Open booked visit'))
    click('Open booked visit'); expectCue(button('Start site visit'))
    click('Start site visit')
    expect(screen.getByText('MIKE’S VIEW · ESTIMATOR')).toBeTruthy()
    expectCue(button('Photo'))
    click('Photo'); expectCue(button('Done'))
    click('Done'); expectCue(button('Complete visit'))
    click('Complete visit')
    expect(screen.getByText('YOUR VIEW · OWNER')).toBeTruthy()
    expectCue(button('Mark approved'))
    click('Mark approved'); expectCue(screen.getByRole('tab', { name: 'details' }))
    fireEvent.click(screen.getByRole('tab', { name: 'details' }))
    expectCue(button('Open patio installation task'))
    click('Open patio installation task'); expectCue(button('Assign team to this task'))
    click('Assign team to this task'); expectCue(screen.getByRole('region', { name: 'Choose installation crew' }))
    click('Nick'); expectCue(button('Done'))
    click('Done'); expectCue(button('View crew on the workday'))
    click('View crew on the workday')
    expect(screen.getByText('NICK’S VIEW · CREW')).toBeTruthy()
    expectCue(button('Complete'))
    click('Complete'); expectCue(button('Post a photo update'))
    click('Post a photo update'); expectCue(button('Attach completion photo'))
    fireEvent.change(screen.getByRole('textbox', { name: 'Project note' }), { target: { value: '' } })
    click('Attach completion photo'); expectCue(screen.getByRole('textbox', { name: 'Project note' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Project note' }), { target: { value: 'Patio complete.' } })
    expectCue(button('Post crew update'))
    click('Post crew update')
    expect(screen.getByText('YOUR VIEW · OWNER')).toBeTruthy()
    expectCue(screen.getByRole('link', { name: 'Start my free trial' }))
    click('See billing & accounting'); expectCue(button('Record payment'))
    click('Record payment'); expectCue(button('Record payment'))
    click('Record payment'); expectCue(screen.getByRole('link', { name: 'Start my free trial' }))
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

  it('carries the same job and site evidence into an assigned task, then posts Pete’s exact note and photo', () => {
    render(<DemoExperience />)
    expect(screen.getByRole('heading', { name: SAMPLE.project })).toBeTruthy()
    expect(screen.getByText(/Mike can visit Tuesday/)).toBeTruthy()
    expect(screen.getByText(/works. I’ll meet Mike at the cafe/)).toBeTruthy()
    expectNativeTrial('Try OPS free')
    reachVisit()
    expect(screen.getByRole('button', { name: 'Done' }).hasAttribute('disabled')).toBe(true)
    click('Photo')
    const before = originalPhoto(screen.getByRole('img', { name: /Sample site visit: cracked patio/ }))
    click('Done')
    expect(originalPhoto(screen.getByRole('img', { name: /Sample site visit: cracked patio/ }))).toBe(before)
    click('Complete visit'); click('Mark approved')
    expect(screen.getByRole('tab', { name: 'activity' }).getAttribute('aria-selected')).toBe('true')
    expect(originalPhoto(screen.getByRole('img', { name: 'The existing patio documented at the site visit' }))).toBe(before)
    assignInstallationCrew()
    expect(screen.getAllByText('Unscheduled').length).toBeGreaterThan(0)
    click('View crew on the workday'); click('Complete')
    expect(screen.getByText('Task complete', { exact: true })).toBeTruthy()
    expect(screen.queryByRole('article', { name: "Pete's completion update" })).toBeNull()
    click('Post a photo update')
    expect(screen.getByRole('button', { name: 'Post crew update' }).hasAttribute('disabled')).toBe(true)
    const note = 'Pavers finished. Cafe entrance clear. Side gate locked.'
    fireEvent.change(screen.getByRole('textbox', { name: 'Project note' }), { target: { value: note } })
    click('Attach completion photo')
    const completedPhoto = originalPhoto(screen.getByRole('img', { name: "Completion photo attached to Pete's update" }))
    click('Post crew update')
    const post = within(screen.getByRole('article', { name: "Pete's completion update" }))
    expect(post.getByText(note, { exact: true })).toBeTruthy()
    expect(post.getByText('Pete', { exact: true })).toBeTruthy()
    expect(originalPhoto(post.getByRole('img', { name: 'The completed patio Pete shared with the team' }))).toBe(completedPhoto)
    expect(originalPhoto(screen.getByRole('img', { name: 'The existing patio documented at the site visit' }))).toBe(before)
    expect(screen.getByText('completed a site visit')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }))
    expectNativeTrial()
  })

  it('keeps the original site notes in the visit record without inventing project or task notes', () => {
    render(<DemoExperience />)
    reachProject()
    expect(screen.queryByRole('region', { name: 'Pinned project instructions' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Project description' })).toBeNull()
    const visit = screen.getByText('completed a site visit').closest('details') as HTMLDetailsElement
    fireEvent.click(visit.querySelector('summary')!)
    expect(visit.open).toBe(true)
    expect(within(visit).getByText(SAMPLE.access)).toBeTruthy()
    expect(within(visit).getByText(SAMPLE.scope)).toBeTruthy()
    fireEvent.click(screen.getByRole('tab', { name: 'details' }))
    click('Open patio installation task')
    const details = within(screen.getByRole('tabpanel', { name: 'details' }))
    const labels = details.getAllByText('Notes', { selector: 'dt' })
    expect(labels).toHaveLength(2)
    for (const label of labels) expect(label.nextElementSibling?.textContent).toBe('—')
    expect(details.queryByText(SAMPLE.access)).toBeNull()
    expect(details.queryByText(SAMPLE.scope)).toBeNull()
  })

  it('preserves posted work through Back, refresh and browser navigation, and keeps edits unsent until posted', () => {
    const first = render(<DemoExperience />)
    reachComposer(); postUpdate('Original completion note.')
    click('Back')
    const note = screen.getByRole('textbox', { name: 'Project note' }) as HTMLTextAreaElement
    expect(note.value).toBe('Original completion note.')
    expect(screen.getByRole('img', { name: "Completion photo attached to Pete's update" })).toBeTruthy()
    fireEvent.change(note, { target: { value: 'An unsent correction.' } })
    first.unmount()
    render(<DemoExperience />)
    expect(screen.getByText('Your sample job is where you left it.')).toBeTruthy()
    expect((screen.getByRole('textbox', { name: 'Project note' }) as HTMLTextAreaElement).value).toBe('An unsent correction.')
    popScene('activity')
    expect(within(screen.getByRole('article', { name: "Pete's completion update" })).getByText('Original completion note.')).toBeTruthy()
    popScene('billing')
    expect(screen.queryByRole('heading', { name: SAMPLE.invoiceNumber })).toBeNull()
    popScene('compose'); click('Post crew update')
    expect(within(screen.getByRole('article', { name: "Pete's completion update" })).getByText('An unsent correction.')).toBeTruthy()
    popScene('inquiry')
    click('Restart demo')
    const saved = JSON.parse(sessionStorage.getItem(LIFECYCLE_STORAGE_KEY) ?? '{}')
    expect(saved).toMatchObject({ scene: 'inquiry', postedNote: '', completionPhoto: false, taskCompleted: false, paymentRecorded: false })
    expect(screen.getByRole('button', { name: 'Back' }).hasAttribute('disabled')).toBe(true)
  })

  it('requires a nonblank note and a photo, and restores an unfinished draft without publishing it', () => {
    const first = render(<DemoExperience />)
    reachComposer()
    fireEvent.change(screen.getByRole('textbox', { name: 'Project note' }), { target: { value: ' \n ' } })
    click('Attach completion photo')
    expect(screen.getByRole('button', { name: 'Post crew update' }).hasAttribute('disabled')).toBe(true)
    fireEvent.change(screen.getByRole('textbox', { name: 'Project note' }), { target: { value: 'Ready for the owner to check.' } })
    first.unmount()
    render(<DemoExperience />)
    expect((screen.getByRole('textbox', { name: 'Project note' }) as HTMLTextAreaElement).value).toBe('Ready for the owner to check.')
    expect(screen.getByRole('img', { name: "Completion photo attached to Pete's update" })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Post crew update' }).hasAttribute('disabled')).toBe(false)
    expect(screen.queryByRole('article', { name: "Pete's completion update" })).toBeNull()
  })

  it('discards a cancelled crew choice and uses only the selected person for the crew update', () => {
    const first = render(<DemoExperience />)
    reachProject()
    const activity = screen.getByRole('tab', { name: 'activity' })
    fireEvent.keyDown(activity, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'details' }))
    click('Open patio installation task'); click('Assign team to this task')
    expect(screen.getByRole('button', { name: 'Done' }).hasAttribute('disabled')).toBe(true)
    click('Pete'); click('Cancel')
    expect(screen.queryByRole('button', { name: 'View crew on the workday' })).toBeNull()
    click('Assign team to this task')
    expect(screen.getByRole('button', { name: 'Pete' }).getAttribute('aria-pressed')).toBe('false')
    click('Nick'); click('Done'); click('View crew on the workday')
    first.unmount()
    render(<DemoExperience />)
    click('Complete'); click('Post a photo update')
    expect(screen.getByText('Posting as Nick')).toBeTruthy()
    click('Attach completion photo'); click('Post crew update')
    const post = within(screen.getByRole('article', { name: "Nick's completion update" }))
    expect(post.getByText('Nick', { exact: true })).toBeTruthy()
    expect(post.getByRole('img', { name: 'The completed patio Nick shared with the team' })).toBeTruthy()
    expect(screen.queryByRole('article', { name: "Pete's completion update" })).toBeNull()
    const saved = JSON.parse(sessionStorage.getItem(LIFECYCLE_STORAGE_KEY) ?? '{}')
    expect(saved.assignedCrew).toEqual(['Nick'])
  })

  it('keeps billing optional and records an external payment without pretending to connect an account', () => {
    render(<DemoExperience />)
    reachComposer(); postUpdate('Patio complete and photographed.')
    expectNativeTrial()
    click('See billing & accounting')
    expect(screen.getByRole('heading', { name: SAMPLE.invoiceNumber })).toBeTruthy()
    expect(screen.getByText('Patio preparation')).toBeTruthy()
    expect(screen.getByText('$800')).toBeTruthy()
    expect(screen.getByText('$1,600')).toBeTruthy()
    expect(screen.getByText('$1,800')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Pay now/i })).toBeNull()
    click('Record payment')
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Record payment', level: 2 }))
    expect(screen.getByText('Alex’s bank transfer has arrived. Record it against this invoice.')).toBeTruthy()
    click('Cancel')
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Invoice', level: 2 }))
    expect(screen.queryByText('Paid in full')).toBeNull()
    click('Record payment'); click('Record payment')
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Invoice', level: 2 }))
    expect(screen.getByText('Paid in full')).toBeTruthy()
    expect(screen.getByText('$0 DUE')).toBeTruthy()
    click('Connect accounting software')
    fireEvent.click(screen.getByRole('radio', { name: 'Sage' }))
    expect(screen.getByText(/the next step is Sage sign-in/)).toBeTruthy()
    expect(screen.getByText('PREVIEW ONLY · NO ACCOUNT CONNECTED')).toBeTruthy()
    click('Close preview'); click('Back')
    expect(within(screen.getByRole('article', { name: "Pete's completion update" })).getByText('Patio complete and photographed.')).toBeTruthy()
    click('See billing & accounting')
    expect(screen.getByText('Paid in full')).toBeTruthy()
    expectNativeTrial()
  })

  it('keeps the journey and native signup usable when storage and analytics both fail', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    diagnostics.track.mockImplementation(() => { throw new Error('analytics unavailable') })
    render(<DemoExperience />)
    reachComposer(); postUpdate()
    expectNativeTrial()
    expectNativeTrial('Try OPS free')
    const trial = screen.getByRole('link', { name: 'Start my free trial' })
    const nativeClick = new MouseEvent('click', { bubbles: true, cancelable: true })
    let interceptedBeforeBrowser = true
    // Inspect the event after React has handled it, then stop jsdom navigation.
    window.addEventListener('click', event => {
      interceptedBeforeBrowser = event.defaultPrevented
      event.preventDefault()
    }, { once: true })
    expect(() => trial.dispatchEvent(nativeClick)).not.toThrow()
    expect(interceptedBeforeBrowser).toBe(false)
    expect(screen.getByRole('article', { name: "Pete's completion update" })).toBeTruthy()
  })

  it('keeps the saved visit usable if the photo asset fails to load', () => {
    render(<DemoExperience />)
    reachVisit(); click('Photo')
    fireEvent.error(screen.getByRole('img', { name: /Sample site visit: cracked patio/ }))
    expect(screen.getByText('Sample photo unavailable. You can continue.')).toBeTruthy()
    click('Done'); click('Complete visit')
    expect(screen.getByRole('button', { name: 'Mark approved' })).toBeTruthy()
  })

  it('does not skip a handoff on repeated activation of the same action', () => {
    render(<DemoExperience />)
    const open = screen.getByRole('button', { name: 'Open booked visit' })
    act(() => { fireEvent.click(open); fireEvent.click(open) })
    expect(screen.getByRole('button', { name: 'Start site visit' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Photo' })).toBeNull()
  })
})
