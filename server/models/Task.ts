import mongoose, { Schema, Document } from 'mongoose';
import { ITask } from '../../shared/types';

export interface ITaskDocument extends Omit<ITask, '_id'>, Document {}

const STATUSES    = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'];
const PRIORITIES  = ['urgent', 'high', 'medium', 'low', 'no_priority'];

const LabelSchema = new Schema(
  {
    name:  { type: String, required: true, maxlength: 50 },
    color: { type: String, default: '#6c63ff' },
  },
  { _id: false }
);

const TaskSchema = new Schema<ITaskDocument>(
  {
    title:        { type: String, required: true, trim: true, maxlength: 255 },
    description:  { type: String, default: '', maxlength: 10000 },
    projectId:    { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    userId:       { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    
    status:       { type: String, enum: STATUSES,   default: 'backlog' },
    priority:     { type: String, enum: PRIORITIES, default: 'no_priority' },

    labels:       [LabelSchema],
    dueDate:      { type: Date,   default: null },
    
    estimate:     { type: Number, min: 0, max: 21, default: 0 },
    orderIndex:   { type: Number, default: 0 },
    
    cycleId:      { type: Schema.Types.ObjectId, ref: 'Cycle', default: null },
    
    // Note: completedAt and parentTaskId were in the JS version but not fully mapped in ITask.
    // If they are strictly needed, we should add them to ITask in shared/types. 
    // We map them loosely here or omit them depending on STRICT requirements.
    // I am including subtasks to match the shared ITask interface properly.
    subtasks:     [{ title: String, completed: { type: Boolean, default: false } }]
  },
  { timestamps: true }
);

TaskSchema.index({ projectId: 1, status: 1, orderIndex: 1 });
TaskSchema.index({ projectId: 1, priority: 1 });
TaskSchema.index({ projectId: 1, cycleId: 1 });
TaskSchema.index({ userId: 1 });

export default mongoose.model<ITaskDocument>('Task', TaskSchema);
