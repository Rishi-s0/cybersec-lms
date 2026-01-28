import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  Shield, 
  Activity,
  Settings,
  BarChart3,
  UserCheck,
  AlertTriangle,
  Database,
  Globe,
  Clock,
  Target
} from 'lucide-react';
import CourseForm from '../components/CourseForm';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    activeStudents: 0,
    completionRate: 0
  });
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [dbData, setDbData] = useState({
    users: [],
    courses: [],
    progress: []
  });
  const [selectedCollection, setSelectedCollection] = useState('users');

  // Fetch admin data
  useEffect(() => {
    fetchAdminData();
  }, []);

  // Fetch database data for database viewer
  const fetchDatabaseData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch all collections
      const [usersRes, coursesRes, progressRes] = await Promise.all([
        fetch('/api/admin/database/users', { headers }),
        fetch('/api/admin/database/courses', { headers }),
        fetch('/api/admin/database/progress', { headers })
      ]);

      const dbData = {
        users: usersRes.ok ? await usersRes.json() : [],
        courses: coursesRes.ok ? await coursesRes.json() : [],
        progress: progressRes.ok ? await progressRes.json() : []
      };

      setDbData(dbData);
    } catch (error) {
      console.error('Error fetching database data:', error);
      // Use existing data as fallback
      setDbData({
        users: users,
        courses: courses,
        progress: []
      });
    }
  };

  // Reset sample data
  const handleResetSampleData = async () => {
    if (window.confirm('Are you sure you want to reset all data to sample data? This will delete all existing data!')) {
      try {
        const response = await fetch('/api/admin/reset-sample-data', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          alert('Sample data reset successfully!');
          fetchAdminData();
          fetchDatabaseData();
        } else {
          throw new Error('Failed to reset sample data');
        }
      } catch (error) {
        console.error('Error resetting sample data:', error);
        alert('Error resetting sample data. Check console for details.');
      }
    }
  };

  const fetchAdminData = async () => {
    try {
      // Fetch users
      const usersResponse = await fetch('/api/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      // Fetch courses (admin route to get all courses including unpublished)
      const coursesResponse = await fetch('/api/courses/admin/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData);
      }

      // Calculate stats
      setStats({
        totalUsers: users.length,
        totalCourses: courses.length,
        activeStudents: users.filter(u => u.role === 'student').length,
        completionRate: 78 // Mock data
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      // Mock data for demo
      setUsers([
        { _id: '1', username: 'student1', email: 'student1@hackademy.com', role: 'student', createdAt: new Date() },
        { _id: '2', username: 'admin1', email: 'admin1@hackademy.com', role: 'admin', createdAt: new Date() },
        { _id: '3', username: 'student2', email: 'student2@hackademy.com', role: 'student', createdAt: new Date() }
      ]);
      setCourses([
        { _id: '1', title: 'Introduction to Cybersecurity', category: 'Security Awareness', difficulty: 'beginner', isPublished: true },
        { _id: '2', title: 'Network Security Fundamentals', category: 'Network Security', difficulty: 'intermediate', isPublished: true },
        { _id: '3', title: 'Ethical Hacking', category: 'Ethical Hacking', difficulty: 'advanced', isPublished: false }
      ]);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
        if (response.ok) {
          setUsers(users.filter(u => u._id !== userId));
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleDeleteCourse = async (courseId) => {
    const course = courses.find(c => c._id === courseId);
    const confirmMessage = `Are you sure you want to delete "${course?.title}"?\n\nThis action cannot be undone and will remove all course content and student progress.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        const response = await fetch(`/api/courses/${courseId}`, { 
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          setCourses(courses.filter(c => c._id !== courseId));
          alert('Course deleted successfully!');
        } else {
          const errorData = await response.json();
          alert(`Failed to delete course: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting course:', error);
        // Fallback for demo - remove from local state
        setCourses(courses.filter(c => c._id !== courseId));
        alert('Course deleted successfully! (Demo mode)');
      }
    }
  };

  const handleSaveCourse = async (courseData) => {
    try {
      // Get current user ID for instructor field
      const token = localStorage.getItem('token');
      const userResponse = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await userResponse.json();
      const instructorId = userData.user?.id || userData.user?._id;
      
      // Add instructor fields to course data
      const courseDataWithInstructor = {
        ...courseData,
        instructorId: instructorId,
        instructor: instructorId
      };
      
      const url = editingCourse ? `/api/courses/${editingCourse._id}` : '/api/courses';
      const method = editingCourse ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(courseDataWithInstructor)
      });

      if (response.ok) {
        const savedCourse = await response.json();
        
        if (editingCourse) {
          setCourses(courses.map(c => c._id === editingCourse._id ? savedCourse : c));
          alert('Course updated successfully!');
        } else {
          setCourses([savedCourse, ...courses]);
          alert('Course created successfully!');
        }
        
        setShowCourseForm(false);
        setEditingCourse(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save course');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      
      // Fallback for demo mode
      if (editingCourse) {
        const updatedCourse = { ...editingCourse, ...courseData };
        setCourses(courses.map(c => c._id === editingCourse._id ? updatedCourse : c));
        alert('Course updated successfully! (Demo mode)');
      } else {
        const newCourse = { 
          _id: Date.now().toString(), 
          ...courseData,
          createdAt: new Date()
        };
        setCourses([newCourse, ...courses]);
        alert('Course created successfully! (Demo mode)');
      }
      
      setShowCourseForm(false);
      setEditingCourse(null);
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowCourseForm(true);
  };

  const handleCancelCourseForm = () => {
    setShowCourseForm(false);
    setEditingCourse(null);
  };

  const toggleCoursePublish = async (courseId, currentStatus) => {
    const course = courses.find(c => c._id === courseId);
    const action = currentStatus ? 'unpublish' : 'publish';
    
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isPublished: !currentStatus })
      });
      
      if (response.ok) {
        setCourses(courses.map(c => 
          c._id === courseId ? { ...c, isPublished: !currentStatus } : c
        ));
        alert(`Course "${course?.title}" ${action}ed successfully!`);
      } else {
        const errorData = await response.json();
        alert(`Failed to ${action} course: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating course:', error);
      // Fallback for demo mode
      setCourses(courses.map(c => 
        c._id === courseId ? { ...c, isPublished: !currentStatus } : c
      ));
      alert(`Course "${course?.title}" ${action}ed successfully! (Demo mode)`);
    }
  };

  const AdminOverview = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="htb-card p-6 text-center htb-glow">
          <Users className="h-8 w-8 text-htb-green mx-auto mb-4" />
          <div className="text-2xl font-bold text-htb-gray-light font-mono">{users.length}</div>
          <div className="text-sm text-htb-gray">Total Users</div>
        </div>
        
        <div className="htb-card p-6 text-center htb-glow">
          <BookOpen className="h-8 w-8 text-htb-blue mx-auto mb-4" />
          <div className="text-2xl font-bold text-htb-gray-light font-mono">{courses.length}</div>
          <div className="text-sm text-htb-gray">Total Courses</div>
        </div>
        
        <div className="htb-card p-6 text-center htb-glow">
          <UserCheck className="h-8 w-8 text-htb-orange mx-auto mb-4" />
          <div className="text-2xl font-bold text-htb-gray-light font-mono">{users.filter(u => u.role === 'student').length}</div>
          <div className="text-sm text-htb-gray">Active Students</div>
        </div>
        
        <div className="htb-card p-6 text-center htb-glow">
          <BarChart3 className="h-8 w-8 text-htb-green mx-auto mb-4" />
          <div className="text-2xl font-bold text-htb-gray-light font-mono">78%</div>
          <div className="text-sm text-htb-gray">Completion Rate</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="htb-card p-6">
        <h3 className="text-xl font-bold text-htb-gray-light mb-6 matrix-text">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setShowCourseForm(true)}
            className="htb-btn-primary p-4 rounded-lg flex items-center space-x-3"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Course</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('users')}
            className="htb-btn p-4 rounded-lg flex items-center space-x-3"
          >
            <Users className="h-5 w-5" />
            <span>Manage Users</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('system')}
            className="htb-btn p-4 rounded-lg flex items-center space-x-3"
          >
            <Settings className="h-5 w-5" />
            <span>System Settings</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="htb-card p-6">
        <h3 className="text-xl font-bold text-htb-gray-light mb-6 matrix-text">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-3 bg-htb-darker/30 rounded-lg">
            <UserCheck className="h-5 w-5 text-htb-green" />
            <div>
              <p className="text-htb-gray-light font-mono">New user registered: student3@hackademy.com</p>
              <p className="text-xs text-htb-gray">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-3 bg-htb-darker/30 rounded-lg">
            <BookOpen className="h-5 w-5 text-htb-blue" />
            <div>
              <p className="text-htb-gray-light font-mono">Course completed: Network Security Fundamentals</p>
              <p className="text-xs text-htb-gray">4 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-3 bg-htb-darker/30 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-htb-orange" />
            <div>
              <p className="text-htb-gray-light font-mono">System backup completed successfully</p>
              <p className="text-xs text-htb-gray">6 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const UserManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-htb-gray-light matrix-text">User Management</h3>
        <button className="htb-btn-primary px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </button>
      </div>

      <div className="htb-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-htb-darker/50">
              <tr>
                <th className="text-left p-4 text-htb-green font-mono">Username</th>
                <th className="text-left p-4 text-htb-green font-mono">Email</th>
                <th className="text-left p-4 text-htb-green font-mono">Role</th>
                <th className="text-left p-4 text-htb-green font-mono">Joined</th>
                <th className="text-left p-4 text-htb-green font-mono">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-t border-htb-gray-dark/30 hover:bg-htb-darker/20">
                  <td className="p-4 text-htb-gray-light font-mono">{user.username}</td>
                  <td className="p-4 text-htb-gray-light">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-htb-red/20 text-htb-red' :
                      'bg-htb-green/20 text-htb-green'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-htb-gray font-mono text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button className="text-htb-blue hover:text-htb-green transition-colors">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-htb-red hover:text-htb-orange transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const CourseManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-htb-gray-light matrix-text">Course Management</h3>
        <button 
          onClick={() => setShowCourseForm(true)}
          className="htb-btn-primary px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Course</span>
        </button>
      </div>

      <div className="grid gap-6">
        {courses.length === 0 ? (
          <div className="htb-card p-8 text-center">
            <BookOpen className="h-12 w-12 text-htb-gray mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-htb-gray-light mb-2">No Courses Yet</h4>
            <p className="text-htb-gray mb-4">Create your first course to get started.</p>
            <button 
              onClick={() => setShowCourseForm(true)}
              className="htb-btn-primary px-6 py-2 rounded-lg flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Create First Course</span>
            </button>
          </div>
        ) : (
          courses.map(course => (
            <div key={course._id} className="htb-card p-6 htb-glow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h4 className="text-lg font-semibold text-htb-gray-light">{course.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.isPublished ? 'bg-htb-green/20 text-htb-green' : 'bg-htb-orange/20 text-htb-orange'
                    }`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  
                  <p className="text-htb-gray text-sm mb-3 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-htb-gray">
                    <span className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4" />
                      <span>Category: {course.category}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Target className="h-4 w-4" />
                      <span>Difficulty: {course.difficulty}</span>
                    </span>
                    {course.lessons && (
                      <span className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{course.lessons.length} lessons</span>
                      </span>
                    )}
                    {course.estimatedDuration && (
                      <span className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.estimatedDuration}h</span>
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => toggleCoursePublish(course._id, course.isPublished)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      course.isPublished 
                        ? 'bg-htb-orange/20 text-htb-orange hover:bg-htb-orange/30' 
                        : 'bg-htb-green/20 text-htb-green hover:bg-htb-green/30'
                    }`}
                    title={course.isPublished ? 'Unpublish course' : 'Publish course'}
                  >
                    {course.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  
                  <button 
                    onClick={() => handleEditCourse(course)}
                    className="text-htb-blue hover:text-htb-green transition-colors p-2 rounded hover:bg-htb-blue/10"
                    title="Edit course"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteCourse(course._id)}
                    className="text-htb-red hover:text-htb-orange transition-colors p-2 rounded hover:bg-htb-red/10"
                    title="Delete course"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const SystemSettings = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-htb-gray-light matrix-text">System Settings</h3>
      
      <div className="grid gap-6">
        <div className="htb-card p-6">
          <h4 className="text-lg font-semibold text-htb-gray-light mb-4 flex items-center space-x-2">
            <Database className="h-5 w-5 text-htb-green" />
            <span>Database Management</span>
          </h4>
          <div className="space-y-4">
            <button 
              onClick={() => setActiveTab('database')}
              className="htb-btn-primary px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Database className="h-4 w-4" />
              <span>View Database Records</span>
            </button>
            <button className="htb-btn px-4 py-2 rounded-lg">Backup Database</button>
            <button 
              onClick={handleResetSampleData}
              className="htb-btn px-4 py-2 rounded-lg"
            >
              Reset Sample Data
            </button>
            <button className="htb-btn px-4 py-2 rounded-lg">Export User Data</button>
          </div>
        </div>

        <div className="htb-card p-6">
          <h4 className="text-lg font-semibold text-htb-gray-light mb-4 flex items-center space-x-2">
            <Globe className="h-5 w-5 text-htb-green" />
            <span>Threat Intelligence APIs</span>
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-htb-darker/30 rounded-lg">
              <span className="text-htb-gray-light font-mono">OTX API</span>
              <span className="text-htb-green text-sm">Connected</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-htb-darker/30 rounded-lg">
              <span className="text-htb-gray-light font-mono">AbuseIPDB</span>
              <span className="text-htb-green text-sm">Connected</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-htb-darker/30 rounded-lg">
              <span className="text-htb-gray-light font-mono">VirusTotal</span>
              <span className="text-htb-green text-sm">Connected</span>
            </div>
          </div>
        </div>

        <div className="htb-card p-6">
          <h4 className="text-lg font-semibold text-htb-gray-light mb-4 flex items-center space-x-2">
            <Shield className="h-5 w-5 text-htb-green" />
            <span>Security Settings</span>
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-htb-gray-light">Two-Factor Authentication</span>
              <button className="htb-btn-primary px-3 py-1 rounded text-sm">Enable</button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-htb-gray-light">Session Timeout</span>
              <select className="htb-input px-3 py-1 rounded">
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const DatabaseViewer = () => {
    useEffect(() => {
      fetchDatabaseData();
    }, []);

    const collections = [
      { id: 'users', label: 'Users', icon: Users, data: dbData.users },
      { id: 'courses', label: 'Courses', icon: BookOpen, data: dbData.courses },
      { id: 'progress', label: 'Progress', icon: BarChart3, data: dbData.progress }
    ];

    const selectedData = collections.find(c => c.id === selectedCollection)?.data || [];

    const renderValue = (value) => {
      if (value === null || value === undefined) return 'null';
      if (typeof value === 'boolean') return value.toString();
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          return `[${value.length} items]`;
        }
        return JSON.stringify(value, null, 2);
      }
      if (typeof value === 'string' && value.length > 50) {
        return value.substring(0, 50) + '...';
      }
      return value.toString();
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-htb-gray-light matrix-text">Database Viewer</h3>
          <button 
            onClick={fetchDatabaseData}
            className="htb-btn px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Activity className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Collection Selector */}
        <div className="htb-card p-4">
          <div className="flex space-x-2">
            {collections.map(collection => {
              const Icon = collection.icon;
              return (
                <button
                  key={collection.id}
                  onClick={() => setSelectedCollection(collection.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    selectedCollection === collection.id
                      ? 'bg-htb-green/20 text-htb-green border border-htb-green/30'
                      : 'text-htb-gray hover:text-htb-green hover:bg-htb-darker/30'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-mono">{collection.label}</span>
                  <span className="text-xs bg-htb-darker/50 px-2 py-1 rounded">
                    {collection.data.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Data Display */}
        <div className="htb-card">
          <div className="p-4 border-b border-htb-gray-dark/30">
            <h4 className="text-lg font-semibold text-htb-gray-light flex items-center space-x-2">
              <Database className="h-5 w-5 text-htb-green" />
              <span>{selectedCollection.charAt(0).toUpperCase() + selectedCollection.slice(1)} Collection</span>
              <span className="text-sm text-htb-gray">({selectedData.length} records)</span>
            </h4>
          </div>

          {selectedData.length === 0 ? (
            <div className="p-8 text-center">
              <Database className="h-12 w-12 text-htb-gray mx-auto mb-4" />
              <p className="text-htb-gray">No records found in {selectedCollection} collection</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-htb-darker/50">
                  <tr>
                    {selectedData.length > 0 && Object.keys(selectedData[0]).map(key => (
                      <th key={key} className="text-left p-3 text-htb-green font-mono text-sm">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedData.map((record, index) => (
                    <tr key={record._id || index} className="border-t border-htb-gray-dark/30 hover:bg-htb-darker/20">
                      {Object.entries(record).map(([key, value]) => (
                        <td key={key} className="p-3 text-htb-gray-light text-sm font-mono max-w-xs">
                          <div className="truncate" title={typeof value === 'object' ? JSON.stringify(value) : value}>
                            {renderValue(value)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Database Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {collections.map(collection => {
            const Icon = collection.icon;
            return (
              <div key={collection.id} className="htb-card p-4 text-center">
                <Icon className="h-8 w-8 text-htb-green mx-auto mb-2" />
                <div className="text-xl font-bold text-htb-gray-light font-mono">
                  {collection.data.length}
                </div>
                <div className="text-sm text-htb-gray">{collection.label}</div>
              </div>
            );
          })}
        </div>

        {/* Database Operations */}
        <div className="htb-card p-6">
          <h4 className="text-lg font-semibold text-htb-gray-light mb-4 flex items-center space-x-2">
            <Activity className="h-5 w-5 text-htb-green" />
            <span>Database Operations</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <button 
              onClick={() => executeTransaction('healthCheck')}
              className="htb-btn px-3 py-2 rounded-lg text-sm flex items-center space-x-2"
            >
              <Shield className="h-4 w-4" />
              <span>Health Check</span>
            </button>
            
            <button 
              onClick={() => executeTransaction('userAnalytics')}
              className="htb-btn px-3 py-2 rounded-lg text-sm flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>User Analytics</span>
            </button>
            
            <button 
              onClick={() => executeTransaction('completionStats')}
              className="htb-btn px-3 py-2 rounded-lg text-sm flex items-center space-x-2"
            >
              <Target className="h-4 w-4" />
              <span>Completion Stats</span>
            </button>
            
            <button 
              onClick={() => executeTransaction('cleanup')}
              className="htb-btn px-3 py-2 rounded-lg text-sm flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Cleanup DB</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Execute database transactions
  const executeTransaction = async (operation) => {
    try {
      const response = await fetch('/api/admin/database/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ operation })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${operation} completed:`, result.result);
        alert(`${operation} completed successfully! Check console for details.`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error(`❌ ${operation} failed:`, error);
      alert(`${operation} failed: ${error.message}`);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'system', label: 'System', icon: Settings }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-htb-gray-light matrix-text">Admin Dashboard</h1>
          <p className="text-htb-gray mt-2">Manage users, courses, and system settings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-htb-green" />
          <span className="text-htb-green font-mono font-semibold">Administrator</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="htb-card p-2">
        <div className="flex space-x-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-htb-green/20 text-htb-green border border-htb-green/30'
                    : 'text-htb-gray hover:text-htb-green hover:bg-htb-darker/30'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-mono">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {showCourseForm ? (
          <CourseForm
            course={editingCourse}
            onSave={handleSaveCourse}
            onCancel={handleCancelCourseForm}
          />
        ) : (
          <>
            {activeTab === 'overview' && <AdminOverview />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'courses' && <CourseManagement />}
            {activeTab === 'database' && <DatabaseViewer />}
            {activeTab === 'system' && <SystemSettings />}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;