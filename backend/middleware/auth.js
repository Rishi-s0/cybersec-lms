const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    console.log('Token decoded successfully:', { userId: decoded.userId });
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.user = { id: decoded.userId, role: decoded.role }; // Add this for compatibility
    next();
  } catch (error) {
    console.error('Token validation error:', error.message);
    res.status(401).json({ message: 'Token is not valid', error: error.message });
  }
};

module.exports = auth;