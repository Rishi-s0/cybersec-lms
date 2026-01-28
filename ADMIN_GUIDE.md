# Admin Guide - Course Management

## Publishing Courses

### Why Your Course Isn't Showing

When you create a course in the admin panel, it's created with `isPublished: false` by default. The public Courses page only shows courses where `isPublished: true`.

### How to Publish a Course

The course needs the `isPublished` field set to `true` in the database. Currently, you can do this via:

1. **MongoDB directly** - Update the course document
2. **API call** - Use the admin API to update the course

### Quick Fix - Publish via MongoDB

```javascript
// In MongoDB, run:
db.courses.updateOne(
  { title: "Your Course Title" },
  { $set: { isPublished: true } }
)
```

---

## Adding Videos to Courses

### Current System: Video URLs (Not File Uploads)

The LMS uses **video URLs**, not file uploads. There are two ways to add videos:

### Option 1: Local Videos (Recommended)

1. **Place video file** in `frontend/public/videos/`
   - Example: `frontend/public/videos/my-lesson.mp4`

2. **Set videoUrl** in the lesson:
   ```
   /videos/my-lesson.mp4
   ```

3. **Video formats supported:**
   - MP4 (recommended)
   - WebM
   - OGG

### Option 2: External Video URLs

Use videos hosted elsewhere:
- YouTube: `https://www.youtube.com/embed/VIDEO_ID`
- Vimeo: `https://player.vimeo.com/video/VIDEO_ID`
- Direct URL: `https://example.com/video.mp4`

---

## Course Structure

Each course has:
- **Title** - Course name
- **Description** - Course overview
- **Category** - Type of course
- **Difficulty** - beginner/intermediate/advanced
- **isPublished** - Must be `true` to show publicly
- **Lessons** - Array of lesson objects
  - Each lesson has:
    - `title` - Lesson name
    - `content` - Lesson text/markdown
    - `videoUrl` - Path to video
    - `duration` - Length in minutes
    - `order` - Display order

---

## Admin API Endpoints

### Publish a Course
```http
PUT /api/admin/courses/:courseId/publish
Authorization: Bearer <admin_token>
```

### Update Course
```http
PUT /api/courses/:courseId
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isPublished": true,
  "lessons": [
    {
      "title": "Lesson 1",
      "content": "Lesson content...",
      "videoUrl": "/videos/lesson1.mp4",
      "duration": 15,
      "order": 1
    }
  ]
}
```

---

## Quick Steps to Make Your Course Visible

1. **Create course** in admin panel
2. **Add lessons** with content and video URLs
3. **Publish course** - Set `isPublished: true`
4. **Verify** - Check `/courses` page as a regular user

---

## Video Upload Feature (Future Enhancement)

To add file upload functionality, you would need to:

1. Add multer middleware for file uploads
2. Create upload endpoint in backend
3. Store videos in `frontend/public/videos/`
4. Return video URL to frontend
5. Update lesson with video URL

This is not currently implemented but can be added if needed.

---

## Troubleshooting

### Course not showing on Courses page
- ✅ Check `isPublished` is `true`
- ✅ Check course has at least one lesson
- ✅ Refresh the page (Ctrl+F5)

### Video not playing
- ✅ Check video file is in `frontend/public/videos/`
- ✅ Check videoUrl path is correct (starts with `/videos/`)
- ✅ Check video format is MP4
- ✅ Check file size (large files may be slow)

### Can't access admin panel
- ✅ Make sure you're logged in as admin
- ✅ Check user role is `'admin'` in database
- ✅ Go to `/admin` route

---

## Example: Complete Course Setup

```javascript
{
  "title": "Web Security Fundamentals",
  "description": "Learn web security basics",
  "category": "Web Security",
  "difficulty": "beginner",
  "isPublished": true,  // ← Important!
  "estimatedDuration": 10,
  "lessons": [
    {
      "lessonId": "lesson-1",
      "title": "Introduction to Web Security",
      "content": "# Web Security\n\nLearn about...",
      "videoUrl": "/videos/web-security-intro.mp4",  // ← Video path
      "duration": 15,
      "order": 1
    },
    {
      "lessonId": "lesson-2",
      "title": "Common Vulnerabilities",
      "content": "# Vulnerabilities\n\nXSS, SQL Injection...",
      "videoUrl": "/videos/web-vulnerabilities.mp4",
      "duration": 20,
      "order": 2
    }
  ]
}
```

---

Need help? Check the main README.md or DEVELOPMENT_GUIDE.md
