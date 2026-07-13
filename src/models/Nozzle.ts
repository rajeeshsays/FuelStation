import mongoose, { Schema, Document, models, model, Types } from 'mongoose';

export interface INozzle extends Document {
nozzleCode : string,
pumpId : Types.ObjectId
} 

const NozzleSchema = new Schema(
  {
    nozzleCode: {
      type: String,
      required: true,
      trim: true,
    },

    pumpId: {
      type:  Schema.Types.ObjectId,
      ref: 'Pump',
      required: true,
    },
   },
  {
    timestamps: true,
  }
);
export default (models.Nozzle as mongoose.Model<INozzle>) || model<INozzle>('Nozzle', NozzleSchema);