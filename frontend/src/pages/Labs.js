import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Terminal, 
  Play, 
  Pause, 
  RotateCcw, 
  Monitor, 
  Shield, 
  Lock, 
  Wifi, 
  Globe,
  Clock,
  Star,
  CheckCircle,
  AlertTriangle,
  Code
} from 'lucide-react';

const Labs = () => {
  const { user } = useAuth();
  const [selectedLab, setSelectedLab] = useState(null);
  const [labStatus, setLabStatus] = useState('stopped'); // stopped, starting, running, paused
  const [selectedCategory, setSelectedCategory] = useState('all');

  const labCategories = [
    { id: 'all', name: 'All Labs', icon: <Terminal className="h-5 w-5" /> },
    { id: 'network', name: 'Network Security', icon: <Wifi className="h-5 w-5" /> },
    { id: 'web', name: 'Web Security', icon: <Globe className="h-5 w-5" /> },
    { id: 'forensics', name: 'Digital Forensics', icon: <Monitor className="h-5 w-5" /> },
    { id: 'pentesting', name: 'Penetration Testing', icon: <Shield className="h-5 w-5" /> },
    { id: 'crypto', name: 'Cryptography', icon: <Lock className="h-5 w-5" /> }
  ];

  const virtualLabs = [
    {
      id: 1,
      title: 'Network Packet Analysis with Wireshark',
      category: 'network',
      difficulty: 'Intermediate',
      duration: 45,
      description: 'Learn to capture and analyze network packets to identify security threats and network issues.',
      objectives: [
        'Capture network traffic using Wireshark',
        'Analyze HTTP and HTTPS traffic',
        'Identify suspicious network activity',
        'Extract files from packet captures'
      ],
      tools: ['Wireshark', 'tcpdump', 'Virtual Network'],
      scenario: 'Investigate a suspected data breach by analyzing network traffic captures from a corporate network.',
      prerequisites: ['Basic networking knowledge', 'TCP/IP fundamentals'],
      rating: 4.7,
      completions: 1250,
      estimatedTime: '45 min'
    },
    {
      id: 2,
      title: 'SQL Injection Attack and Defense',
      category: 'web',
      difficulty: 'Beginner',
      duration: 30,
      description: 'Hands-on practice with SQL injection attacks and learn how to prevent them.',
      objectives: [
        'Understand SQL injection vulnerabilities',
        'Perform basic SQL injection attacks',
        'Extract data from vulnerable databases',
        'Implement proper input validation'
      ],
      tools: ['DVWA', 'SQLMap', 'Burp Suite'],
      scenario: 'Test a vulnerable web application for SQL injection flaws and learn to fix them.',
      prerequisites: ['Basic SQL knowledge', 'Web application basics'],
      rating: 4.5,
      completions: 2100,
      estimatedTime: '30 min'
    },
    {
      id: 3,
      title: 'Digital Forensics: Disk Image Analysis',
      category: 'forensics',
      difficulty: 'Advanced',
      duration: 90,
      description: 'Investigate a compromised system by analyzing disk images and recovering evidence.',
      objectives: [
        'Mount and analyze disk images',
        'Recover deleted files',
        'Analyze file system artifacts',
        'Create forensic timeline'
      ],
      tools: ['Autopsy', 'Sleuth Kit', 'Volatility'],
      scenario: 'Investigate a cybercrime incident by analyzing forensic images from suspect computers.',
      prerequisites: ['File system knowledge', 'Basic forensics concepts'],
      rating: 4.8,
      completions: 650,
      estimatedTime: '90 min'
    },
    {
      id: 4,
      title: 'Penetration Testing with Metasploit',
      category: 'pentesting',
      difficulty: 'Advanced',
      duration: 75,
      description: 'Learn to use Metasploit framework for penetration testing and vulnerability exploitation.',
      objectives: [
        'Scan for vulnerabilities',
        'Exploit common vulnerabilities',
        'Gain system access',
        'Perform post-exploitation activities'
      ],
      tools: ['Metasploit', 'Nmap', 'Meterpreter'],
      scenario: 'Conduct a penetration test on a simulated corporate network with multiple vulnerable systems.',
      prerequisites: ['Linux command line', 'Network security basics'],
      rating: 4.9,
      completions: 890,
      estimatedTime: '75 min'
    },
    {
      id: 5,
      title: 'Cryptography: Breaking Weak Encryption',
      category: 'crypto',
      difficulty: 'Intermediate',
      duration: 60,
      description: 'Understand cryptographic weaknesses and learn to break poorly implemented encryption.',
      objectives: [
        'Analyze encryption algorithms',
        'Perform frequency analysis',
        'Break Caesar and Vigenère ciphers',
        'Understand RSA vulnerabilities'
      ],
      tools: ['CyberChef', 'Hashcat', 'OpenSSL'],
      scenario: 'Decrypt intercepted messages using various cryptanalysis techniques.',
      prerequisites: ['Basic mathematics', 'Cryptography fundamentals'],
      rating: 4.6,
      completions: 750,
      estimatedTime: '60 min'
    },
    {
      id: 6,
      title: 'Malware Analysis Sandbox',
      category: 'forensics',
      difficulty: 'Advanced',
      duration: 120,
      description: 'Safely analyze malware samples in an isolated environment to understand their behavior.',
      objectives: [
        'Set up analysis environment',
        'Perform static analysis',
        'Execute dynamic analysis',
        'Document malware behavior'
      ],
      tools: ['VirtualBox', 'IDA Pro', 'Process Monitor'],
      scenario: 'Analyze suspicious files reported by the incident response team.',
      prerequisites: ['Assembly language basics', 'Operating system internals'],
      rating: 4.7,
      completions: 420,
      estimatedTime: '120 min'
    }
  ];

  const filteredLabs = virtualLabs.filter(lab => 
    selectedCategory === 'all' || lab.category === selectedCategory
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLabAction = (action) => {
    switch (action) {
      case 'start':
        setLabStatus('starting');
        setTimeout(() => setLabStatus('running'), 2000);
        break;
      case 'pause':
        setLabStatus('paused');
        break;
      case 'resume':
        setLabStatus('running');
        break;
      case 'reset':
        setLabStatus('stopped');
        break;
      default:
        break;
    }
  };

  const renderLabInterface = () => {
    if (!selectedLab) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{selectedLab.title}</h2>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              labStatus === 'running' ? 'bg-green-100 text-green-800' :
              labStatus === 'starting' ? 'bg-yellow-100 text-yellow-800' :
              labStatus === 'paused' ? 'bg-orange-100 text-orange-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {labStatus.charAt(0).toUpperCase() + labStatus.slice(1)}
            </span>
          </div>
        </div>

        {/* Lab Controls */}
        <div className="flex items-center space-x-4 mb-6">
          {labStatus === 'stopped' && (
            <button
              onClick={() => handleLabAction('start')}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play className="h-4 w-4" />
              <span>Start Lab</span>
            </button>
          )}
          
          {labStatus === 'running' && (
            <button
              onClick={() => handleLabAction('pause')}
              className="flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <Pause className="h-4 w-4" />
              <span>Pause</span>
            </button>
          )}
          
          {labStatus === 'paused' && (
            <button
              onClick={() => handleLabAction('resume')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Play className="h-4 w-4" />
              <span>Resume</span>
            </button>
          )}
          
          {(labStatus === 'running' || labStatus === 'paused') && (
            <button
              onClick={() => handleLabAction('reset')}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Lab Environment */}
        <div className="bg-gray-900 rounded-lg p-6 text-green-400 font-mono text-sm min-h-96">
          {labStatus === 'stopped' && (
            <div className="text-center text-gray-500 mt-20">
              <Terminal className="h-16 w-16 mx-auto mb-4" />
              <p>Click "Start Lab" to begin the virtual environment</p>
            </div>
          )}
          
          {labStatus === 'starting' && (
            <div className="text-center text-yellow-400 mt-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
              <p>Starting virtual lab environment...</p>
              <p className="text-sm mt-2">Initializing containers and network...</p>
            </div>
          )}
          
          {(labStatus === 'running' || labStatus === 'paused') && (
            <div>
              <div className="mb-4">
                <span className="text-blue-400">student@cybersec-lab:~$</span>
                <span className="ml-2">Welcome to {selectedLab.title}</span>
              </div>
              <div className="mb-2">
                <span className="text-blue-400">student@cybersec-lab:~$</span>
                <span className="ml-2">Lab environment is ready!</span>
              </div>
              <div className="mb-4">
                <span className="text-blue-400">student@cybersec-lab:~$</span>
                <span className="ml-2">Available tools: {selectedLab.tools.join(', ')}</span>
              </div>
              
              {labStatus === 'running' && (
                <>
                  <div className="mb-2">
                    <span className="text-blue-400">student@cybersec-lab:~$</span>
                    <span className="ml-2 animate-pulse">_</span>
                  </div>
                  <div className="mt-6 p-4 bg-gray-800 rounded border-l-4 border-yellow-400">
                    <h4 className="text-yellow-400 font-bold mb-2">Lab Instructions:</h4>
                    <p className="text-gray-300 mb-2">{selectedLab.scenario}</p>
                    <div className="text-gray-300">
                      <p className="font-semibold mb-1">Objectives:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedLab.objectives.map((objective, index) => (
                          <li key={index}>{objective}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              )}
              
              {labStatus === 'paused' && (
                <div className="text-center text-orange-400 mt-10">
                  <Pause className="h-8 w-8 mx-auto mb-2" />
                  <p>Lab environment paused</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Hands-on Cybersecurity Labs
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Practice cybersecurity skills in safe, virtual environments. 
          Learn by doing with real tools and realistic scenarios.
        </p>
      </div>

      {!user && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Sign In Required</h3>
              <p className="text-yellow-700">
                You need to sign in to access the virtual lab environment and track your progress.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Lab Categories</h2>
        <div className="flex flex-wrap gap-2">
          {labCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-cyber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.icon}
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Lab Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Available Labs</h2>
            
            <div className="space-y-4">
              {filteredLabs.map(lab => (
                <div
                  key={lab.id}
                  onClick={() => setSelectedLab(lab)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedLab?.id === lab.id
                      ? 'border-cyber-500 bg-cyber-50'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{lab.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lab.difficulty)}`}>
                      {lab.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{lab.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{lab.estimatedTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-current text-yellow-400" />
                        <span>{lab.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>{lab.completions}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lab Interface */}
        <div className="lg:col-span-2">
          {selectedLab ? (
            renderLabInterface()
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Code className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Lab</h3>
              <p className="text-gray-600">
                Choose a lab from the list to start your hands-on cybersecurity practice
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lab Benefits */}
      <div className="bg-gradient-to-r from-cyber-50 to-primary-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Why Practice with Virtual Labs?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <Shield className="h-12 w-12 text-cyber-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Safe Environment</h3>
            <p className="text-gray-600 text-sm">
              Practice attacks and defenses in isolated virtual environments without risk
            </p>
          </div>
          
          <div className="text-center">
            <Terminal className="h-12 w-12 text-cyber-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Real Tools</h3>
            <p className="text-gray-600 text-sm">
              Use the same professional tools used by cybersecurity experts worldwide
            </p>
          </div>
          
          <div className="text-center">
            <Monitor className="h-12 w-12 text-cyber-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Realistic Scenarios</h3>
            <p className="text-gray-600 text-sm">
              Work through scenarios based on real-world cybersecurity incidents
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Labs;