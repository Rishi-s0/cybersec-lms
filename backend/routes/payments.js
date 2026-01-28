const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');
const NotificationService = require('../services/notificationService');

// Initialize Stripe if key is available
const stripe = process.env.STRIPE_SECRET_KEY
    ? require('stripe')(process.env.STRIPE_SECRET_KEY)
    : null;

// Mock mode if no key provided
const isMockMode = !stripe;

// Payment model for tracking transactions
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  stripePaymentIntentId: String,
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd'
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'canceled'],
    default: 'pending'
  },
  paymentMethod: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  metadata: {
    type: Map,
    of: String
  }
});

const Payment = mongoose.model('Payment', paymentSchema);

// @route   POST /api/payments/create-payment-intent
// @desc    Create a payment intent for a course
// @access  Private
router.post('/create-payment-intent', auth, async (req, res) => {
    try {
        const { courseId } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.isFree || course.price === 0) {
            return res.status(400).json({ message: 'This course is free' });
        }

        // Check if user already enrolled
        const existingProgress = await Progress.findOne({
            user: req.userId,
            course: courseId
        });

        if (existingProgress) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        // Check if valid user
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // MOCK MODE
        if (isMockMode) {
            console.log('⚠️ Stripe key missing. Using MOCK payment intent.');
            
            // Create payment record
            const payment = new Payment({
                user: req.userId,
                course: courseId,
                amount: course.price * 100,
                status: 'pending',
                stripePaymentIntentId: 'mock_pi_' + Date.now(),
                metadata: {
                    courseName: course.title,
                    userEmail: user.email
                }
            });
            await payment.save();

            return res.json({
                clientSecret: 'mock_secret_' + Date.now(),
                mockMode: true,
                amount: course.price * 100,
                paymentId: payment._id
            });
        }

        // Create payment record
        const payment = new Payment({
            user: req.userId,
            course: courseId,
            amount: course.price * 100,
            status: 'pending'
        });

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: course.price * 100, // Stripe expects amounts in cents
            currency: 'usd',
            metadata: {
                userId: req.userId,
                courseId: courseId,
                courseName: course.title,
                paymentId: payment._id.toString()
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        // Update payment with Stripe ID
        payment.stripePaymentIntentId = paymentIntent.id;
        await payment.save();

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentId: payment._id
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/payments/confirm-mock-payment
// @desc    Manually enroll user calls this in mock mode
// @access  Private
router.post('/confirm-mock-payment', auth, async (req, res) => {
    if (!isMockMode) {
        return res.status(400).json({ message: 'Mock mode is not enabled' });
    }

    try {
        const { courseId, paymentId } = req.body;

        // Find payment record
        const payment = await Payment.findById(paymentId);
        if (!payment || payment.user.toString() !== req.userId) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({ message: 'Payment already processed' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if already enrolled
        const progressExists = await Progress.findOne({ 
            user: req.userId, 
            course: courseId 
        });
        
        if (progressExists) {
            return res.json({ message: 'Already enrolled' });
        }

        // Create progress record (enrollment)
        const progress = new Progress({
            user: req.userId,
            course: courseId,
            enrolledAt: new Date(),
            progressPercentage: 0,
            lessonsCompleted: [],
            quizzesCompleted: [],
            timeSpent: 0,
            paymentId: payment._id
        });

        await progress.save();

        // Update payment status
        payment.status = 'succeeded';
        payment.completedAt = new Date();
        await payment.save();

        // Send notification
        if (req.notificationService) {
            await req.notificationService.notifyEnrollment(
                req.userId,
                course.title,
                courseId
            );
        }

        res.json({ 
            success: true, 
            message: 'Payment confirmed and enrolled successfully',
            enrollmentId: progress._id
        });

    } catch (error) {
        console.error('Mock payment confirmation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/payments/webhook
// @desc    Handle Stripe webhooks
// @access  Public (but verified)
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    if (isMockMode) {
        return res.status(400).json({ message: 'Webhooks not available in mock mode' });
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            await handlePaymentSuccess(paymentIntent);
            break;
        
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            await handlePaymentFailure(failedPayment);
            break;
        
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
});

// Helper function to handle successful payments
async function handlePaymentSuccess(paymentIntent) {
    try {
        const { userId, courseId, paymentId } = paymentIntent.metadata;

        // Find payment record
        const payment = await Payment.findById(paymentId);
        if (!payment) {
            console.error('Payment record not found:', paymentId);
            return;
        }

        // Update payment status
        payment.status = 'succeeded';
        payment.completedAt = new Date();
        payment.paymentMethod = paymentIntent.payment_method;
        await payment.save();

        // Check if already enrolled
        const existingProgress = await Progress.findOne({
            user: userId,
            course: courseId
        });

        if (existingProgress) {
            console.log('User already enrolled, skipping enrollment');
            return;
        }

        // Create progress record (enrollment)
        const progress = new Progress({
            user: userId,
            course: courseId,
            enrolledAt: new Date(),
            progressPercentage: 0,
            lessonsCompleted: [],
            quizzesCompleted: [],
            timeSpent: 0,
            paymentId: payment._id
        });

        await progress.save();

        // Get course info for notification
        const course = await Course.findById(courseId);
        
        // Send notification (you'll need to initialize notification service)
        // This would require access to the notification service instance
        console.log(`Payment successful for user ${userId}, course ${course?.title}`);

    } catch (error) {
        console.error('Error handling payment success:', error);
    }
}

// Helper function to handle failed payments
async function handlePaymentFailure(paymentIntent) {
    try {
        const { paymentId } = paymentIntent.metadata;

        // Find payment record
        const payment = await Payment.findById(paymentId);
        if (!payment) {
            console.error('Payment record not found:', paymentId);
            return;
        }

        // Update payment status
        payment.status = 'failed';
        await payment.save();

        console.log(`Payment failed for payment ${paymentId}`);

    } catch (error) {
        console.error('Error handling payment failure:', error);
    }
}

// @route   GET /api/payments/history
// @desc    Get user's payment history
// @access  Private
router.get('/history', auth, async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.userId })
            .populate('course', 'title category thumbnail')
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (error) {
        console.error('Payment history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/payments/:paymentId
// @desc    Get specific payment details
// @access  Private
router.get('/:paymentId', auth, async (req, res) => {
    try {
        const payment = await Payment.findOne({
            _id: req.params.paymentId,
            user: req.userId
        }).populate('course', 'title category thumbnail');

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.json(payment);
    } catch (error) {
        console.error('Get payment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
