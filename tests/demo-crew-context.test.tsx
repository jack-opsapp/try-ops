import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProjectScenes } from '@/components/demo/ProjectScenes'
import { SAMPLE } from '@/components/demo/lifecycle-data'
import { initialLifecycleState, lifecycleReducer, type LifecycleAction, type LifecycleState } from '@/components/demo/lifecycle-state'

const dialogMethods = ['showModal','close'] as const
const originalDialogMethods = dialogMethods.map(name => Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, name))
afterEach(() => {
  cleanup(); vi.restoreAllMocks()
  dialogMethods.forEach((name, index) => {
    const original = originalDialogMethods[index]
    if (original) Object.defineProperty(HTMLDialogElement.prototype, name, original)
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name)
  })
})
function advance(actions: LifecycleAction[], start = initialLifecycleState()) {
  return actions.reduce((state, action) => {
    const next = lifecycleReducer(state, action)
    return next.cutscene ? lifecycleReducer(next, { type:'SKIP_CUTSCENE' }) : next
  }, start)
}
function project() {
  return advance([{type:'SELECT_ROLE',role:'operator'},{type:'OPEN_BOOKING'},{type:'ASSIGN_VISIT',member:'Mike'},{type:'COMPLETE_VISIT'},{type:'SEND_ESTIMATE'}])
}
function show(state: LifecycleState) { return render(<ProjectScenes state={state} dispatch={vi.fn()} />) }

describe('prepared crew context', () => {
  it('provides distinct instructions in both tasks without showing future crew messages', () => {
    show(project())
    expect(screen.queryByRole('article', {name:'Mike’s crew handoff'})).toBeNull()
    fireEvent.click(screen.getByRole('tab', {name:'details'}))
    fireEvent.click(screen.getByRole('button', {name:'Open preparation task'}))
    for (const note of SAMPLE.preparationNotes) expect(screen.getByText(note)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', {name:'Open resurfacing task'}))
    for (const note of SAMPLE.resurfacingNotes) expect(screen.getByText(note)).toBeTruthy()
    expect(screen.getByRole('button', {name:'Assign team to this task'})).toBeTruthy()
  })

  it.each(['Pete','Nick'] as const)('addresses the selected crew member %s and keeps original photo counts', member => {
    const complete = advance([{type:'ASSIGN_CREW',members:[member]},{type:'OPEN_COMPLETED_PROJECT'}], project())
    show(complete)
    const handoff = screen.getByRole('article', {name:'Mike’s crew handoff'})
    expect(within(handoff).getByText(`@${member}`)).toBeTruthy()
    expect(within(screen.getByRole('article', {name:`${member}'s completion update`})).getByText('@Mike')).toBeTruthy()
    expect(screen.getByText('2 photos')).toBeTruthy()
    expect(screen.getByRole('button', {name:'Open marked-up site photo'})).toBeTruthy()
  })

  it('shows Crew a teammate’s handoff without inventing a reply from the visitor', () => {
    show(advance([{type:'SELECT_ROLE',role:'crew'}]))
    expect(within(screen.getByRole('article', {name:'Mike’s crew handoff'})).getByText('@You')).toBeTruthy()
    expect(screen.queryByRole('article', {name:'Your completion update'})).toBeNull()
    expect(screen.getByRole('button', {name:'Complete'})).toBeTruthy()
  })

  it('opens a labelled annotation viewer and returns focus to its attachment', () => {
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {configurable:true,value:function(this: HTMLDialogElement) { this.open = true }})
    Object.defineProperty(HTMLDialogElement.prototype, 'close', {configurable:true,value:function(this: HTMLDialogElement) { this.open = false; this.dispatchEvent(new Event('close')) }})
    show(advance([{type:'SELECT_ROLE',role:'crew'}]))
    const opener = screen.getByRole('button', {name:'Open marked-up site photo'})
    fireEvent.click(opener)
    const viewer = screen.getByRole('dialog', {name:'Marked-up site photo'})
    expect(within(viewer).getByText(/Replace the circled front fascia/)).toBeTruthy()
    fireEvent.click(within(viewer).getByRole('button', {name:'Close photo'}))
    expect(document.activeElement).toBe(opener)
  })
})
