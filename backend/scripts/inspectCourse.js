const mongoose = require('mongoose');
const Course = require('../models/Course');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function checkCourse() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const course = await Course.findOne({ title: 'Introduction to Cybersecurity' });
        if (course) {
            console.log('Course found:', course.title);
            console.log('Lessons:', course.lessons.length);
            course.lessons.forEach(l => {
                console.log(`- ${l.title} (ID: ${l.lessonId})`);
                console.log(`  Video URL: ${l.videoUrl}`);
            });
        } else {
            console.log('Course not found');
        }
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

checkCourse();
