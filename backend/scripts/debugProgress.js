const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function debugProgress() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Get course
        const course = await Course.findOne({ title: 'Introduction to Cybersecurity' });
        if (!course) {
            console.log('Course not found');
            return;
        }

        console.log(`Course: ${course.title} (ID: ${course._id})`);
        console.log(`Total Lessons: ${course.lessons.length}`);
        console.log(`Total Quizzes: ${course.quizzes.length}`);

        // Get all progress records for this course
        const progresses = await Progress.find({ course: course._id }).populate('user');

        console.log(`\nFound ${progresses.length} progress records:`);

        for (const p of progresses) {
            if (!p.user) continue; // Skip orphaned records

            const completedLessons = p.completedLessons.length;
            const passedQuizzes = p.quizzesCompleted.filter(q => q.passed).length;

            console.log(`\nUser: ${p.user.username} (${p.user.email})`);
            console.log(`- Lessons Completed: ${completedLessons}/${course.lessons.length}`);
            console.log(`- Quizzes Passed: ${passedQuizzes}/${course.quizzes.length}`);
            console.log(`- Time Spent: ${p.timeSpent} mins`);
            console.log(`- Certificate Issued: ${p.certificate?.issued}`);

            // Detailed check
            const missingLessons = course.lessons.length - completedLessons;
            const missingQuizzes = course.quizzes.length - passedQuizzes;

            if (missingLessons > 0) console.log(`  !! Missing ${missingLessons} lessons`);
            if (missingQuizzes > 0) console.log(`  !! Missing ${missingQuizzes} quizzes`);

            // Check quiz details
            if (course.quizzes.length > 0) {
                console.log('  Quiz Details:');
                course.quizzes.forEach(q => {
                    const pq = p.quizzesCompleted.find(u => u.quizId === q.quizId);
                    console.log(`    - ${q.title}: ${pq ? (pq.passed ? 'PASSED' : 'FAILED/ATTEMPTED') : 'NOT STARTED'}`);
                });
            }
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

debugProgress();
