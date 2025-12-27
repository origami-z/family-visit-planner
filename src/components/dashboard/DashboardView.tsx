import { useFamilyPlanner } from '@/context/FamilyPlannerContext'
import { useMemberStats, useEmptyDates } from '@/hooks/usePlannerCalculations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  IconUsers,
  IconPlane,
  IconAlertTriangle,
  IconCalendarOff,
} from '@tabler/icons-react'
import { format, parseISO } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export function DashboardView() {
  const { state } = useFamilyPlanner()

  const [rollingRefDate, setRollingRefDate] = useState('')

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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="entry">Rolling Reference Date</Label>
              <Input
                id="entry"
                type="date"
                value={rollingRefDate}
                onChange={(e) => setRollingRefDate(e.target.value)}
                required
              />
            </div>

            {stats.map((member) => (
              <div
                key={member.memberId}
                className="flex items-center justify-between border-b border-border pb-3 last:border-0"
              >
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
                        {format(parseISO(member.nextTrip.entryDate), 'MMM d')}
                      </p>
                    )}
                  </div>
                  {member.isOverLimit && (
                    <Badge variant="destructive">Over Limit</Badge>
                  )}
                  {member.activeWarnings.length > 0 && !member.isOverLimit && (
                    <Badge className="bg-warning text-warning-foreground">
                      {member.activeWarnings.length} Warning
                      {member.activeWarnings.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
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
