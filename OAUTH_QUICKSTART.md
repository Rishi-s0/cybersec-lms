# OAuth Quick Start Guide

## 🚀 Get OAuth Working in 5 Minutes

### Step 1: Install Dependencies (Already Done ✅)
```bash
# Already installed: passport, passport-google-oauth20, passport-github2
```

### Step 2: Get Google Credentials

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth client ID"
5. Configure consent screen if needed
6. Application type: **Web application**
7. Add redirect URI: `http://localhost:5000/api/auth/google/callback`
8. Copy **Client ID** and **Client Secret**

### Step 3: Get GitHub Credentials

1. Go to https://github.com/settings/developers
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in:
   - Application name: **Cybersec LMS**
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `http://localhost:5000/api/auth/github/callback`
4. Click "Register application"
5. Copy **Client ID**
6. Generate and copy **Client Secret**

### Step 4: Update .env File

Add these to your `cybersec-lms/backend/.env` file:

```env
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

### Step 5: Restart Backend

```bash
# Stop your backend (Ctrl+C)
# Then restart it
cd cybersec-lms/backend
npm start
```

### Step 6: Test It!

1. Go to http://localhost:3000/login
2. Click "Google" or "GitHub" button
3. Authorize the app
4. You're logged in! 🎉

---

## Troubleshooting

### "redirect_uri_mismatch" Error
- Check that your redirect URI in Google/GitHub matches exactly:
  - Google: `http://localhost:5000/api/auth/google/callback`
  - GitHub: `http://localhost:5000/api/auth/github/callback`
- No trailing slashes!

### "Access blocked" Error (Google)
- Add your email as a test user in Google OAuth consent screen
- Make sure Google+ API is enabled

### Backend Not Starting
- Make sure MongoDB is running
- Check that all environment variables are set
- Look for syntax errors in console

### OAuth Button Not Working
- Check browser console for errors
- Make sure backend is running on port 5000
- Verify CORS is enabled

---

## What Happens Behind the Scenes

1. User clicks OAuth button
2. Redirected to Google/GitHub
3. User authorizes app
4. Redirected back to `/api/auth/google/callback` or `/api/auth/github/callback`
5. Backend creates/updates user in database
6. JWT token generated
7. Redirected to frontend `/oauth-callback?token=...`
8. Frontend stores token and fetches user data
9. User redirected to dashboard

---

## Production Deployment

When deploying to production:

1. Update redirect URIs in Google/GitHub to use your production URLs
2. Update `.env`:
   ```env
   FRONTEND_URL=https://your-domain.com
   ```
3. Use HTTPS (required for OAuth in production)
4. Keep your client secrets secure!

---

For detailed setup instructions, see `OAUTH_SETUP.md`
