import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [success, setSuccess] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    if (name === 'password') {
      setValidationErrors(prev => ({
        ...prev,
        password: value.length < 6 ? 'Password must be at least 6 characters' : ''
      }));
    }

    if (name === 'confirmPassword') {
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: value !== formData.password ? 'Passwords do not match' : ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: formData.password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password has been reset successfully! You can now log in with your new password.');
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto htb-card rounded-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-htb-green/10 mb-4">
            <CheckCircle className="h-6 w-6 text-htb-green" />
          </div>
          <h2 className="text-3xl font-bold text-htb-gray-light matrix-text">Password Reset</h2>
          <p className="text-htb-gray mt-2">Your password has been successfully updated</p>
        </div>

        <div className="mb-6 p-4 bg-htb-green/10 border border-htb-green/30 rounded-lg">
          <p className="text-htb-green text-sm">{message}</p>
        </div>

        <div className="text-center">
          <p className="text-htb-gray text-sm mb-4">
            Redirecting to login page in a few seconds...
          </p>
          <Link 
            to="/login" 
            className="inline-flex items-center text-htb-green hover:text-htb-green-light font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Go to Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto htb-card rounded-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-htb-gray-light matrix-text">Reset Password</h2>
        <p className="text-htb-gray mt-2">Enter your new password</p>
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
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-htb-gray" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`htb-input w-full pl-10 pr-4 py-2 rounded-lg ${
                validationErrors.password ? 'border-htb-red' : ''
              }`}
              placeholder="Enter new password (min 6 characters)"
            />
          </div>
          {validationErrors.password && (
            <p className="mt-1 text-xs text-htb-red">{validationErrors.password}</p>
          )}
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
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-htb-gray" />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`htb-input w-full pl-10 pr-4 py-2 rounded-lg ${
                validationErrors.confirmPassword ? 'border-htb-red' : ''
              }`}
              placeholder="Confirm your new password"
            />
          </div>
          {validationErrors.confirmPassword && (
            <p className="mt-1 text-xs text-htb-red">{validationErrors.confirmPassword}</p>
          )}
          {formData.confirmPassword && (
            <div className="mt-1 text-xs">
              <span className={`${formData.password === formData.confirmPassword ? 'text-htb-green' : 'text-htb-red'}`}>
                {formData.password === formData.confirmPassword ? '✓' : '✗'} Passwords match
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || validationErrors.password || validationErrors.confirmPassword}
          className="w-full htb-btn-primary py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link 
          to="/login" 
          className="inline-flex items-center text-htb-green hover:text-htb-green-light font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;