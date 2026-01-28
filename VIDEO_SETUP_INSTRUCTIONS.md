# 🎥 Local Video Setup Instructions

## Step 1: Download Videos

Download these 2 videos from YouTube:

### Video 1: What is Cybersecurity?
- **URL**: https://www.youtube.com/watch?v=inWWhr5tnEA
- **Save as**: `lesson1-cybersecurity-intro.mp4`
- **Location**: `cybersec-lms/frontend/public/videos/`

### Video 2: Common Cyber Threats  
- **URL**: https://www.youtube.com/watch?v=Dk-ZqQ-bfy4
- **Save as**: `lesson2-cyber-threats.mp4`
- **Location**: `cybersec-lms/frontend/public/videos/`

## Step 2: Download Method

### Quick Method (Online Downloader):
1. Go to: **https://y2mate.com** or **https://savefrom.net**
2. Paste the YouTube URL
3. Select **MP4 format** (720p recommended)
4. Download the file
5. Rename it to the exact name above
6. Move it to `cybersec-lms/frontend/public/videos/` folder

### Command Line Method (yt-dlp):
```bash
# Install yt-dlp
pip install yt-dlp

# Navigate to videos folder
cd cybersec-lms/frontend/public/videos

# Download Lesson 1
yt-dlp -f "best[ext=mp4]" -o "lesson1-cybersecurity-intro.mp4" https://www.youtube.com/watch?v=inWWhr5tnEA

# Download Lesson 2
yt-dlp -f "best[ext=mp4]" -o "lesson2-cyber-threats.mp4" https://www.youtube.com/watch?v=Dk-ZqQ-bfy4
```

## Step 3: Verify Files

Your folder structure should look like:
```
cybersec-lms/frontend/public/videos/
├── README.md
├── lesson1-cybersecurity-intro.mp4  ← You download this
└── lesson2-cyber-threats.mp4        ← You download this
```

## Step 4: Update Database

After downloading the videos, run this command to update the database:

```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/local/use-local-videos" -Method POST
```

You should see:
```json
{
  "message": "Video URLs updated to use local files!",
  "lessons": [
    {"title": "What is Cybersecurity?", "videoUrl": "/videos/lesson1-cybersecurity-intro.mp4"},
    {"title": "Common Cyber Threats", "videoUrl": "/videos/lesson2-cyber-threats.mp4"}
  ]
}
```

## Step 5: Test

1. Refresh your browser
2. Go to any lesson
3. Video should play from local file
4. Progress bar should track automatically! ✅

## Benefits of Local Videos

✅ **Real progress tracking** - No CORS issues
✅ **No YouTube restrictions** - Full control
✅ **Better performance** - Faster loading
✅ **Privacy** - No external tracking
✅ **Reliability** - Videos won't be removed

## Troubleshooting

**Video not playing?**
- Check file names match exactly (case-sensitive)
- Ensure files are in MP4 format
- Verify files are in the correct folder
- Check file isn't corrupted (try playing in VLC)

**Progress bar not working?**
- Local videos use HTML5 `<video>` tag
- Progress tracking works automatically
- No timer needed - real-time tracking!

## Current Status

- ✅ Folder created: `cybersec-lms/frontend/public/videos/`
- ✅ Database update script ready
- ⏳ **Waiting for you to download the 2 videos**
- ⏳ Then run the database update command

Once you complete these steps, video progress tracking will work perfectly! 🎓
