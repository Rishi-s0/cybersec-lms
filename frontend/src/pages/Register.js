import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, AlertCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState({ google: false, github: false });
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleOAuthClick = (provider) => {
    setOauthLoading(prev => ({ ...prev, [provider]: true }));
    // The loading state will be reset when the page redirects or user returns
    setTimeout(() => {
      setOauthLoading(prev => ({ ...prev, [provider]: false }));
    }, 3000); // Reset after 3 seconds as fallback
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role
    });
    
    if (result.success) {
      if (result.requiresVerification) {
        // Redirect to email verification page
        navigate('/verify-email', { 
          state: { 
            email: formData.email,
            userId: result.userId 
          } 
        });
      } else {
        // Direct login (shouldn't happen for manual registration now)
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto htb-card rounded-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-htb-gray-light matrix-text">Create Account</h2>
        <p className="text-htb-gray mt-2">Join our cybersecurity learning community</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-htb-red/10 border border-htb-red/30 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-htb-red" />
          <span className="text-htb-red">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-htb-gray-light mb-2">
            Username
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-htb-gray" />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="htb-input w-full pl-10 pr-4 py-2 rounded-lg"
              placeholder="Choose a username"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-htb-gray-light mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-htb-gray" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="htb-input w-full pl-10 pr-4 py-2 rounded-lg"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-htb-gray-light mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-htb-gray" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="htb-input w-full pl-10 pr-4 py-2 rounded-lg"
              placeholder="Create a password (min 6 characters)"
            />
          </div>
          {formData.password && (
            <div className="mt-1 text-xs">
              <span className={`${formData.password.length >= 6 ? 'text-htb-green' : 'text-htb-red'}`}>
                {formData.password.length >= 6 ? '✓' : '✗'} At least 6 characters
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-htb-gray-light mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-htb-gray" />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="htb-input w-full pl-10 pr-4 py-2 rounded-lg"
              placeholder="Confirm your password"
            />
          </div>
          {formData.confirmPassword && (
            <div className="mt-1 text-xs">
              <span className={`${formData.password === formData.confirmPassword ? 'text-htb-green' : 'text-htb-red'}`}>
                {formData.password === formData.confirmPassword ? '✓' : '✗'} Passwords match
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-htb-gray-light mb-2">
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="htb-input w-full px-4 py-2 rounded-lg"
            disabled
          >
            <option value="student">Student</option>
          </select>
          <p className="mt-1 text-xs text-htb-gray">
            All new registrations are created as students. Contact admin for role changes.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full htb-btn-primary py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-htb-gray/30"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-htb-dark text-htb-gray">Or sign up with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <a
            href="http://localhost:5000/api/auth/google"
            onClick={() => handleOAuthClick('google')}
            className="w-full inline-flex justify-center items-center py-2 px-4 border border-htb-gray/30 rounded-lg bg-htb-dark-light hover:bg-htb-gray/10 text-htb-gray-light transition-colors disabled:opacity-50"
          >
            {oauthLoading.google ? (
              <div className="w-5 h-5 mr-2 border-2 border-htb-gray border-t-htb-green rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {oauthLoading.google ? 'Connecting...' : 'Google'}
          </a>

          <a
            href="http://localhost:5000/api/auth/github"
            onClick={() => handleOAuthClick('github')}
            className="w-full inline-flex justify-center items-center py-2 px-4 border border-htb-gray/30 rounded-lg bg-htb-dark-light hover:bg-htb-gray/10 text-htb-gray-light transition-colors disabled:opacity-50"
          >
            {oauthLoading.github ? (
              <div className="w-5 h-5 mr-2 border-2 border-htb-gray border-t-htb-green rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
              </svg>
            )}
            {oauthLoading.github ? 'Connecting...' : 'GitHub'}
          </a>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-htb-gray">
          Already have an account?{' '}
          <Link to="/login" className="text-htb-green hover:text-htb-green-light font-medium transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;