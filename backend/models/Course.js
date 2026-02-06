// Import MongoDB ODM
const mongoose = require('mongoose');

// 📖 LESSON SCHEMA: Defines structure of individual lessons within a course
const lessonSchema = new mongoose.Schema({
  lessonId: {
    type: String,
    required: true       // Unique identifier for each lesson
  },
  title: {
    type: String,
    required: true       // Lesson title displayed to users
  },
  content: {
    type: String,
    required: true       // 📝 Lesson content (supports Markdown/HTML formatting)
  },
  videoUrl: String,      // 🎥 Optional video URL for video lessons
  duration: Number,      // ⏱️ Estimated lesson duration in minutes
  order: {
    type: Number,
    required: true       // 🔢 Sequential order for lesson progression
  },
  // 📚 LEARNING RESOURCES: Additional materials for the lesson
  resources: [{
    type: String,        // URL to resource (PDF, video, external link)
    name: String,        // Display name for the resource
    resourceType: {
      type: String,
      enum: ['pdf', 'video', 'link', 'document', 'image'],  // Resource type categories
      default: 'link'
    }
  }],
  
  // 🧠 QUIZ QUESTIONS: Embedded quiz for knowledge assessment
  quiz: [{
    question: String,           // Quiz question text
    options: [String],          // Array of answer options
    correctAnswer: Number,      // Index of correct answer (0-based)
    explanation: String         // Explanation shown after answering
  }],
  // 💻 PRACTICAL EXERCISE: Hands-on coding/security exercise
  practicalExercise: {
    title: String,              // Exercise title
    description: String,        // What the exercise is about
    instructions: String,       // Step-by-step instructions
    solution: String,           // Solution code/answer (hidden from students)
    hints: [String],            // Array of hints to help students
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],  // Exercise difficulty level
      default: 'medium'
    }
  },
  
  // 👁️ PREVIEW AVAILABILITY: Allow free preview of certain lessons
  isPreview: {
    type: Boolean,
    default: false              // False = requires enrollment, True = free preview
  }
});

// 📝 QUIZ SCHEMA: Comprehensive quiz structure for assessments
const quizSchema = new mongoose.Schema({
  quizId: {
    type: String,
    required: true              // Unique identifier for the quiz
  },
  title: {
    type: String,
    required: true              // Quiz title
  },
  description: String,          // Quiz description/instructions
  timeLimit: Number,            // ⏱️ Time limit in minutes (optional)
  passingScore: {
    type: Number,
    default: 70                 // 🎯 Minimum score to pass (70%)
  },
  maxAttempts: {
    type: Number,
    default: 3                  // 🔄 Maximum number of attempts allowed
  },
  
  // ❓ QUIZ QUESTIONS: Array of questions in the quiz
  questions: [{
    questionId: String,         // Unique question identifier
    question: {
      type: String,
      required: true            // Question text
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'fill-blank', 'essay'],  // Question types
      default: 'multiple-choice'
    },
    options: [String],          // Answer options (for multiple choice)
    answer: String,             // 🔒 Correct answer (hidden from students)
    explanation: String,        // Explanation shown after answering
    points: {
      type: Number,
      default: 1                // Points awarded for correct answer
    }
  }],
  
  // ✅ QUIZ STATUS: Control quiz availability
  isActive: {
    type: Boolean,
    default: true               // True = available, False = disabled
  }
});

// 🎓 COURSE SCHEMA: Main course structure with all metadata
const courseSchema = new mongoose.Schema({
  // 📌 BASIC COURSE INFORMATION
  title: {
    type: String,
    required: true,             // Course title is mandatory
    trim: true                  // Remove whitespace
  },
  description: {
    type: String,
    required: true              // Course description is mandatory
  },
  
  // 🏷️ COURSE CATEGORIZATION: Organize courses by topic
  category: {
    type: String,
    required: true,
    enum: [
      'Beginner',               // Difficulty-based categories
      'Intermediate', 
      'Advanced',
      'Network Security',       // Topic-based categories
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
  
  // 📊 DIFFICULTY LEVEL: Course complexity indicator
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],  // Three difficulty levels
    required: true
  },
  // 👨‍🏫 INSTRUCTOR INFORMATION: Who created/teaches the course
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',                // Reference to User collection
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',                // Duplicate field for compatibility
    required: true
  },
  
  // 📚 COURSE CONTENT: Main course materials
  lessons: [lessonSchema],      // Array of lessons using lessonSchema
  quizzes: [quizSchema],        // Array of quizzes using quizSchema
  
  // 📋 COURSE METADATA: Additional course information
  prerequisites: [String],      // Required knowledge/courses before taking this
  learningObjectives: [String], // What students will learn
  estimatedDuration: Number,    // Total course duration in hours
  thumbnail: String,            // Course thumbnail image URL
  tags: [String],               // Keywords for search and categorization
  
  // ⚙️ COURSE SETTINGS: Control course behavior
  isPublished: {
    type: Boolean,
    default: false              // 🔒 False = draft, True = visible to students
  },
  isFree: {
    type: Boolean,
    default: true               // True = free course, False = paid course
  },
  price: {
    type: Number,
    default: 0                  // Course price (0 for free courses)
  },
  
  // 👥 ENROLLMENT AND PROGRESS: Track student enrollment
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'                 // Array of enrolled user IDs
  }],
  maxEnrollments: {
    type: Number,
    default: null               // null = unlimited enrollments
  },
  
  // ⭐ RATINGS AND REVIEWS: Student feedback system
  rating: {
    average: {
      type: Number,
      default: 0                // Average rating (0-5 stars)
    },
    count: {
      type: Number,
      default: 0                // Total number of ratings
    }
  },
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'               // Who wrote the review
    },
    rating: {
      type: Number,
      min: 1,                   // Minimum 1 star
      max: 5                    // Maximum 5 stars
    },
    review: String,             // Review text
    createdAt: {
      type: Date,
      default: Date.now         // When review was posted
    }
  }],
  
  // 📊 COURSE STATISTICS: Analytics and metrics
  stats: {
    totalEnrollments: {
      type: Number,
      default: 0                // Total number of enrollments
    },
    completionRate: {
      type: Number,
      default: 0                // Percentage of students who completed
    },
    averageCompletionTime: {
      type: Number,
      default: 0                // Average time to complete (in hours)
    }
  },
  
  // 🚦 COURSE STATUS: Workflow state management
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'under-review'],  // Course lifecycle states
    default: 'draft'            // New courses start as drafts
  }
}, {
  timestamps: true              // 📅 AUTO-TIMESTAMPS: Add createdAt and updatedAt
});

// 📤 EXPORT MODEL: Make Course model available to other files
module.exports = mongoose.model('Course', courseSchema);