
import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IShiftAssignment extends Document {
  staffId: string;
  shiftId: string;
  fromDate: Date;
  toDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ShiftAssignmentSchema = new Schema(
  {
    staffId: {
      type: String,
      required: true,
      trim: true,
    },
    shiftId: {
      type: String,
      required: true,
      trim: true,
    },
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default (models.ShiftAssignment as mongoose.Model<IShiftAssignment>) || model<IShiftAssignment>('ShiftAssignment', ShiftAssignmentSchema);