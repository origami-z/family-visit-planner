import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import type { Trip } from '@/types/planner';
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FamilyMember } from '@/types/planner'

interface TripDialogProps {
  open: boolean
  onClose: () => void
  trip?: Trip | null
}

export function TripDialog({ open, onClose, trip }: TripDialogProps) {
  const { state, addTrip, updateTrip, deleteTrip } = useFamilyPlanner()
  const [memberId, setMemberId] = useState('')
  const [entryDate, setEntryDate] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (trip) {
      setMemberId(trip.memberId)
      setEntryDate(trip.entryDate)
      setDepartureDate(trip.departureDate)
      setNotes(trip.notes || '')
    } else {
      setMemberId(state.members[0]?.id || '')
      setEntryDate(format(new Date(), 'yyyy-MM-dd'))
      setDepartureDate(format(new Date(), 'yyyy-MM-dd'))
      setNotes('')
    }
  }, [trip, open, state.members])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!memberId || !entryDate || !departureDate) return

    const tripData = {
      memberId,
      entryDate,
      departureDate,
      notes: notes || undefined,
    }

    if (trip) {
      updateTrip(trip.id, tripData)
    } else {
      addTrip(tripData)
    }

    onClose()
  }

  const handleDelete = () => {
    if (trip && confirm('Are you sure you want to delete this trip?')) {
      deleteTrip(trip.id)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{trip ? 'Edit Trip' : 'Add New Trip'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="member">Family Member</Label>
              <Select
                value={memberId}
                onValueChange={(value) => value && setMemberId(value)}
              >
                <SelectTrigger id="member">
                  <SelectValue>
                    {(id: string) => {
                      const member = state.members.find((m) => m.id === id)
                      if (member) {
                        return (
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: member.color }}
                            />
                            {member.name}
                          </div>
                        )
                      } else return null
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {state.members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: member.color }}
                        />
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entry">Entry Date</Label>
                <Input
                  id="entry"
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departure">Departure Date</Label>
                <Input
                  id="departure"
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this trip..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            {trip && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{trip ? 'Update' : 'Add'} Trip</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
