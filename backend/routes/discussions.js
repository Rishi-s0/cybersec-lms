const express = require('express');
const Discussion = require('../models/Discussion');
const Course = require('../models/Course');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/discussions/course/:courseId
// @desc    Get discussions for a course
// @access  Private
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, lessonId } = req.query;

    let query = { courseId: req.params.courseId };
    if (type) query.type = type;
    if (lessonId) query.lessonId = lessonId;

    const discussions = await Discussion.find(query)
      .populate('userId', 'name username profile.firstName profile.lastName')
      .populate('replies.userId', 'name username profile.firstName profile.lastName')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Discussion.countDocuments(query);

    res.json({
      discussions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/discussions
// @desc    Create new discussion
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { courseId, lessonId, title, message, type, tags } = req.body;

    // Verify user is enrolled in the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const user = await User.findById(req.user.id);
    const isEnrolled = user.enrolledCourses.some(
      enrollment => enrollment.courseId.toString() === courseId
    );

    if (!isEnrolled && user.role !== 'admin') {
      return res.status(403).json({ message: 'Must be enrolled in course or be admin to participate in discussions' });
    }

    const discussion = new Discussion({
      courseId,
      lessonId,
      userId: req.user.id,
      title,
      message,
      type: type || 'discussion',
      tags: tags || []
    });

    await discussion.save();

    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate('userId', 'name username profile.firstName profile.lastName');

    res.status(201).json(populatedDiscussion);
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/discussions/:id/reply
// @desc    Add reply to discussion
// @access  Private
router.post('/:id/reply', auth, async (req, res) => {
  try {
    const { message } = req.body;

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is enrolled or is instructor/admin
    const user = await User.findById(req.user.id);
    const course = await Course.findById(discussion.courseId);

    const isEnrolled = user.enrolledCourses.some(
      enrollment => enrollment.courseId.toString() === discussion.courseId.toString()
    );

    const isAdmin = user.role === 'admin';

    if (!isEnrolled && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await discussion.addReply(req.user.id, message, isInstructor);

    const updatedDiscussion = await Discussion.findById(req.params.id)
      .populate('userId', 'name username profile.firstName profile.lastName')
      .populate('replies.userId', 'name username profile.firstName profile.lastName');

    res.json(updatedDiscussion);
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/discussions/:id/like
// @desc    Toggle like on discussion
// @access  Private
router.put('/:id/like', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    await discussion.toggleLike(req.user.id);

    res.json({
      message: 'Like toggled successfully',
      likeCount: discussion.likes.length
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/discussions/:id/solve
// @desc    Mark discussion as solved
// @access  Private (Instructor/Admin only)
router.put('/:id/solve', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const user = await User.findById(req.user.id);
    const course = await Course.findById(discussion.courseId);

    const isAdmin = user.role === 'admin';

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only instructors can mark discussions as solved' });
    }

    await discussion.markAsSolved(req.user.id);

    res.json({ message: 'Discussion marked as solved' });
  } catch (error) {
    console.error('Error marking as solved:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/discussions/:id
// @desc    Delete discussion
// @access  Private (Author/Instructor/Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const user = await User.findById(req.user.id);
    const course = await Course.findById(discussion.courseId);

    const isAuthor = discussion.userId.toString() === req.user.id;
    const isAdmin = user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Discussion.findByIdAndDelete(req.params.id);

    res.json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/discussions/:id/pin
// @desc    Pin/unpin discussion
// @access  Private (Instructor/Admin only)
router.put('/:id/pin', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const user = await User.findById(req.user.id);
    const course = await Course.findById(discussion.courseId);

    const isAdmin = user.role === 'admin';

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only instructors can pin discussions' });
    }

    discussion.isPinned = !discussion.isPinned;
    await discussion.save();

    res.json({
      message: `Discussion ${discussion.isPinned ? 'pinned' : 'unpinned'} successfully`,
      isPinned: discussion.isPinned
    });
  } catch (error) {
    console.error('Error pinning discussion:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
