class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Time to live for each key
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default
    
    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  // Set cache with optional TTL
  set(key, value, ttlMs = this.defaultTTL) {
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + ttlMs);
  }

  // Get from cache
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const expiry = this.ttl.get(key);
    if (Date.now() > expiry) {
      this.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  // Delete from cache
  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.ttl.clear();
  }

  // Clean up expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, expiry] of this.ttl.entries()) {
      if (now > expiry) {
        this.delete(key);
      }
    }
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Cache middleware for Express routes
  middleware(ttlMs = this.defaultTTL) {
    return (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const key = `${req.originalUrl}:${req.userId || 'anonymous'}`;
      const cached = this.get(key);

      if (cached) {
        console.log(`Cache HIT: ${key}`);
        return res.json(cached);
      }

      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = (data) => {
        // Only cache successful responses
        if (res.statusCode === 200) {
          console.log(`Cache SET: ${key}`);
          this.set(key, data, ttlMs);
        }
        return originalJson.call(res, data);
      };

      next();
    };
  }

  // Invalidate cache by pattern
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.delete(key));
    console.log(`Invalidated ${keysToDelete.length} cache entries matching: ${pattern}`);
  }

  // Cache course data
  setCourse(courseId, courseData, ttlMs = 10 * 60 * 1000) { // 10 minutes for courses
    this.set(`course:${courseId}`, courseData, ttlMs);
  }

  getCourse(courseId) {
    return this.get(`course:${courseId}`);
  }

  invalidateCourse(courseId) {
    this.delete(`course:${courseId}`);
    this.invalidatePattern(`.*courses.*`); // Invalidate course lists
  }

  // Cache user data
  setUser(userId, userData, ttlMs = 15 * 60 * 1000) { // 15 minutes for users
    this.set(`user:${userId}`, userData, ttlMs);
  }

  getUser(userId) {
    return this.get(`user:${userId}`);
  }

  invalidateUser(userId) {
    this.delete(`user:${userId}`);
    this.invalidatePattern(`.*users.*`);
  }

  // Cache progress data
  setProgress(userId, courseId, progressData, ttlMs = 2 * 60 * 1000) { // 2 minutes for progress
    this.set(`progress:${userId}:${courseId}`, progressData, ttlMs);
  }

  getProgress(userId, courseId) {
    return this.get(`progress:${userId}:${courseId}`);
  }

  invalidateProgress(userId, courseId) {
    if (courseId) {
      this.delete(`progress:${userId}:${courseId}`);
    } else {
      this.invalidatePattern(`progress:${userId}:.*`);
    }
  }

  // Cache search results
  setSearchResults(query, results, ttlMs = 5 * 60 * 1000) { // 5 minutes for search
    this.set(`search:${query}`, results, ttlMs);
  }

  getSearchResults(query) {
    return this.get(`search:${query}`);
  }

  invalidateSearch() {
    this.invalidatePattern(`search:.*`);
  }
}

// Create singleton instance
const cacheService = new CacheService();

module.exports = cacheService;