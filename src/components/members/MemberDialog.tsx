import { useEffect, useState } from 'react'
import type { FamilyMember, WarningRule } from '@/types/planner'
import { useFamilyPlanner } from '@/context/FamilyPlannerContext'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

interface MemberDialogProps {
  open: boolean
  onClose: () => void
  member?: FamilyMember | null
}

const PRESET_COLORS = [
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
  '#EC4899', // Pink
  '#F97316', // Orange
  '#3B82F6', // Blue
  '#10B981', // Green
]

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function MemberDialog({ open, onClose, member }: MemberDialogProps) {
  const { addMember, updateMember } = useFamilyPlanner()
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [flightDaysEnabled, setFlightDaysEnabled] = useState(false)
  const [flightDaysSelected, setFlightDaysSelected] = useState<Array<number>>([
    1, 5,
  ]) // Monday (1) and Friday (5) by default
  const [stayLimitEnabled, setStayLimitEnabled] = useState(false)
  const [stayLimitValue, setStayLimitValue] = useState('180')

  useEffect(() => {
    if (member) {
      setName(member.name)
      setColor(member.color)

      // Parse existing warnings
      const flightDaysWarning = member.warnings.find(
        (w) => w.type === 'flight-days',
      )
      if (flightDaysWarning) {
        setFlightDaysEnabled(flightDaysWarning.enabled)
        setFlightDaysSelected(flightDaysWarning.criteria.days || [1, 5])
      }

      const stayLimitWarning = member.warnings.find(
        (w) => w.type === 'stay-limit',
      )
      if (stayLimitWarning) {
        setStayLimitEnabled(stayLimitWarning.enabled)
        setStayLimitValue(String(stayLimitWarning.criteria.limit || 180))
      }
    } else {
      setName('')
      setColor(PRESET_COLORS[0])
      setFlightDaysEnabled(false)
      setFlightDaysSelected([1, 5])
      setStayLimitEnabled(false)
      setStayLimitValue('180')
    }
  }, [member, open])

  const toggleFlightDay = (day: number) => {
    setFlightDaysSelected((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort(),
    )
  }

  const buildWarnings = (): Array<WarningRule> => {
    const newWarnings: Array<WarningRule> = []

    if (flightDaysEnabled && flightDaysSelected.length > 0) {
      const dayNames = flightDaysSelected.map((d) => DAYS_OF_WEEK[d])
      const message =
        flightDaysSelected.length === 7
          ? 'All days allowed'
          : `Travel only allowed on: ${dayNames.join(', ')}`

      newWarnings.push({
        id: 'flight-days-' + crypto.randomUUID(),
        type: 'flight-days',
        criteria: {
          days: flightDaysSelected,
          message,
        },
        enabled: true,
      })
    }

    if (stayLimitEnabled && stayLimitValue) {
      const limit = parseInt(stayLimitValue, 10)
      if (!Number.isNaN(limit) && limit > 0) {
        newWarnings.push({
          id: 'stay-limit-' + crypto.randomUUID(),
          type: 'stay-limit',
          criteria: {
            limit,
            message: `Stay exceeds ${limit} days per year`,
          },
          enabled: true,
        })
      }
    }

    return newWarnings
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return

    const newWarnings = buildWarnings()

    if (member) {
      updateMember(member.id, { name, color, warnings: newWarnings })
    } else {
      addMember({ name, color, warnings: newWarnings })
    }

    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {member ? 'Edit Member' : 'Add New Member'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter member name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    className={`h-10 w-10 rounded-md border-2 ${
                      color === presetColor ? 'border-primary' : 'border-border'
                    }`}
                    style={{ backgroundColor: presetColor }}
                    onClick={() => setColor(presetColor)}
                  />
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Warning Rules</h3>

              {/* Flight Days Warning */}
              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Flight Days Restriction</Label>
                  <Switch
                    checked={flightDaysEnabled}
                    onCheckedChange={setFlightDaysEnabled}
                  />
                </div>
                {flightDaysEnabled && (
                  <div className="grid grid-cols-7 gap-2">
                    {DAYS_OF_WEEK.map((day, index) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleFlightDay(index)}
                        className={`h-8 rounded border text-xs font-medium transition-colors ${
                          flightDaysSelected.includes(index)
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-input bg-background text-foreground hover:border-primary'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Stay Limit Warning */}
              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Stay Duration Limit</Label>
                  <Switch
                    checked={stayLimitEnabled}
                    onCheckedChange={setStayLimitEnabled}
                  />
                </div>
                {stayLimitEnabled && (
                  <div className="space-y-1">
                    <Label
                      htmlFor="stay-limit"
                      className="text-xs text-muted-foreground"
                    >
                      Max days per year
                    </Label>
                    <Input
                      id="stay-limit"
                      type="number"
                      min="1"
                      value={stayLimitValue}
                      onChange={(e) => setStayLimitValue(e.target.value)}
                      placeholder="e.g., 180"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{member ? 'Update' : 'Add'} Member</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
