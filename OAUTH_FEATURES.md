# OAuth Authentication Features

## What's Been Added

Your Cybersecurity LMS now supports **Google and GitHub OAuth authentication**! Users can sign in with their existing Google or GitHub accounts instead of creating a new password.

## Features

### 1. Google OAuth Login
- Users can sign in with their Google account
- Automatically creates a user profile on first login
- Links to existing accounts if email matches

### 2. GitHub OAuth Login
- Users can sign in with their GitHub account
- Automatically creates a user profile on first login
- Links to existing accounts if email matches

### 3. Seamless Integration
- OAuth buttons on both Login and Register pages
- Automatic redirect after successful authentication
- JWT token generation for session management
- User data synced with your database

### 4. Security Features
- Secure OAuth 2.0 flow
- No passwords stored for OAuth users
- Automatic username generation
- Email verification through OAuth providers

## Files Added/Modified

### Backend Files
- `backend/config/passport.js` - Passport.js configuration for OAuth strategies
- `backend/routes/oauth.js` - OAuth routes for Google and GitHub
- `backend/models/User.js` - Updated to support OAuth fields (googleId, githubId)
- `backend/server.js` - Added passport initialization and OAuth routes

### Frontend Files
- `frontend/src/pages/OAuthCallback.js` - Handles OAuth redirect and token exchange
- `frontend/src/pages/Login.js` - Added Google and GitHub login buttons
- `frontend/src/pages/Register.js` - Added Google and GitHub signup buttons
- `frontend/src/App.js` - Added OAuth callback route

### Documentation
- `OAUTH_SETUP.md` - Complete setup guide for OAuth credentials
- `OAUTH_FEATURES.md` - This file

### Configuration
- `.env.example` - Added OAuth environment variables

## How It Works

1. **User clicks OAuth button** → Redirects to Google/GitHub authorization page
2. **User authorizes app** → OAuth provider redirects back with authorization code
3. **Backend exchanges code for user data** → Creates or updates user in database
4. **JWT token generated** → User redirected to frontend with token
5. **Frontend stores token** → User logged in and redirected to dashboard

## Next Steps

To enable OAuth login, follow the setup guide in `OAUTH_SETUP.md`:

1. Create Google OAuth credentials
2. Create GitHub OAuth app
3. Add credentials to `.env` file
4. Restart your backend server
5. Test OAuth login!

## User Experience

### For New Users
- Click "Google" or "GitHub" button
- Authorize the application
- Automatically logged in with profile created

### For Existing Users
- If email matches, OAuth account is linked to existing profile
- Can use either password or OAuth to login
- Profile data remains intact

## Database Schema Changes

The User model now includes:
- `googleId` - Unique Google user ID (optional)
- `githubId` - Unique GitHub user ID (optional)
- `username` - Now optional for OAuth users (auto-generated)
- `password` - Now optional for OAuth users

## Security Considerations

- OAuth tokens are never stored in the database
- Only user profile data is saved
- JWT tokens expire after 7 days
- OAuth credentials should be kept secret
- Use HTTPS in production
