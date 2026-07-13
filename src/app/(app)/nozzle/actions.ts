'use server';

import { z } from 'zod';
import { rebuildDerivedData } from '@/lib/engine';
import connectToDatabase from '@/lib/db';
import NozzleEntryModel from '@/models/Nozzle';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/audit';

const NozzleEntrySchema = z.object({
  id: z.string().optional(),
  nozzleCode: z.string().min(1, 'Nozzle code is required.'),
  pumpId: z.string().min(1, 'Pump is required.'),
});

export type NozzleEntryFormState = {
  message: string;
  success: boolean;
  errors?: {
    [key in keyof z.infer<typeof NozzleEntrySchema> | 'database']?: string[];
  };
};

export type DeleteNozzleState = {
    message: string;
    success: boolean;
};

function revalidateAllPaths() {
    revalidatePath('/nozzle');
    revalidatePath('/dashboard');
    revalidatePath('/inventory');
    revalidatePath('/reports');
    revalidatePath('/audit-log');
}

export async function saveNozzleEntry (
  prevState: NozzleEntryFormState,
  formData: FormData
): Promise<NozzleEntryFormState> {
  const validatedFields = NozzleEntrySchema.safeParse({
    id: formData.get('id') || undefined,
    nozzleCode: formData.get('nozzleCode'),
    pumpId: formData.get('pumpId'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to save nozzle. Please check the fields.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, nozzleCode,pumpId} = validatedFields.data;
  

  try {
    await connectToDatabase();
    console.log("database connection is established");
    if (id) {
      const updatedEntry = await NozzleEntryModel.findByIdAndUpdate(
        id,
        { nozzleCode},
        { new: true, runValidators: true }
      );
      if (!updatedEntry) {
          throw new Error('Nozzle not found.');
      }
      await logAction('UPDATE', `Updated nozzle entry for code ${nozzleCode}`);
    } else 
    {
      await NozzleEntryModel.create({
          nozzleCode,
          pumpId
         
      });
      await logAction('INSERT', `Added nozzle entry for ${nozzleCode}`);
    
    }
    await rebuildDerivedData();
    revalidateAllPaths();
    
    return { message: `Successfully ${id ? 'updated' : 'added'} nozzle entry.`, success: true };
  } catch (error: any) {
    console.error('Data Store Error:', error);
    return { message: `Data Store Error: Failed to save nozzle entry.`, success: false, errors: { database: [error.message] } };
  }
      }

export async function deleteNozzleEntry(prevState: DeleteNozzleState, formData: FormData): Promise<DeleteNozzleState> {
    const id = formData.get('id') as string;
    if (!id) {
        return { message: 'Error: Entry ID is missing.', success: false };
    }

    try {
        await connectToDatabase();
        const deleted = await NozzleEntryModel.findByIdAndDelete(id);
        if (!deleted) {
            throw new Error('Nozzle entry not found.');
        }

        await logAction('DELETE', `Deleted nozzle entry  ${deleted.nozzleCode}`);
        
        await rebuildDerivedData();
        revalidateAllPaths();

        return { message: 'Successfully deleted nozzle entry.', success: true };
    } catch (error: any) {
        console.error('Data Store Error:', error);
        return { message: `Error: ${error.message}`, success: false };
    }

  }