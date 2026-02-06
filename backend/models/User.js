// Import required dependencies
const mongoose = require('mongoose'); // MongoDB ODM for schema definition
const bcrypt = require('bcryptjs');   // Library for password hashing

// 👤 USER SCHEMA: Defines the structure of user documents in MongoDB
const userSchema = new mongoose.Schema({
  // 📝 BASIC USER INFORMATION
  name: {
    type: String,
    required: true,  // Name is mandatory for all users
    trim: true       // Remove whitespace from both ends
  },
  username: {
    type: String,
    required: function() {
      // 🔑 CONDITIONAL REQUIREMENT: Username only required if not using OAuth
      // OAuth users get username from their provider (Google/GitHub)
      return !this.googleId && !this.githubId;
    },
    unique: true,    // No duplicate usernames allowed
    sparse: true,    // Allow multiple null values (for OAuth users)
    trim: true,      // Remove whitespace
    minlength: 3,    // Minimum 3 characters
    maxlength: 30    // Maximum 30 characters
  },
  email: {
    type: String,
    required: true,  // Email is mandatory for all users
    unique: true,    // No duplicate emails allowed
    lowercase: true, // Convert to lowercase for consistency
    trim: true       // Remove whitespace
  },
  password: {
    type: String,
    required: function() {
      // 🔐 CONDITIONAL REQUIREMENT: Password only required for manual registration
      // OAuth users don't need password as they authenticate through provider
      return !this.googleId && !this.githubId;
    },
    minlength: 6,    // Minimum 6 characters for security
    select: false    // 🛡️ SECURITY: Never include password in queries by default
  },
  passwordHash: {
    type: String,
    select: false    // 🛡️ SECURITY: Alias for password field, also hidden
  },
  
  // 🔗 OAUTH INTEGRATION FIELDS
  googleId: {
    type: String,
    unique: true,    // Each Google account can only link to one user
    sparse: true     // Allow multiple null values (for non-Google users)
  },
  githubId: {
    type: String,
    unique: true,    // Each GitHub account can only link to one user
    sparse: true     // Allow multiple null values (for non-GitHub users)
  },
  
  // 👥 USER ROLE: Defines access level and permissions
  role: {
    type: String,
    enum: ['student', 'admin'],  // 🚫 ONLY TWO ROLES: Removed instructor for simplicity
    default: 'student'            // 🔒 SECURITY: All public registrations default to student
  },
  
  // 📋 ENHANCED PROFILE INFORMATION
  profile: {
    firstName: String,
    lastName: String,
    bio: String,              // User biography/description
    avatar: String,           // Profile picture URL
    securityLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],  // Skill level tracking
      default: 'beginner'     // New users start as beginners
    },
    phoneNumber: String,
    department: String,       // For organizational users
    certifications: [{        // 🏆 EARNED CERTIFICATIONS: Track user achievements
      name: String,           // Certificate name
      issuer: String,         // Who issued the certificate
      dateEarned: Date,       // When it was earned
      expiryDate: Date        // When it expires (if applicable)
    }]
  },
  
  // 🎓 COURSE ENROLLMENT WITH PROGRESS TRACKING
  enrolledCourses: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',         // Reference to Course collection
      required: true
    },
    progress: {
      type: Number,
      default: 0,            // Start at 0% completion
      min: 0,                // Minimum 0%
      max: 100               // Maximum 100%
    },
    completedLessons: [{
      type: String           // Array of lesson IDs that user has completed
    }],
    enrolledAt: {
      type: Date,
      default: Date.now      // Track when user enrolled
    }
  }],
  
  // 🏆 COMPLETED COURSES: Courses user has finished 100%
  completedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'            // Reference to Course collection
  }],
  
  // 🏅 ACHIEVEMENTS: Gamification and milestone tracking
  achievements: [{
    title: String,           // Achievement name
    description: String,     // What the achievement is for
    earnedAt: {
      type: Date,
      default: Date.now      // When user earned this achievement
    }
  }],
  
  // 📊 ACTIVITY TRACKING: Monitor user engagement
  lastLogin: {
    type: Date,
    default: Date.now        // Track last login time for analytics
  },
  
  // ⚙️ SETTINGS AND PREFERENCES: User customization options
  settings: {
    notifications: {
      email: { type: Boolean, default: true },           // Email notifications enabled
      push: { type: Boolean, default: true },            // Push notifications enabled
      courseUpdates: { type: Boolean, default: true },   // Course update notifications
      achievements: { type: Boolean, default: true }     // Achievement notifications
    },
    privacy: {
      profileVisible: { type: Boolean, default: true },  // Public profile visibility
      progressVisible: { type: Boolean, default: true }  // Show progress to others
    }
  },

  // 🔄 PASSWORD RESET FIELDS: For forgot password functionality
  resetPasswordToken: {
    type: String,
    select: false        // 🛡️ SECURITY: Hidden from queries
  },
  resetPasswordExpires: {
    type: Date,
    select: false        // 🛡️ SECURITY: Hidden from queries
  },

  // ✉️ EMAIL VERIFICATION FIELDS: For account verification
  isEmailVerified: {
    type: Boolean,
    default: false       // 🔒 SECURITY: Require email verification for new accounts
  },
  emailVerificationToken: {
    type: String,
    select: false        // 🛡️ SECURITY: Hidden from queries
  },
  emailVerificationExpires: {
    type: Date,
    select: false        // 🛡️ SECURITY: Hidden from queries
  },
  emailVerificationOTP: {
    type: String,
    select: false        // 🛡️ SECURITY: 6-digit OTP code, hidden from queries
  }
}, {
  timestamps: true  // 📅 AUTO-TIMESTAMPS: Automatically add createdAt and updatedAt fields
});

// 🔐 PRE-SAVE HOOK: Hash password before saving to database
userSchema.pre('save', async function(next) {
  // Skip hashing if password not modified or OAuth user (no password)
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    // 🧂 GENERATE SALT: Create random salt for password hashing (10 rounds)
    const salt = await bcrypt.genSalt(10);
    
    // 🔒 HASH PASSWORD: Hash password with salt for security
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 🔍 COMPARE PASSWORD METHOD: Verify login password against stored hash
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Use bcrypt to securely compare passwords
  return bcrypt.compare(candidatePassword, this.password);
};

// 📤 EXPORT MODEL: Make User model available to other files
module.exports = mongoose.model('User', userSchema);