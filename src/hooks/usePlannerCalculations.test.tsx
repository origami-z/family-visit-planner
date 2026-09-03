/* @vitest-environment jsdom */

import { render, screen } from '@testing-library/react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { addDays, format } from 'date-fns'
import { useMemberStats } from './usePlannerCalculations'

function TestComponent({ members, trips, yearLimit }: any) {
  const stats = useMemberStats(members, trips, yearLimit)
  return (
    <div data-testid="output">
      {stats[0]?.currentTrip?.departureDate ?? 'none'}
    </div>
  )
}

function HighlightsComponent({ members, trips, yearLimit }: any) {
  const stats = useMemberStats(members, trips, yearLimit)
  return (
    <ul data-testid="highlights">
      {stats[0]?.highlightTrips.map((h) => (
        <li key={h.trip.id}>
          {h.trip.id}:{h.daysInYear}:{h.refDate}
        </li>
      ))}
    </ul>
  )
}

describe('useMemberStats', () => {
  it('returns currentTrip when a trip overlaps today', () => {
    const today = new Date()
    const member = {
      id: 'm1',
      name: 'Test Member',
      color: '#000',
      warnings: [],
    }
    const trip = {
      id: 't1',
      memberIds: ['m1'],
      entryDate: format(today, 'yyyy-MM-dd'),
      departureDate: format(addDays(today, 2), 'yyyy-MM-dd'),
    }

    render(<TestComponent members={[member]} trips={[trip]} yearLimit={180} />)

    const output = screen.getByTestId('output')
    expect(output.textContent).toBe(trip.departureDate)
  })

  describe('rolling year highlights', () => {
    beforeAll(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-09-03'))
    })

    afterAll(() => {
      vi.useRealTimers()
    })

    it('reports the worse of the forward/backward rolling-year windows for a trailing trip', () => {
      // Regression test: a trip with no later trips must still be checked
      // against the 1-year window ending on its own departure date, so it
      // picks up earlier trips that fall inside that trailing year, not
      // just the (empty) year following its own entry date.
      const member = {
        id: 'm1',
        name: 'Test Member',
        color: '#000',
        warnings: [],
      }
      const trips = [
        {
          id: 't1',
          memberIds: ['m1'],
          entryDate: '2025-10-17',
          departureDate: '2026-01-16',
        },
        {
          id: 't2',
          memberIds: ['m1'],
          entryDate: '2026-06-12',
          departureDate: '2026-09-04',
        },
        {
          id: 't3',
          memberIds: ['m1'],
          entryDate: '2026-11-06',
          departureDate: '2027-02-05',
        },
      ]

      render(
        <HighlightsComponent
          members={[member]}
          trips={trips}
          yearLimit={180}
        />,
      )

      const items = screen.getByTestId('highlights').textContent
      // t1: forward window [Oct 17 2025, Oct 17 2026] catches t1 + t2 = 177 days
      expect(items).toContain('t1:177:2026-10-17')
      // t2: forward window [Jun 12 2026, Jun 12 2027] catches t2 + t3 = 177 days
      expect(items).toContain('t2:177:2027-06-12')
      // t3: forward window alone only catches t3 (92 days); the backward
      // window [Feb 6 2026, Feb 5 2027] catches t2 + t3 = 177 days, which
      // is worse and must be the one reported.
      expect(items).toContain('t3:177:2027-02-05')
    })
  })
})
