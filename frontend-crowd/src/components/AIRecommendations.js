import React from 'react';

const AIRecommendations = ({ summary, isOfficerMode }) => {
  if (!summary) {
    return (
      <div className="ai-recommendations">
        <h2>🤖 AI Recommendations</h2>
        <div className="recommendation-text">
          Loading AI analysis...
        </div>
      </div>
    );
  }

  return (
    <div className="ai-recommendations">
      <h2>
        {isOfficerMode ? '👮 Officer AI Assistant' : '🤖 Public Safety AI'}
      </h2>
      <div className="recommendation-text">
        {summary}
      </div>
      <div style={{ 
        marginTop: '15px', 
        fontSize: '0.9rem', 
        opacity: 0.8,
        fontStyle: 'italic'
      }}>
        AI analysis updated at {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default AIRecommendations; 