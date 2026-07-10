
'use server';

import { z } from 'zod';
import { parseISO } from 'date-fns';
import { rebuildDerivedData } from '@/lib/engine';
import connectToDatabase from '@/lib/db';
import StockEntryModel from '@/models/StockEntry';

const StockEntrySchema = z.object({
  id: z.string().optional(),
  invoiceNumber: z.string().min(1, 'Invoice number is required.'),
  invoiceDate: z.date({ required_error: 'Invoice date is required.' }),
  fuelType: z.enum(['Lanka Auto Diesel', 'Lanka Petrol', 'Kerosene'], {
    errorMap: () => ({ message: 'Please select a fuel type.' }),
  }),
  liters: z.coerce.number().positive('Liters must be a positive number.'),
  pricePerLiter: z.coerce.number().positive('Price must be a positive number.'),
  discount: z.coerce.number().min(0, 'Discount cannot be negative.').optional().default(0),
});

export type StockEntryFormState = {
  message: string;
  success: boolean;
  errors?: {
    [key in keyof z.infer<typeof StockEntrySchema> | 'database']?: string[];
  };
};

export type DeleteStockState = {
    message: string;
    success: boolean;
};

export async function saveStockEntry(
  prevState: StockEntryFormState,
  formData: FormData
): Promise<StockEntryFormState> {
  const dateStr = formData.get('invoiceDate') as string;
  const dateFromForm = parseISO(`${dateStr}T00:00:00Z`);

  const validatedFields = StockEntrySchema.safeParse({
    id: formData.get('id') || undefined,
    invoiceNumber: formData.get('invoiceNumber'),
    invoiceDate: dateFromForm,
    fuelType: formData.get('fuelType'),
    liters: formData.get('liters'),
    pricePerLiter: formData.get('pricePerLiter'),
    discount: formData.get('discount'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to save stock. Please check the fields.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, invoiceNumber, invoiceDate, fuelType, liters, pricePerLiter, discount } = validatedFields.data;
  const finalPrice = liters * pricePerLiter - (discount || 0);

  try {
    await connectToDatabase();
    
    if (id) {
      const updatedEntry = await StockEntryModel.findByIdAndUpdate(
        id,
        { invoiceNumber, invoiceDate, fuelType, liters, pricePerLiter, discount, finalPrice },
        { new: true, runValidators: true }
      );
      if (!updatedEntry) {
          throw new Error('Stock entry not found.');
      }
    } else {
      await StockEntryModel.create({
          invoiceNumber,
          invoiceDate,
          fuelType,
          liters,
          pricePerLiter,
          discount: discount || 0,
          finalPrice,
          
      });
    }
    
    await rebuildDerivedData();
    
    return { message: `Successfully ${id ? 'updated' : 'added'} stock entry.`, success: true };
  } catch (error: any) {
    console.error('Data Store Error:', error);
    return { message: `Data Store Error: Failed to save stock entry.`, success: false, errors: { database: [error.message] } };
  }
}

export async function deleteStockEntry(prevState: DeleteStockState, formData: FormData): Promise<DeleteStockState> {
    const id = formData.get('id') as string;
    if (!id) {
        return { message: 'Error: Entry ID is missing.', success: false };
    }

    try {
        await connectToDatabase();
        const deleted = await StockEntryModel.findByIdAndDelete(id);
        if (!deleted) {
            throw new Error('Stock entry not found.');
        }
        
        await rebuildDerivedData();

        return { message: 'Successfully deleted stock entry.', success: true };
    } catch (error: any) {
        console.error('Data Store Error:', error);
        return { message: `Error: ${error.message}`, success: false };
    }
}
