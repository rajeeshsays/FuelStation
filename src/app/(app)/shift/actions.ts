'use server';

import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import ShiftModel from '@/models/Shift';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/audit';

const ShiftEntrySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Shift name is required.'),
  inchargeId: z.string().min(1, 'In charge is required.'),
  startTime: z.string().min(1, 'Start time is required.'),
  endTime: z.string().min(1, 'End time is required.'),
});

export type ShiftEntryFormState = {
  message: string;
  success: boolean;
  errors?: {
    [key in keyof z.infer<typeof ShiftEntrySchema> | 'database']?: string[];
  };
};

export type DeleteShiftState = {
  message: string;
  success: boolean;
};

function revalidateAllPaths() {
  revalidatePath('/shift');
  revalidatePath('/dashboard');
}

export async function saveShiftEntry(
  prevState: ShiftEntryFormState,
  formData: FormData
): Promise<ShiftEntryFormState> {
  const validatedFields = ShiftEntrySchema.safeParse({
    id: formData.get('id') || undefined,
    name: formData.get('name'),
    inchargeId: formData.get('inchargeId'),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to save shift. Please check the fields.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, name, inchargeId, startTime, endTime } = validatedFields.data;

  try {
    await connectToDatabase();

    const payload = {
      name,
      inchargeId,
      startTime,
      endTime,
    };

    if (id) {
      const updatedEntry = await ShiftModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      });

      if (!updatedEntry) {
        throw new Error('Shift entry not found.');
      }

      await logAction('UPDATE', `Updated shift ${name}`);
    } else {
      await ShiftModel.create(payload);
      await logAction('INSERT', `Created shift ${name}`);
    }

    revalidateAllPaths();
    return { message: `Successfully ${id ? 'updated' : 'added'} shift.`, success: true };
  } catch (error: any) {
    console.error('Shift save error:', error);
    return { message: `Data Store Error: ${error.message}`, success: false, errors: { database: [error.message] } };
  }
}

export async function deleteShiftEntry(
  prevState: DeleteShiftState,
  formData: FormData
): Promise<DeleteShiftState> {
  const id = formData.get('id') as string;

  if (!id) {
    return { message: 'Error: Entry ID is missing.', success: false };
  }

  try {
    await connectToDatabase();
    const deleted = await ShiftModel.findByIdAndDelete(id);

    if (!deleted) {
      throw new Error('Shift entry not found.');
    }

    await logAction('DELETE', `Deleted shift ${deleted.name}`);
    revalidateAllPaths();

    return { message: 'Successfully deleted shift.', success: true };
  } catch (error: any) {
    console.error('Shift delete error:', error);
    return { message: `Error: ${error.message}`, success: false };
  }
}
