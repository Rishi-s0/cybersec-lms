import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Clock, Star, Users } from 'lucide-react';

const Courses = () => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    difficulty: ''
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch courses from API
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');
      if (response.ok) {
        const coursesData = await response.json();
        setCourses(coursesData);
      } else {
        console.error('Failed to fetch courses');
        // Fallback to static data
        setCourses(staticCourses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Fallback to static data
      setCourses(staticCourses);
    } finally {
      setLoading(false);
    }
  };

  // Static course data for fallback
  const staticCourses = [
    {
      _id: '1',
      title: 'Introduction to Cybersecurity',
      description: 'Learn the fundamentals of cybersecurity including threat landscape, security principles, and basic defense mechanisms.',
      category: 'Security Awareness',
      difficulty: 'beginner',
      estimatedDuration: 8,
      enrolledStudents: [1, 2, 3, 4, 5],
      rating: { average: 4.8, count: 156 },
      instructor: { username: 'Dr. Sarah Chen' }
    },
    {
      _id: '2',
      title: 'Network Security Fundamentals',
      description: 'Master network security concepts, firewalls, intrusion detection systems, and network monitoring techniques.',
      category: 'Network Security',
      difficulty: 'intermediate',
      estimatedDuration: 12,
      enrolledStudents: [1, 2, 3],
      rating: { average: 4.7, count: 89 },
      instructor: { username: 'Prof. Mike Johnson' }
    },
    {
      _id: '3',
      title: 'Ethical Hacking and Penetration Testing',
      description: 'Advanced course covering ethical hacking methodologies, penetration testing frameworks, and vulnerability assessment.',
      category: 'Ethical Hacking',
      difficulty: 'advanced',
      estimatedDuration: 20,
      enrolledStudents: [1, 2],
      rating: { average: 4.9, count: 67 },
      instructor: { username: 'Alex Rodriguez' }
    },
    {
      _id: '4',
      title: 'Web Application Security',
      description: 'Learn to secure web applications against OWASP Top 10 vulnerabilities and modern attack vectors.',
      category: 'Web Security',
      difficulty: 'intermediate',
      estimatedDuration: 15,
      enrolledStudents: [1, 2, 3, 4],
      rating: { average: 4.6, count: 124 },
      instructor: { username: 'Emma Thompson' }
    },
    {
      _id: '5',
      title: 'Digital Forensics Investigation',
      description: 'Master digital forensics techniques for incident response and cybercrime investigation.',
      category: 'Digital Forensics',
      difficulty: 'advanced',
      estimatedDuration: 18,
      enrolledStudents: [1],
      rating: { average: 4.8, count: 43 },
      instructor: { username: 'Detective James Wilson' }
    },
    {
      _id: '6',
      title: 'Cryptography and Data Protection',
      description: 'Understand cryptographic algorithms, key management, and data protection strategies.',
      category: 'Cryptography',
      difficulty: 'intermediate',
      estimatedDuration: 14,
      enrolledStudents: [1, 2, 3, 4, 5, 6],
      rating: { average: 4.5, count: 98 },
      instructor: { username: 'Dr. Lisa Park' }
    }
  ];

  const isLoading = false;

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

  const difficulties = ['beginner', 'intermediate', 'advanced'];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Filter courses based on current filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = !filters.search || 
      course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      course.description.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = !filters.category || course.category === filters.category;
    const matchesDifficulty = !filters.difficulty || course.difficulty === filters.difficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-htb-green mx-auto mb-4"></div>
          <p className="text-htb-gray">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-htb-gray-light matrix-text">Courses</h1>
      </div>

      {/* Filters */}
      <div className="htb-card p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-htb-gray" />
            <input
              type="text"
              placeholder="Search courses..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="htb-input w-full pl-10 pr-4 py-2 rounded-lg"
            />
          </div>

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="htb-input px-4 py-2 rounded-lg"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="htb-input px-4 py-2 rounded-lg"
          >
            <option value="">All Levels</option>
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-htb-green"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course._id} className="htb-card rounded-lg overflow-hidden hover:scale-105 transition-all duration-300">
              <div className="h-48 bg-gradient-to-r from-htb-green to-htb-blue flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                  <p className="text-htb-gray-light">{course.category}</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                  </span>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{course.estimatedDuration}h</span>
                  </div>
                </div>

                <p className="text-htb-gray text-sm mb-4 line-clamp-3">
                  {course.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1 text-sm text-htb-gray">
                    <Users className="h-4 w-4" />
                    <span>{course.enrolledStudents?.length || 0} students</span>
                  </div>
                  
                  {course.rating?.count > 0 && (
                    <div className="flex items-center space-x-1 text-sm text-htb-gray">
                      <Star className="h-4 w-4 fill-current text-htb-green" />
                      <span>{course.rating.average.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-htb-gray">
                    By {course.instructor?.username}
                  </div>
                  <Link 
                    to={`/courses/${course._id}`}
                    className="htb-btn-primary px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredCourses && filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">Try adjusting your search filters</p>
        </div>
      )}
    </div>
  );
};

export default Courses;