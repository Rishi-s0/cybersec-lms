import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  AlertTriangle, 
  Shield, 
  Activity, 
  TrendingUp,
  MapPin,
  Clock,
  Zap,
  Eye,
  Filter,
  Wifi,
  Target,
  Skull
} from 'lucide-react';

const ThreatMap = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const threatLinesRef = useRef(null);
  const [liveThreats, setLiveThreats] = useState([]);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [threatStats, setThreatStats] = useState({
    totalThreats: 0,
    activeAttacks: 0,
    countriesAffected: 0,
    topThreatType: '',
    lastUpdated: null,
    isLoading: false
  });
  const [filters, setFilters] = useState({
    all: true,
    malware: true,
    phishing: true,
    ddos: true,
    ransomware: true,
    'data breach': true,
    'reported ip': true,
    'otx indicator': true,
    other: true
  });
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Countries data from your original code
  const countries = {
    "Afghanistan": [33.9391, 67.7100], "Albania": [41.1533, 20.1683], "Algeria": [28.0339, 1.6596],
    "Andorra": [42.5063, 1.5218], "Angola": [-11.2027, 17.8739], "Argentina": [-38.4161, -63.6167],
    "Armenia": [40.0691, 45.0382], "Australia": [-25.2744, 133.7751], "Austria": [47.5162, 14.5501],
    "Azerbaijan": [40.1431, 47.5769], "Bahamas": [25.0343, -77.3963], "Bahrain": [25.9304, 50.6378],
    "Bangladesh": [23.6850, 90.3563], "Belarus": [53.7098, 27.9534], "Belgium": [50.5039, 4.4699],
    "Brazil": [-14.2350, -51.9253], "Bulgaria": [42.7339, 25.4858], "Canada": [56.1304, -106.3468],
    "China": [35.8617, 104.1954], "Colombia": [4.5709, -74.2973], "Croatia": [45.1000, 15.2000],
    "Czech Republic": [49.8175, 15.4730], "Denmark": [56.2639, 9.5018], "Egypt": [26.8206, 30.8025],
    "Finland": [61.9241, 25.7482], "France": [46.2276, 2.2137], "Germany": [51.1657, 10.4515],
    "Greece": [39.0742, 21.8243], "India": [20.5937, 78.9629], "Indonesia": [-0.7893, 113.9213],
    "Iran": [32.4279, 53.6880], "Iraq": [33.2232, 43.6793], "Ireland": [53.4129, -8.2439],
    "Israel": [31.0461, 34.8516], "Italy": [41.8719, 12.5674], "Japan": [36.2048, 138.2529],
    "Malaysia": [4.2105, 101.9758], "Mexico": [23.6345, -102.5528], "Netherlands": [52.1326, 5.2913],
    "Norway": [60.4720, 8.4689], "Pakistan": [30.3753, 69.3451], "Poland": [51.9194, 19.1451],
    "Portugal": [39.3999, -8.2245], "Romania": [45.9432, 24.9668], "Russia": [61.5240, 105.3188],
    "Saudi Arabia": [23.8859, 45.0792], "Singapore": [1.3521, 103.8198], "South Africa": [-30.5595, 22.9375],
    "South Korea": [35.9078, 127.7669], "Spain": [40.4637, -3.7492], "Sweden": [60.1282, 18.6435],
    "Switzerland": [46.8182, 8.2275], "Thailand": [15.8700, 100.9925], "Turkey": [38.9637, 35.2433],
    "UK": [55.3781, -3.4360], "Ukraine": [48.3794, 31.1656], "USA": [37.0902, -95.7129],
    "United Kingdom": [55.3781, -3.4360], "United States": [37.0902, -95.7129], "Vietnam": [14.0583, 108.2772]
  };

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !window.L) {
        // Load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Load Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          // Load AntPath plugin
          const antPathScript = document.createElement('script');
          antPathScript.src = 'https://unpkg.com/leaflet-ant-path@1.3.0/dist/leaflet-ant-path.js';
          antPathScript.onload = () => {
            initializeMap();
          };
          document.head.appendChild(antPathScript);
        };
        document.head.appendChild(script);
      } else if (window.L) {
        initializeMap();
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = window.L.map(mapRef.current, {
      preferCanvas: true,
      attributionControl: false
    }).setView([20, 0], 2);

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    const threatLines = window.L.layerGroup().addTo(map);
    
    mapInstanceRef.current = map;
    threatLinesRef.current = threatLines;
    setIsMapLoaded(true);
  };

  // Fetch threat data from backend API (real + simulated mix)
  const fetchThreatData = async () => {
    setThreatStats(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await fetch('/api/threats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setLiveThreats(data.threats || []);
      setThreatStats({
        totalThreats: data.stats?.totalThreats || 0,
        activeAttacks: data.stats?.activeAttacks || 0,
        countriesAffected: data.stats?.countriesAffected || 0,
        topThreatType: data.stats?.topThreatType || 'Unknown',
        realThreats: data.stats?.realThreats || 0,
        simulatedThreats: data.stats?.simulatedThreats || 0,
        lastUpdated: new Date(),
        isLoading: false
      });
      
      console.log(`Loaded ${data.threats?.length || 0} threats (${data.stats?.realThreats || 0} real, ${data.stats?.simulatedThreats || 0} simulated)`);
      
      if (data.sources) {
        console.log('API Sources:', data.sources);
      }
      
    } catch (error) {
      console.error('Error fetching threat data:', error);
      
      // Fallback to local simulated data
      const fallbackThreats = generateFallbackThreats();
      setLiveThreats(fallbackThreats);
      setThreatStats({
        totalThreats: fallbackThreats.length,
        activeAttacks: Math.floor(fallbackThreats.length * 0.7),
        countriesAffected: 15,
        topThreatType: 'Malware',
        realThreats: 0,
        simulatedThreats: fallbackThreats.length,
        lastUpdated: new Date(),
        isLoading: false
      });
    }
  };

  // Fallback threat generation for offline mode
  const generateFallbackThreats = () => {
    const threatTypes = [
      'Malware', 'Phishing', 'DDoS', 'Ransomware', 'Data Breach', 
      'Reported IP', 'OTX Indicator', 'Botnet', 'SQL Injection', 'APT'
    ];
    
    const severityLevels = ['Low', 'Medium', 'High', 'Critical'];
    const countryNames = Object.keys(countries);
    
    return Array.from({ length: 12 }, (_, i) => {
      const sourceCountry = countryNames[Math.floor(Math.random() * countryNames.length)];
      let destCountry = countryNames[Math.floor(Math.random() * countryNames.length)];
      while (destCountry === sourceCountry) {
        destCountry = countryNames[Math.floor(Math.random() * countryNames.length)];
      }
      
      const [sourceLat, sourceLng] = countries[sourceCountry];
      const [destLat, destLng] = countries[destCountry];
      
      return {
        id: `fallback_${Date.now()}_${i}`,
        source_type: 'Simulated (Offline)',
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
        severity: severityLevels[Math.floor(Math.random() * severityLevels.length)],
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        targetSector: ['Finance', 'Healthcare', 'Government', 'Education', 'Retail'][Math.floor(Math.random() * 5)],
        attackVector: ['Email', 'Web', 'Network', 'Mobile', 'Social'][Math.floor(Math.random() * 5)]
      };
    });
  };

  // Initialize threat data and map visualization
  useEffect(() => {
    if (isMapLoaded) {
      fetchThreatData();
      const interval = setInterval(fetchThreatData, 8000); // Update every 8 seconds for testing
      return () => clearInterval(interval);
    }
  }, [isMapLoaded]);

  // Update map visualization when threats or filters change
  useEffect(() => {
    if (isMapLoaded && threatLinesRef.current) {
      updateMapVisualization();
    }
  }, [liveThreats, filters, isMapLoaded]);

  const getLineStyling = (attackType, sourceType, severity) => {
    let pulseColor;
    let weight = 2;
    let delay = 250;
    let dashArray = [6, 30];

    const typeLower = attackType.toLowerCase();
    if (typeLower.includes('malware')) {
      pulseColor = '#f85149'; // HTB red
    } else if (typeLower.includes('phishing')) {
      pulseColor = '#ff6b35'; // HTB orange
    } else if (typeLower.includes('ddos')) {
      pulseColor = '#58a6ff'; // HTB blue
    } else if (typeLower.includes('ransomware')) {
      pulseColor = '#a5a5ff'; // HTB purple
    } else if (typeLower.includes('data breach')) {
      pulseColor = '#ff8c00';
    } else if (typeLower.includes('reported ip') || typeLower.includes('malicious ip')) {
      pulseColor = '#9fef00'; // HTB green
    } else if (typeLower.includes('otx indicator')) {
      pulseColor = '#00ffdd';
    } else {
      pulseColor = '#8b949e'; // HTB gray
    }

    if (severity === 'Critical') {
      weight = 3;
      delay = 150;
    } else if (severity === 'High') {
      weight = 2.5;
      delay = 200;
    }

    return { pulseColor, weight, delay, dashArray };
  };

  const getGreatCircleArc = (start, end) => {
    const arcPoints = [];
    const n = 50;
    const startX = start[1];
    const startY = start[0];
    const endX = end[1];
    const endY = end[0];

    let deltaX = endX - startX;
    if (deltaX > 180) deltaX -= 360;
    else if (deltaX < -180) deltaX += 360;

    for (let i = 0; i <= n; i++) {
      const step = i / n;
      const lat = (1 - step) * startY + step * endY;
      const lng = startX + step * deltaX;
      const curve = Math.sin(step * Math.PI) * (Math.abs(deltaX) / 4);
      arcPoints.push([lat + curve, lng]);
    }
    return arcPoints;
  };

  const normalizeTypeForFilter = (apiType) => {
    const typeLower = apiType.toLowerCase();
    if (typeLower.includes('malware')) return 'malware';
    if (typeLower.includes('phishing')) return 'phishing';
    if (typeLower.includes('ddos')) return 'ddos';
    if (typeLower.includes('ransomware')) return 'ransomware';
    if (typeLower.includes('data breach')) return 'data breach';
    if (typeLower.includes('reported ip') || typeLower.includes('malicious ip')) return 'reported ip';
    if (typeLower.includes('otx indicator')) return 'otx indicator';
    return 'other';
  };

  const updateMapVisualization = () => {
    if (!threatLinesRef.current || !window.L) return;

    threatLinesRef.current.clearLayers();

    const filteredThreats = liveThreats.filter(threat => {
      if (filters.all) return true;
      const normalizedType = normalizeTypeForFilter(threat.type);
      return filters[normalizedType];
    });

    filteredThreats.forEach(threat => {
      const sourceLatLng = [threat.source.latitude, threat.source.longitude];
      const destLatLng = [threat.destination.latitude, threat.destination.longitude];
      const styling = getLineStyling(threat.type, threat.source_type, threat.severity);

      const arcPoints = getGreatCircleArc(sourceLatLng, destLatLng);

      if (window.L.polyline && window.L.polyline.antPath) {
        const attackLine = window.L.polyline.antPath(arcPoints, {
          delay: styling.delay,
          dashArray: styling.dashArray,
          weight: styling.weight,
          color: "rgba(0,0,0,0)",
          pulseColor: styling.pulseColor,
          paused: false,
          reverse: false,
          hardwareAccelerated: true
        }).addTo(threatLinesRef.current);

        attackLine.bindPopup(`
          <div class="htb-popup">
            <h3 style="color: #9fef00; margin: 0 0 8px 0; font-family: 'JetBrains Mono', monospace;">${threat.type}</h3>
            <p><strong>ID:</strong> ${threat.id}</p>
            <p><strong>Source:</strong> ${threat.source.country}</p>
            <p><strong>Target:</strong> ${threat.destination.country}</p>
            <p><strong>Severity:</strong> <span style="color: ${styling.pulseColor};">${threat.severity}</span></p>
            <p><strong>Time:</strong> ${new Date(threat.timestamp).toLocaleString()}</p>
          </div>
        `);
      }
    });
  };

  const handleFilterChange = (filterType) => {
    if (filterType === 'all') {
      const newAllState = !filters.all;
      setFilters(prev => {
        const newFilters = { ...prev, all: newAllState };
        Object.keys(newFilters).forEach(key => {
          if (key !== 'all') newFilters[key] = newAllState;
        });
        return newFilters;
      });
    } else {
      setFilters(prev => {
        const newFilters = { ...prev, [filterType]: !prev[filterType] };
        const allTypesChecked = Object.keys(newFilters)
          .filter(key => key !== 'all')
          .every(key => newFilters[key]);
        newFilters.all = allTypesChecked;
        return newFilters;
      });
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Low': return 'text-htb-green bg-htb-green/20 border-htb-green/30';
      case 'Medium': return 'text-htb-orange bg-htb-orange/20 border-htb-orange/30';
      case 'High': return 'text-htb-red bg-htb-red/20 border-htb-red/30';
      case 'Critical': return 'text-htb-red bg-htb-red/30 border-htb-red/50';
      default: return 'text-htb-gray bg-htb-gray/20 border-htb-gray/30';
    }
  };

  const recentThreats = liveThreats
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <Globe className="h-12 w-12 text-htb-green mr-4 animate-float" />
          <span className="text-sm font-medium text-htb-green uppercase tracking-wider bg-htb-green/10 px-3 py-1 rounded-full border border-htb-green/20">
            Live Monitoring
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-htb-gray-light matrix-text">
          Global Cyber Threat Map
        </h1>
        <p className="text-xl text-htb-gray max-w-4xl mx-auto leading-relaxed">
          Real-time visualization of cybersecurity threats detected worldwide. 
          Monitor active attacks, threat patterns, and global security incidents.
        </p>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="htb-card p-6 text-center htb-glow">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className={`h-8 w-8 text-htb-red ${threatStats.isLoading ? 'animate-pulse' : ''}`} />
          </div>
          <div className={`text-2xl font-bold text-htb-gray-light font-mono transition-all duration-500 ${threatStats.isLoading ? 'animate-pulse' : ''}`}>
            {threatStats.totalThreats}
          </div>
          <div className="text-sm text-htb-gray">Total Threats</div>
        </div>

        <div className="htb-card p-6 text-center htb-glow">
          <div className="flex items-center justify-center mb-4">
            <Activity className={`h-8 w-8 text-htb-orange ${threatStats.isLoading ? 'animate-pulse' : ''}`} />
          </div>
          <div className={`text-2xl font-bold text-htb-gray-light font-mono transition-all duration-500 ${threatStats.isLoading ? 'animate-pulse' : ''}`}>
            {threatStats.activeAttacks}
          </div>
          <div className="text-sm text-htb-gray">Active Attacks</div>
        </div>

        <div className="htb-card p-6 text-center htb-glow">
          <div className="flex items-center justify-center mb-4">
            <Globe className={`h-8 w-8 text-htb-blue ${threatStats.isLoading ? 'animate-pulse' : ''}`} />
          </div>
          <div className={`text-2xl font-bold text-htb-gray-light font-mono transition-all duration-500 ${threatStats.isLoading ? 'animate-pulse' : ''}`}>
            {threatStats.countriesAffected}
          </div>
          <div className="text-sm text-htb-gray">Countries Affected</div>
        </div>

        <div className="htb-card p-6 text-center htb-glow">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className={`h-8 w-8 text-htb-green ${threatStats.isLoading ? 'animate-pulse' : ''}`} />
          </div>
          <div className={`text-lg font-bold text-htb-gray-light font-mono transition-all duration-500 ${threatStats.isLoading ? 'animate-pulse' : ''}`}>
            {threatStats.topThreatType}
          </div>
          <div className="text-sm text-htb-gray">Top Threat Type</div>
        </div>
      </div>

      {/* Data Sources Indicator */}
      <div className="htb-card p-4 border border-htb-green/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-htb-green rounded-full animate-pulse"></div>
              <span className="text-htb-gray text-sm font-mono">
                Real Threats: {threatStats.realThreats || 0}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-htb-blue rounded-full animate-pulse"></div>
              <span className="text-htb-gray text-sm font-mono">
                Simulated: {threatStats.simulatedThreats || 0}
              </span>
            </div>
          </div>
          <div className="text-xs text-htb-gray font-mono">
            Sources: OTX • AbuseIPDB • VirusTotal
          </div>
        </div>
      </div>

      {/* Interactive Threat Map */}
      <div className="htb-card rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-htb-gray-dark/30">
          <div className="flex items-center space-x-3">
            <Target className="h-6 w-6 text-htb-green" />
            <h2 className="text-2xl font-bold text-htb-gray-light matrix-text">Live Threat Map</h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full htb-pulse ${threatStats.isLoading ? 'bg-htb-orange' : 'status-online'}`}></div>
            <span className="text-htb-gray text-sm font-mono">
              {threatStats.isLoading ? 'updating...' : 
               threatStats.lastUpdated ? `updated ${threatStats.lastUpdated.toLocaleTimeString()}` : 'live updates'}
            </span>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative">
          <div 
            ref={mapRef} 
            className="w-full h-96 md:h-[500px] bg-htb-black"
            style={{ minHeight: '400px' }}
          />
        </div>

        {/* Filter Controls & Legend Tab - Below Map */}
        <div className="filter-tab border-t border-htb-green/30 p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Threat Filters Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Filter className="h-5 w-5 text-htb-green" />
                <span className="text-htb-green font-mono font-semibold text-lg">Threat Filters</span>
              </div>
              
              <div className="flex flex-wrap gap-3 text-sm">
                <label className={`flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-lg border filter-button ${filters.all ? 'active bg-htb-green/20 border-htb-green/40' : 'bg-htb-darker/70 border-htb-gray-dark/50 hover:bg-htb-green/10 hover:border-htb-green/30'}`}>
                  <input
                    type="checkbox"
                    checked={filters.all}
                    onChange={() => handleFilterChange('all')}
                    className="filter-controls accent-htb-green"
                  />
                  <span className="text-htb-gray-light font-mono font-medium">All Threats</span>
                </label>
                
                {Object.keys(filters).filter(key => key !== 'all').map(filterType => (
                  <label key={filterType} className={`flex items-center space-x-2 cursor-pointer px-3 py-2 rounded-lg border filter-button ${filters[filterType] ? 'active bg-htb-green/10 border-htb-green/30' : 'bg-htb-darker/70 border-htb-gray-dark/50 hover:bg-htb-green/5 hover:border-htb-green/20'}`}>
                    <input
                      type="checkbox"
                      checked={filters[filterType]}
                      onChange={() => handleFilterChange(filterType)}
                      className="filter-controls accent-htb-green"
                    />
                    <span className="text-htb-gray-light font-mono capitalize text-sm">
                      {filterType.replace(/[_-]/g, ' ')}
                    </span>
                  </label>
                ))}
              </div>
              
              {/* Filter Stats */}
              <div className="mt-4">
                <div className="inline-flex items-center space-x-4 text-xs text-htb-gray font-mono filter-stats">
                  <span className="flex items-center space-x-1">
                    <Activity className="h-3 w-3 text-htb-green" />
                    <span>Active Filters: {Object.values(filters).filter(Boolean).length - 1}</span>
                  </span>
                  <span className="text-htb-green">•</span>
                  <span className="flex items-center space-x-1">
                    <Eye className="h-3 w-3 text-htb-blue" />
                    <span>Showing: {liveThreats.filter(threat => {
                      if (filters.all) return true;
                      const normalizedType = normalizeTypeForFilter(threat.type);
                      return filters[normalizedType];
                    }).length} threats</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Threat Severity Legend Section */}
            <div className="lg:col-span-1">
              <div className="bg-htb-darker/50 border border-htb-green/30 rounded-lg p-4">
                <h4 className="text-htb-green font-mono text-lg mb-4 flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Threat Severity</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-htb-red rounded-full htb-pulse"></div>
                      <span className="text-htb-gray-light font-mono text-sm">Critical</span>
                    </div>
                    <span className="text-htb-red font-mono text-xs">
                      {liveThreats.filter(t => t.severity === 'Critical').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-htb-orange rounded-full htb-pulse"></div>
                      <span className="text-htb-gray-light font-mono text-sm">High</span>
                    </div>
                    <span className="text-htb-orange font-mono text-xs">
                      {liveThreats.filter(t => t.severity === 'High').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-htb-green rounded-full htb-pulse"></div>
                      <span className="text-htb-gray-light font-mono text-sm">Medium</span>
                    </div>
                    <span className="text-htb-green font-mono text-xs">
                      {liveThreats.filter(t => t.severity === 'Medium').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-htb-blue rounded-full htb-pulse"></div>
                      <span className="text-htb-gray-light font-mono text-sm">Low</span>
                    </div>
                    <span className="text-htb-blue font-mono text-xs">
                      {liveThreats.filter(t => t.severity === 'Low').length}
                    </span>
                  </div>
                </div>
                
                {/* Total Threats Summary */}
                <div className="mt-4 pt-3 border-t border-htb-green/20">
                  <div className="flex items-center justify-between">
                    <span className="text-htb-green font-mono text-sm font-semibold">Total Active</span>
                    <span className="text-htb-green font-mono text-sm font-bold">
                      {liveThreats.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Threats Feed */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="htb-card p-6 h-fit">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Wifi className="h-5 w-5 text-htb-green" />
              <h2 className="text-xl font-bold text-htb-gray-light matrix-text">Recent Threats</h2>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-htb-green rounded-full animate-pulse"></div>
              <Eye className="h-5 w-5 text-htb-gray" />
            </div>
          </div>

          <div className="space-y-3 h-[500px] overflow-y-auto pr-2 threat-feed-scroll">
            {recentThreats.length > 0 ? recentThreats.map(threat => (
              <div 
                key={threat.id}
                className="border border-htb-gray-dark/30 rounded-lg p-4 hover:border-htb-green/50 hover:bg-htb-green/5 transition-all cursor-pointer group"
                onClick={() => setSelectedThreat(threat)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2 flex-wrap">
                      <span className="font-semibold text-htb-gray-light font-mono text-sm truncate">{threat.type}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(threat.severity)} whitespace-nowrap`}>
                        {threat.severity}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-htb-gray mb-2">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{threat.source.country} → {threat.destination.country}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="whitespace-nowrap">{new Date(threat.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <div className="text-xs text-htb-gray font-mono">
                      <span className="text-htb-green">Vector:</span> {threat.attackVector} | <span className="text-htb-green">Target:</span> {threat.targetSector}
                    </div>
                  </div>
                  <Skull className="h-4 w-4 text-htb-red group-hover:text-htb-green transition-colors flex-shrink-0 ml-2" />
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <Wifi className="h-12 w-12 text-htb-gray mx-auto mb-4" />
                <p className="text-htb-gray">Loading threat data...</p>
              </div>
            )}
          </div>
        </div>

        {/* Threat Analysis */}
        <div className="htb-card p-6 h-fit">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="h-5 w-5 text-htb-green" />
            <h2 className="text-xl font-bold text-htb-gray-light matrix-text">Threat Analysis</h2>
          </div>

          <div className="h-[500px] overflow-y-auto pr-2 threat-feed-scroll">
            {selectedThreat ? (
              <div className="space-y-6">
                <div className="border-l-4 border-htb-green pl-4 bg-htb-green/5 py-3 rounded-r-lg">
                  <h3 className="text-lg font-semibold text-htb-gray-light font-mono">{selectedThreat.type}</h3>
                  <p className="text-htb-gray text-sm">Detailed analysis of selected threat</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-htb-darker/30 p-3 rounded-lg">
                    <label className="text-sm font-medium text-htb-gray block mb-2">Severity Level</label>
                    <div className={`px-3 py-2 rounded-full text-sm font-medium inline-block border ${getSeverityColor(selectedThreat.severity)}`}>
                      {selectedThreat.severity}
                    </div>
                  </div>
                  <div className="bg-htb-darker/30 p-3 rounded-lg">
                    <label className="text-sm font-medium text-htb-gray block mb-2">Source Type</label>
                    <p className="text-htb-gray-light font-mono text-sm">{selectedThreat.source_type}</p>
                  </div>
                </div>

                <div className="bg-htb-darker/30 p-4 rounded-lg">
                  <label className="text-sm font-medium text-htb-gray block mb-2">Attack Path</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-htb-green font-mono">{selectedThreat.source.country}</span>
                    <span className="text-htb-gray">→</span>
                    <span className="text-htb-red font-mono">{selectedThreat.destination.country}</span>
                  </div>
                  <div className="text-xs text-htb-gray mt-1 font-mono">
                    {selectedThreat.source.latitude.toFixed(2)}, {selectedThreat.source.longitude.toFixed(2)} → {selectedThreat.destination.latitude.toFixed(2)}, {selectedThreat.destination.longitude.toFixed(2)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-htb-darker/30 p-3 rounded-lg">
                    <label className="text-sm font-medium text-htb-gray block mb-2">Target Sector</label>
                    <p className="text-htb-gray-light">{selectedThreat.targetSector}</p>
                  </div>
                  <div className="bg-htb-darker/30 p-3 rounded-lg">
                    <label className="text-sm font-medium text-htb-gray block mb-2">Attack Vector</label>
                    <p className="text-htb-gray-light">{selectedThreat.attackVector}</p>
                  </div>
                </div>

                <div className="bg-htb-darker/30 p-3 rounded-lg">
                  <label className="text-sm font-medium text-htb-gray block mb-2">Detection Time</label>
                  <p className="text-htb-gray-light font-mono text-sm">{new Date(selectedThreat.timestamp).toLocaleString()}</p>
                </div>

                <div className="bg-htb-green/10 border border-htb-green/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-htb-green mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-htb-green mb-3">Recommended Actions</h4>
                      <ul className="text-sm text-htb-gray-light space-y-2 font-mono">
                        <li className="flex items-start space-x-2">
                          <span className="text-htb-green">•</span>
                          <span>Monitor network traffic patterns</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-htb-green">•</span>
                          <span>Update security policies and rules</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-htb-green">•</span>
                          <span>Alert security operations team</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-htb-green">•</span>
                          <span>Document for threat intelligence</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <Filter className="h-16 w-16 text-htb-gray mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-medium text-htb-gray-light mb-2 matrix-text">Select a Threat</h3>
                <p className="text-htb-gray">Click on any threat from the feed to view detailed analysis</p>
                <div className="mt-6 text-xs text-htb-gray font-mono">
                  {recentThreats.length} threats detected in the last hour
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Educational Note */}
      <div className="htb-card p-6 border border-htb-green/30">
        <div className="flex items-start space-x-4">
          <Zap className="h-6 w-6 text-htb-green mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-htb-green mb-3 matrix-text">Educational Purpose</h3>
            <p className="text-htb-gray leading-relaxed">
              This threat map displays simulated data for educational purposes. In production environments, 
              this would integrate with real threat intelligence feeds (OTX, AbuseIPDB, VirusTotal), 
              SIEM systems, honeypots, and IDS/IPS systems to provide genuine real-time threat data 
              from global security organizations and monitoring infrastructure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatMap;