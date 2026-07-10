
import mongoose, {Schema, Document, models, model } from 'mongoose';
export interface IStaffEntry extends Document {
    name : string,
    designation : Designation
}
type Designation = "Manager" | "Supervisor" | "Dispenser" | "Cleaner"
const StaffEntrySchema: Schema = new Schema({
    name : {type:String,required : false},
    designation : {type:String, enum: ["Manager", "Supervisor", "Dispenser", "Cleaner"],required :false},
 });
export default (models.StaffEntry as mongoose.Model<IStaffEntry>) || model<IStaffEntry>('StaffEntry', StaffEntrySchema);