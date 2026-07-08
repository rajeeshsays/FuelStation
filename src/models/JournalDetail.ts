
import mongoose, { Schema, Document, models, model } from 'mongoose';
import type { FuelType } from '@/lib/types';

export interface IJournalDetails {
    debit :  Number,
    credit :  Number,
    accHeadId : Number,
    description :  Number,
    createdAt :  Number,
    updateAt : Number,
}  

const JournalDetailsSchema: Schema = new Schema({
    accHeadId : {type:Number,required : true},
    debit : {type : Number, required : true,default:0},
    credit : {type : Number,required : true,default:0},
    description : {type: Number,required : false},
    createdAt : {type : Number,required : false},
    updateAt : {type :Number,required : false},

}
,
 {   _id: false, // Don't create a separate _id for each detail unless you need one
}
)

export default (models.JournalDetails as mongoose.Model<IJournalDetails>) || model<IJournalDetails>('JournalDetails', JournalDetailsSchema);