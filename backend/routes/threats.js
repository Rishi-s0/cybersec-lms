const express = require('express');
const axios = require('axios');
const router = express.Router();

// Countries data for threat generation
const countries = {
  "Afghanistan": [33.9391, 67.7100], "Albania": [41.1533, 20.1683], "Algeria": [28.0339, 1.6596],
  "Argentina": [-38.4161, -63.6167], "Australia": [-25.2744, 133.7751], "Austria": [47.5162, 14.5501],
  "Brazil": [-14.2350, -51.9253], "Canada": [56.1304, -106.3468], "China": [35.8617, 104.1954],
  "France": [46.2276, 2.2137], "Germany": [51.1657, 10.4515], "India": [20.5937, 78.9629],
  "Japan": [36.2048, 138.2529], "Russia": [61.5240, 105.3188], "UK": [55.3781, -3.4360],
  "USA": [37.0902, -95.7129], "South Korea": [35.9078, 127.7669], "Netherlands": [52.1326, 5.2913],
  "Malaysia": [4.2105, 101.9758], "Singapore": [1.3521, 103.8198], "Thailand": [15.8700, 100.9925],
  "Vietnam": [14.0583, 108.2772], "Indonesia": [-0.7893, 113.9213], "Philippines": [12.8797, 121.7740],
  "South Africa": [-30.5595, 22.9375], "Egypt": [26.8206, 30.8025], "Turkey": [38.9637, 35.2433],
  "Iran": [32.4279, 53.6880], "Iraq": [33.2232, 43.6793], "Israel": [31.0461, 34.8516],
  "Saudi Arabia": [23.8859, 45.0792], "UAE": [23.4241, 53.8478], "Pakistan": [30.3753, 69.3451]
};

const threatTypes = ["Malware", "Phishing", "DDoS", "Ransomware", "Data Breach", "Botnet", "APT"];
const severities = ["Low", "Medium", "High", "Critical"];
const sectors = ['Finance', 'Healthcare', 'Government', 'Education', 'Technology', 'Retail'];
const vectors = ['Network', 'Email', 'Web', 'Mobile', 'Social', 'USB', 'Wireless'];

// API Keys from environment
const ABUSEIPDB_KEY = process.env.ABUSEIPDB_KEY;
const VIRUSTOTAL_KEY = process.env.VIRUSTOTAL_KEY;
const OTX_KEY = process.env.OTX_KEY;

// Fetch threats from OTX (AlienVault)
const fetchOTXThreats = async () => {
  if (!OTX_KEY) return [];
  
  try {
    const response = await axios.get('https://otx.alienvault.com/api/v1/pulses/activity?limit=5', {
      headers: { 'X-OTX-API-KEY': OTX_KEY },
      timeout: 10000
    });
    
    const threats = [];
    const pulses = response.data.results || [];
    
    for (const pulse of pulses.slice(0, 3)) {
      const indicators = pulse.indicators || [];
      for (const indicator of indicators.slice(0, 2)) {
        if (indicator.type === 'IPv4' && indicator.country) {
          const sourceCountry = getCountryFromName(indicator.country);
          if (sourceCountry) {
            const destCountry = getRandomCountry(sourceCountry);
            threats.push(createThreatFromAPI({
              id: `otx_${indicator.id || Date.now()}_${Math.random()}`,
              source_type: 'Real Feed (OTX)',
              type: `${pulse.name.substring(0, 30)} (OTX)`,
              severity: determineSeverity(pulse.tags),
              sourceCountry,
              destCountry,
              timestamp: indicator.created || new Date().toISOString()
            }));
          }
        }
      }
    }
    return threats;
  } catch (error) {
    console.error('OTX API Error:', error.message);
    return [];
  }
};

// Fetch threats from AbuseIPDB
const fetchAbuseIPDBThreats = async () => {
  if (!ABUSEIPDB_KEY) return [];
  
  try {
    const response = await axios.get('https://api.abuseipdb.com/api/v2/blacklist?limit=10&confidenceMinimum=75', {
      headers: { 
        'Key': ABUSEIPDB_KEY,
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    const threats = [];
    const ips = response.data.data || [];
    
    for (const ip of ips.slice(0, 2)) {
      const sourceCountry = getCountryFromCode(ip.countryCode);
      if (sourceCountry) {
        const destCountry = getRandomCountry(sourceCountry);
        threats.push(createThreatFromAPI({
          id: `abuse_${ip.ipAddress.replace(/\./g, '_')}_${Date.now()}`,
          source_type: 'Real Feed (AbuseIPDB)',
          type: `Malicious IP (${ip.usageType || 'Unknown'})`,
          severity: ip.abuseConfidenceScore >= 90 ? 'Critical' : ip.abuseConfidenceScore >= 75 ? 'High' : 'Medium',
          sourceCountry,
          destCountry,
          timestamp: new Date().toISOString()
        }));
      }
    }
    return threats;
  } catch (error) {
    console.error('AbuseIPDB API Error:', error.message);
    return [];
  }
};

// Fetch threats from VirusTotal
const fetchVirusTotalThreats = async () => {
  if (!VIRUSTOTAL_KEY) return [];
  
  try {
    const response = await axios.get('https://www.virustotal.com/api/v3/comments?limit=10', {
      headers: { 'x-apikey': VIRUSTOTAL_KEY },
      timeout: 10000
    });
    
    const threats = [];
    const comments = response.data.data || [];
    
    // Extract IPs from comments
    const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
    const foundIPs = new Set();
    
    for (const comment of comments) {
      const text = comment.attributes?.text || '';
      const ips = text.match(ipRegex);
      if (ips) {
        ips.forEach(ip => {
          if (!ip.startsWith('10.') && !ip.startsWith('192.168.') && !ip.startsWith('127.')) {
            foundIPs.add(ip);
          }
        });
      }
    }
    
    // Create threats from found IPs
    Array.from(foundIPs).slice(0, 2).forEach(ip => {
      const sourceCountry = getRandomCountryName();
      const destCountry = getRandomCountry(sourceCountry);
      threats.push(createThreatFromAPI({
        id: `vt_${ip.replace(/\./g, '_')}_${Date.now()}`,
        source_type: 'Real Feed (VirusTotal)',
        type: 'Suspicious IP Activity',
        severity: 'Medium',
        sourceCountry,
        destCountry,
        timestamp: new Date().toISOString()
      }));
    });
    
    return threats;
  } catch (error) {
    console.error('VirusTotal API Error:', error.message);
    return [];
  }
};

// Helper functions
const getCountryFromName = (countryName) => {
  const normalized = countryName.toLowerCase();
  for (const [country] of Object.entries(countries)) {
    if (country.toLowerCase().includes(normalized) || normalized.includes(country.toLowerCase())) {
      return country;
    }
  }
  return null;
};

const getCountryFromCode = (countryCode) => {
  const codeMap = {
    'US': 'USA', 'CN': 'China', 'RU': 'Russia', 'DE': 'Germany', 'GB': 'UK',
    'JP': 'Japan', 'IN': 'India', 'BR': 'Brazil', 'AU': 'Australia', 'CA': 'Canada',
    'FR': 'France', 'KR': 'South Korea', 'NL': 'Netherlands', 'MY': 'Malaysia',
    'SG': 'Singapore', 'TH': 'Thailand', 'VN': 'Vietnam', 'ID': 'Indonesia'
  };
  return codeMap[countryCode] || null;
};

const getRandomCountryName = () => {
  const countryNames = Object.keys(countries);
  return countryNames[Math.floor(Math.random() * countryNames.length)];
};

const getRandomCountry = (excludeCountry) => {
  const countryNames = Object.keys(countries).filter(c => c !== excludeCountry);
  return countryNames[Math.floor(Math.random() * countryNames.length)];
};

const determineSeverity = (tags) => {
  if (!tags || !Array.isArray(tags)) return 'Medium';
  const tagStr = tags.join(' ').toLowerCase();
  if (tagStr.includes('critical') || tagStr.includes('apt') || tagStr.includes('ransomware')) return 'Critical';
  if (tagStr.includes('malware') || tagStr.includes('exploit')) return 'High';
  return 'Medium';
};

const createThreatFromAPI = ({ id, source_type, type, severity, sourceCountry, destCountry, timestamp }) => {
  const [sourceLat, sourceLng] = countries[sourceCountry];
  const [destLat, destLng] = countries[destCountry];
  
  return {
    id,
    source_type,
    source: {
      latitude: sourceLat + (Math.random() - 0.5) * 4,
      longitude: sourceLng + (Math.random() - 0.5) * 8,
      country: sourceCountry
    },
    destination: {
      latitude: destLat + (Math.random() - 0.5) * 4,
      longitude: destLng + (Math.random() - 0.5) * 8,
      country: destCountry
    },
    type,
    severity,
    timestamp,
    targetSector: sectors[Math.floor(Math.random() * sectors.length)],
    attackVector: vectors[Math.floor(Math.random() * vectors.length)]
  };
};

// Generate simulated threat data
const generateSimulatedThreats = (count = 8) => {
  const countryNames = Object.keys(countries);
  const threats = [];
  
  for (let i = 0; i < count; i++) {
    const sourceCountry = countryNames[Math.floor(Math.random() * countryNames.length)];
    let destCountry = countryNames[Math.floor(Math.random() * countryNames.length)];
    while (destCountry === sourceCountry) {
      destCountry = countryNames[Math.floor(Math.random() * countryNames.length)];
    }
    
    const [sourceLat, sourceLng] = countries[sourceCountry];
    const [destLat, destLng] = countries[destCountry];
    
    threats.push({
      id: `sim_${Date.now()}_${i}`,
      source_type: 'Simulated',
      source: {
        latitude: sourceLat + (Math.random() - 0.5) * 4,
        longitude: sourceLng + (Math.random() - 0.5) * 8,
        country: sourceCountry
      },
      destination: {
        latitude: destLat + (Math.random() - 0.5) * 4,
        longitude: destLng + (Math.random() - 0.5) * 8,
        country: destCountry
      },
      type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      targetSector: sectors[Math.floor(Math.random() * sectors.length)],
      attackVector: vectors[Math.floor(Math.random() * vectors.length)]
    });
  }
  
  return threats;
};

// @route   GET /api/threats
// @desc    Get hybrid threat data (real + simulated)
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('Fetching threat data from multiple sources...');
    
    // Fetch real threats from APIs (with timeout)
    const [otxThreats, abuseThreats, vtThreats] = await Promise.allSettled([
      fetchOTXThreats(),
      fetchAbuseIPDBThreats(),
      fetchVirusTotalThreats()
    ]);
    
    // Combine real threats
    const realThreats = [
      ...(otxThreats.status === 'fulfilled' ? otxThreats.value : []),
      ...(abuseThreats.status === 'fulfilled' ? abuseThreats.value : []),
      ...(vtThreats.status === 'fulfilled' ? vtThreats.value : [])
    ];
    
    console.log(`Fetched ${realThreats.length} real threats`);
    
    // Generate simulated threats to fill the gap
    const simulatedCount = Math.max(8 - realThreats.length, 3); // Always have at least 3 simulated
    const simulatedThreats = generateSimulatedThreats(simulatedCount);
    
    console.log(`Generated ${simulatedThreats.length} simulated threats`);
    
    // Combine and shuffle
    const allThreats = [...realThreats, ...simulatedThreats];
    const shuffledThreats = allThreats.sort(() => Math.random() - 0.5);
    
    // Calculate stats
    const stats = {
      totalThreats: shuffledThreats.length,
      realThreats: realThreats.length,
      simulatedThreats: simulatedThreats.length,
      activeAttacks: shuffledThreats.filter(t => Math.random() > 0.3).length,
      countriesAffected: [...new Set([
        ...shuffledThreats.map(t => t.source.country),
        ...shuffledThreats.map(t => t.destination.country)
      ])].length,
      topThreatType: threatTypes[Math.floor(Math.random() * threatTypes.length)],
      criticalThreats: shuffledThreats.filter(t => t.severity === 'Critical').length,
      highThreats: shuffledThreats.filter(t => t.severity === 'High').length,
      mediumThreats: shuffledThreats.filter(t => t.severity === 'Medium').length,
      lowThreats: shuffledThreats.filter(t => t.severity === 'Low').length
    };
    
    res.json({
      threats: shuffledThreats,
      stats,
      timestamp: new Date().toISOString(),
      sources: {
        otx: otxThreats.status === 'fulfilled',
        abuseipdb: abuseThreats.status === 'fulfilled',
        virustotal: vtThreats.status === 'fulfilled'
      }
    });
  } catch (error) {
    console.error('Error generating threat data:', error);
    
    // Fallback to simulated data only
    const simulatedThreats = generateSimulatedThreats(12);
    const stats = {
      totalThreats: simulatedThreats.length,
      realThreats: 0,
      simulatedThreats: simulatedThreats.length,
      activeAttacks: simulatedThreats.filter(t => Math.random() > 0.3).length,
      countriesAffected: [...new Set([
        ...simulatedThreats.map(t => t.source.country),
        ...simulatedThreats.map(t => t.destination.country)
      ])].length,
      topThreatType: threatTypes[Math.floor(Math.random() * threatTypes.length)]
    };
    
    res.json({
      threats: simulatedThreats,
      stats,
      timestamp: new Date().toISOString(),
      fallback: true
    });
  }
});

// @route   GET /api/threats/stats
// @desc    Get threat statistics only
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    // Quick stats without full threat data
    const stats = {
      totalThreats: Math.floor(Math.random() * 20) + 10,
      activeAttacks: Math.floor(Math.random() * 15) + 5,
      countriesAffected: Math.floor(Math.random() * 25) + 15,
      topThreatType: threatTypes[Math.floor(Math.random() * threatTypes.length)],
      criticalThreats: Math.floor(Math.random() * 5) + 1,
      apiStatus: {
        otx: !!OTX_KEY,
        abuseipdb: !!ABUSEIPDB_KEY,
        virustotal: !!VIRUSTOTAL_KEY
      }
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error generating threat stats:', error);
    res.status(500).json({ message: 'Server error generating threat statistics' });
  }
});

module.exports = router;