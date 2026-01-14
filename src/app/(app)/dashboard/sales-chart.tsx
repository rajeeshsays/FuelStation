
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartTooltipContent, ChartContainer, type ChartConfig } from '@/components/ui/chart';

const chartConfig = {
    sales: {
        label: "Liters Sold",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig;

interface SalesChartProps {
    data: { name: string; sales: number }[];
}

export function SalesChart({ data }: SalesChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Sales Performance</CardTitle>
                <CardDescription>Total liters sold over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart accessibilityLayer data={data}>
                        <CartesianGrid vertical={false} />
                        <XAxis 
                            dataKey="name" 
                            tickLine={false} 
                            axisLine={false} 
                            tickMargin={8} 
                        />
                        <YAxis 
                            tickFormatter={(value) => value > 0 ? `${Number(value) / 1000}k` : "0"}
                        />
                        <Tooltip 
                            cursor={{ fill: 'hsl(var(--muted))' }} 
                            content={
                                <ChartTooltipContent 
                                    formatter={(value) => `${Number(value).toLocaleString()} L`} 
                                />
                            }
                        />
                        <Bar 
                            dataKey="sales" 
                            fill="var(--color-sales)" 
                            radius={[4, 4, 0, 0]} 
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
