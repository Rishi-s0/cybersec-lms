const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
require('dotenv').config();

/**
 * Database Migration Script
 * Use this to make changes to existing database records
 */

async function runMigration() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Example migrations:
    
    // 1. Add new field to all users
    await addPhoneNumberField();
    
    // 2. Update course categories
    await updateCourseCategories();
    
    // 3. Fix data inconsistencies
    await fixDataInconsistencies();

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Add phone number field to all users
async function addPhoneNumberField() {
  console.log('📱 Adding phone number field to users...');
  
  const result = await User.updateMany(
    { phoneNumber: { $exists: false } }, // Users without phone number
    { $set: { phoneNumber: '' } }        // Add empty phone number
  );
  
  console.log(`✅ Updated ${result.modifiedCount} users with phone number field`);
}

// Update course categories
async function updateCourseCategories() {
  console.log('📚 Updating course categories...');
  
  // Rename old category to new category
  const result = await Course.updateMany(
    { category: 'Old Category Name' },
    { $set: { category: 'New Category Name' } }
  );
  
  console.log(`✅ Updated ${result.modifiedCount} courses with new category`);
}

// Fix data inconsistencies
async function fixDataInconsistencies() {
  console.log('🔧 Fixing data inconsistencies...');
  
  // Remove progress records for deleted courses
  const courses = await Course.find({}, '_id');
  const courseIds = courses.map(c => c._id);
  
  const result = await Progress.deleteMany({
    course: { $nin: courseIds }
  });
  
  console.log(`✅ Removed ${result.deletedCount} orphaned progress records`);
}

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };