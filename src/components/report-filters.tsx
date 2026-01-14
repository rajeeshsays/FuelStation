
"use client"
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { pumps } from "@/lib/data";
import type { FuelPrices, FuelType } from "@/lib/types";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, subMonths, startOfMonth, parseISO } from "date-fns";
import { DateRange } from "react-day-picker";
import React from "react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";


export function ReportFilters({ fuelPrices }: { fuelPrices: FuelPrices }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // A more robust way to handle search param updates
    const handleFilterChange = React.useCallback(
        (newParams: Record<string, string | undefined>) => {
          const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
          
          for (const [key, value] of Object.entries(newParams)) {
              if (!value || value === 'all') {
                  currentParams.delete(key);
              } else {
                  currentParams.set(key, value);
              }
          }
          
          const search = currentParams.toString();
          const query = search ? `?${search}` : "";
          router.push(`${pathname}${query}`);
        },
        [pathname, router, searchParams]
    );

    const tab = searchParams.get('tab') ?? 'daily';
    
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const urlDateRange: DateRange | undefined = from ? {
        from: parseISO(from),
        to: to ? parseISO(to) : undefined,
    } : undefined;

    const [selectedDateRange, setSelectedDateRange] = React.useState<DateRange | undefined>(urlDateRange);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    
    const handlePopoverOpenChange = (open: boolean) => {
        setIsPopoverOpen(open);
        if (!open) {
            handleFilterChange({ 
                from: selectedDateRange?.from ? format(selectedDateRange.from, 'yyyy-MM-dd') : undefined,
                to: selectedDateRange?.to ? format(selectedDateRange.to, 'yyyy-MM-dd') : undefined,
            });
        }
    };
    
    React.useEffect(() => {
        setSelectedDateRange(urlDateRange);
    }, [from, to]);

    const handleMonthChange = (date: Date | undefined) => {
        if (!date) return;
        handleFilterChange({ month: format(date, 'yyyy-MM') });
    }
    
    const month = searchParams.get('month');
    const selectedMonth = month ? parseISO(month) : new Date();

    return (
        <div className="flex flex-col gap-4">
            <Tabs 
                value={tab} 
                onValueChange={(value) => handleFilterChange({ tab: value })}
            >
                <TabsList>
                    <TabsTrigger value="daily">Daily</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="period">Period</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="flex flex-wrap items-center gap-4">
                {tab !== 'monthly' && (
                    <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn("w-[300px] justify-start text-left font-normal", !selectedDateRange && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDateRange?.from ? (
                                selectedDateRange.to ? (
                                    <>
                                    {format(selectedDateRange.from, "LLL dd, y")} -{" "}
                                    {format(selectedDateRange.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(selectedDateRange.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={selectedDateRange?.from || subMonths(new Date(), 1)}
                                selected={selectedDateRange}
                                onSelect={setSelectedDateRange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                )}
                {tab === 'monthly' && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn("w-[240px] justify-start text-left font-normal", !selectedMonth && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedMonth ? format(selectedMonth, "MMMM yyyy") : <span>Pick a month</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={selectedMonth}
                                onSelect={handleMonthChange}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                )}
                <Select 
                    value={searchParams.get('fuelType') ?? 'all'} 
                    onValueChange={(value) => handleFilterChange({ fuelType: value })}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Fuel" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Fuel Types</SelectItem>
                        {Object.keys(fuelPrices).map(fuelType => (
                            <SelectItem key={fuelType} value={fuelType}>{fuelType}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select 
                    value={searchParams.get('pumpId') ?? 'all'} 
                    onValueChange={(value) => handleFilterChange({ pumpId: value })}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Pump" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Pumps</SelectItem>
                        {pumps.map(pump => (
                            <SelectItem key={pump.id} value={pump.id}>{pump.id}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
