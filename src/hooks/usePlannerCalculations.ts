import { useMemo } from 'react'
import {
  addDays,
  addYears,
  differenceInDays,
  format,
  isAfter,
  isBefore,
  isValid,
  isWithinInterval,
  parseISO,
  subYears,
} from 'date-fns'
import type {
  EmptyPeriod,
  FamilyMember,
  HighlightTrip,
  MemberStats,
  Trip,
} from '@/types/planner'

export function useStayDuration(
  trips: Array<Trip>,
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

export function useEmptyDates(
  trips: Array<Trip>,
  members: Array<FamilyMember>,
) {
  return useMemo(() => {
    if (trips.length === 0 || members.length === 0) return []

    const allDates = trips
      .flatMap((trip) => [
        parseISO(trip.entryDate),
        parseISO(trip.departureDate),
      ])
      .sort((a, b) => a.getTime() - b.getTime())

    if (allDates.length === 0) return []

    const emptyPeriods: Array<EmptyPeriod> = []
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

function isWithinOneYar(start: Date, end: Date, refDay: Date): boolean {
  return (
    isAfter(end, subYears(refDay, 1)) || isBefore(start, addYears(refDay, 1))
  )
}

export function useMemberStats(
  members: Array<FamilyMember>,
  trips: Array<Trip>,
  yearLimit: number,
): Array<MemberStats> {
  return useMemo(() => {
    const today = new Date()

    return members.map((member) => {
      const memberTripsSorted = trips
        .filter((t) => t.memberId === member.id)
        .sort(
          (a, b) =>
            parseISO(a.entryDate).getTime() - parseISO(b.entryDate).getTime(),
        )

      const currentTrip = memberTripsSorted.find((trip) => {
        const start = parseISO(trip.entryDate)
        const end = parseISO(trip.departureDate)
        return isWithinInterval(today, { start, end })
      })

      const futureTrips = memberTripsSorted.filter((trip) =>
        isAfter(parseISO(trip.entryDate), today),
      )

      const oneYearAgo = subYears(today, 1)

      const highlightTrips: Array<HighlightTrip> = []

      for (let i = 0; i < memberTripsSorted.length; i++) {
        const trip = memberTripsSorted[i]

        const start = parseISO(trip.entryDate)
        const end = parseISO(trip.departureDate)

        if (!isWithinOneYar(start, end, today)) {
          continue
        }

        let daysInYear = 0

        const refDate = addYears(start, 1)

        for (
          let testIndex = i;
          testIndex < memberTripsSorted.length;
          testIndex++
        ) {
          const testTrip = memberTripsSorted[testIndex]

          const testTripStart = parseISO(testTrip.entryDate)
          const testTripEnd = parseISO(testTrip.departureDate)

          if (isAfter(testTripStart, refDate)) {
            // more than one year later, break early
            break
          }

          const overlapStart = isBefore(testTripStart, refDate)
            ? testTripStart
            : refDate
          const overlapEnd = isAfter(testTripEnd, refDate)
            ? refDate
            : testTripEnd

          if (
            isBefore(overlapStart, overlapEnd) ||
            overlapStart.getTime() === overlapEnd.getTime()
          ) {
            daysInYear += differenceInDays(overlapEnd, overlapStart) + 1
          }
        }

        highlightTrips.push({
          trip,
          refDate: format(refDate, 'yyyy-MM-dd'),
          daysInYear,
          isOverLimit: daysInYear > yearLimit,
        })
      }

      const activeWarnings: Array<string> = []
      // member.warnings
      //   .filter((w) => w.enabled)
      //   .forEach((warning) => {
      //     if (warning.type === 'stay-limit' && warning.criteria.limit) {
      //       if (daysInYear >= warning.criteria.limit) {
      //         activeWarnings.push(warning.criteria.message)
      //       }
      //     }
      //   })

      return {
        memberId: member.id,
        name: member.name,
        color: member.color,
        currentStatus: currentTrip ? 'present' : 'away',
        nextTrip: futureTrips[0],
        activeWarnings,
        highlightTrips,
      }
    })
  }, [members, trips, yearLimit])
}
