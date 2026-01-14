
"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { saveReadings, type ReadingFormState } from '@/app/(app)/meter-readings/actions';
import { getLatestMeterReadings } from '@/lib/queries';
import { pumps } from "@/lib/data";
import type { FuelType, MeterReading } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";

const fuelTypes: FuelType[] = ['Lanka Auto Diesel', 'LP92', 'LP95', 'Kerosene'];

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save All Readings"}
        </Button>
    )
}

export function MeterReadingForm() {
  const { toast } = useToast();
  const initialState: ReadingFormState = { message: '', success: false, errors: {} };
  const [state, formAction] = useFormState(saveReadings, initialState);

  const [date, setDate] = useState<Date | undefined>();
  const [readings, setReadings] = useState<Record<string, string>>({});
  const [latestReadings, setLatestReadings] = useState<Map<string, MeterReading>>(new Map());
  
  useEffect(() => {
    setDate(new Date());
  }, []);

  useEffect(() => {
    if (date) {
        const dateString = format(date, 'yyyy-MM-dd');
        getLatestMeterReadings(dateString).then(setLatestReadings);
    }
  }, [date]);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({ title: 'Success', description: state.message });
        setReadings({});
        // Re-fetch latest readings for the current date after successful submission
        if (date) {
            const dateString = format(date, 'yyyy-MM-dd');
            getLatestMeterReadings(dateString).then(setLatestReadings);
        }
      } else {
        toast({ variant: 'destructive', title: 'Error submitting readings', description: state.message });
      }
    }
  }, [state, toast, date]);

  const handleReadingChange = (pumpId: string, value: string) => {
    setReadings(prev => ({ ...prev, [pumpId]: value }));
  };

  const calculateSales = useCallback((pumpId: string): number => {
    const previousReading = latestReadings.get(pumpId)?.reading;
    if (previousReading === undefined) {
      return 0;
    }
    const currentReading = parseFloat(readings[pumpId]) || 0;
    if (currentReading >= previousReading) {
      return currentReading - previousReading;
    }
    return 0;
  }, [readings, latestReadings]);

  return (
    <form action={formAction}>
      <div className="flex flex-col gap-2 mb-4">
        <Label>Reading Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("w-full md:w-[280px] justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              disabled={(d) => d > new Date()}
            />
          </PopoverContent>
        </Popover>
        <input type="hidden" name="date" value={date ? format(date, 'yyyy-MM-dd') : ''} />
      </div>

      <Tabs defaultValue={fuelTypes[0]}>
        <TabsList className="grid w-full grid-cols-4">
          {fuelTypes.map(fuelType => (
            <TabsTrigger key={fuelType} value={fuelType}>{fuelType}</TabsTrigger>
          ))}
        </TabsList>
        {fuelTypes.map(fuelType => (
          <TabsContent key={fuelType} value={fuelType}>
            <Card>
              <CardHeader>
                <CardTitle>{fuelType} Pumps</CardTitle>
                <CardDescription>Enter the current meter reading for each pump.</CardDescription>
              </CardHeader>
              <CardContent>
                {pumps.filter(p => p.fuelType === fuelType).map(pump => (
                   <div key={pump.id} className="grid items-start gap-x-4 gap-y-2 py-4 border-b last:border-b-0 last:pb-0 md:grid-cols-[auto_1fr_auto]">
                        <Label htmlFor={`pump-${pump.id}`} className="font-semibold pt-2">{pump.id}</Label>
                        
                        <div>
                            <div className="text-sm text-muted-foreground mb-1">
                                Previous: {latestReadings.get(pump.id)?.reading?.toLocaleString() || 'N/A'}
                            </div>
                            <Input
                                id={`pump-${pump.id}`}
                                name={`reading-${pump.id}`}
                                type="number"
                                placeholder="Current Reading"
                                value={readings[pump.id] || ''}
                                onChange={(e) => handleReadingChange(pump.id, e.target.value)}
                                min={latestReadings.get(pump.id)?.reading || 0}
                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            />
                        </div>
                        
                        <div className="md:text-right">
                            <p className="text-xs text-muted-foreground">Sales (Liters)</p>
                            <p className="font-bold text-base text-primary mt-1">
                                {calculateSales(pump.id).toFixed(2)}
                            </p>
                        </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      <div className="mt-6 flex justify-end">
        <SubmitButton />
      </div>
       {state.errors?.database && <p className="text-sm text-destructive mt-4">{state.errors.database[0]}</p>}
       {state.errors?.readings && <p className="text-sm text-destructive mt-4">{state.errors.readings[0]}</p>}
    </form>
  );
}
