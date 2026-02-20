const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      default: null,
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Duration is required'],
      default: 25,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    sessionDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Virtual: actual elapsed minutes
focusSessionSchema.virtual('elapsedMinutes').get(function () {
  if (!this.endTime) return 0;
  return Math.round((this.endTime - this.startTime) / 60000);
});

focusSessionSchema.set('toJSON', { virtuals: true });
focusSessionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('FocusSession', focusSessionSchema);
