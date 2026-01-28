import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, AlertCircle, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const EmailVerification = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [countdown, setCountdown] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Get email from location state (passed from registration)
  const email = location.state?.email || '';
  const userId = location.state?.userId || '';

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Email verified successfully! Logging you in...' });
        
        // Store the token and user data
        localStorage.setItem('token', data.token);
        
        // Update auth context
        await login(email, '', true, data.token); // Skip password check with token
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.message || 'Invalid verification code' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }

    setLoading(false);
  };

  const handleResend = async () => {
    setMessage({ type: '', text: '' });
    setResendLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Verification code sent! Check your email.' });
        setCountdown(60); // 60 second cooldown
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to resend code' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }

    setResendLoading(false);
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  return (
    <div className="max-w-md mx-auto htb-card rounded-lg p-8">
      <div className="text-center mb-8">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-htb-green/10 mb-4">
          <Mail className="h-6 w-6 text-htb-green" />
        </div>
        <h2 className="text-3xl font-bold text-htb-gray-light matrix-text">Verify Your Email</h2>
        <p className="text-htb-gray mt-2">
          We've sent a 6-digit code to
        </p>
        <p className="text-htb-green font-medium">{email}</p>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-htb-green/10 border border-htb-green/30' 
            : 'bg-htb-red/10 border border-htb-red/30'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-htb-green" />
          ) : (
            <AlertCircle className="h-5 w-5 text-htb-red" />
          )}
          <span className={message.type === 'success' ? 'text-htb-green' : 'text-htb-red'}>
            {message.text}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-htb-gray-light mb-2">
            Verification Code
          </label>
          <input
            type="text"
            value={otp}
            onChange={handleOtpChange}
            required
            maxLength={6}
            className="htb-input w-full px-4 py-3 rounded-lg text-center text-2xl font-mono tracking-widest"
            placeholder="000000"
            autoComplete="one-time-code"
          />
          <p className="mt-1 text-xs text-htb-gray">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full htb-btn-primary py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <div className="mt-6 space-y-4">
        <div className="text-center">
          <p className="text-htb-gray text-sm mb-2">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={resendLoading || countdown > 0}
            className="inline-flex items-center text-htb-green hover:text-htb-green-light font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${resendLoading ? 'animate-spin' : ''}`} />
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
          </button>
        </div>

        <div className="text-center pt-4 border-t border-htb-gray/20">
          <Link 
            to="/register" 
            className="inline-flex items-center text-htb-gray hover:text-htb-gray-light transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Registration
          </Link>
        </div>
      </div>

      <div className="mt-6 p-4 bg-htb-dark-light rounded-lg">
        <p className="text-htb-gray text-xs text-center">
          💡 <strong>Development Mode:</strong> Check your console for the verification code
        </p>
      </div>
    </div>
  );
};

export default EmailVerification;