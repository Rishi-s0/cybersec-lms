const Notification = require('../models/Notification');

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  // Send notification to specific user
  async sendToUser(userId, notificationData) {
    try {
      const notification = await Notification.createNotification(userId, notificationData);
      
      // Emit real-time notification
      if (this.io) {
        this.io.to(`user_${userId}`).emit('new_notification', notification);
      }
      
      return notification;
    } catch (error) {
      console.error('Error sending notification to user:', error);
      throw error;
    }
  }

  // Send notification when user enrolls in course
  async notifyEnrollment(userId, courseTitle, courseId) {
    return this.sendToUser(userId, {
      title: 'Course Enrollment Successful',
      message: `You have successfully enrolled in "${courseTitle}". Start learning now!`,
      type: 'enrollment',
      actionUrl: `/courses/${courseId}`,
      metadata: { courseId }
    });
  }

  // Send notification when user completes a lesson
  async notifyLessonComplete(userId, lessonTitle, courseTitle, courseId) {
    return this.sendToUser(userId, {
      title: 'Lesson Completed!',
      message: `Great job! You completed "${lessonTitle}" in ${courseTitle}`,
      type: 'lesson_complete',
      actionUrl: `/courses/${courseId}`,
      metadata: { courseId, lessonTitle }
    });
  }

  // Send notification when user completes a course
  async notifyCourseComplete(userId, courseTitle, courseId) {
    return this.sendToUser(userId, {
      title: 'Course Completed! 🎉',
      message: `Congratulations! You have completed "${courseTitle}". Check your certificates!`,
      type: 'course_complete',
      actionUrl: `/certificates`,
      metadata: { courseId }
    });
  }

  // Send notification when certificate is issued
  async notifyCertificateIssued(userId, courseTitle, certificateId) {
    return this.sendToUser(userId, {
      title: 'Certificate Issued! 🏆',
      message: `Your certificate for "${courseTitle}" is ready for download!`,
      type: 'certificate',
      actionUrl: `/certificate-view/${certificateId}`,
      metadata: { certificateId }
    });
  }

  // Send notification when quiz is passed
  async notifyQuizPassed(userId, quizTitle, score, courseTitle, courseId) {
    return this.sendToUser(userId, {
      title: 'Quiz Passed! ✅',
      message: `You scored ${score}% on "${quizTitle}" in ${courseTitle}`,
      type: 'quiz_pass',
      actionUrl: `/courses/${courseId}`,
      metadata: { courseId, score }
    });
  }

  // Send notification when quiz is failed
  async notifyQuizFailed(userId, quizTitle, score, courseTitle, courseId) {
    return this.sendToUser(userId, {
      title: 'Quiz Needs Retry',
      message: `You scored ${score}% on "${quizTitle}". Don't give up - try again!`,
      type: 'quiz_fail',
      actionUrl: `/courses/${courseId}`,
      metadata: { courseId, score }
    });
  }

  // Send notification for new course announcement
  async notifyNewCourse(userId, courseTitle, courseId) {
    return this.sendToUser(userId, {
      title: 'New Course Available! 📚',
      message: `Check out the new course: "${courseTitle}"`,
      type: 'new_course',
      actionUrl: `/courses/${courseId}`,
      metadata: { courseId }
    });
  }

  // Send notification for discussion reply
  async notifyDiscussionReply(userId, replierName, discussionTitle, courseTitle, courseId) {
    return this.sendToUser(userId, {
      title: 'New Discussion Reply',
      message: `${replierName} replied to "${discussionTitle}" in ${courseTitle}`,
      type: 'discussion_reply',
      actionUrl: `/courses/${courseId}`,
      metadata: { courseId }
    });
  }

  // Send system maintenance notification
  async notifyMaintenance(userId, maintenanceTime, duration) {
    return this.sendToUser(userId, {
      title: 'Scheduled Maintenance',
      message: `System maintenance scheduled for ${maintenanceTime} (${duration}). Save your progress!`,
      type: 'maintenance',
      actionUrl: null,
      metadata: { maintenanceTime, duration }
    });
  }

  // Broadcast to all users
  async broadcast(notificationData, targetRole = 'all') {
    try {
      const User = require('../models/User');
      
      let userQuery = {};
      if (targetRole !== 'all') {
        userQuery.role = targetRole;
      }
      
      const users = await User.find(userQuery).select('_id');
      const notifications = [];
      
      for (const user of users) {
        const notification = await Notification.createNotification(user._id, notificationData);
        notifications.push(notification);
        
        // Emit real-time notification
        if (this.io) {
          this.io.to(`user_${user._id}`).emit('new_notification', notification);
        }
      }
      
      return notifications;
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      throw error;
    }
  }

  // Send welcome notification to new users
  async sendWelcomeNotification(userId, username) {
    return this.sendToUser(userId, {
      title: 'Welcome to CyberSec LMS! 🚀',
      message: `Hi ${username}! Welcome to our cybersecurity learning platform. Start with our Introduction to Cybersecurity course!`,
      type: 'welcome',
      actionUrl: '/courses',
      metadata: {}
    });
  }

  // Send reminder for incomplete courses
  async sendCourseReminder(userId, courseTitle, courseId, daysInactive) {
    return this.sendToUser(userId, {
      title: 'Continue Your Learning Journey',
      message: `You haven't visited "${courseTitle}" in ${daysInactive} days. Continue where you left off!`,
      type: 'reminder',
      actionUrl: `/courses/${courseId}`,
      metadata: { courseId, daysInactive }
    });
  }
}

module.exports = NotificationService;