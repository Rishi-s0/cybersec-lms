// 📦 IMPORT DEPENDENCIES
const express = require('express');                    // Web framework
const Course = require('../models/Course');            // Course model
const Progress = require('../models/Progress');        // Progress model
const User = require('../models/User');                // User model
const auth = require('../middleware/auth');            // Authentication middleware
const cacheService = require('../services/cacheService');  // Caching service

const router = express.Router();

// 📚 GET ALL COURSES: Retrieve published courses with filtering
router.get('/', cacheService.middleware(10 * 60 * 1000), async (req, res) => {
  try {
    // 🔍 EXTRACT QUERY PARAMETERS: Get filters from request
    const { category, difficulty, search } = req.query;
    let query = { isPublished: true };  // Only show published courses

    // 🏷️ APPLY FILTERS: Build query based on parameters
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      // 🔍 SEARCH: Search in title, description, and tags
      query.$or = [
        { title: { $regex: search, $options: 'i' } },           // Case-insensitive title search
        { description: { $regex: search, $options: 'i' } },     // Case-insensitive description search
        { tags: { $in: [new RegExp(search, 'i')] } }            // Search in tags array
      ];
    }

    // 📖 FETCH COURSES: Get courses with instructor info (hide sensitive data)
    const courses = await Course.find(query)
      .populate('instructor', 'username profile.firstName profile.lastName')  // Include instructor details
      .select('-lessons.quiz.correctAnswer -lessons.practicalExercise.solution');  // 🔒 Hide answers and solutions

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ➕ CREATE NEW COURSE: Add new course (admin/instructor only)
router.post('/', auth, async (req, res) => {
  try {
    // 📝 PREPARE COURSE DATA: Set instructor from authenticated user
    const courseData = {
      ...req.body,
      instructor: req.body.instructorId || req.userId,      // Use provided or current user
      instructorId: req.body.instructorId || req.userId
    };

    // 💾 CREATE COURSE: Save new course to database
    const course = new Course(courseData);
    await course.save();

    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 📖 GET COURSE BY ID: Retrieve specific course details
router.get('/:id', async (req, res) => {
  try {
    // 🔍 FIND COURSE: Get course with instructor information
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

// 🎓 ENROLL IN COURSE: Register user for a course
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    console.log('Enrollment attempt:', { userId: req.userId, courseId: req.params.id });

    // 🔍 FIND COURSE: Check if course exists
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // 🚫 CHECK DUPLICATE: Prevent multiple enrollments
    if (course.enrolledStudents.includes(req.userId)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // ➕ ADD STUDENT: Add user to course enrollment list
    course.enrolledStudents.push(req.userId);
    await course.save();
    console.log('Added student to course enrolledStudents');

    // 📊 CREATE PROGRESS RECORD: Initialize progress tracking for this user-course
    const progress = new Progress({
      user: req.userId,
      course: req.params.id,
      completedLessons: [],          // Start with no completed lessons
      overallProgress: 0,            // 0% completion
      timeSpent: 0,                  // 0 minutes spent
      isCompleted: false             // Not completed yet
    });
    await progress.save();
    console.log('Created progress record:', progress._id);

    // 👤 UPDATE USER: Add course to user's enrolled courses list
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

    // ✅ SEND RESPONSE: Return success with progress data
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

// 🚫 UNENROLL FROM COURSE: Remove user from course
router.post('/:id/unenroll', auth, async (req, res) => {
  try {
    console.log('Unenrollment attempt:', { userId: req.userId, courseId: req.params.id });

    // 🔍 FIND COURSE: Check if course exists
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // ➖ REMOVE STUDENT: Remove user from course enrollment list
    const previousCount = course.enrolledStudents.length;
    course.enrolledStudents = course.enrolledStudents.filter(id => id.toString() !== req.userId);
    console.log(`Unenroll: Removed user ${req.userId} from course ${req.params.id}. Count: ${previousCount} -> ${course.enrolledStudents.length}`);
    await course.save();

    // 🗑️ DELETE PROGRESS: Remove progress tracking record
    const progressResult = await Progress.findOneAndDelete({ user: req.userId, course: req.params.id });
    console.log('Unenroll: Progress deleted:', progressResult ? 'Yes' : 'No');

    // 👤 UPDATE USER: Remove course from user's enrolled courses
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

// ✏️ UPDATE COURSE: Modify course details (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    // 🔍 FIND COURSE: Check if course exists
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // 🔒 CHECK AUTHORIZATION: Only admins can update courses
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // 💾 UPDATE COURSE: Apply changes and return updated course
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },  // Update fields and timestamp
      { new: true, runValidators: true }       // Return updated doc, validate data
    ).populate('instructor', 'username profile.firstName profile.lastName');

    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 🗑️ DELETE COURSE: Remove course permanently (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // 🔍 FIND COURSE: Check if course exists
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // 🔒 CHECK AUTHORIZATION: Only admins can delete courses
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // 🗑️ DELETE PROGRESS RECORDS: Remove all progress data for this course
    await Progress.deleteMany({ course: req.params.id });

    // 🗑️ DELETE COURSE: Remove course from database
    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 📋 GET ALL COURSES FOR ADMIN: Retrieve all courses including unpublished (admin only)
router.get('/admin/all', auth, async (req, res) => {
  try {
    // 🔒 CHECK AUTHORIZATION: Verify user is admin
    let userRole = req.userRole;

    // Fallback: If role not in token (legacy token), fetch from database
    if (!userRole) {
      const user = await User.findById(req.userId);
      if (user) {
        userRole = user.role;
      }
    }

    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // 📚 FETCH ALL COURSES: Get all courses (published and unpublished)
    const courses = await Course.find({})
      .populate('instructor', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 });  // Sort by newest first

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 🧪 TEST ENDPOINT: Check enrollment status for debugging
router.get('/:id/enrollment-status', auth, async (req, res) => {
  try {
    // 🔍 FIND COURSE AND PROGRESS: Get enrollment data
    const course = await Course.findById(req.params.id);
    const progress = await Progress.findOne({ user: req.userId, course: req.params.id });

    // 📊 RETURN STATUS: Provide enrollment information for debugging
    res.json({
      courseExists: !!course,                                      // Does course exist?
      isEnrolled: course ? course.enrolledStudents.includes(req.userId) : false,  // Is user enrolled?
      hasProgress: !!progress,                                     // Does progress record exist?
      enrolledStudentsCount: course ? course.enrolledStudents.length : 0  // Total enrolled students
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 📤 EXPORT ROUTER: Make routes available to server
module.exports = router;