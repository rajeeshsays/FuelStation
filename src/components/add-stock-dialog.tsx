
"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { saveStockEntry, type StockEntryFormState } from '@/app/(app)/stock/actions';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from "lucide-react";
import type { FuelType, StockEntry } from '@/lib/types';


const fuelTypes: FuelType[] = ['Lanka Auto Diesel', 'LP92', 'LP95', 'Kerosene'];

function SubmitButton({ isEditMode }: { isEditMode: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (isEditMode ? 'Saving...' : 'Adding...') : (isEditMode ? 'Save Entry' : 'Save Entry')}
        </Button>
    );
}

interface StockEntryDialogProps {
    stockEntry?: StockEntry;
    children: React.ReactNode;
}

export function AddStockDialog({ stockEntry, children }: StockEntryDialogProps) {
    const [open, setOpen] = useState(false);
    const isEditMode = !!stockEntry;
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    const initialState: StockEntryFormState = { message: '', success: false, errors: {} };
    const [state, dispatch] = useFormState(saveStockEntry, initialState);
    
    const [date, setDate] = useState<Date | undefined>(stockEntry?.invoiceDate ?? new Date());
    const [fuelType, setFuelType] = useState<string>(stockEntry?.fuelType ?? '');
    const [calendarOpen, setCalendarOpen] = useState(false);
    
    useEffect(() => {
        if (state.message) {
             if (state.success) {
                toast({ title: 'Success', description: state.message });
                setOpen(false);
            } else {
                toast({ variant: 'destructive', title: 'Error', description: state.message });
            }
        }
    }, [state, toast]);

    useEffect(() => {
        if (open) {
            setDate(stockEntry?.invoiceDate ?? new Date());
            setFuelType(stockEntry?.fuelType ?? '');
        }
    }, [open, stockEntry]);
    
    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            setDate(selectedDate);
        }
        setCalendarOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Stock Entry' : 'Add New Stock'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'Update the details of the stock delivery.' : 'Enter the details of the new stock delivery.'}
                    </DialogDescription>
                </DialogHeader>
                <form ref={formRef} action={dispatch}>
                    <div className="grid gap-4 py-4">
                        {isEditMode && <input type="hidden" name="id" value={stockEntry.id} />}
                        
                        <input type="hidden" name="invoiceDate" value={date ? format(date, 'yyyy-MM-dd') : ''} />
                        <input type="hidden" name="fuelType" value={fuelType} />

                        <div className="space-y-2">
                            <Label htmlFor="invoiceNumber">Invoice No.</Label>
                            <Input id="invoiceNumber" name="invoiceNumber" defaultValue={stockEntry?.invoiceNumber} />
                            {state.errors?.invoiceNumber && <p className="text-sm text-destructive">{state.errors.invoiceNumber[0]}</p>}
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Invoice Date</Label>
                             <Popover open={calendarOpen} onOpenChange={setCalendarOpen} modal={true}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar 
                                        mode="single" 
                                        selected={date} 
                                        onSelect={handleDateSelect}
                                        initialFocus 
                                    />
                                </PopoverContent>
                            </Popover>
                             {state.errors?.invoiceDate && <p className="text-sm text-destructive">{state.errors.invoiceDate[0]}</p>}
                        </div>
                        
                         <div className="space-y-2">
                            <Label>Fuel Type</Label>
                             <Select onValueChange={setFuelType} value={fuelType} modal={true}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a fuel type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fuelTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {state.errors?.fuelType && <p className="text-sm text-destructive">{state.errors.fuelType[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="liters">Liters</Label>
                            <Input id="liters" name="liters" type="number" step="any" defaultValue={stockEntry?.liters?.toString()} />
                             {state.errors?.liters && <p className="text-sm text-destructive">{state.errors.liters[0]}</p>}
                        </div>
                        
                         <div className="space-y-2">
                            <Label htmlFor="pricePerLiter">Price/Liter</Label>
                            <Input id="pricePerLiter" name="pricePerLiter" type="number" step="any" defaultValue={stockEntry?.pricePerLiter?.toString()} />
                            {state.errors?.pricePerLiter && <p className="text-sm text-destructive">{state.errors.pricePerLiter[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="discount">Discount (Total)</Label>
                            <Input id="discount" name="discount" type="number" step="any" defaultValue={stockEntry?.discount?.toString() || "0"} />
                             {state.errors?.discount && <p className="text-sm text-destructive">{state.errors.discount[0]}</p>}
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
