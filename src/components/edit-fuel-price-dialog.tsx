
"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateFuelPrice, type UpdatePriceState } from '@/app/(app)/dashboard/actions';
import type { FuelType } from '@/lib/types';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Saving...' : 'Save Price'}
        </Button>
    );
}

interface EditFuelPriceFormProps {
    fuelType: FuelType;
    currentPrice: number;
    setOpen: (open: boolean) => void;
}

function EditFuelPriceForm({ fuelType, currentPrice, setOpen }: EditFuelPriceFormProps) {
    const { toast } = useToast();
    const initialState: UpdatePriceState = { message: '', success: false };
    const [state, dispatch] = useFormState(updateFuelPrice, initialState);

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
                <DialogTitle>Update Fuel Price</DialogTitle>
                <DialogDescription>
                    Set a new price for {fuelType}. This will be used for sales calculations and will update historical reports.
                </DialogDescription>
            </DialogHeader>
            <form action={dispatch}>
                <div className="grid gap-4 py-4">
                    <input type="hidden" name="fuelType" value={fuelType} />
                    
                    <div className="space-y-2">
                        <Label htmlFor="price">New Price per Liter (LKR)</Label>
                        <Input 
                            id="price" 
                            name="price" 
                            type="number" 
                            step="any" 
                            defaultValue={currentPrice} 
                            placeholder="Enter new price"
                            required
                        />
                        {state.errors?.price && <p className="text-sm text-destructive">{state.errors.price[0]}</p>}
                    </div>

                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <SubmitButton />
                </DialogFooter>
            </form>
        </DialogContent>
    );
}

interface EditFuelPriceDialogProps {
    fuelType: FuelType;
    currentPrice: number;
    children: React.ReactNode;
}

export function EditFuelPriceDialog({ fuelType, currentPrice, children }: EditFuelPriceDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            {open && <EditFuelPriceForm fuelType={fuelType} currentPrice={currentPrice} setOpen={setOpen} />}
        </Dialog>
    );
}
