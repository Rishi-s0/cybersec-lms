# OAuth Setup Guide

This guide will help you set up Google and GitHub OAuth authentication for your Cybersecurity LMS.

## Prerequisites

- A Google Cloud account
- A GitHub account
- Your application running on `http://localhost:5000` (backend) and `http://localhost:3000` (frontend)

---

## 1. Google OAuth Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "Cybersec LMS") and click "Create"

### Step 2: Enable Google+ API

1. In the left sidebar, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: Cybersec LMS
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue"
   - Scopes: Skip for now
   - Test users: Add your email
   - Click "Save and Continue"

4. Create OAuth Client ID:
   - Application type: Web application
   - Name: Cybersec LMS Web Client
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://localhost:5000`
   - Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback`
   - Click "Create"

5. Copy your **Client ID** and **Client Secret**

---

## 2. GitHub OAuth Setup

### Step 1: Create a GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in the details:
   - Application name: Cybersec LMS
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:5000/api/auth/github/callback`
4. Click "Register application"

### Step 2: Get Credentials

1. Copy your **Client ID**
2. Click "Generate a new client secret"
3. Copy your **Client Secret** (you won't be able to see it again!)

---

## 3. Configure Environment Variables

1. Open your `.env` file in the `cybersec-lms/backend` directory
2. Add the following variables:

```env
# Frontend URL
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

3. Replace the placeholder values with your actual credentials

---

## 4. Restart Your Application

1. Stop your backend server (Ctrl+C)
2. Restart it: `npm start`
3. Your frontend should already be running

---

## 5. Test OAuth Login

1. Go to `http://localhost:3000/login`
2. Click "Google" or "GitHub" button
3. Authorize the application
4. You should be redirected back and logged in!

---

## Production Setup

When deploying to production:

1. Update OAuth redirect URIs in Google Cloud Console and GitHub:
   - Replace `http://localhost:5000` with your production backend URL
   - Replace `http://localhost:3000` with your production frontend URL

2. Update `.env` file:
   ```env
   FRONTEND_URL=https://your-frontend-domain.com
   ```

3. For Google OAuth:
   - Update "Authorized JavaScript origins"
   - Update "Authorized redirect URIs"

4. For GitHub OAuth:
   - Update "Homepage URL"
   - Update "Authorization callback URL"

---

## Troubleshooting

### "redirect_uri_mismatch" error
- Make sure the redirect URI in your OAuth app matches exactly with the one in your code
- Check for trailing slashes
- Ensure you're using the correct protocol (http vs https)

### "Access blocked: This app's request is invalid"
- Make sure you've added your email as a test user in Google OAuth consent screen
- Verify that Google+ API is enabled

### User created without username
- OAuth users don't have passwords
- Username is auto-generated from email or GitHub username
- Users can update their profile after logging in

---

## Security Notes

- Never commit your `.env` file to version control
- Use strong, unique client secrets
- In production, always use HTTPS
- Regularly rotate your OAuth credentials
- Monitor OAuth usage in Google Cloud Console and GitHub Settings
