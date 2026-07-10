import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface INozzle extends Document {
code : string,
pumpid : number
} 

const NozzleSchema = new Schema(
  {
    code: {
      type: String,
      code: true,
      trim: true,
    },

    pumpId: {
      type: Number,
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
export default (models.Nozzle as mongoose.Model<INozzle>) || model<INozzle>('Nozzle', NozzleSchema);