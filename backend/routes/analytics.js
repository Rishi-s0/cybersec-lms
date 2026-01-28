const express = require('express');
const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const cacheService = require('../services/cacheService');

const router = express.Router();

// Middleware to check admin access
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/analytics/dashboard
// @desc    Get admin dashboard analytics
// @access  Private/Admin
router.get('/dashboard', auth, requireAdmin, cacheService.middleware(5 * 60 * 1000), async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Progress.countDocuments();
    const totalCertificates = await Certificate.countDocuments();

    // Recent activity (last 30 days)
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    const recentEnrollments = await Progress.countDocuments({ 
      enrolledAt: { $gte: thirtyDaysAgo } 
    });
    const recentCompletions = await Progress.countDocuments({ 
      completedAt: { $gte: thirtyDaysAgo } 
    });

    // User activity (last 7 days)
    const activeUsers = await User.countDocuments({ 
      lastLogin: { $gte: sevenDaysAgo } 
    });

    // Course popularity
    const popularCourses = await Progress.aggregate([
      { $group: { _id: '$course', enrollments: { $sum: 1 } } },
      { $sort: { enrollments: -1 } },
      { $limit: 5 },
      { 
        $lookup: { 
          from: 'courses', 
          localField: '_id', 
          foreignField: '_id', 
          as: 'courseInfo' 
        } 
      },
      { $unwind: '$courseInfo' },
      { 
        $project: { 
          title: '$courseInfo.title',
          category: '$courseInfo.category',
          enrollments: 1 
        } 
      }
    ]);

    // User roles distribution
    const userRoles = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Category distribution
    const categoryStats = await Course.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalCertificates,
        activeUsers,
        recentUsers,
        recentEnrollments,
        recentCompletions
      },
      popularCourses,
      userRoles,
      categoryStats
    });

  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/users
// @desc    Get user analytics
// @access  Private/Admin
router.get('/users', auth, requireAdmin, async (req, res) => {
  try {
    const { timeframe = '30d', page = 1, limit = 20 } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // User registration over time
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Most active users
    const activeUsers = await Progress.aggregate([
      {
        $group: {
          _id: '$user',
          coursesEnrolled: { $sum: 1 },
          coursesCompleted: { 
            $sum: { $cond: [{ $ne: ['$completedAt', null] }, 1, 0] } 
          },
          totalTimeSpent: { $sum: '$timeSpent' }
        }
      },
      { $sort: { coursesEnrolled: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          username: '$userInfo.username',
          email: '$userInfo.email',
          role: '$userInfo.role',
          coursesEnrolled: 1,
          coursesCompleted: 1,
          totalTimeSpent: 1,
          completionRate: {
            $multiply: [
              { $divide: ['$coursesCompleted', '$coursesEnrolled'] },
              100
            ]
          }
        }
      }
    ]);

    res.json({
      userGrowth,
      activeUsers,
      timeframe
    });

  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/courses
// @desc    Get course analytics
// @access  Private/Admin
router.get('/courses', auth, requireAdmin, async (req, res) => {
  try {
    // Course performance metrics
    const courseMetrics = await Progress.aggregate([
      {
        $group: {
          _id: '$course',
          totalEnrollments: { $sum: 1 },
          completions: { 
            $sum: { $cond: [{ $ne: ['$completedAt', null] }, 1, 0] } 
          },
          averageProgress: { $avg: '$progressPercentage' },
          totalTimeSpent: { $sum: '$timeSpent' },
          averageTimeSpent: { $avg: '$timeSpent' }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'courseInfo'
        }
      },
      { $unwind: '$courseInfo' },
      {
        $project: {
          title: '$courseInfo.title',
          category: '$courseInfo.category',
          difficulty: '$courseInfo.difficulty',
          totalEnrollments: 1,
          completions: 1,
          averageProgress: { $round: ['$averageProgress', 2] },
          completionRate: {
            $round: [
              { $multiply: [{ $divide: ['$completions', '$totalEnrollments'] }, 100] },
              2
            ]
          },
          totalTimeSpent: 1,
          averageTimeSpent: { $round: ['$averageTimeSpent', 2] }
        }
      },
      { $sort: { totalEnrollments: -1 } }
    ]);

    // Category performance
    const categoryPerformance = await Progress.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'courseInfo'
        }
      },
      { $unwind: '$courseInfo' },
      {
        $group: {
          _id: '$courseInfo.category',
          totalEnrollments: { $sum: 1 },
          completions: { 
            $sum: { $cond: [{ $ne: ['$completedAt', null] }, 1, 0] } 
          },
          averageProgress: { $avg: '$progressPercentage' }
        }
      },
      {
        $project: {
          category: '$_id',
          totalEnrollments: 1,
          completions: 1,
          completionRate: {
            $round: [
              { $multiply: [{ $divide: ['$completions', '$totalEnrollments'] }, 100] },
              2
            ]
          },
          averageProgress: { $round: ['$averageProgress', 2] }
        }
      },
      { $sort: { totalEnrollments: -1 } }
    ]);

    res.json({
      courseMetrics,
      categoryPerformance
    });

  } catch (error) {
    console.error('Course analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/engagement
// @desc    Get user engagement analytics
// @access  Private/Admin
router.get('/engagement', auth, requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Daily active users (last 30 days)
    const dailyActiveUsers = await User.aggregate([
      { $match: { lastLogin: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$lastLogin' },
            month: { $month: '$lastLogin' },
            day: { $dayOfMonth: '$lastLogin' }
          },
          activeUsers: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Session duration analysis
    const sessionAnalysis = await Progress.aggregate([
      { $match: { lastAccessed: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: null,
          averageTimeSpent: { $avg: '$timeSpent' },
          totalSessions: { $sum: 1 },
          totalTimeSpent: { $sum: '$timeSpent' }
        }
      }
    ]);

    // Course completion funnel
    const completionFunnel = await Progress.aggregate([
      {
        $group: {
          _id: null,
          enrolled: { $sum: 1 },
          started: { $sum: { $cond: [{ $gt: ['$progressPercentage', 0] }, 1, 0] } },
          halfCompleted: { $sum: { $cond: [{ $gte: ['$progressPercentage', 50] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $ne: ['$completedAt', null] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      dailyActiveUsers,
      sessionAnalysis: sessionAnalysis[0] || {},
      completionFunnel: completionFunnel[0] || {}
    });

  } catch (error) {
    console.error('Engagement analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/export
// @desc    Export analytics data as CSV
// @access  Private/Admin
router.get('/export', auth, requireAdmin, async (req, res) => {
  try {
    const { type = 'users' } = req.query;

    let data = [];
    let filename = '';
    let headers = [];

    switch (type) {
      case 'users':
        data = await User.find({})
          .select('username email role createdAt lastLogin')
          .lean();
        filename = 'users_export.csv';
        headers = ['Username', 'Email', 'Role', 'Created At', 'Last Login'];
        break;

      case 'courses':
        data = await Course.find({})
          .populate('instructor', 'username')
          .select('title category difficulty instructor createdAt')
          .lean();
        filename = 'courses_export.csv';
        headers = ['Title', 'Category', 'Difficulty', 'Instructor', 'Created At'];
        break;

      case 'progress':
        data = await Progress.find({})
          .populate('user', 'username email')
          .populate('course', 'title category')
          .select('user course progressPercentage completedAt enrolledAt timeSpent')
          .lean();
        filename = 'progress_export.csv';
        headers = ['User', 'Course', 'Progress %', 'Completed At', 'Enrolled At', 'Time Spent'];
        break;

      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }

    // Convert to CSV
    const csvContent = convertToCSV(data, headers, type);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to convert data to CSV
function convertToCSV(data, headers, type) {
  const csvRows = [headers.join(',')];

  data.forEach(item => {
    let row = [];
    
    switch (type) {
      case 'users':
        row = [
          item.username,
          item.email,
          item.role,
          item.createdAt?.toISOString() || '',
          item.lastLogin?.toISOString() || ''
        ];
        break;
      case 'courses':
        row = [
          item.title,
          item.category,
          item.difficulty,
          item.instructor?.username || '',
          item.createdAt?.toISOString() || ''
        ];
        break;
      case 'progress':
        row = [
          item.user?.username || '',
          item.course?.title || '',
          item.progressPercentage || 0,
          item.completedAt?.toISOString() || '',
          item.enrolledAt?.toISOString() || '',
          item.timeSpent || 0
        ];
        break;
    }

    // Escape commas and quotes in CSV
    const escapedRow = row.map(field => {
      if (typeof field === 'string' && (field.includes(',') || field.includes('"'))) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    });

    csvRows.push(escapedRow.join(','));
  });

  return csvRows.join('\n');
}

module.exports = router;