# 🛠️ Development Guide - How to Make Changes

This guide shows you how to modify and extend the Cybersecurity Learning Management System.

## 📁 Project Structure

```
cybersec-lms/
├── backend/                 # Node.js/Express API
│   ├── models/             # Database schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Authentication, validation
│   ├── seeds/              # Sample data
│   └── utils/              # Helper functions
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── contexts/       # React context (auth, etc.)
│   │   └── styles/         # CSS and styling
└── .env                    # Environment variables
```

## 🔧 Common Modifications

### 1. Adding New Database Fields

#### Step 1: Update the Model
```javascript
// backend/models/User.js
const userSchema = new mongoose.Schema({
  // Existing fields...
  
  // Add new fields
  phoneNumber: {
    type: String,
    required: false
  },
  department: {
    type: String,
    enum: ['IT', 'Security', 'Management', 'Other'],
    default: 'Other'
  },
  certifications: [{
    name: String,
    issuer: String,
    dateEarned: Date,
    expiryDate: Date
  }]
});
```

#### Step 2: Update API Routes
```javascript
// backend/routes/users.js
router.put('/profile', auth, async (req, res) => {
  try {
    const { phoneNumber, department, certifications } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        phoneNumber, 
        department, 
        certifications,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
```

#### Step 3: Update Frontend Forms
```javascript
// frontend/src/pages/Profile.js
const [formData, setFormData] = useState({
  // Existing fields...
  phoneNumber: user?.phoneNumber || '',
  department: user?.department || 'Other',
  certifications: user?.certifications || []
});

// Add form fields in JSX
<input
  type="tel"
  name="phoneNumber"
  value={formData.phoneNumber}
  onChange={handleChange}
  className="htb-input"
  placeholder="Phone Number"
/>

<select
  name="department"
  value={formData.department}
  onChange={handleChange}
  className="htb-input"
>
  <option value="IT">IT</option>
  <option value="Security">Security</option>
  <option value="Management">Management</option>
  <option value="Other">Other</option>
</select>
```

### 2. Adding New Pages

#### Step 1: Create the Page Component
```javascript
// frontend/src/pages/Certificates.js
import React, { useState, useEffect } from 'react';
import { Award, Download, Calendar } from 'lucide-react';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await fetch('/api/certificates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setCertificates(data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-htb-gray-light matrix-text">
        My Certificates
      </h1>
      
      <div className="grid gap-6">
        {certificates.map(cert => (
          <div key={cert._id} className="htb-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Award className="h-8 w-8 text-htb-green" />
                <div>
                  <h3 className="text-lg font-semibold text-htb-gray-light">
                    {cert.courseName}
                  </h3>
                  <p className="text-htb-gray">
                    Completed on {new Date(cert.completedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <button className="htb-btn-primary px-4 py-2 rounded-lg flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Certificates;
```

#### Step 2: Add Route to App.js
```javascript
// frontend/src/App.js
import Certificates from './pages/Certificates';

// Add to Routes
<Route 
  path="/certificates" 
  element={user ? <Certificates /> : <Navigate to="/login" />} 
/>
```

#### Step 3: Add Navigation Link
```javascript
// frontend/src/components/Navbar.js
const getNavItems = () => {
  if (user?.role === 'student') {
    return [
      // Existing items...
      { path: '/certificates', icon: Award, label: 'Certificates' },
    ];
  }
};
```

### 3. Adding New API Endpoints

#### Step 1: Create Route File
```javascript
// backend/routes/certificates.js
const express = require('express');
const auth = require('../middleware/auth');
const Certificate = require('../models/Certificate');
const router = express.Router();

// Get user certificates
router.get('/', auth, async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user.id })
      .populate('course', 'title category')
      .sort({ completedAt: -1 });
    
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate certificate
router.post('/generate', auth, async (req, res) => {
  try {
    const { courseId } = req.body;
    
    // Check if course is completed
    const progress = await Progress.findOne({
      user: req.user.id,
      course: courseId,
      isCompleted: true
    });
    
    if (!progress) {
      return res.status(400).json({ message: 'Course not completed' });
    }
    
    // Create certificate
    const certificate = new Certificate({
      user: req.user.id,
      course: courseId,
      completedAt: progress.completedAt,
      certificateId: generateCertificateId()
    });
    
    await certificate.save();
    res.json(certificate);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
```

#### Step 2: Register Route in Server
```javascript
// backend/server.js
const certificateRoutes = require('./routes/certificates');
app.use('/api/certificates', certificateRoutes);
```

### 4. Modifying Existing Features

#### Example: Adding Course Rating System

#### Step 1: Update Course Model
```javascript
// backend/models/Course.js
const courseSchema = new mongoose.Schema({
  // Existing fields...
  
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 }
});
```

#### Step 2: Add Rating API
```javascript
// backend/routes/courses.js
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const course = await Course.findById(req.params.id);
    
    // Check if user already rated
    const existingRating = course.ratings.find(
      r => r.user.toString() === req.user.id
    );
    
    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review;
    } else {
      course.ratings.push({
        user: req.user.id,
        rating,
        review
      });
    }
    
    // Calculate average rating
    const totalRating = course.ratings.reduce((sum, r) => sum + r.rating, 0);
    course.averageRating = totalRating / course.ratings.length;
    course.totalRatings = course.ratings.length;
    
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
```

#### Step 3: Add Rating Component
```javascript
// frontend/src/components/CourseRating.js
import React, { useState } from 'react';
import { Star } from 'lucide-react';

const CourseRating = ({ courseId, currentRating, onRate }) => {
  const [rating, setRating] = useState(currentRating || 0);
  const [hover, setHover] = useState(0);

  const handleRate = async (ratingValue) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating: ratingValue })
      });
      
      if (response.ok) {
        setRating(ratingValue);
        onRate && onRate(ratingValue);
      }
    } catch (error) {
      console.error('Error rating course:', error);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => handleRate(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none"
        >
          <Star
            className={`h-5 w-5 ${
              star <= (hover || rating)
                ? 'text-htb-green fill-current'
                : 'text-htb-gray'
            }`}
          />
        </button>
      ))}
      <span className="text-sm text-htb-gray ml-2">
        ({rating}/5)
      </span>
    </div>
  );
};

export default CourseRating;
```

### 5. Styling Changes

#### Modifying Colors
```css
/* frontend/src/index.css */
:root {
  /* Change primary colors */
  --htb-green: #00ff88;      /* Bright green */
  --htb-blue: #0099ff;       /* Bright blue */
  --htb-red: #ff3366;        /* Bright red */
  --htb-orange: #ff9900;     /* Bright orange */
  
  /* Change background colors */
  --htb-dark: #0a0a0a;       /* Darker background */
  --htb-darker: #1a1a1a;     /* Card backgrounds */
}
```

#### Adding New Component Styles
```css
/* Add custom styles */
.certificate-card {
  @apply htb-card p-6 border-l-4 border-htb-green;
  background: linear-gradient(135deg, var(--htb-darker) 0%, var(--htb-dark) 100%);
}

.rating-stars {
  @apply flex items-center space-x-1;
}

.rating-stars .star {
  @apply h-4 w-4 text-htb-gray cursor-pointer transition-colors;
}

.rating-stars .star.active {
  @apply text-htb-green;
}
```

## 🚀 Development Workflow

### 1. Making Changes
```bash
# 1. Make your changes to the code
# 2. Test locally

# Backend changes
cd cybersec-lms/backend
npm run dev

# Frontend changes  
cd cybersec-lms/frontend
npm start

# 3. Test the changes in browser
```

### 2. Database Changes
```bash
# If you modify models, you may need to:

# 1. Clear existing data
cd cybersec-lms/backend
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.dropDatabase();
"

# 2. Reseed with new structure
node seeds/seedDatabase.js
```

### 3. Adding Dependencies
```bash
# Backend dependencies
cd cybersec-lms/backend
npm install package-name

# Frontend dependencies
cd cybersec-lms/frontend
npm install package-name
```

## 🔍 Debugging Tips

### 1. Backe  nd Debugging
```javascript
// Add console.log statements
console.log('User data:', req.body);
console.log('Database result:', result);

// Use try-catch blocks
try {
  const result = await SomeOperation();
  console.log('Success:', result);
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ message: error.message });
}
```

### 2. Frontend Debugging
```javascript
// Use browser console
console.log('Component state:', state);
console.log('API response:', response);

// Use React DevTools
// Install React Developer Tools browser extension

// Check network tab for API calls
// F12 → Network → XHR/Fetch
```

### 3. Database Debugging
```javascript
// Check database connection
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

// Log database queries
mongoose.set('debug', true);
```

## 📝 Best Practices

### 1. Code Organization
- Keep components small and focused
- Use meaningful variable names
- Add comments for complex logic
- Follow consistent naming conventions

### 2. Error Handling
- Always use try-catch blocks
- Provide meaningful error messages
- Log errors for debugging
- Handle edge cases

### 3. Security
- Validate all user input
- Use authentication middleware
- Sanitize database queries
- Don't expose sensitive data

### 4. Performance
- Use database indexes
- Implement pagination for large datasets
- Optimize API calls
- Use React.memo for expensive components

## 🎯 Quick Reference

### Common File Locations
- **Models**: `backend/models/`
- **API Routes**: `backend/routes/`
- **React Pages**: `frontend/src/pages/`
- **Components**: `frontend/src/components/`
- **Styles**: `frontend/src/index.css`
- **Environment**: `.env`

### Useful Commands
```bash
# Start development servers
npm run dev          # Backend
npm start           # Frontend

# Install dependencies
npm install package-name

# Database operations
node seeds/seedDatabase.js    # Seed database
```

This guide covers the most common modifications you'll want to make. For specific changes, feel free to ask for detailed examples!