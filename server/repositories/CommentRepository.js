const BaseRepository = require('./BaseRepository');
const Comment = require('../models/Comment');

class CommentRepository extends BaseRepository {
  constructor() {
    super(Comment);
  }

  findByTask(taskId) {
    return Comment.find({ taskId })
      .sort({ createdAt: 1 })
      .populate('authorId', 'name');
  }

  countByTask(taskId) {
    return Comment.countDocuments({ taskId });
  }
}

module.exports = new CommentRepository();
