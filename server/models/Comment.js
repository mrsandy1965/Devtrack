const mongoose = require('mongoose');

/**
 * Comment – threaded discussion on a Task.
 */
const CommentSchema = new mongoose.Schema(
  {
    taskId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content:  { type: String, required: true, maxlength: 5000 },
    editedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

CommentSchema.index({ taskId: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', CommentSchema);
