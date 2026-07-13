'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { saveAssignmentEntry, type AssignmentFormState } from '@/app/(app)/assign-shift/actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Shift, ShiftAssignment, Staff } from '@/lib/types';
import { format } from 'date-fns';

interface AddAssignmentDialogProps {
  assignment?: ShiftAssignment;
  staffOptions: Staff[];
  shiftOptions: Shift[];
  children: React.ReactNode;
}

function SubmitButton({ isEditMode }: { isEditMode: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : isEditMode ? 'Save Assignment' : 'Add Assignment'}
    </Button>
  );
}

export function AddAssignmentDialog({ assignment, staffOptions, shiftOptions, children }: AddAssignmentDialogProps) {
  const [open, setOpen] = useState(false);
  const isEditMode = !!assignment;
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const initialState: AssignmentFormState = { message: '', success: false, errors: {} };
  const [state, dispatch] = useFormState(saveAssignmentEntry, initialState);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({ title: 'Success', description: state.message });
        setOpen(false);
        formRef.current?.reset();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: state.message });
      }
    }
  }, [state, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Assignment' : 'Assign Shift'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the staff-to-shift assignment.' : 'Assign a staff member to a shift.'}
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={dispatch}>
          <div className="grid gap-4 py-4">
            {isEditMode && <input type="hidden" name="id" value={assignment.id} />}

            <div className="space-y-2">
              <Label htmlFor="staffId">Staff</Label>
              <Select name="staffId" defaultValue={assignment?.staffId ?? ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  {staffOptions.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shiftId">Shift</Label>
              <Select name="shiftId" defaultValue={assignment?.shiftId ?? ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  {shiftOptions.map((shift) => (
                    <SelectItem key={shift.id} value={shift.id}>
                      {shift.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fromDate">From</Label>
                <Input id="fromDate" name="fromDate" type="date" defaultValue={assignment?.fromDate ? format(new Date(assignment.fromDate), 'yyyy-MM-dd') : ''} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="toDate">To</Label>
                <Input id="toDate" name="toDate" type="date" defaultValue={assignment?.toDate ? format(new Date(assignment.toDate), 'yyyy-MM-dd') : ''} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <SubmitButton isEditMode={isEditMode} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
