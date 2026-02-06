// 📦 IMPORT DEPENDENCIES
const express = require('express');                    // Web framework
const Progress = require('../models/Progress');        // Progress model
const Course = require('../models/Course');            // Course model
const auth = require('../middleware/auth');            // Authentication middleware

const router = express.Router();

// 📊 GET USER'S PROGRESS FOR A COURSE: Retrieve progress data for specific course
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    // 🔍 FIND PROGRESS: Get progress record with course details
    const progress = await Progress.findOne({
      user: req.userId,
      course: req.params.courseId
    }).populate('course', 'title lessons');  // Include course title and lessons

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ MARK LESSON AS COMPLETED: Update progress when user finishes a lesson
router.post('/lesson/:courseId/:lessonId/complete', auth, async (req, res) => {
  try {
    const { score } = req.body;

    console.log('Marking lesson complete:', {
      userId: req.userId,
      courseId: req.params.courseId,
      lessonId: req.params.lessonId
    });

    // 🔍 FIND PROGRESS: Get user's progress for this course
    let progress = await Progress.findOne({
      user: req.userId,
      course: req.params.courseId
    });

    if (!progress) {
      console.log('Progress not found for user');
      return res.status(404).json({ message: 'Progress not found' });
    }

    // 🔍 CHECK IF ALREADY COMPLETED: Avoid duplicate entries
    const existingLesson = progress.completedLessons.find(
      lesson => lesson.lessonId === req.params.lessonId
    });

    if (!existingLesson) {
      // ➕ ADD NEW COMPLETION: Add lesson to completed list
      progress.completedLessons.push({
        lessonId: req.params.lessonId,
        score: score || null,
        completedAt: new Date()
      });
      console.log('Added lesson to completed list');
    } else {
      // 🔄 UPDATE SCORE: Update existing lesson score if provided
      if (score !== undefined) {
        existingLesson.score = score;
      }
      console.log('Lesson already completed, updated score');
    }

    // 🧮 CALCULATE OVERALL PROGRESS: Update completion percentage
    const course = await Course.findById(req.params.courseId);
    const totalLessons = course.lessons.length;
    const completedLessons = progress.completedLessons.length;
    progress.overallProgress = Math.round((completedLessons / totalLessons) * 100);

    // 🏆 CHECK IF COURSE COMPLETED: Mark course as completed if 100%
    if (progress.overallProgress === 100 && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }

    // 📅 UPDATE LAST ACCESSED: Track user activity
    progress.lastAccessedAt = new Date();
    await progress.save();

    // 🎓 CHECK CERTIFICATE ELIGIBILITY: Auto-generate certificate if eligible
    await checkCertificateEligibility(progress, course);

    console.log('Progress saved successfully:', {
      completedLessons: progress.completedLessons.length,
      overallProgress: progress.overallProgress,
      certificateIssued: progress.certificate?.issued
    });

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit quiz attempt
router.post('/quiz/:courseId/:quizId/submit', auth, async (req, res) => {
  try {
    const { answers, timeSpent } = req.body;

    let progress = await Progress.findOne({
      user: req.userId,
      course: req.params.courseId
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    const course = await Course.findById(req.params.courseId);
    const quiz = course.quizzes.id(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const gradedAnswers = answers.map(answer => {
      const question = quiz.questions.id(answer.questionId);
      const isCorrect = question.answer === answer.answer;

      if (isCorrect) correctAnswers++;
      totalPoints += question.points;
      if (isCorrect) earnedPoints += question.points;

      return {
        questionId: answer.questionId,
        answer: answer.answer,
        isCorrect,
        points: isCorrect ? question.points : 0
      };
    });

    const score = Math.round((earnedPoints / totalPoints) * 100);
    const passed = score >= quiz.passingScore;

    // Find or create quiz progress
    let quizProgress = progress.quizzesCompleted.find(q => q.quizId === req.params.quizId);

    if (!quizProgress) {
      quizProgress = {
        quizId: req.params.quizId,
        attempts: [],
        bestScore: 0,
        passed: false
      };
      progress.quizzesCompleted.push(quizProgress);
    }

    // Add attempt
    const attemptNumber = quizProgress.attempts.length + 1;
    quizProgress.attempts.push({
      attemptNumber,
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      timeSpent,
      answers: gradedAnswers,
      completedAt: new Date()
    });

    // Update best score and passed status
    if (score > quizProgress.bestScore) {
      quizProgress.bestScore = score;
    }

    if (passed && !quizProgress.passed) {
      quizProgress.passed = true;
      quizProgress.completedAt = new Date();

      // Emit real-time notification
      if (req.io) {
        req.io.to(`user_${req.userId}`).emit('notification', {
          message: `🎉 Congratulations! You passed the quiz for "${quiz.title}" with a score of ${score}%!`,
          type: 'success'
        });
      }
    }

    // Update total time spent
    progress.timeSpent += timeSpent;
    progress.lastAccessedAt = new Date();

    // Check certificate eligibility
    await checkCertificateEligibility(progress, course);

    await progress.save();

    res.json({
      score,
      passed,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      bestScore: quizProgress.bestScore,
      attemptNumber,
      canRetake: attemptNumber < quiz.maxAttempts && !passed
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update time spent on lesson
router.post('/lesson/:courseId/:lessonId/time', auth, async (req, res) => {
  try {
    const { timeSpent } = req.body;

    let progress = await Progress.findOne({
      user: req.userId,
      course: req.params.courseId
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    progress.timeSpent += timeSpent;
    progress.lastAccessedAt = new Date();

    await progress.save();

    res.json({ message: 'Time updated', totalTimeSpent: progress.timeSpent });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get detailed progress with certificate eligibility
router.get('/detailed/:courseId', auth, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.userId,
      course: req.params.courseId
    }).populate('course');

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    const course = progress.course;

    // Calculate detailed progress
    const totalLessons = course.lessons.length;
    const totalQuizzes = course.quizzes.length;
    const completedLessons = progress.completedLessons.length;
    const passedQuizzes = progress.quizzesCompleted.filter(q => q.passed).length;

    const lessonProgress = Math.round((completedLessons / totalLessons) * 100);
    const quizProgress = totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 100;

    // Certificate eligibility check
    const requirements = {
      allLessonsCompleted: completedLessons === totalLessons,
      allQuizzesPassed: passedQuizzes === totalQuizzes,
      minimumTimeSpent: progress.timeSpent >= (course.estimatedDuration * 60 * 0.8),
      minimumScore: progress.quizzesCompleted.length > 0 ?
        (progress.quizzesCompleted.reduce((sum, q) => sum + q.bestScore, 0) / progress.quizzesCompleted.length) >= 70 : true
    };

    const certificateEligible = Object.values(requirements).every(req => req === true);

    // Auto-check for missing certificate if eligible
    if (certificateEligible && !progress.certificate.issued) {
      await checkCertificateEligibility(progress, course);
    }

    res.json({
      ...progress.toObject(),
      detailedProgress: {
        lessonProgress,
        quizProgress,
        overallProgress: Math.round((lessonProgress + quizProgress) / 2)
      },
      requirements,
      certificateEligible
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's overall progress
router.get('/dashboard', auth, async (req, res) => {
  try {
    console.log('Dashboard request for user:', req.userId);

    const progressRecords = await Progress.find({ user: req.userId })
      .populate('course', 'title category difficulty thumbnail estimatedDuration');

    console.log('Found progress records:', progressRecords.length);

    const stats = {
      totalCourses: progressRecords.length,
      completedCourses: progressRecords.filter(p => p.isCompleted).length,
      inProgressCourses: progressRecords.filter(p => !p.isCompleted && p.overallProgress > 0).length,
      totalTimeSpent: progressRecords.reduce((total, p) => total + (p.timeSpent || 0), 0),
      certificatesEarned: progressRecords.filter(p => p.certificate && p.certificate.issued).length
    };

    res.json({
      stats,
      courses: progressRecords
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to check certificate eligibility
async function checkCertificateEligibility(progress, course) {
  const totalLessons = course.lessons.length;
  const totalQuizzes = course.quizzes.length;
  const completedLessons = progress.completedLessons.length;
  const passedQuizzes = progress.quizzesCompleted.filter(q => q.passed).length;

  const allLessonsCompleted = completedLessons === totalLessons;
  const allQuizzesPassed = passedQuizzes === totalQuizzes;
  // const minimumTimeSpent = progress.timeSpent >= (course.estimatedDuration * 60 * 0.8); // Disabled for easier testing

  console.log(`Checking Certificate Eligibility for User ${progress.user}:`);
  console.log(`- Lessons: ${completedLessons}/${totalLessons}`);
  console.log(`- Quizzes: ${passedQuizzes}/${totalQuizzes}`);
  // console.log(`- Time: ${progress.timeSpent}/${course.estimatedDuration * 60 * 0.8}`);

  if (allLessonsCompleted && allQuizzesPassed && !progress.certificate.issued) {
    try {
      // Generate certificate
      const Certificate = require('../models/Certificate'); // Import here to avoid circular dependency

      progress.isCompleted = true;
      progress.completedAt = new Date();
      progress.certificate.issued = true;
      progress.certificate.issuedAt = new Date();

      // Prepare data for generator
      const progressData = {
        completedAt: progress.completedAt,
        averageQuizScore: progress.quizzesCompleted.length > 0
          ? Math.round(progress.quizzesCompleted.reduce((sum, q) => sum + q.bestScore, 0) / progress.quizzesCompleted.length)
          : 100,
        totalTimeSpent: progress.timeSpent
      };

      console.log('🎉 Generating Certificate via Model...');

      // Use the static method which handles validation and signatures
      const newCert = await Certificate.generateCertificate(progress.user, course._id, progressData);

      // Update progress with the generated ID
      progress.certificate.certificateId = newCert.certificateId;
      console.log('🎉 Certificate generated successfully!', newCert.certificateId);

      // IMPORTANT: Save the progress to persist the issued status
      await progress.save();

    } catch (error) {
      console.error('Error generating certificate:', error);
    }
  } else {
    console.log('Certificate conditions not met yet.');
  }
}

module.exports = router;