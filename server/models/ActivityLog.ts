import mongoose, { Schema, Document } from 'mongoose';
import { IActivityLog } from '../../shared/types';

export interface IActivityLogDocument extends Omit<IActivityLog, '_id'>, Document {}

const ActivityLogSchema = new Schema<IActivityLogDocument>(
  {
    entityType: {
      type: String,
      enum: ['Task', 'Project', 'Cycle'], // Adjusted to match shared types
      required: true,
    },
    entityId:   { type: Schema.Types.ObjectId, required: true },
    userId:     { type: Schema.Types.ObjectId, ref: 'User', required: true },

    action:     { type: String, required: true },
    metadata:   { type: Schema.Types.Mixed, default: {} },
    
    // Note: old schema had oldValue, newValue, message. 
    // We consolidate them into metadata to strictly match the IActivityLog interface.
  },
  {
    timestamps: true,
  }
);

ActivityLogSchema.index({ entityId: 1, createdAt: -1 });
ActivityLogSchema.index({ userId: 1,   createdAt: -1 });

export default mongoose.model<IActivityLogDocument>('ActivityLog', ActivityLogSchema);
