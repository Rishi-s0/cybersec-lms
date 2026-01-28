const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

/**
 * Seed Detailed Course Content
 * Creates comprehensive courses with lessons, quizzes, and content
 */

async function seedCourseContent() {
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

    // Create detailed courses
    const courses = [
      {
        title: 'Introduction to Cybersecurity',
        description: 'A comprehensive introduction to cybersecurity fundamentals, covering basic concepts, threat landscape, and security principles essential for beginners.',
        category: 'Security Awareness',
        difficulty: 'beginner',
        instructor: instructor._id,
        instructorId: instructor._id,
        estimatedDuration: 8,
        prerequisites: [],
        learningObjectives: [
          'Understand fundamental cybersecurity concepts and terminology',
          'Identify common cyber threats and attack vectors',
          'Apply basic security principles and best practices',
          'Recognize the importance of cybersecurity in organizations'
        ],
        tags: ['fundamentals', 'basics', 'awareness', 'beginner'],
        isPublished: true,
        lessons: [
          {
            lessonId: 'lesson-1',
            title: 'What is Cybersecurity?',
            content: `
              <h2>Understanding Cybersecurity</h2>
              <p>Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. These cyberattacks are usually aimed at accessing, changing, or destroying sensitive information; extorting money from users; or interrupting normal business processes.</p>
              
              <h3>Key Components of Cybersecurity:</h3>
              <ul>
                <li><strong>Information Security:</strong> Protecting data from unauthorized access</li>
                <li><strong>Network Security:</strong> Securing computer networks from intruders</li>
                <li><strong>Application Security:</strong> Keeping software and devices free of threats</li>
                <li><strong>Operational Security:</strong> Handling and protecting data assets</li>
              </ul>
              
              <h3>Why Cybersecurity Matters:</h3>
              <p>In today's digital world, cybersecurity is crucial because:</p>
              <ul>
                <li>Cyber threats are constantly evolving</li>
                <li>Data breaches can cost millions of dollars</li>
                <li>Personal privacy is at risk</li>
                <li>Business continuity depends on secure systems</li>
              </ul>
              
              <h3>Career Opportunities:</h3>
              <p>The cybersecurity field offers numerous career paths including:</p>
              <ul>
                <li>Security Analyst</li>
                <li>Ethical Hacker</li>
                <li>Security Architect</li>
                <li>Incident Response Specialist</li>
              </ul>
            `,
            duration: 45,
            order: 1,
            quiz: [
              {
                question: 'What is the primary goal of cybersecurity?',
                options: [
                  'Making computers faster',
                  'Protecting digital assets from threats',
                  'Creating new software',
                  'Managing databases'
                ],
                correctAnswer: 1,
                explanation: 'Cybersecurity primarily focuses on protecting digital assets, systems, and data from various cyber threats and attacks.'
              },
              {
                question: 'Which of the following is NOT a key component of cybersecurity?',
                options: [
                  'Information Security',
                  'Network Security',
                  'Application Security',
                  'Marketing Security'
                ],
                correctAnswer: 3,
                explanation: 'Marketing Security is not a recognized component of cybersecurity. The main components are Information, Network, Application, and Operational Security.'
              }
            ]
          },
          {
            lessonId: 'lesson-2',
            title: 'Common Cyber Threats',
            content: `
              <h2>Understanding Cyber Threats</h2>
              <p>Cyber threats come in many forms and are constantly evolving. Understanding these threats is the first step in protecting against them.</p>
              
              <h3>Types of Malware:</h3>
              <ul>
                <li><strong>Viruses:</strong> Self-replicating programs that attach to other files</li>
                <li><strong>Worms:</strong> Standalone malware that spreads across networks</li>
                <li><strong>Trojans:</strong> Malicious programs disguised as legitimate software</li>
                <li><strong>Ransomware:</strong> Encrypts files and demands payment for decryption</li>
                <li><strong>Spyware:</strong> Secretly monitors and collects user information</li>
              </ul>
              
              <h3>Social Engineering Attacks:</h3>
              <ul>
                <li><strong>Phishing:</strong> Fraudulent emails to steal credentials</li>
                <li><strong>Spear Phishing:</strong> Targeted phishing attacks</li>
                <li><strong>Pretexting:</strong> Creating fake scenarios to obtain information</li>
                <li><strong>Baiting:</strong> Offering something enticing to spread malware</li>
              </ul>
              
              <h3>Network Attacks:</h3>
              <ul>
                <li><strong>DDoS:</strong> Overwhelming systems with traffic</li>
                <li><strong>Man-in-the-Middle:</strong> Intercepting communications</li>
                <li><strong>SQL Injection:</strong> Exploiting database vulnerabilities</li>
                <li><strong>Cross-Site Scripting (XSS):</strong> Injecting malicious scripts</li>
              </ul>
              
              <h3>Real-World Examples:</h3>
              <p>Recent major cyber attacks include:</p>
              <ul>
                <li>WannaCry ransomware (2017)</li>
                <li>Equifax data breach (2017)</li>
                <li>SolarWinds supply chain attack (2020)</li>
                <li>Colonial Pipeline ransomware (2021)</li>
              </ul>
            `,
            duration: 60,
            order: 2,
            quiz: [
              {
                question: 'Which type of malware encrypts files and demands payment?',
                options: ['Virus', 'Worm', 'Ransomware', 'Spyware'],
                correctAnswer: 2,
                explanation: 'Ransomware encrypts files on infected systems and demands payment (usually in cryptocurrency) for the decryption key.'
              },
              {
                question: 'What is phishing?',
                options: [
                  'A type of firewall',
                  'Fraudulent emails to steal credentials',
                  'A network protocol',
                  'An encryption method'
                ],
                correctAnswer: 1,
                explanation: 'Phishing is a social engineering attack that uses fraudulent emails, websites, or messages to trick users into revealing sensitive information like passwords or credit card numbers.'
              }
            ]
          },
          {
            lessonId: 'lesson-3',
            title: 'Security Best Practices',
            content: `
              <h2>Essential Security Practices</h2>
              <p>Implementing proper security practices is crucial for protecting yourself and your organization from cyber threats.</p>
              
              <h3>Password Security:</h3>
              <ul>
                <li><strong>Use strong passwords:</strong> At least 12 characters with mix of letters, numbers, symbols</li>
                <li><strong>Unique passwords:</strong> Different password for each account</li>
                <li><strong>Password managers:</strong> Use tools like LastPass, 1Password, or Bitwarden</li>
                <li><strong>Two-factor authentication:</strong> Enable 2FA wherever possible</li>
              </ul>
              
              <h3>Software Security:</h3>
              <ul>
                <li><strong>Keep software updated:</strong> Install security patches promptly</li>
                <li><strong>Use antivirus software:</strong> Keep it updated and running</li>
                <li><strong>Enable firewalls:</strong> Both hardware and software firewalls</li>
                <li><strong>Avoid suspicious downloads:</strong> Only download from trusted sources</li>
              </ul>
              
              <h3>Email Security:</h3>
              <ul>
                <li><strong>Be cautious with attachments:</strong> Scan before opening</li>
                <li><strong>Verify sender identity:</strong> Check email addresses carefully</li>
                <li><strong>Don't click suspicious links:</strong> Hover to see actual destination</li>
                <li><strong>Report phishing:</strong> Forward suspicious emails to IT</li>
              </ul>
              
              <h3>Data Protection:</h3>
              <ul>
                <li><strong>Regular backups:</strong> Follow 3-2-1 backup rule</li>
                <li><strong>Encrypt sensitive data:</strong> Both at rest and in transit</li>
                <li><strong>Secure disposal:</strong> Properly wipe devices before disposal</li>
                <li><strong>Access controls:</strong> Limit access to need-to-know basis</li>
              </ul>
              
              <h3>Mobile Security:</h3>
              <ul>
                <li><strong>Lock screen protection:</strong> Use PIN, password, or biometrics</li>
                <li><strong>App permissions:</strong> Review and limit app permissions</li>
                <li><strong>Public Wi-Fi caution:</strong> Avoid sensitive activities on public networks</li>
                <li><strong>Remote wipe capability:</strong> Enable for lost or stolen devices</li>
              </ul>
            `,
            duration: 50,
            order: 3,
            quiz: [
              {
                question: 'What is the 3-2-1 backup rule?',
                options: [
                  '3 passwords, 2 devices, 1 network',
                  '3 copies of data, 2 different media, 1 offsite',
                  '3 firewalls, 2 antivirus, 1 VPN',
                  '3 users, 2 admins, 1 guest'
                ],
                correctAnswer: 1,
                explanation: 'The 3-2-1 backup rule means keeping 3 copies of important data, on 2 different types of media, with 1 copy stored offsite.'
              },
              {
                question: 'Why should you use different passwords for each account?',
                options: [
                  'It\'s required by law',
                  'To confuse hackers',
                  'If one account is compromised, others remain secure',
                  'It makes passwords stronger'
                ],
                correctAnswer: 2,
                explanation: 'Using unique passwords for each account ensures that if one account is compromised, your other accounts remain secure.'
              }
            ]
          }
        ],
        quizzes: [
          {
            quizId: 'final-quiz-1',
            title: 'Cybersecurity Fundamentals Final Quiz',
            description: 'Test your understanding of cybersecurity basics',
            timeLimit: 30,
            passingScore: 70,
            maxAttempts: 3,
            questions: [
              {
                questionId: 'q1',
                question: 'Which of the following is the MOST important factor in creating a strong password?',
                type: 'multiple-choice',
                options: [
                  'Using only uppercase letters',
                  'Length and complexity',
                  'Using personal information',
                  'Changing it every day'
                ],
                answer: 'Length and complexity',
                explanation: 'Password strength primarily depends on length and complexity (mix of characters, numbers, symbols).',
                points: 2
              },
              {
                questionId: 'q2',
                question: 'What should you do if you receive a suspicious email asking for your password?',
                type: 'multiple-choice',
                options: [
                  'Reply with your password',
                  'Click the link to verify',
                  'Delete the email and report it',
                  'Forward it to friends'
                ],
                answer: 'Delete the email and report it',
                explanation: 'Suspicious emails should be deleted and reported to your IT department or email provider.',
                points: 2
              },
              {
                questionId: 'q3',
                question: 'True or False: Antivirus software alone is sufficient to protect against all cyber threats.',
                type: 'true-false',
                options: ['True', 'False'],
                answer: 'False',
                explanation: 'Antivirus software is just one layer of protection. A comprehensive security approach includes multiple layers.',
                points: 1
              }
            ]
          }
        ]
      },
      {
        title: 'Network Security Fundamentals',
        description: 'Deep dive into network security concepts, protocols, and defensive strategies for protecting network infrastructure.',
        category: 'Network Security',
        difficulty: 'intermediate',
        instructor: instructor._id,
        instructorId: instructor._id,
        estimatedDuration: 16,
        prerequisites: ['Basic networking knowledge', 'Introduction to Cybersecurity'],
        learningObjectives: [
          'Configure and manage network security devices',
          'Analyze network traffic for security threats',
          'Implement network security policies and procedures',
          'Understand network protocols and their security implications'
        ],
        tags: ['networking', 'firewalls', 'IDS', 'monitoring'],
        isPublished: true,
        lessons: [
          {
            lessonId: 'net-lesson-1',
            title: 'Network Security Architecture',
            content: `
              <h2>Building Secure Networks</h2>
              <p>Network security architecture involves designing and implementing security measures to protect network infrastructure and data in transit.</p>
              
              <h3>Defense in Depth Strategy:</h3>
              <p>Multiple layers of security controls throughout an IT system:</p>
              <ul>
                <li><strong>Perimeter Security:</strong> Firewalls, IDS/IPS</li>
                <li><strong>Network Segmentation:</strong> VLANs, subnets</li>
                <li><strong>Access Controls:</strong> Authentication, authorization</li>
                <li><strong>Monitoring:</strong> SIEM, log analysis</li>
              </ul>
              
              <h3>Network Zones:</h3>
              <ul>
                <li><strong>DMZ (Demilitarized Zone):</strong> Buffer zone between internal and external networks</li>
                <li><strong>Internal Network:</strong> Trusted internal systems</li>
                <li><strong>External Network:</strong> Untrusted networks (Internet)</li>
                <li><strong>Management Network:</strong> Separate network for device management</li>
              </ul>
              
              <h3>Security Policies:</h3>
              <ul>
                <li>Acceptable Use Policy</li>
                <li>Access Control Policy</li>
                <li>Incident Response Policy</li>
                <li>Data Classification Policy</li>
              </ul>
            `,
            duration: 75,
            order: 1,
            quiz: [
              {
                question: 'What is the purpose of a DMZ in network security?',
                options: [
                  'To store backup data',
                  'To create a buffer zone between internal and external networks',
                  'To increase network speed',
                  'To reduce network costs'
                ],
                correctAnswer: 1,
                explanation: 'A DMZ creates a buffer zone between internal trusted networks and external untrusted networks, providing an additional layer of security.'
              }
            ]
          },
          {
            lessonId: 'net-lesson-2',
            title: 'Firewalls and Access Control',
            content: `
              <h2>Firewall Technologies</h2>
              <p>Firewalls are the first line of defense in network security, controlling traffic flow based on predetermined security rules.</p>
              
              <h3>Types of Firewalls:</h3>
              <ul>
                <li><strong>Packet Filtering:</strong> Examines packets based on IP, port, protocol</li>
                <li><strong>Stateful Inspection:</strong> Tracks connection state and context</li>
                <li><strong>Application Layer:</strong> Inspects application-specific data</li>
                <li><strong>Next-Generation (NGFW):</strong> Combines multiple technologies</li>
              </ul>
              
              <h3>Firewall Rules:</h3>
              <p>Rules define what traffic is allowed or denied:</p>
              <ul>
                <li>Source and destination IP addresses</li>
                <li>Port numbers and protocols</li>
                <li>Time-based restrictions</li>
                <li>User-based access controls</li>
              </ul>
              
              <h3>Best Practices:</h3>
              <ul>
                <li>Default deny policy</li>
                <li>Regular rule review and cleanup</li>
                <li>Logging and monitoring</li>
                <li>Regular firmware updates</li>
              </ul>
            `,
            duration: 90,
            order: 2,
            quiz: [
              {
                question: 'What is a "default deny" policy in firewall configuration?',
                options: [
                  'Deny all traffic by default',
                  'Allow all traffic by default',
                  'Only deny external traffic',
                  'Only allow HTTP traffic'
                ],
                correctAnswer: 0,
                explanation: 'A default deny policy blocks all traffic by default, only allowing specifically permitted traffic through explicit rules.'
              }
            ]
          }
        ],
        quizzes: [
          {
            quizId: 'net-final-quiz',
            title: 'Network Security Final Assessment',
            description: 'Comprehensive test of network security concepts',
            timeLimit: 45,
            passingScore: 75,
            maxAttempts: 2,
            questions: [
              {
                questionId: 'nq1',
                question: 'Which layer of the OSI model do most firewalls operate at?',
                type: 'multiple-choice',
                options: ['Physical', 'Data Link', 'Network', 'Application'],
                answer: 'Network',
                explanation: 'Most traditional firewalls operate at the Network layer (Layer 3) of the OSI model.',
                points: 3
              }
            ]
          }
        ]
      }
    ];

    // Create courses
    for (const courseData of courses) {
      const course = new Course(courseData);
      await course.save();
      console.log(`✅ Created course: ${course.title}`);
    }

    // Create sample progress for students
    const students = await User.find({ role: 'student' });
    const createdCourses = await Course.find({});

    for (const student of students) {
      for (const course of createdCourses) {
        const progress = new Progress({
          user: student._id,
          course: course._id,
          completedLessons: [],
          overallProgress: 0,
          timeSpent: 0
        });
        await progress.save();
        console.log(`✅ Created progress for ${student.username} in ${course.title}`);
      }
    }

    console.log('\n🎉 Course content seeding completed!');
    console.log('\n📊 Summary:');
    console.log(`   📚 Courses created: ${courses.length}`);
    console.log(`   📖 Total lessons: ${courses.reduce((sum, c) => sum + c.lessons.length, 0)}`);
    console.log(`   📝 Total quizzes: ${courses.reduce((sum, c) => sum + c.quizzes.length, 0)}`);
    console.log(`   👥 Progress records: ${students.length * createdCourses.length}`);

  } catch (error) {
    console.error('❌ Error seeding course content:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  seedCourseContent();
}

module.exports = seedCourseContent;