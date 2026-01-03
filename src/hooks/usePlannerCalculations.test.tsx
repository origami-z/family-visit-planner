/* @vitest-environment jsdom */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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
})
