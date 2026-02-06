// Import MongoDB ODM
const mongoose = require('mongoose');

// 📊 PROGRESS SCHEMA: Tracks individual user progress through courses
const progressSchema = new mongoose.Schema({
  // 👤 USER REFERENCE: Which user this progress belongs to
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',                // Reference to User collection
    required: true
  },
  
  // 📚 COURSE REFERENCE: Which course this progress is for
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',              // Reference to Course collection
    required: true
  },
  
  // ✅ COMPLETED LESSONS: Track which lessons user has finished
  completedLessons: [{
    lessonId: String,           // Matches Course.lessons.lessonId (String type)
    completedAt: {
      type: Date,
      default: Date.now         // When lesson was completed
    },
    score: Number               // Quiz score for this lesson (if applicable)
  }],
  // 🧠 QUIZ COMPLETION TRACKING: Detailed quiz attempt history
  quizzesCompleted: [{
    quizId: String,             // Quiz identifier
    attempts: [{                // Array of all attempts for this quiz
      attemptNumber: Number,    // Which attempt (1, 2, 3, etc.)
      score: Number,            // Score achieved (0-100)
      totalQuestions: Number,   // Total questions in quiz
      correctAnswers: Number,   // Number of correct answers
      timeSpent: Number,        // Time spent in minutes
      answers: [{               // Individual question answers
        questionId: String,     // Question identifier
        answer: String,         // User's answer
        isCorrect: Boolean,     // Was answer correct?
        points: Number          // Points earned for this question
      }],
      completedAt: {
        type: Date,
        default: Date.now       // When attempt was completed
      }
    }],
    bestScore: {
      type: Number,
      default: 0                // Best score achieved across all attempts
    },
    passed: {
      type: Boolean,
      default: false            // Did user pass the quiz?
    },
    completedAt: Date           // When quiz was first completed
  }],
  
  // 📈 OVERALL PROGRESS: Course completion percentage
  overallProgress: {
    type: Number,
    default: 0,                 // Start at 0%
    min: 0,                     // Minimum 0%
    max: 100                    // Maximum 100%
  },
  
  // 🕐 ACTIVITY TRACKING: Monitor user engagement
  lastAccessedAt: {
    type: Date,
    default: Date.now           // Last time user accessed this course
  },
  timeSpent: {
    type: Number,
    default: 0                  // Total time spent on course (in minutes)
  },
  
  // 🏆 COMPLETION STATUS: Has user finished the course?
  isCompleted: {
    type: Boolean,
    default: false              // True when overallProgress reaches 100%
  },
  completedAt: Date,            // When course was completed
  
  // 🎓 CERTIFICATE: Certificate issuance tracking
  certificate: {
    issued: {
      type: Boolean,
      default: false            // Has certificate been issued?
    },
    issuedAt: Date,             // When certificate was issued
    certificateId: String       // Unique certificate identifier
  }
}, {
  timestamps: true              // 📅 AUTO-TIMESTAMPS: Add createdAt and updatedAt
});

// 🔑 COMPOUND INDEX: Ensure one progress record per user-course combination
progressSchema.index({ user: 1, course: 1 }, { unique: true });

// 📤 EXPORT MODEL: Make Progress model available to other files
module.exports = mongoose.model('Progress', progressSchema);