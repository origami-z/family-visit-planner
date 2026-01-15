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
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center font-medium text-sm text-muted-foreground p-2"
                    >
                      {day}
                    </div>
                  ),
                )}

                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-2" />
                ))}

                {daysInMonth.map((day) => {
                  const trips = getTripsForDay(day)
                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-24 p-2 border rounded-md ${
                        isSameMonth(day, currentDate)
                          ? 'bg-card'
                          : 'bg-muted/50'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {trips.flatMap((trip) =>
                          trip.memberIds.map((mid) => {
                            const member = state.members.find(
                              (m) => m.id === mid,
                            )
                            if (!member) return null
                            const tripMembers = trip.memberIds
                              .map((id) =>
                                state.members.find((m) => m.id === id),
                              )
                              .filter(Boolean)
                            return (
                              <Tooltip key={`${trip.id}-${mid}`}>
                                <TooltipTrigger
                                  className="text-xs p-1 rounded cursor-pointer hover:opacity-80 w-full text-left"
                                  style={{
                                    backgroundColor: member.color,
                                    color: 'white',
                                  }}
                                  onClick={() => handleEditTrip(trip)}
                                >
                                  {member.name}
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
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
                                </TooltipContent>
                              </Tooltip>
                            )
                          }),
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
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
