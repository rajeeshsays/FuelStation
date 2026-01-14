import mongoose, { Schema, Document, models, model } from 'mongoose';
import type { DailySale as DailySaleType } from '@/lib/types';

export interface IDailySale extends Omit<DailySaleType, 'id'>, Document {}

const DailySaleSchema: Schema = new Schema({
    date: { type: Date, required: true },
    fuelType: { type: String, required: true, enum: ['Lanka Auto Diesel', 'LP92', 'LP95', 'Kerosene'] },
    pumpId: { type: String, required: true },
    litersSold: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
        }
    },
    toObject: {
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
        }
    }
});

// Index for efficient filtering of sales data in reports.
DailySaleSchema.index({ date: 1, fuelType: 1, pumpId: 1 });

export default (models.DailySale as mongoose.Model<IDailySale>) || model<IDailySale>('DailySale', DailySaleSchema);
