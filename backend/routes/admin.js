const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');
const router = express.Router();

// Apply auth middleware to all admin routes
router.use(auth);

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user && user.role === 'admin') {
      req.user = user;
      next();
    } else {
      return res.status(403).json({ message: 'Admin access required' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Admin only
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const activeStudents = await User.countDocuments({ role: 'student' });
    const publishedCourses = await Course.countDocuments({ isPublished: true });
    
    // Calculate completion rate
    const totalProgress = await Progress.countDocuments();
    const completedProgress = await Progress.countDocuments({ isCompleted: true });
    const completionRate = totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0;

    res.json({
      totalUsers,
      totalCourses,
      activeStudents,
      publishedCourses,
      completionRate,
      totalEnrollments: totalProgress
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users for admin management
// @access  Admin only
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (role, status, etc.)
// @access  Admin only
router.put('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { role, profile } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (role) user.role = role;
    if (profile) user.profile = { ...user.profile, ...profile };

    await user.save();
    
    res.json({ message: 'User updated successfully', user: user.toObject({ transform: (doc, ret) => { delete ret.password; return ret; } }) });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Admin only
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting other admins
    if (user.role === 'admin' && user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Cannot delete other administrators' });
    }

    // Delete user's progress records
    await Progress.deleteMany({ user: req.params.id });
    
    // Delete the user
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/courses
// @desc    Get all courses for admin management
// @access  Admin only
router.get('/courses', requireAdmin, async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('instructor', 'username email')
      .sort({ createdAt: -1 });
    
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/courses/:id
// @desc    Update course (publish/unpublish, etc.)
// @access  Admin only
router.put('/courses/:id', requireAdmin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Update course fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        course[key] = req.body[key];
      }
    });

    await course.save();
    
    res.json({ message: 'Course updated successfully', course });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/courses/:id
// @desc    Delete course
// @access  Admin only
router.delete('/courses/:id', requireAdmin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Delete related progress records
    await Progress.deleteMany({ course: req.params.id });
    
    // Remove course from users' enrolled and completed courses
    await User.updateMany(
      { $or: [{ enrolledCourses: req.params.id }, { completedCourses: req.params.id }] },
      { 
        $pull: { 
          enrolledCourses: req.params.id,
          completedCourses: req.params.id
        }
      }
    );
    
    // Delete the course
    await Course.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/activity
// @desc    Get recent system activity
// @access  Admin only
router.get('/activity', requireAdmin, async (req, res) => {
  try {
    // Get recent users
    const recentUsers = await User.find()
      .select('username email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent course completions
    const recentCompletions = await Progress.find({ isCompleted: true })
      .populate('user', 'username')
      .populate('course', 'title')
      .sort({ updatedAt: -1 })
      .limit(5);

    // Get recent courses
    const recentCourses = await Course.find()
      .select('title createdAt isPublished')
      .sort({ createdAt: -1 })
      .limit(5);

    const activity = [
      ...recentUsers.map(user => ({
        type: 'user_registered',
        message: `New user registered: ${user.email}`,
        timestamp: user.createdAt,
        icon: 'user'
      })),
      ...recentCompletions.map(completion => ({
        type: 'course_completed',
        message: `${completion.user.username} completed: ${completion.course.title}`,
        timestamp: completion.updatedAt,
        icon: 'book'
      })),
      ...recentCourses.map(course => ({
        type: 'course_created',
        message: `Course ${course.isPublished ? 'published' : 'created'}: ${course.title}`,
        timestamp: course.createdAt,
        icon: 'plus'
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    res.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/backup
// @desc    Create database backup
// @access  Admin only
router.post('/backup', requireAdmin, async (req, res) => {
  try {
    // This is a placeholder - in production you'd implement actual backup logic
    const backupInfo = {
      timestamp: new Date(),
      collections: ['users', 'courses', 'progress'],
      status: 'completed',
      size: '2.4 MB' // Mock data
    };

    res.json({ 
      message: 'Backup created successfully', 
      backup: backupInfo 
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/database/users
// @desc    Get all users for database viewing
// @access  Admin only
router.get('/database/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users from database:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/database/courses
// @desc    Get all courses for database viewing
// @access  Admin only
router.get('/database/courses', requireAdmin, async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('instructor', 'username email')
      .sort({ createdAt: -1 });
    
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses from database:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/database/progress
// @desc    Get all progress records for database viewing
// @access  Admin only
router.get('/database/progress', requireAdmin, async (req, res) => {
  try {
    const progress = await Progress.find()
      .populate('user', 'username email')
      .populate('course', 'title category')
      .sort({ updatedAt: -1 });
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress from database:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/reset-sample-data
// @desc    Reset database to sample data
// @access  Admin only
router.post('/reset-sample-data', requireAdmin, async (req, res) => {
  try {
    const seedDatabase = require('../seeds/seedDatabase');
    await seedDatabase();
    
    res.json({ message: 'Sample data reset successfully' });
  } catch (error) {
    console.error('Error resetting sample data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/database/stats
// @desc    Get database statistics
// @access  Admin only
router.get('/database/stats', requireAdmin, async (req, res) => {
  try {
    const stats = {
      users: await User.countDocuments(),
      courses: await Course.countDocuments(),
      progress: await Progress.countDocuments(),
      publishedCourses: await Course.countDocuments({ isPublished: true }),
      completedCourses: await Progress.countDocuments({ isCompleted: true }),
      activeStudents: await User.countDocuments({ role: 'student' }),
      admins: await User.countDocuments({ role: 'admin' })
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching database stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/database/transaction
// @desc    Execute database transaction examples
// @access  Admin only
router.post('/database/transaction', requireAdmin, async (req, res) => {
  try {
    const { operation, data } = req.body;
    const { DatabaseOperations, AdvancedQueries, DatabaseTransactions, DatabaseUtils } = require('../utils/databaseTransactions');
    
    let result;
    
    switch (operation) {
      case 'healthCheck':
        result = await DatabaseUtils.healthCheck();
        break;
        
      case 'userAnalytics':
        result = await AdvancedQueries.getUserAnalytics();
        break;
        
      case 'completionStats':
        result = await AdvancedQueries.getCourseCompletionStats();
        break;
        
      case 'enrollStudent':
        result = await DatabaseTransactions.enrollStudentInCourse(data.userId, data.courseId);
        break;
        
      case 'completeCourse':
        result = await DatabaseTransactions.completeCourse(data.userId, data.courseId);
        break;
        
      case 'cleanup':
        result = await DatabaseUtils.cleanupOrphanedRecords();
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }
    
    res.json({ success: true, result });
  } catch (error) {
    console.error('Database transaction error:', error);
    res.status(500).json({ message: 'Transaction failed', error: error.message });
  }
});

// @route   POST /api/admin/database/query
// @desc    Execute custom database queries
// @access  Admin only
router.post('/database/query', requireAdmin, async (req, res) => {
  try {
    const { collection, operation, query, update, options } = req.body;
    
    let Model;
    switch (collection) {
      case 'users':
        Model = User;
        break;
      case 'courses':
        Model = Course;
        break;
      case 'progress':
        Model = Progress;
        break;
      default:
        return res.status(400).json({ message: 'Invalid collection' });
    }
    
    let result;
    switch (operation) {
      case 'find':
        result = await Model.find(query || {}, null, options);
        break;
      case 'findOne':
        result = await Model.findOne(query || {});
        break;
      case 'count':
        result = await Model.countDocuments(query || {});
        break;
      case 'update':
        result = await Model.updateMany(query || {}, update, options);
        break;
      case 'delete':
        result = await Model.deleteMany(query || {});
        break;
      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }
    
    res.json({ success: true, result });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ message: 'Query failed', error: error.message });
  }
});

// @route   PUT /api/admin/courses/:id/publish
// @desc    Publish or unpublish a course
// @access  Admin only
router.put('/courses/:id/publish', requireAdmin, async (req, res) => {
  try {
    const { isPublished } = req.body;
    
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isPublished: isPublished !== undefined ? isPublished : true },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({
      message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
      course
    });
  } catch (error) {
    console.error('Error publishing course:', error);
    res.status(500).json({ message: 'Failed to publish course', error: error.message });
  }
});

module.exports = router;