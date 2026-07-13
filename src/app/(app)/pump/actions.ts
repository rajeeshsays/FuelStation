'use server';

import { z } from 'zod';
import { rebuildDerivedData } from '@/lib/engine';
import connectToDatabase from '@/lib/db';
import PumpEntryModel from '@/models/Pump';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/audit';

const PumpEntrySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Pump name is required.'),
});

export type PumpEntryFormState = {
  message: string;
  success: boolean;
  errors?: {
    [key in keyof z.infer<typeof PumpEntrySchema> | 'database']?: string[];
  };
};

export type DeletePumpState = {
  message: string;
  success: boolean;
};

function revalidateAllPaths() {
  revalidatePath('/pump');
  revalidatePath('/nozzle');
  revalidatePath('/dashboard');
  revalidatePath('/inventory');
  revalidatePath('/reports');
  revalidatePath('/audit-log');
}

export async function savePumpEntry(
  prevState: PumpEntryFormState,
  formData: FormData
): Promise<PumpEntryFormState> {
  const validatedFields = PumpEntrySchema.safeParse({
    id: formData.get('id') || undefined,
    name: formData.get('name'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to save pump. Please check the fields.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, name } = validatedFields.data;

  try {
    await connectToDatabase();
    if (id) {
      const updatedEntry = await PumpEntryModel.findByIdAndUpdate(
        id,
        { name },
        { new: true, runValidators: true }
      );
      if (!updatedEntry) {
        throw new Error('Pump not found.');
      }
      await logAction('UPDATE', `Updated pump entry for ${name}`);
    } else {
      await PumpEntryModel.create({ name });
      await logAction('INSERT', `Added pump entry for ${name}`);
    }
    await rebuildDerivedData();
    revalidateAllPaths();

    return { message: `Successfully ${id ? 'updated' : 'added'} pump entry.`, success: true };
  } catch (error: any) {
    console.error('Data Store Error:', error);
    return { message: `Data Store Error: Failed to save pump entry.`, success: false, errors: { database: [error.message] } };
  }
}

export async function deletePumpEntry(prevState: DeletePumpState, formData: FormData): Promise<DeletePumpState> {
  const id = formData.get('id') as string;
  if (!id) {
    return { message: 'Error: Entry ID is missing.', success: false };
  }

  try {
    await connectToDatabase();
    const deleted = await PumpEntryModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new Error('Pump entry not found.');
    }

    await logAction('DELETE', `Deleted pump entry ${deleted.name}`);

    await rebuildDerivedData();
    revalidateAllPaths();

    return { message: 'Successfully deleted pump entry.', success: true };
  } catch (error: any) {
    console.error('Data Store Error:', error);
    return { message: `Error: ${error.message}`, success: false };
  }
}
