
import mongoose, { Schema, Document, models, model } from 'mongoose';
import type { FuelType } from '@/lib/types';

export interface IFuelPrice extends Document {
    fuelType: FuelType;
    price: number;
}

const FuelPriceSchema: Schema = new Schema({
    fuelType: { 
        type: String, 
        required: true, 
        unique: true, 
        enum: ['Lanka Auto Diesel', 'LP92', 'LP95', 'Kerosene'] 
    },
    price: { type: Number, required: true },
}, {
    timestamps: true,
});

export default (models.FuelPrice as mongoose.Model<IFuelPrice>) || model<IFuelPrice>('FuelPrice', FuelPriceSchema);
