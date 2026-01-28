const express = require('express');
const Certificate = require('../models/Certificate');
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/certificates
// @desc    Get user's certificates
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.userId })
      .populate('course', 'title category difficulty thumbnail')
      .sort({ issuedAt: -1 });

    res.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/certificates/:certificateId
// @desc    Get certificate by ID
// @access  Public (for verification)
router.get('/:certificateId', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateId: req.params.certificateId
    })
      .populate('user', 'username profile.firstName profile.lastName')
      .populate('course', 'title category difficulty instructor')
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'username profile.firstName profile.lastName'
        }
      });

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Check if certificate is valid
    const isValid = certificate.verify();

    res.json({
      ...certificate.toObject(),
      isValid,
      verificationStatus: isValid ? 'valid' : 'invalid'
    });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/certificates/verify
// @desc    Verify certificate by verification code
// @access  Public
router.post('/verify', async (req, res) => {
  try {
    const { verificationCode } = req.body;

    const certificate = await Certificate.findOne({ verificationCode })
      .populate('user', 'username profile.firstName profile.lastName')
      .populate('course', 'title category difficulty')
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'username profile.firstName profile.lastName'
        }
      });

    if (!certificate) {
      return res.status(404).json({
        message: 'Certificate not found',
        isValid: false
      });
    }

    const isValid = certificate.verify();

    res.json({
      isValid,
      certificate: isValid ? {
        certificateId: certificate.certificateId,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        instructorName: certificate.instructorName,
        completedAt: certificate.completedAt,
        issuedAt: certificate.issuedAt,
        finalScore: certificate.finalScore,
        skillsEarned: certificate.skillsEarned,
        certificateType: certificate.certificateType
      } : null,
      message: isValid ? 'Certificate is valid' : 'Certificate is invalid or expired'
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/certificates/download/:certificateId
// @desc    Download certificate as PDF
// @access  Private
router.get('/download/:certificateId', auth, async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateId: req.params.certificateId,
      user: req.userId
    })
      .populate('course', 'title category')
      .populate('user', 'profile.firstName profile.lastName');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    if (!certificate.verify()) {
      return res.status(400).json({ message: 'Certificate is invalid or expired' });
    }

    // Generate PDF certificate (simplified version)
    const certificateHTML = generateCertificateHTML(certificate);

    res.json({
      message: 'Certificate ready for download',
      certificateId: certificate.certificateId,
      downloadUrl: `/api/certificates/pdf/${certificate.certificateId}`,
      html: certificateHTML // For preview
    });
  } catch (error) {
    console.error('Error preparing certificate download:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/certificates/pdf/:certificateId
// @desc    Download certificate as PDF
// @access  Public (or Private with token in query param)
router.get('/pdf/:certificateId', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateId: req.params.certificateId
    })
      .populate('course', 'title category')
      .populate('user', 'profile.firstName profile.lastName');

    console.log(`Generating PDF for Cert ID: ${req.params.certificateId}`);

    if (!certificate) {
      console.log('Certificate not found in DB');
      return res.status(404).send('Certificate not found');
    }

    try {
      const html = generateCertificateHTML(certificate);
      // const { generatePDF } = require('../services/pdfService'); // Lazy load

      // Check if format=html is requested for debugging
      if (req.query.format === 'html') {
        res.send(html);
        return;
      }

      const { generatePDF } = require('../services/pdfService');
      const pdfBuffer = await generatePDF(html);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length,
        'Content-Disposition': `attachment; filename="certificate-${certificate.certificateId}.pdf"`
      });

      res.send(pdfBuffer);
      console.log('PDF generated and sent successfully');
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Fallback to HTML if PDF generation fails (e.g. puppeteer issue)
      res.status(500).send('Error generating certificate PDF. Please contact support.');
    }

  } catch (error) {
    console.error('Error serving certificate PDF:', error);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/certificates/stats/:userId
// @desc    Get certificate statistics for user
// @access  Private (Admin only)
router.get('/stats/:userId', auth, async (req, res) => {
  try {
    // Check if user is admin
    const requestingUser = await User.findById(req.userId);
    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const certificates = await Certificate.find({ user: req.params.userId })
      .populate('course', 'title category difficulty');

    const stats = {
      totalCertificates: certificates.length,
      certificatesByType: certificates.reduce((acc, cert) => {
        acc[cert.certificateType] = (acc[cert.certificateType] || 0) + 1;
        return acc;
      }, {}),
      certificatesByCategory: certificates.reduce((acc, cert) => {
        const category = cert.course.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {}),
      averageScore: certificates.length > 0 ?
        certificates.reduce((sum, cert) => sum + cert.finalScore, 0) / certificates.length : 0,
      totalTimeSpent: certificates.reduce((sum, cert) => sum + cert.totalTimeSpent, 0),
      skillsEarned: [...new Set(certificates.flatMap(cert => cert.skillsEarned))],
      recentCertificates: certificates
        .sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt))
        .slice(0, 5)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching certificate stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/certificates/generate/:courseId
// @desc    Manually generate certificate (Admin only)
// @access  Private (Admin only)
router.post('/generate/:courseId', auth, async (req, res) => {
  try {
    const { userId } = req.body;

    // Check if user is admin
    const requestingUser = await User.findById(req.userId);
    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      user: userId,
      course: req.params.courseId
    });

    if (existingCertificate) {
      return res.status(400).json({ message: 'Certificate already exists for this user and course' });
    }

    // Get progress data
    const progress = await Progress.findOne({
      user: userId,
      course: req.params.courseId
    });

    if (!progress) {
      return res.status(404).json({ message: 'No progress found for this user and course' });
    }

    // Generate certificate
    const certificate = await Certificate.generateCertificate(userId, req.params.courseId, {
      completedAt: progress.completedAt || new Date(),
      averageQuizScore: progress.quizzesCompleted.length > 0 ?
        progress.quizzesCompleted.reduce((sum, q) => sum + q.bestScore, 0) / progress.quizzesCompleted.length : 100,
      totalTimeSpent: progress.timeSpent
    });

    // Update progress
    progress.certificate.issued = true;
    progress.certificate.issuedAt = certificate.issuedAt;
    progress.certificate.certificateId = certificate.certificateId;
    await progress.save();

    res.status(201).json({
      message: 'Certificate generated successfully',
      certificate
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to generate certificate HTML
function generateCertificateHTML(certificate) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Certificate of Completion</title>
        <style>
            body { 
                font-family: 'Georgia', serif; 
                margin: 0; 
                padding: 40px; 
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                color: #fff;
            }
            .certificate {
                max-width: 800px;
                margin: 0 auto;
                padding: 60px;
                background: #000;
                border: 3px solid #00ff88;
                border-radius: 10px;
                text-align: center;
                box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
            }
            .header { font-size: 48px; font-weight: bold; color: #00ff88; margin-bottom: 20px; }
            .title { font-size: 24px; margin-bottom: 40px; color: #ccc; }
            .student-name { font-size: 36px; font-weight: bold; color: #fff; margin: 30px 0; }
            .course-name { font-size: 28px; color: #00ff88; margin: 20px 0; }
            .details { font-size: 16px; color: #ccc; margin: 20px 0; }
            .signature { margin-top: 60px; display: flex; justify-content: space-between; }
            .sig-line { border-top: 2px solid #00ff88; width: 200px; padding-top: 10px; }
            .verification { margin-top: 40px; font-size: 12px; color: #888; }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="header">CERTIFICATE OF COMPLETION</div>
            <div class="title">CyberSec Learning Management System</div>
            
            <div style="margin: 40px 0;">This is to certify that</div>
            
            <div class="student-name">${certificate.studentName}</div>
            
            <div style="margin: 40px 0;">has successfully completed the course</div>
            
            <div class="course-name">${certificate.courseName}</div>
            
            <div class="details">
                <p>Completed on: ${new Date(certificate.completedAt).toLocaleDateString()}</p>
                <p>Final Score: ${certificate.finalScore}%</p>
                <p>Total Time: ${certificate.totalTimeSpent} hours</p>
            </div>
            
            <div class="signature">
                <div class="sig-line">
                    <div>${certificate.instructorName}</div>
                    <div style="font-size: 14px; color: #888;">Course Instructor</div>
                </div>
                <div class="sig-line">
                    <div>CyberSec LMS</div>
                    <div style="font-size: 14px; color: #888;">Learning Platform</div>
                </div>
            </div>
            
            <div class="verification">
                <p>Certificate ID: ${certificate.certificateId}</p>
                <p>Verification Code: ${certificate.verificationCode}</p>
                <p>Issued: ${new Date(certificate.issuedAt).toLocaleDateString()}</p>
                <p>Verify at: https://cybersec-lms.com/verify</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

module.exports = router;