import React, { useState, useEffect } from 'react';
import { Lock, ArrowUpDown, Copy, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';

const EncoderDecoderSuite = ({ onClose }) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('base64');
  const [operation, setOperation] = useState('encode');
  const [error, setError] = useState('');

  const formats = {
    base64: {
      name: 'Base64',
      description: 'Binary-to-text encoding scheme',
      encode: (text) => btoa(unescape(encodeURIComponent(text))),
      decode: (text) => decodeURIComponent(escape(atob(text)))
    },
    url: {
      name: 'URL Encoding',
      description: 'Percent-encoding for URLs',
      encode: (text) => encodeURIComponent(text),
      decode: (text) => decodeURIComponent(text)
    },
    html: {
      name: 'HTML Entities',
      description: 'HTML character entity encoding',
      encode: (text) => text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;'),
      decode: (text) => text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
    },
    hex: {
      name: 'Hexadecimal',
      description: 'Base-16 encoding',
      encode: (text) => Array.from(new TextEncoder().encode(text))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join(''),
      decode: (text) => {
        const cleanHex = text.replace(/[^0-9a-fA-F]/g, '');
        if (cleanHex.length % 2 !== 0) throw new Error('Invalid hex string');
        const bytes = [];
        for (let i = 0; i < cleanHex.length; i += 2) {
          bytes.push(parseInt(cleanHex.substr(i, 2), 16));
        }
        return new TextDecoder().decode(new Uint8Array(bytes));
      }
    },
    binary: {
      name: 'Binary',
      description: 'Base-2 encoding',
      encode: (text) => Array.from(new TextEncoder().encode(text))
        .map(byte => byte.toString(2).padStart(8, '0'))
        .join(' '),
      decode: (text) => {
        const binaryString = text.replace(/[^01\s]/g, '').replace(/\s+/g, ' ').trim();
        const bytes = binaryString.split(' ').map(bin => parseInt(bin, 2));
        return new TextDecoder().decode(new Uint8Array(bytes));
      }
    },
    ascii: {
      name: 'ASCII Codes',
      description: 'ASCII character codes',
      encode: (text) => Array.from(text)
        .map(char => char.charCodeAt(0))
        .join(' '),
      decode: (text) => text.split(/\s+/)
        .map(code => String.fromCharCode(parseInt(code)))
        .join('')
    },
    rot13: {
      name: 'ROT13',
      description: 'Caesar cipher with 13-character shift',
      encode: (text) => text.replace(/[a-zA-Z]/g, char => {
        const start = char <= 'Z' ? 65 : 97;
        return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start);
      }),
      decode: (text) => text.replace(/[a-zA-Z]/g, char => {
        const start = char <= 'Z' ? 65 : 97;
        return String.fromCharCode(((char.charCodeAt(0) - start - 13 + 26) % 26) + start);
      })
    },
    jwt: {
      name: 'JWT Decoder',
      description: 'JSON Web Token decoder (header & payload only)',
      encode: (text) => 'JWT encoding not supported - use decoder only',
      decode: (text) => {
        try {
          const parts = text.split('.');
          if (parts.length !== 3) throw new Error('Invalid JWT format');
          
          const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          
          return JSON.stringify({
            header,
            payload,
            signature: parts[2] + ' (signature not decoded for security)'
          }, null, 2);
        } catch (e) {
          throw new Error('Invalid JWT token');
        }
      }
    }
  };

  const processText = () => {
    if (!inputText.trim()) {
      setOutputText('');
      setError('');
      return;
    }

    try {
      const format = formats[selectedFormat];
      let result;

      if (operation === 'encode') {
        if (selectedFormat === 'jwt') {
          setError('JWT encoding is not supported. Use decoder only.');
          return;
        }
        result = format.encode(inputText);
      } else {
        result = format.decode(inputText);
      }

      setOutputText(result);
      setError('');
    } catch (err) {
      setError(`${operation === 'encode' ? 'Encoding' : 'Decoding'} failed: ${err.message}`);
      setOutputText('');
    }
  };

  useEffect(() => {
    processText();
  }, [inputText, selectedFormat, operation]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const swapInputOutput = () => {
    const temp = inputText;
    setInputText(outputText);
    setOutputText(temp);
    setOperation(operation === 'encode' ? 'decode' : 'encode');
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setError('');
  };

  const loadExample = () => {
    const examples = {
      base64: 'Hello, World!',
      url: 'Hello World & Special Characters!',
      html: '<script>alert("XSS")</script>',
      hex: 'Hello World',
      binary: 'Hi',
      ascii: 'ABC',
      rot13: 'Hello World',
      jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    };
    setInputText(examples[selectedFormat] || 'Hello World');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="htb-card rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Lock className="h-8 w-8 text-htb-green" />
              <div>
                <h2 className="text-2xl font-bold text-htb-gray-light">Encoder/Decoder Suite</h2>
                <p className="text-htb-gray">Encode and decode data in various formats</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-htb-gray hover:text-htb-red transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Controls */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-htb-gray-light mb-2">
                Format
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="htb-input w-full p-2 rounded-lg"
              >
                {Object.entries(formats).map(([key, format]) => (
                  <option key={key} value={key}>
                    {format.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-htb-gray-light mb-2">
                Operation
              </label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                className="htb-input w-full p-2 rounded-lg"
                disabled={selectedFormat === 'jwt'}
              >
                <option value="encode">Encode</option>
                <option value="decode">Decode</option>
              </select>
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={loadExample}
                className="htb-btn-secondary px-4 py-2 rounded-lg text-sm"
              >
                Load Example
              </button>
              <button
                onClick={clearAll}
                className="htb-btn-secondary px-4 py-2 rounded-lg text-sm flex items-center space-x-1"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Format Description */}
          <div className="bg-htb-blue/10 border border-htb-blue/30 p-3 rounded-lg mb-6">
            <p className="text-sm text-htb-blue">
              <strong>{formats[selectedFormat].name}:</strong> {formats[selectedFormat].description}
            </p>
          </div>

          {/* Input/Output Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-htb-gray-light">
                  Input ({operation === 'encode' ? 'Plain Text' : 'Encoded Text'})
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-htb-gray">
                    {inputText.length} chars
                  </span>
                  {inputText && (
                    <button
                      onClick={() => copyToClipboard(inputText)}
                      className="text-htb-green hover:text-htb-green-light"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Enter text to ${operation}...`}
                className="htb-input w-full h-48 p-3 rounded-lg font-mono text-sm resize-none"
              />
            </div>

            {/* Swap Button */}
            <div className="lg:hidden flex justify-center">
              <button
                onClick={swapInputOutput}
                className="htb-btn-secondary p-2 rounded-lg"
                disabled={!outputText}
              >
                <ArrowUpDown className="h-5 w-5" />
              </button>
            </div>

            {/* Output */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-htb-gray-light">
                  Output ({operation === 'encode' ? 'Encoded Text' : 'Plain Text'})
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-htb-gray">
                    {outputText.length} chars
                  </span>
                  {outputText && (
                    <button
                      onClick={() => copyToClipboard(outputText)}
                      className="text-htb-green hover:text-htb-green-light"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="relative">
                <textarea
                  value={outputText}
                  readOnly
                  placeholder="Output will appear here..."
                  className="htb-input w-full h-48 p-3 rounded-lg font-mono text-sm resize-none bg-htb-dark-light"
                />
                {/* Swap button for desktop */}
                <button
                  onClick={swapInputOutput}
                  className="hidden lg:block absolute top-1/2 -left-6 transform -translate-y-1/2 htb-btn-secondary p-2 rounded-lg"
                  disabled={!outputText}
                >
                  <ArrowUpDown className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-htb-red/10 border border-htb-red/30 rounded-lg flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-htb-red mt-0.5" />
              <div className="text-sm text-htb-red">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Success indicator */}
          {outputText && !error && (
            <div className="mt-4 p-3 bg-htb-green/10 border border-htb-green/30 rounded-lg flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-htb-green" />
              <span className="text-sm text-htb-green">
                Successfully {operation}d using {formats[selectedFormat].name}
              </span>
            </div>
          )}

          {/* Format Examples */}
          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-htb-dark-light p-3 rounded-lg">
              <h4 className="text-sm font-medium text-htb-green mb-2">Common Use Cases</h4>
              <ul className="text-xs text-htb-gray space-y-1">
                <li>• Data transmission</li>
                <li>• URL parameters</li>
                <li>• HTML content</li>
                <li>• Binary data</li>
              </ul>
            </div>
            <div className="bg-htb-dark-light p-3 rounded-lg">
              <h4 className="text-sm font-medium text-htb-green mb-2">Security Testing</h4>
              <ul className="text-xs text-htb-gray space-y-1">
                <li>• Payload encoding</li>
                <li>• Bypass filters</li>
                <li>• Data obfuscation</li>
                <li>• Token analysis</li>
              </ul>
            </div>
            <div className="bg-htb-dark-light p-3 rounded-lg">
              <h4 className="text-sm font-medium text-htb-green mb-2">Web Development</h4>
              <ul className="text-xs text-htb-gray space-y-1">
                <li>• Form data encoding</li>
                <li>• API responses</li>
                <li>• Cookie values</li>
                <li>• JWT tokens</li>
              </ul>
            </div>
            <div className="bg-htb-dark-light p-3 rounded-lg">
              <h4 className="text-sm font-medium text-htb-green mb-2">Forensics</h4>
              <ul className="text-xs text-htb-gray space-y-1">
                <li>• Data recovery</li>
                <li>• Log analysis</li>
                <li>• Evidence examination</li>
                <li>• Protocol analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncoderDecoderSuite;