const express = require('express');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const User = require('../models/User');
const auth = require('../middleware/auth');
const cacheService = require('../services/cacheService');

const router = express.Router();

// Get all courses (with caching)
router.get('/', cacheService.middleware(10 * 60 * 1000), async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    let query = { isPublished: true };

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const courses = await Course.find(query)
      .populate('instructor', 'username profile.firstName profile.lastName')
      .select('-lessons.quiz.correctAnswer -lessons.practicalExercise.solution');

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new course
router.post('/', auth, async (req, res) => {
  try {
    const courseData = {
      ...req.body,
      instructor: req.body.instructorId || req.userId,
      instructorId: req.body.instructorId || req.userId
    };

    const course = new Course(courseData);
    await course.save();

    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'username profile.firstName profile.lastName profile.bio');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Enroll in course
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    console.log('Enrollment attempt:', { userId: req.userId, courseId: req.params.id });

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    if (course.enrolledStudents.includes(req.userId)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Add student to course
    course.enrolledStudents.push(req.userId);
    await course.save();
    console.log('Added student to course enrolledStudents');

    // Create progress record
    const progress = new Progress({
      user: req.userId,
      course: req.params.id,
      completedLessons: [],
      overallProgress: 0,
      timeSpent: 0,
      isCompleted: false
    });
    await progress.save();
    console.log('Created progress record:', progress._id);

    // Update user's enrolled courses
    const User = require('../models/User');
    const updatedUser = await User.findByIdAndUpdate(req.userId, {
      $push: {
        enrolledCourses: {
          courseId: req.params.id,
          enrolledAt: new Date()
        }
      }
    }, { new: true });
    console.log('Updated user enrolled courses');

    res.json({
      message: 'Successfully enrolled in course',
      progress: progress,
      courseId: req.params.id,
      userId: req.userId
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unenroll from course
router.post('/:id/unenroll', auth, async (req, res) => {
  try {
    console.log('Unenrollment attempt:', { userId: req.userId, courseId: req.params.id });

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Remove student from course
    const previousCount = course.enrolledStudents.length;
    course.enrolledStudents = course.enrolledStudents.filter(id => id.toString() !== req.userId);
    console.log(`Unenroll: Removed user ${req.userId} from course ${req.params.id}. Count: ${previousCount} -> ${course.enrolledStudents.length}`);
    await course.save();

    // Delete progress record
    const progressResult = await Progress.findOneAndDelete({ user: req.userId, course: req.params.id });
    console.log('Unenroll: Progress deleted:', progressResult ? 'Yes' : 'No');

    // Update user's enrolled courses
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.userId, {
      $pull: {
        enrolledCourses: {
          courseId: req.params.id
        }
      }
    });

    res.json({ message: 'Successfully unenrolled from course' });
  } catch (error) {
    console.error('Unenrollment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Duplicate POST route removed. Use the one defined above.

// Update course (instructor/admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('instructor', 'username profile.firstName profile.lastName');

    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete course (instructor/admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Delete associated progress records
    await Progress.deleteMany({ course: req.params.id });

    // Delete the course
    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all courses for admin (including unpublished)
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Check if user is admin
    let userRole = req.userRole;

    // Fallback: If role is not in token (legacy token), fetch from DB
    if (!userRole) {
      const user = await User.findById(req.userId);
      if (user) {
        userRole = user.role;
      }
    }

    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const courses = await Course.find({})
      .populate('instructor', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test endpoint to check enrollment status
router.get('/:id/enrollment-status', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const progress = await Progress.findOne({ user: req.userId, course: req.params.id });

    res.json({
      courseExists: !!course,
      isEnrolled: course ? course.enrolledStudents.includes(req.userId) : false,
      hasProgress: !!progress,
      enrolledStudentsCount: course ? course.enrolledStudents.length : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;