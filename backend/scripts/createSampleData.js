const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const Discussion = require('../models/Discussion');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

/**
 * Create Sample Notifications and Discussions
 * This will create the collections in MongoDB
 */

async function createSampleData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get existing users and courses
    const users = await User.find().limit(3);
    const courses = await Course.find().limit(2);

    if (users.length === 0 || courses.length === 0) {
      console.log('❌ No users or courses found. Please run seedDatabase.js first.');
      return;
    }

    console.log(`📊 Found ${users.length} users and ${courses.length} courses`);

    // Create sample notifications
    console.log('🔔 Creating sample notifications...');
    
    const sampleNotifications = [
      {
        user: users[0]._id,
        title: 'Welcome to CyberSec LMS!',
        message: 'Welcome to the cybersecurity learning management system. Start your journey with our beginner courses.',
        type: 'info',
        actionUrl: '/courses'
      },
      {
        user: users[0]._id,
        title: 'New Course Available',
        message: 'A new advanced cybersecurity course has been added to the platform.',
        type: 'course',
        metadata: {
          courseId: courses[0]._id,
          priority: 'medium'
        }
      },
      {
        user: users[1]._id,
        title: 'Course Completed!',
        message: 'Congratulations! You have successfully completed the Introduction to Cybersecurity course.',
        type: 'achievement',
        metadata: {
          courseId: courses[0]._id,
          priority: 'high'
        }
      },
      {
        user: users[1]._id,
        title: 'System Maintenance',
        message: 'The system will undergo maintenance on Sunday from 2-4 AM EST.',
        type: 'warning',
        metadata: {
          priority: 'high'
        }
      }
    ];

    for (const notificationData of sampleNotifications) {
      const notification = new Notification(notificationData);
      await notification.save();
    }

    console.log(`✅ Created ${sampleNotifications.length} sample notifications`);

    // Create sample discussions
    console.log('💬 Creating sample discussions...');
    
    const sampleDiscussions = [
      {
        courseId: courses[0]._id,
        userId: users[0]._id,
        title: 'Welcome to the Course Discussion!',
        message: 'This is the main discussion thread for our cybersecurity course. Feel free to ask questions, share insights, and help your fellow students.',
        type: 'announcement',
        tags: ['welcome', 'general'],
        isPinned: true
      },
      {
        courseId: courses[0]._id,
        userId: users[1]._id,
        title: 'Question about Network Security',
        message: 'I\'m having trouble understanding the difference between symmetric and asymmetric encryption. Can someone explain this in simple terms?',
        type: 'question',
        tags: ['encryption', 'network-security', 'help']
      },
      {
        courseId: courses[0]._id,
        userId: users[2]._id,
        title: 'Sharing a Great Resource',
        message: 'I found this excellent article about cybersecurity best practices that complements our course material: https://example.com/cybersec-guide',
        type: 'discussion',
        tags: ['resources', 'best-practices']
      }
    ];

    for (const discussionData of sampleDiscussions) {
      const discussion = new Discussion(discussionData);
      await discussion.save();
    }

    console.log(`✅ Created ${sampleDiscussions.length} sample discussions`);

    // Add some replies to discussions
    console.log('💭 Adding sample replies...');
    
    const discussions = await Discussion.find();
    if (discussions.length > 1) {
      // Add reply to the question
      await discussions[1].addReply(
        users[2]._id,
        'Great question! Symmetric encryption uses the same key for encryption and decryption, while asymmetric uses a pair of keys (public and private). Symmetric is faster but requires secure key exchange.',
        false
      );

      // Add instructor reply
      if (users.find(u => u.role === 'instructor')) {
        const instructor = users.find(u => u.role === 'instructor');
        await discussions[1].addReply(
          instructor._id,
          'Excellent explanation! To add to that, symmetric encryption is like having one key for your house that both locks and unlocks the door. Asymmetric is like having a mailbox - anyone can put mail in (public key) but only you can take it out (private key).',
          true
        );
      }
    }

    console.log('✅ Added sample replies');

    // Add some likes
    console.log('👍 Adding sample likes...');
    if (discussions.length > 0) {
      await discussions[0].toggleLike(users[1]._id);
      await discussions[0].toggleLike(users[2]._id);
    }

    console.log('✅ Added sample likes');

    console.log('\n🎉 Sample data creation completed!');
    console.log('\n📊 Summary:');
    console.log(`   📧 Notifications: ${sampleNotifications.length}`);
    console.log(`   💬 Discussions: ${sampleDiscussions.length}`);
    console.log(`   💭 Replies: Added to discussions`);
    console.log(`   👍 Likes: Added to discussions`);
    
    console.log('\n🔍 Now check MongoDB Atlas - you should see:');
    console.log('   - notifications collection');
    console.log('   - discussions collection');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  createSampleData();
}

module.exports = createSampleData;