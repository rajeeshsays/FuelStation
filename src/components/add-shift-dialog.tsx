'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { saveShiftEntry, type ShiftEntryFormState } from '@/app/(app)/shift/actions';
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
import type { Shift } from '@/lib/types';
import { format } from 'date-fns';

interface AddShiftDialogProps {
  shiftEntry?: Shift;
  inchargeOptions: { id: string; name: string }[];
  children: React.ReactNode;
}

function SubmitButton({ isEditMode }: { isEditMode: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : isEditMode ? 'Save Shift' : 'Add Shift'}
    </Button>
  );
}

export function AddShiftDialog({ shiftEntry, inchargeOptions, children }: AddShiftDialogProps) {
  const [open, setOpen] = useState(false);
  const isEditMode = !!shiftEntry;
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const initialState: ShiftEntryFormState = { message: '', success: false, errors: {} };
  const [state, dispatch] = useFormState(saveShiftEntry, initialState);

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
          <DialogTitle>{isEditMode ? 'Edit Shift' : 'Add Shift'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the shift details.' : 'Enter the shift details below.'}
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={dispatch}>
          <div className="grid gap-4 py-4">
            {isEditMode && <input type="hidden" name="id" value={shiftEntry.id} />}

            <div className="space-y-2">
              <Label htmlFor="name">Shift Name</Label>
              <Input id="name" name="name" defaultValue={shiftEntry?.name ?? ''} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inchargeId">In Charge</Label>
              <Select name="inchargeId" defaultValue={shiftEntry?.inchargeId ?? ''} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select in-charge" />
                </SelectTrigger>
                <SelectContent>
                  {inchargeOptions.length > 0 ? (
                    inchargeOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">No eligible in-charge staff found</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  defaultValue={shiftEntry?.startTime ?? ''}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  defaultValue={shiftEntry?.endTime ?? ''}
                  required
                />
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
