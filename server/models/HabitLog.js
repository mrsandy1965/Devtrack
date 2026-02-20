const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema(
  {
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    logDate: {
      type: Date,
      default: Date.now,
    },
    commitCount: {
      type: Number,
      default: 0,
    },
    source: {
      type: String,
      enum: ['manual', 'github'],
      default: 'manual',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    completed: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensure one log per habit per day per user
habitLogSchema.index({ habitId: 1, userId: 1, logDate: 1 }, { unique: false });

module.exports = mongoose.model('HabitLog', habitLogSchema);
