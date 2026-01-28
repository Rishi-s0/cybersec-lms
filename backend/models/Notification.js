const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'course', 'achievement'],
    default: 'info'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    required: false
  },
  metadata: {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    achievementId: String,
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(userId, notificationData) {
  try {
    const notification = new this({
      user: userId,
      ...notificationData
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  return await this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);