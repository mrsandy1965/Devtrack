const mongoose = require('mongoose');

/**
 * Task – the core entity of the project management system.
 * Equivalent to a Jira Issue / Linear Issue.
 *
 * OOP: Encapsulates all issue metadata. Supports subtasks via parentTaskId.
 */

const STATUSES    = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'];
const PRIORITIES  = ['urgent', 'high', 'medium', 'low', 'no_priority'];

const LabelSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, maxlength: 50 },
    color: { type: String, default: '#6c63ff' },
  },
  { _id: false }
);

const TaskSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true, trim: true, maxlength: 255 },
    description:  { type: String, default: '', maxlength: 10000 }, // Markdown
    projectId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    creatorId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },

    status:       { type: String, enum: STATUSES,   default: 'backlog' },
    priority:     { type: String, enum: PRIORITIES, default: 'no_priority' },

    labels:       [LabelSchema],
    dueDate:      { type: Date,   default: null },
    completedAt:  { type: Date,   default: null },

    estimate:     { type: Number, min: 0, max: 21, default: 0 }, // story points

    // Ordering within a column (for drag-and-drop)
    orderIndex:   { type: Number, default: 0 },

    // Hierarchy
    parentTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },

    // Sprint linkage
    cycleId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Cycle', default: null },
  },
  { timestamps: true }
);

// Efficient queries for board/list views
TaskSchema.index({ projectId: 1, status: 1, orderIndex: 1 });
TaskSchema.index({ projectId: 1, priority: 1 });
TaskSchema.index({ projectId: 1, cycleId: 1 });
TaskSchema.index({ creatorId: 1 });

// Auto-set completedAt
TaskSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'done' || this.status === 'cancelled') {
      this.completedAt = new Date();
    } else {
      this.completedAt = null;
    }
  }
  next();
});

module.exports = mongoose.model('Task', TaskSchema);
