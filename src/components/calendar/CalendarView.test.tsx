/* @vitest-environment jsdom */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { format } from 'date-fns'
import { CalendarView } from './CalendarView'
import { FamilyPlannerProvider } from '@/context/FamilyPlannerContext'

const STORAGE_KEY = 'family-planner-data'

// Mock the current date to ensure consistent test results
vi.setSystemTime(new Date('2026-01-15'))

describe('CalendarView', () => {
  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY)
  })

  it('displays trip tooltip with member names and dates on hover', async () => {
    const user = userEvent.setup()
    const member1 = { id: 'm1', name: 'Alice', color: '#ff0000', warnings: [] }
    const member2 = { id: 'm2', name: 'Bob', color: '#00ff00', warnings: [] }
    const trip = {
      id: 't1',
      memberIds: ['m1', 'm2'],
      entryDate: '2026-01-10',
      departureDate: '2026-01-20',
    }

    const state = {
      members: [member1, member2],
      trips: [trip],
      globalSettings: {
        warnings: { enabled: true, rules: [] },
        yearLimit: 180,
      },
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

    render(
      <FamilyPlannerProvider>
        <CalendarView />
      </FamilyPlannerProvider>,
    )

    // Find a trip trigger element (Alice's name on the calendar)
    const aliceTriggers = screen.getAllByText('Alice')
    expect(aliceTriggers.length).toBeGreaterThan(0)

    // Hover over the first trip element to show tooltip
    await user.hover(aliceTriggers[0])

    // Verify tooltip content shows the dates
    expect(await screen.findByText(/Jan 10, 2026/)).toBeTruthy()
    expect(screen.getByText(/Jan 20, 2026/)).toBeTruthy()

    // Verify tooltip content shows all member names
    expect(screen.getByText('Alice, Bob')).toBeTruthy()
  })

  it('displays trip notes in tooltip when notes exist', async () => {
    const user = userEvent.setup()
    const member = { id: 'm1', name: 'Charlie', color: '#0000ff', warnings: [] }
    const trip = {
      id: 't1',
      memberIds: ['m1'],
      entryDate: '2026-01-10',
      departureDate: '2026-01-20',
      notes: 'Business trip to NYC',
    }

    const state = {
      members: [member],
      trips: [trip],
      globalSettings: {
        warnings: { enabled: true, rules: [] },
        yearLimit: 180,
      },
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

    render(
      <FamilyPlannerProvider>
        <CalendarView />
      </FamilyPlannerProvider>,
    )

    // Find and hover over the trip element
    const charlieTriggers = screen.getAllByText('Charlie')
    await user.hover(charlieTriggers[0])

    // Verify tooltip shows the notes
    expect(await screen.findByText('Business trip to NYC')).toBeTruthy()
  })

  it('does not display notes section in tooltip when trip has no notes', async () => {
    const user = userEvent.setup()
    const member = { id: 'm1', name: 'Diana', color: '#ff00ff', warnings: [] }
    const trip = {
      id: 't1',
      memberIds: ['m1'],
      entryDate: '2026-01-10',
      departureDate: '2026-01-20',
    }

    const state = {
      members: [member],
      trips: [trip],
      globalSettings: {
        warnings: { enabled: true, rules: [] },
        yearLimit: 180,
      },
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

    render(
      <FamilyPlannerProvider>
        <CalendarView />
      </FamilyPlannerProvider>,
    )

    // Find and hover over the trip element
    const dianaTriggers = screen.getAllByText('Diana')
    await user.hover(dianaTriggers[0])

    // Wait for tooltip to appear - use findAllByText since trip spans multiple days
    const dateElements = await screen.findAllByText(/Jan 10, 2026/)
    expect(dateElements.length).toBeGreaterThan(0)

    // Verify member name is shown in tooltip
    const tooltipMemberNames = screen.getAllByText('Diana', { selector: 'div' })
    expect(tooltipMemberNames.length).toBeGreaterThan(0)
  })

  it('displays correct formatted dates in tooltip', async () => {
    const user = userEvent.setup()
    const member = { id: 'm1', name: 'Eve', color: '#ffff00', warnings: [] }
    const trip = {
      id: 't1',
      memberIds: ['m1'],
      entryDate: '2026-01-05',
      departureDate: '2026-01-25',
    }

    const state = {
      members: [member],
      trips: [trip],
      globalSettings: {
        warnings: { enabled: true, rules: [] },
        yearLimit: 180,
      },
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

    render(
      <FamilyPlannerProvider>
        <CalendarView />
      </FamilyPlannerProvider>,
    )

    // Find and hover over the trip element
    const eveTriggers = screen.getAllByText('Eve')
    await user.hover(eveTriggers[0])

    // Verify dates are formatted as "MMM d, yyyy"
    const expectedEntryDate = format(new Date('2026-01-05'), 'MMM d, yyyy')
    const expectedDepartureDate = format(new Date('2026-01-25'), 'MMM d, yyyy')

    expect(await screen.findByText(new RegExp(expectedEntryDate))).toBeTruthy()
    expect(screen.getByText(new RegExp(expectedDepartureDate))).toBeTruthy()
  })
})
