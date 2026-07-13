
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, PlusCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { getNozzleEntries,getPumpOptions } from "@/lib/queries";
import type { Nozzle, FuelType } from "@/lib/types";
import { StockFilters } from "@/components/stock-filters";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const AddNozzleDialog = dynamic(() => import('@/components/add-nozzle-dialog').then(mod => mod.AddNozzleDialog), { ssr: false });
const DeleteStaffAction = dynamic(() => import('@/components/delete-stock-action').then(mod => mod.DeleteStockAction), { ssr: false });


export default async function NozzlePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const pump = (searchParams?.pumpId  || 'all') || 'all';
    const nozzleEntries = await getNozzleEntries({});
    console.log(nozzleEntries);
    const pumps = await getPumpOptions({});
    
  return (
    <>
      <PageHeader title="Nozzle Management" description="Log incoming fuel stock and view history.">
        <AddNozzleDialog pumps={pumps} >
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Nozzle</Button>
        </AddNozzleDialog>
      </PageHeader>
      
      {/* <div className="mb-6">
        <Suspense fallback={<div>Loading filters...</div>}>
          <StaffFilters />
        </Suspense>
      </div> */}

      <div className="border rounded-lg">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Nozzle Code</TableHead>
                  <TableHead>Pump Name</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
                {nozzleEntries.length > 0 ? nozzleEntries.map((entry : Nozzle) => (
                    <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.nozzleCode}</TableCell>
                         <TableCell className="font-medium">{entry.pumpId.name}</TableCell>
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
