import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Award, TrendingUp, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/progress/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProgressData(data);
        console.log('Dashboard data loaded:', data);
      } else {
        console.error('Failed to fetch progress data, status:', response.status);
        // Show empty state instead of mock data
        setProgressData({
          stats: {
            totalCourses: 0,
            completedCourses: 0,
            inProgressCourses: 0,
            totalTimeSpent: 0
          },
          courses: []
        });
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      // Show empty state instead of mock data
      setProgressData({
        stats: {
          totalCourses: 0,
          completedCourses: 0,
          inProgressCourses: 0,
          totalTimeSpent: 0
        },
        courses: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (courseId) => {
    if (!window.confirm('Are you sure you want to unenroll? All progress will be lost.')) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}/unenroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Optimistically update UI
        setProgressData(prev => ({
          ...prev,
          courses: prev.courses.filter(c => c.course._id !== courseId)
        }));
        // Re-fetch to be sure
        fetchProgressData();
        alert('Successfully unenrolled');
      } else {
        alert('Failed to unenroll');
      }
    } catch (error) {
      console.error('Error unenrolling:', error);
    }
  };

  // Fallback mock data
  const mockProgressData = {
    stats: {
      totalCourses: 6,
      completedCourses: 2,
      inProgressCourses: 3,
      totalTimeSpent: 7200 // 120 hours in minutes
    },
    courses: [
      {
        _id: '1',
        course: {
          _id: '1',
          title: 'Introduction to Cybersecurity',
          category: 'Security Awareness',
          difficulty: 'beginner',
          thumbnail: null
        },
        overallProgress: 100,
        isCompleted: true,
        lastAccessedAt: new Date('2024-01-15')
      },
      {
        _id: '2',
        course: {
          _id: '2',
          title: 'Network Security Fundamentals',
          category: 'Network Security',
          difficulty: 'intermediate',
          thumbnail: null
        },
        overallProgress: 75,
        isCompleted: false,
        lastAccessedAt: new Date('2024-01-20')
      },
      {
        _id: '3',
        course: {
          _id: '3',
          title: 'Ethical Hacking and Penetration Testing',
          category: 'Ethical Hacking',
          difficulty: 'advanced',
          thumbnail: null
        },
        overallProgress: 45,
        isCompleted: false,
        lastAccessedAt: new Date('2024-01-18')
      },
      {
        _id: '4',
        course: {
          _id: '4',
          title: 'Web Application Security',
          category: 'Web Security',
          difficulty: 'intermediate',
          thumbnail: null
        },
        overallProgress: 100,
        isCompleted: true,
        lastAccessedAt: new Date('2024-01-10')
      },
      {
        _id: '5',
        course: {
          _id: '5',
          title: 'Digital Forensics Investigation',
          category: 'Digital Forensics',
          difficulty: 'advanced',
          thumbnail: null
        },
        overallProgress: 20,
        isCompleted: false,
        lastAccessedAt: new Date('2024-01-22')
      }
    ]
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-htb-green mx-auto mb-4"></div>
          <p className="text-htb-gray">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const { stats, courses } = progressData || { stats: { totalCourses: 0, completedCourses: 0, inProgressCourses: 0, totalTimeSpent: 0 }, courses: [] };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-htb-gray-light matrix-text">Dashboard</h1>
        <Link
          to="/courses"
          className="htb-btn-primary px-4 py-2 rounded-lg transition-colors w-full md:w-auto text-center"
        >
          Browse Courses
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="htb-card p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-htb-gray">Total Courses</p>
              <p className="text-2xl font-bold text-htb-gray-light font-mono">{stats.totalCourses}</p>
            </div>
            <BookOpen className="h-8 w-8 text-htb-green" />
          </div>
        </div>

        <div className="htb-card p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-htb-gray">Completed</p>
              <p className="text-2xl font-bold text-htb-green font-mono">{stats.completedCourses}</p>
            </div>
            <Award className="h-8 w-8 text-htb-green" />
          </div>
        </div>

        <div className="htb-card p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-htb-gray">In Progress</p>
              <p className="text-2xl font-bold text-htb-blue font-mono">{stats.inProgressCourses}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-htb-blue" />
          </div>
        </div>

        <div className="htb-card p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-htb-gray">Time Spent</p>
              <p className="text-2xl font-bold text-htb-orange font-mono">{Math.round(stats.totalTimeSpent / 60)}h</p>
            </div>
            <Clock className="h-8 w-8 text-htb-orange" />
          </div>
        </div>
      </div>

      {/* Course Progress */}
      <div className="htb-card rounded-lg p-6">
        <h2 className="text-xl font-bold text-htb-gray-light mb-6 matrix-text">Your Courses</h2>

        {courses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-16 w-16 text-htb-gray mx-auto mb-4" />
            <h3 className="text-lg font-medium text-htb-gray-light mb-2">No courses enrolled</h3>
            <p className="text-htb-gray mb-4">Start your cybersecurity journey by enrolling in a course</p>
            <Link
              to="/courses"
              className="htb-btn-primary px-6 py-2 rounded-lg transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((progress) => (
              <div key={progress._id} className="border border-htb-gray-dark/30 rounded-lg p-4 hover:border-htb-green/50 transition-all group">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-3 gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-htb-gray-light">{progress.course.title}</h3>
                    <p className="text-sm text-htb-gray">{progress.course.category}</p>
                  </div>
                  <div className="flex items-center justify-between w-full md:w-auto space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-htb-gray-light font-mono">{progress.overallProgress}%</p>
                      <p className="text-xs text-htb-gray">Complete</p>
                    </div>
                    <Link
                      to={`/courses/${progress.course._id}`}
                      className="flex items-center space-x-1 htb-btn text-sm px-3 py-1 rounded transition-colors"
                    >
                      <Play className="h-3 w-3" />
                      <span>Continue</span>
                    </Link>
                    <button
                      onClick={() => handleUnenroll(progress.course._id)}
                      className="text-xs text-red-500 hover:text-red-400 underline"
                    >
                      Unenroll
                    </button>
                  </div>
                </div>

                <div className="w-full bg-htb-black rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-htb-green to-htb-blue h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.overallProgress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;