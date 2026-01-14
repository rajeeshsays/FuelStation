
import mongoose, { Schema, Document, models, model } from 'mongoose';
import type { AuditLogMethod } from '@/lib/types';

export interface IAuditLog extends Document {
  method: AuditLogMethod;
  description: string;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema({
    method: {
        type: String,
        required: true,
        enum: ['INSERT', 'UPDATE', 'DELETE'],
    },
    description: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
        }
    },
    toObject: {
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
        }
    }
});

// Index for efficient filtering in the audit log view.
AuditLogSchema.index({ createdAt: -1, method: 1 });

// Add a TTL index to automatically delete documents after 2 years
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 });

export default (models.AuditLog as mongoose.Model<IAuditLog>) || model<IAuditLog>('AuditLog', AuditLogSchema);
