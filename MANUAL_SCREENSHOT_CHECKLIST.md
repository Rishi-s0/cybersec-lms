# ✅ MANUAL SCREENSHOT CHECKLIST

## Quick Guide: Take Screenshots in 30 Minutes

Your project is running at: **http://localhost:3000**

### 🔑 Test Accounts
- **Student:** student@example.com / student123
- **Admin:** admin@example.com / admin123

---

## 📸 Screenshot Instructions (Use Win + Shift + S)

### ✅ TC-01 & TC-02: Registration (5 min)
1. Go to http://localhost:3000/register
2. Fill form → Screenshot
3. Click Register → Screenshot success
4. Try again with student@example.com → Screenshot error

### ✅ TC-03 & TC-04: Login (3 min)
1. Go to http://localhost:3000/login
2. Login with student@example.com / student123 → Screenshot
3. Logout, try wrong password → Screenshot error

### ✅ TC-05 & TC-06: Enrollment & Progress (5 min)
1. Go to Courses → Click any course → Screenshot
2. Click Enroll → Screenshot
3. Click Start Learning → Open lesson → Screenshot
4. Click "Mark as Complete" → Screenshot
5. Go to Dashboard → Screenshot progress

### ✅ TC-07 & TC-08: Quiz (3 min)
1. Open lesson with quiz
2. Answer questions → Screenshot
3. Submit → Screenshot results
4. Try submitting empty → Screenshot error

### ✅ TC-09 & TC-10: Threat Map (3 min)
1. Go to Threat Map → Screenshot
2. Click filter → Screenshot filtered view

### ✅ TC-11 & TC-12: Tools (4 min)
1. Go to Tools → Interactive Tools tab
2. Launch Password Analyzer → Type "12345" → Screenshot
3. Launch Vulnerability Scanner → Screenshot

### ✅ TC-13 & TC-14: Forum (3 min)
1. Go to course → Discussions tab
2. Post new discussion → Screenshot
3. Reply to post → Screenshot

### ✅ TC-15: Certificate (2 min)
1. Complete all lessons in a course
2. Go to Certificates → Screenshot
3. Click View → Screenshot certificate

### ✅ TC-16 & TC-17: Security (2 min)
1. Login page → Try `admin' OR '1'='1` → Screenshot error
2. Forum → Try `<script>alert('xss')</script>` → Screenshot blocked

### ✅ TC-18: Mobile (3 min)
1. Press F12 → Click mobile icon (Ctrl+Shift+M)
2. Screenshot login, dashboard, courses, menu

### ✅ TC-19 & TC-20: Admin (5 min)
1. Login as admin@example.com / admin123
2. Go to Admin panel → Screenshot
3. Click Create Course → Screenshot form
4. Go to Users → Screenshot user list

---

## 📁 Save Screenshots As:

```
screenshots/
├── TC-01_registration.png
├── TC-02_duplicate_error.png
├── TC-03_login_success.png
├── TC-04_login_error.png
├── TC-05_enrollment.png
├── TC-06_progress.png
├── TC-07_quiz_results.png
├── TC-08_quiz_error.png
├── TC-09_threat_map.png
├── TC-10_threat_filter.png
├── TC-11_password_test.png
├── TC-12_vuln_scanner.png
├── TC-13_forum_post.png
├── TC-14_forum_reply.png
├── TC-15_certificate.png
├── TC-16_sql_injection.png
├── TC-17_xss_blocked.png
├── TC-18_mobile_view.png
├── TC-19_admin_panel.png
└── TC-20_user_management.png
```

---

## ⚡ Pro Tips:
1. Use **Win + Shift + S** for quick screenshots
2. Save directly to `screenshots` folder
3. Name files as you go
4. Takes only **30-40 minutes** total!

**Your project is already running - just start taking screenshots!** 🚀
