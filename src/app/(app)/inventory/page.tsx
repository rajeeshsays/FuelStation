
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { FuelType, InventoryData } from "@/lib/types";
import { getInventoryData } from "@/lib/queries";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const InventoryChart = dynamic(() => import('./inventory-chart').then(mod => mod.InventoryChart), {
    ssr: false,
    loading: () => <Skeleton className="h-[426px] w-full" />,
});


const InventoryCard = ({ fuelType, data }: { fuelType: FuelType; data: { current: number; capacity: number } }) => {
  const percentage = data.capacity > 0 ? (data.current / data.capacity) * 100 : 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{fuelType}</CardTitle>
        <CardDescription>Current stock level</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-2xl font-bold">{data.current.toLocaleString()} L</span>
          <span className="text-sm text-muted-foreground">/ {data.capacity.toLocaleString()} L</span>
        </div>
        <Progress value={percentage} />
        <p className="text-xs text-muted-foreground mt-2">{percentage.toFixed(1)}% full</p>
      </CardContent>
    </Card>
  )
};

export default async function InventoryPage() {
  const inventoryData = await getInventoryData();
  const chartData = Object.entries(inventoryData).map(([name, { current, capacity }]) => ({
      name,
      current,
      capacity,
  }));

  return (
    <>
      <PageHeader
        title="Inventory Tracking"
        description="Monitor current fuel stock levels and historical data."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {Object.entries(inventoryData).map(([fuelType, data]) => (
          <InventoryCard key={fuelType} fuelType={fuelType as FuelType} data={data!} />
        ))}
      </div>
      
      <InventoryChart chartData={chartData} />
    </>
  );
}
