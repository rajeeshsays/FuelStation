
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, parseISO, endOfDay } from "date-fns";
import React, { Suspense } from "react";
import { getSalesData, getFuelPrices } from "@/lib/queries";
import { ReportFilters } from "@/components/report-filters";
import type { FuelType } from "@/lib/types";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const ReportCharts = dynamic(() => import('./report-charts').then(mod => mod.ReportCharts), {
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full mb-6" />,
});


export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const tabParam = searchParams?.tab;
    const tab = (tabParam === 'monthly' || tabParam === 'period') ? tabParam : 'daily';

    const fromParam = searchParams?.from as string | undefined;
    const toParam = searchParams?.to as string | undefined;
    
    let from: Date;
    let to: Date;

    if (fromParam) {
        from = parseISO(`${fromParam}T00:00:00Z`);
        // If there's a 'from' but no 'to', treat it as a single-day range.
        to = toParam ? parseISO(`${toParam}T00:00:00Z`) : from;
    } else {
        // Default to the current month if no params are set.
        const today = new Date();
        from = startOfMonth(today);
        to = endOfDay(today);
    }
    
    const monthStr = searchParams?.month ? (searchParams.month as string) : format(new Date(), 'yyyy-MM');
    const selectedMonth = parseISO(`${monthStr}-01T00:00:00Z`);

    const dateRange = tab === 'monthly' ? { from: startOfMonth(selectedMonth), to: endOfMonth(selectedMonth) } : { from, to };
    
    const fuelType = (searchParams?.fuelType as FuelType | 'all') || 'all';
    const pumpId = (searchParams?.pumpId as string | 'all') || 'all';

    const { sales: filteredSales, chartData } = await getSalesData({
        from: dateRange.from,
        to: dateRange.to,
        fuelType: fuelType,
        pumpId: pumpId,
        tab: tab,
    });
    
    const fuelPrices = await getFuelPrices();

    const getTitle = () => {
        if (tab === 'daily') return 'Daily Sales Report';
        if (tab === 'monthly') return 'Monthly Sales Report';
        if (tab === 'period') return 'Accumulative Sales Report';
        return 'Sales Report';
    }

    const getDescription = () => {
        if (tab === 'daily') return `Sales data from ${format(dateRange.from, 'PPP')} to ${format(dateRange.to, 'PPP')}`;
        if (tab === 'monthly') return `Aggregated sales data for ${format(dateRange.from, 'MMMM yyyy')}`;
        if (tab === 'period') return `Accumulated sales from ${format(dateRange.from, 'PPP')} to ${format(dateRange.to, 'PPP')}`;
        return '';
    }

    return (
        <>
            <PageHeader title="Sales Reports" description="Generate daily, monthly and accumulative sales reports.">
                <Button variant="outline"><Download className="mr-2 h-4 w-4"/> Export</Button>
            </PageHeader>
            
            <Suspense fallback={<div>Loading filters...</div>}>
                <ReportFilters fuelPrices={fuelPrices} />
            </Suspense>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>{getTitle()}</CardTitle>
                    <CardDescription>{getDescription()}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ReportCharts tab={tab} chartData={chartData} />
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {tab === 'period' ? (
                                    <>
                                        <TableHead>Fuel Type</TableHead>
                                        <TableHead className="text-right">Total Liters Sold</TableHead>
                                    </>
                                ) : (
                                    <>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Pump</TableHead>
                                        <TableHead>Fuel Type</TableHead>
                                        <TableHead className="text-right">Liters Sold</TableHead>
                                    </>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSales.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={tab === 'period' ? 2 : 4} className="h-24 text-center">
                                        No sales data found for the selected filters.
                                    </TableCell>
                                </TableRow>
                            )}

                            {tab === 'period' ? (
                                filteredSales.map((sale: any, i) => (
                                    <TableRow key={sale.fuelType || i}>
                                        <TableCell>{sale.fuelType}</TableCell>
                                        <TableCell className="text-right">{Number(sale.litersSold).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                filteredSales.map((sale: any, i) => (
                                    <TableRow key={sale.id || i}>
                                        <TableCell>{format(sale.date, "yyyy-MM-dd")}</TableCell>
                                        <TableCell>{sale.pumpId}</TableCell>
                                        <TableCell>{sale.fuelType}</TableCell>
                                        <TableCell className="text-right">{Number(sale.litersSold).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}
