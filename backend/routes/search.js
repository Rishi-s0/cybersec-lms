const express = require('express');
const Course = require('../models/Course');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/search
// @desc    Search across courses, lessons, and users
// @access  Public (but content filtered by enrollment)
router.get('/', async (req, res) => {
  try {
    const { q, type, category, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ results: [], total: 0 });
    }
    
    const searchQuery = q.trim();
    const searchRegex = new RegExp(searchQuery, 'i');
    const results = [];
    
    // Get user ID if authenticated (for enrollment checks)
    let userId = null;
    if (req.headers.authorization) {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (error) {
        // Not authenticated, continue as guest
      }
    }
    
    // Search courses (public information only)
    if (!type || type === 'course') {
      const courseQuery = {
        isPublished: true, // Only show published courses
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { category: searchRegex }
        ]
      };
      
      if (category) {
        courseQuery.category = category;
      }
      
      const courses = await Course.find(courseQuery)
        .populate('instructor', 'username profile.firstName profile.lastName')
        .limit(parseInt(limit))
        .select('title description category difficulty thumbnail instructor estimatedDuration');
      
      courses.forEach(course => {
        results.push({
          type: 'course',
          title: course.title,
          description: course.description,
          category: course.category,
          difficulty: course.difficulty,
          instructor: course.instructor?.username,
          url: `/courses/${course._id}`,
          thumbnail: course.thumbnail,
          estimatedDuration: course.estimatedDuration,
          score: calculateRelevanceScore(course.title + ' ' + course.description, searchQuery)
        });
      });
    }
    
    // Search lessons (ONLY for enrolled users and only lesson titles, not content)
    if ((!type || type === 'lesson') && userId) {
      try {
        const Progress = require('../models/Progress');
        
        // Get user's enrolled courses
        const userProgress = await Progress.find({ user: userId }).select('course');
        const enrolledCourseIds = userProgress.map(p => p.course);
        
        if (enrolledCourseIds.length > 0) {
          const enrolledCourses = await Course.find({
            _id: { $in: enrolledCourseIds },
            'lessons.title': searchRegex
          })
          .populate('instructor', 'username')
          .select('title category lessons.title lessons._id');
          
          enrolledCourses.forEach(course => {
            course.lessons.forEach(lesson => {
              if (lesson.title.match(searchRegex)) {
                results.push({
                  type: 'lesson',
                  title: lesson.title,
                  description: `Lesson from ${course.title}`, // Generic description, no content
                  category: course.category,
                  courseName: course.title,
                  url: `/courses/${course._id}/lesson/${lesson._id}`,
                  score: calculateRelevanceScore(lesson.title, searchQuery)
                });
              }
            });
          });
        }
      } catch (error) {
        console.error('Lesson search error:', error);
        // Continue without lesson results
      }
    }
    
    // Search users (only if authenticated and only public profile info)
    if ((!type || type === 'user') && userId) {
      try {
        const users = await User.find({
          _id: { $ne: userId }, // Don't include current user
          $or: [
            { username: searchRegex },
            { 'profile.firstName': searchRegex },
            { 'profile.lastName': searchRegex }
            // Removed bio search for privacy
          ]
        })
        .limit(parseInt(limit))
        .select('username profile.firstName profile.lastName role');
        
        users.forEach(user => {
          results.push({
            type: 'user',
            title: user.profile?.firstName && user.profile?.lastName 
              ? `${user.profile.firstName} ${user.profile.lastName}` 
              : user.username,
            description: `${user.role} on CyberSec LMS`,
            category: user.role,
            url: `/profile/${user.username}`,
            score: calculateRelevanceScore(
              `${user.username} ${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`, 
              searchQuery
            )
          });
        });
      } catch (authError) {
        // Skip user search if error
      }
    }
    
    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);
    
    // Limit total results
    const limitedResults = results.slice(0, parseInt(limit));
    
    res.json({
      results: limitedResults,
      total: results.length,
      query: searchQuery,
      authenticated: !!userId
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search error', results: [] });
  }
});

// @route   GET /api/search/suggestions
// @desc    Get search suggestions/autocomplete
// @access  Public (only public course info)
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 1) {
      return res.json({ suggestions: [] });
    }
    
    const searchQuery = q.trim();
    const searchRegex = new RegExp(searchQuery, 'i');
    const suggestions = [];
    
    // Get course titles and categories (only published courses)
    const courses = await Course.find({
      isPublished: true,
      $or: [
        { title: searchRegex },
        { category: searchRegex }
      ]
    })
    .limit(10)
    .select('title category');
    
    courses.forEach(course => {
      if (course.title.match(searchRegex)) {
        suggestions.push({
          text: course.title,
          type: 'course',
          category: course.category
        });
      }
    });
    
    // Get unique categories (only from published courses)
    const categories = await Course.distinct('category', { 
      category: searchRegex,
      isPublished: true 
    });
    categories.forEach(category => {
      suggestions.push({
        text: category,
        type: 'category'
      });
    });
    
    // Remove duplicates and limit
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.text === suggestion.text)
      )
      .slice(0, 8);
    
    res.json({ suggestions: uniqueSuggestions });
    
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ suggestions: [] });
  }
});

// @route   GET /api/search/filters
// @desc    Get available search filters
// @access  Public (only from published courses)
router.get('/filters', async (req, res) => {
  try {
    const categories = await Course.distinct('category', { isPublished: true });
    const difficulties = await Course.distinct('difficulty', { isPublished: true });
    
    res.json({
      categories: categories.sort(),
      difficulties: difficulties.sort(),
      types: ['course', 'lesson', 'user']
    });
    
  } catch (error) {
    console.error('Filters error:', error);
    res.status(500).json({ 
      categories: [], 
      difficulties: [], 
      types: ['course', 'lesson', 'user'] 
    });
  }
});

// Helper function to calculate relevance score
function calculateRelevanceScore(text, query) {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  let score = 0;
  
  // Exact match gets highest score
  if (lowerText.includes(lowerQuery)) {
    score += 100;
  }
  
  // Title match gets higher score than description
  if (lowerText.startsWith(lowerQuery)) {
    score += 50;
  }
  
  // Word boundary matches
  const words = lowerQuery.split(' ');
  words.forEach(word => {
    if (word.length > 2) {
      const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
      if (wordRegex.test(text)) {
        score += 25;
      }
    }
  });
  
  // Partial matches
  words.forEach(word => {
    if (word.length > 2 && lowerText.includes(word)) {
      score += 10;
    }
  });
  
  return score;
}

module.exports = router;