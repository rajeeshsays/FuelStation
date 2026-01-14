
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats, getFuelPrices, getDashboardChartData } from "@/lib/queries";
import { Warehouse, TrendingUp, AlertTriangle, AlertCircle, Pencil } from "lucide-react";
import type { FuelType } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const SalesChart = dynamic(() => import('./sales-chart').then(mod => mod.SalesChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[382px] w-full" />,
});

const EditFuelPriceDialog = dynamic(() => import('@/components/edit-fuel-price-dialog').then(mod => mod.EditFuelPriceDialog), {
  ssr: false,
});


const FuelPriceCard = ({ fuelType, price }: { fuelType: FuelType; price: number }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{fuelType}</CardTitle>
      <EditFuelPriceDialog fuelType={fuelType} currentPrice={price}>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit Price</span>
        </Button>
      </EditFuelPriceDialog>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">LKR {price.toFixed(2)}</div>
      <p className="text-xs text-muted-foreground">per liter</p>
    </CardContent>
  </Card>
);

export default async function DashboardPage() {
  let fuelPrices;
  let dashboardStats;
  let chartData: { name: string; sales: any; }[];
  let dbError: string | null = null;
  const missingEnvVarError = 'Please define the MONGODB_URI environment variable inside .env.local';

  try {
    // We run them in parallel to speed up the page load
    const [prices, stats, dataForChart] = await Promise.all([
        getFuelPrices(),
        getDashboardStats(),
        getDashboardChartData()
    ]);
    fuelPrices = prices;
    dashboardStats = stats;
    chartData = dataForChart;
  } catch (error: any) {
    dbError = error.message;
    // Set default values so the rest of the page can render without crashing
    fuelPrices = { 'Lanka Auto Diesel': 0, 'Lanka Petrol': 0, 'Kerosene': 0 };
    dashboardStats = { yesterdayTotalLiters: 0, totalInventory: 0, lowStockAlerts: [] };
    chartData = [];
  }

  const { yesterdayTotalLiters, totalInventory, lowStockAlerts } = dashboardStats;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Welcome to the FMS Enterprise Fuel Station Manager."
      />
      
      {dbError && (
         <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {dbError === missingEnvVarError ? "Configuration Required" : "Database Connection Error"}
          </AlertTitle>
          <AlertDescription>
              {dbError === missingEnvVarError ? (
                <div className="space-y-2">
                  <p>The application needs a database to store its data, but the connection details are missing.</p>
                  <p>Please create a <strong>.env.local</strong> file in the root of your project and add the following line, replacing the placeholder with your actual connection string:</p>
                  <p className="font-mono text-xs mt-2 p-2 bg-destructive-foreground/10 rounded">
                    MONGODB_URI=your_mongodb_connection_string
                  </p>
                  <p>After adding the file, you may need to restart the development server for the change to take effect.</p>
                </div>
              ) : (
                <>
                  <p>Could not connect to the database. Please ensure your MongoDB server is running and the connection string in your environment is correct.</p>
                  <p className="font-mono text-xs mt-2 p-2 bg-destructive-foreground/10 rounded">
                    {dbError}
                  </p>
                </>
              )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {Object.entries(fuelPrices).map(([fuelType, price]) => (
          <FuelPriceCard key={fuelType} fuelType={fuelType as FuelType} price={price} />
        ))}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yesterday's Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(yesterdayTotalLiters).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} L</div>
            <p className="text-xs text-muted-foreground">Based on all pump sales yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(totalInventory).toLocaleString()} L</div>
            <p className="text-xs text-muted-foreground">Across all fuel types</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockAlerts.length} Alert(s)</div>
            <p className="text-xs text-muted-foreground">
              {lowStockAlerts.length > 0
                ? `${lowStockAlerts.join(', ')} running low`
                : 'All stock levels are normal'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1">
        <SalesChart data={chartData} />
      </div>
    </>
  );
}
