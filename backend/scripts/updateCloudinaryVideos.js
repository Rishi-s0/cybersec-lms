require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Course = require('../models/Course');

const videoUrls = {
  1: 'https://res.cloudinary.com/dsgemkjkp/video/upload/v1774092971/lesson1-cybersecurity-intro_j6fzai.mp4',
  2: 'https://res.cloudinary.com/dsgemkjkp/video/upload/v1774092986/lesson2-cyber-threats_vhmbfx.mp4',
  3: 'https://res.cloudinary.com/dsgemkjkp/video/upload/v1774092972/lesson3-security-best-practices_csngmi.mp4',
  4: 'https://res.cloudinary.com/dsgemkjkp/video/upload/v1774092972/lesson3-security-best-practices_csngmi.mp4',
  5: 'https://res.cloudinary.com/dsgemkjkp/video/upload/v1774092972/lesson3-security-best-practices_csngmi.mp4'
};

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const course = await Course.findOne({ title: /Introduction to Cybersecurity/i });
  if (!course) { console.log('Course not found'); process.exit(1); }

  course.lessons.forEach((lesson, index) => {
    const url = videoUrls[index + 1];
    if (url) {
      lesson.videoUrl = url;
      console.log(`Updated lesson ${index + 1}: ${lesson.title}`);
    }
  });

  await course.save();
  console.log('✅ All video URLs updated to Cloudinary');
  mongoose.disconnect();
}).catch(err => { console.error(err); process.exit(1); });
