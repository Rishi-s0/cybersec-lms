import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  CheckCircle,
  Circle,
  Lock,
  Clock,
  Target,
  Shield,
  Network,
  Code,
  Eye,
  Play
} from 'lucide-react';

const Roadmap = () => {
  const { user } = useAuth();
  const [selectedPath, setSelectedPath] = useState('networking');

  // Static data for fast loading
  const mockUserProgress = {
    stats: {
      completedCourses: 3,
      inProgressCourses: 2,
      totalTimeSpent: 7200 // 120 hours
    }
  };

  const certificationPaths = {
    networking: {
      title: 'Network Security Path',
      description: 'Master network security from fundamentals to expert level',
      icon: <Network className="h-6 w-6" />,
      color: 'from-htb-green to-htb-green-light',
      timeline: [
        {
          id: 1,
          title: 'Network+',
          subtitle: 'CompTIA Network+',
          description: 'Foundation networking concepts and protocols',
          duration: '3-4 months',
          difficulty: 'Beginner',
          prerequisites: 'Basic IT knowledge',
          gradient: 'from-green-400 to-emerald-500',
          status: 'completed'
        },
        {
          id: 2,
          title: 'Security+',
          subtitle: 'CompTIA Security+',
          description: 'Core cybersecurity principles and practices',
          duration: '4-5 months',
          difficulty: 'Intermediate',
          prerequisites: 'Network+ or equivalent',
          gradient: 'from-blue-400 to-cyan-500',
          status: 'in-progress'
        },
        {
          id: 3,
          title: 'CCNA',
          subtitle: 'Cisco Certified Network Associate',
          description: 'Cisco networking fundamentals and routing/switching',
          duration: '6-8 months',
          difficulty: 'Intermediate',
          prerequisites: 'Network+ recommended',
          gradient: 'from-purple-400 to-violet-500',
          status: 'available'
        },
        {
          id: 4,
          title: 'CCNP Security',
          subtitle: 'Cisco Certified Network Professional',
          description: 'Advanced Cisco security technologies',
          duration: '8-12 months',
          difficulty: 'Advanced',
          prerequisites: 'CCNA Security',
          gradient: 'from-orange-400 to-red-500',
          status: 'locked'
        },
        {
          id: 5,
          title: 'CCIE Security',
          subtitle: 'Cisco Certified Internetwork Expert',
          description: 'Expert-level Cisco security implementation',
          duration: '12-18 months',
          difficulty: 'Expert',
          prerequisites: 'CCNP Security + 5 years experience',
          gradient: 'from-pink-400 to-rose-500',
          status: 'locked'
        }
      ]
    },
    ethical_hacking: {
      title: 'Ethical Hacking Path',
      description: 'Become a certified ethical hacker and penetration tester',
      icon: <Shield className="h-6 w-6" />,
      color: 'from-htb-orange to-htb-red',
      timeline: [
        {
          id: 1,
          title: 'CEH',
          subtitle: 'Certified Ethical Hacker',
          description: 'Learn ethical hacking methodologies and tools',
          duration: '4-6 months',
          difficulty: 'Intermediate',
          prerequisites: 'Security+ or 2 years experience',
          gradient: 'from-red-400 to-pink-500',
          status: 'available'
        },
        {
          id: 2,
          title: 'OSCP',
          subtitle: 'Offensive Security Certified Professional',
          description: 'Hands-on penetration testing certification',
          duration: '6-12 months',
          difficulty: 'Advanced',
          prerequisites: 'CEH + practical experience',
          gradient: 'from-indigo-400 to-purple-500',
          status: 'locked'
        },
        {
          id: 3,
          title: 'CISSP',
          subtitle: 'Certified Information Systems Security Professional',
          description: 'Advanced security management and architecture',
          duration: '8-12 months',
          difficulty: 'Expert',
          prerequisites: '5 years security experience',
          gradient: 'from-emerald-400 to-teal-500',
          status: 'locked'
        },
        {
          id: 4,
          title: 'OSEE',
          subtitle: 'Offensive Security Exploitation Expert',
          description: 'Advanced exploit development and research',
          duration: '12-18 months',
          difficulty: 'Expert',
          prerequisites: 'OSCP + advanced programming',
          gradient: 'from-yellow-400 to-orange-500',
          status: 'locked'
        }
      ]
    },
    cloud_security: {
      title: 'Cloud Security Path',
      description: 'Specialize in cloud security across major platforms',
      icon: <Code className="h-6 w-6" />,
      color: 'from-htb-blue to-htb-purple',
      timeline: [
        {
          id: 1,
          title: 'AWS SAA',
          subtitle: 'AWS Solutions Architect Associate',
          description: 'AWS cloud fundamentals and architecture',
          duration: '3-4 months',
          difficulty: 'Intermediate',
          prerequisites: 'Basic cloud knowledge',
          gradient: 'from-blue-400 to-sky-500',
          status: 'available'
        },
        {
          id: 2,
          title: 'AWS Security',
          subtitle: 'AWS Certified Security - Specialty',
          description: 'AWS security services and best practices',
          duration: '4-6 months',
          difficulty: 'Advanced',
          prerequisites: 'AWS SAA + Security+',
          gradient: 'from-cyan-400 to-blue-500',
          status: 'locked'
        },
        {
          id: 3,
          title: 'Azure Security',
          subtitle: 'Microsoft Azure Security Engineer',
          description: 'Azure security implementation and management',
          duration: '4-6 months',
          difficulty: 'Advanced',
          prerequisites: 'Azure fundamentals',
          gradient: 'from-violet-400 to-purple-500',
          status: 'locked'
        },
        {
          id: 4,
          title: 'CCSP',
          subtitle: 'Certified Cloud Security Professional',
          description: 'Cloud security architecture and governance',
          duration: '6-8 months',
          difficulty: 'Expert',
          prerequisites: '5 years IT + 3 years cloud security',
          gradient: 'from-teal-400 to-green-500',
          status: 'locked'
        }
      ]
    },
    forensics: {
      title: 'Digital Forensics Path',
      description: 'Master digital investigation and incident response',
      icon: <Eye className="h-6 w-6" />,
      color: 'from-htb-purple to-htb-blue',
      timeline: [
        {
          id: 1,
          title: 'GCIH',
          subtitle: 'GIAC Certified Incident Handler',
          description: 'Incident response and digital forensics fundamentals',
          duration: '4-6 months',
          difficulty: 'Intermediate',
          prerequisites: 'Security+ or equivalent',
          gradient: 'from-purple-400 to-indigo-500',
          status: 'available'
        },
        {
          id: 2,
          title: 'GCFA',
          subtitle: 'GIAC Certified Forensic Analyst',
          description: 'Advanced digital forensics and analysis',
          duration: '6-8 months',
          difficulty: 'Advanced',
          prerequisites: 'GCIH + forensics experience',
          gradient: 'from-indigo-400 to-blue-500',
          status: 'locked'
        },
        {
          id: 3,
          title: 'EnCE',
          subtitle: 'EnCase Certified Examiner',
          description: 'EnCase forensic tool certification',
          duration: '3-4 months',
          difficulty: 'Advanced',
          prerequisites: 'GCFA or equivalent',
          gradient: 'from-blue-400 to-cyan-500',
          status: 'locked'
        },
        {
          id: 4,
          title: 'CISSP',
          subtitle: 'Certified Information Systems Security Professional',
          description: 'Advanced security management and forensics',
          duration: '8-12 months',
          difficulty: 'Expert',
          prerequisites: '5 years security experience',
          gradient: 'from-cyan-400 to-teal-500',
          status: 'locked'
        }
      ]
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-white" />;
      case 'in-progress':
        return <Play className="h-6 w-6 text-white" />;
      case 'available':
        return <Circle className="h-6 w-6 text-white" />;
      case 'locked':
        return <Lock className="h-6 w-6 text-white opacity-60" />;
      default:
        return <Circle className="h-6 w-6 text-white" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400';
      case 'Intermediate': return 'text-blue-400';
      case 'Advanced': return 'text-orange-400';
      case 'Expert': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const renderTimeline = (timeline) => {
    return (
      <div className="relative max-w-4xl mx-auto">
        {/* Vertical Timeline Line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-htb-green via-htb-blue to-htb-purple h-full"></div>

        {timeline.map((cert, index) => {
          const isLeft = index % 2 === 0;

          return (
            <div key={cert.id} className={`relative flex items-center mb-16 ${isLeft ? 'justify-start' : 'justify-end'}`}>
              {/* Timeline Node */}
              <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                <div
                  className={`w-20 h-20 rounded-full bg-gradient-to-r ${cert.gradient} flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 htb-glow shadow-lg`}
                  onClick={() => console.log(`Clicked ${cert.title}`)}
                >
                  {getStatusIcon(cert.status)}
                </div>
              </div>

              {/* Content Card */}
              <div className={`w-5/12 ${isLeft ? 'pr-16' : 'pl-16'}`}>
                <div className={`htb-card p-6 rounded-xl transition-all duration-300 hover:scale-105 ${cert.status === 'locked' ? 'opacity-60' : ''
                  }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-htb-gray-light">{cert.title}</h3>
                    <span className={`text-sm font-medium ${getDifficultyColor(cert.difficulty)}`}>
                      {cert.difficulty}
                    </span>
                  </div>

                  <h4 className="text-htb-green font-mono text-sm mb-3">{cert.subtitle}</h4>

                  <p className="text-htb-gray text-sm mb-4 leading-relaxed">
                    {cert.description}
                  </p>

                  <div className="space-y-2 text-xs text-htb-gray">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3" />
                      <span>Duration: {cert.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-3 w-3" />
                      <span>Prerequisites: {cert.prerequisites}</span>
                    </div>
                  </div>

                  {cert.status !== 'locked' && (
                    <div className="mt-4 pt-4 border-t border-htb-gray-dark">
                      <button className="htb-btn text-sm px-4 py-2 rounded-lg w-full">
                        {cert.status === 'completed' ? 'View Certificate' :
                          cert.status === 'in-progress' ? 'Continue Learning' :
                            'Start Learning'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Branch Line */}
              <div className={`absolute top-10 w-16 h-0.5 bg-gradient-to-r ${cert.gradient} ${isLeft ? 'left-1/2 ml-10' : 'right-1/2 mr-10'
                }`}></div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-htb-gray-light mb-4 matrix-text">
          Cybersecurity Certification Roadmap
        </h1>
        <p className="text-xl text-htb-gray max-w-3xl mx-auto">
          Follow structured certification paths designed to advance your cybersecurity career.
          Each path represents industry-recognized certifications with clear progression.
        </p>
      </div>

      {/* Path Selection */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(certificationPaths).map(([key, path]) => (
          <div
            key={key}
            onClick={() => setSelectedPath(key)}
            className={`cursor-pointer htb-card p-6 rounded-xl transition-all duration-300 ${selectedPath === key
              ? 'ring-2 ring-htb-green htb-glow'
              : 'hover:scale-105'
              }`}
          >
            <div className={`bg-gradient-to-r ${path.color} text-white p-4 rounded-lg mb-4 flex items-center justify-center`}>
              {path.icon}
            </div>
            <h3 className="text-lg font-bold text-htb-gray-light mb-2">{path.title}</h3>
            <p className="text-htb-gray text-sm">{path.description}</p>
            <div className="mt-4 text-xs text-htb-green font-mono">
              {path.timeline.length} certifications
            </div>
          </div>
        ))}
      </div>

      {/* Selected Path Timeline */}
      <div className="htb-card rounded-xl p-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-htb-gray-light mb-4 matrix-text">
            {certificationPaths[selectedPath].title}
          </h2>
          <p className="text-htb-gray text-lg">
            {certificationPaths[selectedPath].description}
          </p>
        </div>

        {renderTimeline(certificationPaths[selectedPath].timeline)}
      </div>

      {/* Progress Summary */}
      {user && (
        <div className="htb-card rounded-xl p-8">
          <h2 className="text-2xl font-bold text-htb-gray-light mb-6 text-center matrix-text">
            Your Progress Summary
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-htb-green mb-2 font-mono">
                {mockUserProgress.stats.completedCourses}
              </div>
              <div className="text-htb-gray">Certifications Earned</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-htb-blue mb-2 font-mono">
                {mockUserProgress.stats.inProgressCourses}
              </div>
              <div className="text-htb-gray">In Progress</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-htb-orange mb-2 font-mono">
                {Math.round(mockUserProgress.stats.totalTimeSpent / 60)}h
              </div>
              <div className="text-htb-gray">Study Time</div>
            </div>
          </div>
        </div>
      )}

      {!user && (
        <div className="text-center htb-card rounded-xl p-8">
          <h3 className="text-xl font-semibold text-htb-gray-light mb-4">
            Track Your Certification Progress
          </h3>
          <p className="text-htb-gray mb-6">
            Sign up to track your progress through certification paths and showcase your achievements.
          </p>
          <Link
            to="/register"
            className="htb-btn-primary px-6 py-3 rounded-lg hover:scale-105 transition-all inline-block"
          >
            Get Started Free
          </Link>
        </div>
      )}
    </div>
  );
};

export default Roadmap;