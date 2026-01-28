const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Update video URLs to use local files
router.post('/use-local-videos', async (req, res) => {
  try {
    const course = await Course.findOne({ title: 'Introduction to Cybersecurity' });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Update lesson videos to use local files
    if (course.lessons[0]) {
      course.lessons[0].videoUrl = '/videos/lesson1-cybersecurity-intro.mp4';
    }
    if (course.lessons[1]) {
      course.lessons[1].videoUrl = '/videos/lesson2-cyber-threats.mp4';
    }

    await course.save();
    
    res.json({ 
      message: 'Video URLs updated to use local files!',
      lessons: course.lessons.map(l => ({ title: l.title, videoUrl: l.videoUrl }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
