// Script to verify all seeded accounts so they can login
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function verifyAllAccounts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Verify all accounts
    const result = await User.updateMany(
      {},
      { 
        $set: { 
          isEmailVerified: true,
          emailVerificationOTP: undefined,
          emailVerificationExpires: undefined
        }
      }
    );

    console.log(`\n✅ Verified ${result.modifiedCount} accounts`);
    
    // List all users
    const users = await User.find({}).select('email username role isEmailVerified');
    console.log('\n📋 All Users:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.username}) - ${user.role} - Verified: ${user.isEmailVerified}`);
    });

    console.log('\n✅ All accounts are now verified and ready to use!\n');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

verifyAllAccounts();
