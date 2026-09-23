import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { CalendarWorkday } from '@/components/demo/CalendarWorkday'

afterEach(cleanup)

function currentDate(container: HTMLElement) {
  const dates = container.querySelectorAll('time[aria-current="date"]')
  expect(dates).toHaveLength(1)
  expect(container.querySelectorAll('li[data-today="true"]')).toHaveLength(1)
  expect(dates[0].closest('li')?.getAttribute('data-today')).toBe('true')
  return dates[0]
}

function task(title: string) {
  const card = screen.getByText(title).closest('article')
  expect(card).not.toBeNull()
  return within(card as HTMLElement)
}

describe('calendar workday progression', () => {
  it('advances one photo-free schedule from Wednesday preparation through Thursday completion in place', () => {
    const view = render(<CalendarWorkday index={0} crew={['Pete', 'Nick']} reduced={false} paused={false} />)

    expect(screen.getByRole('region', { name: 'Schedule for Wednesday, September 23' })).toBeTruthy()
    expect(currentDate(view.container).textContent).toContain('WED')
    expect(currentDate(view.container).textContent).toContain('23')
    expect(task('Deck preparation').getByText('In progress')).toBeTruthy()
    expect(screen.getByText('NEXT · THU SEP 24')).toBeTruthy()
    expect(screen.getByText('0 OF 2 TASKS COMPLETE')).toBeTruthy()
    expect(view.container.querySelector('img')).toBeNull()

    view.rerender(<CalendarWorkday index={1} crew={['Pete', 'Nick']} reduced={false} paused={false} />)

    expect(screen.getByRole('region', { name: 'Schedule for Thursday, September 24' })).toBeTruthy()
    expect(currentDate(view.container).textContent).toContain('THU')
    expect(currentDate(view.container).textContent).toContain('24')
    expect(task('Deck preparation').getByText('Completed')).toBeTruthy()
    expect(task('Deck resurfacing').getByText('In progress')).toBeTruthy()
    expect(screen.getByText('Wednesday · completed · Mike')).toBeTruthy()
    expect(screen.getByText('1 OF 2 TASKS COMPLETE')).toBeTruthy()
    const thursdayPage = screen.getByRole('heading', { name: 'Thursday', level: 3 }).closest('section')
    expect(thursdayPage).not.toBeNull()

    view.rerender(<CalendarWorkday index={2} crew={['Pete', 'Nick']} reduced={false} paused={false} complete />)

    expect(screen.getByRole('heading', { name: 'Thursday', level: 3 }).closest('section')).toBe(thursdayPage)
    expect(task('Deck preparation').getByText('Completed')).toBeTruthy()
    expect(task('Deck resurfacing').getByText('Completed')).toBeTruthy()
    expect(screen.getByText('CREW · Pete + Nick')).toBeTruthy()
    expect(screen.getByText('2 OF 2 TASKS COMPLETE')).toBeTruthy()
    expect(currentDate(view.container).textContent).toContain('24')
    expect(view.container.querySelector('img')).toBeNull()
  })
})
