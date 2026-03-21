# 🚀 QUICK TEST REFERENCE

## Test Accounts

**Student Account:**
- Email: `student@example.com`
- Password: `student123`

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`

---

## Quick URLs

| Feature | URL |
|---------|-----|
| Home | http://localhost:3000 |
| Login | http://localhost:3000/login |
| Register | http://localhost:3000/register |
| Dashboard | http://localhost:3000/dashboard |
| Courses | http://localhost:3000/courses |
| Tools | http://localhost:3000/tools |
| Threat Map | http://localhost:3000/threat-map |
| Labs | http://localhost:3000/labs |
| Certificates | http://localhost:3000/certificates |
| Admin Panel | http://localhost:3000/admin |

---

## Screenshot Shortcuts

**Windows:**
- `Win + Shift + S` - Snipping Tool
- `PrtScn` - Full screen
- `Alt + PrtScn` - Active window

**Browser:**
- `F12` - DevTools
- `Ctrl + Shift + M` - Mobile view toggle

---

## Test Data

**For Registration:**
```
Name: Test User
Username: testuser123
Email: testuser@example.com
Password: Test@123
```

**For SQL Injection Test:**
```
Email: admin' OR '1'='1
Password: anything
```

**For XSS Test:**
```
Message: <script>alert('hack');</script>
```

**For Password Strength Test:**
```
Weak: 12345
Medium: Test123
Strong: T3st@Pass#2024!
```

---

## Test Sequence

1. ✅ Register new user (TC-01, TC-02)
2. ✅ Login tests (TC-03, TC-04)
3. ✅ Enroll in course (TC-05)
4. ✅ Complete lesson (TC-06)
5. ✅ Take quiz (TC-07, TC-08)
6. ✅ Check threat map (TC-09, TC-10)
7. ✅ Test tools (TC-11, TC-12)
8. ✅ Forum tests (TC-13, TC-14)
9. ✅ Get certificate (TC-15)
10. ✅ Security tests (TC-16, TC-17)
11. ✅ Mobile responsive (TC-18)
12. ✅ Admin tests (TC-19, TC-20)

---

## Screenshot Naming

Format: `TC-XX_Description_Step.png`

Examples:
- `TC-01_Registration_Form.png`
- `TC-03_Login_Success.png`
- `TC-15_Certificate_View.png`

---

## Tips

1. **Clear browser cache** before starting
2. **Use incognito mode** for fresh tests
3. **Take screenshots immediately** after action
4. **Highlight important elements** with arrows
5. **Keep screenshots organized** in folders
