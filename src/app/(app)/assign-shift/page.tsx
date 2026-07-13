import { PageHeader } from '@/components/page-header';
import { AddAssignmentDialog } from '@/components/add-assignment-dialog';
import { DeleteAssignmentAction } from '@/components/delete-assignment-action';
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
import { format } from 'date-fns';
import { getShiftAssignmentEntries, getShiftEntries, getStaffEntries } from '@/lib/queries';
import type { ShiftAssignment } from '@/lib/types';

export default async function AssignShiftPage() {
  const assignments = await getShiftAssignmentEntries({});
  const staffOptions = await getStaffEntries({});
  const shiftOptions = await getShiftEntries({});

  return (
    <>
      <PageHeader title="Shift Assignment" description="Assign staff members to shifts.">
        <AddAssignmentDialog staffOptions={staffOptions} shiftOptions={shiftOptions}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Assign Shift
          </Button>
        </AddAssignmentDialog>
      </PageHeader>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.length > 0 ? (
              assignments.map((assignment: ShiftAssignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>{assignment.staffName}</TableCell>
                  <TableCell>{assignment.shiftName}</TableCell>
                  <TableCell>{format(new Date(assignment.fromDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{assignment.toDate ? format(new Date(assignment.toDate), 'MMM dd, yyyy') : 'Open'}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <AddAssignmentDialog assignment={assignment} staffOptions={staffOptions} shiftOptions={shiftOptions}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </AddAssignmentDialog>
                    <DeleteAssignmentAction entryId={assignment.id} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No assignments have been created yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
