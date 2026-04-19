import mongoose, { Schema, Document } from 'mongoose';
import { IFocusSession } from '../../shared/types';

export interface IFocusSessionDocument extends Omit<IFocusSession, '_id'>, Document {
  elapsedMinutes: number;
}

const focusSessionSchema = new Schema<IFocusSessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    habitId: {
      type: Schema.Types.ObjectId,
      ref: 'Habit',
      default: null,
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Duration is required'],
      default: 25,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    sessionDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

focusSessionSchema.virtual('elapsedMinutes').get(function (this: any) {
  if (!this.endTime) return 0;
  return Math.round((this.endTime - this.startTime) / 60000);
});

export default mongoose.model<IFocusSessionDocument>('FocusSession', focusSessionSchema);
