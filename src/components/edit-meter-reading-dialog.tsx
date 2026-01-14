
"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateMeterReading, type UpdateReadingState } from '@/app/(app)/meter-readings/actions';
import type { MeterReading } from '@/lib/types';
import { format } from 'date-fns';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Saving...' : 'Save Changes'}
        </Button>
    );
}

function EditReadingDialogForm({ reading, setOpen }: { reading: MeterReading, setOpen: (open: boolean) => void }) {
    const { toast } = useToast();
    const initialState: UpdateReadingState = { message: '', success: false, errors: {} };
    const [state, dispatch] = useFormState(updateMeterReading, initialState);

    useEffect(() => {
        if (state.message) {
             if (state.success) {
                toast({ title: 'Success', description: state.message });
                setOpen(false);
            } else {
                toast({ variant: 'destructive', title: 'Error', description: state.message });
            }
        }
    }, [state, toast, setOpen]);

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Edit Meter Reading</DialogTitle>
                <DialogDescription>
                    Update the reading value. This will trigger a full recalculation of sales and inventory.
                </DialogDescription>
            </DialogHeader>
            <form action={dispatch}>
                <div className="grid gap-4 py-4">
                    <input type="hidden" name="id" value={reading.id} />
                    
                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Input value={format(reading.date, "PPP")} disabled />
                    </div>
                    
                     <div className="space-y-2">
                        <Label>Pump</Label>
                        <Input value={reading.pumpId} disabled />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="reading">Reading</Label>
                        <Input id="reading" name="reading" type="number" step="any" defaultValue={reading.reading} />
                        {state.errors?.reading && <p className="text-sm text-destructive">{state.errors.reading[0]}</p>}
                    </div>

                </div>
                <DialogFooter>
                    <SubmitButton />
                </DialogFooter>
            </form>
        </DialogContent>
    );
}

interface EditMeterReadingDialogProps {
    reading: MeterReading;
    children: React.ReactNode;
}

export function EditMeterReadingDialog({ reading, children }: EditMeterReadingDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            {open && <EditReadingDialogForm reading={reading} setOpen={setOpen} />}
        </Dialog>
    );
}
