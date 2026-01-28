import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PaymentModal from '../components/PaymentModal'; // Import PaymentModal
import {
  Clock,
  Users,
  BookOpen,
  CheckCircle,
  Play,
  Lock,
  Award,
  HelpCircle,
  Trophy,
  Target,
  FileText,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [enrolling, setEnrolling] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchCourseData();
    if (user) {
      fetchProgress();
    }
  }, [id, user]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    window.onYouTubeIframeAPIReady = () => console.log('YouTube IFrame API ready');
  }, []);

  const fetchCourseData = async () => {
    try {
      const response = await fetch(`/api/courses/${id}`);
      if (response.ok) {
        setCourse(await response.json());
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/progress/detailed/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        setProgress(await response.json());
        setEnrolled(true);
      } else if (response.status === 404) {
        setEnrolled(false);
        setProgress(null);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      setEnrolled(false);
    }
  };

  const handleEnrollClick = () => {
    if (!user) {
      alert('Please login to enroll');
      navigate('/login');
      return;
    }

    // Normal paid course logic
    if (course.price && course.price > 0 && !enrolled) {
      setShowPaymentModal(true);
    } else {
      handleEnroll();
    }
  };

  const onPaymentSuccess = () => {
    setShowPaymentModal(false);
    fetchProgress();
    alert('Payment successful! You are now enrolled.');
    setEnrolled(true);
  };

  const handleEnroll = async () => {
    if (enrolling) return;
    setEnrolling(true);
    try {
      const response = await fetch(`/api/courses/${id}/enroll`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        setEnrolled(true);
        setTimeout(fetchProgress, 500);
        alert('Successfully enrolled in course!');
      } else {
        const errorData = await response.json();
        alert(`Enrollment failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error enrolling:', error);
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!window.confirm('Are you sure? All progress will be lost.')) return;
    setEnrolling(true);
    try {
      const response = await fetch(`/api/courses/${id}/unenroll`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        setEnrolled(false);
        setProgress(null);
        alert('Unenrolled successfully');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setEnrolling(false);
    }
  };

  const isLessonCompleted = (lessonId) => progress?.completedLessons?.some(l => l.lessonId === lessonId);

  // Simplified render parts for reconstruction
  if (loading) return <div className="p-8 text-center text-white">Loading...</div>;
  if (!course) return <div className="p-8 text-center text-white">Course not found</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="htb-card rounded-lg p-8">
        <h1 className="text-3xl font-bold text-white mb-4">{course.title}</h1>
        <p className="text-gray-400 mb-6">{course.description}</p>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.estimatedDuration} hrs</span>
            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {course.lessons?.length || 0} lessons</span>
          </div>

          <div className="w-full md:w-auto flex flex-col gap-2">
            <button
              onClick={handleEnrollClick}
              disabled={enrolling || (enrolled && !progress)} // Enable if enrolled to show status or if not enrolled
              className={`px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${enrolled
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'htb-btn-primary'}`}
            >
              {enrolled ? (
                <><CheckCircle className="w-5 h-5" /> Already Enrolled</>
              ) : enrolling ? 'Processing...' : (
                course.price > 0 ? `Enroll for $${course.price}` : 'Enroll Now'
              )}
            </button>
            {enrolled && (
              <button onClick={handleUnenroll} className="text-red-500 text-xs hover:underline">Unenroll</button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700 pb-1">
        {['overview', 'lessons'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 capitalize ${activeTab === tab ? 'text-htb-green border-b-2 border-htb-green' : 'text-gray-400 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="htb-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Learning Objectives</h3>
              <ul className="space-y-2">
                {course.learningObjectives?.map((obj, i) => (
                  <li key={i} className="flex gap-2 text-gray-400">
                    <Target className="w-5 h-5 text-htb-green shrink-0" />
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
            <div className="htb-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Prerequisites</h3>
              <ul className="space-y-2">
                {course.prerequisites?.map((pre, i) => (
                  <li key={i} className="flex gap-2 text-gray-400">
                    <FileText className="w-5 h-5 text-htb-blue shrink-0" />
                    {pre}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="space-y-4">
            {course.lessons?.map((lesson, index) => {
              const isCompleted = isLessonCompleted(lesson.lessonId);
              const isLocked = !enrolled && index > 0; // Simplified locking logic

              return (
                <div key={lesson.lessonId} className={`htb-card p-4 flex items-center justify-between ${isLocked ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-4">
                    {isLocked ? <Lock className="w-6 h-6 text-gray-500" /> : <Play className="w-6 h-6 text-htb-green" />}
                    <div>
                      <h4 className="text-white font-bold">{lesson.title}</h4>
                      <div className="text-xs text-gray-500">{lesson.duration} mins</div>
                    </div>
                  </div>
                  <div>
                    {enrolled && !isLocked && (
                      <Link to={`/courses/${id}/lesson/${lesson.lessonId}`} className="htb-btn text-xs px-4 py-2">
                        Start
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        course={course}
        onSuccess={onPaymentSuccess}
      />
    </div>
  );
};

export default CourseDetail;