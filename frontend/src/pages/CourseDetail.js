import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PaymentModal from '../components/PaymentModal';
import DiscussionForum from '../components/DiscussionForum';
import { API_URL } from '../config/api';
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

  const staticCourses = [
    {
      _id: '1',
      title: 'Introduction to Cybersecurity',
      description: 'Learn the fundamentals of cybersecurity including threat landscape, security principles, and basic defense mechanisms.',
      estimatedDuration: 8,
      price: 0,
      learningObjectives: ['Understand basic cybersecurity terminology', 'Identify common threats', 'Learn defense mechanisms'],
      prerequisites: ['Basic computer literacy'],
      lessons: [
        { lessonId: 'l1-1', title: 'What is Cybersecurity?', duration: 15 },
        { lessonId: 'l1-2', title: 'Threat Landscape', duration: 25 },
        { lessonId: 'l1-3', title: 'Defense Basics', duration: 30 }
      ]
    },
    {
      _id: '2',
      title: 'Network Security Fundamentals',
      description: 'Master network security concepts, firewalls, intrusion detection systems, and network monitoring techniques.',
      estimatedDuration: 12,
      price: 49.99,
      learningObjectives: ['Configure firewalls', 'Understand IDS/IPS concepts', 'Network monitoring basics'],
      prerequisites: ['Basic networking knowledge'],
      lessons: [
        { lessonId: 'l2-1', title: 'Network Basics Review', duration: 20 },
        { lessonId: 'l2-2', title: 'Firewall Configuration', duration: 40 },
        { lessonId: 'l2-3', title: 'IDS/IPS Systems', duration: 45 }
      ]
    },
    {
      _id: '3',
      title: 'Ethical Hacking and Penetration Testing',
      description: 'Advanced course covering ethical hacking methodologies, penetration testing frameworks, and vulnerability assessment.',
      estimatedDuration: 20,
      price: 99.99,
      learningObjectives: ['Conduct vulnerability assessments', 'Learn penetration testing frameworks', 'Ethical hacking methodologies'],
      prerequisites: ['Network Security Fundamentals', 'Basic Linux command line'],
      lessons: [
        { lessonId: 'l3-1', title: 'Reconnaissance Phase', duration: 30 },
        { lessonId: 'l3-2', title: 'Scanning and Enumeration', duration: 45 },
        { lessonId: 'l3-3', title: 'Exploitation Basics', duration: 60 }
      ]
    },
    {
      _id: '4',
      title: 'Web Application Security',
      description: 'Learn to secure web applications against OWASP Top 10 vulnerabilities and modern attack vectors.',
      estimatedDuration: 15,
      price: 79.99,
      learningObjectives: ['Understand OWASP Top 10', 'Identify XSS and SQLi', 'Secure web applications'],
      prerequisites: ['Basic web development (HTML, JS)', 'Understanding of HTTP protocol'],
      lessons: [
        { lessonId: 'l4-1', title: 'OWASP Top 10 Overview', duration: 25 },
        { lessonId: 'l4-2', title: 'Cross-Site Scripting (XSS)', duration: 35 },
        { lessonId: 'l4-3', title: 'SQL Injection', duration: 40 }
      ]
    },
    {
      _id: '5',
      title: 'Digital Forensics Investigation',
      description: 'Master digital forensics techniques for incident response and cybercrime investigation.',
      estimatedDuration: 18,
      price: 89.99,
      learningObjectives: ['Perform digital forensics', 'Incident response handling', 'Cybercrime investigation techniques'],
      prerequisites: ['Basic operating system internals'],
      lessons: [
        { lessonId: 'l5-1', title: 'Introduction to Forensics', duration: 20 },
        { lessonId: 'l5-2', title: 'Disk Imaging and Analysis', duration: 50 },
        { lessonId: 'l5-3', title: 'Memory Forensics', duration: 45 }
      ]
    },
    {
      _id: '6',
      title: 'Cryptography and Data Protection',
      description: 'Understand cryptographic algorithms, key management, and data protection strategies.',
      estimatedDuration: 14,
      price: 59.99,
      learningObjectives: ['Understand symmetric vs asymmetric encryption', 'Key management principles', 'Data protection strategies'],
      prerequisites: ['Basic mathematics knowledge'],
      lessons: [
        { lessonId: 'l6-1', title: 'History of Cryptography', duration: 15 },
        { lessonId: 'l6-2', title: 'Symmetric Encryption', duration: 35 },
        { lessonId: 'l6-3', title: 'Asymmetric Encryption Data', duration: 40 }
      ]
    }
  ];

  const fetchCourseData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/courses/${id}`);
      if (response.ok) {
        setCourse(await response.json());
      } else {
        throw new Error('Course not found on server');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      // Fallback to static data
      const staticCourse = staticCourses.find(c => c._id === id);
      if (staticCourse) {
        setCourse(staticCourse);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch(`${API_URL}/api/progress/detailed/${id}`, {
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
      const response = await fetch(`${API_URL}/api/courses/${id}/enroll`, {
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
      const response = await fetch(`${API_URL}/api/courses/${id}/unenroll`, {
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
        {['overview', 'lessons', 'discussion'].map(tab => (
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
                    {isLocked ? (
                      <Lock className="w-6 h-6 text-gray-500" />
                    ) : isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-htb-green" />
                    ) : (
                      <Play className="w-6 h-6 text-htb-green" />
                    )}
                    <div>
                      <h4 className="text-white font-bold">{lesson.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{lesson.duration} mins</span>
                        {isCompleted && <span className="text-xs text-htb-green font-medium">✓ Completed</span>}
                      </div>
                    </div>
                  </div>
                  <div>
                    {enrolled && !isLocked && (
                      <Link to={`/courses/${id}/lesson/${lesson.lessonId}`} className={`text-xs px-4 py-2 rounded ${isCompleted ? 'htb-btn opacity-70' : 'htb-btn-primary'}`}>
                        {isCompleted ? 'Review' : 'Start'}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'discussion' && (
          <div>
            {enrolled ? (
              <DiscussionForum courseId={id} />
            ) : (
              <div className="htb-card p-8 text-center">
                <p className="text-htb-gray mb-4">Enroll in this course to access the discussion forum</p>
                <button onClick={handleEnroll} className="htb-btn-primary px-6 py-2 rounded-lg">
                  Enroll Now
                </button>
              </div>
            )}
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