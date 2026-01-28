const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const Course = require('../models/Course');
const auth = require('../middleware/auth');

// Get all notes for a user
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.userId })
      .populate('courseId', 'title')
      .sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notes for a specific lesson
router.get('/lesson/:courseId/:lessonId', auth, async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const notes = await Note.find({ 
      userId: req.user.userId,
      courseId,
      lessonId
    }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Error fetching lesson notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new note
router.post('/', auth, async (req, res) => {
  try {
    const { courseId, lessonId, lessonTitle, content, timestamp } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Note content is required' });
    }

    const note = new Note({
      userId: req.user.userId,
      courseId,
      lessonId,
      lessonTitle,
      content: content.trim(),
      timestamp
    });

    await note.save();
    const populatedNote = await Note.findById(note._id).populate('courseId', 'title');
    res.status(201).json(populatedNote);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a note
router.put('/:noteId', auth, async (req, res) => {
  try {
    const { noteId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Note content is required' });
    }

    const note = await Note.findOne({ _id: noteId, userId: req.user.userId });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.content = content.trim();
    note.updatedAt = Date.now();
    await note.save();

    const populatedNote = await Note.findById(note._id).populate('courseId', 'title');
    res.json(populatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a note
router.delete('/:noteId', auth, async (req, res) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findOneAndDelete({ _id: noteId, userId: req.user.userId });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
