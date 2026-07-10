import mongoose, { Schema, Document, models, model } from 'mongoose';
import type { MeterReading as MeterReadingType } from '@/lib/types';

export interface IMeterReading extends Omit<MeterReadingType, 'id'>, Document {}

const MeterReadingSchema: Schema = new Schema({
    date: { type: Date, required: true },
    nozzleId: { type: Number, required: true },
    shiftId : {type:Number,required : true},
    openingReading: { type: Number, required: true },
    closingReading: {type :Number,required : true},
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

// Index for efficient querying of readings for a specific pump and date.
MeterReadingSchema.index({ pumpId: 1, date: -1 });

export default (models.MeterReading as mongoose.Model<IMeterReading>) || model<IMeterReading>('MeterReading', MeterReadingSchema);
