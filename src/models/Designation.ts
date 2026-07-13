
import mongoose, { Schema, Document, models, model } from 'mongoose';


export interface IDesignation extends Document {
  name: string;
}

const DesignationSchema = new Schema(
  {

    name: {
      type: String,
      required: true,
      trim: true,
    }
}
);

export default (models.Designation as mongoose.Model<IDesignation>) || model<IDesignation>('Designation', DesignationSchema);