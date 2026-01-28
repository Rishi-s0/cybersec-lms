
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables FIRST
dotenv.config();

const passport = require('./config/passport');

// Import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const userRoutes = require('./routes/users');
const progressRoutes = require('./routes/progress');
const threatRoutes = require('./routes/threats');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const discussionRoutes = require('./routes/discussions');
const noteRoutes = require('./routes/notes');
const updateVideosRoutes = require('./routes/updateVideos');
const fixVideoUrlsRoutes = require('./routes/fixVideoUrls');
const useLocalVideosRoutes = require('./routes/useLocalVideos');
const oauthRoutes = require('./routes/oauth');
const certificateRoutes = require('./routes/certificates');
const searchRoutes = require('./routes/search');
const analyticsRoutes = require('./routes/analytics');
const bulkUsersRoutes = require('./routes/bulkUsers');
const versioningRoutes = require('./routes/versioning');

const http = require('http');
const { Server } = require('socket.io');
const NotificationService = require('./services/notificationService');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize Notification Service
const notificationService = new NotificationService(io);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

// Socket.io Middleware to make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  req.notificationService = notificationService;
  next();
});

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Socket ${socket.id} joined user room: user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// MongoDB connection with better error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cybersec-lms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();

const db = mongoose.connection;
db.on('error', (error) => {
  console.error('MongoDB error:', error.message);
});
db.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  setTimeout(connectDB, 5000);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes); // OAuth routes
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/threats', threatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/update', updateVideosRoutes);
app.use('/api/fix', fixVideoUrlsRoutes);
app.use('/api/local', useLocalVideosRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/bulk-users', bulkUsersRoutes);
app.use('/api/versioning', versioningRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/payments', require('./routes/payments'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Cybersecurity LMS API is running!' });
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  
  // Serve static files from the React app build directory
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});