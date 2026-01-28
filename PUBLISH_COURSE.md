# How to Publish Your Course

## Quick Fix: Publish via API

Since you've already created a course in the admin panel, here's how to publish it:

### Method 1: Using Browser Console (Easiest)

1. **Login as admin** at http://localhost:3000/login
2. **Open browser console** (F12 → Console tab)
3. **Run this code** (replace `COURSE_ID` with your actual course ID):

```javascript
// Get your auth token
const token = localStorage.getItem('token');

// Replace 'COURSE_ID' with your actual course ID
const courseId = 'COURSE_ID';  // ← Change this!

// Publish the course
fetch(`http://localhost:5000/api/admin/courses/${courseId}/publish`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ isPublished: true })
})
.then(res => res.json())
.then(data => console.log('✅ Course published!', data))
.catch(err => console.error('❌ Error:', err));
```

### Method 2: Publish ALL Courses at Once

If you want to publish all courses in your database:

```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:5000/api/admin/database/query', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    collection: 'courses',
    operation: 'update',
    query: {},  // All courses
    update: { $set: { isPublished: true } }
  })
})
.then(res => res.json())
.then(data => console.log('✅ All courses published!', data))
.catch(err => console.error('❌ Error:', err));
```

### Method 3: Using PowerShell/CMD

```powershell
# Get your course ID first
curl http://localhost:5000/api/courses

# Then publish it (replace TOKEN and COURSE_ID)
$token = "YOUR_AUTH_TOKEN"
$courseId = "YOUR_COURSE_ID"

Invoke-WebRequest -Uri "http://localhost:5000/api/admin/courses/$courseId/publish" `
  -Method PUT `
  -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
  } `
  -Body '{"isPublished":true}'
```

---

## How to Find Your Course ID

### Option 1: Browser Console
```javascript
fetch('http://localhost:5000/api/admin/courses')
  .then(res => res.json())
  .then(courses => {
    console.table(courses.map(c => ({
      id: c._id,
      title: c.title,
      published: c.isPublished
    })));
  });
```

### Option 2: Check MongoDB
```javascript
// In MongoDB Compass or shell
db.courses.find({}, { title: 1, isPublished: 1 })
```

---

## Adding Videos to Your Course

### Step 1: Place Video Files

Put your video files in:
```
cybersec-lms/frontend/public/videos/
```

Example:
```
cybersec-lms/frontend/public/videos/
  ├── my-course-lesson1.mp4
  ├── my-course-lesson2.mp4
  └── my-course-lesson3.mp4
```

### Step 2: Update Lesson Video URLs

When creating/editing lessons in admin panel, set the videoUrl to:
```
/videos/my-course-lesson1.mp4
```

**Important:** The path must start with `/videos/` (not `./videos/` or `videos/`)

---

## Complete Example

Let's say you created a course called "Advanced Hacking":

1. **Find the course ID:**
```javascript
fetch('http://localhost:5000/api/admin/courses')
  .then(res => res.json())
  .then(courses => {
    const myCourse = courses.find(c => c.title === 'Advanced Hacking');
    console.log('Course ID:', myCourse._id);
  });
```

2. **Publish it:**
```javascript
const token = localStorage.getItem('token');
const courseId = 'PASTE_ID_HERE';

fetch(`http://localhost:5000/api/admin/courses/${courseId}/publish`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ isPublished: true })
})
.then(res => res.json())
.then(data => console.log('Published!', data));
```

3. **Verify it's visible:**
   - Go to http://localhost:3000/courses
   - Your course should now appear!

---

## Troubleshooting

### "Course not found" error
- Check the course ID is correct
- Make sure you're logged in as admin

### "Admin access required" error
- Your user role must be 'admin'
- Check in MongoDB: `db.users.findOne({ email: 'your@email.com' })`
- Update if needed: `db.users.updateOne({ email: 'your@email.com' }, { $set: { role: 'admin' } })`

### Course still not showing
- Hard refresh the page (Ctrl+F5)
- Check browser console for errors
- Verify `isPublished: true` in database

### Videos not playing
- Check video file is in `frontend/public/videos/`
- Check videoUrl starts with `/videos/`
- Check video format is MP4
- Try a smaller video file first (< 50MB)

---

## Quick Test

After publishing, test with:

```javascript
// Should show your course
fetch('http://localhost:3000/api/courses')
  .then(res => res.json())
  .then(courses => console.log('Published courses:', courses));
```

---

Need more help? Check ADMIN_GUIDE.md for detailed information!
