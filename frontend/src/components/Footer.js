import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Github,
  Twitter,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ExternalLink,
  Heart
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-htb-black border-t border-htb-gray-dark/30 mt-20 print:hidden">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-8 w-8 text-htb-green" />
              <span className="text-xl font-bold text-htb-gray-light">
                HACK<span className="htb-gradient">ADEMY</span>
              </span>
            </div>
            <p className="text-htb-gray text-sm leading-relaxed mb-4">
              Master cybersecurity with hands-on labs, real-world scenarios, and industry-recognized certifications.
              Join thousands of professionals advancing their security careers.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-htb-gray hover:text-htb-green transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-htb-gray hover:text-htb-green transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-htb-gray hover:text-htb-green transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-htb-gray-light font-semibold mb-4 matrix-text">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/courses" className="text-htb-gray hover:text-htb-green transition-colors text-sm">
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/labs" className="text-htb-gray hover:text-htb-green transition-colors text-sm">
                  Hands-on Labs
                </Link>
              </li>
              <li>
                <Link to="/roadmap" className="text-htb-gray hover:text-htb-green transition-colors text-sm">
                  Learning Roadmap
                </Link>
              </li>
              <li>
                <Link to="/tools" className="text-htb-gray hover:text-htb-green transition-colors text-sm">
                  Security Tools
                </Link>
              </li>
              <li>
                <Link to="/threat-map" className="text-htb-gray hover:text-htb-green transition-colors text-sm">
                  Threat Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-htb-gray-light font-semibold mb-4 matrix-text">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-htb-gray hover:text-htb-green transition-colors text-sm flex items-center space-x-1">
                  <span>Documentation</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#" className="text-htb-gray hover:text-htb-green transition-colors text-sm flex items-center space-x-1">
                  <span>API Reference</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#" className="text-htb-gray hover:text-htb-green transition-colors text-sm">
                  Community Forum
                </a>
              </li>
              <li>
                <a href="#" className="text-htb-gray hover:text-htb-green transition-colors text-sm">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-htb-gray hover:text-htb-green transition-colors text-sm">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-htb-gray-light font-semibold mb-4 matrix-text">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-htb-gray text-sm">
                <Mail className="h-4 w-4 text-htb-green" />
                <span>support@hackademy.com</span>
              </li>
              <li className="flex items-center space-x-2 text-htb-gray text-sm">
                <Phone className="h-4 w-4 text-htb-green" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-2 text-htb-gray text-sm">
                <MapPin className="h-4 w-4 text-htb-green mt-0.5" />
                <span>123 Cyber Street<br />Security City, SC 12345</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="htb-card rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-htb-gray-light font-semibold mb-2">Stay Updated</h3>
              <p className="text-htb-gray text-sm">
                Get the latest cybersecurity news, course updates, and exclusive content.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="htb-input px-4 py-2 rounded-lg flex-1 md:w-64"
              />
              <button className="htb-btn-primary px-6 py-2 rounded-lg whitespace-nowrap w-full sm:w-auto">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-htb-gray-dark/30 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6 mb-4 md:mb-0">
              <p className="text-htb-gray text-sm">
                © {currentYear} HACKADEMY. All rights reserved.
              </p>
              <div className="flex space-x-4 text-sm">
                <a href="#" className="text-htb-gray hover:text-htb-green transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-htb-gray hover:text-htb-green transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-htb-gray hover:text-htb-green transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-htb-gray text-sm">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-htb-red fill-current" />
              <span>for the cybersecurity community</span>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-htb-green/10 border border-htb-green/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-htb-green mt-0.5" />
            <div>
              <h4 className="text-htb-green font-medium text-sm mb-1">Security Notice</h4>
              <p className="text-htb-gray text-xs leading-relaxed">
                This platform is designed for educational purposes. All penetration testing and security
                exercises should only be performed in authorized environments. HACKADEMY promotes ethical
                hacking and responsible disclosure practices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;