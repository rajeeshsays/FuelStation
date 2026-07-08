
import mongoose, { Schema, Document, models, model } from 'mongoose';
import JournalDetailsSchema from "./JournalDetail"
import { IJournalDetails } from './JournalDetail';
export interface IJournal extends Document {
    journalNo : number,
    journalDate : Date ,
    details: IJournalDetails[]
}

const JournalSchema: Schema = new Schema({
    journalNo : {type:Number,required : true},
    journalDate : {type: Date ,required : true},
    details: [JournalDetailsSchema] 
       

}, {
    timestamps: true,
});

export default (models.Journal as mongoose.Model<IJournal>) || model<IJournal>('Journal', JournalSchema);