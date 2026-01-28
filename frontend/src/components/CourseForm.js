import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Save,
  X,
  Clock,
  Target,
  Users,
  AlertCircle
} from 'lucide-react';

const CourseForm = ({ course = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    category: course?.category || 'Network Security',
    difficulty: course?.difficulty || 'beginner',
    prerequisites: course?.prerequisites || [],
    learningObjectives: course?.learningObjectives || [],
    estimatedDuration: course?.estimatedDuration || 1,
    isPublished: course?.isPublished || false,
    lessons: course?.lessons || []
  });

  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newLesson, setNewLesson] = useState({
    title: '',
    content: '',
    videoUrl: '',
    duration: 30,
    order: 1
  });
  const [showLessonForm, setShowLessonForm] = useState(false);

  const categories = [
    'Network Security',
    'Web Security',
    'Cryptography',
    'Ethical Hacking',
    'Incident Response',
    'Risk Management',
    'Compliance',
    'Malware Analysis',
    'Digital Forensics',
    'Security Awareness'
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner', color: 'text-htb-green' },
    { value: 'intermediate', label: 'Intermediate', color: 'text-htb-orange' },
    { value: 'advanced', label: 'Advanced', color: 'text-htb-red' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim()) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, newPrerequisite.trim()]
      }));
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (index) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setFormData(prev => ({
        ...prev,
        learningObjectives: [...prev.learningObjectives, newObjective.trim()]
      }));
      setNewObjective('');
    }
  };

  const removeObjective = (index) => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter((_, i) => i !== index)
    }));
  };

  const addLesson = () => {
    if (newLesson.title.trim() && newLesson.content.trim()) {
      const lesson = {
        ...newLesson,
        order: formData.lessons.length + 1,
        lessonId: Date.now().toString(), // Required by schema
        _id: Date.now().toString() // Temporary ID for new lessons
      };

      setFormData(prev => ({
        ...prev,
        lessons: [...prev.lessons, lesson]
      }));

      setNewLesson({
        title: '',
        content: '',
        videoUrl: '',
        duration: 30,
        order: formData.lessons.length + 2
      });
      setShowLessonForm(false);
    }
  };

  const removeLesson = (index) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Error saving course. Please try again.');
    }
  };

  return (
    <div className="htb-card p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-8 w-8 text-htb-green" />
          <h2 className="text-2xl font-bold text-htb-gray-light matrix-text">
            {course ? 'Edit Course' : 'Create New Course'}
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="text-htb-gray hover:text-htb-red transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-htb-green matrix-text">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-htb-gray mb-2">
                Course Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="htb-input w-full px-4 py-3 rounded-lg"
                placeholder="Enter course title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-htb-gray mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="htb-input w-full px-4 py-3 rounded-lg"
                required
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-htb-gray mb-2">
                Difficulty Level *
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="htb-input w-full px-4 py-3 rounded-lg"
                required
              >
                {difficulties.map(diff => (
                  <option key={diff.value} value={diff.value}>{diff.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-htb-gray mb-2">
                Estimated Duration (hours)
              </label>
              <input
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value))}
                className="htb-input w-full px-4 py-3 rounded-lg"
                min="1"
                max="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-htb-gray mb-2">
              Course Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="htb-input w-full px-4 py-3 rounded-lg h-32"
              placeholder="Describe what students will learn in this course"
              required
            />
          </div>
        </div>

        {/* Prerequisites */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-htb-green matrix-text">Prerequisites</h3>

          <div className="flex space-x-2">
            <input
              type="text"
              value={newPrerequisite}
              onChange={(e) => setNewPrerequisite(e.target.value)}
              className="htb-input flex-1 px-4 py-2 rounded-lg"
              placeholder="Add a prerequisite"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
            />
            <button
              type="button"
              onClick={addPrerequisite}
              className="htb-btn px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>

          {formData.prerequisites.length > 0 && (
            <div className="space-y-2">
              {formData.prerequisites.map((prereq, index) => (
                <div key={index} className="flex items-center justify-between bg-htb-darker/30 px-4 py-2 rounded-lg">
                  <span className="text-htb-gray-light">{prereq}</span>
                  <button
                    type="button"
                    onClick={() => removePrerequisite(index)}
                    className="text-htb-red hover:text-htb-orange transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Learning Objectives */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-htb-green matrix-text">Learning Objectives</h3>

          <div className="flex space-x-2">
            <input
              type="text"
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              className="htb-input flex-1 px-4 py-2 rounded-lg"
              placeholder="Add a learning objective"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
            />
            <button
              type="button"
              onClick={addObjective}
              className="htb-btn px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>

          {formData.learningObjectives.length > 0 && (
            <div className="space-y-2">
              {formData.learningObjectives.map((objective, index) => (
                <div key={index} className="flex items-center justify-between bg-htb-darker/30 px-4 py-2 rounded-lg">
                  <span className="text-htb-gray-light">{objective}</span>
                  <button
                    type="button"
                    onClick={() => removeObjective(index)}
                    className="text-htb-red hover:text-htb-orange transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lessons */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-htb-green matrix-text">Course Lessons</h3>
            <button
              type="button"
              onClick={() => setShowLessonForm(true)}
              className="htb-btn px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Lesson</span>
            </button>
          </div>

          {/* Lesson Form */}
          {showLessonForm && (
            <div className="bg-htb-darker/30 p-6 rounded-lg border border-htb-green/30">
              <h4 className="text-md font-semibold text-htb-gray-light mb-4">New Lesson</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={newLesson.title}
                    onChange={(e) => setNewLesson(prev => ({ ...prev, title: e.target.value }))}
                    className="htb-input px-4 py-2 rounded-lg"
                    placeholder="Lesson title"
                  />
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-htb-gray" />
                    <input
                      type="number"
                      value={newLesson.duration}
                      onChange={(e) => setNewLesson(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="htb-input px-4 py-2 rounded-lg"
                      placeholder="Duration (minutes)"
                      min="1"
                    />
                  </div>
                </div>

                {/* Video URL Input */}
                <div>
                  <label className="block text-xs font-medium text-htb-gray mb-1">
                    Video URL (YouTube or Local Path like: /videos/file.mp4)
                  </label>
                  <input
                    type="text"
                    value={newLesson.videoUrl || ''}
                    onChange={(e) => setNewLesson(prev => ({ ...prev, videoUrl: e.target.value }))}
                    className="htb-input w-full px-4 py-2 rounded-lg"
                    placeholder="e.g. /videos/lesson1.mp4"
                  />
                </div>

                <textarea
                  value={newLesson.content}
                  onChange={(e) => setNewLesson(prev => ({ ...prev, content: e.target.value }))}
                  className="htb-input w-full px-4 py-3 rounded-lg h-24"
                  placeholder="Lesson content and description"
                />
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={addLesson}
                    className="htb-btn-primary px-4 py-2 rounded-lg"
                  >
                    Add Lesson
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLessonForm(false)}
                    className="htb-btn px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lessons List */}
          {formData.lessons.length > 0 && (
            <div className="space-y-3">
              {formData.lessons.map((lesson, index) => (
                <div key={lesson._id || index} className="bg-htb-darker/30 p-4 rounded-lg border border-htb-gray-dark/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-semibold text-htb-gray-light">{lesson.title}</h5>
                      <p className="text-sm text-htb-gray mt-1">{lesson.content}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-htb-gray">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{lesson.duration} min</span>
                        </span>
                        <span>Lesson {lesson.order}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLesson(index)}
                      className="text-htb-red hover:text-htb-orange transition-colors ml-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Publishing Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-htb-green matrix-text">Publishing</h3>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) => handleInputChange('isPublished', e.target.checked)}
              className="accent-htb-green"
            />
            <label htmlFor="isPublished" className="text-htb-gray-light">
              Publish course immediately (students can enroll)
            </label>
          </div>

          {!formData.isPublished && (
            <div className="flex items-start space-x-2 p-3 bg-htb-orange/10 border border-htb-orange/30 rounded-lg">
              <AlertCircle className="h-5 w-5 text-htb-orange mt-0.5" />
              <div className="text-sm text-htb-orange">
                Course will be saved as draft. You can publish it later from the admin dashboard.
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-htb-gray-dark/30">
          <button
            type="button"
            onClick={onCancel}
            className="htb-btn px-6 py-3 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="htb-btn-primary px-6 py-3 rounded-lg flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{course ? 'Update Course' : 'Create Course'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;