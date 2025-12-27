import {
  IconAlertTriangle,
  IconCalendarOff,
  IconPlane,
  IconUsers,
  IconCalendar,
  IconX,
} from '@tabler/icons-react'
import { format, parseISO, subYears, addYears, isBefore } from 'date-fns'
import { useState } from 'react'
import { useFamilyPlanner } from '@/context/FamilyPlannerContext'
import { useEmptyDates, useMemberStats } from '@/hooks/usePlannerCalculations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function DashboardView() {
  const { state } = useFamilyPlanner()

  const [rollingRefDate, setRollingRefDate] = useState(
    format(new Date(), 'yyyy-MM-dd'),
  )

  const stats = useMemberStats(
    state.members,
    state.trips,
    state.globalSettings.yearLimit,
    rollingRefDate,
  )
  const emptyPeriods = useEmptyDates(state.trips, state.members)

  const activeTrips = stats.filter((s) => s.currentStatus === 'present').length
  const totalWarnings = stats.reduce(
    (sum, s) => sum + s.activeWarnings.length,
    0,
  )

  const refDate = parseISO(rollingRefDate)
  const oneYearAgo = subYears(refDate, 1)
  const oneYearFuture = addYears(refDate, 1)

  const getMemberTripsInRange = (memberId: string) => {
    return state.trips
      .filter((trip) => trip.memberId === memberId)
      .filter((trip) => {
        const start = parseISO(trip.entryDate)
        return start >= oneYearAgo && start <= oneYearFuture
      })
      .sort(
        (a, b) =>
          parseISO(a.entryDate).getTime() - parseISO(b.entryDate).getTime(),
      )
  }

  const handleDateClick = (dateString: string) => {
    const clickedDate = parseISO(dateString)
    const today = new Date()

    if (isBefore(clickedDate, today)) {
      setRollingRefDate(format(addYears(clickedDate, 1), 'yyyy-MM-dd'))
    } else {
      setRollingRefDate(dateString)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Reference Date:</span>
          <div className="flex items-center gap-2 bg-card border border-border rounded-md px-3 py-2">
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {format(refDate, 'MMM d, yyyy')}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() =>
                setRollingRefDate(format(new Date(), 'yyyy-MM-dd'))
              }
              title="Reset to today"
            >
              <IconX className="h-3 w-3" />
            </Button>
          </div>
        </div>
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
              const memberTrips = getMemberTripsInRange(member.memberId)
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
                          {member.currentStatus === 'present'
                            ? 'Currently present'
                            : 'Currently away'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p
                          className={`text-sm font-medium ${member.isOverLimit ? 'text-error' : ''}`}
                        >
                          {member.daysInYear} / {state.globalSettings.yearLimit}{' '}
                          days
                        </p>
                        {member.nextTrip && (
                          <p className="text-xs text-muted-foreground">
                            Next:{' '}
                            {format(
                              parseISO(member.nextTrip.entryDate),
                              'MMM d',
                            )}
                          </p>
                        )}
                      </div>
                      {member.isOverLimit && (
                        <Badge variant="destructive">Over Limit</Badge>
                      )}
                      {member.activeWarnings.length > 0 &&
                        !member.isOverLimit && (
                          <Badge className="bg-warning text-warning-foreground">
                            {member.activeWarnings.length} Warning
                            {member.activeWarnings.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                    </div>
                  </div>

                  {memberTrips.length > 0 && (
                    <div className="ml-6 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Trips:
                      </p>
                      {memberTrips.map((trip) => (
                        <div
                          key={trip.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span
                            className="px-2 py-1 rounded bg-muted text-muted-foreground cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => handleDateClick(trip.entryDate)}
                            title="Click to set as reference date (1 year later if in past)"
                          >
                            {format(parseISO(trip.entryDate), 'MMM d, yyyy')}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span
                            className="px-2 py-1 rounded bg-muted text-muted-foreground cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => handleDateClick(trip.departureDate)}
                            title="Click to set as reference date (1 year later if in past)"
                          >
                            {format(
                              parseISO(trip.departureDate),
                              'MMM d, yyyy',
                            )}
                          </span>
                          {trip.notes && (
                            <span className="text-xs text-muted-foreground">
                              ({trip.notes})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {memberTrips.length === 0 && (
                    <div className="ml-6">
                      <p className="text-xs text-muted-foreground">
                        No trips in this period
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
    </div>
  )
}
