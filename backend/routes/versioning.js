const express = require('express');
const Course = require('../models/Course');
const CourseVersion = require('../models/CourseVersion');
const User = require('../models/User');
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
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/versioning/courses/:courseId/versions
// @desc    Get all versions of a course
// @access  Private/Admin
router.get('/courses/:courseId/versions', auth, requireAdmin, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const versions = await CourseVersion.find({ course: courseId })
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .populate('parentVersion', 'version')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-lessons.quiz.correctAnswer -lessons.practicalExercise.solution');

    const total = await CourseVersion.countDocuments({ course: courseId });

    res.json({
      versions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/versioning/courses/:courseId/versions
// @desc    Create new version of a course
// @access  Private/Admin
router.post('/courses/:courseId/versions', auth, requireAdmin, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { changeLog, ...courseData } = req.body;

    if (!changeLog) {
      return res.status(400).json({ message: 'Change log is required' });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Create new version
    const newVersion = await CourseVersion.createVersion(
      courseId,
      courseData,
      changeLog,
      req.userId
    );

    // Invalidate cache
    cacheService.invalidateCourse(courseId);

    res.status(201).json({
      message: 'New version created successfully',
      version: newVersion
    });

  } catch (error) {
    console.error('Create version error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/versioning/courses/:courseId/versions/:versionId
// @desc    Get specific version of a course
// @access  Private/Admin
router.get('/courses/:courseId/versions/:versionId', auth, requireAdmin, async (req, res) => {
  try {
    const { courseId, versionId } = req.params;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const version = await CourseVersion.findOne({
      _id: versionId,
      course: courseId
    })
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .populate('parentVersion', 'version changeLog');

    if (!version) {
      return res.status(404).json({ message: 'Version not found' });
    }

    res.json(version);

  } catch (error) {
    console.error('Get version error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/versioning/courses/:courseId/versions/:versionId/activate
// @desc    Activate a specific version
// @access  Private/Admin
router.put('/courses/:courseId/versions/:versionId/activate', auth, requireAdmin, async (req, res) => {
  try {
    const { courseId, versionId } = req.params;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const version = await CourseVersion.findOne({
      _id: versionId,
      course: courseId
    });

    if (!version) {
      return res.status(404).json({ message: 'Version not found' });
    }

    // Activate the version
    await version.activate();

    // Invalidate cache
    cacheService.invalidateCourse(courseId);

    res.json({
      message: 'Version activated successfully',
      version: version.version
    });

  } catch (error) {
    console.error('Activate version error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/versioning/courses/:courseId/versions/:versionId/compare/:compareVersionId
// @desc    Compare two versions of a course
// @access  Private/Admin
router.get('/courses/:courseId/versions/:versionId/compare/:compareVersionId', auth, requireAdmin, async (req, res) => {
  try {
    const { courseId, versionId, compareVersionId } = req.params;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const [version1, version2] = await Promise.all([
      CourseVersion.findOne({ _id: versionId, course: courseId }),
      CourseVersion.findOne({ _id: compareVersionId, course: courseId })
    ]);

    if (!version1 || !version2) {
      return res.status(404).json({ message: 'One or both versions not found' });
    }

    const comparison = version1.compareWith(version2);

    res.json({
      version1: {
        id: version1._id,
        version: version1.version,
        createdAt: version1.createdAt
      },
      version2: {
        id: version2._id,
        version: version2.version,
        createdAt: version2.createdAt
      },
      changes: comparison
    });

  } catch (error) {
    console.error('Compare versions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/versioning/courses/:courseId/versions/:versionId
// @desc    Delete a specific version (cannot delete active version)
// @access  Private/Admin
router.delete('/courses/:courseId/versions/:versionId', auth, requireAdmin, async (req, res) => {
  try {
    const { courseId, versionId } = req.params;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const version = await CourseVersion.findOne({
      _id: versionId,
      course: courseId
    });

    if (!version) {
      return res.status(404).json({ message: 'Version not found' });
    }

    if (version.isActive) {
      return res.status(400).json({ message: 'Cannot delete active version' });
    }

    await CourseVersion.findByIdAndDelete(versionId);

    res.json({ message: 'Version deleted successfully' });

  } catch (error) {
    console.error('Delete version error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/versioning/courses/:courseId/versions/:versionId/restore
// @desc    Restore a course to a specific version
// @access  Private/Admin
router.post('/courses/:courseId/versions/:versionId/restore', auth, requireAdmin, async (req, res) => {
  try {
    const { courseId, versionId } = req.params;
    const { changeLog } = req.body;

    if (!changeLog) {
      return res.status(400).json({ message: 'Change log is required for restoration' });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const versionToRestore = await CourseVersion.findOne({
      _id: versionId,
      course: courseId
    });

    if (!versionToRestore) {
      return res.status(404).json({ message: 'Version not found' });
    }

    // Create a new version based on the version to restore
    const restoredVersion = await CourseVersion.createVersion(
      courseId,
      {
        title: versionToRestore.title,
        description: versionToRestore.description,
        category: versionToRestore.category,
        difficulty: versionToRestore.difficulty,
        lessons: versionToRestore.lessons,
        tags: versionToRestore.tags,
        prerequisites: versionToRestore.prerequisites,
        learningObjectives: versionToRestore.learningObjectives,
        estimatedDuration: versionToRestore.estimatedDuration,
        thumbnail: versionToRestore.thumbnail,
        isPublished: versionToRestore.isPublished
      },
      `Restored from version ${versionToRestore.version}: ${changeLog}`,
      req.userId
    );

    // Activate the restored version
    await restoredVersion.activate();

    // Invalidate cache
    cacheService.invalidateCourse(courseId);

    res.json({
      message: 'Course restored successfully',
      restoredVersion: restoredVersion.version,
      originalVersion: versionToRestore.version
    });

  } catch (error) {
    console.error('Restore version error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/versioning/courses/:courseId/history
// @desc    Get version history with change summaries
// @access  Private/Admin
router.get('/courses/:courseId/history', auth, requireAdmin, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const history = await CourseVersion.find({ course: courseId })
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .select('version changeLog createdAt isActive createdBy');

    res.json({
      courseTitle: course.title,
      currentVersion: course.currentVersion,
      history
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;