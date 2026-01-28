const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Temporary PUBLIC route to add videos to lessons (remove auth for this one-time update)
router.post('/add-videos-public', async (req, res) => {
  try {
    const course = await Course.findOne({ title: 'Introduction to Cybersecurity' });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Update lesson videos
    if (course.lessons[0]) {
      course.lessons[0].videoUrl = 'https://www.youtube.com/embed/inWWhr5tnEA';
    }
    if (course.lessons[1]) {
      course.lessons[1].videoUrl = 'https://www.youtube.com/embed/Dk-ZqQ-bfy4';
    }

    await course.save();
    
    res.json({ 
      message: 'Videos added successfully!',
      lessons: course.lessons.map(l => ({ title: l.title, hasVideo: !!l.videoUrl }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
