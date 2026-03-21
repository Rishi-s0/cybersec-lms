# 📸 SCREENSHOT GUIDE - ALL 20 TEST CASES (2 Screenshots Each)

## 🎯 Quick Setup
- **Frontend URL:** http://localhost:3000
- **Test Student Account:** student@example.com / student123
- **Test Admin Account:** admin@example.com / admin123
- **Screenshot Tool:** Windows Snipping Tool (Win + Shift + S)
- **Total Screenshots:** 40 images (2 per test case)
- **Estimated Time:** 25-30 minutes

---

## 📋 TEST CASE SCREENSHOTS

### ✅ TC-01: User Registration - Valid Details

**Steps:**
1. Navigate to: `http://localhost:3000/register`
2. Fill in: Username: `testuser123`, Email: `testuser123@example.com`, Password: `password123`
3. Click "Register"

**Screenshots (2):**
- **TC01_1_form.png** - Registration form filled with data
- **TC01_2_success.png** - Success message "Please check your email for verification code"

---

### ✅ TC-02: Duplicate Email Registration

**Steps:**
1. Navigate to: `http://localhost:3000/register`
2. Fill in: Username: `newuser456`, Email: `student@example.com` (existing), Password: `password123`
3. Click "Register"

**Screenshots (2):**
- **TC02_1_form.png** - Form with existing email
- **TC02_2_error.png** - Error message "User already exists"

---

### ✅ TC-03: Valid Login Credentials

**Steps:**
1. Navigate to: `http://localhost:3000/login`
2. Fill in: Email: `student@example.com`, Password: `student123`
3. Click "Login"

**Screenshots (2):**
- **TC03_1_form.png** - Login form filled
- **TC03_2_dashboard.png** - Dashboard after successful login

---

### ✅ TC-04: Invalid Login Attempt

**Steps:**
1. Navigate to: `http://localhost:3000/login`
2. Fill in: Email: `student@example.com`, Password: `wrongpassword123`
3. Click "Login"

**Screenshots (2):**
- **TC04_1_form.png** - Form with wrong password
- **TC04_2_error.png** - Error "Invalid credentials"

---

### ✅ TC-05: Course Enrollment

**Prerequisites:** Login as student

**Steps:**
1. Navigate to: `http://localhost:3000/courses`
2. Click any course → Click "Enroll Now"

**Screenshots (2):**
- **TC05_1_details.png** - Course detail with "Enroll Now" button
- **TC05_2_enrolled.png** - Dashboard showing enrolled course at 0% progress

---

### ✅ TC-06: Course Progress Tracking

**Prerequisites:** Enrolled in a course

**Steps:**
1. Open any lesson → Scroll to bottom
2. Click "Mark as Complete"

**Screenshots (2):**
- **TC06_1_lesson.png** - Lesson with "Mark as Complete" button
- **TC06_2_progress.png** - Dashboard showing updated progress % (e.g., 20%)

---

### ✅ TC-07: Quiz Assessment - Correct Answers

**Prerequisites:** Access lesson with quiz

**Steps:**
1. Answer all questions correctly
2. Click "Submit Quiz"

**Screenshots (2):**
- **TC07_1_quiz.png** - Quiz with answers selected
- **TC07_2_results.png** - Results showing score (e.g., "100%", "Quiz Passed!")

---

### ✅ TC-08: Quiz Assessment - Empty Submission

**Prerequisites:** Access lesson with quiz

**Steps:**
1. Don't select any answers
2. Click "Submit Quiz"

**Screenshots (2):**
- **TC08_1_empty.png** - Quiz with no answers selected
- **TC08_2_error.png** - Error "Please answer all questions"

---

### ✅ TC-09: Threat Map Visualization

**Steps:**
1. Navigate to: `http://localhost:3000/threat-map`
2. Wait for map to load

**Screenshots (2):**
- **TC09_1_map.png** - Full page with interactive map and threat markers
- **TC09_2_stats.png** - Statistics panel showing threat counts

---

### ✅ TC-10: Threat Map - Apply Filter

**Steps:**
1. On threat map page
2. Select filter (e.g., "Malware")

**Screenshots (2):**
- **TC10_1_filter.png** - Filter dropdown with selection
- **TC10_2_filtered.png** - Map showing only filtered threats

---

### ✅ TC-11: Password Strength Tester

**Steps:**
1. Navigate to: `http://localhost:3000/tools`
2. Click "Interactive Tools" → "Password Strength Analyzer"
3. Test password: `12345`

**Screenshots (2):**
- **TC11_1_input.png** - Tool with password "12345" entered
- **TC11_2_result.png** - Result showing "Weak" with red indicator

---

### ✅ TC-12: Vulnerability Scanner

**Steps:**
1. Navigate to: `http://localhost:3000/tools`
2. Click "Vulnerability Scanner"
3. Enter URL: `https://example.com`, Select "OWASP Top 10", Click "Start Scan"

**Screenshots (2):**
- **TC12_1_scan.png** - Scanner form with URL entered
- **TC12_2_results.png** - Scan results showing vulnerabilities found

---

### ✅ TC-13: Forum - Post New Discussion

**Prerequisites:** Enrolled in course

**Steps:**
1. Go to course → "Discussion" tab
2. Create post: Title: `Need help`, Content: `Question about encryption`

**Screenshots (2):**
- **TC13_1_form.png** - New discussion form filled
- **TC13_2_posted.png** - Post visible in forum list

---

### ✅ TC-14: Forum - Post Reply

**Prerequisites:** Existing discussion available

**Steps:**
1. Click on discussion thread
2. Enter reply: `Here's the answer...`
3. Click "Reply"

**Screenshots (2):**
- **TC14_1_thread.png** - Discussion thread with reply form
- **TC14_2_reply.png** - Reply posted and visible under parent message

---

### ✅ TC-15: Certificate Generation

**Prerequisites:** Complete 100% of a course (all lessons + quizzes)

**Steps:**
1. Complete all lessons and quizzes
2. Navigate to: `http://localhost:3000/certificates`

**Screenshots (2):**
- **TC15_1_complete.png** - Dashboard showing 100% course completion
- **TC15_2_certificate.png** - Certificates page with generated certificate and download button

---

### ✅ TC-16: Security - SQL Injection Prevention

**Steps:**
1. Navigate to: `http://localhost:3000/login`
2. Email: `admin' OR '1'='1`, Password: `anything`
3. Click "Login"

**Screenshots (2):**
- **TC16_1_attempt.png** - Form with SQL injection string
- **TC16_2_failed.png** - Error "Invalid credentials" (login failed)

---

### ✅ TC-17: Security - XSS Prevention

**Prerequisites:** Access forum

**Steps:**
1. Create post with content: `<script>alert('XSS');</script>`
2. Submit and view post

**Screenshots (2):**
- **TC17_1_input.png** - Form with XSS script entered
- **TC17_2_escaped.png** - Post showing script as plain text (not executed)

---

### ✅ TC-18: UI Responsiveness - Mobile View

**Steps:**
1. Press F12 → Toggle Device Toolbar (Ctrl + Shift + M)
2. Select "iPhone 12 Pro"
3. Navigate to login and dashboard

**Screenshots (2):**
- **TC18_1_mobile_login.png** - Login page in mobile view
- **TC18_2_mobile_dashboard.png** - Dashboard in mobile view (responsive layout)

---

### ✅ TC-19: Admin Panel - Create New Course

**Prerequisites:** Login as admin

**Steps:**
1. Navigate to: `http://localhost:3000/admin`
2. Click "Create Course"
3. Fill form: Title: `Test Course`, Category: `Beginner`, etc.
4. Click "Save"

**Screenshots (2):**
- **TC19_1_form.png** - Course creation form filled
- **TC19_2_created.png** - Success message or course visible in list

---

### ✅ TC-20: Admin Panel - Delete User

**Prerequisites:** Login as admin

**Steps:**
1. Navigate to: `http://localhost:3000/admin`
2. Go to "Users" tab
3. Click "Delete" on a test user → Confirm

**Screenshots (2):**
- **TC20_1_users.png** - User list with delete button
- **TC20_2_deleted.png** - Success message or user removed from list

---

## 📁 FOLDER STRUCTURE (Simplified - 2 Screenshots Each)

```
screenshots/
├── TC01_1_form.png
├── TC01_2_success.png
├── TC02_1_form.png
├── TC02_2_error.png
├── TC03_1_form.png
├── TC03_2_dashboard.png
├── TC04_1_form.png
├── TC04_2_error.png
├── TC05_1_details.png
├── TC05_2_enrolled.png
├── TC06_1_lesson.png
├── TC06_2_progress.png
├── TC07_1_quiz.png
├── TC07_2_results.png
├── TC08_1_empty.png
├── TC08_2_error.png
├── TC09_1_map.png
├── TC09_2_stats.png
├── TC10_1_filter.png
├── TC10_2_filtered.png
├── TC11_1_input.png
├── TC11_2_result.png
├── TC12_1_scan.png
├── TC12_2_results.png
├── TC13_1_form.png
├── TC13_2_posted.png
├── TC14_1_thread.png
├── TC14_2_reply.png
├── TC15_1_complete.png
├── TC15_2_certificate.png
├── TC16_1_attempt.png
├── TC16_2_failed.png
├── TC17_1_input.png
├── TC17_2_escaped.png
├── TC18_1_mobile_login.png
├── TC18_2_mobile_dashboard.png
├── TC19_1_form.png
├── TC19_2_created.png
├── TC20_1_users.png
└── TC20_2_deleted.png
```

---

## ⏱️ ESTIMATED TIME

- **Total Screenshots:** 40 images (2 per test case)
- **Estimated Time:** 25-30 minutes
- **Per Test Case:** 1-2 minutes

---

## 💡 TIPS

1. **Use Windows Snipping Tool:** Win + Shift + S for quick screenshots
2. **Full Page Screenshots:** Use browser extensions like "Full Page Screen Capture"
3. **Clear Browser Cache:** Before starting to ensure clean UI
4. **Zoom Level:** Keep browser at 100% zoom for consistent screenshots
5. **Hide Personal Info:** Make sure no personal data is visible
6. **Good Lighting:** Ensure screenshots are clear and readable
7. **Consistent Window Size:** Keep browser window at same size for all screenshots
8. **Name Files Correctly:** Follow the naming convention exactly for easy organization

---

## 🚀 QUICK START CHECKLIST

- [ ] Start project: `npm run dev`
- [ ] Create `screenshots/` folder with subfolders
- [ ] Open browser at http://localhost:3000
- [ ] Have test accounts ready (student@example.com, admin@example.com)
- [ ] Open Snipping Tool (Win + Shift + S)
- [ ] Follow test cases in order
- [ ] Save screenshots with correct names
- [ ] Verify all screenshots are clear and readable

---

**Good luck with your documentation! 📸✨**
