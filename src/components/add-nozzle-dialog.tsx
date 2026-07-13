"use client";

import { useFormState, useFormStatus} from 'react-dom';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { saveNozzleEntry, type NozzleEntryFormState } from '@/app/(app)/nozzle/actions'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button} from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from "lucide-react";
import type { Nozzle,IPumpOption } from '@/lib/types';



interface NozzleEntryDialogProps {
    nozzleEntry?: Nozzle;
    pumps: IPumpOption[];
    children: React.ReactNode;
}

function SubmitButton({ isEditMode }: { isEditMode: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (isEditMode ? 'Saving...' : 'Adding...') : (isEditMode ? 'Save Entry' : 'Save Entry')}
        </Button>
    );
}
export function AddNozzleDialog({ nozzleEntry,pumps, children }: NozzleEntryDialogProps) {
 const [open, setOpen] = useState(false);
    const isEditMode = !!nozzleEntry;
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const initialState: NozzleEntryFormState = { message: '', success: false, errors: {} };
    const [state, dispatch] = useFormState(saveNozzleEntry, initialState);

    return (
         <Dialog open={open} onOpenChange={setOpen}>
             <DialogTrigger asChild>
                 {children}
             </DialogTrigger>
   
            <DialogContent className="sm:max-w-[425px]">
                 <DialogHeader>
                     <DialogTitle>{isEditMode ? 'Edit Staff Entry' : 'Add New Nozzle'}</DialogTitle>
                     <DialogDescription>
                         {isEditMode ? 'Update the details of the stock delivery.' : 'Enter the details of the new stock delivery.'}
                     </DialogDescription>
                 </DialogHeader>
                   <form ref={formRef} action={dispatch}>
                      <div className="grid gap-4 py-4">
                         {isEditMode && <input type="hidden" name="id" value={nozzleEntry.id} />}
                        <div className="space-y-2">
                             <Label htmlFor="nozzleCode">Nozzle Code</Label>
                             <Input id="nozzleCode" name="nozzleCode" defaultValue={nozzleEntry?.nozzleCode ?? ''} />
                             {state.errors?.nozzleCode && <p className="text-sm text-destructive">{state.errors.nozzleCode[0]}</p>}
                             <div className="space-y-2">
    <Label htmlFor="pumpId">Pump</Label>

    <Select
        name="pumpId"
        defaultValue={typeof nozzleEntry?.pumpId === 'string' ? nozzleEntry.pumpId : nozzleEntry?.pumpId?.id ?? ''}
    >
        <SelectTrigger>
            <SelectValue placeholder="Select Pump" />
        </SelectTrigger>

        <SelectContent>
            {pumps.map((pump) => (
                <SelectItem
                    key={pump.id}
                    value={pump.id}
                >
                    {pump.name}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
</div>
                             {/* {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>} */}
                         </div>

                    {/*     <div className="space-y-2">
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
                             <Input id="liters" name="liters" type="number" step="any" defaultValue={staffEntry?.liters?.toString()} />
                              {state.errors?.liters && <p className="text-sm text-destructive">{state.errors.liters[0]}</p>}
                         </div>
                        
                          <div className="space-y-2">
                             <Label htmlFor="pricePerLiter">Price/Liter</Label>
                             <Input id="pricePerLiter" name="pricePerLiter" type="number" step="any" defaultValue={staffEntry?.pricePerLiter?.toString()} />
                             {state.errors?.pricePerLiter && <p className="text-sm text-destructive">{state.errors.pricePerLiter[0]}</p>}
                         </div>

                         <div className="space-y-2">
                             <Label htmlFor="discount">Discount (Total)</Label>
                             <Input id="discount" name="discount" type="number" step="any" defaultValue={staffEntry?.discount?.toString() || "0"} />
                              {state.errors?.discount && <p className="text-sm text-destructive">{state.errors.discount[0]}</p>}
                         </div>*/}
                     </div> 
                     <DialogFooter>
                         <SubmitButton isEditMode={isEditMode} />
                     </DialogFooter>
                 </form>
             </DialogContent>  
        </Dialog>
    );
}