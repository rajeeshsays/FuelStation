
"use client"

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AuditLogMethod } from "@/lib/types";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import React from "react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const methods: (AuditLogMethod | 'all')[] = ['all', 'INSERT', 'UPDATE', 'DELETE'];

export function AuditLogFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

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

    const monthStr = searchParams.get('month');
    const selectedMonth = monthStr ? parseISO(monthStr) : undefined;
    
    const dateStr = searchParams.get('date');
    const selectedDate = dateStr ? parseISO(dateStr) : undefined;
    
    const handleMonthSelect = (date: Date | undefined) => {
        if (!date) return;
        // When a new month is selected, clear the specific date filter
        handleFilterChange({ 
            month: format(date, 'yyyy-MM'),
            date: undefined
        });
    }

    const handleDateSelect = (date: Date | undefined) => {
        handleFilterChange({ date: date ? format(date, 'yyyy-MM-dd') : undefined });
    }
    
    const handleClearFilters = () => {
        router.push(pathname);
    };
    
    const hasActiveFilters = !!monthStr || !!dateStr || !!searchParams.get('method');

    return (
        <div className="flex flex-wrap items-center gap-4">
            {/* Month Picker */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn("w-[240px] justify-start text-left font-normal", !selectedMonth && "text-muted-foreground")}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedMonth ? format(selectedMonth, "MMMM yyyy") : <span>Select a month...</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={selectedMonth}
                        onSelect={handleMonthSelect}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>

            {/* Date Picker (enabled if month is selected) */}
             <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn("w-[240px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                        disabled={!selectedMonth}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Filter by date...</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        initialFocus
                        month={selectedMonth} // Constrain to selected month
                    />
                </PopoverContent>
            </Popover>

            {/* Method Select */}
             <Select 
                value={searchParams.get('method') ?? 'all'} 
                onValueChange={(value) => handleFilterChange({ method: value })}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Method" />
                </SelectTrigger>
                <SelectContent>
                    {methods.map(method => (
                        <SelectItem key={method} value={method}>{method === 'all' ? 'All Methods' : method}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {hasActiveFilters && (
                <Button variant="ghost" onClick={handleClearFilters} className="text-muted-foreground">
                    <X className="mr-2 h-4 w-4" />
                    Clear
                </Button>
            )}
        </div>
    );
}
