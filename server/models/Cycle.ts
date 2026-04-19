import mongoose, { Schema, Document } from 'mongoose';
import { ICycle } from '../../shared/types';

export interface ICycleDocument extends Omit<ICycle, '_id'>, Document {}

const CycleSchema = new Schema<ICycleDocument>(
  {
    projectId:  { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    name:       { type: String, required: true, maxlength: 100 },
    startDate:  { type: Date, required: true },
    endDate:    { type: Date, required: true },
    status:     {
      type:    String,
      enum:    ['upcoming', 'active', 'completed'],
      default: 'upcoming',
    },
    description: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true }
);

CycleSchema.index({ projectId: 1, status: 1 });

CycleSchema.pre('save', function (next) {
  const now = new Date();
  if (now < this.startDate) {
    this.status = 'upcoming';
  } else if (now >= this.startDate && now <= this.endDate) {
    this.status = 'active';
  } else {
    this.status = 'completed';
  }
  next();
});

export default mongoose.model<ICycleDocument>('Cycle', CycleSchema);
