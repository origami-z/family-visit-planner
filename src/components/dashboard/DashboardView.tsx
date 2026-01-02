import {
  IconAlertTriangle,
  IconCalendarOff,
  IconPlane,
  IconUsers,
} from '@tabler/icons-react'
import { format, parseISO } from 'date-fns'
import { useState } from 'react'
import type { Trip } from '@/types/planner'
import { TripDialog } from '@/components/calendar/TripDialog'
import { useFamilyPlanner } from '@/context/FamilyPlannerContext'
import { useEmptyDates, useMemberStats } from '@/hooks/usePlannerCalculations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function DashboardView() {
  const { state } = useFamilyPlanner()

  const stats = useMemberStats(
    state.members,
    state.trips,
    state.globalSettings.yearLimit,
  )
  const emptyPeriods = useEmptyDates(state.trips, state.members)

  const activeTrips = stats.filter((s) => s.currentStatus === 'present').length
  const totalWarnings = stats.reduce(
    (sum, s) => sum + s.activeWarnings.length,
    0,
  )

  const [isTripDialogOpen, setIsTripDialogOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)

  const openTripDialog = (trip: Trip) => {
    setSelectedTrip(trip)
    setIsTripDialogOpen(true)
  }

  const closeTripDialog = () => {
    setIsTripDialogOpen(false)
    setSelectedTrip(null)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Family Members
            </CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.members.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Currently Present
            </CardTitle>
            <IconPlane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTrips}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Warnings
            </CardTitle>
            <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {totalWarnings}
            </div>
          </CardContent>
        </Card>
      </div>

      {emptyPeriods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCalendarOff className="h-5 w-5" />
              Empty Periods (No Family Present)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {emptyPeriods.map((period, idx) => (
                <Alert key={idx}>
                  <AlertDescription>
                    <span className="font-medium">
                      {format(parseISO(period.startDate), 'MMM d, yyyy')} -{' '}
                      {format(parseISO(period.endDate), 'MMM d, yyyy')}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      ({period.duration} days)
                    </span>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Members Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {stats.map((member) => {
              // const memberTrips = getMemberTripsInRange(member.memberId)
              return (
                <div
                  key={member.memberId}
                  className="border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: member.color }}
                      />
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.currentStatus === 'present' ? (
                            <>
                              Currently present
                              {member.currentTrip && (
                                <span>
                                  , leaving:{' '}
                                  {format(
                                    parseISO(member.currentTrip.departureDate),
                                    'MMM d',
                                  )}
                                </span>
                              )}
                            </>
                          ) : (
                            'Currently away'
                          )}

                          {/* Show next trip only when not currently present or when there is no currentTrip */}
                          {!member.currentTrip && member.nextTrip && (
                            <span>
                              , next:{' '}
                              {format(
                                parseISO(member.nextTrip.entryDate),
                                'MMM d',
                              )}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {member.highlightTrips.length > 0 && (
                    <div className="ml-6 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Trips highlight:
                      </p>
                      {member.highlightTrips.map((hightlightTrip) => (
                        <div
                          key={hightlightTrip.trip.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span
                            className="px-2 py-1 rounded bg-muted text-muted-foreground cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => openTripDialog(hightlightTrip.trip)}
                            title="View trip details"
                          >
                            {format(
                              parseISO(hightlightTrip.trip.entryDate),
                              'MMM d, yyyy',
                            )}{' '}
                            <span className="text-muted-foreground">→</span>{' '}
                            {format(
                              parseISO(hightlightTrip.trip.departureDate),
                              'MMM d, yyyy',
                            )}
                          </span>
                          {hightlightTrip.trip.notes && (
                            <span className="text-xs text-muted-foreground">
                              ({hightlightTrip.trip.notes})
                            </span>
                          )}
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className={`text-sm font-medium`}>
                                Rolling year until{' '}
                                {format(hightlightTrip.refDate, 'MMM d, yyyy')}
                                {': '}
                                <span
                                  className={`${hightlightTrip.isOverLimit ? 'text-error' : ''}`}
                                >
                                  {hightlightTrip.daysInYear} /{' '}
                                  {state.globalSettings.yearLimit} days
                                </span>
                              </p>
                            </div>
                            {hightlightTrip.isOverLimit && (
                              <Badge variant="destructive">Over Limit</Badge>
                            )}
                            {member.activeWarnings.length > 0 &&
                              !hightlightTrip.isOverLimit && (
                                <Badge className="bg-warning text-warning-foreground">
                                  {member.activeWarnings.length} Warning
                                  {member.activeWarnings.length > 1 ? 's' : ''}
                                </Badge>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {member.highlightTrips.length === 0 && (
                    <div className="ml-6">
                      <p className="text-xs text-muted-foreground">
                        No trips within one year
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
            {stats.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No family members added yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      <TripDialog
        open={isTripDialogOpen}
        onClose={closeTripDialog}
        trip={selectedTrip}
      />
    </div>
  )
}
