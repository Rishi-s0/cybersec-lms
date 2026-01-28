const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');

/**
 * Database Transaction Examples for Cybersecurity LMS
 * Shows different ways to access and manipulate database data
 */

// 1. BASIC CRUD OPERATIONS
class DatabaseOperations {
  
  // CREATE - Add new record
  static async createUser(userData) {
    try {
      const user = new User(userData);
      const savedUser = await user.save();
      console.log('✅ User created:', savedUser._id);
      return savedUser;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  }

  // READ - Find records
  static async findUsers(query = {}) {
    try {
      const users = await User.find(query)
        .select('-password') // Exclude password field
        .populate('enrolledCourses', 'title category')
        .sort({ createdAt: -1 });
      
      console.log(`✅ Found ${users.length} users`);
      return users;
    } catch (error) {
      console.error('❌ Error finding users:', error);
      throw error;
    }
  }

  // UPDATE - Modify existing record
  static async updateUser(userId, updateData) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).select('-password');
      
      console.log('✅ User updated:', updatedUser._id);
      return updatedUser;
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }
  }

  // DELETE - Remove record
  static async deleteUser(userId) {
    try {
      // First, clean up related data
      await Progress.deleteMany({ user: userId });
      
      // Remove user from course enrollments
      await Course.updateMany(
        { enrolledStudents: userId },
        { $pull: { enrolledStudents: userId } }
      );
      
      // Delete the user
      const deletedUser = await User.findByIdAndDelete(userId);
      console.log('✅ User deleted:', userId);
      return deletedUser;
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }
  }
}

// 2. ADVANCED QUERIES AND AGGREGATIONS
class AdvancedQueries {
  
  // Complex search with multiple conditions
  static async searchCourses(searchParams) {
    try {
      const { category, difficulty, search, minDuration, maxDuration } = searchParams;
      
      let query = { isPublished: true };
      
      // Add filters
      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;
      if (minDuration || maxDuration) {
        query.estimatedDuration = {};
        if (minDuration) query.estimatedDuration.$gte = minDuration;
        if (maxDuration) query.estimatedDuration.$lte = maxDuration;
      }
      
      // Text search
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }
      
      const courses = await Course.find(query)
        .populate('instructor', 'username profile.firstName profile.lastName')
        .select('-lessons.quiz.correctAnswer')
        .sort({ createdAt: -1 });
      
      console.log(`✅ Found ${courses.length} courses matching criteria`);
      return courses;
    } catch (error) {
      console.error('❌ Error searching courses:', error);
      throw error;
    }
  }

  // Aggregation pipeline for analytics
  static async getUserAnalytics() {
    try {
      const analytics = await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
            avgSecurityLevel: { $avg: { $cond: [
              { $eq: ['$profile.securityLevel', 'beginner'] }, 1,
              { $cond: [{ $eq: ['$profile.securityLevel', 'intermediate'] }, 2, 3] }
            ]}},
            users: { $push: { username: '$username', email: '$email' } }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);
      
      console.log('✅ User analytics generated');
      return analytics;
    } catch (error) {
      console.error('❌ Error generating analytics:', error);
      throw error;
    }
  }

  // Course completion statistics
  static async getCourseCompletionStats() {
    try {
      const stats = await Progress.aggregate([
        {
          $lookup: {
            from: 'courses',
            localField: 'course',
            foreignField: '_id',
            as: 'courseInfo'
          }
        },
        {
          $unwind: '$courseInfo'
        },
        {
          $group: {
            _id: '$courseInfo.category',
            totalEnrollments: { $sum: 1 },
            completions: { $sum: { $cond: ['$isCompleted', 1, 0] } },
            avgProgress: { $avg: '$overallProgress' }
          }
        },
        {
          $addFields: {
            completionRate: { $divide: ['$completions', '$totalEnrollments'] }
          }
        },
        {
          $sort: { completionRate: -1 }
        }
      ]);
      
      console.log('✅ Course completion stats generated');
      return stats;
    } catch (error) {
      console.error('❌ Error generating completion stats:', error);
      throw error;
    }
  }
}

// 3. DATABASE TRANSACTIONS (ACID Operations)
class DatabaseTransactions {
  
  // Enroll student in course (atomic operation)
  static async enrollStudentInCourse(userId, courseId) {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // 1. Check if course exists and is published
        const course = await Course.findById(courseId).session(session);
        if (!course || !course.isPublished) {
          throw new Error('Course not found or not published');
        }
        
        // 2. Check if user exists and is a student
        const user = await User.findById(userId).session(session);
        if (!user || user.role !== 'student') {
          throw new Error('User not found or not a student');
        }
        
        // 3. Check if already enrolled
        if (user.enrolledCourses.includes(courseId)) {
          throw new Error('Already enrolled in this course');
        }
        
        // 4. Add course to user's enrolled courses
        await User.findByIdAndUpdate(
          userId,
          { $push: { enrolledCourses: courseId } },
          { session }
        );
        
        // 5. Add user to course's enrolled students
        await Course.findByIdAndUpdate(
          courseId,
          { $push: { enrolledStudents: userId } },
          { session }
        );
        
        // 6. Create progress record
        const progress = new Progress({
          user: userId,
          course: courseId,
          overallProgress: 0,
          isCompleted: false
        });
        await progress.save({ session });
        
        console.log('✅ Student enrolled successfully');
      });
    } catch (error) {
      console.error('❌ Enrollment transaction failed:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  // Complete course (atomic operation)
  static async completeCourse(userId, courseId) {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // 1. Update progress to completed
        const progress = await Progress.findOneAndUpdate(
          { user: userId, course: courseId },
          { 
            isCompleted: true, 
            overallProgress: 100,
            completedAt: new Date()
          },
          { session, new: true }
        );
        
        if (!progress) {
          throw new Error('Progress record not found');
        }
        
        // 2. Add course to user's completed courses
        await User.findByIdAndUpdate(
          userId,
          { 
            $addToSet: { completedCourses: courseId },
            $push: {
              achievements: {
                title: 'Course Completed',
                description: `Completed course: ${progress.course}`,
                earnedAt: new Date()
              }
            }
          },
          { session }
        );
        
        // 3. Update course completion count
        await Course.findByIdAndUpdate(
          courseId,
          { $inc: { completionCount: 1 } },
          { session }
        );
        
        console.log('✅ Course completion transaction successful');
      });
    } catch (error) {
      console.error('❌ Course completion transaction failed:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  // Bulk operations for data migration
  static async bulkUpdateUserRoles(userIds, newRole) {
    try {
      const result = await User.updateMany(
        { _id: { $in: userIds } },
        { role: newRole, updatedAt: new Date() }
      );
      
      console.log(`✅ Updated ${result.modifiedCount} users to role: ${newRole}`);
      return result;
    } catch (error) {
      console.error('❌ Bulk update failed:', error);
      throw error;
    }
  }
}

// 4. DATABASE UTILITIES
class DatabaseUtils {
  
  // Database health check
  static async healthCheck() {
    try {
      const dbState = mongoose.connection.readyState;
      const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      
      const stats = {
        status: states[dbState],
        collections: {
          users: await User.countDocuments(),
          courses: await Course.countDocuments(),
          progress: await Progress.countDocuments()
        },
        timestamp: new Date()
      };
      
      console.log('✅ Database health check completed');
      return stats;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      throw error;
    }
  }

  // Clean up orphaned records
  static async cleanupOrphanedRecords() {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Remove progress records for deleted users
        const orphanedProgress = await Progress.find({}).populate('user').session(session);
        const progressToDelete = orphanedProgress.filter(p => !p.user);
        
        if (progressToDelete.length > 0) {
          await Progress.deleteMany(
            { _id: { $in: progressToDelete.map(p => p._id) } },
            { session }
          );
          console.log(`✅ Cleaned up ${progressToDelete.length} orphaned progress records`);
        }
        
        // Remove course references from deleted courses
        const users = await User.find({}).session(session);
        for (const user of users) {
          const validCourses = await Course.find({ 
            _id: { $in: user.enrolledCourses } 
          }).session(session);
          
          const validCourseIds = validCourses.map(c => c._id.toString());
          const cleanedEnrolled = user.enrolledCourses.filter(id => 
            validCourseIds.includes(id.toString())
          );
          
          if (cleanedEnrolled.length !== user.enrolledCourses.length) {
            await User.findByIdAndUpdate(
              user._id,
              { enrolledCourses: cleanedEnrolled },
              { session }
            );
          }
        }
        
        console.log('✅ Database cleanup completed');
      });
    } catch (error) {
      console.error('❌ Database cleanup failed:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }
}

module.exports = {
  DatabaseOperations,
  AdvancedQueries,
  DatabaseTransactions,
  DatabaseUtils
};