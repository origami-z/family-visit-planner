import { useMemo } from 'react'
import {
  differenceInDays,
  parseISO,
  isWithinInterval,
  isBefore,
  isAfter,
  addDays,
  subYears,
  format,
  isValid,
} from 'date-fns'
import { Trip, FamilyMember, EmptyPeriod, MemberStats } from '@/types/planner'

export function useStayDuration(
  trips: Trip[],
  memberId: string,
  referenceDate: Date = new Date(),
) {
  return useMemo(() => {
    const oneYearAgo = subYears(referenceDate, 1)
    const memberTrips = trips.filter((t) => t.memberId === memberId)

    let totalDays = 0

    memberTrips.forEach((trip) => {
      const start = parseISO(trip.entryDate)
      const end = parseISO(trip.departureDate)

      const overlapStart = isBefore(start, oneYearAgo) ? oneYearAgo : start
      const overlapEnd = isAfter(end, referenceDate) ? referenceDate : end

      if (
        isBefore(overlapStart, overlapEnd) ||
        overlapStart.getTime() === overlapEnd.getTime()
      ) {
        totalDays += differenceInDays(overlapEnd, overlapStart) + 1
      }
    })

    return totalDays
  }, [trips, memberId, referenceDate])
}

export function useEmptyDates(trips: Trip[], members: FamilyMember[]) {
  return useMemo(() => {
    if (trips.length === 0 || members.length === 0) return []

    const allDates = trips
      .flatMap((trip) => [
        parseISO(trip.entryDate),
        parseISO(trip.departureDate),
      ])
      .sort((a, b) => a.getTime() - b.getTime())

    if (allDates.length === 0) return []

    const emptyPeriods: EmptyPeriod[] = []
    const minDate = allDates[0]
    const maxDate = allDates[allDates.length - 1]

    let currentDate = minDate

    while (
      isBefore(currentDate, maxDate) ||
      currentDate.getTime() === maxDate.getTime()
    ) {
      const hasFamily = trips.some((trip) => {
        const start = parseISO(trip.entryDate)
        const end = parseISO(trip.departureDate)
        return isWithinInterval(currentDate, { start, end })
      })

      if (!hasFamily) {
        const periodStart = currentDate
        let periodEnd = currentDate

        currentDate = addDays(currentDate, 1)
        while (
          isBefore(currentDate, maxDate) ||
          currentDate.getTime() === maxDate.getTime()
        ) {
          const stillEmpty = !trips.some((trip) => {
            const start = parseISO(trip.entryDate)
            const end = parseISO(trip.departureDate)
            return isWithinInterval(currentDate, { start, end })
          })

          if (stillEmpty) {
            periodEnd = currentDate
            currentDate = addDays(currentDate, 1)
          } else {
            break
          }
        }

        emptyPeriods.push({
          startDate: format(periodStart, 'yyyy-MM-dd'),
          endDate: format(periodEnd, 'yyyy-MM-dd'),
          duration: differenceInDays(periodEnd, periodStart) + 1,
        })
      } else {
        currentDate = addDays(currentDate, 1)
      }
    }

    return emptyPeriods
  }, [trips, members])
}

export function useMemberStats(
  members: FamilyMember[],
  trips: Trip[],
  yearLimit: number,
  referenceDate: string,
): MemberStats[] {
  const refDayParsed = parseISO(referenceDate)
  return useMemo(() => {
    const refDay = isValid(refDayParsed) ? refDayParsed : new Date()
    console.log('refDay', refDay)

    return members.map((member) => {
      const memberTrips = trips
        .filter((t) => t.memberId === member.id)
        .sort(
          (a, b) =>
            parseISO(a.entryDate).getTime() - parseISO(b.entryDate).getTime(),
        )

      const currentTrip = memberTrips.find((trip) => {
        const start = parseISO(trip.entryDate)
        const end = parseISO(trip.departureDate)
        return isWithinInterval(refDay, { start, end })
      })

      const futureTrips = memberTrips.filter((trip) =>
        isAfter(parseISO(trip.entryDate), refDay),
      )

      const oneYearAgo = subYears(refDay, 1)
      let daysInYear = 0

      memberTrips.forEach((trip) => {
        const start = parseISO(trip.entryDate)
        const end = parseISO(trip.departureDate)

        const overlapStart = isBefore(start, oneYearAgo) ? oneYearAgo : start
        const overlapEnd = isAfter(end, refDay) ? refDay : end

        if (
          isBefore(overlapStart, overlapEnd) ||
          overlapStart.getTime() === overlapEnd.getTime()
        ) {
          daysInYear += differenceInDays(overlapEnd, overlapStart) + 1
        }
      })

      const activeWarnings: string[] = []
      member.warnings
        .filter((w) => w.enabled)
        .forEach((warning) => {
          if (warning.type === 'stay-limit' && warning.criteria.limit) {
            if (daysInYear >= warning.criteria.limit) {
              activeWarnings.push(warning.criteria.message)
            }
          }
        })

      return {
        memberId: member.id,
        name: member.name,
        color: member.color,
        currentStatus: currentTrip ? 'present' : 'away',
        daysInYear,
        isOverLimit: daysInYear > yearLimit,
        nextTrip: futureTrips[0],
        activeWarnings,
      }
    })
  }, [members, trips, yearLimit, refDayParsed])
}
