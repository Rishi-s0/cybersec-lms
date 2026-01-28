const mongoose = require('mongoose');
const Course = require('../models/Course');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function fixLesson4() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const course = await Course.findOne({ title: 'Introduction to Cybersecurity' });

        if (course) {
            console.log('Found course:', course.title);

            const lesson4 = course.lessons.find(l => l.title === 'Incident Response Basics');
            if (lesson4) {
                console.log('Found Lesson 4. Current Video:', lesson4.videoUrl);
                lesson4.videoUrl = '/videos/lesson4-incident-response.mp4';

                // Also fix Lesson 5 if it exists and uses YouTube, since file exists
                const lesson5 = course.lessons.find(l => l.title === 'Building a Security Mindset');
                if (lesson5) {
                    console.log('Found Lesson 5. Current Video:', lesson5.videoUrl);
                    lesson5.videoUrl = '/videos/lesson5-security-mindset.mp4';
                }

                await course.save();
                console.log('✅ Updated Lesson 4 (and 5) to use local video files.');
            } else {
                console.log('Lesson 4 not found by title "Incident Response Basics"');
            }
        } else {
            console.log('Course not found');
        }
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

fixLesson4();
