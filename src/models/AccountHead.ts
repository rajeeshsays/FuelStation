
import mongoose, { Schema, Document, models, model } from 'mongoose';


export interface IAccountHead extends Document {
    accHeadId : Number,
    accHeadName : String,
    accGroupId : Number,
}

const AccountHeadSchema: Schema = new Schema({
    accHeadId : {type:Number,required:true},
    accHeadName : {type:String,required : true},
    accGroupId : {type : Number,required:false},
})

export default (models.AccountHead as mongoose.Model<IAccountHead>) || model<IAccountHead>('AccountHead', AccountHeadSchema);