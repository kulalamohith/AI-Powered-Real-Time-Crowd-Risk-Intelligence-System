import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaShieldAlt, FaChartLine, FaRobot } from 'react-icons/fa';
import axios from 'axios';
import './AICenter.css';

const options = [
  {
    key: 'location-risk',
    icon: <FaMapMarkerAlt size={48} color="#667eea" />,
    label: 'Location Risk Summary',
    description: 'Get risk summary for all gates at a location.'
  },
  {
    key: 'gate-safety',
    icon: <FaShieldAlt size={48} color="#28a745" />,
    label: 'Gate Safety Advisor',
    description: 'Check if your gate is safe and get escape advice.'
  },
  {
    key: 'predictive-risk',
    icon: <FaChartLine size={48} color="#fd7e14" />,
    label: 'Predictive Risk (AI Forecast)',
    description: 'See AI-predicted risk for the next 10 minutes.'
  },
  {
    key: 'custom-query',
    icon: <FaRobot size={48} color="#764ba2" />,
    label: 'Custom AI Query',
    description: 'Ask any crowd safety question and get an AI answer.'
  }
];

const AICenter = () => {
  const [selected, setSelected] = useState(null);
  const [locations, setLocations] = useState([]);
  const [locationInput, setLocationInput] = useState('');
  const [locationResult, setLocationResult] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  const [gateLocationInput, setGateLocationInput] = useState('');
  const [gateInput, setGateInput] = useState('');
  const [gateResult, setGateResult] = useState(null);
  const [gateLoading, setGateLoading] = useState(false);
  const [gateError, setGateError] = useState('');

  const [predictLocationInput, setPredictLocationInput] = useState('');
  const [predictGateInput, setPredictGateInput] = useState('');
  const [predictResult, setPredictResult] = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictError, setPredictError] = useState('');

  const [customQueryInput, setCustomQueryInput] = useState('');
  const [customQueryResult, setCustomQueryResult] = useState(null);
  const [customQueryLoading, setCustomQueryLoading] = useState(false);
  const [customQueryError, setCustomQueryError] = useState('');

  useEffect(() => {
    // Fetch all locations and gates for dropdowns
    axios.get('/api/zones').then(res => {
      setLocations(res.data);
    });
  }, []);

  const handleLocationRisk = async (e) => {
    e.preventDefault();
    setLocationLoading(true);
    setLocationError('');
    setLocationResult(null);
    try {
      const res = await axios.post('/api/ai/location-risk', { location: locationInput });
      setLocationResult(res.data.summary);
    } catch (err) {
      setLocationError('Could not fetch risk summary for this location.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleGateSafety = async (e) => {
    e.preventDefault();
    setGateLoading(true);
    setGateError('');
    setGateResult(null);
    try {
      const res = await axios.post('/api/ai/gate-safety', { location: gateLocationInput, gate: gateInput });
      setGateResult(res.data);
    } catch (err) {
      setGateError('Could not fetch safety info for this gate.');
    } finally {
      setGateLoading(false);
    }
  };

  const handlePredictiveRisk = async (e) => {
    e.preventDefault();
    setPredictLoading(true);
    setPredictError('');
    setPredictResult(null);
    try {
      const res = await axios.post('/api/ai/predictive-risk', { location: predictLocationInput, gate: predictGateInput });
      setPredictResult(res.data.summary);
    } catch (err) {
      setPredictError('Could not fetch predictive risk.');
    } finally {
      setPredictLoading(false);
    }
  };

  const handleCustomQuery = async (e) => {
    e.preventDefault();
    setCustomQueryLoading(true);
    setCustomQueryError('');
    setCustomQueryResult(null);
    try {
      const res = await axios.post('/api/ai/custom-query', { query: customQueryInput });
      setCustomQueryResult(res.data.summary);
    } catch (err) {
      setCustomQueryError('Could not get AI answer.');
    } finally {
      setCustomQueryLoading(false);
    }
  };

  // Helper to get gates for a location
  const getGatesForLocation = (locName) => {
    const loc = locations.find(l => l.locationName === locName);
    return loc ? loc.gates : [];
  };

  return (
    <div className="ai-center-container">
      <h1 className="ai-center-title">🧠 AI Center</h1>
      <p className="ai-center-desc">Choose an AI-powered tool below:</p>
      <div className="ai-center-options">
        {options.map(opt => (
          <div
            key={opt.key}
            className={`ai-center-option${selected === opt.key ? ' selected' : ''}`}
            onClick={() => setSelected(opt.key)}
          >
            <div className="ai-center-icon">{opt.icon}</div>
            <div className="ai-center-label">{opt.label}</div>
            <div className="ai-center-description">{opt.description}</div>
          </div>
        ))}
      </div>
      <div className="ai-center-content">
        {selected === null && <div style={{textAlign:'center',marginTop:40,color:'#888'}}>Select an option above to get started.</div>}
        {selected === 'location-risk' && (
          <div>
            <form onSubmit={handleLocationRisk} style={{textAlign:'center',marginBottom:20,display:'flex',justifyContent:'center',alignItems:'center',gap:12}}>
              <select
                value={locationInput}
                onChange={e => setLocationInput(e.target.value)}
                style={{padding:'10px',width:'60%',maxWidth:350,borderRadius:8,border:'1px solid #ccc'}}
                required
              >
                <option value="">Select location...</option>
                {locations.map(loc => (
                  <option key={loc.locationId} value={loc.locationName}>{loc.locationName}</option>
                ))}
              </select>
              <button type="submit" className="ai-action-btn">Get Risk Summary</button>
            </form>
            {locationLoading && <div style={{textAlign:'center',color:'#888'}}>Loading risk summary...</div>}
            {locationError && <div style={{color:'#dc3545',textAlign:'center'}}>{locationError}</div>}
            {locationResult && (
              <div style={{marginTop:20,background:'#fff',borderRadius:10,padding:20,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
                <h3 style={{color:'#764ba2',marginBottom:10}}>AI Risk Summary</h3>
                <div style={{whiteSpace:'pre-line',fontSize:'1.08rem'}}>{locationResult}</div>
              </div>
            )}
          </div>
        )}
        {selected === 'gate-safety' && (
          <div>
            <form onSubmit={handleGateSafety} style={{textAlign:'center',marginBottom:20,display:'flex',justifyContent:'center',alignItems:'center',gap:12}}>
              <select
                value={gateLocationInput}
                onChange={e => {setGateLocationInput(e.target.value); setGateInput('');}}
                style={{padding:'10px',width:'40%',maxWidth:220,borderRadius:8,border:'1px solid #ccc'}}
                required
              >
                <option value="">Select location...</option>
                {locations.map(loc => (
                  <option key={loc.locationId} value={loc.locationName}>{loc.locationName}</option>
                ))}
              </select>
              <select
                value={gateInput}
                onChange={e => setGateInput(e.target.value)}
                style={{padding:'10px',width:'30%',maxWidth:120,borderRadius:8,border:'1px solid #ccc'}}
                required
                disabled={!gateLocationInput}
              >
                <option value="">Select gate...</option>
                {getGatesForLocation(gateLocationInput).map(gate => (
                  <option key={gate.gateId} value={gate.gateId}>{gate.gateId} - {gate.name}</option>
                ))}
              </select>
              <button type="submit" className="ai-action-btn">Check Safety</button>
            </form>
            {gateLoading && <div style={{textAlign:'center',color:'#888'}}>Checking gate safety...</div>}
            {gateError && <div style={{color:'#dc3545',textAlign:'center'}}>{gateError}</div>}
            {gateResult && (
              <div style={{marginTop:20,background:'#fff',borderRadius:10,padding:20,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
                <h3 style={{color:'#28a745',marginBottom:10}}>Gate Safety Result</h3>
                <div style={{whiteSpace:'pre-line',fontSize:'1.08rem'}}>{gateResult.summary}</div>
                {gateResult.safestGate && (
                  <div style={{marginTop:12,color:'#764ba2'}}>
                    <strong>Safest Gate Suggestion:</strong> {gateResult.safestGate}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {selected === 'predictive-risk' && (
          <div>
            <form onSubmit={handlePredictiveRisk} style={{textAlign:'center',marginBottom:20,display:'flex',justifyContent:'center',alignItems:'center',gap:12}}>
              <select
                value={predictLocationInput}
                onChange={e => {setPredictLocationInput(e.target.value); setPredictGateInput('');}}
                style={{padding:'10px',width:'40%',maxWidth:220,borderRadius:8,border:'1px solid #ccc'}}
                required
              >
                <option value="">Select location...</option>
                {locations.map(loc => (
                  <option key={loc.locationId} value={loc.locationName}>{loc.locationName}</option>
                ))}
              </select>
              <select
                value={predictGateInput}
                onChange={e => setPredictGateInput(e.target.value)}
                style={{padding:'10px',width:'30%',maxWidth:120,borderRadius:8,border:'1px solid #ccc'}}
                required
                disabled={!predictLocationInput}
              >
                <option value="">Select gate...</option>
                {getGatesForLocation(predictLocationInput).map(gate => (
                  <option key={gate.gateId} value={gate.gateId}>{gate.gateId} - {gate.name}</option>
                ))}
              </select>
              <button type="submit" className="ai-action-btn">Predict Risk</button>
            </form>
            {predictLoading && <div style={{textAlign:'center',color:'#888'}}>Predicting risk...</div>}
            {predictError && <div style={{color:'#dc3545',textAlign:'center'}}>{predictError}</div>}
            {predictResult && (
              <div style={{marginTop:20,background:'#fff',borderRadius:10,padding:20,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
                <h3 style={{color:'#fd7e14',marginBottom:10}}>AI Predictive Risk</h3>
                <div style={{whiteSpace:'pre-line',fontSize:'1.08rem'}}>{predictResult}</div>
              </div>
            )}
          </div>
        )}
        {selected === 'custom-query' && (
          <div>
            <form onSubmit={handleCustomQuery} style={{textAlign:'center',marginBottom:20,display:'flex',justifyContent:'center',alignItems:'center',gap:12}}>
              <input
                type="text"
                placeholder="Ask any crowd safety question..."
                value={customQueryInput}
                onChange={e => setCustomQueryInput(e.target.value)}
                style={{padding:'10px',width:'70%',maxWidth:400,borderRadius:8,border:'1px solid #ccc'}}
                required
              />
              <button type="submit" className="ai-action-btn">Ask AI</button>
            </form>
            {customQueryLoading && <div style={{textAlign:'center',color:'#888'}}>Getting AI answer...</div>}
            {customQueryError && <div style={{color:'#dc3545',textAlign:'center'}}>{customQueryError}</div>}
            {customQueryResult && (
              <div style={{marginTop:20,background:'#fff',borderRadius:10,padding:20,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
                <h3 style={{color:'#764ba2',marginBottom:10}}>AI Answer</h3>
                <div style={{whiteSpace:'pre-line',fontSize:'1.08rem'}}>{customQueryResult}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AICenter; 