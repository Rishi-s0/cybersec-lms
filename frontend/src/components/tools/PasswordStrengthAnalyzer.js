import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, AlertTriangle, CheckCircle, Info, Zap, Clock } from 'lucide-react';

const PasswordStrengthAnalyzer = ({ onClose }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [crackTime, setCrackTime] = useState(null);

  // Common passwords list (subset for checking)
  const commonPasswords = [
    'password', '123456', 'password123', 'admin', 'qwerty', 'letmein',
    'welcome', 'monkey', '1234567890', 'abc123', 'Password1', 'iloveyou',
    'princess', 'rockyou', 'password1', 'dragon', 'shadow', 'master'
  ];

  // Common patterns
  const patterns = {
    sequential: /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i,
    repeated: /(.)\1{2,}/,
    keyboard: /(?:qwe|wer|ert|rty|tyu|yui|uio|iop|asd|sdf|dfg|fgh|ghj|hjk|jkl|zxc|xcv|cvb|vbn|bnm)/i,
    years: /(19|20)\d{2}/,
    dates: /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/
  };

  const analyzePassword = (pwd) => {
    if (!pwd) {
      setAnalysis(null);
      setCrackTime(null);
      return;
    }

    const analysis = {
      length: pwd.length,
      hasLowercase: /[a-z]/.test(pwd),
      hasUppercase: /[A-Z]/.test(pwd),
      hasNumbers: /\d/.test(pwd),
      hasSymbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      hasSpaces: /\s/.test(pwd),
      isCommon: commonPasswords.includes(pwd.toLowerCase()),
      patterns: [],
      entropy: 0,
      score: 0,
      strength: 'Very Weak',
      color: 'htb-red',
      recommendations: []
    };

    // Check for patterns
    Object.entries(patterns).forEach(([name, regex]) => {
      if (regex.test(pwd)) {
        analysis.patterns.push(name);
      }
    });

    // Calculate character set size
    let charsetSize = 0;
    if (analysis.hasLowercase) charsetSize += 26;
    if (analysis.hasUppercase) charsetSize += 26;
    if (analysis.hasNumbers) charsetSize += 10;
    if (analysis.hasSymbols) charsetSize += 32;
    if (analysis.hasSpaces) charsetSize += 1;

    // Calculate entropy
    analysis.entropy = pwd.length * Math.log2(charsetSize || 1);

    // Calculate base score
    let score = 0;
    
    // Length scoring
    if (analysis.length >= 12) score += 25;
    else if (analysis.length >= 8) score += 15;
    else if (analysis.length >= 6) score += 5;

    // Character variety scoring
    if (analysis.hasLowercase) score += 5;
    if (analysis.hasUppercase) score += 5;
    if (analysis.hasNumbers) score += 5;
    if (analysis.hasSymbols) score += 10;

    // Bonus for good entropy
    if (analysis.entropy > 60) score += 15;
    else if (analysis.entropy > 40) score += 10;
    else if (analysis.entropy > 25) score += 5;

    // Penalties
    if (analysis.isCommon) score -= 30;
    if (analysis.patterns.length > 0) score -= analysis.patterns.length * 10;
    if (analysis.length < 8) score -= 20;

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));
    analysis.score = score;

    // Determine strength
    if (score >= 80) {
      analysis.strength = 'Very Strong';
      analysis.color = 'htb-green';
    } else if (score >= 60) {
      analysis.strength = 'Strong';
      analysis.color = 'htb-blue';
    } else if (score >= 40) {
      analysis.strength = 'Moderate';
      analysis.color = 'htb-yellow';
    } else if (score >= 20) {
      analysis.strength = 'Weak';
      analysis.color = 'htb-orange';
    } else {
      analysis.strength = 'Very Weak';
      analysis.color = 'htb-red';
    }

    // Generate recommendations
    const recommendations = [];
    if (analysis.length < 12) recommendations.push('Use at least 12 characters');
    if (!analysis.hasLowercase) recommendations.push('Add lowercase letters');
    if (!analysis.hasUppercase) recommendations.push('Add uppercase letters');
    if (!analysis.hasNumbers) recommendations.push('Add numbers');
    if (!analysis.hasSymbols) recommendations.push('Add special characters');
    if (analysis.isCommon) recommendations.push('Avoid common passwords');
    if (analysis.patterns.includes('sequential')) recommendations.push('Avoid sequential characters');
    if (analysis.patterns.includes('repeated')) recommendations.push('Avoid repeated characters');
    if (analysis.patterns.includes('keyboard')) recommendations.push('Avoid keyboard patterns');
    if (analysis.patterns.includes('years')) recommendations.push('Avoid using years');
    if (analysis.patterns.includes('dates')) recommendations.push('Avoid using dates');

    analysis.recommendations = recommendations;

    // Calculate crack time
    const attemptsPerSecond = 1000000000; // 1 billion attempts per second (modern GPU)
    const totalCombinations = Math.pow(charsetSize, pwd.length);
    const averageAttempts = totalCombinations / 2;
    const secondsToCrack = averageAttempts / attemptsPerSecond;

    setCrackTime(formatCrackTime(secondsToCrack));
    setAnalysis(analysis);
  };

  const formatCrackTime = (seconds) => {
    if (seconds < 1) return 'Instantly';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 31536000000) return `${Math.round(seconds / 31536000)} years`;
    return 'Centuries';
  };

  useEffect(() => {
    analyzePassword(password);
  }, [password]);

  const generateStrongPassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';
    
    // Ensure at least one character from each set
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < 16; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="htb-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-htb-green" />
              <div>
                <h2 className="text-2xl font-bold text-htb-gray-light">Password Strength Analyzer</h2>
                <p className="text-htb-gray">Analyze password strength and get security recommendations</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-htb-gray hover:text-htb-red transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Password Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-htb-gray-light mb-2">
                  Password to Analyze
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password to analyze..."
                    className="htb-input w-full pr-12 py-3 rounded-lg font-mono"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-htb-gray hover:text-htb-green"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setPassword(generateStrongPassword())}
                  className="htb-btn-primary px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Zap className="h-4 w-4" />
                  <span>Generate Strong Password</span>
                </button>
                <button
                  onClick={() => setPassword('')}
                  className="htb-btn-secondary px-4 py-2 rounded-lg"
                >
                  Clear
                </button>
              </div>

              {/* Strength Meter */}
              {analysis && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-htb-gray-light">Strength:</span>
                    <span className={`text-sm font-bold text-${analysis.color}`}>
                      {analysis.strength} ({analysis.score}/100)
                    </span>
                  </div>
                  <div className="w-full bg-htb-dark-light rounded-full h-3">
                    <div
                      className={`bg-${analysis.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${analysis.score}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Character Analysis */}
              {analysis && (
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg border ${analysis.hasLowercase ? 'bg-htb-green/10 border-htb-green/30' : 'bg-htb-red/10 border-htb-red/30'}`}>
                    <div className="flex items-center space-x-2">
                      {analysis.hasLowercase ? (
                        <CheckCircle className="h-4 w-4 text-htb-green" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-htb-red" />
                      )}
                      <span className="text-sm">Lowercase</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg border ${analysis.hasUppercase ? 'bg-htb-green/10 border-htb-green/30' : 'bg-htb-red/10 border-htb-red/30'}`}>
                    <div className="flex items-center space-x-2">
                      {analysis.hasUppercase ? (
                        <CheckCircle className="h-4 w-4 text-htb-green" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-htb-red" />
                      )}
                      <span className="text-sm">Uppercase</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg border ${analysis.hasNumbers ? 'bg-htb-green/10 border-htb-green/30' : 'bg-htb-red/10 border-htb-red/30'}`}>
                    <div className="flex items-center space-x-2">
                      {analysis.hasNumbers ? (
                        <CheckCircle className="h-4 w-4 text-htb-green" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-htb-red" />
                      )}
                      <span className="text-sm">Numbers</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg border ${analysis.hasSymbols ? 'bg-htb-green/10 border-htb-green/30' : 'bg-htb-red/10 border-htb-red/30'}`}>
                    <div className="flex items-center space-x-2">
                      {analysis.hasSymbols ? (
                        <CheckCircle className="h-4 w-4 text-htb-green" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-htb-red" />
                      )}
                      <span className="text-sm">Symbols</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Crack Time */}
              {crackTime && (
                <div className="bg-htb-blue/10 border border-htb-blue/30 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-htb-blue" />
                    <div>
                      <p className="text-sm font-medium text-htb-blue">Estimated Crack Time</p>
                      <p className="text-lg font-bold text-htb-blue">{crackTime}</p>
                      <p className="text-xs text-htb-blue opacity-75">
                        Against modern GPU (1B attempts/sec)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Analysis Details */}
            <div className="space-y-4">
              {analysis && (
                <>
                  {/* Statistics */}
                  <div className="bg-htb-dark-light p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-htb-gray-light mb-3">Statistics</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-htb-gray">Length:</span>
                        <span className="ml-2 text-htb-gray-light font-mono">{analysis.length} chars</span>
                      </div>
                      <div>
                        <span className="text-htb-gray">Entropy:</span>
                        <span className="ml-2 text-htb-gray-light font-mono">{analysis.entropy.toFixed(1)} bits</span>
                      </div>
                      <div>
                        <span className="text-htb-gray">Common:</span>
                        <span className={`ml-2 font-medium ${analysis.isCommon ? 'text-htb-red' : 'text-htb-green'}`}>
                          {analysis.isCommon ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div>
                        <span className="text-htb-gray">Patterns:</span>
                        <span className={`ml-2 font-medium ${analysis.patterns.length > 0 ? 'text-htb-red' : 'text-htb-green'}`}>
                          {analysis.patterns.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Detected Patterns */}
                  {analysis.patterns.length > 0 && (
                    <div className="bg-htb-red/10 border border-htb-red/30 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-htb-red mb-2">Detected Patterns</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.patterns.map((pattern, index) => (
                          <span key={index} className="px-2 py-1 bg-htb-red/20 text-htb-red text-xs rounded capitalize">
                            {pattern}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysis.recommendations.length > 0 && (
                    <div className="bg-htb-yellow/10 border border-htb-yellow/30 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-htb-yellow mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {analysis.recommendations.map((rec, index) => (
                          <li key={index} className="text-xs text-htb-yellow flex items-start space-x-2">
                            <span className="text-htb-yellow mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Password Tips */}
                  <div className="bg-htb-green/10 border border-htb-green/30 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Info className="h-5 w-5 text-htb-green mt-0.5" />
                      <div className="text-sm text-htb-green">
                        <p className="font-medium mb-1">Strong Password Tips</p>
                        <ul className="text-xs opacity-90 space-y-1">
                          <li>• Use at least 12 characters</li>
                          <li>• Mix uppercase, lowercase, numbers, and symbols</li>
                          <li>• Avoid dictionary words and personal information</li>
                          <li>• Use unique passwords for each account</li>
                          <li>• Consider using a password manager</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!analysis && (
                <div className="text-center py-8 text-htb-gray">
                  <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Enter a password to see detailed analysis</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthAnalyzer;