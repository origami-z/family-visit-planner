/* @vitest-environment jsdom */

import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { addDays, format, parseISO } from 'date-fns'
import { DashboardView } from './DashboardView'
import { FamilyPlannerProvider } from '@/context/FamilyPlannerContext'

const STORAGE_KEY = 'family-planner-data'

describe('DashboardView', () => {
  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY)
  })

  it("shows 'leaving' date when a member is currently present", () => {
    const today = new Date()
    const member = { id: 'm1', name: 'Jane', color: '#000', warnings: [] }
    const trip = {
      id: 't1',
      memberIds: ['m1'],
      entryDate: format(today, 'yyyy-MM-dd'),
      departureDate: format(addDays(today, 2), 'yyyy-MM-dd'),
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
        <DashboardView />
      </FamilyPlannerProvider>,
    )

    // Ensure 'Currently present' is rendered
    expect(screen.getByText(/Currently present/)).toBeTruthy()

    // Ensure 'leaving: <MMM d>' is rendered somewhere within the member block
    const expectedShort = format(parseISO(trip.departureDate), 'MMM d')
    const nameNode = screen.getByText(member.name)
    expect(nameNode.parentElement?.textContent).toContain(
      `leaving: ${expectedShort}`,
    )
  })
})
