"use client"

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FuelType } from "@/lib/types";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format, subMonths, parseISO } from "date-fns";
import { DateRange } from "react-day-picker";
import React from "react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const fuelTypes: FuelType[] = ['Lanka Auto Diesel', 'LP92', 'LP95', 'Kerosene'];

export function StockFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // A more robust way to handle search param updates
    const handleFilterChange = React.useCallback(
        (newParams: Record<string, string | undefined>) => {
          const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
          
          for (const [key, value] of Object.entries(newParams)) {
              if (!value || value === 'all' || value === '') {
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

    const handleClearFilters = () => {
        router.push(pathname);
    };
    
    const hasActiveFilters = !!from || !!searchParams.get('fuelType');

    return (
        <div className="flex flex-wrap items-center gap-4">
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
                        <span>Filter by date...</span>
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
            <Select 
                value={searchParams.get('fuelType') ?? 'all'} 
                onValueChange={(value) => handleFilterChange({ fuelType: value })}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Fuel" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Fuel Types</SelectItem>
                    {fuelTypes.map(fuelType => (
                        <SelectItem key={fuelType} value={fuelType}>{fuelType}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {hasActiveFilters && (
                <Button variant="ghost" onClick={handleClearFilters} className="text-muted-foreground">
                    <X className="mr-2 h-4 w-4" />
                    Clear Filters
                </Button>
            )}
        </div>
    );
}
