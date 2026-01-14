
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, PlusCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { getStockEntries } from "@/lib/queries";
import type { StockEntry, FuelType } from "@/lib/types";
import { StockFilters } from "@/components/stock-filters";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const AddStockDialog = dynamic(() => import('@/components/add-stock-dialog').then(mod => mod.AddStockDialog), { ssr: false });
const DeleteStockAction = dynamic(() => import('@/components/delete-stock-action').then(mod => mod.DeleteStockAction), { ssr: false });


export default async function StockPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const fromParam = searchParams?.from as string | undefined;
    const toParam = searchParams?.to as string | undefined;
    const fuelType = (searchParams?.fuelType as FuelType | 'all') || 'all';

    const from = fromParam ? parseISO(`${fromParam}T00:00:00Z`) : undefined;
    const to = toParam ? parseISO(`${toParam}T00:00:00Z`) : undefined;
    
    const stockEntries = await getStockEntries({ from, to, fuelType });
    
  return (
    <>
      <PageHeader title="Stock Management" description="Log incoming fuel stock and view history.">
        <AddStockDialog>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Stock</Button>
        </AddStockDialog>
      </PageHeader>
      
      <div className="mb-6">
        <Suspense fallback={<div>Loading filters...</div>}>
          <StockFilters />
        </Suspense>
      </div>

      <div className="border rounded-lg">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Invoice No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Fuel Type</TableHead>
                <TableHead className="text-right">Liters</TableHead>
                <TableHead className="text-right">Price/Liter</TableHead>
                <TableHead className="text-right">Final Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
                {stockEntries.length > 0 ? stockEntries.map((entry) => (
                    <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.invoiceNumber}</TableCell>
                        <TableCell>{format(entry.invoiceDate, "yyyy-MM-dd")}</TableCell>
                        <TableCell>{entry.fuelType}</TableCell>
                        <TableCell className="text-right">{Number(entry.liters).toLocaleString()}</TableCell>
                        <TableCell className="text-right">LKR {Number(entry.pricePerLiter).toFixed(2)}</TableCell>
                        <TableCell className="text-right">LKR {Number(entry.finalPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                        <TableCell>
                            <div className="flex justify-end gap-1">
                                <AddStockDialog stockEntry={entry}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">Edit</span>
                                    </Button>
                                </AddStockDialog>
                                <DeleteStockAction entryId={entry.id} />
                            </div>
                        </TableCell>
                    </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      No stock entries found for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
        </Table>
      </div>

    </>
  );
}
