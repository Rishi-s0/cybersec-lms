# 🚀 Cybersec LMS - Quick Start Guide

## ✅ Project is Running!

### 🌐 Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### 🔐 Login Credentials

#### Student Account (Public Registration Available)
- **Email**: `student@hackademy.com`
- **Password**: `password123`
- *Note: Anyone can register as a student via the website*

#### Admin Account (Manual Creation Only)
- **Email**: `admin@hackademy.com`
- **Password**: `password123`
- *Note: Admin accounts cannot be created through public registration for security*

### 📚 Available Courses
1. **Introduction to Cybersecurity** (Beginner)
   - 3 lessons covering fundamentals
   - Quizzes and practical exercises

2. **Network Security Fundamentals** (Intermediate)
   - Network architecture and firewalls
   - IDS and monitoring

3. **Ethical Hacking and Penetration Testing** (Advanced)
   - Professional pentesting methodologies
   - Security tools and reporting

### 🎯 What to Test

1. **Login**: Use any of the credentials above
2. **Browse Courses**: Navigate to the Courses page
3. **Enroll**: Click on a course and enroll
4. **Dashboard**: View your enrolled courses
5. **Course Content**: Access lessons and quizzes
6. **Profile**: Update your profile information
7. **Labs**: Try the interactive security labs
8. **Threat Map**: View real-time threat intelligence
9. **Tools**: Access security tools and utilities

### 🔧 If You See Errors

**"jwt expired" or "Token is not valid"**
- Simply logout and login again
- Or clear browser localStorage: `localStorage.clear()` in console

**"No courses displayed"**
- Courses are already seeded in the database
- Refresh the page
- Check browser console for errors

### 📝 Notes
- All data is stored in MongoDB Atlas (cloud)
- Authentication uses real JWT tokens
- No mock data - everything is real!

### 🛑 Stop the Project
Press `Ctrl+C` in the terminal or stop the process

### 🔄 Restart the Project
```bash
npm run dev
```

---
**Enjoy exploring the Cybersecurity Learning Management System!** 🎓🔒
