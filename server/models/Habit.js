const mongoose = require('mongoose');

// Shared mixin fields (simulates TrackableEntity abstract class in OOP)
const trackableFields = {
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
};

const habitSchema = new mongoose.Schema(
  {
    ...trackableFields,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['dsa', 'project', 'learning', 'other'],
      default: 'other',
    },
    recurrence: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
    },
    streak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastLoggedAt: {
      type: Date,
      default: null,
    },
    targetPerDay: {
      type: Number,
      default: 1,
    },
    githubLinked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Virtual: calculate completion rate based on logs (populated separately)
habitSchema.virtual('completionRate').get(function () {
  return this._completionRate || 0;
});

habitSchema.set('toJSON', { virtuals: true });
habitSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Habit', habitSchema);
