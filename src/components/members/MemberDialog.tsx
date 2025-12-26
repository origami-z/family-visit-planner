import { useState, useEffect } from 'react';
import { useFamilyPlanner } from '@/context/FamilyPlannerContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FamilyMember } from '@/types/planner';

interface MemberDialogProps {
  open: boolean;
  onClose: () => void;
  member?: FamilyMember | null;
}

const PRESET_COLORS = [
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
  '#EC4899', // Pink
  '#F97316', // Orange
  '#3B82F6', // Blue
  '#10B981', // Green
];

export function MemberDialog({ open, onClose, member }: MemberDialogProps) {
  const { addMember, updateMember } = useFamilyPlanner();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setColor(member.color);
    } else {
      setName('');
      setColor(PRESET_COLORS[0]);
    }
  }, [member, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    if (member) {
      updateMember(member.id, { name, color });
    } else {
      addMember({ name, color, warnings: [] });
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{member ? 'Edit Member' : 'Add New Member'}</DialogTitle>
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {member ? 'Update' : 'Add'} Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}