import BaseRepository from './BaseRepository';
import Comment, { ICommentDocument } from '../models/Comment';

class CommentRepository extends BaseRepository<ICommentDocument> {
  constructor() {
    super(Comment);
  }

  findByTask(taskId: string): Promise<ICommentDocument[]> {
    return this.model.find({ taskId })
      .sort({ createdAt: 1 })
      .populate('userId', 'name avatarUrl githubUsername') // authorId -> userId
      .exec();
  }
}

export default new CommentRepository();
