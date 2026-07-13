
'use server';
import { z } from 'zod';
import { parseISO } from 'date-fns';
import { rebuildDerivedData } from '@/lib/engine';
import connectToDatabase from '@/lib/db';
import StaffEntryModel from '@/models/Staff';

const StaffEntrySchema = z.object({
  id: z.string().optional(),
  name : z.string().min(1, "Staff name is required.")
    .regex(/^[A-Za-z\s]+$/, "Staff name must contain only letters."),
  // staffType: z.enum(['Manager', 'Supervisor', 'FuelDispenser','Cleaning'], {
  //   errorMap: () => ({ message: 'Please select a staff type.' }),
  //}),
});

export type StaffEntryFormState = {
  message: string;
  success: boolean;
  errors?: {
    [key in keyof z.infer<typeof StaffEntrySchema> | 'database']?: string[];
  };
};

export type DeleteStaffState = {
    message: string;
    success: boolean;
};

export async function saveStaffEntry(
  prevState: StaffEntryFormState,
  formData: FormData
): Promise<StaffEntryFormState> {
  console.log(formData);
  const dateStr = formData.get('name') as string;


  const validatedFields = StaffEntrySchema.safeParse({
    id: formData.get('id') || undefined,
    name: formData.get('name'),
   
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
    
    if (id) {
      const updatedEntry = await StaffEntryModel.findByIdAndUpdate(
        id,
        { name},
        { new: true, runValidators: true }
      );
      if (!updatedEntry) {
          throw new Error('Staff entry not found.');
      }
    } else {
      await StaffEntryModel.create({
          name,
       
      });
    }
    console.log(StaffEntryModel.collection.name);
    await rebuildDerivedData();
    
    return { message: `Successfully ${id ? 'updated' : 'added'} staff entry.`, success: true };
  } catch (error: any) {
    console.error('Data Store Error:', error);
    return { message: `Data Store Error: Failed to save staff entry.`, success: false, errors: { database: [error.message] } };
  }
}

export async function deleteStaffEntry(prevState: DeleteStaffState, formData: FormData): Promise<DeleteStaffState> {
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
        
        await rebuildDerivedData();

        return { message: 'Successfully deleted staff entry.', success: true };
    } catch (error: any) {
        console.error('Data Store Error:', error);
        return { message: `Error: ${error.message}`, success: false };
    }
}
