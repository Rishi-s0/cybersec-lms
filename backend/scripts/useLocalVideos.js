// Script to update all courses to use local video files
const mongoose = require('mongoose');
const Course = require('../models/Course');
require('dotenv').config();

const localVideoMap = {
  'lesson1': '/videos/lesson1-cybersecurity-intro.mp4',
  'lesson2': '/videos/lesson2-cyber-threats.mp4',
  'lesson3': '/videos/lesson3-security-best-practices.mp4',
  'lesson4': '/videos/lesson4-incident-response.mp4',
  'lesson5': '/videos/lesson5-security-mindset.mp4'
};

async function updateToLocalVideos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const courses = await Course.find({});
    
    for (const course of courses) {
      let updated = false;
      
      for (const lesson of course.lessons) {
        const lessonKey = lesson.lessonId.toLowerCase();
        if (localVideoMap[lessonKey]) {
          lesson.videoUrl = localVideoMap[lessonKey];
          updated = true;
        }
      }
      
      if (updated) {
        await course.save();
        console.log(`✅ Updated course: ${course.title}`);
      }
    }

    console.log('\n✅ All courses updated to use local videos!');
    console.log('Videos are served from: frontend/public/videos/\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateToLocalVideos();
