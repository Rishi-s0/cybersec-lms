# 🚀 Deployment Guide - CyberSec LMS

## 🌐 Deploy to Render (Recommended)

Render offers free hosting for public repositories and is perfect for full-stack applications.

### Prerequisites
- ✅ Public GitHub repository
- ✅ MongoDB Atlas account (free tier available)

### Step-by-Step Deployment

#### 1. **Prepare MongoDB Atlas**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0) for Render
5. Get your connection string

#### 2. **Deploy Backend on Render**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `cybersec-lms-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secure_jwt_secret_here
   JWT_EXPIRE=7d
   ```

#### 3. **Deploy Frontend on Render**
1. Create another **"Static Site"**
2. Configure:
   - **Name**: `cybersec-lms-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`

3. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```

#### 4. **Seed Database**
After deployment, seed your database:
1. Go to your backend service on Render
2. Open the **Shell** tab
3. Run: `npm run seed`

### 🔧 Alternative: Single Service Deployment

You can also deploy as a single service (backend serves frontend):

1. **Web Service Configuration**:
   - **Build Command**: `npm install && cd frontend && npm install && npm run build`
   - **Start Command**: `npm start`

2. **Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secure_jwt_secret_here
   JWT_EXPIRE=7d
   ```

## 🌐 Deploy to Vercel (Frontend) + Railway (Backend)

### Frontend on Vercel
1. Connect GitHub repo to Vercel
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/build`

### Backend on Railway
1. Connect GitHub repo to Railway
2. Set start command: `npm start`
3. Add environment variables

## 🌐 Deploy to Heroku

### Single Dyno Deployment
1. Install Heroku CLI
2. Create Heroku app: `heroku create cybersec-lms`
3. Add MongoDB addon: `heroku addons:create mongolab:sandbox`
4. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_jwt_secret
   ```
5. Deploy: `git push heroku main`

## 🔒 Environment Variables Reference

### Required Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cybersec_lms
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
JWT_EXPIRE=7d
PORT=5000
```

### Optional Variables
```env
# OAuth (if using social login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Email Service (if using email features)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# External APIs (for threat map)
OTX_API_KEY=your_otx_api_key
VIRUSTOTAL_API_KEY=your_virustotal_api_key
```

## 🧪 Testing Deployment

### Health Check Endpoints
- Backend: `https://your-backend-url.onrender.com/api/health`
- Frontend: `https://your-frontend-url.onrender.com`

### Test Accounts
```
Student: student@hackademy.com / password123
Admin: admin@hackademy.com / password123
```

## 🚨 Common Issues & Solutions

### 1. **Build Failures**
- Ensure all dependencies are in `package.json`
- Check Node.js version compatibility
- Verify build commands are correct

### 2. **Database Connection Issues**
- Whitelist all IPs (0.0.0.0/0) in MongoDB Atlas
- Check connection string format
- Ensure database user has proper permissions

### 3. **Environment Variables**
- Double-check all required variables are set
- Ensure JWT_SECRET is at least 32 characters
- Verify MongoDB URI format

### 4. **CORS Issues**
- Update CORS configuration for production domains
- Check API URL in frontend environment variables

## 📊 Performance Optimization

### For Production
1. **Enable compression** in Express
2. **Use CDN** for static assets
3. **Implement caching** for API responses
4. **Optimize database queries** with indexes
5. **Use environment-specific configs**

## 🔄 Continuous Deployment

### Auto-Deploy Setup
1. Connect GitHub repository to Render
2. Enable **Auto-Deploy** from main branch
3. Every push to main will trigger deployment

### Manual Deploy
```bash
# Push to GitHub
git add .
git commit -m "Update for deployment"
git push origin main

# Render will automatically deploy
```

## 📈 Monitoring & Logs

### Render Monitoring
- View logs in Render dashboard
- Monitor resource usage
- Set up alerts for downtime

### Health Monitoring
- Use `/api/health` endpoint for uptime monitoring
- Implement error tracking (Sentry recommended)
- Monitor database performance

---

## 🎉 Your App is Live!

Once deployed, your CyberSec LMS will be accessible worldwide with:
- ✅ Professional domain (e.g., `cybersec-lms.onrender.com`)
- ✅ HTTPS encryption
- ✅ Global CDN
- ✅ Automatic scaling
- ✅ 99.9% uptime

**Share your live app with the world!** 🌍