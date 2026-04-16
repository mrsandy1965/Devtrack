const mongoose = require('mongoose');

/**
 * Cycle – time-boxed sprint (Linear's "Cycle" concept).
 * Groups tasks for a fixed period with burn-down tracking.
 */
const CycleSchema = new mongoose.Schema(
  {
    projectId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    name:       { type: String, required: true, maxlength: 100 },
    startDate:  { type: Date, required: true },
    endDate:    { type: Date, required: true },
    status:     {
      type:    String,
      enum:    ['upcoming', 'active', 'completed'],
      default: 'upcoming',
    },
    description: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true }
);

CycleSchema.index({ projectId: 1, status: 1 });

// Auto-compute status based on dates
CycleSchema.pre('save', function (next) {
  const now = new Date();
  if (now < this.startDate) {
    this.status = 'upcoming';
  } else if (now >= this.startDate && now <= this.endDate) {
    this.status = 'active';
  } else {
    this.status = 'completed';
  }
  next();
});

module.exports = mongoose.model('Cycle', CycleSchema);
