import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Lock,
  Clock,
  HelpCircle,
  Send,
  Home,
  BookOpen,
  StickyNote,
  X,
  Save,
  Trash2,
  Edit
} from 'lucide-react';

const LessonViewer = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoWatched, setVideoWatched] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [videoStartTime, setVideoStartTime] = useState(null);
  const [canMarkWatched, setCanMarkWatched] = useState(false);

  // Notes state
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');

  useEffect(() => {
    fetchCourseAndLesson();
    fetchProgress();
    fetchNotes();
    
    // Reset all state when lesson changes
    setVideoProgress(0);
    setVideoWatched(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResults(null);
    setQuizPassed(false);
    setQuizStarted(false);
  }, [courseId, lessonId]);

  // No timer needed - video progress tracking handles everything!

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize YouTube player for progress tracking
  useEffect(() => {
    if (!currentLesson?.videoUrl) return;
    if (!currentLesson.videoUrl.includes('youtube.com') && !currentLesson.videoUrl.includes('youtu.be')) return;

    let player;
    let progressInterval;

    const initYouTubePlayer = () => {
      if (window.YT && window.YT.Player) {
        // Wait a bit for iframe to be in DOM
        setTimeout(() => {
          const iframe = document.getElementById(`youtube-${lessonId}`);
          console.log('🎬 Initializing YouTube player for:', lessonId, 'iframe found:', !!iframe);
          if (iframe) {
            player = new window.YT.Player(`youtube-${lessonId}`, {
              events: {
                onReady: () => {
                  console.log('✅ YouTube player ready!');
                  // Track progress every second
                  progressInterval = setInterval(() => {
                    if (player && player.getCurrentTime && player.getDuration) {
                      try {
                        const currentTime = player.getCurrentTime();
                        const duration = player.getDuration();
                        console.log('⏱️ Progress:', currentTime, '/', duration);
                        handleVideoProgress(currentTime, duration);
                      } catch (e) {
                        console.log('⚠️ Error getting time:', e.message);
                      }
                    }
                  }, 1000);
                },
                onError: (event) => {
                  console.error('❌ YouTube player error:', event.data);
                }
              }
            });
          }
        }, 1000);
      }
    };

    // Wait for YT API to be ready
    if (window.YT && window.YT.Player) {
      initYouTubePlayer();
    } else {
      window.onYouTubeIframeAPIReady = initYouTubePlayer;
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (player && player.destroy) {
        try {
          player.destroy();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [currentLesson, lessonId]);

  const fetchCourseAndLesson = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (response.ok) {
        const courseData = await response.json();
        setCourse(courseData);

        const lesson = courseData.lessons.find(l => l.lessonId === lessonId);
        console.log('🎥 Lesson data:', lesson);
        console.log('🎥 Video URL:', lesson?.videoUrl);
        setCurrentLesson(lesson);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/progress/detailed/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const progressData = await response.json();
        setProgress(progressData);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const handleVideoProgress = (currentTime, duration) => {
    if (!duration || duration === 0) return;

    const percentWatched = (currentTime / duration) * 100;
    setVideoProgress(percentWatched);

    if (percentWatched >= 90 && !videoWatched) {
      setVideoWatched(true);
    }
  };

  const handleQuizAnswer = (questionIndex, answer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const submitQuiz = () => {
    const quiz = currentLesson.quiz;
    let correctCount = 0;

    const results = quiz.map((question, index) => {
      const userAnswer = quizAnswers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correctCount++;

      return {
        questionIndex: index,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    });

    const score = Math.round((correctCount / quiz.length) * 100);
    const passed = score >= 80;

    setQuizResults({
      results,
      score,
      correctCount,
      totalQuestions: quiz.length,
      passed
    });

    setQuizSubmitted(true);
    if (passed) setQuizPassed(true);
  };

  const canCompleteLesson = () => {
    if (currentLesson?.videoUrl && !videoWatched) return false;
    if (currentLesson?.quiz && currentLesson.quiz.length > 0 && !quizPassed) return false;
    return true;
  };

  // Notes functions
  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notes/lesson/${courseId}/${lessonId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const saveNote = async () => {
    if (!newNote.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          lessonId,
          lessonTitle: currentLesson?.title || 'Untitled Lesson',
          content: newNote.trim()
        })
      });

      if (response.ok) {
        const savedNote = await response.json();
        setNotes(prev => [savedNote, ...prev]);
        setNewNote('');
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const updateNote = async (noteId) => {
    if (!editingNoteContent.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: editingNoteContent.trim()
        })
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNotes(prev => prev.map(note => note._id === noteId ? updatedNote : note));
        setEditingNoteId(null);
        setEditingNoteContent('');
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotes(prev => prev.filter(note => note._id !== noteId));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const isLessonCompleted = (lessonId) => {
    return progress?.completedLessons?.some(lesson => lesson.lessonId === lessonId);
  };

  const completeLesson = async () => {
    try {
      const response = await fetch(`/api/progress/lesson/${courseId}/${lessonId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ timeSpent: 5 })
      });

      if (response.ok) {
        await fetchProgress();
        alert('Lesson completed! Moving to next lesson...');
        goToNextLesson();
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const goToNextLesson = () => {
    if (!course) return;
    const currentIndex = course.lessons.findIndex(l => l.lessonId === lessonId);
    if (currentIndex < course.lessons.length - 1) {
      const nextLesson = course.lessons[currentIndex + 1];
      navigate(`/courses/${courseId}/lesson/${nextLesson.lessonId}`);
    } else {
      navigate(`/courses/${courseId}`);
    }
  };

  const goToPreviousLesson = () => {
    if (!course) return;
    const currentIndex = course.lessons.findIndex(l => l.lessonId === lessonId);
    if (currentIndex > 0) {
      const prevLesson = course.lessons[currentIndex - 1];
      navigate(`/courses/${courseId}/lesson/${prevLesson.lessonId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-htb-green"></div>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-htb-gray-light">Lesson not found</h2>
      </div>
    );
  }

  const currentIndex = course?.lessons.findIndex(l => l.lessonId === lessonId) || 0;
  const isCompleted = isLessonCompleted(lessonId);

  return (
    <>
      <div className="min-h-screen bg-htb-dark">
        {/* Top Navigation Bar */}
        <div className="htb-card border-b border-htb-gray-dark/30 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  to={`/courses/${courseId}`}
                  className="flex items-center space-x-2 text-htb-gray hover:text-htb-green transition-colors"
                >
                  <Home className="h-5 w-5" />
                  <span>Back to Course</span>
                </Link>
                <span className="text-htb-gray">|</span>
                <h1 className="text-lg font-semibold text-htb-gray-light">
                  {course?.title}
                </h1>
              </div>
              <div className="flex items-center space-x-2 text-sm text-htb-gray">
                <BookOpen className="h-4 w-4" />
                <span>Lesson {currentLesson.order} of {course?.lessons.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Lesson Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-2">
              {isCompleted ? (
                <CheckCircle className="h-6 w-6 text-htb-green" />
              ) : (
                <div className="h-6 w-6 border-2 border-htb-green rounded-full"></div>
              )}
              <h2 className="text-3xl font-bold text-htb-gray-light matrix-text">
                {currentLesson.title}
              </h2>
            </div>
            <div className="flex items-center space-x-4 text-sm text-htb-gray">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{currentLesson.duration} minutes</span>
              </div>
              {isCompleted && (
                <span className="text-htb-green">✓ Completed</span>
              )}
            </div>
          </div>

          {/* Video Player */}
          {currentLesson.videoUrl && (
            <div className="mb-8">
              {!videoWatched && (
                <div className="mb-3 p-3 bg-htb-orange/10 border border-htb-orange/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-htb-orange font-medium">
                      📹 Watch at least 90% of the video to unlock the quiz
                    </span>
                    <span className="text-sm text-htb-orange font-bold">
                      {Math.round(videoProgress)}%
                    </span>
                  </div>
                  <div className="w-full bg-htb-darker rounded-full h-2">
                    <div
                      className="bg-htb-orange h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(videoProgress, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {videoWatched && (
                <div className="mb-3 p-3 bg-htb-green/10 border border-htb-green/30 rounded-lg flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-htb-green" />
                  <span className="text-sm text-htb-green font-medium">
                    ✅ Video requirement met!
                  </span>
                </div>
              )}

              <div className="aspect-video w-full bg-htb-darker rounded-lg overflow-hidden">
                {currentLesson.videoUrl.includes('youtube.com') || currentLesson.videoUrl.includes('youtu.be') ? (
                  <iframe
                    id={`youtube-${lessonId}`}
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${currentLesson.videoUrl.includes('watch?v=') ? currentLesson.videoUrl.split('watch?v=')[1].split('&')[0] : currentLesson.videoUrl.split('/').pop()}?enablejsapi=1`}
                    title={currentLesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video
                    className="w-full h-full"
                    controls
                    src={currentLesson.videoUrl}
                    onTimeUpdate={(e) => {
                      const video = e.target;
                      handleVideoProgress(video.currentTime, video.duration);
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>
          )}

          {/* Lesson Content */}
          <div className="htb-card p-8 mb-8">
            <div className="prose prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
            </div>
          </div>

          {/* Quiz Section */}
          {currentLesson.quiz && currentLesson.quiz.length > 0 && (
            <div className="htb-card mb-8">
              {!quizStarted ? (
                // Take Quiz Button - Only show after video is watched
                <div className="p-8 text-center">
                  <div className="mb-4">
                    <HelpCircle className="h-16 w-16 text-htb-blue mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-htb-gray-light mb-2">
                      Ready to Test Your Knowledge?
                    </h3>
                    <p className="text-htb-gray mb-4">
                      Complete the quiz to assess your understanding of this lesson
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-htb-gray mb-6">
                      <span>📝 {currentLesson.quiz.length} Questions</span>
                      <span>•</span>
                      <span>✅ 80% to Pass</span>
                      <span>•</span>
                      <span>⏱️ ~5 minutes</span>
                    </div>
                  </div>

                  {!videoWatched && currentLesson.videoUrl ? (
                    <div className="bg-htb-orange/10 border border-htb-orange/30 rounded-lg p-4 mb-4">
                      <p className="text-htb-orange text-sm">
                        🔒 Complete the video first (watch 90%) to unlock the quiz
                      </p>
                    </div>
                  ) : null}

                  <button
                    onClick={() => setQuizStarted(true)}
                    disabled={currentLesson.videoUrl && !videoWatched}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all ${currentLesson.videoUrl && !videoWatched
                      ? 'bg-htb-gray-dark text-htb-gray cursor-not-allowed opacity-50'
                      : 'htb-btn-primary hover:bg-htb-green/80'
                      }`}
                  >
                    {currentLesson.videoUrl && !videoWatched ? '🔒 Quiz Locked' : '📝 Take Quiz'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-htb-blue/10 border-b border-htb-blue/30">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-htb-gray-light flex items-center space-x-2">
                        <HelpCircle className="h-5 w-5 text-htb-blue" />
                        <span>Lesson Quiz - {currentLesson.quiz.length} Questions</span>
                      </h3>
                      {!quizSubmitted && (
                        <span className="text-sm text-htb-blue">
                          Pass: 80% (4/{currentLesson.quiz.length} correct)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    {currentLesson.quiz.map((question, qIndex) => {
                      const result = quizResults?.results?.[qIndex];
                      const userAnswer = quizAnswers[qIndex];

                      return (
                        <div key={qIndex} className="mb-6 last:mb-0">
                          <p className="text-htb-gray-light font-medium mb-3">
                            {qIndex + 1}. {question.question}
                          </p>
                          <div className="space-y-2">
                            {question.options.map((option, oIndex) => {
                              const isSelected = userAnswer === oIndex;
                              const isCorrect = oIndex === question.correctAnswer;

                              return (
                                <label
                                  key={oIndex}
                                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${quizSubmitted
                                    ? isCorrect
                                      ? 'bg-htb-green/10 border border-htb-green/30'
                                      : isSelected
                                        ? 'bg-red-500/10 border border-red-500/30'
                                        : 'bg-htb-darker/50'
                                    : isSelected
                                      ? 'bg-htb-blue/10 border border-htb-blue/30'
                                      : 'bg-htb-darker/50 hover:bg-htb-darker'
                                    }`}
                                >
                                  <input
                                    type="radio"
                                    name={`q${qIndex}`}
                                    checked={isSelected}
                                    onChange={() => !quizSubmitted && handleQuizAnswer(qIndex, oIndex)}
                                    disabled={quizSubmitted}
                                    className="text-htb-green"
                                  />
                                  <span className={`flex-1 ${quizSubmitted && isCorrect ? 'text-htb-green font-medium' : 'text-htb-gray'
                                    }`}>
                                    {option}
                                  </span>
                                  {quizSubmitted && isCorrect && (
                                    <CheckCircle className="h-5 w-5 text-htb-green" />
                                  )}
                                  {quizSubmitted && isSelected && !isCorrect && (
                                    <span className="text-red-500">✗</span>
                                  )}
                                </label>
                              );
                            })}
                          </div>

                          {quizSubmitted && result && (
                            <div className={`mt-2 p-3 rounded-lg ${result.isCorrect
                              ? 'bg-htb-green/10 border border-htb-green/30'
                              : 'bg-red-500/10 border border-red-500/30'
                              }`}>
                              <p className={`text-sm ${result.isCorrect ? 'text-htb-green' : 'text-red-400'}`}>
                                <strong>{result.isCorrect ? '✓ Correct!' : '✗ Incorrect.'}</strong> {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 border-t border-htb-gray-dark/30">
                    {!quizSubmitted ? (
                      <button
                        onClick={submitQuiz}
                        disabled={Object.keys(quizAnswers).length < currentLesson.quiz.length}
                        className="htb-btn-primary px-6 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4" />
                        <span>Submit Quiz</span>
                      </button>
                    ) : (
                      <div className={`p-4 rounded-lg ${quizResults?.passed
                        ? 'bg-htb-green/10 border border-htb-green/30'
                        : 'bg-red-500/10 border border-red-500/30'
                        }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-semibold ${quizResults?.passed ? 'text-htb-green' : 'text-red-400'
                              }`}>
                              {quizResults?.passed ? '✅ Quiz Passed!' : '❌ Quiz Failed'}
                            </p>
                            <p className="text-sm text-htb-gray mt-1">
                              Score: {quizResults?.correctCount}/{quizResults?.totalQuestions} ({quizResults?.score}%)
                            </p>
                          </div>
                          {!quizResults?.passed && (
                            <button
                              onClick={() => {
                                setQuizSubmitted(false);
                                setQuizAnswers({});
                                setQuizResults(null);
                                setQuizStarted(false);
                              }}
                              className="htb-btn px-4 py-2 rounded-lg text-sm"
                            >
                              Retry Quiz
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={goToPreviousLesson}
              disabled={currentIndex === 0}
              className="htb-btn px-6 py-3 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Previous Lesson</span>
            </button>

            {!isCompleted ? (
              <button
                onClick={completeLesson}
                disabled={!canCompleteLesson()}
                className={`px-6 py-3 rounded-lg flex items-center space-x-2 transition-all ${canCompleteLesson()
                  ? 'htb-btn-primary hover:bg-htb-green/80'
                  : 'bg-htb-gray-dark text-htb-gray cursor-not-allowed opacity-50'
                  }`}
              >
                <CheckCircle className="h-5 w-5" />
                <span>Complete & Continue</span>
              </button>
            ) : (
              <button
                onClick={goToNextLesson}
                className="htb-btn-primary px-6 py-3 rounded-lg flex items-center space-x-2"
              >
                <span>Next Lesson</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Floating Notes Button */}
        <button
          onClick={() => setNotesOpen(!notesOpen)}
          className="fixed bottom-8 right-8 htb-btn-primary p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-20"
          title="Take Notes"
        >
          <StickyNote className="h-6 w-6" />
        </button>

        {/* Notes Panel */}
        {notesOpen && (
          <div className="fixed bottom-24 right-8 w-96 max-h-[600px] htb-card border border-htb-green/30 shadow-2xl z-20 flex flex-col">
            {/* Notes Header */}
            <div className="flex items-center justify-between p-4 border-b border-htb-gray-dark/30">
              <div className="flex items-center space-x-2">
                <StickyNote className="h-5 w-5 text-htb-green" />
                <h3 className="font-semibold text-htb-gray-light">My Notes</h3>
              </div>
              <button
                onClick={() => setNotesOpen(false)}
                className="text-htb-gray hover:text-htb-gray-light transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* New Note Input */}
            <div className="p-4 border-b border-htb-gray-dark/30">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write a note..."
                className="w-full bg-htb-darker text-htb-gray-light border border-htb-gray-dark/30 rounded-lg p-3 focus:outline-none focus:border-htb-green/50 resize-none"
                rows="3"
              />
              <button
                onClick={saveNote}
                disabled={!newNote.trim()}
                className="mt-2 htb-btn-primary px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>Save Note</span>
              </button>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notes.length === 0 ? (
                <p className="text-center text-htb-gray text-sm py-8">
                  No notes yet. Start taking notes!
                </p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note._id}
                    className="bg-htb-darker/50 border border-htb-gray-dark/30 rounded-lg p-3"
                  >
                    {editingNoteId === note._id ? (
                      <div>
                        <textarea
                          value={editingNoteContent}
                          onChange={(e) => setEditingNoteContent(e.target.value)}
                          className="w-full bg-htb-darker text-htb-gray-light border border-htb-gray-dark/30 rounded-lg p-2 focus:outline-none focus:border-htb-green/50 resize-none"
                          rows="3"
                        />
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => updateNote(note._id)}
                            className="htb-btn-primary px-3 py-1 rounded text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingNoteId(null);
                              setEditingNoteContent('');
                            }}
                            className="htb-btn px-3 py-1 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-htb-gray-light text-sm whitespace-pre-wrap">
                          {note.content}
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-htb-gray-dark/30">
                          <span className="text-xs text-htb-gray">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingNoteId(note._id);
                                setEditingNoteContent(note.content);
                              }}
                              className="text-htb-blue hover:text-htb-blue/80 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteNote(note._id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div >
    </>
  );
};

export default LessonViewer;
