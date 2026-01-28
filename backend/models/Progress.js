const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  completedLessons: [{
    lessonId: String, // Changed from ObjectId to String to match Course.lessons.lessonId
    completedAt: {
      type: Date,
      default: Date.now
    },
    score: Number // for quizzes
  }],
  quizzesCompleted: [{
    quizId: String,
    attempts: [{
      attemptNumber: Number,
      score: Number,
      totalQuestions: Number,
      correctAnswers: Number,
      timeSpent: Number,
      answers: [{
        questionId: String,
        answer: String,
        isCorrect: Boolean,
        points: Number
      }],
      completedAt: {
        type: Date,
        default: Date.now
      }
    }],
    bestScore: {
      type: Number,
      default: 0
    },
    passed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  timeSpent: {
    type: Number,
    default: 0 // in minutes
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  certificate: {
    issued: {
      type: Boolean,
      default: false
    },
    issuedAt: Date,
    certificateId: String
  }
}, {
  timestamps: true
});

// Compound index for user-course combination
progressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);