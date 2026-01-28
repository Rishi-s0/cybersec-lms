const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function verifyAdminEmail() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cybersec-lms');
    console.log('📡 Connected to MongoDB');

    // Find and update admin account
    const result = await User.updateOne(
      { email: 'admin@hackademy.com' },
      { 
        $set: { 
          isEmailVerified: true,
          $unset: {
            emailVerificationOTP: 1,
            emailVerificationExpires: 1
          }
        }
      }
    );

    if (result.matchedCount > 0) {
      console.log('✅ Admin email verified successfully!');
      console.log('🔐 You can now login with: admin@hackademy.com / password123');
    } else {
      console.log('❌ Admin account not found. Please run: npm run seed');
    }

    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyAdminEmail();