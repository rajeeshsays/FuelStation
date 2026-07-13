
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, PlusCircle } from "lucide-react";
import { getStaffEntries, getDesignationOptions } from "@/lib/queries";
import type { FuelType } from "@/lib/types";
import dynamic from "next/dynamic";

const AddStaffDialog = dynamic(() => import('@/components/add-staff-dialog').then(mod => mod.AddStaffDialog), { ssr: false });
const DeleteEntryAction = dynamic(() => import('@/components/delete-entry-action').then(mod => mod.DeleteEntryAction), { ssr: false });

import { deleteStaffEntry } from '@/app/(app)/staff/actions';


export default async function StaffPage() {
    const staffEntries = await getStaffEntries({});
    const designations = await getDesignationOptions({});
    
  return (
    <>
      <PageHeader title="Staff Management" description="Log incoming fuel stock and view history.">
        <AddStaffDialog designations = {designations} >
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Staff</Button>
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
                <TableHead>Designation</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
                {staffEntries.length > 0 ? staffEntries.map((entry) => (
                    <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.name}</TableCell>
                        <TableCell>{typeof entry.designationId === 'string' ? entry.designationId : entry.designationId?.name}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <AddStaffDialog staffEntry={entry} designations={designations}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </AddStaffDialog>
                            <DeleteEntryAction
                              entryId={entry.id}
                              deleteAction={deleteStaffEntry}
                              itemType="staff"
                              itemName={entry.name}
                            />
                          </div>
                        </TableCell>
                    </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      No staff entries found.
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
        </Table>
      </div>

    </>
  );
}
