import { PageHeader } from '@/components/page-header';
import { AddShiftDialog } from '@/components/add-shift-dialog';
import { DeleteShiftAction } from '@/components/delete-shift-action';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, PlusCircle } from 'lucide-react';
import { getShiftEntries, getShiftInchargeOptions } from '@/lib/queries';
import type { Shift } from '@/lib/types';

export default async function ShiftPage() {
  const shifts = await getShiftEntries({});
  const inchargeOptions = await getShiftInchargeOptions();

  return (
    <>
      <PageHeader title="Shift Management" description="Create and manage work shifts.">
        <AddShiftDialog inchargeOptions={inchargeOptions}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Shift
          </Button>
        </AddShiftDialog>
      </PageHeader>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>In Charge</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.length > 0 ? (
              shifts.map((shift: Shift) => (
                <TableRow key={shift.id}>
                  <TableCell className="font-medium">{shift.name}</TableCell>
                  <TableCell>{shift.inchargeName}</TableCell>
                  <TableCell>{shift.startTime}</TableCell>
                  <TableCell>{shift.endTime}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <AddShiftDialog shiftEntry={shift} inchargeOptions={inchargeOptions}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </AddShiftDialog>
                    <DeleteShiftAction entryId={shift.id} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No shifts have been created yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
