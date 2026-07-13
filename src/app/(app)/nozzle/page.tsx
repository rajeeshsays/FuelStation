
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, PlusCircle } from "lucide-react";
import { getNozzleEntries, getPumpOptions } from "@/lib/queries";
import type { Nozzle } from "@/lib/types";
import dynamic from "next/dynamic";

const AddNozzleDialog = dynamic(() => import('@/components/add-nozzle-dialog').then(mod => mod.AddNozzleDialog), { ssr: false });
const DeleteEntryAction = dynamic(() => import('@/components/delete-entry-action').then(mod => mod.DeleteEntryAction), { ssr: false });

import { deleteNozzleEntry } from '@/app/(app)/nozzle/actions';


export default async function NozzlePage() {
    const nozzleEntries = await getNozzleEntries({});
    const pumps = await getPumpOptions({});
    
  return (
    <>
      <PageHeader title="Nozzle Management" description="Create and manage nozzle assignments.">
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
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
                {nozzleEntries.length > 0 ? nozzleEntries.map((entry : Nozzle) => (
                    <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.nozzleCode}</TableCell>
                        <TableCell>{typeof entry.pumpId === 'string' ? entry.pumpId : entry.pumpId?.name}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <AddNozzleDialog nozzleEntry={entry} pumps={pumps}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </AddNozzleDialog>
                            <DeleteEntryAction
                              entryId={entry.id}
                              deleteAction={deleteNozzleEntry}
                              itemType="nozzle"
                              itemName={entry.nozzleCode}
                            />
                          </div>
                        </TableCell>
                    </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      No nozzles found.
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
        </Table>
      </div>

    </>
  );
}
