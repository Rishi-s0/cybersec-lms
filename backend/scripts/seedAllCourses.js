const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

/**
 * Seed All 6 Courses with Complete Content
 */

async function seedAllCourses() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get instructor
    const instructor = await User.findOne({ role: 'instructor' });
    if (!instructor) {
      console.log('❌ No instructor found. Please run seedDatabase.js first.');
      return;
    }

    // Clear existing courses
    await Course.deleteMany({});
    console.log('🧹 Cleared existing courses');

    // Create all 6 courses
    const courses = [
      {
        title: 'Introduction to Cybersecurity',
        description: 'Learn the fundamentals of cybersecurity, including basic concepts, threat landscape, and security principles.',
        category: 'Security Awareness',
        difficulty: 'beginner',
        instructor: instructor._id,
        instructorId: instructor._id,
        estimatedDuration: 8,
        prerequisites: [],
        learningObjectives: [
          'Understand basic cybersecurity concepts and terminology',
          'Identify common cyber threats and attack vectors',
          'Apply basic security principles and best practices',
          'Recognize the importance of cybersecurity in organizations'
        ],
        tags: ['fundamentals', 'basics', 'awareness'],
        isPublished: true,
        lessons: [
          {
            lessonId: 'intro-lesson-1',
            title: 'What is Cybersecurity?',
            content: '<h2>Understanding Cybersecurity</h2><p>Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks...</p>',
            duration: 45,
            order: 1,
            quiz: [
              {
                question: 'What is the primary goal of cybersecurity?',
                options: ['Making computers faster', 'Protecting digital assets from threats', 'Creating new software', 'Managing databases'],
                correctAnswer: 1,
                explanation: 'Cybersecurity primarily focuses on protecting digital assets from various threats.'
              }
            ]
          },
          {
            lessonId: 'intro-lesson-2',
            title: 'Common Cyber Threats',
            content: '<h2>Types of Cyber Threats</h2><p>Understanding different types of cyber threats is crucial for effective defense...</p>',
            duration: 60,
            order: 2,
            quiz: [
              {
                question: 'Which type of malware encrypts files and demands payment?',
                options: ['Virus', 'Worm', 'Ransomware', 'Spyware'],
                correctAnswer: 2,
                explanation: 'Ransomware encrypts files and demands payment for decryption.'
              }
            ]
          }
        ],
        quizzes: [
          {
            quizId: 'intro-final-quiz',
            title: 'Cybersecurity Fundamentals Final Quiz',
            description: 'Test your understanding of cybersecurity basics',
            timeLimit: 30,
            passingScore: 70,
            maxAttempts: 3,
            questions: [
              {
                questionId: 'q1',
                question: 'What should you do if you receive a suspicious email?',
                type: 'multiple-choice',
                options: ['Reply with your password', 'Click the link to verify', 'Delete the email and report it', 'Forward it to friends'],
                answer: 'Delete the email and report it',
                explanation: 'Suspicious emails should be deleted and reported.',
                points: 2
              }
            ]
          }
        ]
      },
      {
        title: 'Network Security Fundamentals',
        description: 'Deep dive into network security concepts, protocols, and defensive strategies.',
        category: 'Network Security',
        difficulty: 'intermediate',
        instructor: instructor._id,
        instructorId: instructor._id,
        estimatedDuration: 16,
        prerequisites: ['Basic networking knowledge'],
        learningObjectives: [
          'Configure network security devices',
          'Analyze network traffic for security threats',
          'Implement network security policies'
        ],
        tags: ['networking', 'firewalls', 'IDS'],
        isPublished: true,
        lessons: [
          {
            lessonId: 'net-lesson-1',
            title: 'Network Security Architecture',
            content: '<h2>Building Secure Networks</h2><p>Network security architecture involves designing security measures...</p>',
            duration: 75,
            order: 1
          }
        ],
        quizzes: []
      },
      {
        title: 'Ethical Hacking and Penetration Testing',
        description: 'Learn ethical hacking techniques and penetration testing methodologies.',
        category: 'Ethical Hacking',
        difficulty: 'advanced',
        instructor: instructor._id,
        instructorId: instructor._id,
        estimatedDuration: 24,
        prerequisites: ['Network Security Fundamentals'],
        learningObjectives: [
          'Perform ethical penetration testing',
          'Use security testing tools',
          'Document security findings'
        ],
        tags: ['pentesting', 'hacking', 'vulnerability'],
        isPublished: true,
        lessons: [
          {
            lessonId: 'hack-lesson-1',
            title: 'Introduction to Ethical Hacking',
            content: '<h2>Ethical Hacking Fundamentals</h2><p>Ethical hacking involves authorized attempts...</p>',
            duration: 90,
            order: 1
          }
        ],
        quizzes: []
      },
      {
        title: 'Web Application Security',
        description: 'Secure web applications against OWASP Top 10 vulnerabilities and other threats.',
        category: 'Web Security',
        difficulty: 'intermediate',
        instructor: instructor._id,
        instructorId: instructor._id,
        estimatedDuration: 20,
        prerequisites: ['Basic web development knowledge'],
        learningObjectives: [
          'Identify web vulnerabilities',
          'Implement secure coding practices',
          'Perform web application testing'
        ],
        tags: ['web', 'owasp', 'vulnerabilities'],
        isPublished: true,
        lessons: [
          {
            lessonId: 'web-lesson-1',
            title: 'OWASP Top 10 Overview',
            content: '<h2>Web Application Security Risks</h2><p>Understanding the most critical web security risks...</p>',
            duration: 60,
            order: 1
          }
        ],
        quizzes: []
      },
      {
        title: 'Digital Forensics Investigation',
        description: 'Learn digital forensics techniques for incident response and investigation.',
        category: 'Digital Forensics',
        difficulty: 'advanced',
        instructor: instructor._id,
        instructorId: instructor._id,
        estimatedDuration: 32,
        prerequisites: ['Operating system knowledge'],
        learningObjectives: [
          'Collect digital evidence',
          'Analyze forensic artifacts',
          'Document investigation findings'
        ],
        tags: ['forensics', 'investigation', 'evidence'],
        isPublished: true,
        lessons: [
          {
            lessonId: 'forensics-lesson-1',
            title: 'Digital Forensics Fundamentals',
            content: '<h2>Introduction to Digital Forensics</h2><p>Digital forensics is the process of collecting...</p>',
            duration: 75,
            order: 1
          }
        ],
        quizzes: []
      },
      {
        title: 'Cryptography and Data Protection',
        description: 'Understanding cryptographic principles and implementing data protection strategies.',
        category: 'Cryptography',
        difficulty: 'advanced',
        instructor: instructor._id,
        instructorId: instructor._id,
        estimatedDuration: 28,
        prerequisites: ['Mathematics basics'],
        learningObjectives: [
          'Understand cryptographic algorithms',
          'Implement encryption solutions',
          'Design secure communication protocols'
        ],
        tags: ['cryptography', 'encryption', 'data-protection'],
        isPublished: true,
        lessons: [
          {
            lessonId: 'crypto-lesson-1',
            title: 'Introduction to Cryptography',
            content: '<h2>Cryptographic Fundamentals</h2><p>Cryptography is the science of protecting information...</p>',
            duration: 80,
            order: 1
          }
        ],
        quizzes: []
      }
    ];

    // Create courses
    const createdCourses = [];
    for (const courseData of courses) {
      const course = new Course(courseData);
      await course.save();
      createdCourses.push(course);
      console.log(`✅ Created course: ${course.title}`);
    }

    console.log('\n🎉 All courses seeded successfully!');
    console.log(`📚 Total courses: ${createdCourses.length}`);

  } catch (error) {
    console.error('❌ Error seeding courses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  seedAllCourses();
}

module.exports = seedAllCourses;