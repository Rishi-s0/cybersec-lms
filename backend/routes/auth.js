// 📦 IMPORT DEPENDENCIES
const express = require('express');                    // Web framework
const jwt = require('jsonwebtoken');                   // JWT token generation
const crypto = require('crypto');                      // Cryptographic functions
const { body, validationResult } = require('express-validator');  // Input validation
const User = require('../models/User');                // User model
const auth = require('../middleware/auth');            // Authentication middleware
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');  // Email service

const router = express.Router();

// 📝 REGISTER ROUTE: Create new user account with email verification
router.post('/register', [
  // 🔍 INPUT VALIDATION: Validate registration data
  body('username').isLength({ min: 3 }).trim(),        // Username min 3 chars
  body('email').isEmail().normalizeEmail(),            // Valid email format
  body('password').isLength({ min: 6 })                // Password min 6 chars
], async (req, res) => {
  try {
    // ✅ CHECK VALIDATION RESULTS
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role } = req.body;

    // 🚫 CRITICAL SECURITY: Force all public registrations to be students only
    // Admin accounts must be created manually via:
    // 1. Database seeding
    // 2. Admin panel (by existing admin)
    // 3. Command line script
    const userRole = 'student';

    // 🔍 CHECK IF USER EXISTS: Prevent duplicate accounts
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 🔢 GENERATE OTP: Create 6-digit verification code
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpiry = Date.now() + 600000; // ⏱️ 10 minutes expiry

    // 👤 CREATE USER: Save unverified user to database
    const user = new User({
      username,
      email,
      password,
      name: username,                      // Set name to username by default
      role: userRole,                      // Always 'student' for security
      isEmailVerified: false,              // Require email verification
      emailVerificationOTP: otp,           // Store OTP for verification
      emailVerificationExpires: otpExpiry  // OTP expiration time
    });

    await user.save();

    // 📧 SEND VERIFICATION EMAIL: Email OTP to user
    await sendVerificationEmail(email, otp);

    res.status(201).json({
      message: 'Registration successful! Please check your email for verification code.',
      userId: user._id,
      email: user.email,
      requiresVerification: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 🔐 LOGIN ROUTE: Authenticate user and generate JWT token
router.post('/login', [
  // 🔍 INPUT VALIDATION
  body('email').isEmail().normalizeEmail(),            // Valid email format
  body('password').exists()                            // Password must exist
], async (req, res) => {
  try {
    // ✅ CHECK VALIDATION RESULTS
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // 🔍 FIND USER: Look up user by email (include password for comparison)
    const user = await User.findOne({ email }).select('+password +isEmailVerified');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 🔒 CHECK PASSWORD: Verify password matches stored hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // ✉️ CHECK EMAIL VERIFICATION: Block unverified users (manual registration only)
    if (!user.googleId && !user.githubId && !user.isEmailVerified) {
      return res.status(400).json({
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        userId: user._id,
        email: user.email
      });
    }

    // 🎫 GENERATE JWT TOKEN: Create secure authentication token
    const token = jwt.sign(
      { userId: user._id, role: user.role },          // Payload: user ID and role
      process.env.JWT_SECRET || 'fallback_secret',    // Secret key from environment
      { expiresIn: '7d' }                             // Token expires in 7 days
    );

    // ✅ SEND RESPONSE: Return token and user data
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 👤 GET CURRENT USER: Retrieve authenticated user's information
router.get('/me', auth, async (req, res) => {
  try {
    // 🔍 FIND USER: Get user by ID from JWT token (password excluded)
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ SEND USER DATA: Return user information
    res.json({
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✉️ VERIFY EMAIL WITH OTP: Confirm user's email address
router.post('/verify-email', [
  // 🔍 INPUT VALIDATION
  body('email').isEmail().normalizeEmail(),                    // Valid email format
  body('otp').isLength({ min: 6, max: 6 }).isNumeric()        // 6-digit numeric OTP
], async (req, res) => {
  try {
    // ✅ CHECK VALIDATION RESULTS
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;

    // 🔍 FIND USER: Look for user with matching email, OTP, and valid expiry
    const user = await User.findOne({
      email,
      emailVerificationOTP: otp,
      emailVerificationExpires: { $gt: Date.now() }  // OTP not expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // ✅ VERIFY USER: Mark email as verified and clear OTP fields
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;           // Remove OTP
    user.emailVerificationExpires = undefined;       // Remove expiry
    await user.save();

    // 🎫 GENERATE JWT TOKEN: Auto-login user after verification
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    // ✅ SEND RESPONSE: Return token and user data
    res.json({
      message: 'Email verified successfully!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 🔄 RESEND VERIFICATION OTP: Send new verification code
router.post('/resend-verification', [
  // 🔍 INPUT VALIDATION
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    // ✅ CHECK VALIDATION RESULTS
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // 🔍 FIND UNVERIFIED USER: Only resend for unverified accounts
    const user = await User.findOne({
      email,
      isEmailVerified: false
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found or already verified' });
    }

    // 🔢 GENERATE NEW OTP: Create fresh 6-digit code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 600000; // ⏱️ 10 minutes expiry

    // 💾 UPDATE USER: Save new OTP and expiry
    user.emailVerificationOTP = otp;
    user.emailVerificationExpires = otpExpiry;
    await user.save();

    // 📧 SEND EMAIL: Email new OTP to user
    await sendVerificationEmail(email, otp);

    res.json({ message: 'Verification code resent successfully!' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 🔑 FORGOT PASSWORD: Request password reset link
router.post('/forgot-password', [
  // 🔍 INPUT VALIDATION
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    // ✅ CHECK VALIDATION RESULTS
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // 🔍 FIND USER: Look up user by email
    const user = await User.findOne({ email });
    if (!user) {
      // 🛡️ SECURITY: Don't reveal if user exists or not (prevents email enumeration)
      return res.json({ message: 'If an account with that email exists, we have sent a password reset link.' });
    }

    // 🔐 GENERATE RESET TOKEN: Create secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // ⏱️ 1 hour expiry

    // 💾 SAVE RESET TOKEN: Store token and expiry in user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // 📧 SEND EMAIL: Email reset link to user
    await sendPasswordResetEmail(email, resetToken);

    res.json({ message: 'If an account with that email exists, we have sent a password reset link.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 🔄 RESET PASSWORD: Set new password using reset token
router.post('/reset-password/:token', [
  // 🔍 INPUT VALIDATION
  body('password').isLength({ min: 6 })                // Password min 6 chars
], async (req, res) => {
  try {
    // ✅ CHECK VALIDATION RESULTS
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.params;
    const { password } = req.body;

    // 🔍 FIND USER: Look for user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }        // Token not expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // 🔒 UPDATE PASSWORD: Set new password (will be auto-hashed by pre-save hook)
    user.password = password;
    user.resetPasswordToken = undefined;              // Clear reset token
    user.resetPasswordExpires = undefined;            // Clear expiry
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 🔍 VERIFY JWT TOKEN: Check if token is valid and return user data
router.get('/verify', auth, async (req, res) => {
  try {
    // 🔍 FIND USER: Get user by ID from JWT token (password excluded)
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ SEND USER DATA: Return user information
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 📤 EXPORT ROUTER: Make routes available to server
module.exports = router;