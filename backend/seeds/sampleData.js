const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Course = require('../models/Course');

// Load environment variables from project root
dotenv.config();

const sampleUsers = [
  {
    name: 'Admin User',
    username: 'admin',
    email: 'admin@hackademy.com',
    password: 'password123',
    role: 'admin',
    isEmailVerified: true, // Admin accounts are pre-verified
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      bio: 'System administrator with full access to the platform.',
      securityLevel: 'advanced'
    }
  },
  // Removed instructor role - only admin and students
  {
    name: 'Student User',
    username: 'student1',
    email: 'student@hackademy.com',
    password: 'password123',
    role: 'student',
    profile: {
      firstName: 'Student',
      lastName: 'User',
      bio: 'Aspiring cybersecurity professional looking to build foundational skills.',
      securityLevel: 'beginner'
    }
  }
];

const sampleCourses = [
  {
    title: 'Introduction to Cybersecurity',
    description: 'A comprehensive introduction to cybersecurity fundamentals, covering basic concepts, threat landscape, and security principles.',
    category: 'Security Awareness',
    difficulty: 'beginner',
    prerequisites: [],
    learningObjectives: [
      'Understand basic cybersecurity concepts and terminology',
      'Identify common cyber threats and attack vectors',
      'Learn fundamental security principles and best practices',
      'Recognize the importance of cybersecurity in modern organizations'
    ],
    estimatedDuration: 8,
    tags: ['fundamentals', 'basics', 'awareness'],
    isPublished: true,
    lessons: [
      {
        title: 'What is Cybersecurity?',
        videoUrl: 'https://www.youtube.com/embed/inWWhr5tnEA', // Cybersecurity intro video
        content: `
          <h3>🔐 Understanding Cybersecurity</h3>
          <p><strong>Cybersecurity</strong> is the practice of protecting systems, networks, and programs from digital attacks. These cyberattacks are usually aimed at accessing, changing, or destroying sensitive information; extorting money from users; or interrupting normal business processes.</p>
          
          <div style="background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; padding: 1rem; margin: 1.5rem 0; border-radius: 0.5rem;">
            <p style="margin: 0;"><strong>💡 Key Insight:</strong> Cybersecurity is not just about technology—it's about protecting people, data, and organizations from digital threats.</p>
          </div>
          
          <h4>🌐 Why Cybersecurity Matters</h4>
          <p>In today's interconnected world, cybersecurity is more important than ever:</p>
          <ul>
            <li>📱 <strong>5+ billion</strong> internet users worldwide</li>
            <li>💰 <strong>$6 trillion</strong> in annual cybercrime damages (2021)</li>
            <li>🔓 <strong>30,000+</strong> websites hacked daily</li>
            <li>⏱️ A cyberattack occurs every <strong>39 seconds</strong></li>
          </ul>
          
          <h4>🎯 Key Areas of Cybersecurity</h4>
          <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
            <tr style="background: rgba(16, 185, 129, 0.1);">
              <th style="padding: 0.75rem; text-align: left; border: 1px solid rgba(255,255,255,0.1);">Area</th>
              <th style="padding: 0.75rem; text-align: left; border: 1px solid rgba(255,255,255,0.1);">Focus</th>
            </tr>
            <tr>
              <td style="padding: 0.75rem; border: 1px solid rgba(255,255,255,0.1);"><strong>Information Security</strong></td>
              <td style="padding: 0.75rem; border: 1px solid rgba(255,255,255,0.1);">Protecting data from unauthorized access and modifications</td>
            </tr>
            <tr>
              <td style="padding: 0.75rem; border: 1px solid rgba(255,255,255,0.1);"><strong>Network Security</strong></td>
              <td style="padding: 0.75rem; border: 1px solid rgba(255,255,255,0.1);">Protecting computer networks from intruders</td>
            </tr>
            <tr>
              <td style="padding: 0.75rem; border: 1px solid rgba(255,255,255,0.1);"><strong>Application Security</strong></td>
              <td style="padding: 0.75rem; border: 1px solid rgba(255,255,255,0.1);">Keeping software and devices free of threats</td>
            </tr>
            <tr>
              <td style="padding: 0.75rem; border: 1px solid rgba(255,255,255,0.1);"><strong>Operational Security</strong></td>
              <td style="padding: 0.75rem; border: 1px solid rgba(255,255,255,0.1);">Managing and protecting data assets</td>
            </tr>
            <tr>
              <td style="padding: 0.75rem; border: 1px solid rgba(255,255,255,0.1);"><strong>Disaster Recovery</strong></td>
              <td style="padding: 0.75rem; border: 1px solid rgba(255,255,255,0.1);">Responding to incidents and recovering from breaches</td>
            </tr>
          </table>
          
          <h4>🔺 The CIA Triad</h4>
          <p>The foundation of cybersecurity is built on three core principles:</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
            <div style="background: rgba(16, 185, 129, 0.1); padding: 1.5rem; border-radius: 0.5rem; border: 1px solid rgba(16, 185, 129, 0.3);">
              <h5 style="color: #10b981; margin-top: 0;">🔒 Confidentiality</h5>
              <p style="margin-bottom: 0;">Ensuring information is accessible only to authorized individuals</p>
            </div>
            <div style="background: rgba(59, 130, 246, 0.1); padding: 1.5rem; border-radius: 0.5rem; border: 1px solid rgba(59, 130, 246, 0.3);">
              <h5 style="color: #3b82f6; margin-top: 0;">✅ Integrity</h5>
              <p style="margin-bottom: 0;">Maintaining accuracy and completeness of data</p>
            </div>
            <div style="background: rgba(251, 146, 60, 0.1); padding: 1.5rem; border-radius: 0.5rem; border: 1px solid rgba(251, 146, 60, 0.3);">
              <h5 style="color: #fb923c; margin-top: 0;">🌐 Availability</h5>
              <p style="margin-bottom: 0;">Ensuring authorized users have access when needed</p>
            </div>
          </div>
          
          <div style="background: rgba(251, 146, 60, 0.1); border-left: 4px solid #fb923c; padding: 1rem; margin: 1.5rem 0; border-radius: 0.5rem;">
            <p style="margin: 0;"><strong>🎯 Remember:</strong> Understanding these fundamentals is crucial for anyone entering the cybersecurity field. Every security decision should consider the CIA Triad!</p>
          </div>
        `,
        duration: 30,
        order: 1,
        quiz: [
          {
            question: 'What is the primary goal of cybersecurity?',
            options: ['Making money', 'Protecting digital assets', 'Creating software', 'Managing databases'],
            correctAnswer: 1,
            explanation: 'Cybersecurity primarily focuses on protecting digital assets from various threats.'
          },
          {
            question: 'Which of the following is NOT part of the CIA Triad?',
            options: ['Confidentiality', 'Integrity', 'Availability', 'Authentication'],
            correctAnswer: 3,
            explanation: 'The CIA Triad consists of Confidentiality, Integrity, and Availability. Authentication is a separate security concept.'
          },
          {
            question: 'What does "Confidentiality" mean in cybersecurity?',
            options: ['Data is always available', 'Data is accurate', 'Data is accessible only to authorized users', 'Data is encrypted'],
            correctAnswer: 2,
            explanation: 'Confidentiality ensures that information is accessible only to authorized individuals.'
          },
          {
            question: 'Which area of cybersecurity focuses on protecting computer networks?',
            options: ['Application Security', 'Network Security', 'Information Security', 'Physical Security'],
            correctAnswer: 1,
            explanation: 'Network Security specifically focuses on protecting computer networks from intruders and attacks.'
          },
          {
            question: 'Approximately how often does a cyberattack occur?',
            options: ['Every hour', 'Every 39 seconds', 'Every 5 minutes', 'Every day'],
            correctAnswer: 1,
            explanation: 'Studies show that a cyberattack occurs approximately every 39 seconds, highlighting the constant threat landscape.'
          }
        ]
      },
      {
        title: 'Common Cyber Threats',
        videoUrl: 'https://www.youtube.com/embed/Dk-ZqQ-bfy4', // Cyber threats explained
        content: `
          <h3>⚠️ Types of Cyber Threats</h3>
          <p>Understanding different types of cyber threats is crucial for effective defense. Let's explore the most common threats you'll encounter in the wild:</p>
          
          <h4>🦠 1. Malware (Malicious Software)</h4>
          <p>Malicious software designed to harm or exploit devices and networks. The malware family includes:</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1rem 0;">
            <div style="background: rgba(239, 68, 68, 0.1); padding: 1rem; border-radius: 0.5rem; border-left: 3px solid #ef4444;">
              <h5 style="color: #ef4444; margin: 0 0 0.5rem 0;">🦠 Viruses</h5>
              <p style="margin: 0; font-size: 0.9rem;">Self-replicating programs that attach to files and spread when executed</p>
            </div>
            <div style="background: rgba(239, 68, 68, 0.1); padding: 1rem; border-radius: 0.5rem; border-left: 3px solid #ef4444;">
              <h5 style="color: #ef4444; margin: 0 0 0.5rem 0;">🐛 Worms</h5>
              <p style="margin: 0; font-size: 0.9rem;">Standalone malware that spreads across networks without user interaction</p>
            </div>
            <div style="background: rgba(239, 68, 68, 0.1); padding: 1rem; border-radius: 0.5rem; border-left: 3px solid #ef4444;">
              <h5 style="color: #ef4444; margin: 0 0 0.5rem 0;">🎭 Trojans</h5>
              <p style="margin: 0; font-size: 0.9rem;">Disguised as legitimate software but contain malicious code</p>
            </div>
            <div style="background: rgba(239, 68, 68, 0.1); padding: 1rem; border-radius: 0.5rem; border-left: 3px solid #ef4444;">
              <h5 style="color: #ef4444; margin: 0 0 0.5rem 0;">👁️ Spyware</h5>
              <p style="margin: 0; font-size: 0.9rem;">Secretly monitors and collects user information without consent</p>
            </div>
          </div>
          
          <h4>🎣 2. Phishing Attacks</h4>
          <p>Fraudulent attempts to obtain sensitive information by disguising as trustworthy entities:</p>
          <ul>
            <li>📧 <strong>Email Phishing:</strong> Mass emails pretending to be from legitimate sources</li>
            <li>🎯 <strong>Spear Phishing:</strong> Targeted attacks on specific individuals or organizations</li>
            <li>🐋 <strong>Whaling:</strong> Targeting high-profile executives (the "big fish")</li>
            <li>📱 <strong>Smishing:</strong> SMS-based phishing attacks</li>
            <li>📞 <strong>Vishing:</strong> Voice/phone-based phishing</li>
          </ul>
          
          <div style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 1rem; margin: 1.5rem 0; border-radius: 0.5rem;">
            <p style="margin: 0;"><strong>⚠️ Real Example:</strong> In 2016, a phishing email led to the DNC hack, exposing 19,000+ emails. Always verify sender addresses!</p>
          </div>
          
          <h4>🔐 3. Ransomware</h4>
          <p>Malware that encrypts victim's files and demands payment (usually cryptocurrency) for decryption.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
            <tr style="background: rgba(239, 68, 68, 0.1);">
              <th style="padding: 0.75rem; text-align: left; border: 1px solid rgba(255,255,255,0.1);">Attack</th>
              <th style="padding: 0.75rem; text-align: left; border: 1px solid rgba(255,255,255,0.1);">Year</th>
              <th style="padding: 0.75rem; text-align: left; border: 1px solid rgba(255,255,255,0.1);">Impact</th>
            </tr>
            <tr>
              <td style="padding: 0.75rem; border: 1px solid rgba(255,255,255,0.1);"><strong>WannaCry</strong></td>
              <td style="padding: 0.75rem; border: 1px solid rgba(255,255,255,0.1);">2017</td>
              <td style="padding: 0.75rem; border: 1px solid rgba(255,255,255,0.1);">200,000+ computers in 150 countries</td>
            </tr>
            <tr>
              <td style="padding: 0.75rem; border: 1px solid rgba(255,255,255,0.1);"><strong>Petya/NotPetya</strong></td>
              <td style="padding: 0.75rem; border: 1px solid rgba(255,255,255,0.1);">2017</td>
              <td style="padding: 0.75rem; border: 1px solid rgba(255,255,255,0.1);">$10 billion in damages</td>
            </tr>
            <tr>
              <td style="padding: 0.75rem; border: 1px solid rgba(255,255,255,0.1);"><strong>Colonial Pipeline</strong></td>
              <td style="padding: 0.75rem; border: 1px solid rgba(255,255,255,0.1);">2021</td>
              <td style="padding: 0.75rem; border: 1px solid rgba(255,255,255,0.1);">$4.4M ransom paid, fuel shortage</td>
            </tr>
          </table>
          
          <h4>🎭 4. Social Engineering</h4>
          <p>Manipulating people to divulge confidential information or perform actions that compromise security. This exploits <strong>human psychology</strong> rather than technical vulnerabilities.</p>
          
          <p><strong>Common Tactics:</strong></p>
          <ul>
            <li>🎯 <strong>Pretexting:</strong> Creating a fabricated scenario to steal information</li>
            <li>🎁 <strong>Baiting:</strong> Offering something enticing to trick victims</li>
            <li>⚡ <strong>Urgency:</strong> Creating false sense of urgency to bypass critical thinking</li>
            <li>👔 <strong>Authority:</strong> Impersonating authority figures to gain trust</li>
          </ul>
          
          <h4>💥 5. DDoS Attacks</h4>
          <p><strong>Distributed Denial of Service</strong> attacks overwhelm systems with traffic, making services unavailable to legitimate users.</p>
          
          <div style="background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; padding: 1rem; margin: 1.5rem 0; border-radius: 0.5rem;">
            <p style="margin: 0;"><strong>🛡️ Defense Strategy:</strong> The best defense is awareness! Understanding these threats helps you recognize warning signs and prevent attacks before they succeed.</p>
          </div>
          
          <h4>📊 Threat Landscape Statistics</h4>
          <ul>
            <li>🔴 <strong>43%</strong> of cyberattacks target small businesses</li>
            <li>🔴 <strong>95%</strong> of cybersecurity breaches are due to human error</li>
            <li>🔴 <strong>$4.35M</strong> average cost of a data breach (2022)</li>
            <li>🔴 <strong>277 days</strong> average time to identify and contain a breach</li>
          </ul>
        `,
        duration: 45,
        order: 2,
        quiz: [
          {
            question: 'Which type of malware spreads across networks without user interaction?',
            options: ['Virus', 'Worm', 'Trojan', 'Spyware'],
            correctAnswer: 1,
            explanation: 'Worms are standalone malware that can spread across networks automatically without requiring user interaction.'
          },
          {
            question: 'What is "Spear Phishing"?',
            options: ['Mass email attacks', 'Targeted attacks on specific individuals', 'SMS-based attacks', 'Voice-based attacks'],
            correctAnswer: 1,
            explanation: 'Spear phishing is a targeted phishing attack aimed at specific individuals or organizations, often using personalized information.'
          },
          {
            question: 'Which ransomware attack affected 200,000+ computers in 150 countries in 2017?',
            options: ['Petya', 'WannaCry', 'Colonial Pipeline', 'CryptoLocker'],
            correctAnswer: 1,
            explanation: 'WannaCry was a massive ransomware attack in 2017 that affected over 200,000 computers across 150 countries.'
          },
          {
            question: 'What does DDoS stand for?',
            options: ['Direct Denial of Service', 'Distributed Denial of Service', 'Digital Denial of Security', 'Data Denial of Service'],
            correctAnswer: 1,
            explanation: 'DDoS stands for Distributed Denial of Service, where multiple systems overwhelm a target with traffic.'
          },
          {
            question: 'What percentage of cybersecurity breaches are due to human error?',
            options: ['25%', '50%', '75%', '95%'],
            correctAnswer: 3,
            explanation: 'Studies show that approximately 95% of cybersecurity breaches are caused by human error, highlighting the importance of security awareness.'
          }
        ]
      },
      {
        title: 'Security Best Practices',
        videoUrl: 'https://www.youtube.com/embed/U_P23SqJaDc', // Security best practices
        content: `
          <h3>Essential Security Practices</h3>
          <p>Implementing these practices can significantly improve your security posture and protect against common threats:</p>
          
          <h4>1. Password Security</h4>
          <ul>
            <li>Use strong, unique passwords for each account (minimum 12 characters)</li>
            <li>Include uppercase, lowercase, numbers, and special characters</li>
            <li>Never reuse passwords across different services</li>
            <li>Consider using a password manager</li>
            <li>Change passwords regularly, especially after suspected breaches</li>
          </ul>
          
          <h4>2. Multi-Factor Authentication (MFA)</h4>
          <p>Enable MFA wherever possible. This adds an extra layer of security by requiring:</p>
          <ul>
            <li>Something you know (password)</li>
            <li>Something you have (phone, token)</li>
            <li>Something you are (biometrics)</li>
          </ul>
          
          <h4>3. Software Updates</h4>
          <p>Keep all software updated to patch security vulnerabilities:</p>
          <ul>
            <li>Enable automatic updates when possible</li>
            <li>Regularly check for updates manually</li>
            <li>Don't ignore update notifications</li>
            <li>Update operating systems, applications, and firmware</li>
          </ul>
          
          <h4>4. Email Safety</h4>
          <ul>
            <li>Be cautious with email attachments from unknown senders</li>
            <li>Verify sender addresses carefully</li>
            <li>Don't click suspicious links</li>
            <li>Look for signs of phishing (urgency, poor grammar, suspicious URLs)</li>
          </ul>
          
          <h4>5. Data Backup</h4>
          <p>Follow the 3-2-1 backup rule:</p>
          <ul>
            <li>3 copies of your data</li>
            <li>2 different storage types</li>
            <li>1 copy offsite</li>
          </ul>
          
          <h4>6. Network Security</h4>
          <ul>
            <li>Use secure Wi-Fi networks (avoid public Wi-Fi for sensitive tasks)</li>
            <li>Enable firewall protection</li>
            <li>Use VPN when accessing sensitive information remotely</li>
            <li>Disable unnecessary network services</li>
          </ul>
          
          <h4>7. Security Software</h4>
          <ul>
            <li>Install reputable antivirus/anti-malware software</li>
            <li>Keep security software updated</li>
            <li>Run regular system scans</li>
            <li>Use browser security extensions</li>
          </ul>
          
          <p><strong>Key Takeaway:</strong> Security is not a one-time setup but an ongoing practice. Stay vigilant and make security a habit!</p>
        `,
        duration: 40,
        order: 3
      },
      {
        title: 'Incident Response Basics',
        videoUrl: 'https://www.youtube.com/embed/M7f8vN8VK0k', // Incident response
        content: `
          <h3>Responding to Security Incidents</h3>
          <p>Even with the best security measures, incidents can occur. Knowing how to respond is crucial:</p>
          
          <h4>The Incident Response Lifecycle</h4>
          <ol>
            <li><strong>Preparation:</strong> Develop policies, procedures, and response teams</li>
            <li><strong>Detection & Analysis:</strong> Identify and assess the incident</li>
            <li><strong>Containment:</strong> Limit the damage and prevent spread</li>
            <li><strong>Eradication:</strong> Remove the threat from the environment</li>
            <li><strong>Recovery:</strong> Restore systems to normal operation</li>
            <li><strong>Lessons Learned:</strong> Document and improve processes</li>
          </ol>
          
          <h4>What to Do If You Suspect a Breach</h4>
          <ul>
            <li>Don't panic - stay calm and methodical</li>
            <li>Disconnect affected systems from the network</li>
            <li>Document everything you observe</li>
            <li>Report to your IT security team immediately</li>
            <li>Don't attempt to fix it yourself unless trained</li>
            <li>Preserve evidence for investigation</li>
          </ul>
          
          <h4>Common Indicators of Compromise</h4>
          <ul>
            <li>Unusual network traffic or activity</li>
            <li>Unexpected system crashes or slowdowns</li>
            <li>Unknown programs or processes running</li>
            <li>Unauthorized access attempts</li>
            <li>Files modified or deleted without explanation</li>
            <li>Antivirus alerts or disabled security software</li>
          </ul>
          
          <p><strong>Remember:</strong> Quick detection and response can minimize damage. Always report suspicious activity!</p>
        `,
        duration: 35,
        order: 4
      },
      {
        title: 'Building a Security Mindset',
        videoUrl: 'https://www.youtube.com/embed/hxHqE2W8scQs', // Security mindset
        content: `
          <h3>Developing Security Awareness</h3>
          <p>Cybersecurity is not just about technology - it's about developing a security-conscious mindset:</p>
          
          <h4>Think Like an Attacker</h4>
          <p>Understanding how attackers think helps you defend better:</p>
          <ul>
            <li>What are the most valuable assets?</li>
            <li>Where are the weakest points?</li>
            <li>What social engineering tactics might work?</li>
            <li>How can systems be exploited?</li>
          </ul>
          
          <h4>The Principle of Least Privilege</h4>
          <p>Users should only have access to resources they absolutely need:</p>
          <ul>
            <li>Minimize administrative privileges</li>
            <li>Use separate accounts for different tasks</li>
            <li>Regularly review and revoke unnecessary permissions</li>
            <li>Implement role-based access control</li>
          </ul>
          
          <h4>Defense in Depth</h4>
          <p>Layer multiple security controls to protect assets:</p>
          <ul>
            <li>Physical security (locks, badges)</li>
            <li>Network security (firewalls, IDS/IPS)</li>
            <li>Application security (input validation, encryption)</li>
            <li>Data security (encryption, backups)</li>
            <li>User education and awareness</li>
          </ul>
          
          <h4>Continuous Learning</h4>
          <p>Cybersecurity is constantly evolving. Stay updated by:</p>
          <ul>
            <li>Following security news and blogs</li>
            <li>Participating in security communities</li>
            <li>Attending conferences and webinars</li>
            <li>Practicing in labs and CTF challenges</li>
            <li>Pursuing certifications (Security+, CEH, CISSP)</li>
          </ul>
          
          <h4>Your Role in Cybersecurity</h4>
          <p>Everyone has a role to play in cybersecurity:</p>
          <ul>
            <li>Be the first line of defense</li>
            <li>Report suspicious activity</li>
            <li>Follow security policies</li>
            <li>Stay informed about threats</li>
            <li>Help educate others</li>
          </ul>
          
          <p><strong>Congratulations!</strong> You've completed the Introduction to Cybersecurity course. You now have a solid foundation to build upon as you continue your cybersecurity journey!</p>
        `,
        duration: 30,
        order: 5
      }
    ]
  },
  {
    title: 'Network Security Fundamentals',
    description: 'Learn the basics of network security, including firewalls, intrusion detection systems, and network monitoring techniques.',
    category: 'Network Security',
    difficulty: 'intermediate',
    prerequisites: ['Basic networking knowledge', 'Understanding of TCP/IP'],
    learningObjectives: [
      'Understand network security architecture',
      'Configure and manage firewalls',
      'Implement intrusion detection systems',
      'Monitor network traffic for security threats'
    ],
    estimatedDuration: 12,
    tags: ['networking', 'firewalls', 'IDS', 'monitoring'],
    isPublished: true,
    lessons: [
      {
        title: 'Network Security Architecture',
        content: '<h3>Building Secure Networks</h3><p>Network security architecture involves designing and implementing security measures to protect network infrastructure:</p><ul><li>Defense in depth strategy</li><li>Network segmentation</li><li>Access control mechanisms</li><li>Security zones and DMZ</li></ul>',
        duration: 60,
        order: 1
      },
      {
        title: 'Firewalls and Access Control',
        content: '<h3>Firewall Technologies</h3><p>Firewalls are the first line of defense in network security:</p><ul><li>Packet filtering firewalls</li><li>Stateful inspection firewalls</li><li>Application layer firewalls</li><li>Next-generation firewalls (NGFW)</li></ul>',
        duration: 75,
        order: 2
      }
    ]
  },
  {
    title: 'Ethical Hacking and Penetration Testing',
    description: 'Advanced course covering ethical hacking methodologies, penetration testing frameworks, and vulnerability assessment techniques.',
    category: 'Ethical Hacking',
    difficulty: 'advanced',
    prerequisites: ['Network Security Fundamentals', 'Linux command line', 'Programming basics'],
    learningObjectives: [
      'Master ethical hacking methodologies',
      'Conduct professional penetration tests',
      'Use industry-standard security tools',
      'Write comprehensive security reports'
    ],
    estimatedDuration: 20,
    tags: ['pentesting', 'hacking', 'vulnerability', 'assessment'],
    isPublished: true,
    lessons: [
      {
        title: 'Introduction to Ethical Hacking',
        content: '<h3>Ethical Hacking Fundamentals</h3><p>Ethical hacking involves authorized attempts to gain unauthorized access to systems to identify vulnerabilities:</p><ul><li>Legal and ethical considerations</li><li>Hacking methodologies</li><li>Types of penetration testing</li><li>Professional certifications</li></ul>',
        duration: 90,
        order: 1
      }
    ]
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cybersec-lms');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.username}`);
    }

    // Find admin for courses (since instructor role removed)
    const admin = createdUsers.find(user => user.role === 'admin');

    // Create courses
    for (const courseData of sampleCourses) {
      // Add lessonId to each lesson
      const lessonsWithIds = courseData.lessons.map((lesson, index) => ({
        ...lesson,
        lessonId: `lesson_${index + 1}_${Date.now()}`
      }));

      const course = new Course({
        ...courseData,
        instructor: admin._id,
        instructorId: admin._id,
        lessons: lessonsWithIds
      });
      await course.save();
      console.log(`Created course: ${course.title}`);
    }

    console.log('Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('Admin: admin@hackademy.com / password123');
    console.log('Student: student@hackademy.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;