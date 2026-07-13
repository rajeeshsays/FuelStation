
import { timeStamp } from 'console';
import mongoose, { Schema, Document, models, model } from 'mongoose';


export interface IPumpEntry extends Document {
  name: string;
}

const PumpEntrySchema = new Schema(
  {

    name: {
      type: String,
      required: true,
      trim: true,
    },

  },
  {
    timestamps: true,
  }
);

export default (models.Pump as mongoose.Model<IPumpEntry>) || model<IPumpEntry>('Pump', PumpEntrySchema);