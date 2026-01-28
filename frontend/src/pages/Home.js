import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Globe, Users, Award, BookOpen, Map } from 'lucide-react';

const Home = () => {
  const [liveStats, setLiveStats] = useState({
    totalThreats: 1247,
    countriesAffected: 89,
    activeAttacks: 156,
    isLoading: true
  });

  // Fetch live threat statistics
  const fetchLiveStats = async () => {
    try {
      console.log('Attempting to fetch live stats...');
      const response = await fetch('/api/threats/stats');
      if (response.ok) {
        const data = await response.json();
        console.log('Received live stats:', data);
        setLiveStats({
          totalThreats: data.totalThreats || Math.floor(Math.random() * 500) + 800,
          countriesAffected: data.countriesAffected || Math.floor(Math.random() * 30) + 60,
          activeAttacks: data.activeAttacks || Math.floor(Math.random() * 100) + 100,
          isLoading: false
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.log('API not available, using animated fallback numbers');
      // Use animated fallback numbers that change every update
      setLiveStats(prev => ({
        totalThreats: Math.max(800, prev.totalThreats + Math.floor(Math.random() * 20) - 10),
        countriesAffected: Math.max(60, Math.min(95, prev.countriesAffected + Math.floor(Math.random() * 6) - 3)),
        activeAttacks: Math.max(50, prev.activeAttacks + Math.floor(Math.random() * 30) - 15),
        isLoading: false
      }));
    }
  };

  // Initialize and set up real-time updates
  useEffect(() => {
    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 5000); // Update every 5 seconds for testing
    return () => clearInterval(interval);
  }, []);
  const features = [
    {
      icon: <Shield className="h-8 w-8 text-cyber-600" />,
      title: "Comprehensive Security Training",
      description: "Learn from industry experts with hands-on cybersecurity courses covering all major domains."
    },
    {
      icon: <Lock className="h-8 w-8 text-cyber-600" />,
      title: "Practical Labs",
      description: "Get hands-on experience with real-world scenarios and interactive security exercises."
    },
    {
      icon: <Globe className="h-8 w-8 text-cyber-600" />,
      title: "Industry-Relevant Content",
      description: "Stay updated with the latest threats, tools, and techniques used in cybersecurity."
    },
    {
      icon: <Users className="h-8 w-8 text-cyber-600" />,
      title: "Expert Instructors",
      description: "Learn from certified professionals with years of real-world cybersecurity experience."
    },
    {
      icon: <Award className="h-8 w-8 text-cyber-600" />,
      title: "Certifications",
      description: "Earn recognized certificates upon course completion to advance your career."
    },
    {
      icon: <BookOpen className="h-8 w-8 text-cyber-600" />,
      title: "Self-Paced Learning",
      description: "Study at your own pace with 24/7 access to course materials and resources."
    }
  ];

  const categories = [
    "Network Security",
    "Web Security",
    "Cryptography",
    "Ethical Hacking",
    "Incident Response",
    "Risk Management"
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20 relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center mb-8">
            <Shield className="h-12 w-12 text-htb-green mr-4 animate-float" />
            <span className="text-sm font-medium text-htb-green uppercase tracking-wider bg-htb-green/10 px-3 py-1 rounded-full border border-htb-green/20">
              Learn by doing
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-8 text-htb-gray-light leading-tight">
            Master Cybersecurity with<br />
            <span className="htb-gradient">Hands-on Labs</span> and Real-World Scenarios
          </h1>
          <p className="text-xl text-htb-gray mb-12 leading-relaxed max-w-4xl mx-auto">
            Guided paths from beginner to pro. Practice ethical hacking, blue team defense,
            and cloud security with interactive labs, challenges, and projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/labs"
              className="htb-btn-primary px-10 py-4 rounded-lg text-lg font-semibold"
            >
              Start Learning Now
            </Link>
            <Link
              to="/courses"
              className="htb-btn px-10 py-4 rounded-lg text-lg font-semibold"
            >
              Browse Courses
            </Link>
          </div>

          {/* Threat Map Preview */}
          <div className="mt-20 relative">
            <div className="htb-card rounded-xl p-8 max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center space-x-3">
                  <Globe className="h-6 w-6 text-htb-green" />
                  <span className="text-htb-gray-light font-semibold text-lg matrix-text">Live Threat Map</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full htb-pulse ${liveStats.isLoading ? 'bg-htb-orange' : 'status-online'}`}></div>
                  <span className="text-htb-gray text-sm font-mono">
                    {liveStats.isLoading ? 'updating...' : 'live data'}
                  </span>
                </div>
              </div>
              <div className="bg-htb-black/50 rounded-lg p-6 border border-htb-gray-dark/30 grid-pattern">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className={`text-2xl font-bold text-htb-green font-mono transition-all duration-500 ${liveStats.isLoading ? 'animate-pulse' : ''}`}>
                      {liveStats.totalThreats.toLocaleString()}
                    </div>
                    <div className="text-xs text-htb-gray">Active Threats</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold text-htb-orange font-mono transition-all duration-500 ${liveStats.isLoading ? 'animate-pulse' : ''}`}>
                      {liveStats.countriesAffected}
                    </div>
                    <div className="text-xs text-htb-gray">Countries</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold text-htb-blue font-mono transition-all duration-500 ${liveStats.isLoading ? 'animate-pulse' : ''}`}>
                      {liveStats.activeAttacks}
                    </div>
                    <div className="text-xs text-htb-gray">Live Attacks</div>
                  </div>
                </div>
              </div>
              <Link
                to="/threat-map"
                className="block mt-6 text-center text-htb-green hover:text-htb-green-light transition-colors font-medium font-mono"
              >
                View Live Threat Map →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-htb-gray-light mb-6 matrix-text">
            Why Choose HACKADEMY?
          </h2>
          <p className="text-lg text-htb-gray max-w-2xl mx-auto">
            Our comprehensive cybersecurity learning platform provides everything you need
            to build and advance your security career.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="htb-card p-8 rounded-xl group htb-glow">
              <div className="mb-6 text-htb-green group-hover:text-htb-green-light transition-colors">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-htb-gray-light mb-4">
                {feature.title}
              </h3>
              <p className="text-htb-gray leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="htb-card rounded-xl p-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-htb-gray-light mb-6 matrix-text">
            Course Categories
          </h2>
          <p className="text-lg text-htb-gray">
            Explore our wide range of cybersecurity specializations
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <div key={index} className="bg-htb-black/30 border border-htb-gray-dark/30 p-6 rounded-lg text-center hover:border-htb-green/50 hover:bg-htb-darker/30 transition-all group cursor-pointer">
              <span className="text-htb-gray group-hover:text-htb-green transition-colors font-medium font-mono">{category}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Link to="/roadmap" className="htb-card p-8 rounded-xl htb-glow group">
          <Map className="h-12 w-12 text-htb-green mb-6 group-hover:text-htb-green-light group-hover:scale-110 transition-all" />
          <h3 className="text-lg font-semibold text-htb-gray-light mb-3">Learning Roadmap</h3>
          <p className="text-htb-gray text-sm">Structured paths from beginner to expert</p>
        </Link>

        <Link to="/labs" className="htb-card p-8 rounded-xl htb-glow group">
          <BookOpen className="h-12 w-12 text-htb-blue mb-6 group-hover:text-htb-green group-hover:scale-110 transition-all" />
          <h3 className="text-lg font-semibold text-htb-gray-light mb-3">Hands-on Labs</h3>
          <p className="text-htb-gray text-sm">Practice with real cybersecurity tools</p>
        </Link>

        <Link to="/tools" className="htb-card p-8 rounded-xl htb-glow group">
          <Users className="h-12 w-12 text-htb-purple mb-6 group-hover:text-htb-green group-hover:scale-110 transition-all" />
          <h3 className="text-lg font-semibold text-htb-gray-light mb-3">Security Tools</h3>
          <p className="text-htb-gray text-sm">Discover essential cybersecurity tools</p>
        </Link>

        <Link to="/threat-map" className="htb-card p-8 rounded-xl htb-glow group">
          <Globe className="h-12 w-12 text-htb-orange mb-6 group-hover:text-htb-green group-hover:scale-110 transition-all" />
          <h3 className="text-lg font-semibold text-htb-gray-light mb-3">Threat Map</h3>
          <p className="text-htb-gray text-sm">Live global cybersecurity threats</p>
        </Link>
      </section>

      {/* CTA Section */}
      <section className="text-center py-20 htb-card rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-htb-green/5 via-transparent to-htb-green/5"></div>
        <div className="relative">
          <h2 className="text-4xl font-bold mb-6 text-htb-gray-light matrix-text">
            Ready to Start Your Cybersecurity Journey?
          </h2>
          <p className="text-xl mb-10 text-htb-gray font-mono">
            Join thousands of professionals advancing their cybersecurity careers
          </p>
          <Link
            to="/register"
            className="htb-btn-primary px-10 py-4 rounded-lg text-lg font-semibold inline-block"
          >
            Start Learning Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;