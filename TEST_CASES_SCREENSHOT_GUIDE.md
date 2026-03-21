# 📸 TEST CASES SCREENSHOT GUIDE

## How to Capture Screenshots for All Test Cases

This guide provides step-by-step instructions for capturing screenshots for each test case in your Cybersecurity LMS project.

---

## 🎯 SCREENSHOT NAMING CONVENTION

Save screenshots as: `TC-XX_Description.png`

Example: `TC-01_User_Registration_Success.png`

---

## 📋 TEST CASE INSTRUCTIONS

### **TC-01: User Registration - Valid Details**
**Status:** ✅ Passed

**Steps to Capture:**
1. Open: http://localhost:3000/register
2. Fill in:
   - Name: "Test User"
   - Username: "testuser123"
   - Email: "testuser@example.com"
   - Password: "Test@123"
3. Click "Register"
4. **Screenshot 1:** Registration form filled
5. **Screenshot 2:** Success message/email verification page

**Expected Result:** User account created, confirmation message shown

---

### **TC-02: User Registration - Duplicate Email**
**Status:** ✅ Passed

**Steps to Capture:**
1. Open: http://localhost:3000/register
2. Try to register with existing email (e.g., admin@example.com)
3. Click "Register"
4. **Screenshot:** Error message "User already exists"

**Expected Result:** System rejects with "Email already exists" error

---

### **TC-03: User Login - Valid Credentials**
**Status:** ✅ Passed

**Steps to Capture:**
1. Open: http://localhost:3000/login
2. Enter:
   - Email: "student@example.com"
   - Password: "student123"
3. Click "Sign In"
4. **Screenshot 1:** Login form filled
5. **Screenshot 2:** Dashboard after successful login

**Expected Result:** User logged in, redirected to dashboard

---

### **TC-04: User Login - Invalid Credentials**
**Status:** ✅ Passed

**Steps to Capture:**
1. Open: http://localhost:3000/login
2. Enter:
   - Email: "student@example.com"
   - Password: "wrongpassword"
3. Click "Sign In"
4. **Screenshot:** Error message "Invalid credentials"

**Expected Result:** System displays error, denies access

---

### **TC-05: Course Enrollment**
**Status:** ✅ Passed

**Steps to Capture:**
1. Login as student
2. Go to: http://localhost:3000/courses
3. Click on any course
4. **Screenshot 1:** Course detail page with "Enroll" button
5. Click "Enroll"
6. **Screenshot 2:** Success message and "Start Learning" button
7. **Screenshot 3:** Dashboard showing enrolled course

**Expected Result:** Course added to enrolled list, progress at 0%

---

### **TC-06: Course Progress Tracking**
**Status:** ✅ Passed

**Steps to Capture:**
1. Login and open an enrolled course
2. Click on first lesson
3. **Screenshot 1:** Lesson viewer page
4. Scroll to bottom and click "Mark as Complete"
5. **Screenshot 2:** Success notification
6. **Screenshot 3:** Dashboard showing updated progress percentage

**Expected Result:** Lesson marked complete, progress % updated

---

### **TC-07: Quiz Assessment - Correct Answers**
**Status:** ✅ Passed

**Steps to Capture:**
1. Open a lesson with quiz
2. **Screenshot 1:** Quiz questions displayed
3. Select correct answers
4. Click "Submit Quiz"
5. **Screenshot 2:** Quiz results showing score
6. **Screenshot 3:** Progress updated in dashboard

**Expected Result:** Score calculated, results stored

---

### **TC-08: Quiz Assessment - Empty Submission**
**Status:** ✅ Passed

**Steps to Capture:**
1. Open a lesson with quiz
2. Don't select any answers
3. Click "Submit Quiz"
4. **Screenshot:** Validation error message

**Expected Result:** System rejects and prompts user

---

### **TC-09: Threat Map Visualization - Load Map**
**Status:** ✅ Passed

**Steps to Capture:**
1. Go to: http://localhost:3000/threat-map
2. Wait for map to load
3. **Screenshot 1:** Full threat map with attack paths
4. **Screenshot 2:** Live statistics panel
5. **Screenshot 3:** Threat list on the side

**Expected Result:** Map loads with real-time/simulated data

---

### **TC-10: Threat Map - Country Filter**
**Status:** ✅ Passed

**Steps to Capture:**
1. On threat map page
2. **Screenshot 1:** Filter dropdown
3. Select a country filter (e.g., "Malware")
4. **Screenshot 2:** Map updated with filtered data
5. **Screenshot 3:** Statistics showing filtered results

**Expected Result:** Map updates to show filtered threat data

---

### **TC-11: Cybersecurity Tools - Password Strength Tester**
**Status:** ✅ Passed

**Steps to Capture:**
1. Go to: http://localhost:3000/tools
2. Click "Interactive Tools" tab
3. Click "Launch Tool" on "Password Strength Analyzer"
4. **Screenshot 1:** Tool interface
5. Enter password: "12345"
6. **Screenshot 2:** Result showing "Weak password" with analysis

**Expected Result:** Output = "Weak password"

---

### **TC-12: Cybersecurity Tools - Vulnerability Scanner**
**Status:** ✅ Passed

**Steps to Capture:**
1. Go to: http://localhost:3000/tools
2. Click "Interactive Tools" tab
3. Click "Launch Tool" on "Vulnerability Scanner"
4. **Screenshot 1:** Scanner interface
5. Enter URL and click "Scan"
6. **Screenshot 2:** Scan results with vulnerabilities found

**Expected Result:** System analyzes and shows results

---

### **TC-13: Forum - Post New Discussion**
**Status:** ✅ Passed

**Steps to Capture:**
1. Open any enrolled course
2. Go to "Discussions" tab
3. **Screenshot 1:** Discussion forum interface
4. Click "New Discussion"
5. Enter title and message
6. **Screenshot 2:** Form filled
7. Click "Post"
8. **Screenshot 3:** Discussion thread created and visible

**Expected Result:** Discussion created, visible to all

---

### **TC-14: Forum - Post Reply**
**Status:** ✅ Passed

**Steps to Capture:**
1. Open existing discussion thread
2. **Screenshot 1:** Discussion with reply box
3. Enter reply message
4. Click "Reply"
5. **Screenshot 2:** Reply added under parent message

**Expected Result:** Reply added successfully

---

### **TC-15: Certificate Generation**
**Status:** ✅ Passed

**Steps to Capture:**
1. Complete ALL lessons in a course (100%)
2. **Screenshot 1:** Dashboard showing 100% completion
3. Go to: http://localhost:3000/certificates
4. **Screenshot 2:** Certificates page showing earned certificate
5. Click "View Certificate"
6. **Screenshot 3:** Full certificate with details
7. **Screenshot 4:** Download/Print options

**Expected Result:** Certificate generated and downloadable

---

### **TC-16: Security - SQL Injection Prevention**
**Status:** ✅ Passed

**Steps to Capture:**
1. Go to login page
2. **Screenshot 1:** Login form
3. Enter in email field: `admin' OR '1'='1`
4. Enter any password
5. Click "Sign In"
6. **Screenshot 2:** Login fails with "Invalid credentials"

**Expected Result:** Input sanitized, login fails

---

### **TC-17: Security - XSS Prevention**
**Status:** ✅ Passed

**Steps to Capture:**
1. Go to discussion forum
2. Try to post: `<script>alert('hack');</script>`
3. **Screenshot 1:** Message input with script
4. Submit post
5. **Screenshot 2:** Script blocked/escaped, shown as plain text

**Expected Result:** Script blocked, harmless text shown

---

### **TC-18: UI Responsiveness - Mobile View**
**Status:** ✅ Passed

**Steps to Capture:**
1. Open browser DevTools (F12)
2. Click "Toggle Device Toolbar" (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or similar
4. **Screenshot 1:** Login page on mobile
5. **Screenshot 2:** Dashboard on mobile
6. **Screenshot 3:** Course page on mobile
7. **Screenshot 4:** Hamburger menu expanded

**Expected Result:** Layout adjusts correctly, no broken UI

---

### **TC-19: Admin Panel - Create New Course**
**Status:** ✅ Passed

**Steps to Capture:**
1. Login as admin (admin@example.com / admin123)
2. Go to: http://localhost:3000/admin
3. **Screenshot 1:** Admin dashboard
4. Click "Create New Course"
5. **Screenshot 2:** Course creation form
6. Fill in all details (title, description, lessons)
7. Click "Save"
8. **Screenshot 3:** Success message
9. **Screenshot 4:** New course visible in courses list

**Expected Result:** Course added, visible to users

---

### **TC-20: Admin Panel - Delete User**
**Status:** ✅ Passed

**Steps to Capture:**
1. Login as admin
2. Go to admin dashboard
3. Navigate to "Users" section
4. **Screenshot 1:** User list
5. Click delete icon on a test user
6. **Screenshot 2:** Confirmation dialog
7. Confirm deletion
8. **Screenshot 3:** User removed from list
9. **Screenshot 4:** Success notification

**Expected Result:** User removed, data archived/deleted

---

## 📁 SCREENSHOT ORGANIZATION

Create folders for organizing screenshots:

```
screenshots/
├── TC-01_User_Registration/
│   ├── 01_registration_form.png
│   └── 02_success_message.png
├── TC-02_Duplicate_Email/
│   └── error_message.png
├── TC-03_Valid_Login/
│   ├── 01_login_form.png
│   └── 02_dashboard.png
├── TC-04_Invalid_Login/
│   └── error_message.png
├── TC-05_Course_Enrollment/
│   ├── 01_course_detail.png
│   ├── 02_enroll_success.png
│   └── 03_dashboard_enrolled.png
├── TC-06_Progress_Tracking/
│   ├── 01_lesson_viewer.png
│   ├── 02_mark_complete.png
│   └── 03_progress_updated.png
├── TC-07_Quiz_Correct/
│   ├── 01_quiz_questions.png
│   ├── 02_quiz_results.png
│   └── 03_progress_updated.png
├── TC-08_Quiz_Empty/
│   └── validation_error.png
├── TC-09_Threat_Map_Load/
│   ├── 01_full_map.png
│   ├── 02_statistics.png
│   └── 03_threat_list.png
├── TC-10_Threat_Map_Filter/
│   ├── 01_filter_dropdown.png
│   ├── 02_filtered_map.png
│   └── 03_filtered_stats.png
├── TC-11_Password_Tester/
│   ├── 01_tool_interface.png
│   └── 02_weak_password_result.png
├── TC-12_Vulnerability_Scanner/
│   ├── 01_scanner_interface.png
│   └── 02_scan_results.png
├── TC-13_Forum_New_Post/
│   ├── 01_forum_interface.png
│   ├── 02_new_post_form.png
│   └── 03_post_created.png
├── TC-14_Forum_Reply/
│   ├── 01_discussion_thread.png
│   └── 02_reply_added.png
├── TC-15_Certificate/
│   ├── 01_100_percent_complete.png
│   ├── 02_certificates_page.png
│   ├── 03_certificate_view.png
│   └── 04_download_options.png
├── TC-16_SQL_Injection/
│   ├── 01_injection_attempt.png
│   └── 02_login_failed.png
├── TC-17_XSS_Prevention/
│   ├── 01_script_input.png
│   └── 02_script_blocked.png
├── TC-18_Mobile_Responsive/
│   ├── 01_mobile_login.png
│   ├── 02_mobile_dashboard.png
│   ├── 03_mobile_courses.png
│   └── 04_mobile_menu.png
├── TC-19_Admin_Create_Course/
│   ├── 01_admin_dashboard.png
│   ├── 02_course_form.png
│   ├── 03_success_message.png
│   └── 04_course_in_list.png
└── TC-20_Admin_Delete_User/
    ├── 01_user_list.png
    ├── 02_confirmation_dialog.png
    ├── 03_user_removed.png
    └── 04_success_notification.png
```

---

## 🛠️ TOOLS FOR TAKING SCREENSHOTS

### **Windows:**
- **Snipping Tool** (Win + Shift + S)
- **Full Screenshot** (PrtScn)
- **Browser DevTools** (F12) for mobile view

### **Browser Extensions:**
- **Awesome Screenshot**
- **Nimbus Screenshot**
- **Full Page Screen Capture**

### **Tips:**
1. Use **high resolution** (1920x1080 or higher)
2. Capture **full page** when needed
3. **Highlight** important elements with arrows/boxes
4. **Annotate** with text if needed
5. Save in **PNG format** for quality

---

## 📊 TEST CASE SUMMARY TABLE

| Test Case | Module | Status | Screenshots Required |
|-----------|--------|--------|---------------------|
| TC-01 | User Registration | ✅ Passed | 2 |
| TC-02 | User Registration | ✅ Passed | 1 |
| TC-03 | Login/Auth | ✅ Passed | 2 |
| TC-04 | Login/Auth | ✅ Passed | 1 |
| TC-05 | Course Enrollment | ✅ Passed | 3 |
| TC-06 | Progress Tracking | ✅ Passed | 3 |
| TC-07 | Quiz Assessment | ✅ Passed | 3 |
| TC-08 | Quiz Assessment | ✅ Passed | 1 |
| TC-09 | Threat Map | ✅ Passed | 3 |
| TC-10 | Threat Map | ✅ Passed | 3 |
| TC-11 | Security Tools | ✅ Passed | 2 |
| TC-12 | Security Tools | ✅ Passed | 2 |
| TC-13 | Forum | ✅ Passed | 3 |
| TC-14 | Forum | ✅ Passed | 2 |
| TC-15 | Certificate | ✅ Passed | 4 |
| TC-16 | Security | ✅ Passed | 2 |
| TC-17 | Security | ✅ Passed | 2 |
| TC-18 | UI Responsive | ✅ Passed | 4 |
| TC-19 | Admin Panel | ✅ Passed | 4 |
| TC-20 | Admin Panel | ✅ Passed | 4 |

**Total Screenshots Needed:** ~50 screenshots

---

## 🎯 QUICK START CHECKLIST

- [ ] Create `screenshots/` folder
- [ ] Create subfolders for each test case
- [ ] Open project: http://localhost:3000
- [ ] Login with test accounts
- [ ] Follow each test case step-by-step
- [ ] Capture screenshots at each step
- [ ] Name files according to convention
- [ ] Verify all screenshots are clear and readable
- [ ] Create a summary document with all screenshots

---

## 📝 NOTES

1. **Test Accounts:**
   - Student: student@example.com / student123
   - Admin: admin@example.com / admin123

2. **Browser Recommendation:**
   - Use Chrome or Edge for best compatibility
   - Enable DevTools for mobile testing

3. **Screenshot Quality:**
   - Minimum resolution: 1920x1080
   - Format: PNG (better quality than JPG)
   - File size: Keep under 2MB per screenshot

4. **Documentation:**
   - Add captions to each screenshot
   - Highlight important UI elements
   - Include timestamp if needed

---

**Good luck with your testing documentation!** 🚀📸
