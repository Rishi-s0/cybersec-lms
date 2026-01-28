const express = require('express');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Certificate = require('../models/Certificate');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Middleware to check admin access
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/bulk-users/import
// @desc    Import users from CSV file
// @access  Private/Admin
router.post('/import', auth, requireAdmin, upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No CSV file uploaded' });
    }

    const results = [];
    const errors = [];
    let processedCount = 0;
    let successCount = 0;

    // Read and parse CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', async (data) => {
        try {
          processedCount++;
          
          // Validate required fields
          if (!data.username || !data.email || !data.password) {
            errors.push({
              row: processedCount,
              error: 'Missing required fields (username, email, password)'
            });
            return;
          }

          // Check if user already exists
          const existingUser = await User.findOne({
            $or: [{ email: data.email }, { username: data.username }]
          });

          if (existingUser) {
            errors.push({
              row: processedCount,
              error: `User with email ${data.email} or username ${data.username} already exists`
            });
            return;
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(data.password, 12);

          // Create user
          const newUser = new User({
            username: data.username,
            email: data.email,
            password: hashedPassword,
            role: data.role || 'student',
            profile: {
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              bio: data.bio || '',
              organization: data.organization || ''
            }
          });

          await newUser.save();
          successCount++;

          results.push({
            username: data.username,
            email: data.email,
            role: data.role || 'student',
            status: 'created'
          });

        } catch (error) {
          errors.push({
            row: processedCount,
            error: error.message
          });
        }
      })
      .on('end', () => {
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
          message: `Import completed. ${successCount} users created, ${errors.length} errors`,
          results,
          errors,
          summary: {
            processed: processedCount,
            successful: successCount,
            failed: errors.length
          }
        });
      })
      .on('error', (error) => {
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Error processing CSV file', error: error.message });
      });

  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bulk-users/create
// @desc    Create multiple users from JSON data
// @access  Private/Admin
router.post('/create', auth, requireAdmin, async (req, res) => {
  try {
    const { users } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: 'Users array is required' });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < users.length; i++) {
      const userData = users[i];
      
      try {
        // Validate required fields
        if (!userData.username || !userData.email || !userData.password) {
          errors.push({
            index: i,
            user: userData,
            error: 'Missing required fields (username, email, password)'
          });
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({
          $or: [{ email: userData.email }, { username: userData.username }]
        });

        if (existingUser) {
          errors.push({
            index: i,
            user: userData,
            error: `User with email ${userData.email} or username ${userData.username} already exists`
          });
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        // Create user
        const newUser = new User({
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          role: userData.role || 'student',
          profile: {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            bio: userData.bio || '',
            organization: userData.organization || ''
          }
        });

        await newUser.save();

        results.push({
          username: userData.username,
          email: userData.email,
          role: userData.role || 'student',
          status: 'created'
        });

      } catch (error) {
        errors.push({
          index: i,
          user: userData,
          error: error.message
        });
      }
    }

    res.json({
      message: `Bulk creation completed. ${results.length} users created, ${errors.length} errors`,
      results,
      errors,
      summary: {
        processed: users.length,
        successful: results.length,
        failed: errors.length
      }
    });

  } catch (error) {
    console.error('Bulk create error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bulk-users/update
// @desc    Update multiple users
// @access  Private/Admin
router.put('/update', auth, requireAdmin, async (req, res) => {
  try {
    const { userIds, updates } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs array is required' });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Updates object is required' });
    }

    // Prepare update object
    const updateObj = {};
    if (updates.role) updateObj.role = updates.role;
    if (updates.isActive !== undefined) updateObj.isActive = updates.isActive;
    if (updates.profile) {
      Object.keys(updates.profile).forEach(key => {
        updateObj[`profile.${key}`] = updates.profile[key];
      });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: updateObj }
    );

    res.json({
      message: `Updated ${result.modifiedCount} users`,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/bulk-users/delete
// @desc    Delete multiple users
// @access  Private/Admin
router.delete('/delete', auth, requireAdmin, async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs array is required' });
    }

    // Don't allow deleting admin users
    const adminUsers = await User.find({ 
      _id: { $in: userIds }, 
      role: 'admin' 
    }).select('_id username');

    if (adminUsers.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete admin users',
        adminUsers: adminUsers.map(u => ({ id: u._id, username: u.username }))
      });
    }

    // Delete related data first
    await Progress.deleteMany({ user: { $in: userIds } });
    await Certificate.deleteMany({ user: { $in: userIds } });

    // Delete users
    const result = await User.deleteMany({ _id: { $in: userIds } });

    res.json({
      message: `Deleted ${result.deletedCount} users and their related data`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bulk-users/enroll
// @desc    Bulk enroll users in courses
// @access  Private/Admin
router.post('/enroll', auth, requireAdmin, async (req, res) => {
  try {
    const { userIds, courseIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs array is required' });
    }

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ message: 'Course IDs array is required' });
    }

    const enrollments = [];
    const errors = [];

    for (const userId of userIds) {
      for (const courseId of courseIds) {
        try {
          // Check if already enrolled
          const existingProgress = await Progress.findOne({
            user: userId,
            course: courseId
          });

          if (existingProgress) {
            errors.push({
              userId,
              courseId,
              error: 'User already enrolled in this course'
            });
            continue;
          }

          // Create progress record
          const progress = new Progress({
            user: userId,
            course: courseId,
            enrolledAt: new Date(),
            progressPercentage: 0,
            lessonsCompleted: [],
            quizzesCompleted: [],
            timeSpent: 0
          });

          await progress.save();
          enrollments.push({ userId, courseId, status: 'enrolled' });

        } catch (error) {
          errors.push({
            userId,
            courseId,
            error: error.message
          });
        }
      }
    }

    res.json({
      message: `Bulk enrollment completed. ${enrollments.length} enrollments created, ${errors.length} errors`,
      enrollments,
      errors,
      summary: {
        successful: enrollments.length,
        failed: errors.length
      }
    });

  } catch (error) {
    console.error('Bulk enroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bulk-users/template
// @desc    Download CSV template for bulk user import
// @access  Private/Admin
router.get('/template', auth, requireAdmin, (req, res) => {
  const csvTemplate = `username,email,password,role,firstName,lastName,bio,organization
john_doe,john@example.com,password123,student,John,Doe,Cybersecurity enthusiast,ACME Corp
jane_smith,jane@example.com,password123,instructor,Jane,Smith,Security expert,Tech University`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="bulk_users_template.csv"');
  res.send(csvTemplate);
});

module.exports = router;