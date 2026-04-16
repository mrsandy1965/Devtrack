const mongoose = require('mongoose');

/**
 * Project – top-level container for tasks and cycles.
 * OOP: Uses trackableFields mixin pattern (same as Habit model).
 */
const ProjectSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: '', maxlength: 500 },
    color:       { type: String, default: '#6c63ff' },   // hex
    icon:        { type: String, default: 'folder' },    // icon key
    status:      { type: String, enum: ['active', 'archived'], default: 'active' },
    visibility:  { type: String, enum: ['private', 'workspace'], default: 'private' },
    ownerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

ProjectSchema.index({ ownerId: 1, status: 1 });

module.exports = mongoose.model('Project', ProjectSchema);
