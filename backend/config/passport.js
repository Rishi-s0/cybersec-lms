const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if email already exists
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        // Create new user
        const username = profile.emails[0].value.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5);
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          username: username,
          email: profile.emails[0].value,
          'profile.avatar': profile.photos[0]?.value,
          isEmailVerified: true // OAuth emails are pre-verified
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/api/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if email already exists
        const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
        user = await User.findOne({ email });

        if (user) {
          // Link GitHub account to existing user
          user.githubId = profile.id;
          await user.save();
          return done(null, user);
        }

        // Create new user
        const username = profile.username || email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5);
        user = await User.create({
          githubId: profile.id,
          name: profile.displayName || profile.username,
          username: username,
          email,
          'profile.avatar': profile.photos?.[0]?.value || profile.avatar_url,
          isEmailVerified: true // OAuth emails are pre-verified
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

module.exports = passport;
