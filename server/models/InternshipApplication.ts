import mongoose, { Schema, Document } from 'mongoose';
import { IInternshipApplication } from '../../shared/types';

export interface IInternshipApplicationDocument extends Omit<IInternshipApplication, '_id'>, Document {
  jobLink?: string; // from original JS
  salary?: string;
  location?: string;
  appliedDate?: Date; // maps to applicationDate
}

const internshipSchema = new Schema<IInternshipApplicationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Applied', 'OA', 'Interview', 'Rejected', 'Offer'],
      default: 'Applied',
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    jobLink: {
      type: String,
      default: null,
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    salary: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IInternshipApplicationDocument>('InternshipApplication', internshipSchema);
