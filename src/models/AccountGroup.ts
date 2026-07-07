
import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IAccountGroup extends Document {
 accGroupId : Number,
    accGroupName : String,
}

const AccountGroupSchema: Schema = new Schema({
    accGroupId : {type:Number,required:true},
    accGroupName : {type:String,required : true},
    
})
export default (models.AccountGroup as mongoose.Model<IAccountGroup>) || model<IAccountGroup>('AccountGroup', AccountGroupSchema);