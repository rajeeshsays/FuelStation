
'use server';

import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import FuelPriceModel from '@/models/FuelPrice';
import { revalidatePath } from 'next/cache';
import type { FuelType } from '@/lib/types';
import { rebuildDerivedData } from '@/lib/engine';
import { logAction } from '@/lib/audit';

const UpdatePriceSchema = z.object({
    fuelType: z.enum(['Lanka Auto Diesel', 'LP92', 'LP95', 'Kerosene']),
    price: z.coerce.number().positive('Price must be a positive number.'),
});

export type UpdatePriceState = {
    message: string;
    success: boolean;
    errors?: {
        price?: string[];
    };
};

export async function updateFuelPrice(prevState: UpdatePriceState, formData: FormData): Promise<UpdatePriceState> {
    const validatedFields = UpdatePriceSchema.safeParse({
        fuelType: formData.get('fuelType'),
        price: formData.get('price'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Invalid data submitted.',
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { fuelType, price } = validatedFields.data;

    try {
        await connectToDatabase();
        
        await FuelPriceModel.findOneAndUpdate(
            { fuelType },
            { $set: { price } },
            { upsert: true, new: true, runValidators: true }
        );

        // Log this action
        await logAction('UPDATE', `Updated price for ${fuelType} to LKR ${price.toFixed(2)}.`);

        // Rebuild derived data to apply the new price to future calculations
        await rebuildDerivedData();
        
        // Revalidate paths where prices or sales data are shown
        revalidatePath('/dashboard');
        revalidatePath('/reports');
        revalidatePath('/stock'); 
        revalidatePath('/inventory');
        revalidatePath('/meter-readings');
        
        return { message: `${fuelType} price updated successfully. Future sales will be calculated with this new price.`, success: true };

    } catch (error: any) {
        console.error('Data Store Error (updateFuelPrice):', error);
        return { message: `Error: ${error.message}`, success: false };
    }
}
