import mongoose, { Schema, Document } from 'mongoose';
import { IHabitLog } from '../../shared/types';

export interface IHabitLogDocument extends Omit<IHabitLog, '_id'>, Document {}

const habitLogSchema = new Schema<IHabitLogDocument>(
  {
    habitId: {
      type: Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    logDate: {
      type: Date,
      default: Date.now,
    },
    commitCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

habitLogSchema.index({ habitId: 1, userId: 1, logDate: 1 }, { unique: false });

export default mongoose.model<IHabitLogDocument>('HabitLog', habitLogSchema);
