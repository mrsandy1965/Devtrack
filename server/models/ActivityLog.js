const mongoose = require('mongoose');

/**
 * ActivityLog – immutable audit trail for all task/project changes.
 *
 * Design Pattern: Observer — services emit activity events post-mutation.
 * This model is append-only (never updated or deleted in business logic).
 */
const ActivityLogSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ['task', 'project', 'cycle', 'comment'],
      required: true,
    },
    entityId:   { type: mongoose.Schema.Types.ObjectId, required: true },
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // What happened
    action:     { type: String, required: true },   // e.g. 'status_changed', 'created', 'commented'

    // Before / after (for field changes)
    oldValue:   { type: mongoose.Schema.Types.Mixed, default: null },
    newValue:   { type: mongoose.Schema.Types.Mixed, default: null },

    // Human-readable message generated at write time
    message:    { type: String, required: true },
  },
  {
    timestamps: true,
    // Immutable document — _id only never changes
  }
);

ActivityLogSchema.index({ entityId: 1, createdAt: -1 });
ActivityLogSchema.index({ userId: 1,   createdAt: -1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
