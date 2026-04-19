import mongoose, { Schema, Document } from 'mongoose';
import { IProject } from '../../shared/types';

export interface IProjectDocument extends Omit<IProject, '_id'>, Document {}

const ProjectSchema = new Schema<IProjectDocument>(
  {
    name:        { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: '', maxlength: 500 },
    color:       { type: String, default: '#6c63ff' },
    icon:        { type: String, default: 'folder' },
    isPublic:    { type: Boolean, default: false },
    userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
    progress:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProjectSchema.index({ userId: 1 });

export default mongoose.model<IProjectDocument>('Project', ProjectSchema);
