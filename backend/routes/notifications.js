const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    let query = { user: req.userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    const notifications = await Notification.find(query)
      .populate('metadata.courseId', 'title category')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      user: req.userId, 
      isRead: false 
    });
    
    res.json({
      notifications,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.userId
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    await notification.markAsRead();
    
    // Emit real-time update
    if (req.io) {
      req.io.to(`user_${req.userId}`).emit('notification_read', {
        notificationId: req.params.id
      });
    }
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.userId, isRead: false },
      { isRead: true }
    );
    
    // Emit real-time update
    if (req.io) {
      req.io.to(`user_${req.userId}`).emit('notifications_read_all');
    }
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/notifications/create
// @desc    Create notification (admin only)
// @access  Private/Admin
router.post('/create', auth, async (req, res) => {
  try {
    // Check if user is admin
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { userId, title, message, type, actionUrl, metadata } = req.body;
    
    const notification = await Notification.createNotification(userId, {
      title,
      message,
      type,
      actionUrl,
      metadata
    });
    
    // Emit real-time notification
    if (req.io) {
      req.io.to(`user_${userId}`).emit('new_notification', notification);
    }
    
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/notifications/broadcast
// @desc    Broadcast notification to all users (admin only)
// @access  Private/Admin
router.post('/broadcast', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { title, message, type, actionUrl, metadata, targetRole } = req.body;
    
    // Get all users or users with specific role
    let userQuery = {};
    if (targetRole && targetRole !== 'all') {
      userQuery.role = targetRole;
    }
    
    const users = await User.find(userQuery).select('_id');
    const notifications = [];
    
    // Create notifications for all users
    for (const targetUser of users) {
      const notification = await Notification.createNotification(targetUser._id, {
        title,
        message,
        type,
        actionUrl,
        metadata
      });
      notifications.push(notification);
      
      // Emit real-time notification
      if (req.io) {
        req.io.to(`user_${targetUser._id}`).emit('new_notification', notification);
      }
    }
    
    res.status(201).json({
      message: `Broadcast sent to ${notifications.length} users`,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;