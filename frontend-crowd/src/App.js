import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapComponent from './components/MapComponent';
import RiskStats from './components/RiskStats';
import AIRecommendations from './components/AIRecommendations';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import AICenter from './pages/AICenter';

function MainDashboard() {
  const [heatmapData, setHeatmapData] = useState([]);
  const [riskStats, setRiskStats] = useState({});
  const [aiSummary, setAiSummary] = useState('');
  const [isOfficerMode, setIsOfficerMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      // Fetch heatmap data
      const heatmapResponse = await axios.get('/api/heatmap');
      setHeatmapData(heatmapResponse.data);

      // Fetch risk statistics
      const statsResponse = await axios.get('/api/risk-stats');
      setRiskStats(statsResponse.data);

      // Fetch AI recommendations
      const summaryResponse = await axios.get(`/api/risk-summary?mode=${isOfficerMode ? 'officer' : 'public'}`);
      setAiSummary(summaryResponse.data.summary);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh data every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [isOfficerMode]);

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>CrowdScan</h1>
          <p>Loading real-time crowd monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>CrowdScan</h1>
          <span
            style={{
              fontWeight: 'bold',
              fontSize: '1.1rem',
              color: '#2d3a4a',
              background: '#f4f6fa',
              padding: '10px 24px',
              borderRadius: '30px',
              cursor: 'pointer',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              letterSpacing: '1px',
              transition: 'background 0.2s',
            }}
            onClick={() => navigate('/ai-center')}
            className="ai-center-link"
          >
            AI Center
          </span>
        </div>
        <p>AI-Powered Real-Time Crowd Risk Intelligence System</p>
      </div>

      <div className="toggle-container">
        <button 
          className={`toggle-btn ${isOfficerMode ? 'active' : ''}`}
          onClick={() => setIsOfficerMode(!isOfficerMode)}
        >
          {isOfficerMode ? 'Officer Mode' : 'Public Mode'}
        </button>
      </div>

      <div className="dashboard">
        <div className="card">
          <h2>Live Map</h2>
          <div className="map-container">
            <MapComponent heatmapData={heatmapData} />
          </div>
        </div>

        <div className="card">
          <h2>Risk Statistics</h2>
          <RiskStats riskStats={riskStats} />
        </div>
      </div>

      <div className="ai-recommendations">
        <h2>AI Recommendations</h2>
        <div className="recommendation-text">
          {aiSummary || 'Loading AI analysis...'}
        </div>
      </div>

      <div style={{ textAlign: 'left', marginTop: 30 }}>
        <button
          className="toggle-btn emergency"
          onClick={() => alert('Emergency protocol triggered! (This can be connected to backend logic)')}
        >
          Emergency
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainDashboard />} />
        <Route path="/ai-center" element={<AICenter />} />
      </Routes>
    </Router>
  );
}

export default App; 