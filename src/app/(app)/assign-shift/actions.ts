'use server';

import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import ShiftAssignmentModel from '@/models/ShiftAssign';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/audit';

const AssignmentSchema = z.object({
  id: z.string().optional(),
  staffId: z.string().min(1, 'Staff is required.'),
  shiftId: z.string().min(1, 'Shift is required.'),
  fromDate: z.string().min(1, 'Start date is required.'),
  toDate: z.string().optional(),
});

export type AssignmentFormState = {
  message: string;
  success: boolean;
  errors?: {
    [key in keyof z.infer<typeof AssignmentSchema> | 'database']?: string[];
  };
};

export type DeleteAssignmentState = {
  message: string;
  success: boolean;
};

function revalidateAllPaths() {
  revalidatePath('/assign-shift');
  revalidatePath('/dashboard');
}

export async function saveAssignmentEntry(
  prevState: AssignmentFormState,
  formData: FormData
): Promise<AssignmentFormState> {
  const validatedFields = AssignmentSchema.safeParse({
    id: formData.get('id') || undefined,
    staffId: formData.get('staffId'),
    shiftId: formData.get('shiftId'),
    fromDate: formData.get('fromDate'),
    toDate: formData.get('toDate') || undefined,
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to save assignment. Please check the fields.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, staffId, shiftId, fromDate, toDate } = validatedFields.data;

  try {
    await connectToDatabase();

    const payload = {
      staffId,
      shiftId,
      fromDate: new Date(fromDate),
      toDate: toDate ? new Date(toDate) : undefined,
    };

    if (id) {
      const updatedEntry = await ShiftAssignmentModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      });

      if (!updatedEntry) {
        throw new Error('Assignment entry not found.');
      }

      await logAction('UPDATE', `Updated shift assignment`);
    } else {
      await ShiftAssignmentModel.create(payload);
      await logAction('INSERT', `Created shift assignment`);
    }

    revalidateAllPaths();
    return { message: `Successfully ${id ? 'updated' : 'added'} assignment.`, success: true };
  } catch (error: any) {
    console.error('Assignment save error:', error);
    return { message: `Data Store Error: ${error.message}`, success: false, errors: { database: [error.message] } };
  }
}

export async function deleteAssignmentEntry(
  prevState: DeleteAssignmentState,
  formData: FormData
): Promise<DeleteAssignmentState> {
  const id = formData.get('id') as string;

  if (!id) {
    return { message: 'Error: Entry ID is missing.', success: false };
  }

  try {
    await connectToDatabase();
    const deleted = await ShiftAssignmentModel.findByIdAndDelete(id);

    if (!deleted) {
      throw new Error('Assignment entry not found.');
    }

    await logAction('DELETE', `Deleted shift assignment`);
    revalidateAllPaths();

    return { message: 'Successfully deleted assignment.', success: true };
  } catch (error: any) {
    console.error('Assignment delete error:', error);
    return { message: `Error: ${error.message}`, success: false };
  }
}
