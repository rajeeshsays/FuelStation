
import mongoose, { Schema, Document, models, model } from 'mongoose';
import JournalDetailsSchema from "./JournalDetail"
export interface IStaffEntry extends Document {
    name : string,
}
const StaffEntrySchema: Schema = new Schema({
    name : {type:String,required : false},
    
 });
export default (models.StaffEntry as mongoose.Model<IStaffEntry>) || model<IStaffEntry>('StaffEntry', StaffEntrySchema);