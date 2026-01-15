import { useState } from 'react'
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
} from '@tabler/icons-react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  parseISO,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { TripDialog } from './TripDialog'
import type { Trip } from '@/types/planner'
import { useFamilyPlanner } from '@/context/FamilyPlannerContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function CalendarView() {
  const { state } = useFamilyPlanner()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [yearViewStartDate, setYearViewStartDate] = useState(new Date())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  const handleYearViewPrevMonth = () =>
    setYearViewStartDate(subMonths(yearViewStartDate, 1))
  const handleYearViewNextMonth = () =>
    setYearViewStartDate(addMonths(yearViewStartDate, 1))

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getTripsForDay = (date: Date) => {
    return state.trips.filter((trip) => {
      const start = parseISO(trip.entryDate)
      const end = parseISO(trip.departureDate)
      return isWithinInterval(date, { start, end })
    })
  }

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingTrip(null)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Calendar</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <IconPlus className="h-4 w-4 mr-2" />
          Add Trip
        </Button>
      </div>

      <Tabs defaultValue="month">
        <TabsList>
          <TabsTrigger value="month">Monthly View</TabsTrigger>
          <TabsTrigger value="year">Yearly View</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={handlePrevMonth}
                  >
                    <IconChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={handleNextMonth}
                  >
                    <IconChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                // Build calendar grid with empty cells for padding
                const calendarDays: Array<Date | null> = [
                  ...Array.from({ length: monthStart.getDay() }).map(
                    () => null,
                  ),
                  ...daysInMonth,
                ]
                // Pad end to complete the last week
                while (calendarDays.length % 7 !== 0) {
                  calendarDays.push(null)
                }

                // Group into weeks
                const weeks: Array<Array<Date | null>> = []
                for (let i = 0; i < calendarDays.length; i += 7) {
                  weeks.push(calendarDays.slice(i, i + 7))
                }

                // Get trips that appear in this month
                const monthTrips = state.trips.filter((trip) => {
                  const tripStart = parseISO(trip.entryDate)
                  const tripEnd = parseISO(trip.departureDate)
                  return (
                    isWithinInterval(monthStart, {
                      start: tripStart,
                      end: tripEnd,
                    }) ||
                    isWithinInterval(monthEnd, {
                      start: tripStart,
                      end: tripEnd,
                    }) ||
                    isWithinInterval(tripStart, {
                      start: monthStart,
                      end: monthEnd,
                    }) ||
                    isWithinInterval(tripEnd, {
                      start: monthStart,
                      end: monthEnd,
                    })
                  )
                })

                // For each trip, expand to show each member separately
                const tripMemberPairs = monthTrips
                  .flatMap((trip) =>
                    trip.memberIds.map((memberId) => ({
                      trip,
                      memberId,
                      member: state.members.find((m) => m.id === memberId),
                    })),
                  )
                  .filter((pair) => pair.member !== undefined)

                return (
                  <div className="space-y-0">
                    {/* Header row */}
                    <div className="grid grid-cols-7 gap-0">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                        (day) => (
                          <div
                            key={day}
                            className="text-center font-medium text-sm text-muted-foreground p-2 border-b"
                          >
                            {day}
                          </div>
                        ),
                      )}
                    </div>

                    {/* Week rows */}
                    {weeks.map((week, weekIdx) => {
                      // Find trip segments for this week
                      const weekStart = week.find((d) => d !== null)
                      const weekEnd = [...week]
                        .reverse()
                        .find((d) => d !== null)

                      if (!weekStart || !weekEnd) {
                        return (
                          <div key={weekIdx} className="grid grid-cols-7 gap-0">
                            {week.map((_, dayIdx) => (
                              <div
                                key={dayIdx}
                                className="min-h-24 p-2 border-b border-r last:border-r-0"
                              />
                            ))}
                          </div>
                        )
                      }

                      // Calculate trip segments for this week
                      type TripSegment = {
                        trip: Trip
                        memberId: string
                        member: (typeof state.members)[0]
                        startCol: number
                        endCol: number
                        isStart: boolean
                        isEnd: boolean
                      }

                      const segments: Array<TripSegment> = []

                      for (const {
                        trip,
                        memberId,
                        member,
                      } of tripMemberPairs) {
                        if (!member) continue
                        const tripStart = parseISO(trip.entryDate)
                        const tripEnd = parseISO(trip.departureDate)

                        // Find which days of this week the trip covers
                        let startCol = -1
                        let endCol = -1

                        for (let col = 0; col < 7; col++) {
                          const day = week[col]
                          if (
                            day &&
                            isWithinInterval(day, {
                              start: tripStart,
                              end: tripEnd,
                            })
                          ) {
                            if (startCol === -1) startCol = col
                            endCol = col
                          }
                        }

                        if (startCol !== -1) {
                          const segmentStartDay = week[startCol]
                          const segmentEndDay = week[endCol]
                          segments.push({
                            trip,
                            memberId,
                            member,
                            startCol,
                            endCol,
                            isStart: segmentStartDay
                              ? isSameDay(segmentStartDay, tripStart)
                              : false,
                            isEnd: segmentEndDay
                              ? isSameDay(segmentEndDay, tripEnd)
                              : false,
                          })
                        }
                      }

                      // Group segments by their position to stack them
                      const segmentsByMember = new Map<
                        string,
                        Array<TripSegment>
                      >()
                      for (const seg of segments) {
                        const key = `${seg.trip.id}-${seg.memberId}`
                        if (!segmentsByMember.has(key)) {
                          segmentsByMember.set(key, [])
                        }
                        segmentsByMember.get(key)!.push(seg)
                      }

                      const uniqueSegments = Array.from(
                        segmentsByMember.values(),
                      ).map((segs) => segs[0])

                      return (
                        <div key={weekIdx} className="relative">
                          {/* Day cells */}
                          <div className="grid grid-cols-7 gap-0">
                            {week.map((day, dayIdx) => (
                              <div
                                key={dayIdx}
                                className={`min-h-24 p-2 border-b border-r last:border-r-0 ${
                                  day && isSameMonth(day, currentDate)
                                    ? 'bg-card'
                                    : 'bg-muted/50'
                                }`}
                              >
                                {day && (
                                  <div className="text-sm font-medium">
                                    {format(day, 'd')}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Trip bars overlaid on the week */}
                          <div className="absolute inset-0 pointer-events-none pt-8 px-1">
                            <div className="relative">
                              {uniqueSegments.map((seg, segIdx) => {
                                const tripMembers = seg.trip.memberIds
                                  .map((id) =>
                                    state.members.find((m) => m.id === id),
                                  )
                                  .filter(Boolean)

                                // Calculate position and width
                                const leftPercent = (seg.startCol / 7) * 100
                                const widthPercent =
                                  ((seg.endCol - seg.startCol + 1) / 7) * 100

                                return (
                                  <Tooltip
                                    key={`${seg.trip.id}-${seg.memberId}-${weekIdx}`}
                                  >
                                    <TooltipTrigger
                                      className="absolute pointer-events-auto cursor-pointer hover:opacity-80 text-xs text-white px-2 py-0.5 truncate"
                                      style={{
                                        left: `${leftPercent}%`,
                                        width: `${widthPercent}%`,
                                        top: `${segIdx * 22}px`,
                                        backgroundColor: seg.member.color,
                                        borderRadius:
                                          seg.isStart && seg.isEnd
                                            ? '4px'
                                            : seg.isStart
                                              ? '4px 0 0 4px'
                                              : seg.isEnd
                                                ? '0 4px 4px 0'
                                                : '0',
                                      }}
                                      onClick={() => handleEditTrip(seg.trip)}
                                      aria-label={`${seg.member.name}: ${format(parseISO(seg.trip.entryDate), 'MMM d')} - ${format(parseISO(seg.trip.departureDate), 'MMM d')}`}
                                    >
                                      {seg.member.name}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="space-y-1">
                                        <div className="font-medium">
                                          {format(
                                            parseISO(seg.trip.entryDate),
                                            'MMM d, yyyy',
                                          )}{' '}
                                          -{' '}
                                          {format(
                                            parseISO(seg.trip.departureDate),
                                            'MMM d, yyyy',
                                          )}
                                        </div>
                                        <div>
                                          {tripMembers
                                            .map((m) => m?.name)
                                            .join(', ')}
                                        </div>
                                        {seg.trip.notes && (
                                          <div className="text-muted-foreground">
                                            {seg.trip.notes}
                                          </div>
                                        )}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="year" className="mt-6">
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {format(yearViewStartDate, 'MMMM yyyy')} -{' '}
                  {format(addMonths(yearViewStartDate, 11), 'MMMM yyyy')}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={handleYearViewPrevMonth}
                  >
                    <IconChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={handleYearViewNextMonth}
                  >
                    <IconChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 12 }).map((_, monthIdx) => {
              const monthDate = addMonths(yearViewStartDate, monthIdx)
              const start = startOfMonth(monthDate)
              const end = endOfMonth(monthDate)
              const days = eachDayOfInterval({ start, end })

              return (
                <Card key={monthIdx}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {format(monthDate, 'MMMM')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-1">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div
                          key={i}
                          className="text-center text-xs text-muted-foreground"
                        >
                          {day}
                        </div>
                      ))}

                      {Array.from({ length: start.getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                      ))}

                      {days.map((day) => {
                        const trips = getTripsForDay(day)
                        const colors = trips
                          .flatMap((t) => t.memberIds.map((id) => id))
                          .map(
                            (id) =>
                              state.members.find((m) => m.id === id)?.color,
                          )
                          .filter(Boolean)

                        const tripMemberNames = trips
                          .flatMap((t) =>
                            t.memberIds
                              .map(
                                (id) =>
                                  state.members.find((m) => m.id === id)?.name,
                              )
                              .filter(Boolean),
                          )
                          .join(', ')

                        const dayContent = (
                          <>
                            {colors.length > 0 && (
                              <div className="absolute inset-0 flex">
                                {colors.map((color, idx) => (
                                  <div
                                    key={idx}
                                    className="flex-1"
                                    style={{ backgroundColor: color as string }}
                                  />
                                ))}
                              </div>
                            )}
                            <span
                              className={`relative z-10 font-medium ${colors.length > 0 ? 'text-white' : 'text-foreground'}`}
                            >
                              {format(day, 'd')}
                            </span>
                          </>
                        )

                        if (trips.length === 0) {
                          return (
                            <div
                              key={day.toISOString()}
                              className="aspect-square flex items-center justify-center text-xs rounded relative overflow-hidden"
                            >
                              {dayContent}
                            </div>
                          )
                        }

                        return (
                          <Tooltip key={day.toISOString()}>
                            <TooltipTrigger
                              aria-label={`${format(day, 'MMMM d, yyyy')}: ${tripMemberNames}`}
                              className="aspect-square flex items-center justify-center text-xs rounded relative overflow-hidden"
                            >
                              {dayContent}
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-2">
                                {trips.map((trip) => {
                                  const tripMembers = trip.memberIds
                                    .map((id) =>
                                      state.members.find((m) => m.id === id),
                                    )
                                    .filter(Boolean)
                                  return (
                                    <div key={trip.id} className="space-y-1">
                                      <div className="font-medium">
                                        {format(
                                          parseISO(trip.entryDate),
                                          'MMM d, yyyy',
                                        )}{' '}
                                        -{' '}
                                        {format(
                                          parseISO(trip.departureDate),
                                          'MMM d, yyyy',
                                        )}
                                      </div>
                                      <div>
                                        {tripMembers
                                          .map((m) => m?.name)
                                          .join(', ')}
                                      </div>
                                      {trip.notes && (
                                        <div className="text-muted-foreground">
                                          {trip.notes}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      <TripDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        trip={editingTrip}
      />
    </div>
  )
}
