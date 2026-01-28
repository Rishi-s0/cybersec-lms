# Video Files for Cybersecurity LMS

## Download Instructions

Download these videos from YouTube and save them in this folder with the exact names specified:

### Lesson 1: What is Cybersecurity?
- **YouTube URL**: https://www.youtube.com/watch?v=inWWhr5tnEA
- **Save as**: `lesson1-cybersecurity-intro.mp4`
- **Topic**: Introduction to Cybersecurity fundamentals

### Lesson 2: Common Cyber Threats
- **YouTube URL**: https://www.youtube.com/watch?v=Dk-ZqQ-bfy4
- **Save as**: `lesson2-cyber-threats.mp4`
- **Topic**: Common cyber threats and attack vectors

## How to Download YouTube Videos

### Option 1: Using yt-dlp (Recommended)
```bash
# Install yt-dlp
pip install yt-dlp

# Download Lesson 1
yt-dlp -f "best[ext=mp4]" -o "lesson1-cybersecurity-intro.mp4" https://www.youtube.com/watch?v=inWWhr5tnEA

# Download Lesson 2
yt-dlp -f "best[ext=mp4]" -o "lesson2-cyber-threats.mp4" https://www.youtube.com/watch?v=Dk-ZqQ-bfy4
```

### Option 2: Using Online Downloader
1. Go to: https://y2mate.com or https://savefrom.net
2. Paste the YouTube URL
3. Select MP4 format (720p or 1080p recommended)
4. Download and rename to the exact filename above

### Option 3: Using Browser Extension
- Install "Video DownloadHelper" for Firefox/Chrome
- Navigate to the YouTube video
- Click the extension icon and download as MP4

## File Structure
After downloading, your folder should look like:
```
cybersec-lms/frontend/public/videos/
├── README.md (this file)
├── lesson1-cybersecurity-intro.mp4
└── lesson2-cyber-threats.mp4
```

## Important Notes
- Use MP4 format for best compatibility
- Recommended resolution: 720p or 1080p
- Keep file sizes reasonable (under 100MB if possible)
- Ensure videos are properly named (exact match required)

## After Downloading
Once you've downloaded and placed the videos in this folder, run the database update script to point lessons to these local videos instead of YouTube.
