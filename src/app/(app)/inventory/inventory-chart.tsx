'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartTooltipContent, ChartContainer, type ChartConfig } from '@/components/ui/chart';

const chartConfig = {
    current: {
        label: "Current (L)",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig;

interface ChartData {
    name: string;
    current: number;
    capacity: number;
}

export function InventoryChart({ chartData }: { chartData: ChartData[] }) {
    return (
        <Card>
            <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
            <CardDescription>Visual representation of stock levels.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] w-full">
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis />
                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent/>}/>
                        <Bar dataKey="current" fill="var(--color-current)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
      </Card>
    );
}
