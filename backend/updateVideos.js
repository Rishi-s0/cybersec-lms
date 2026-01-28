const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');

dotenv.config();

const updateVideos = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cybersec-lms');
    console.log('Connected to MongoDB');

    // Find the Introduction to Cybersecurity course
    const course = await Course.findOne({ title: 'Introduction to Cybersecurity' });
    
    if (!course) {
      console.log('Course not found');
      return;
    }

    console.log('Found course:', course.title);
    console.log('Current lessons:', course.lessons.length);

    // Update lesson 1
    if (course.lessons[0]) {
      course.lessons[0].videoUrl = 'https://www.youtube.com/embed/inWWhr5tnEA';
      console.log('Updated lesson 1:', course.lessons[0].title);
    }

    // Update lesson 2
    if (course.lessons[1]) {
      course.lessons[1].videoUrl = 'https://www.youtube.com/embed/Dk-ZqQ-bfy4';
      console.log('Updated lesson 2:', course.lessons[1].title);
    }

    await course.save();
    console.log('✅ Videos updated successfully!');

    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
  }
};

updateVideos();
