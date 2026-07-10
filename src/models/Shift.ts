
import { timeStamp } from 'console';
import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IShiftEntry extends Document {
  name: string;
  inchargeId: number;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ShiftEntrySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    inchargeId: {
      type: Number,
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default (models.ShiftEntry as mongoose.Model<IShiftEntry>) || model<IShiftEntry>('ShiftEntry', ShiftEntrySchema);