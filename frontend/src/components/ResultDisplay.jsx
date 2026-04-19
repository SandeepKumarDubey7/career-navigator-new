function ResultDisplay({ result }) {
  if (!result) return null;

  const getScoreColor = (score) => {
    if (score >= 75) return '#22c55e';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Good';
    if (score >= 25) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <div className="result-container">
      <h2 className="result-title">📊 Analysis Results</h2>

      {/* Predicted Role */}
      <div className="result-card">
        <div className="result-card-header">
          <span className="result-icon">🎯</span>
          <h3>Predicted Role</h3>
        </div>
        <p className="role-name">{result.role}</p>
      </div>

      {/* ATS Score */}
      <div className="result-card">
        <div className="result-card-header">
          <span className="result-icon">📈</span>
          <h3>ATS Score</h3>
        </div>
        <div className="score-section">
          <div className="score-bar-bg">
            <div
              className="score-bar-fill"
              style={{
                width: `${result.atsScore}%`,
                backgroundColor: getScoreColor(result.atsScore),
              }}
            ></div>
          </div>
          <div className="score-info">
            <span
              className="score-number"
              style={{ color: getScoreColor(result.atsScore) }}
            >
              {result.atsScore}/100
            </span>
            <span className="score-label">{getScoreLabel(result.atsScore)}</span>
          </div>
        </div>
      </div>

      {/* Missing Skills */}
      <div className="result-card">
        <div className="result-card-header">
          <span className="result-icon">⚡</span>
          <h3>Missing Skills</h3>
        </div>
        <div className="skills-list">
          {result.missingSkills && result.missingSkills.length > 0 ? (
            result.missingSkills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))
          ) : (
            <p className="no-skills">No missing skills identified — great resume!</p>
          )}
        </div>
      </div>

      {/* Target Improvements */}
      {result.targetImprovements && result.targetImprovements.length > 0 && (
        <div className="result-card" style={{ marginTop: '20px' }}>
          <div className="result-card-header">
            <span className="result-icon">🚀</span>
            <h3>How to switch to: {result.targetField}</h3>
          </div>
          <div className="skills-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {result.targetImprovements.map((improvement, index) => (
              <div key={index} style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px', borderLeft: '4px solid #3b82f6' }}>
                {improvement}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultDisplay;
