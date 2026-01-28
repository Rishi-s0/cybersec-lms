import React, { useState } from 'react';
import { Mail, AlertTriangle, Shield, Eye, Link, Paperclip, CheckCircle, XCircle, Info, Play } from 'lucide-react';

const PhishingEmailDetector = ({ onClose }) => {
  const [emailContent, setEmailContent] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [selectedSample, setSelectedSample] = useState('');

  const phishingSamples = {
    'urgent-bank': {
      sender: 'security@bankofamerica-urgent.com',
      subject: 'URGENT: Your Account Will Be Suspended - Verify Now!',
      content: `Dear Valued Customer,

We have detected suspicious activity on your account. Your account will be suspended within 24 hours unless you verify your identity immediately.

Click here to verify your account: http://bankofamerica-verify.suspicious-domain.com/login

If you do not verify within 24 hours, your account will be permanently closed and you will lose access to your funds.

This is an automated message. Do not reply to this email.

Best regards,
Bank of America Security Team

IMPORTANT: This email contains multiple phishing indicators for educational purposes.`
    },
    'fake-paypal': {
      sender: 'service@paypal-security.net',
      subject: 'PayPal: Unusual Activity Detected',
      content: `Hello,

We've noticed some unusual activity in your PayPal account. To protect your account, we've temporarily limited it.

To restore full access, please confirm your identity:
https://paypal-restore.secure-verify.org/confirm

Account Details:
- Last login: Unknown location
- Amount at risk: $2,847.32

Please act quickly to avoid permanent account closure.

PayPal Security Team

Note: This is a simulated phishing email for educational analysis.`
    },
    'lottery-scam': {
      sender: 'winner@international-lottery.org',
      subject: 'CONGRATULATIONS! You Won $500,000 USD',
      content: `CONGRATULATIONS!!!

You have been selected as one of our lucky winners in the International Email Lottery Program. You have won the sum of $500,000 USD.

To claim your prize, please provide:
1. Full Name
2. Phone Number  
3. Address
4. Copy of ID

Send this information to: claims@lottery-winner.biz

Reference Number: INT/2024/WIN/007
Batch Number: 24/56/IPL

Contact our agent immediately: +1-555-SCAM-123

This is a limited time offer. Claim within 48 hours or forfeit your winnings.

International Lottery Commission

WARNING: This is a classic advance fee fraud example for educational purposes.`
    }
  };

  const phishingIndicators = {
    'urgent-language': {
      name: 'Urgent Language',
      description: 'Uses urgent, threatening language to create pressure',
      severity: 'High',
      patterns: ['urgent', 'immediately', 'suspend', 'expire', 'limited time', 'act now', 'within 24 hours']
    },
    'suspicious-sender': {
      name: 'Suspicious Sender',
      description: 'Sender domain doesn\'t match claimed organization',
      severity: 'Critical',
      patterns: ['similar but different domain', 'free email provider', 'misspelled domain']
    },
    'suspicious-links': {
      name: 'Suspicious Links',
      description: 'Links redirect to suspicious or unrelated domains',
      severity: 'Critical',
      patterns: ['shortened URLs', 'suspicious domains', 'IP addresses', 'misleading text']
    },
    'poor-grammar': {
      name: 'Poor Grammar/Spelling',
      description: 'Contains grammatical errors or spelling mistakes',
      severity: 'Medium',
      patterns: ['spelling errors', 'grammar mistakes', 'awkward phrasing']
    },
    'generic-greeting': {
      name: 'Generic Greeting',
      description: 'Uses generic greetings instead of personal information',
      severity: 'Medium',
      patterns: ['dear customer', 'dear user', 'valued customer', 'dear sir/madam']
    },
    'request-credentials': {
      name: 'Requests Credentials',
      description: 'Asks for passwords, PINs, or sensitive information',
      severity: 'Critical',
      patterns: ['password', 'pin', 'ssn', 'credit card', 'verify account', 'confirm identity']
    },
    'too-good-to-be-true': {
      name: 'Too Good to Be True',
      description: 'Offers unrealistic rewards or prizes',
      severity: 'High',
      patterns: ['won', 'winner', 'prize', 'lottery', 'free money', 'inheritance']
    },
    'no-contact-info': {
      name: 'Missing Contact Information',
      description: 'Lacks legitimate contact information or physical address',
      severity: 'Medium',
      patterns: ['no phone', 'no address', 'generic email', 'do not reply']
    }
  };

  const analyzeEmail = async () => {
    if (!emailContent.trim() || !senderEmail.trim() || !subject.trim()) {
      setAnalysisResults({ error: 'Please fill in all fields (sender, subject, and content)' });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResults(null);

    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const foundIndicators = [];
    const safetyChecks = [];
    const fullText = `${senderEmail} ${subject} ${emailContent}`.toLowerCase();

    // Check each phishing indicator
    Object.entries(phishingIndicators).forEach(([key, indicator]) => {
      const found = indicator.patterns.some(pattern => 
        fullText.includes(pattern.toLowerCase())
      );

      if (found) {
        foundIndicators.push({
          id: key,
          ...indicator,
          foundPatterns: indicator.patterns.filter(pattern => 
            fullText.includes(pattern.toLowerCase())
          )
        });
      } else {
        safetyChecks.push({
          check: indicator.name,
          status: 'Passed',
          description: `No ${indicator.name.toLowerCase()} detected`
        });
      }
    });

    // Additional checks
    const hasLinks = /https?:\/\/[^\s]+/gi.test(emailContent);
    const hasAttachments = /attachment|attached|download|file/gi.test(emailContent);
    const domainMismatch = checkDomainMismatch(senderEmail, emailContent);

    if (hasLinks) {
      const links = emailContent.match(/https?:\/\/[^\s]+/gi) || [];
      const suspiciousLinks = links.filter(link => 
        !link.includes('https://') || 
        link.includes('bit.ly') || 
        link.includes('tinyurl') ||
        /\d+\.\d+\.\d+\.\d+/.test(link) // IP address
      );

      if (suspiciousLinks.length > 0) {
        foundIndicators.push({
          id: 'suspicious-links-found',
          name: 'Suspicious Links Detected',
          description: 'Email contains potentially malicious links',
          severity: 'Critical',
          foundPatterns: suspiciousLinks
        });
      }
    }

    if (domainMismatch) {
      foundIndicators.push({
        id: 'domain-mismatch',
        name: 'Domain Mismatch',
        description: 'Sender domain doesn\'t match claimed organization',
        severity: 'Critical',
        foundPatterns: [domainMismatch]
      });
    }

    // Calculate risk score
    const criticalCount = foundIndicators.filter(i => i.severity === 'Critical').length;
    const highCount = foundIndicators.filter(i => i.severity === 'High').length;
    const mediumCount = foundIndicators.filter(i => i.severity === 'Medium').length;

    const riskScore = (criticalCount * 10) + (highCount * 6) + (mediumCount * 3);
    let riskLevel = 'Low';
    let recommendation = 'Email appears legitimate, but always verify sender through other means.';

    if (riskScore >= 15) {
      riskLevel = 'Critical';
      recommendation = 'This email shows strong signs of phishing. Do not click links or provide information. Report as spam.';
    } else if (riskScore >= 10) {
      riskLevel = 'High';
      recommendation = 'This email has several suspicious indicators. Verify sender through official channels before taking action.';
    } else if (riskScore >= 5) {
      riskLevel = 'Medium';
      recommendation = 'Some suspicious elements detected. Exercise caution and verify sender independently.';
    }

    setAnalysisResults({
      indicators: foundIndicators,
      safetyChecks,
      summary: {
        total: foundIndicators.length,
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        riskScore,
        riskLevel,
        recommendation
      },
      emailDetails: {
        sender: senderEmail,
        subject,
        hasLinks,
        hasAttachments,
        wordCount: emailContent.split(/\s+/).length
      },
      analysisTime: new Date().toISOString()
    });

    setIsAnalyzing(false);
  };

  const checkDomainMismatch = (sender, content) => {
    const senderDomain = sender.split('@')[1]?.toLowerCase();
    if (!senderDomain) return null;

    // Check for common organization claims vs sender domain
    const orgPatterns = {
      'paypal': /paypal/gi,
      'amazon': /amazon/gi,
      'microsoft': /microsoft/gi,
      'apple': /apple/gi,
      'google': /google/gi,
      'facebook': /facebook/gi,
      'bank': /bank|banking|financial/gi
    };

    for (const [org, pattern] of Object.entries(orgPatterns)) {
      if (pattern.test(content) && !senderDomain.includes(org)) {
        return `Claims to be from ${org} but sender domain is ${senderDomain}`;
      }
    }

    return null;
  };

  const loadSample = (sampleKey) => {
    const sample = phishingSamples[sampleKey];
    if (sample) {
      setSenderEmail(sample.sender);
      setSubject(sample.subject);
      setEmailContent(sample.content);
      setSelectedSample(sampleKey);
      setAnalysisResults(null);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'text-htb-red bg-htb-red/10 border-htb-red/30';
      case 'High': return 'text-htb-orange bg-htb-orange/10 border-htb-orange/30';
      case 'Medium': return 'text-htb-yellow bg-htb-yellow/10 border-htb-yellow/30';
      case 'Low': return 'text-htb-blue bg-htb-blue/10 border-htb-blue/30';
      default: return 'text-htb-gray bg-htb-gray/10 border-htb-gray/30';
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'Critical': return 'text-htb-red';
      case 'High': return 'text-htb-orange';
      case 'Medium': return 'text-htb-yellow';
      case 'Low': return 'text-htb-green';
      default: return 'text-htb-gray';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="htb-card rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Mail className="h-8 w-8 text-htb-green" />
              <div>
                <h2 className="text-2xl font-bold text-htb-gray-light">Phishing Email Detector</h2>
                <p className="text-htb-gray">Analyze emails for phishing indicators and social engineering tactics</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-htb-gray hover:text-htb-red transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Sample Emails */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-htb-gray-light mb-3">Sample Phishing Emails</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {Object.entries(phishingSamples).map(([key, sample]) => (
                <button
                  key={key}
                  onClick={() => loadSample(key)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedSample === key
                      ? 'border-htb-green bg-htb-green/10'
                      : 'border-htb-gray/30 hover:border-htb-green/50'
                  }`}
                >
                  <div className="font-medium text-htb-gray-light text-sm mb-1">
                    {sample.subject.substring(0, 40)}...
                  </div>
                  <div className="text-xs text-htb-gray">
                    From: {sample.sender}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Email Input Form */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-htb-gray-light mb-2">
                Sender Email
              </label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="sender@example.com"
                className="htb-input w-full p-2 rounded-lg"
                disabled={isAnalyzing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-htb-gray-light mb-2">
                Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                className="htb-input w-full p-2 rounded-lg"
                disabled={isAnalyzing}
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-htb-gray-light mb-2">
              Email Content
            </label>
            <textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              placeholder="Paste the email content here..."
              rows={8}
              className="htb-input w-full p-3 rounded-lg resize-none"
              disabled={isAnalyzing}
            />
          </div>

          {/* Analyze Button */}
          <div className="mb-6">
            <button
              onClick={analyzeEmail}
              disabled={isAnalyzing}
              className="htb-btn-primary px-6 py-3 rounded-lg flex items-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <Eye className="h-5 w-5 animate-pulse" />
                  <span>Analyzing Email...</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  <span>Analyze for Phishing</span>
                </>
              )}
            </button>
          </div>

          {/* Analysis Results */}
          {analysisResults && (
            <div className="space-y-6">
              {analysisResults.error ? (
                <div className="bg-htb-red/10 border border-htb-red/30 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-htb-red" />
                    <span className="text-htb-red font-medium">{analysisResults.error}</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Risk Assessment */}
                  <div className="bg-htb-dark-light p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-htb-gray-light mb-4">Risk Assessment</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-center mb-4">
                          <div className={`text-3xl font-bold ${getRiskLevelColor(analysisResults.summary.riskLevel)}`}>
                            {analysisResults.summary.riskLevel}
                          </div>
                          <div className="text-sm text-htb-gray">Risk Level (Score: {analysisResults.summary.riskScore})</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-lg font-bold text-htb-red">{analysisResults.summary.critical}</div>
                            <div className="text-xs text-htb-gray">Critical</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-htb-orange">{analysisResults.summary.high}</div>
                            <div className="text-xs text-htb-gray">High</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-htb-yellow">{analysisResults.summary.medium}</div>
                            <div className="text-xs text-htb-gray">Medium</div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-htb-gray-light mb-2">Recommendation</h4>
                        <p className="text-sm text-htb-gray">{analysisResults.summary.recommendation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Phishing Indicators */}
                  {analysisResults.indicators.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-htb-gray-light mb-4">Phishing Indicators Found</h3>
                      <div className="space-y-3">
                        {analysisResults.indicators.map((indicator, index) => (
                          <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(indicator.severity)}`}>
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">{indicator.name}</h4>
                              <span className="px-2 py-1 rounded text-xs font-medium">
                                {indicator.severity}
                              </span>
                            </div>
                            <p className="text-sm opacity-90 mb-2">{indicator.description}</p>
                            {indicator.foundPatterns && indicator.foundPatterns.length > 0 && (
                              <div className="text-xs opacity-75">
                                <strong>Found patterns:</strong> {indicator.foundPatterns.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Safety Checks Passed */}
                  {analysisResults.safetyChecks.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-htb-gray-light mb-4">Safety Checks Passed</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {analysisResults.safetyChecks.map((check, index) => (
                          <div key={index} className="bg-htb-green/10 border border-htb-green/30 p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-htb-green" />
                              <span className="text-sm font-medium text-htb-green">{check.check}</span>
                            </div>
                            <p className="text-xs text-htb-green opacity-75 mt-1">{check.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Email Details */}
                  <div className="bg-htb-dark-light p-4 rounded-lg">
                    <h4 className="font-semibold text-htb-gray-light mb-2">Email Analysis Details</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-htb-gray">
                      <div>Sender: {analysisResults.emailDetails.sender}</div>
                      <div>Word Count: {analysisResults.emailDetails.wordCount}</div>
                      <div>Contains Links: {analysisResults.emailDetails.hasLinks ? 'Yes' : 'No'}</div>
                      <div>Mentions Attachments: {analysisResults.emailDetails.hasAttachments ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Educational Information */}
          <div className="mt-6 bg-htb-blue/10 border border-htb-blue/30 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-htb-blue mt-0.5" />
              <div className="text-sm text-htb-blue">
                <p className="font-medium mb-1">How to Protect Yourself from Phishing</p>
                <ul className="text-xs opacity-90 space-y-1">
                  <li>• Always verify sender through official channels</li>
                  <li>• Never click suspicious links or download unexpected attachments</li>
                  <li>• Check URLs carefully before entering credentials</li>
                  <li>• Be wary of urgent language and pressure tactics</li>
                  <li>• Use multi-factor authentication when available</li>
                  <li>• Keep software and browsers updated</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Educational Warning */}
          <div className="mt-4 bg-htb-red/10 border border-htb-red/30 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-htb-red mt-0.5" />
              <div className="text-sm text-htb-red">
                <p className="font-medium mb-1">Educational Tool Only</p>
                <p className="text-xs opacity-90">
                  This tool is for educational purposes to help identify phishing attempts. 
                  Always exercise caution with suspicious emails and report them to your IT security team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhishingEmailDetector;