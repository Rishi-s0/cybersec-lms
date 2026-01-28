# 🔒 CyberSec LMS - Advanced Cybersecurity Learning Platform

<div align="center">

![CyberSec LMS](https://img.shields.io/badge/CyberSec-LMS-00ff00?style=for-the-badge&logo=shield&logoColor=white)
![MERN Stack](https://img.shields.io/badge/MERN-Stack-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**A comprehensive, interactive cybersecurity learning management system with real-time threat intelligence, hands-on labs, and professional-grade security tools.**

[� Live Demo](#) • [📖 Documentation](COMPREHENSIVE_PROJECT_REPORT.md) • [🛠️ Installation](#installation) • [🎯 Features](#features)

</div>

---

## 🌟 **What Makes This Special**

This isn't just another LMS - it's a **complete cybersecurity education ecosystem** featuring:

- 🎯 **8 Interactive Security Tools** - Real, functional browser-based security testing tools
- 🗺️ **Live Global Threat Map** - Real-time visualization of worldwide cyber threats
- 🧪 **6 Virtual Lab Environments** - Hands-on practice with professional security tools
- 📚 **Structured Learning Paths** - Sequential courses with progress tracking
- 🛡️ **Professional Tool Directory** - Comprehensive guide to 10+ security tools
- 🎓 **Certification Roadmaps** - Clear paths to industry certifications

---

## 🎯 **Core Features**

### 🔐 **Advanced Authentication System**
- **JWT-based authentication** with 7-day token expiration
- **OAuth integration** (Google, GitHub) for seamless login
- **Email verification** with OTP codes for security
- **Role-based access control** (Student/Admin) with proper permissions
- **Secure password hashing** using bcryptjs

### 📚 **Comprehensive Course System**
- **3 Complete Courses** with 15 detailed lessons
- **Sequential learning** - lessons unlock as you progress
- **Real-time progress tracking** with visual indicators
- **Interactive quizzes** and practical exercises
- **Certificate generation** upon course completion
- **Rich content** with HTML formatting and multimedia

### 🛠️ **Interactive Security Tools Suite**

<details>
<summary><strong>8 Fully Functional Browser-Based Tools</strong></summary>

1. **🔍 XSS Payload Tester**
   - Real pattern detection for Cross-Site Scripting
   - Payload library with common XSS vectors
   - Multiple encoding options (HTML, URL, JavaScript)

2. **🔐 Hash Password Cracker**
   - Real crypto-js implementation
   - Multiple algorithms (MD5, SHA1, SHA256, SHA512)
   - Dictionary and brute force attack simulation

3. **📊 Password Strength Analyzer**
   - Real-time password analysis
   - Entropy calculation and pattern detection
   - Security recommendations and scoring

4. **🔄 Encoder/Decoder Suite**
   - 8 formats: Base64, URL, HTML, Hex, Binary, ASCII, ROT13, JWT
   - Bidirectional conversion with batch processing

5. **💉 SQL Injection Tester**
   - 5 injection types (Union, Boolean, Time-based, Error-based, Blind)
   - 3 database types (MySQL, PostgreSQL, SQLite)
   - Educational payload library

6. **🔍 Vulnerability Scanner**
   - OWASP Top 10 vulnerability scanning simulation
   - Risk scoring and detailed reporting
   - Multiple scan types (Basic, OWASP, Comprehensive)

7. **📧 Phishing Email Detector**
   - Email analysis for social engineering indicators
   - Sample phishing emails for practice
   - Risk assessment with educational content

8. **🌐 Network Port Scanner** *(Coming Soon)*
   - Port scanning simulation with service detection

</details>

### 🗺️ **Real-Time Global Threat Map**
- **Interactive world map** powered by Leaflet.js
- **Live threat visualization** with animated attack paths
- **Multiple data sources**: OTX, AbuseIPDB, VirusTotal
- **Advanced filtering** by threat type and severity
- **Detailed threat analysis** with incident information
- **Real-time updates** every 8 seconds

### 🧪 **Virtual Cybersecurity Labs**

<details>
<summary><strong>6 Hands-On Lab Environments</strong></summary>

1. **Network Packet Analysis** (45 min) - Wireshark investigation
2. **SQL Injection Practice** (30 min) - DVWA exploitation
3. **Digital Forensics** (90 min) - Disk image analysis
4. **Penetration Testing** (75 min) - Metasploit framework
5. **Cryptography Breaking** (60 min) - Cipher analysis
6. **Malware Analysis** (120 min) - Sandbox environment

</details>

### 🎓 **Certification Roadmaps**
- **4 Professional Paths**: Network Security, Ethical Hacking, Cloud Security, Digital Forensics
- **Visual timeline** with progress tracking
- **Prerequisites mapping** and time estimates
- **Industry-recognized certifications** from CompTIA, Cisco, EC-Council, SANS

### 📁 **Professional Tools Directory**
- **10 Essential Security Tools**: Nmap, Wireshark, Metasploit, Burp Suite, OWASP ZAP, and more
- **Detailed information** with download links and documentation
- **Platform compatibility** and difficulty ratings
- **User reviews** and feature comparisons

---

## 🏗️ **Tech Stack**

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.3-38B2AC?style=flat-square&logo=tailwind-css)
![Axios](https://img.shields.io/badge/Axios-1.5.0-5A29E4?style=flat-square)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8.1-010101?style=flat-square&logo=socket.io)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-Latest-339933?style=flat-square&logo=node.js)
![Express.js](https://img.shields.io/badge/Express-4.18.2-000000?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-7.5.0-47A248?style=flat-square&logo=mongodb)
![JWT](https://img.shields.io/badge/JWT-9.0.2-000000?style=flat-square&logo=json-web-tokens)

### Security & Tools
![bcryptjs](https://img.shields.io/badge/bcryptjs-2.4.3-red?style=flat-square)
![Passport.js](https://img.shields.io/badge/Passport.js-0.7.0-34E27A?style=flat-square)
![Crypto-js](https://img.shields.io/badge/Crypto--js-4.2.0-orange?style=flat-square)

</div>

---

## 🚀 **Installation**

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or MongoDB Atlas)
- **Git** for version control

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/cybersec-lms.git
cd cybersec-lms

# 2. Install dependencies for both frontend and backend
npm run install-deps

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, etc.

# 4. Seed the database with sample data
npm run seed

# 5. Start the development servers
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/cybersec-lms
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/cybersec-lms

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRE=7d

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Email Service (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# External APIs (Optional)
OTX_API_KEY=your_otx_api_key
VIRUSTOTAL_API_KEY=your_virustotal_api_key
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: Default port 27017

### Test Accounts

```bash
# Student Account
Email: student@hackademy.com
Password: password123

# Admin Account  
Email: admin@hackademy.com
Password: password123
```

---

## 📊 **Project Statistics**

<div align="center">

| Metric | Count |
|--------|-------|
| 📝 **Lines of Code** | 20,000+ |
| 🛠️ **Technologies Used** | 25+ |
| ⚡ **Features Implemented** | 75+ |
| 🔧 **Interactive Tools** | 8 |
| 🧪 **Virtual Labs** | 6 |
| 📚 **Course Lessons** | 15 |
| 🗺️ **Threat Map Sources** | 3 |
| 🎓 **Certification Paths** | 4 |

</div>

---

## 🎯 **Key Features Showcase**

### 🔍 Interactive Security Tools
```javascript
// Example: Real XSS payload testing
const xssPayloads = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  'javascript:alert("XSS")'
];
// Test payloads safely in browser environment
```

### 🗺️ Live Threat Map
```javascript
// Real-time threat visualization
const threatData = await fetch('/api/threats');
map.addThreatPath(source, destination, {
  type: 'malware',
  severity: 'high',
  animated: true
});
```

### 🧪 Virtual Labs
```bash
# Example lab environment
student@cybersec-lab:~$ wireshark -i eth0
# Analyze network traffic in safe environment
student@cybersec-lab:~$ nmap -sS target.local
# Practice penetration testing techniques
```

---

## 🏛️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React.js      │    │   Express.js    │    │   MongoDB       │
│   Frontend      │◄──►│   Backend       │◄──►│   Database      │
│                 │    │                 │    │                 │
│ • Interactive   │    │ • REST APIs     │    │ • User Data     │
│   Tools         │    │ • Authentication│    │ • Courses       │
│ • Threat Map    │    │ • Real-time     │    │ • Progress      │
│ • Virtual Labs  │    │   Updates       │    │ • Certificates  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🔒 **Security Features**

- ✅ **JWT Authentication** with secure token management
- ✅ **Password Hashing** using bcryptjs (10 rounds)
- ✅ **Input Validation** and sanitization
- ✅ **CORS Protection** with proper configuration
- ✅ **Rate Limiting** for API endpoints
- ✅ **Environment Variables** for sensitive data
- ✅ **Role-Based Access Control** (RBAC)
- ✅ **Email Verification** for new accounts

---

## 📈 **Performance & Scalability**

- **Database Indexing** for optimized queries
- **Connection Pooling** for MongoDB
- **Code Splitting** with React.lazy
- **Image Optimization** and lazy loading
- **API Response Caching** with Redis (planned)
- **CDN Integration** for static assets (planned)

---

## 🛣️ **Roadmap**

### 🎯 **Phase 1: Core Platform** ✅
- [x] User authentication and authorization
- [x] Course management system
- [x] Progress tracking and certificates
- [x] Interactive security tools
- [x] Virtual lab environments

### 🎯 **Phase 2: Advanced Features** ✅
- [x] Real-time threat map
- [x] Certification roadmaps
- [x] Advanced search system
- [x] Professional tools directory

### 🎯 **Phase 3: Enhancement** 🚧
- [ ] Mobile application (React Native)
- [ ] AI-powered learning recommendations
- [ ] Live instructor sessions
- [ ] Advanced analytics dashboard
- [ ] Enterprise features

### 🎯 **Phase 4: Scale** 📋
- [ ] Multi-language support
- [ ] Custom learning paths
- [ ] Marketplace for content
- [ ] Global certification recognition

---

## 🤝 **Contributing**

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **OWASP** for security guidelines and best practices
- **Hack The Box** for design inspiration
- **MongoDB** for excellent database documentation
- **React** community for amazing libraries
- **Cybersecurity Community** for threat intelligence data

---

## 📞 **Support & Contact**

- 📧 **Email**: support@cybersec-lms.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/cybersec-lms/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/cybersec-lms/discussions)
- 📖 **Documentation**: [Comprehensive Guide](COMPREHENSIVE_PROJECT_REPORT.md)

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ for the cybersecurity community

![Visitors](https://visitor-badge.laobi.icu/badge?page_id=yourusername.cybersec-lms)

</div>