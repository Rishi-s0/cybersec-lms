import React, { useState } from 'react';
import { 
  Shield, 
  Terminal, 
  Search, 
  Lock, 
  Wifi, 
  Bug, 
  Eye, 
  Database,
  Globe,
  Download,
  ExternalLink,
  Star,
  Filter,
  Play,
  Code,
  Hash,
  AlertTriangle,
  Zap
} from 'lucide-react';

// Import interactive tool components
import XSSPayloadTester from '../components/tools/XSSPayloadTester';
import HashPasswordCracker from '../components/tools/HashPasswordCracker';
import PasswordStrengthAnalyzer from '../components/tools/PasswordStrengthAnalyzer';
import EncoderDecoderSuite from '../components/tools/EncoderDecoderSuite';
import SQLInjectionTester from '../components/tools/SQLInjectionTester';
import VulnerabilityScanner from '../components/tools/VulnerabilityScanner';
import PhishingEmailDetector from '../components/tools/PhishingEmailDetector';

const Tools = () => {
  const [activeTab, setActiveTab] = useState('external');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTool, setActiveTool] = useState(null);

  // Tool component mapping
  const toolComponents = {
    'XSSTest': XSSPayloadTester,
    'HashCracker': HashPasswordCracker,
    'PasswordAnalyzer': PasswordStrengthAnalyzer,
    'EncoderDecoder': EncoderDecoderSuite,
    'SQLInjection': SQLInjectionTester,
    'VulnScanner': VulnerabilityScanner,
    'PhishingDetector': PhishingEmailDetector
  };

  // Tab configuration
  const tabs = [
    { 
      id: 'external', 
      name: 'External Tools', 
      icon: <Download className="h-5 w-5" />,
      description: 'Professional cybersecurity tools and software'
    },
    { 
      id: 'interactive', 
      name: 'Interactive Tools', 
      icon: <Play className="h-5 w-5" />,
      description: 'Browser-based security testing tools'
    }
  ];

  const toolCategories = [
    { id: 'all', name: 'All Tools', icon: <Shield className="h-5 w-5" /> },
    { id: 'network', name: 'Network Security', icon: <Wifi className="h-5 w-5" /> },
    { id: 'web', name: 'Web Security', icon: <Globe className="h-5 w-5" /> },
    { id: 'forensics', name: 'Digital Forensics', icon: <Search className="h-5 w-5" /> },
    { id: 'pentesting', name: 'Penetration Testing', icon: <Bug className="h-5 w-5" /> },
    { id: 'monitoring', name: 'Security Monitoring', icon: <Eye className="h-5 w-5" /> },
    { id: 'crypto', name: 'Cryptography', icon: <Lock className="h-5 w-5" /> }
  ];

  const securityTools = [
    {
      id: 1,
      name: 'Nmap',
      category: 'network',
      description: 'Network discovery and security auditing tool for network exploration and port scanning.',
      type: 'Free',
      platform: ['Linux', 'Windows', 'macOS'],
      rating: 4.9,
      downloadUrl: 'https://nmap.org/download.html',
      documentation: 'https://nmap.org/docs.html',
      features: ['Port Scanning', 'OS Detection', 'Service Discovery', 'Vulnerability Detection'],
      difficulty: 'Intermediate'
    },
    {
      id: 2,
      name: 'Wireshark',
      category: 'network',
      description: 'World\'s foremost network protocol analyzer for network troubleshooting and analysis.',
      type: 'Free',
      platform: ['Linux', 'Windows', 'macOS'],
      rating: 4.8,
      downloadUrl: 'https://www.wireshark.org/download.html',
      documentation: 'https://www.wireshark.org/docs/',
      features: ['Packet Capture', 'Protocol Analysis', 'Network Troubleshooting', 'Deep Inspection'],
      difficulty: 'Advanced'
    },
    {
      id: 3,
      name: 'Metasploit',
      category: 'pentesting',
      description: 'Comprehensive penetration testing framework for finding, exploiting, and validating vulnerabilities.',
      type: 'Freemium',
      platform: ['Linux', 'Windows', 'macOS'],
      rating: 4.7,
      downloadUrl: 'https://www.metasploit.com/download',
      documentation: 'https://docs.metasploit.com/',
      features: ['Exploit Development', 'Payload Generation', 'Post-Exploitation', 'Vulnerability Assessment'],
      difficulty: 'Advanced'
    },
    {
      id: 4,
      name: 'Burp Suite',
      category: 'web',
      description: 'Integrated platform for performing security testing of web applications.',
      type: 'Freemium',
      platform: ['Linux', 'Windows', 'macOS'],
      rating: 4.6,
      downloadUrl: 'https://portswigger.net/burp/communitydownload',
      documentation: 'https://portswigger.net/burp/documentation',
      features: ['Web App Scanning', 'Proxy Interception', 'Spider Crawling', 'Vulnerability Detection'],
      difficulty: 'Intermediate'
    },
    {
      id: 5,
      name: 'OWASP ZAP',
      category: 'web',
      description: 'Free security tool for finding vulnerabilities in web applications during development and testing.',
      type: 'Free',
      platform: ['Linux', 'Windows', 'macOS'],
      rating: 4.5,
      downloadUrl: 'https://www.zaproxy.org/download/',
      documentation: 'https://www.zaproxy.org/docs/',
      features: ['Automated Scanning', 'Manual Testing', 'API Security', 'CI/CD Integration'],
      difficulty: 'Beginner'
    },
    {
      id: 6,
      name: 'Autopsy',
      category: 'forensics',
      description: 'Digital forensics platform for analyzing hard drives and smartphones.',
      type: 'Free',
      platform: ['Windows', 'Linux'],
      rating: 4.4,
      downloadUrl: 'https://www.autopsy.com/download/',
      documentation: 'https://www.autopsy.com/support/',
      features: ['File Recovery', 'Timeline Analysis', 'Keyword Search', 'Hash Analysis'],
      difficulty: 'Intermediate'
    },
    {
      id: 7,
      name: 'Splunk',
      category: 'monitoring',
      description: 'Platform for searching, monitoring, and analyzing machine-generated data.',
      type: 'Freemium',
      platform: ['Linux', 'Windows', 'macOS'],
      rating: 4.3,
      downloadUrl: 'https://www.splunk.com/en_us/download.html',
      documentation: 'https://docs.splunk.com/',
      features: ['Log Analysis', 'Real-time Monitoring', 'Alerting', 'Dashboards'],
      difficulty: 'Advanced'
    },
    {
      id: 8,
      name: 'Hashcat',
      category: 'crypto',
      description: 'Advanced password recovery tool supporting various hash algorithms.',
      type: 'Free',
      platform: ['Linux', 'Windows', 'macOS'],
      rating: 4.6,
      downloadUrl: 'https://hashcat.net/hashcat/',
      documentation: 'https://hashcat.net/wiki/',
      features: ['Password Cracking', 'Hash Analysis', 'Dictionary Attacks', 'Brute Force'],
      difficulty: 'Advanced'
    },
    {
      id: 9,
      name: 'Nikto',
      category: 'web',
      description: 'Web server scanner that tests for dangerous files, outdated programs, and server configuration issues.',
      type: 'Free',
      platform: ['Linux', 'Windows', 'macOS'],
      rating: 4.2,
      downloadUrl: 'https://github.com/sullo/nikto',
      documentation: 'https://github.com/sullo/nikto/wiki',
      features: ['Web Server Scanning', 'Vulnerability Detection', 'SSL Testing', 'Plugin Support'],
      difficulty: 'Beginner'
    },
    {
      id: 10,
      name: 'Snort',
      category: 'monitoring',
      description: 'Open-source network intrusion detection system capable of real-time traffic analysis.',
      type: 'Free',
      platform: ['Linux', 'Windows'],
      rating: 4.4,
      downloadUrl: 'https://www.snort.org/downloads',
      documentation: 'https://www.snort.org/documents',
      features: ['Intrusion Detection', 'Packet Logging', 'Real-time Analysis', 'Rule-based Detection'],
      difficulty: 'Advanced'
    }
  ];

  // Interactive tools that run in the browser
  const interactiveTools = [
    {
      id: 1,
      name: 'XSS Payload Tester',
      category: 'web',
      description: 'Test Cross-Site Scripting payloads safely in a controlled environment. Learn different XSS types and practice payload crafting.',
      icon: <Code className="h-8 w-8" />,
      difficulty: 'Intermediate',
      features: ['Reflected XSS', 'Stored XSS', 'DOM XSS', 'Payload Encoder', 'Safe Testing'],
      component: 'XSSTest'
    },
    {
      id: 2,
      name: 'Hash Password Cracker',
      category: 'crypto',
      description: 'Crack password hashes using dictionary attacks and brute force methods. Supports MD5, SHA1, SHA256, and more.',
      icon: <Hash className="h-8 w-8" />,
      difficulty: 'Advanced',
      features: ['Multiple Hash Types', 'Dictionary Attack', 'Brute Force', 'Rainbow Tables', 'Time Analysis'],
      component: 'HashCracker'
    },
    {
      id: 3,
      name: 'SQL Injection Tester',
      category: 'web',
      description: 'Practice SQL injection techniques in a safe environment. Learn different injection types and payload construction.',
      icon: <Database className="h-8 w-8" />,
      difficulty: 'Advanced',
      features: ['Union-based', 'Boolean-based', 'Time-based', 'Error-based', 'Payload Generator'],
      component: 'SQLInjection'
    },
    {
      id: 4,
      name: 'Network Port Scanner',
      category: 'network',
      description: 'Simulate network port scanning to understand reconnaissance techniques and service discovery.',
      icon: <Wifi className="h-8 w-8" />,
      difficulty: 'Beginner',
      features: ['Port Scanning', 'Service Detection', 'Banner Grabbing', 'Common Ports', 'Stealth Scan'],
      component: 'PortScanner'
    },
    {
      id: 5,
      name: 'Encoder/Decoder Suite',
      category: 'crypto',
      description: 'Encode and decode data using various formats. Essential for payload manipulation and data analysis.',
      icon: <Lock className="h-8 w-8" />,
      difficulty: 'Beginner',
      features: ['Base64', 'URL Encoding', 'Hex', 'HTML Entities', 'JWT Decoder'],
      component: 'EncoderDecoder'
    },
    {
      id: 6,
      name: 'Password Strength Analyzer',
      category: 'crypto',
      description: 'Analyze password strength in real-time. Learn about entropy, dictionary attacks, and secure password practices.',
      icon: <Shield className="h-8 w-8" />,
      difficulty: 'Beginner',
      features: ['Entropy Analysis', 'Dictionary Check', 'Pattern Detection', 'Strength Scoring', 'Recommendations'],
      component: 'PasswordAnalyzer'
    },
    {
      id: 7,
      name: 'Vulnerability Scanner',
      category: 'pentesting',
      description: 'Simulate vulnerability scanning to identify common security weaknesses in web applications.',
      icon: <Bug className="h-8 w-8" />,
      difficulty: 'Intermediate',
      features: ['OWASP Top 10', 'Header Analysis', 'SSL/TLS Check', 'Directory Traversal', 'File Upload Test'],
      component: 'VulnScanner'
    },
    {
      id: 8,
      name: 'Phishing Email Detector',
      category: 'forensics',
      description: 'Analyze emails for phishing indicators. Learn to identify suspicious patterns and social engineering tactics.',
      icon: <AlertTriangle className="h-8 w-8" />,
      difficulty: 'Beginner',
      features: ['Header Analysis', 'Link Verification', 'Attachment Scan', 'Sender Reputation', 'Risk Scoring'],
      component: 'PhishingDetector'
    }
  ];

  const filteredExternalTools = securityTools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const filteredInteractiveTools = interactiveTools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const currentTools = activeTab === 'external' ? filteredExternalTools : filteredInteractiveTools;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Free': return 'bg-green-100 text-green-800';
      case 'Freemium': return 'bg-blue-100 text-blue-800';
      case 'Paid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-htb-gray-light matrix-text mb-4">
          Cybersecurity Tools & Resources
        </h1>
        <p className="text-xl text-htb-gray max-w-3xl mx-auto">
          Discover and use cybersecurity tools. From professional software to interactive browser-based tools 
          for hands-on learning and security testing.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="htb-card rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedCategory('all');
                setSearchTerm('');
              }}
              className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all font-medium ${
                activeTab === tab.id
                  ? 'bg-htb-green text-htb-dark shadow-lg'
                  : 'bg-htb-dark-light text-htb-gray hover:bg-htb-gray/10 hover:text-htb-green'
              }`}
            >
              {tab.icon}
              <div className="text-left">
                <div className="font-semibold">{tab.name}</div>
                <div className="text-xs opacity-75">{tab.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-htb-gray" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'external' ? 'external tools' : 'interactive tools'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="htb-input w-full pl-10 pr-4 py-2 rounded-lg"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {toolCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-htb-green text-htb-dark'
                  : 'bg-htb-dark-light text-htb-gray hover:bg-htb-gray/10 hover:text-htb-green'
              }`}
            >
              {category.icon}
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      {activeTab === 'external' ? (
        // External Tools Grid
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExternalTools.map(tool => (
            <div key={tool.id} className="htb-card rounded-lg hover:shadow-lg transition-shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-htb-gray-light mb-2">{tool.name}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(tool.type)}`}>
                        {tool.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tool.difficulty)}`}>
                        {tool.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-htb-gray">
                    <Star className="h-4 w-4 fill-current text-htb-green" />
                    <span>{tool.rating}</span>
                  </div>
                </div>

                <p className="text-htb-gray text-sm mb-4 line-clamp-3">
                  {tool.description}
                </p>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-htb-gray-light mb-2">Key Features:</h4>
                  <div className="flex flex-wrap gap-1">
                    {tool.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-htb-green/10 text-htb-green text-xs rounded">
                        {feature}
                      </span>
                    ))}
                    {tool.features.length > 3 && (
                      <span className="px-2 py-1 bg-htb-gray/10 text-htb-gray text-xs rounded">
                        +{tool.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Platform Support */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-htb-gray-light mb-2">Platforms:</h4>
                  <div className="flex space-x-2">
                    {tool.platform.map((platform, index) => (
                      <span key={index} className="px-2 py-1 bg-htb-dark-light text-htb-gray text-xs rounded">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <a
                    href={tool.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 htb-btn-primary px-4 py-2 rounded-lg text-sm font-medium text-center flex items-center justify-center space-x-1"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </a>
                  <a
                    href={tool.documentation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-htb-gray/30 text-htb-gray rounded-lg hover:bg-htb-gray/10 transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Interactive Tools Grid
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInteractiveTools.map(tool => (
            <div key={tool.id} className="htb-card rounded-lg hover:shadow-lg transition-shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="text-htb-green">
                        {tool.icon}
                      </div>
                      <h3 className="text-xl font-bold text-htb-gray-light">{tool.name}</h3>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-htb-green/10 text-htb-green rounded-full text-xs font-medium">
                        Interactive
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tool.difficulty)}`}>
                        {tool.difficulty}
                      </span>
                    </div>
                  </div>
                  <Zap className="h-5 w-5 text-htb-green" />
                </div>

                <p className="text-htb-gray text-sm mb-4 line-clamp-3">
                  {tool.description}
                </p>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-htb-gray-light mb-2">Features:</h4>
                  <div className="flex flex-wrap gap-1">
                    {tool.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-htb-green/10 text-htb-green text-xs rounded">
                        {feature}
                      </span>
                    ))}
                    {tool.features.length > 3 && (
                      <span className="px-2 py-1 bg-htb-gray/10 text-htb-gray text-xs rounded">
                        +{tool.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => {
                    const ToolComponent = toolComponents[tool.component];
                    if (ToolComponent) {
                      setActiveTool(tool.component);
                    } else {
                      alert(`${tool.name} - Coming soon!`);
                    }
                  }}
                  className="w-full htb-btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Launch Tool</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentTools.length === 0 && (
        <div className="text-center py-12">
          <Filter className="h-16 w-16 text-htb-gray mx-auto mb-4" />
          <h3 className="text-lg font-medium text-htb-gray-light mb-2">No tools found</h3>
          <p className="text-htb-gray">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Learning Resources */}
      <div className="htb-card rounded-lg p-8">
        <h2 className="text-2xl font-bold text-htb-gray-light mb-6 text-center matrix-text">
          {activeTab === 'external' ? 'Learn to Use These Tools' : 'Master Interactive Security Testing'}
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <Terminal className="h-12 w-12 text-htb-green mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-htb-gray-light mb-2">
              {activeTab === 'external' ? 'Hands-on Labs' : 'Real-time Practice'}
            </h3>
            <p className="text-htb-gray text-sm">
              {activeTab === 'external' 
                ? 'Practice with real tools in our interactive lab environment'
                : 'Test security concepts immediately with instant feedback'
              }
            </p>
          </div>
          
          <div className="text-center">
            <Shield className="h-12 w-12 text-htb-green mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-htb-gray-light mb-2">
              {activeTab === 'external' ? 'Expert Tutorials' : 'Safe Environment'}
            </h3>
            <p className="text-htb-gray text-sm">
              {activeTab === 'external'
                ? 'Step-by-step guides from cybersecurity professionals'
                : 'Practice dangerous techniques safely without risk'
              }
            </p>
          </div>
          
          <div className="text-center">
            <Bug className="h-12 w-12 text-htb-green mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-htb-gray-light mb-2">
              {activeTab === 'external' ? 'Real Scenarios' : 'Educational Focus'}
            </h3>
            <p className="text-htb-gray text-sm">
              {activeTab === 'external'
                ? 'Apply tools to solve actual cybersecurity challenges'
                : 'Learn the theory behind each attack and defense'
              }
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <a
            href="/courses"
            className="htb-btn-primary px-6 py-3 rounded-lg font-medium"
          >
            {activeTab === 'external' ? 'Explore Tool-Based Courses' : 'Start Security Courses'}
          </a>
        </div>
      </div>
      
      {/* Render Active Tool */}
      {activeTool && toolComponents[activeTool] && (
        React.createElement(toolComponents[activeTool], {
          onClose: () => setActiveTool(null)
        })
      )}
    </div>
  );
};

export default Tools;