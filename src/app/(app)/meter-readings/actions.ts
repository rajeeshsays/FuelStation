
'use server';

import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import { rebuildDerivedData } from '@/lib/engine';
import connectToDatabase from '@/lib/db';
import MeterReadingModel from '@/models/MeterReading';
import { getLatestMeterReadings } from '@/lib/queries';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/audit';

export type ReadingFormState = {
  message: string;
  success: boolean;
  errors?: Record<string, string[] | undefined>;
  fieldValues?: Record<string, string>;
};

export type UpdateReadingState = {
    message: string;
    success: boolean;
    errors?: any;
}

export type DeleteReadingState = {
    message: string;
    success: boolean;
}

// Schema for adding a batch of readings for a single day
const ReadingFormSchema = z.object({
  date: z.date({ required_error: 'A date is required.' }),
  readings: z.record(z.string()).refine(val => Object.values(val).some(v => v && v.trim() !== ''), {
    message: 'At least one meter reading must be entered.',
  }),
});

// Schema for updating a single reading
const UpdateReadingSchema = z.object({
    id: z.string(),
    reading: z.coerce.number().min(0, "Reading must be a positive number.")
});

function revalidateAllPaths() {
    revalidatePath('/meter-readings');
    revalidatePath('/dashboard');
    revalidatePath('/inventory');
    revalidatePath('/reports');
    revalidatePath('/audit-log');
}


export async function saveReadings(
  prevState: ReadingFormState,
  formData: FormData
): Promise<ReadingFormState> {
  const readingEntries = Array.from(formData.entries()).filter(([key]) => key.startsWith('reading-'));
  const readings: Record<string, string> = {};
  for (const [key, value] of readingEntries) {
    readings[key.replace('reading-', '')] = value.toString();
  }

  const dateStr = formData.get('date') as string;
  const dateFromForm = parseISO(dateStr);

  const validatedFields = ReadingFormSchema.safeParse({
    date: dateFromForm,
    readings: readings,
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid data submitted.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      fieldValues: readings,
    };
  }
  
  const { date: readingDate, readings: submittedReadings } = validatedFields.data;
  
  try {
    await connectToDatabase();
    const latestReadings = await getLatestMeterReadings(dateStr);

    for (const [pumpId, readingStr] of Object.entries(submittedReadings)) {
      if (!readingStr) continue;
      const reading = parseFloat(readingStr);
      const previousReadingValue = latestReadings.get(pumpId)?.reading;

      if (isNaN(reading)) {
        throw new Error(`Invalid reading for pump ${pumpId}. Not a number.`);
      }
      if (previousReadingValue !== undefined && reading < previousReadingValue) {
        throw new Error(`Reading for pump ${pumpId} must be >= previous reading (${previousReadingValue.toLocaleString()}).`);
      }
      const existingReading = await MeterReadingModel.findOne({ pumpId, date: readingDate });
      if (existingReading) {
        throw new Error(`A reading for pump ${pumpId} on ${format(readingDate, 'PPP')} already exists.`);
      }
    }
    
    const readingsToSave = [];
    for (const [pumpId, readingStr] of Object.entries(submittedReadings)) {
        if (!readingStr) continue;
        const reading = parseFloat(readingStr);
        readingsToSave.push({
            date: readingDate,
            pumpId,
            reading,
            sales: 0,
        });
    }

    if (readingsToSave.length > 0) {
        await MeterReadingModel.insertMany(readingsToSave);
        await logAction('INSERT', `Saved ${readingsToSave.length} new meter readings for ${format(readingDate, 'PPP')}.`);
    } else {
        return { message: 'No new readings were entered to save.', success: false };
    }

    await rebuildDerivedData();
    revalidateAllPaths();

    return { message: `Successfully saved ${readingsToSave.length} readings.`, success: true };
  } catch (error: any) {
    console.error('Data Store Error (saveReadings):', error);
    return {
      message: `Error: ${error.message}`,
      success: false,
      errors: { database: [error.message] },
      fieldValues: submittedReadings,
    };
  }
}

export async function updateMeterReading(prevState: UpdateReadingState, formData: FormData): Promise<UpdateReadingState> {
    const validatedFields = UpdateReadingSchema.safeParse({
        id: formData.get('id'),
        reading: formData.get('reading'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Invalid data.',
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { id, reading } = validatedFields.data;

    try {
        await connectToDatabase();
        const updated = await MeterReadingModel.findByIdAndUpdate(id, { reading }, { new: true });

        if (!updated) {
            throw new Error('Reading not found.');
        }

        await logAction('UPDATE', `Updated reading for pump ${updated.pumpId} on ${format(updated.date, 'PPP')} to ${updated.reading.toLocaleString()}.`);

        await rebuildDerivedData();
        revalidateAllPaths();
        
        return { message: 'Successfully updated reading.', success: true };
    } catch (error: any) {
        return { message: `Error: ${error.message}`, success: false };
    }
}


export async function deleteMeterReading(prevState: DeleteReadingState, formData: FormData): Promise<DeleteReadingState> {
    const id = formData.get('id') as string;
    if (!id) {
        return { message: 'Error: Reading ID is missing.', success: false };
    }

    try {
        await connectToDatabase();
        const deleted = await MeterReadingModel.findByIdAndDelete(id);

        if (!deleted) {
            throw new Error('Meter reading not found.');
        }

        await logAction('DELETE', `Deleted reading for pump ${deleted.pumpId} on ${format(deleted.date, 'PPP')} (Value: ${deleted.reading.toLocaleString()}).`);

        await rebuildDerivedData();
        revalidateAllPaths();

        return { message: 'Successfully deleted meter reading.', success: true };
    } catch (error: any) {
        console.error('Data Store Error:', error);
        return { message: `Error: ${error.message}`, success: false };
    }
}
