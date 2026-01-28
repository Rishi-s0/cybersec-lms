const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic user information
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: function() {
      // Username only required if not using OAuth
      return !this.googleId && !this.githubId;
    },
    unique: true,
    sparse: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      // Password only required if not using OAuth
      return !this.googleId && !this.githubId;
    },
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  passwordHash: {
    type: String,
    select: false // Alias for password field
  },
  
  // OAuth fields
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  
  // Enhanced profile information
  profile: {
    firstName: String,
    lastName: String,
    bio: String,
    avatar: String,
    securityLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    phoneNumber: String,
    department: String,
    certifications: [{
      name: String,
      issuer: String,
      dateEarned: Date,
      expiryDate: Date
    }]
  },
  
  // Course enrollment with progress tracking
  enrolledCourses: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completedLessons: [{
      type: String // lesson IDs
    }],
    enrolledAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  completedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  
  achievements: [{
    title: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Activity tracking
  lastLogin: {
    type: Date,
    default: Date.now
  },
  
  // Settings and preferences
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      courseUpdates: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true }
    },
    privacy: {
      profileVisible: { type: Boolean, default: true },
      progressVisible: { type: Boolean, default: true }
    }
  },

  // Password reset fields
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },

  // Email verification fields
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  emailVerificationOTP: {
    type: String,
    select: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Skip if password not modified or OAuth user
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);