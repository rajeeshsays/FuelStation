
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, PlusCircle } from "lucide-react";
import { getPumpEntries } from "@/lib/queries";
import type { Pump } from "@/lib/types";
import dynamic from "next/dynamic";

const AddPumpDialog = dynamic(() => import('@/components/add-pump-dialog').then(mod => mod.AddPumpDialog), { ssr: false });
const DeleteEntryAction = dynamic(() => import('@/components/delete-entry-action').then(mod => mod.DeleteEntryAction), { ssr: false });

import { deletePumpEntry } from '@/app/(app)/pump/actions';


export default async function PumpPage() {
    const pumpEntries = await getPumpEntries({});
    
  return (
    <>
     <PageHeader title="Pump Management" description="Create and manage fuel pumps.">
        <AddPumpDialog>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Pump</Button>
        </AddPumpDialog>
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
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
                {pumpEntries.length > 0 ? pumpEntries.map((entry : Pump) => (
                    <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.name}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <AddPumpDialog pumpEntry={entry}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </AddPumpDialog>
                            <DeleteEntryAction
                              entryId={entry.id}
                              deleteAction={deletePumpEntry}
                              itemType="pump"
                              itemName={entry.name}
                            />
                          </div>
                        </TableCell>
                    </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center h-24">
                      No pumps found.
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
        </Table>
      </div> 

    </>
  );
}
