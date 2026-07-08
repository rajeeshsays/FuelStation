
import mongoose, { Schema, Document, models, model } from 'mongoose';
import JournalDetailsSchema from "./JournalDetail"
export interface IStaff extends Document {
    name : string,
    mobileNumber : string 
}
const StaffSchema: Schema = new Schema({
    name : {type:String,required : false},
    mobileNumber : {type: String ,required : false},
 });
export default (models.Staff as mongoose.Model<IStaff>) || model<IStaff>('Staff', StaffSchema);