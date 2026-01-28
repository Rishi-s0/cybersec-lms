import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset instructions have been sent to your email.');
        setEmailSent(true);
      } else {
        setError(data.error || 'Failed to send reset email. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    }

    setLoading(false);
  };

  if (emailSent) {
    return (
      <div className="max-w-md mx-auto htb-card rounded-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-htb-green/10 mb-4">
            <CheckCircle className="h-6 w-6 text-htb-green" />
          </div>
          <h2 className="text-3xl font-bold text-htb-gray-light matrix-text">Check Your Email</h2>
          <p className="text-htb-gray mt-2">We've sent password reset instructions to your email</p>
        </div>

        <div className="mb-6 p-4 bg-htb-green/10 border border-htb-green/30 rounded-lg">
          <p className="text-htb-green text-sm">{message}</p>
        </div>

        <div className="space-y-4">
          <p className="text-htb-gray text-sm text-center">
            Didn't receive the email? Check your spam folder or try again with a different email address.
          </p>
          
          <button
            onClick={() => {
              setEmailSent(false);
              setEmail('');
              setMessage('');
            }}
            className="w-full htb-btn-secondary py-2 px-4 rounded-lg transition-colors"
          >
            Try Different Email
          </button>

          <div className="text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center text-htb-green hover:text-htb-green-light font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto htb-card rounded-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-htb-gray-light matrix-text">Reset Password</h2>
        <p className="text-htb-gray mt-2">Enter your email to receive reset instructions</p>
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
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-htb-gray" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="htb-input w-full pl-10 pr-4 py-2 rounded-lg"
              placeholder="Enter your email address"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full htb-btn-primary py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Sending...' : 'Send Reset Instructions'}
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

export default ForgotPassword;