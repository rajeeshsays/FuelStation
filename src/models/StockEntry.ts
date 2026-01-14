
import mongoose, { Schema, Document, models, model } from 'mongoose';
import type { StockEntry as StockEntryType } from '@/lib/types';

// The mongoose document interface
export interface IStockEntry extends Omit<StockEntryType, 'id'>, Document {}

// The mongoose schema
const StockEntrySchema: Schema = new Schema({
    invoiceNumber: { type: String, required: true },
    invoiceDate: { type: Date, required: true },
    fuelType: { type: String, required: true, enum: ['Lanka Auto Diesel', 'LP92', 'LP95', 'Kerosene'] },
    pricePerLiter: { type: Number, required: true },
    liters: { type: Number, required: true },
    discount: { type: Number, required: true, default: 0 },
    finalPrice: { type: Number, required: true },
    invoicePhotoUrl: { type: String },
}, {
    timestamps: true, // This will add createdAt and updatedAt fields
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

// Index for efficient filtering of stock entries in the stock view.
StockEntrySchema.index({ invoiceDate: -1, fuelType: 1 });

// Create the model, reusing it if it already exists
export default (models.StockEntry as mongoose.Model<IStockEntry>) || model<IStockEntry>('StockEntry', StockEntrySchema);
