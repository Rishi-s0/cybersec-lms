# Cybersecurity Learning Management System (MERN Stack)

A comprehensive learning management system built specifically for cybersecurity education using the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

### 🔐 Authentication & Authorization
- User registration and login
- JWT-based authentication
- Role-based access control (Student, Admin)
  - **Students**: Register publicly via website
  - **Admins**: Created manually for security
- Secure password hashing

### 📚 Course Management
- Browse courses by category and difficulty
- Detailed course information with prerequisites
- Lesson-based course structure
- Progress tracking and completion certificates
- Interactive quizzes and practical exercises

### 👤 User Dashboard
- Personal learning dashboard
- Course progress visualization
- Achievement tracking
- Profile management

### 🎯 Cybersecurity Focus
- Specialized categories: Network Security, Web Security, Cryptography, Ethical Hacking, etc.
- Industry-relevant content structure
- Practical lab exercises
- Security awareness training

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **React Query** - Data fetching and caching
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cybersec-lms
   ```

2. **Install dependencies**
   ```bash
   npm run install-deps
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/cybersec-lms
   JWT_SECRET=your_secure_jwt_secret
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode (runs both frontend and backend)
   npm run dev
   
   # Or run separately:
   # Backend only
   npm run server
   
   # Frontend only (in another terminal)
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - Get all courses (with filters)
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:id/enroll` - Enroll in course
- `POST /api/courses` - Create course (admin only)

### Progress
- `GET /api/progress/course/:courseId` - Get course progress
- `POST /api/progress/lesson/:courseId/:lessonId/complete` - Mark lesson complete
- `GET /api/progress/dashboard` - Get dashboard data

### Users
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/courses` - Get user's courses

## Project Structure

```
cybersec-lms/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── server.js        # Express server setup
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   └── App.js       # Main app component
│   └── public/          # Static files
└── package.json         # Root package.json
```

## Course Categories

The system supports the following cybersecurity domains:
- Network Security
- Web Security
- Cryptography
- Ethical Hacking
- Incident Response
- Risk Management
- Compliance
- Malware Analysis
- Digital Forensics
- Security Awareness

## User Roles

### Student
- Browse and enroll in courses
- Track learning progress
- Complete lessons and quizzes
- Earn certificates

### Admin
- Create and manage courses
- Add lessons and content
- Manage users and system

**Note**: Admin accounts cannot be created through public registration for security reasons. Admins must be created via:
- Database seeding (`npm run seed`)
- Existing admin via admin panel
- Command line: `node backend/scripts/dbOperations.js create-admin <username> <email> <password>`
- Monitor student progress

### Admin
- Full system access
- User management
- Course approval and management

## Development

### Adding New Features
1. Backend: Add routes in `/backend/routes/`
2. Frontend: Add components in `/frontend/src/`
3. Update models if database changes are needed

### Database Schema
- **Users**: Authentication, profiles, enrolled courses
- **Courses**: Course content, lessons, metadata
- **Progress**: User progress tracking, completion status

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.