
import mongoose, {Schema, Document, models, model } from 'mongoose';
export interface IStaff extends Document {
    name : string,
      designationId: {
      type:  Schema.Types.ObjectId,
      ref: 'Pump',
      required: true,
    },
}
const StaffSchema: Schema = new Schema({
    name : {type:String,required : false},
    designationId : {
      type:  Schema.Types.ObjectId,
      ref: 'Designation',
      required: true,
    },
 });
export default (models.Staff as mongoose.Model<IStaff>) || model<IStaff>('Staff', StaffSchema);