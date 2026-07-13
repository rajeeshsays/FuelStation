
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, PlusCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { getPumpEntries } from "@/lib/queries";
import type { StockEntry, FuelType,Pump } from "@/lib/types";
import { StockFilters } from "@/components/stock-filters";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const AddStaffDialog = dynamic(() => import('@/components/add-staff-dialog').then(mod => mod.AddStaffDialog), { ssr: false });
const DeleteStaffAction = dynamic(() => import('@/components/delete-stock-action').then(mod => mod.DeleteStockAction), { ssr: false });


export default async function PumpPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const name = searchParams?.name as string | undefined;
    const pumpEntries = await getPumpEntries({});
    
  return (
    <>
     <PageHeader title="Pump Management" description="Log incoming fuel stock and view history.">
        <AddStaffDialog>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Pump</Button>
        </AddStaffDialog>
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
                <TableHead>Name</TableHead>
              
            </TableRow>
            </TableHeader>
            <TableBody>
                {pumpEntries.length > 0 ? pumpEntries.map((entry : Pump) => (
                    <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.name}</TableCell>
                       
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
