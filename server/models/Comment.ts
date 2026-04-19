import mongoose, { Schema, Document } from 'mongoose';
import { IComment } from '../../shared/types';

export interface ICommentDocument extends Omit<IComment, '_id'>, Document {}

const CommentSchema = new Schema<ICommentDocument>(
  {
    taskId:   { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true }, // authorId -> userId
    content:  { type: String, required: true, maxlength: 5000 },
  },
  { timestamps: true }
);

CommentSchema.index({ taskId: 1, createdAt: 1 });

export default mongoose.model<ICommentDocument>('Comment', CommentSchema);
