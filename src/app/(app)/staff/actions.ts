'use server';

import { z } from 'zod';
import { parseISO } from 'date-fns';
import { rebuildDerivedData } from '@/lib/engine';
import connectToDatabase from '@/lib/db';
import StaffEntryModel from '@/models/Staff';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/audit';

const StaffEntrySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Staff name is required.'),
  
});

export type StaffEntryFormState = {
  message: string;
  success: boolean;
  errors?: {
    [key in keyof z.infer<typeof StaffEntrySchema> | 'database']?: string[];
  };
};

export type DeleteStockState = {
    message: string;
    success: boolean;
};

function revalidateAllPaths() {
    revalidatePath('/staff');
    revalidatePath('/dashboard');
    revalidatePath('/inventory');
    revalidatePath('/reports');
    revalidatePath('/audit-log');
}

export async function saveStaffEntry(

  prevState: StaffEntryFormState,
  formData: FormData
): Promise<StaffEntryFormState> {
  console.log("Inside save staffentry..")
  console.log(formData.get('name'))
  const dateStr = formData.get('i') as string;
  const dateFromForm = parseISO(`${dateStr}T00:00:00Z`);

  const validatedFields = StaffEntrySchema.safeParse({
    id: formData.get('id') || undefined,
    name: formData.get('name')
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to save staff. Please check the fields.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, name} = validatedFields.data;
  

  try {
    await connectToDatabase();
    console.log("database connection is established");
    if (id) {
      const updatedEntry = await StaffEntryModel.findByIdAndUpdate(
        id,
        { name},
        { new: true, runValidators: true }
      );
      if (!updatedEntry) {
          throw new Error('Staff entry not found.');
      }
      await logAction('UPDATE', `Updated staff entry for name ${name}`);
    } else 
    {
      await StaffEntryModel.create({
          name
         
      });
      await logAction('INSERT', `Added staff entry for ${name}`);
    
    }
    await rebuildDerivedData();
    revalidateAllPaths();
    
    return { message: `Successfully ${id ? 'updated' : 'added'} staff entry.`, success: true };
  } catch (error: any) {
    console.error('Data Store Error:', error);
    return { message: `Data Store Error: Failed to save staff entry.`, success: false, errors: { database: [error.message] } };
  }
      }

export async function deleteStaffEntry(prevState: DeleteStockState, formData: FormData): Promise<DeleteStockState> {
    const id = formData.get('id') as string;
    if (!id) {
        return { message: 'Error: Entry ID is missing.', success: false };
    }

    try {
        await connectToDatabase();
        const deleted = await StaffEntryModel.findByIdAndDelete(id);
        if (!deleted) {
            throw new Error('Staff entry not found.');
        }

        await logAction('DELETE', `Deleted staff entry  ${deleted.name}`);
        
        await rebuildDerivedData();
        revalidateAllPaths();

        return { message: 'Successfully deleted staff entry.', success: true };
    } catch (error: any) {
        console.error('Data Store Error:', error);
        return { message: `Error: ${error.message}`, success: false };
    }

  }