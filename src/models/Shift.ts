
import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IShift extends Document {
  name: string;
  inchargeId: string;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShiftSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    inchargeId: {
      type: String,
      required: true,
      trim: true,
    },

    startTime: {
      type: String,
      required: true,
      trim: true,
    },

    endTime: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default (models.Shift as mongoose.Model<IShift>) || model<IShift>('Shift', ShiftSchema);