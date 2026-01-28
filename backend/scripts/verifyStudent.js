const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function verifyStudentEmail() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cybersec-lms');
    console.log('📡 Connected to MongoDB');

    // Find and update student account
    const result = await User.updateOne(
      { email: 'student@hackademy.com' },
      { 
        $set: { 
          isEmailVerified: true
        },
        $unset: {
          emailVerificationOTP: 1,
          emailVerificationExpires: 1
        }
      }
    );

    if (result.matchedCount > 0) {
      console.log('✅ Student email verified successfully!');
      console.log('🔐 You can now login with: student@hackademy.com / password123');
    } else {
      console.log('❌ Student account not found. Please run: npm run seed');
    }

    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyStudentEmail();