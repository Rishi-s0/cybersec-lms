const mongoose = require('mongoose');

const courseVersionSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  version: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  lessons: [{
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    videoUrl: String,
    duration: Number,
    order: {
      type: Number,
      required: true
    },
    quiz: {
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String
    },
    practicalExercise: {
      title: String,
      description: String,
      instructions: String,
      solution: String
    }
  }],
  tags: [String],
  prerequisites: [String],
  learningObjectives: [String],
  estimatedDuration: Number,
  thumbnail: String,
  isPublished: {
    type: Boolean,
    default: false
  },
  changeLog: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: false
  },
  parentVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseVersion'
  }
});

// Index for efficient queries
courseVersionSchema.index({ course: 1, version: 1 });
courseVersionSchema.index({ course: 1, createdAt: -1 });

// Static method to create new version
courseVersionSchema.statics.createVersion = async function(courseId, courseData, changeLog, userId) {
  try {
    // Get the latest version number
    const latestVersion = await this.findOne({ course: courseId })
      .sort({ createdAt: -1 })
      .select('version');
    
    let newVersionNumber = '1.0.0';
    if (latestVersion) {
      const [major, minor, patch] = latestVersion.version.split('.').map(Number);
      newVersionNumber = `${major}.${minor}.${patch + 1}`;
    }

    // Create new version
    const newVersion = new this({
      course: courseId,
      version: newVersionNumber,
      ...courseData,
      changeLog,
      createdBy: userId,
      parentVersion: latestVersion?._id
    });

    await newVersion.save();
    return newVersion;
  } catch (error) {
    throw error;
  }
};

// Method to activate this version
courseVersionSchema.methods.activate = async function() {
  try {
    // Deactivate all other versions of this course
    await this.constructor.updateMany(
      { course: this.course, _id: { $ne: this._id } },
      { isActive: false }
    );

    // Activate this version
    this.isActive = true;
    await this.save();

    // Update the main course with this version's data
    const Course = require('./Course');
    await Course.findByIdAndUpdate(this.course, {
      title: this.title,
      description: this.description,
      category: this.category,
      difficulty: this.difficulty,
      lessons: this.lessons,
      tags: this.tags,
      prerequisites: this.prerequisites,
      learningObjectives: this.learningObjectives,
      estimatedDuration: this.estimatedDuration,
      thumbnail: this.thumbnail,
      isPublished: this.isPublished,
      lastModified: new Date(),
      currentVersion: this.version
    });

    return this;
  } catch (error) {
    throw error;
  }
};

// Method to compare with another version
courseVersionSchema.methods.compareWith = function(otherVersion) {
  const changes = {
    title: this.title !== otherVersion.title,
    description: this.description !== otherVersion.description,
    category: this.category !== otherVersion.category,
    difficulty: this.difficulty !== otherVersion.difficulty,
    lessons: {
      added: [],
      removed: [],
      modified: []
    },
    tags: {
      added: this.tags.filter(tag => !otherVersion.tags.includes(tag)),
      removed: otherVersion.tags.filter(tag => !this.tags.includes(tag))
    }
  };

  // Compare lessons
  const thisLessonIds = this.lessons.map(l => l._id?.toString());
  const otherLessonIds = otherVersion.lessons.map(l => l._id?.toString());

  changes.lessons.added = this.lessons.filter(lesson => 
    !otherLessonIds.includes(lesson._id?.toString())
  );

  changes.lessons.removed = otherVersion.lessons.filter(lesson => 
    !thisLessonIds.includes(lesson._id?.toString())
  );

  // Check for modified lessons
  this.lessons.forEach(lesson => {
    const otherLesson = otherVersion.lessons.find(l => 
      l._id?.toString() === lesson._id?.toString()
    );
    if (otherLesson && (
      lesson.title !== otherLesson.title ||
      lesson.content !== otherLesson.content ||
      lesson.videoUrl !== otherLesson.videoUrl
    )) {
      changes.lessons.modified.push({
        lesson: lesson,
        changes: {
          title: lesson.title !== otherLesson.title,
          content: lesson.content !== otherLesson.content,
          videoUrl: lesson.videoUrl !== otherLesson.videoUrl
        }
      });
    }
  });

  return changes;
};

module.exports = mongoose.model('CourseVersion', courseVersionSchema);