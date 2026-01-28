const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },
  isInstructorReply: {
    type: Boolean,
    default: false
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const discussionSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Optional - for lesson-specific discussions
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 5000
  },
  type: {
    type: String,
    enum: ['discussion', 'question', 'announcement', 'help'],
    default: 'discussion'
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  replies: [replySchema],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isSolved: {
    type: Boolean,
    default: false
  },
  solvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  solvedAt: {
    type: Date
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
discussionSchema.index({ courseId: 1, createdAt: -1 });
discussionSchema.index({ courseId: 1, lessonId: 1 });
discussionSchema.index({ userId: 1 });
discussionSchema.index({ type: 1 });
discussionSchema.index({ isPinned: -1, lastActivity: -1 });

// Virtual for reply count
discussionSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Virtual for like count
discussionSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Method to add a reply
discussionSchema.methods.addReply = async function(userId, message, isInstructorReply = false) {
  this.replies.push({
    userId,
    message,
    isInstructorReply
  });
  
  this.lastActivity = new Date();
  return await this.save();
};

// Method to toggle like
discussionSchema.methods.toggleLike = async function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push(userId);
  }
  
  return await this.save();
};

// Method to mark as solved
discussionSchema.methods.markAsSolved = async function(solvedByUserId) {
  this.isSolved = !this.isSolved;
  
  if (this.isSolved) {
    this.solvedBy = solvedByUserId;
    this.solvedAt = new Date();
  } else {
    this.solvedBy = undefined;
    this.solvedAt = undefined;
  }
  
  return await this.save();
};

// Method to increment views
discussionSchema.methods.incrementViews = async function() {
  this.views += 1;
  return await this.save();
};

// Static method to get course statistics
discussionSchema.statics.getCourseStats = async function(courseId) {
  const stats = await this.aggregate([
    { $match: { courseId: mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: null,
        totalDiscussions: { $sum: 1 },
        totalReplies: { $sum: { $size: '$replies' } },
        totalViews: { $sum: '$views' },
        solvedQuestions: { $sum: { $cond: ['$isSolved', 1, 0] } },
        pinnedDiscussions: { $sum: { $cond: ['$isPinned', 1, 0] } },
        typeBreakdown: {
          $push: {
            type: '$type',
            count: 1
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalDiscussions: 0,
    totalReplies: 0,
    totalViews: 0,
    solvedQuestions: 0,
    pinnedDiscussions: 0,
    typeBreakdown: []
  };
};

// Pre-save middleware to update lastActivity
discussionSchema.pre('save', function(next) {
  if (this.isModified('replies')) {
    this.lastActivity = new Date();
  }
  next();
});

module.exports = mongoose.model('Discussion', discussionSchema);