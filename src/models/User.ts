
import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password?: string;
  isActive: boolean;
  otp?: string;
  otpExpires?: Date;
}

const UserSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: false },
  isActive: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
}, {
    timestamps: true
});


// Index for faster login queries
UserSchema.index({ email: 1, isActive: 1 });

// Avoid pre-hashing password if it's not modified
UserSchema.pre('save', function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    // Hashing logic will be in the server action
    next();
});

export default (models.User as mongoose.Model<IUser>) || model<IUser>('User', UserSchema);
