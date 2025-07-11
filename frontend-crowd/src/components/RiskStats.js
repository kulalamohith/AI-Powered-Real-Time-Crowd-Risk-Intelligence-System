import React from 'react';

const RiskStats = ({ riskStats }) => {
  const { summary, riskDistribution } = riskStats;

  if (!summary) {
    return <div>Loading risk statistics...</div>;
  }

  const stats = [
    { key: 'safe', label: 'Safe', count: summary.safe, percentage: riskDistribution.safe },
    { key: 'moderate', label: 'Moderate', count: summary.moderate, percentage: riskDistribution.moderate },
    { key: 'high', label: 'High', count: summary.high, percentage: riskDistribution.high },
    { key: 'critical', label: 'Critical', count: summary.critical, percentage: riskDistribution.critical },
    { key: 'stampede', label: 'Stampede', count: summary.stampede, percentage: riskDistribution.stampede }
  ];

  return (
    <div>
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.key} className={`stat-item ${stat.key}`}>
            <span className="stat-number">{stat.count}</span>
            <span className="stat-label">{stat.label}</span>
            <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
              {stat.percentage}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>Total Gates Monitored</h3>
        <div style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          color: '#667eea',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}>
          {summary.total}
        </div>
      </div>

      <div style={{ 
        marginTop: '15px', 
        padding: '10px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: '#666'
      }}>
        <strong>Last Updated:</strong> {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default RiskStats; 