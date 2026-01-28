# 🔧 Render Deployment Fix

## Issue Identified
Error: `Cannot find module '/opt/render/project/src/server.js'`

## Root Cause
Render is looking for server.js in the wrong location. Our server file is in `backend/server.js`, not `src/server.js`.

## ✅ Solution

### Option 1: Update Render Dashboard Settings
In your Render service settings, change:

**Start Command**: `node backend/server.js`

### Option 2: Use Single Service Deployment
For a simpler setup, use these Render settings:

```
Name: cybersec-lms
Environment: Node
Build Command: npm install && cd frontend && npm install && npm run build
Start Command: node backend/server.js
Plan: Free
```

### Environment Variables to Set:
```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_EXPIRE=7d
PORT=5000
```

## 🚀 Quick Deploy Steps

1. **Go to your Render service**
2. **Click "Settings"**
3. **Update Start Command** to: `node backend/server.js`
4. **Add Environment Variables** (see above)
5. **Click "Manual Deploy"** to redeploy

## 📋 MongoDB Atlas Setup

1. Go to https://www.mongodb.com/atlas
2. Create free cluster
3. Create database user
4. Network Access → Add IP → Allow access from anywhere (0.0.0.0/0)
5. Get connection string and add to MONGODB_URI

## ✅ Expected Result

After fixing, you should see:
- ✅ Server running on port 5000
- ✅ Connected to MongoDB
- ✅ API endpoints working
- ✅ Frontend served from backend

## 🔍 Troubleshooting

If still having issues:
1. Check Render logs for specific errors
2. Verify all environment variables are set
3. Ensure MongoDB connection string is correct
4. Test locally with `npm start` first

Your app should be live at: `https://your-service-name.onrender.com`