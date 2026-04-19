import mongoose, { Schema, Document } from 'mongoose';
import { IHabit } from '../../shared/types';

export interface IHabitDocument extends Omit<IHabit, '_id'>, Document {
  completionRate: number;
}

const trackableFields = {
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
};

const habitSchema = new Schema<IHabitDocument>(
  {
    ...trackableFields,
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['dsa', 'project', 'learning', 'other'],
      default: 'other',
    },
    recurrence: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
    },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    totalCompletions: { type: Number, default: 0 },
    targetDaysPerWeek: { type: Number, default: 1 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

habitSchema.virtual('completionRate').get(function (this: any) {
  return this._completionRate || 0;
});

export default mongoose.model<IHabitDocument>('Habit', habitSchema);
