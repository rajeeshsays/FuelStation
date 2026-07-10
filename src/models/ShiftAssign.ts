
import mongoose, { Schema, Document, models, model } from 'mongoose';
export interface IShiftAssign extends Document {
    name : string,
}

const ShiftAssignSchema = new Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  shiftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shift",
    required: true,
  },

  fromDate: Date,
  toDate: Date,

},
{
  timestamps : true
});

export default (models.StaffEntry as mongoose.Model<IShiftAssign>) || model<IShiftAssign>('StaffEntry', ShiftAssignSchema);