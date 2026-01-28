const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { profile } = req.body;

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: { profile } },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user's enrolled courses
router.get('/courses', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate('enrolledCourses', 'title description category difficulty thumbnail')
            .populate('completedCourses', 'title description category difficulty thumbnail');

        res.json({
            enrolled: user.enrolledCourses,
            completed: user.completedCourses
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/users/public/:username
// @desc    Get public user profile
// @access  Public
router.get('/public/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select('-password -passwordHash -googleId -githubId -email -settings -__v')
            .populate({
                path: 'achievements',
                select: 'title description earnedAt'
            });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check privacy settings if they exist (assuming default is visible)
        if (user.settings?.privacy?.profileVisible === false) {
            return res.status(403).json({ message: 'This profile is private' });
        }

        // Only show limited public information
        const publicProfile = {
            username: user.username,
            role: user.role,
            createdAt: user.createdAt,
            profile: {
                firstName: user.profile?.firstName || '',
                lastName: user.profile?.lastName || '',
                // Only show bio if user has made it public
                bio: user.settings?.privacy?.showBio !== false ? user.profile?.bio : '',
                securityLevel: user.profile?.securityLevel || 'beginner',
                // Remove sensitive location/department info
                avatar: user.profile?.avatar
            }
        };

        // Only show achievements if user allows it
        if (user.settings?.privacy?.showAchievements !== false) {
            publicProfile.achievements = user.achievements || [];
        }

        // Only show certificates if user allows it
        let certificates = [];
        if (user.settings?.privacy?.showCertificates !== false) {
            const Certificate = require('../models/Certificate');
            const userCertificates = await Certificate.find({ user: user._id })
                .populate('course', 'title category difficulty')
                .sort({ issuedAt: -1 });

            certificates = userCertificates.map(c => ({
                certificateId: c.certificateId,
                courseTitle: c.course.title,
                courseCategory: c.course.category,
                issuedAt: c.issuedAt,
                // Don't expose specific skills for privacy
                skillsCount: c.skillsEarned?.length || 0
            }));
        }

        publicProfile.certificates = certificates;

        res.json(publicProfile);
    } catch (error) {
        console.error('Error fetching public profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/users/privacy
// @desc    Update user privacy settings
// @access  Private
router.put('/privacy', auth, async (req, res) => {
    try {
        const { privacy } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.userId,
            { 
                $set: { 
                    'settings.privacy': privacy 
                }
            },
            { new: true, upsert: true }
        ).select('-password -passwordHash');

        res.json({
            message: 'Privacy settings updated successfully',
            privacy: user.settings?.privacy
        });
    } catch (error) {
        console.error('Error updating privacy settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;