import { useReducer } from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CharacterCard } from '@/components/demo/CharacterCard'
import { FeatureCallout } from '@/components/demo/FeatureCallout'
import { RoleScenes } from '@/components/demo/RoleScenes'
import { VisitScenes } from '@/components/demo/VisitScenes'
import { ProjectScenes } from '@/components/demo/ProjectScenes'
import { SAMPLE, money } from '@/components/demo/lifecycle-data'
import {
  initialLifecycleState,
  lifecycleReducer,
  type LifecycleAction,
  type LifecycleState,
  type VisitAssignee,
} from '@/components/demo/lifecycle-state'

afterEach(cleanup)

function advance(actions: LifecycleAction[], start = initialLifecycleState()) {
  return actions.reduce((state, action) => {
    const next = lifecycleReducer(state, action)
    return next.cutscene ? lifecycleReducer(next, { type: 'SKIP_CUTSCENE' }) : next
  }, start)
}

function fixtureReducer(state: LifecycleState, action: LifecycleAction) {
  return advance([action], state)
}

function assignedVisit(member: VisitAssignee) {
  return advance([
    { type: 'SELECT_ROLE', role: 'operator' },
    { type: 'OPEN_BOOKING' },
    { type: 'ASSIGN_VISIT', member },
  ])
}

function preparedEstimate(member: 'Mike' | 'Nick' = 'Mike') {
  return advance([{ type: 'COMPLETE_VISIT' }], assignedVisit(member))
}

function VisitHarness({ initial }: { initial: LifecycleState }) {
  const [state, dispatch] = useReducer(lifecycleReducer, initial)
  return <>
    <VisitScenes state={state} dispatch={dispatch} />
    <output data-testid="sample-state">{JSON.stringify(state)}</output>
  </>
}

function CrewProjectHarness() {
  const [state, dispatch] = useReducer(fixtureReducer, advance([{ type: 'SELECT_ROLE', role: 'crew' }]))
  return <ProjectScenes state={state} dispatch={dispatch} />
}

function currentState(): LifecycleState {
  return JSON.parse(screen.getByTestId('sample-state').textContent ?? '{}')
}

function click(name: string) {
  fireEvent.click(screen.getByRole('button', { name }))
}

describe('role choice and assignment cards', () => {
  it('describes role responsibilities with symbols, without portraits or fictional history', () => {
    const dispatch = vi.fn()
    const { container } = render(<RoleScenes state={initialLifecycleState()} dispatch={dispatch} />)
    expect(screen.getByRole('heading', { name: 'Your side of the team.' })).toBeTruthy()
    for (const name of ['Choose Operator', 'Choose Crew']) {
      const card = screen.getByRole('button', { name })
      expect(card.querySelector('svg[aria-hidden="true"]')).not.toBeNull()
      expect(card.querySelector('img')).toBeNull()
      expect(card.textContent).not.toMatch(/jobs completed|most assigned|avg\.|sample work history/i)
    }
    expect(container.querySelectorAll('[data-demo-next="true"]')).toHaveLength(1)
    expect(screen.getByText('Manage leads and estimates')).toBeTruthy()
    expect(screen.getByText('Share photos and updates')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Choose Operator', description: /Run the business.*Manage leads and estimates.*Assign visits and crew.*See progress and job updates/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Choose Crew', description: /Know the job.*See assigned work and site details.*Complete tasks.*Share photos and updates/ })).toBeTruthy()
    click('Choose Operator')
    expect(dispatch).toHaveBeenLastCalledWith({ type: 'SELECT_ROLE', role: 'operator' })
    click('Choose Crew')
    expect(dispatch).toHaveBeenLastCalledWith({ type: 'SELECT_ROLE', role: 'crew' })
  })

  it('reserves sample work history for team selection and keeps compact identity cards concise', () => {
    const onSelect = vi.fn()
    const result = render(<CharacterCard name="Mike" onSelect={onSelect} />)
    const card = screen.getByRole('button', { name: 'Select Mike' })
    expect(within(card).getByRole('img', { name: 'Mike' })).toBeTruthy()
    expect(within(card).getByText('Jobs completed')).toBeTruthy()
    expect(within(card).getByText('Most assigned')).toBeTruthy()
    expect(within(card).getByText('Avg. site visit')).toBeTruthy()
    expect(within(card).getByText('Sample work history')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Select Mike', description: /Estimator.*Sample work history.*Jobs completed.*48.*Most assigned.*Site visits.*Avg\. site visit.*42 min/ })).toBe(card)
    fireEvent.click(card)
    expect(onSelect).toHaveBeenCalledOnce()

    result.rerender(<CharacterCard name="Nick" compact />)
    const identity = screen.getByRole('article', { name: 'Nick' })
    expect(within(identity).getByRole('img', { name: 'Nick' })).toBeTruthy()
    expect(within(identity).getByText('Crew lead')).toBeTruthy()
    expect(within(identity).queryByText('Jobs completed')).toBeNull()
    expect(within(identity).queryByText('Sample work history')).toBeNull()
    expect(screen.getByRole('article', { name: 'Nick', description: 'Crew lead' })).toBe(identity)
  })

  it('keeps card descriptions unique between repeated cards and stable across selection changes', () => {
    const onSelect = vi.fn()
    const result = render(<><CharacterCard name="Mike" onSelect={onSelect} /><CharacterCard name="Mike" compact /></>)
    const selectable = screen.getByRole('button', { name: 'Select Mike' })
    const descriptionIds = selectable.getAttribute('aria-describedby')
    const compactIds = screen.getByRole('article', { name: 'Mike' }).getAttribute('aria-describedby')
    expect(descriptionIds).not.toBe(compactIds)
    const allIds = [...(descriptionIds ?? '').split(' '), ...(compactIds ?? '').split(' ')]
    expect(new Set(allIds).size).toBe(allIds.length)
    for (const id of allIds) expect(document.getElementById(id)).not.toBeNull()
    result.rerender(<><CharacterCard name="Mike" selected onSelect={onSelect} /><CharacterCard name="Mike" compact /></>)
    expect(screen.getByRole('button', { name: 'Select Mike' }).getAttribute('aria-describedby')).toBe(descriptionIds)
  })
})

describe('task completion and project status', () => {
  it('keeps the project in progress when a crew member completes their assigned task', () => {
    render(<CrewProjectHarness />)
    fireEvent.click(screen.getByRole('tab', { name: 'details' }))
    const projectStatus = screen.getByText('Status', { selector: 'dt' }).nextElementSibling
    expect(projectStatus?.textContent).toBe('In progress')
    click('Complete')
    expect(screen.getByText('Task complete')).toBeTruthy()
    const task = screen.getByRole('button', { name: 'Open resurfacing task' })
    expect(within(task).getByText('Complete')).toBeTruthy()
    expect(projectStatus?.textContent).toBe('In progress')
    expect(screen.getByRole('button', { name: 'Post a photo update' })).toBeTruthy()
  })
})

describe('feature availability', () => {
  it('distinguishes the accounting beta and its free access request from OPS Spec', () => {
    const result = render(<FeatureCallout kind="accounting" />)
    const callout = screen.getByRole('note', { name: 'Accounting beta availability' })
    expect(within(callout).getByText('OPS ACCOUNTING — BETA TESTING')).toBeTruthy()
    expect(within(callout).getByText('Sending estimates, invoicing and accounting are in beta testing.')).toBeTruthy()
    expect(within(callout).getByRole('link', { name: 'Request free beta access' }).getAttribute('href'))
      .toBe('mailto:jack@opsapp.co?subject=Request%20free%20accounting%20beta%20access')
    expect(within(callout).getByText('Opens an email request')).toBeTruthy()

    result.rerender(<FeatureCallout kind="spec" />)
    const spec = screen.getByRole('note', { name: 'OPS Spec custom tool availability' })
    expect(within(spec).getByText('OPS SPEC CUSTOM TOOL')).toBeTruthy()
    expect(spec.textContent).toContain('Available separately from standard OPS features.')
    expect(within(spec).queryByRole('link', { name: 'Request free beta access' })).toBeNull()
  })
})

describe('visits keep the visitor in their chosen role', () => {
  it.each(['Mike', 'Nick'] as const)('attributes the delegated visit to %s and offers review rather than capture', (member) => {
    render(<VisitHarness initial={assignedVisit(member)} />)
    expect(screen.getByRole('img', { name: member })).toBeTruthy()
    expect(screen.getByText(`${member} completed the site visit. Your record is ready to review.`)).toBeTruthy()
    expect(screen.getByText(`Site visit · ${member}`)).toBeTruthy()
    expect(screen.queryByRole('checkbox')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Photo' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Complete visit' })).toBeNull()
    click('Review estimate')
    expect(currentState()).toMatchObject({ role: 'operator', scene: 'estimate', visitAssignee: member })
    expect(screen.getByText(`${member} has prepared the sample quote. Review the scope and send it to Alex.`)).toBeTruthy()
  })

  it('requires scope confirmation and a photo before a self-assigned visit can be reviewed', () => {
    const { container } = render(<VisitHarness initial={assignedVisit('You')} />)
    const done = screen.getByRole('button', { name: 'Done' }) as HTMLButtonElement
    const scope = screen.getByRole('checkbox', { name: 'Confirm the deck scope with Alex' })
    expect(done.disabled).toBe(true)
    expect(container.querySelectorAll('[data-demo-next="true"]')).toHaveLength(1)
    expect(scope.closest('[data-demo-next="true"]')).not.toBeNull()

    // Adding the photo first must not bypass the checklist requirement.
    click('Photo')
    expect(done.disabled).toBe(true)
    fireEvent.click(scope)
    expect(done.disabled).toBe(false)
    expect(Array.from(container.querySelectorAll('[data-demo-next="true"]'))).toEqual([done])
    fireEvent.click(scope)
    expect(done.disabled).toBe(true)
    fireEvent.click(scope)
    click('Done')
    expect(screen.getByText('Site visit · You')).toBeTruthy()
    click('Complete visit')
    expect(currentState()).toMatchObject({ role: 'operator', scene: 'estimate', visitCompleted: true, visitAssignee: 'You' })
    expect(screen.queryByText(/Mike has prepared/)).toBeNull()
  })
})

describe('estimate beta and the optional custom tool', () => {
  it('keeps beta disclosure out of estimate screens and waits for incoming acceptance', () => {
    render(<VisitHarness initial={preparedEstimate()} />)
    expect(screen.queryByRole('note', { name: 'Accounting beta availability' })).toBeNull()
    expect(screen.getByText('Draft')).toBeTruthy()
    click('Send estimate')
    expect(currentState()).toMatchObject({ role: 'operator', scene: 'accepted', estimateSent: true, estimateApproved: false })
    expect(screen.getByText('Sample timeline · Wednesday morning')).toBeTruthy()
    expect(screen.getByText('Sent')).toBeTruthy()
    expect(screen.queryByRole('note', { name: 'Accounting beta availability' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Mark approved' })).toBeNull()
  })

  it('updates drawing dimensions and sample quantities without changing the prepared quote', () => {
    const totalBefore = SAMPLE.total
    render(<VisitHarness initial={preparedEstimate()} />)
    click('Explore custom tool')
    expect(screen.getByRole('note', { name: 'OPS Spec custom tool availability' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Send estimate' })).toBeNull()
    const shapes = new Set<string>()
    for (const [width, area, boards] of [[12, 144, 20], [16, 192, 27], [20, 240, 33]]) {
      click(`${width} ft`)
      expect(currentState().deckWidth).toBe(width)
      const drawing = screen.getByRole('img', { name: `${width} by 12 foot sample deck` })
      shapes.add(Array.from(drawing.querySelectorAll('polygon')).map(polygon => polygon.getAttribute('points')).join('|'))
      expect(screen.getByText('Deck area').nextElementSibling?.textContent).toBe(`${area}sq ft`)
      expect(screen.getByText('Sample board order').nextElementSibling?.textContent).toBe(`${boards}16 ft boards`)
      expect(screen.getByRole('button', { name: `${width} ft` }).getAttribute('aria-pressed')).toBe('true')
    }
    expect(shapes.size).toBe(3)
    fireEvent.click(screen.getByText('Sample takeoff assumptions'))
    expect(screen.getByText(/Fixed 12 ft depth/)).toBeTruthy()
    expect(screen.getByText(/Changing the drawing does not change the quote/)).toBeTruthy()
    fireEvent.click(screen.getAllByRole('button', { name: 'Return to estimate' })[1])
    expect(SAMPLE.total).toBe(totalBefore)
    expect(screen.getAllByText(money(totalBefore))).toHaveLength(2)
    expect(currentState()).toMatchObject({ scene: 'estimate', estimateSent: false, deckWidth: 20 })
  })

  it('supports Escape and restores keyboard focus to the custom tool trigger', () => {
    render(<VisitHarness initial={preparedEstimate()} />)
    click('Explore custom tool')
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Deck designer' }))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('region', { name: 'Deck designer preview' })).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Explore custom tool' }))
    expect(currentState()).toMatchObject({ scene: 'estimate', estimateSent: false })
  })
})
