import React, { useState, useEffect } from 'react';
import { Hash, Play, Zap, Clock, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import CryptoJS from 'crypto-js';

const HashPasswordCracker = ({ onClose }) => {
  const [targetHash, setTargetHash] = useState('');
  const [hashType, setHashType] = useState('md5');
  const [attackMode, setAttackMode] = useState('dictionary');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Common passwords dictionary
  const commonPasswords = [
    'password', '123456', 'password123', 'admin', 'qwerty', 'letmein',
    'welcome', 'monkey', '1234567890', 'abc123', 'Password1', 'iloveyou',
    'princess', 'rockyou', 'password1', 'dragon', 'shadow', 'master',
    'jennifer', 'jordan', 'superman', 'harley', 'robert', 'matthew',
    'daniel', 'andrew', 'joshua', 'anthony', 'william', 'david',
    'hello', 'test', 'user', 'guest', 'demo', 'sample', 'example'
  ];

  // Hash functions
  const hashFunctions = {
    md5: (text) => CryptoJS.MD5(text).toString(),
    sha1: (text) => CryptoJS.SHA1(text).toString(),
    sha256: (text) => CryptoJS.SHA256(text).toString(),
    sha512: (text) => CryptoJS.SHA512(text).toString()
  };

  // Generate example hashes
  const exampleHashes = {
    md5: {
      'password': '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      'admin': '21232f297a57a5a743894a0e4a801fc3',
      '123456': 'e10adc3949ba59abbe56e057f20f883e'
    },
    sha1: {
      'password': '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8',
      'admin': 'd033e22ae348aeb5660fc2140aec35850c4da997',
      '123456': '7c4a8d09ca3762af61e59520943dc26494f8941b'
    },
    sha256: {
      'password': '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      'admin': '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
      '123456': '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'
    }
  };

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateBruteForcePassword = (length, charset, index) => {
    let result = '';
    let temp = index;
    for (let i = 0; i < length; i++) {
      result = charset[temp % charset.length] + result;
      temp = Math.floor(temp / charset.length);
    }
    return result.padStart(length, charset[0]);
  };

  const startCracking = async () => {
    if (!targetHash.trim()) {
      setResult({ type: 'error', message: 'Please enter a hash to crack' });
      return;
    }

    setIsRunning(true);
    setResult(null);
    setProgress(0);
    setAttempts(0);
    setTimeElapsed(0);

    const hashFunction = hashFunctions[hashType];
    const cleanHash = targetHash.toLowerCase().trim();

    try {
      if (attackMode === 'dictionary') {
        // Dictionary attack
        for (let i = 0; i < commonPasswords.length; i++) {
          if (!isRunning) break;
          
          const password = commonPasswords[i];
          const hash = hashFunction(password);
          setAttempts(i + 1);
          setProgress(((i + 1) / commonPasswords.length) * 100);

          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 50));

          if (hash === cleanHash) {
            setResult({
              type: 'success',
              message: `Password cracked! The password is: "${password}"`,
              password: password,
              attempts: i + 1,
              method: 'Dictionary Attack'
            });
            setIsRunning(false);
            return;
          }
        }

        if (isRunning) {
          setResult({
            type: 'failure',
            message: 'Password not found in dictionary. Try brute force attack.',
            attempts: commonPasswords.length
          });
        }
      } else {
        // Brute force attack (limited for demo)
        const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const maxLength = 4; // Limited for demo purposes
        let totalAttempts = 0;
        let maxAttempts = Math.pow(charset.length, maxLength);

        for (let length = 1; length <= maxLength; length++) {
          const lengthAttempts = Math.pow(charset.length, length);
          
          for (let i = 0; i < lengthAttempts; i++) {
            if (!isRunning) break;
            
            const password = generateBruteForcePassword(length, charset, i);
            const hash = hashFunction(password);
            totalAttempts++;
            setAttempts(totalAttempts);
            setProgress((totalAttempts / maxAttempts) * 100);

            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 10));

            if (hash === cleanHash) {
              setResult({
                type: 'success',
                message: `Password cracked! The password is: "${password}"`,
                password: password,
                attempts: totalAttempts,
                method: 'Brute Force Attack'
              });
              setIsRunning(false);
              return;
            }
          }
        }

        if (isRunning) {
          setResult({
            type: 'failure',
            message: `Password not found in ${totalAttempts} attempts. Try a longer brute force or dictionary attack.`,
            attempts: totalAttempts
          });
        }
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: 'An error occurred during cracking: ' + error.message
      });
    }

    setIsRunning(false);
  };

  const stopCracking = () => {
    setIsRunning(false);
  };

  const loadExampleHash = (password) => {
    const hash = exampleHashes[hashType][password];
    setTargetHash(hash);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="htb-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Hash className="h-8 w-8 text-htb-green" />
              <div>
                <h2 className="text-2xl font-bold text-htb-gray-light">Hash Password Cracker</h2>
                <p className="text-htb-gray">Crack password hashes using dictionary and brute force attacks</p>
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
            {/* Left Column - Configuration */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-htb-gray-light mb-2">
                  Target Hash
                </label>
                <textarea
                  value={targetHash}
                  onChange={(e) => setTargetHash(e.target.value)}
                  placeholder="Enter the hash you want to crack..."
                  className="htb-input w-full h-24 p-3 rounded-lg font-mono text-sm"
                  disabled={isRunning}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-htb-gray-light mb-2">
                    Hash Type
                  </label>
                  <select
                    value={hashType}
                    onChange={(e) => setHashType(e.target.value)}
                    className="htb-input w-full p-2 rounded-lg"
                    disabled={isRunning}
                  >
                    <option value="md5">MD5</option>
                    <option value="sha1">SHA-1</option>
                    <option value="sha256">SHA-256</option>
                    <option value="sha512">SHA-512</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-htb-gray-light mb-2">
                    Attack Mode
                  </label>
                  <select
                    value={attackMode}
                    onChange={(e) => setAttackMode(e.target.value)}
                    className="htb-input w-full p-2 rounded-lg"
                    disabled={isRunning}
                  >
                    <option value="dictionary">Dictionary Attack</option>
                    <option value="bruteforce">Brute Force</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-2">
                {!isRunning ? (
                  <button
                    onClick={startCracking}
                    className="htb-btn-primary px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Play className="h-4 w-4" />
                    <span>Start Cracking</span>
                  </button>
                ) : (
                  <button
                    onClick={stopCracking}
                    className="htb-btn-secondary px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>Stop</span>
                  </button>
                )}
              </div>

              {/* Progress */}
              {isRunning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-htb-gray">
                    <span>Progress: {progress.toFixed(1)}%</span>
                    <span>Time: {formatTime(timeElapsed)}</span>
                  </div>
                  <div className="w-full bg-htb-dark-light rounded-full h-2">
                    <div
                      className="bg-htb-green h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-htb-gray">
                    <span>Attempts: {attempts.toLocaleString()}</span>
                    <span>Rate: {attempts > 0 ? Math.round(attempts / Math.max(timeElapsed, 1)) : 0}/sec</span>
                  </div>
                </div>
              )}

              {/* Result */}
              {result && (
                <div className={`p-4 rounded-lg border ${
                  result.type === 'success' 
                    ? 'bg-htb-green/10 border-htb-green/30 text-htb-green'
                    : result.type === 'failure'
                    ? 'bg-htb-yellow/10 border-htb-yellow/30 text-htb-yellow'
                    : 'bg-htb-red/10 border-htb-red/30 text-htb-red'
                }`}>
                  <div className="flex items-start space-x-2">
                    {result.type === 'success' ? (
                      <CheckCircle className="h-5 w-5 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{result.message}</p>
                      {result.password && (
                        <div className="mt-2 flex items-center space-x-2">
                          <code className="bg-htb-dark-light px-2 py-1 rounded text-htb-gray-light">
                            {result.password}
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(result.password)}
                            className="text-htb-green hover:text-htb-green-light"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      {result.attempts && (
                        <p className="text-sm opacity-90 mt-1">
                          Method: {result.method} | Attempts: {result.attempts.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Examples and Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-htb-gray-light">Example Hashes</h3>
              
              <div className="space-y-3">
                {Object.entries(exampleHashes[hashType]).map(([password, hash]) => (
                  <div key={password} className="bg-htb-dark-light p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-htb-green">Password: {password}</span>
                      <button
                        onClick={() => loadExampleHash(password)}
                        className="text-xs htb-btn-secondary px-2 py-1 rounded"
                        disabled={isRunning}
                      >
                        Load
                      </button>
                    </div>
                    <code className="text-xs text-htb-gray-light font-mono break-all">
                      {hash}
                    </code>
                  </div>
                ))}
              </div>

              {/* Attack Info */}
              <div className="bg-htb-blue/10 border border-htb-blue/30 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-htb-blue mb-2">
                  {attackMode === 'dictionary' ? 'Dictionary Attack' : 'Brute Force Attack'}
                </h4>
                <p className="text-xs text-htb-blue opacity-90">
                  {attackMode === 'dictionary' 
                    ? `Tests ${commonPasswords.length} common passwords against the hash. Fast but limited to known passwords.`
                    : 'Systematically tries all possible combinations. Slower but more thorough (limited to 4 chars for demo).'
                  }
                </p>
              </div>

              {/* Educational Warning */}
              <div className="bg-htb-red/10 border border-htb-red/30 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-htb-red mt-0.5" />
                  <div className="text-sm text-htb-red">
                    <p className="font-medium mb-1">Educational Use Only</p>
                    <p className="text-xs opacity-90">
                      Only crack hashes you own or have explicit permission to test. Unauthorized password cracking is illegal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HashPasswordCracker;