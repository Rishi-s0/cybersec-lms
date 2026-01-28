const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
require('dotenv').config();

/**
 * Direct Database Operations
 * Quick scripts for common database tasks
 */

class DatabaseOperations {
  
  static async connect() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  }

  static async disconnect() {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }

  // View database statistics
  static async getStats() {
    await this.connect();
    
    const stats = {
      users: await User.countDocuments(),
      courses: await Course.countDocuments(),
      progress: await Progress.countDocuments(),
      usersByRole: await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      coursesByCategory: await Course.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    };
    
    console.log('📊 Database Statistics:');
    console.log(JSON.stringify(stats, null, 2));
    
    await this.disconnect();
    return stats;
  }

  // Create a new admin user
  static async createAdmin(username, email, password) {
    await this.connect();
    
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = new User({
      username,
      email,
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true, // Admin accounts are pre-verified
      profile: {
        firstName: 'Admin',
        lastName: 'User'
      }
    });
    
    await admin.save();
    console.log(`✅ Created admin user: ${email} (email pre-verified)`);
    
    await this.disconnect();
  }

  // Update user role
  static async updateUserRole(email, newRole) {
    await this.connect();
    
    const user = await User.findOneAndUpdate(
      { email },
      { role: newRole },
      { new: true }
    );
    
    if (user) {
      console.log(`✅ Updated ${email} role to ${newRole}`);
    } else {
      console.log(`❌ User not found: ${email}`);
    }
    
    await this.disconnect();
  }

  // Delete all data (be careful!)
  static async clearAllData() {
    await this.connect();
    
    console.log('⚠️  WARNING: This will delete ALL data!');
    
    await User.deleteMany({});
    await Course.deleteMany({});
    await Progress.deleteMany({});
    
    console.log('🗑️  All data deleted');
    
    await this.disconnect();
  }

  // Backup data to JSON files
  static async backupData() {
    await this.connect();
    
    const fs = require('fs');
    const path = require('path');
    
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Backup each collection
    const users = await User.find({});
    const courses = await Course.find({});
    const progress = await Progress.find({});
    
    fs.writeFileSync(
      path.join(backupDir, `users-${timestamp}.json`),
      JSON.stringify(users, null, 2)
    );
    
    fs.writeFileSync(
      path.join(backupDir, `courses-${timestamp}.json`),
      JSON.stringify(courses, null, 2)
    );
    
    fs.writeFileSync(
      path.join(backupDir, `progress-${timestamp}.json`),
      JSON.stringify(progress, null, 2)
    );
    
    console.log(`✅ Backup created in ${backupDir}`);
    
    await this.disconnect();
  }

  // Find users by criteria
  static async findUsers(criteria = {}) {
    await this.connect();
    
    const users = await User.find(criteria).select('-password');
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - ${user.role}`);
    });
    
    await this.disconnect();
    return users;
  }
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'stats':
    DatabaseOperations.getStats();
    break;
    
  case 'create-admin':
    const [username, email, password] = args.slice(1);
    if (!username || !email || !password) {
      console.log('Usage: node dbOperations.js create-admin <username> <email> <password>');
    } else {
      DatabaseOperations.createAdmin(username, email, password);
    }
    break;
    
  case 'update-role':
    const [userEmail, newRole] = args.slice(1);
    if (!userEmail || !newRole) {
      console.log('Usage: node dbOperations.js update-role <email> <role>');
    } else {
      DatabaseOperations.updateUserRole(userEmail, newRole);
    }
    break;
    
  case 'backup':
    DatabaseOperations.backupData();
    break;
    
  case 'find-users':
    const role = args[1];
    const criteria = role ? { role } : {};
    DatabaseOperations.findUsers(criteria);
    break;
    
  default:
    console.log(`
Available commands:
  stats                           - Show database statistics
  create-admin <user> <email> <pass> - Create new admin user
  update-role <email> <role>      - Update user role
  backup                          - Backup all data to JSON
  find-users [role]               - Find users (optionally by role)

Examples:
  node dbOperations.js stats
  node dbOperations.js create-admin newadmin admin@example.com password123
  node dbOperations.js update-role user@example.com admin
  node dbOperations.js find-users student
    `);
}

module.exports = DatabaseOperations;