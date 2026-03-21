// Quick script to create a test user for screenshots
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 600000; // 10 minutes

    // Create unverified user
    const testUser = new User({
      username: 'testuser999',
      email: 'testuser999@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'student',
      isEmailVerified: false,
      emailVerificationOTP: otp,
      emailVerificationExpires: otpExpiry
    });

    await testUser.save();

    console.log('\n✅ Test user created successfully!');
    console.log('\n📧 EMAIL VERIFICATION');
    console.log(`Email: testuser999@example.com`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Expires: 10 minutes\n`);
    console.log('Go to: http://localhost:3000/verify-email');
    console.log('Enter the email and OTP code above\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createTestUser();
