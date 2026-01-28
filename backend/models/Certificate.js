const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true
  },
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

  // Certificate details
  studentName: {
    type: String,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  instructorName: {
    type: String,
    required: true
  },

  // Completion details
  completedAt: {
    type: Date,
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },

  // Performance metrics
  finalScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalTimeSpent: {
    type: Number,
    required: true // in hours
  },

  // Certificate validation
  isValid: {
    type: Boolean,
    default: true
  },
  validUntil: {
    type: Date,
    default: null // null means never expires
  },

  // Certificate metadata
  certificateType: {
    type: String,
    enum: ['completion', 'achievement', 'mastery'],
    default: 'completion'
  },

  // Digital signature and verification
  digitalSignature: {
    type: String,
    required: true
  },
  verificationCode: {
    type: String,
    required: true,
    unique: true
  },

  // Certificate design
  template: {
    type: String,
    default: 'default'
  },

  // Additional achievements
  achievements: [{
    name: String,
    description: String,
    earnedAt: Date
  }],

  // Skills demonstrated
  skillsEarned: [String],

  // Certificate status
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes
certificateSchema.index({ user: 1, course: 1 });
certificateSchema.index({ certificateId: 1 });
certificateSchema.index({ verificationCode: 1 });

// Generate certificate ID
certificateSchema.pre('validate', function (next) {
  if (!this.certificateId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.certificateId = `CERT-${timestamp}-${random}`.toUpperCase();
  }

  if (!this.verificationCode) {
    this.verificationCode = Math.random().toString(36).substr(2, 12).toUpperCase();
  }

  if (!this.digitalSignature) {
    // Simple signature - in production, use proper cryptographic signing
    const crypto = require('crypto');
    const data = `${this.user}-${this.course}-${this.completedAt}-${this.finalScore}`;
    this.digitalSignature = crypto.createHash('sha256').update(data).digest('hex');
  }

  next();
});

// Method to verify certificate
certificateSchema.methods.verify = function () {
  if (!this.isValid || this.status !== 'active') {
    return false;
  }

  if (this.validUntil && new Date() > this.validUntil) {
    return false;
  }

  return true;
};

// Static method to generate certificate
certificateSchema.statics.generateCertificate = async function (userId, courseId, progressData) {
  const User = require('./User');
  const Course = require('./Course');

  const user = await User.findById(userId);
  const course = await Course.findById(courseId);
  const instructor = await User.findById(course.instructor);

  if (!user || !course || !instructor) {
    throw new Error('Invalid user, course, or instructor');
  }

  const certificate = new this({
    user: userId,
    course: courseId,
    studentName: `${user.profile.firstName} ${user.profile.lastName}`,
    courseName: course.title,
    instructorName: `${instructor.profile.firstName} ${instructor.profile.lastName}`,
    completedAt: progressData.completedAt,
    finalScore: progressData.averageQuizScore || 100,
    totalTimeSpent: Math.round(progressData.totalTimeSpent / 60), // convert to hours
    skillsEarned: course.learningObjectives || []
  });

  await certificate.save();
  return certificate;
};

module.exports = mongoose.model('Certificate', certificateSchema);