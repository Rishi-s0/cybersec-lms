const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Fix video URLs to use watch format instead of embed
router.post('/fix-video-urls', async (req, res) => {
  try {
    const course = await Course.findOne({ title: 'Introduction to Cybersecurity' });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Update lesson videos to use watch URLs
    if (course.lessons[0]) {
      course.lessons[0].videoUrl = 'https://www.youtube.com/watch?v=inWWhr5tnEA';
    }
    if (course.lessons[1]) {
      course.lessons[1].videoUrl = 'https://www.youtube.com/watch?v=Dk-ZqQ-bfy4';
    }

    await course.save();
    
    res.json({ 
      message: 'Video URLs fixed!',
      lessons: course.lessons.map(l => ({ title: l.title, videoUrl: l.videoUrl }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
