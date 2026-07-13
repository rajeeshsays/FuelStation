"use client";

import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { savePumpEntry, type PumpEntryFormState } from '@/app/(app)/pump/actions';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Pump } from '@/lib/types';

interface PumpEntryDialogProps {
  pumpEntry?: Pump;
  children: React.ReactNode;
}

function SubmitButton({ isEditMode }: { isEditMode: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (isEditMode ? 'Saving...' : 'Adding...') : isEditMode ? 'Save Pump' : 'Add Pump'}
    </Button>
  );
}

export function AddPumpDialog({ pumpEntry, children }: PumpEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const isEditMode = !!pumpEntry;
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const initialState: PumpEntryFormState = { message: '', success: false, errors: {} };
  const [state, dispatch] = useFormState(savePumpEntry, initialState);

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Pump' : 'Add New Pump'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the pump information.' : 'Enter a name for the pump.'}
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={dispatch}>
          <div className="grid gap-4 py-4">
            {isEditMode && <input type="hidden" name="id" value={pumpEntry.id} />}

            <div className="space-y-2">
              <Label htmlFor="name">Pump Name</Label>
              <Input id="name" name="name" defaultValue={pumpEntry?.name ?? ''} required />
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
