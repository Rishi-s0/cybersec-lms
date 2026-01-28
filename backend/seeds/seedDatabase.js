const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Progress.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.create([
      {
        username: 'admin',
        email: 'admin@hackademy.com',
        password: hashedPassword,
        role: 'admin',
        isEmailVerified: true, // Admin accounts are pre-verified
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          bio: 'System Administrator',
          securityLevel: 'advanced'
        }
      },
      // Removed instructor role - only admin and students
      {
        username: 'student1',
        email: 'student@hackademy.com',
        password: hashedPassword,
        role: 'student',
        isEmailVerified: true, // Pre-verified for testing
        profile: {
          firstName: 'Alice',
          lastName: 'Learner',
          bio: 'Aspiring cybersecurity professional',
          securityLevel: 'beginner'
        }
      },
      {
        username: 'student2',
        email: 'student2@hackademy.com',
        password: hashedPassword,
        role: 'student',
        isEmailVerified: true, // Pre-verified for testing
        profile: {
          firstName: 'Bob',
          lastName: 'Security',
          bio: 'IT professional transitioning to cybersecurity',
          securityLevel: 'intermediate'
        }
      }
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create sample courses - assign to admin
    const admin = users.find(u => u.role === 'admin');
    
    const courses = await Course.create([
      {
        title: 'Introduction to Cybersecurity',
        description: 'Learn the fundamentals of cybersecurity, including basic concepts, threat landscape, and security principles.',
        category: 'Security Awareness',
        difficulty: 'beginner',
        instructor: admin._id,
        lessons: [
          {
            title: 'What is Cybersecurity?',
            content: 'Understanding the basics of cybersecurity and why it matters in today\'s digital world.',
            order: 1,
            duration: 30,
            quiz: [
              {
                question: 'What is the primary goal of cybersecurity?',
                options: ['Speed', 'Protecting digital assets', 'Cost reduction', 'User experience'],
                correctAnswer: 1,
                explanation: 'Cybersecurity aims to protect digital assets from threats and unauthorized access.'
              }
            ]
          },
          {
            title: 'Common Cyber Threats',
            content: 'Overview of malware, phishing, social engineering, and other common threats.',
            order: 2,
            duration: 45,
            quiz: [
              {
                question: 'Which of the following is a type of social engineering?',
                options: ['Firewall', 'Phishing', 'Encryption', 'Antivirus'],
                correctAnswer: 1,
                explanation: 'Phishing is a social engineering technique used to trick users into revealing sensitive information.'
              }
            ]
          }
        ],
        prerequisites: [],
        learningObjectives: [
          'Understand basic cybersecurity concepts',
          'Identify common cyber threats',
          'Apply basic security principles'
        ],
        estimatedDuration: 8,
        isPublished: true
      },
      {
        title: 'Network Security Fundamentals',
        description: 'Deep dive into network security concepts, protocols, and defensive strategies.',
        category: 'Network Security',
        difficulty: 'intermediate',
        instructor: admin._id,
        lessons: [
          {
            title: 'Network Security Basics',
            content: 'Understanding network architecture and security fundamentals.',
            order: 1,
            duration: 60,
            practicalExercise: {
              title: 'Network Scanning Lab',
              description: 'Use Nmap to scan a test network and identify open ports.',
              instructions: 'Follow the lab guide to perform network reconnaissance safely.',
              solution: 'Expected results and analysis techniques.'
            }
          },
          {
            title: 'Firewalls and IDS/IPS',
            content: 'Configuring and managing network security devices.',
            order: 2,
            duration: 75
          }
        ],
        prerequisites: ['Basic networking knowledge'],
        learningObjectives: [
          'Configure network security devices',
          'Analyze network traffic',
          'Implement security policies'
        ],
        estimatedDuration: 16,
        isPublished: true
      },
      {
        title: 'Ethical Hacking and Penetration Testing',
        description: 'Learn ethical hacking techniques and penetration testing methodologies.',
        category: 'Ethical Hacking',
        difficulty: 'advanced',
        instructor: admin._id,
        lessons: [
          {
            title: 'Introduction to Ethical Hacking',
            content: 'Understanding the ethical hacker mindset and legal considerations.',
            order: 1,
            duration: 45
          },
          {
            title: 'Reconnaissance and Information Gathering',
            content: 'Techniques for gathering information about target systems.',
            order: 2,
            duration: 90,
            practicalExercise: {
              title: 'OSINT Challenge',
              description: 'Gather information about a target using open source intelligence.',
              instructions: 'Use various OSINT tools and techniques to build a target profile.',
              solution: 'Comprehensive information gathering report.'
            }
          }
        ],
        prerequisites: ['Network Security Fundamentals', 'Linux basics'],
        learningObjectives: [
          'Perform ethical penetration testing',
          'Use security testing tools',
          'Document security findings'
        ],
        estimatedDuration: 24,
        isPublished: true
      },
      {
        title: 'Web Application Security',
        description: 'Secure web applications against OWASP Top 10 vulnerabilities.',
        category: 'Web Security',
        difficulty: 'intermediate',
        instructor: admin._id,
        lessons: [
          {
            title: 'OWASP Top 10 Overview',
            content: 'Understanding the most critical web application security risks.',
            order: 1,
            duration: 60
          },
          {
            title: 'SQL Injection Attacks and Prevention',
            content: 'How SQL injection works and how to prevent it.',
            order: 2,
            duration: 90,
            practicalExercise: {
              title: 'SQL Injection Lab',
              description: 'Practice identifying and exploiting SQL injection vulnerabilities.',
              instructions: 'Use a vulnerable web application to practice SQL injection techniques.',
              solution: 'Proper input validation and parameterized queries.'
            }
          }
        ],
        prerequisites: ['Basic web development knowledge'],
        learningObjectives: [
          'Identify web vulnerabilities',
          'Implement secure coding practices',
          'Perform web application testing'
        ],
        estimatedDuration: 20,
        isPublished: true
      },
      {
        title: 'Digital Forensics Investigation',
        description: 'Learn digital forensics techniques for incident response and investigation.',
        category: 'Digital Forensics',
        difficulty: 'advanced',
        instructor: admin._id,
        lessons: [
          {
            title: 'Forensics Fundamentals',
            content: 'Understanding digital evidence and chain of custody.',
            order: 1,
            duration: 75
          }
        ],
        prerequisites: ['Operating system knowledge', 'Legal awareness'],
        learningObjectives: [
          'Collect digital evidence',
          'Analyze forensic artifacts',
          'Document investigation findings'
        ],
        estimatedDuration: 32,
        isPublished: true
      }
    ]);

    console.log(`✅ Created ${courses.length} courses`);

    // Create sample progress records
    const students = users.filter(u => u.role === 'student');
    const progressRecords = [];

    for (const student of students) {
      // Enroll students in courses
      const enrolledCourses = courses.slice(0, Math.floor(Math.random() * 3) + 2);
      
      for (const course of enrolledCourses) {
        const progress = Math.floor(Math.random() * 100);
        const isCompleted = progress === 100 || Math.random() > 0.7;
        
        progressRecords.push({
          user: student._id,
          course: course._id,
          lessonsCompleted: course.lessons.slice(0, Math.floor(course.lessons.length * (progress / 100))).map(l => l._id),
          overallProgress: isCompleted ? 100 : progress,
          isCompleted,
          lastAccessedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date within last week
        });

        // Add to user's enrolled courses
        student.enrolledCourses.push(course._id);
        if (isCompleted) {
          student.completedCourses.push(course._id);
          student.achievements.push({
            title: `${course.title} Completed`,
            description: `Successfully completed the ${course.title} course`,
            earnedAt: new Date()
          });
        }
      }
      
      await student.save();
    }

    await Progress.create(progressRecords);
    console.log(`✅ Created ${progressRecords.length} progress records`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${users.length} (1 admin, ${students.length} students)`);
    console.log(`📚 Courses: ${courses.length} across different categories`);
    console.log(`📈 Progress Records: ${progressRecords.length}`);
    console.log('\n🔐 Login Credentials:');
    console.log('Admin: admin@hackademy.com / password123');
    console.log('Student: student@hackademy.com / password123');
    console.log('Student 2: student2@hackademy.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
