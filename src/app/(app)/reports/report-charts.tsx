
'use client';

import { LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartTooltipContent, ChartContainer, type ChartConfig } from '@/components/ui/chart';

const chartConfig = {
  total: {
    label: "Liters Sold",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

interface ReportChartsProps {
    tab: 'daily' | 'monthly' | 'period';
    chartData: { name: string; total: number }[];
}

export function ReportCharts({ tab, chartData }: ReportChartsProps) {
    return (
        <ChartContainer config={chartConfig} className="h-[300px] w-full mb-6">
            {tab === 'monthly' ? (
                <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis 
                        dataKey="name" 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={8}
                        tickFormatter={(value) => value.replace('Lanka Auto Diesel', 'Diesel')}
                    />
                    <YAxis 
                        tickFormatter={(value) => (Number(value) > 0 ? `${Number(value) / 1000}K` : "0")}
                    />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent formatter={(value) => `${Number(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} L`} />}/>
                    <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                </BarChart>
            ) : (
                <LineChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis 
                        tickFormatter={(value) => `${Number(value).toLocaleString()} L`}
                        domain={['auto', 'auto']}
                        allowDecimals={false}
                    />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent formatter={(value) => `${Number(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} L`} />}/>
                    <Line type="monotone" dataKey="total" stroke="var(--color-total)" strokeWidth={2} dot={false}/>
                </LineChart>
            )}
        </ChartContainer>
    );
}
