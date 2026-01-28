const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  lessonId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true // Can be Markdown/HTML
  },
  videoUrl: String,
  duration: Number, // in minutes
  order: {
    type: Number,
    required: true
  },
  resources: [{
    type: String, // URLs to PDFs, videos, external links
    name: String,
    resourceType: {
      type: String,
      enum: ['pdf', 'video', 'link', 'document', 'image'],
      default: 'link'
    }
  }],
  quiz: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    explanation: String
  }],
  practicalExercise: {
    title: String,
    description: String,
    instructions: String,
    solution: String,
    hints: [String],
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    }
  },
  isPreview: {
    type: Boolean,
    default: false // Free preview lessons
  }
});

const quizSchema = new mongoose.Schema({
  quizId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  timeLimit: Number, // in minutes
  passingScore: {
    type: Number,
    default: 70
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  questions: [{
    questionId: String,
    question: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'fill-blank', 'essay'],
      default: 'multiple-choice'
    },
    options: [String], // For multiple choice
    answer: String, // Correct answer
    explanation: String,
    points: {
      type: Number,
      default: 1
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Beginner',
      'Intermediate', 
      'Advanced',
      'Network Security',
      'Web Security',
      'Cryptography',
      'Ethical Hacking',
      'Incident Response',
      'Risk Management',
      'Compliance',
      'Malware Analysis',
      'Digital Forensics',
      'Security Awareness'
    ]
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Course content
  lessons: [lessonSchema],
  quizzes: [quizSchema],
  
  // Course metadata
  prerequisites: [String],
  learningObjectives: [String],
  estimatedDuration: Number, // in hours
  thumbnail: String,
  tags: [String],
  
  // Course settings
  isPublished: {
    type: Boolean,
    default: false
  },
  isFree: {
    type: Boolean,
    default: true
  },
  price: {
    type: Number,
    default: 0
  },
  
  // Enrollment and progress
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxEnrollments: {
    type: Number,
    default: null // null means unlimited
  },
  
  // Ratings and reviews
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Course statistics
  stats: {
    totalEnrollments: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    averageCompletionTime: {
      type: Number,
      default: 0
    }
  },
  
  // Course status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'under-review'],
    default: 'draft'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);