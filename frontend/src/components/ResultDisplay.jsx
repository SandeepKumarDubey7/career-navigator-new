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

  const getPriorityColor = (priority) => {
    if (priority === 'high') return '#ef4444';
    if (priority === 'medium') return '#f59e0b';
    return '#22c55e';
  };

  const getPriorityBg = (priority) => {
    if (priority === 'high') return '#fef2f2';
    if (priority === 'medium') return '#fffbeb';
    return '#f0fdf4';
  };

  // Format dimension name for display
  const formatDimensionName = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
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
        {result.experienceLevel && (
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '4px' }}>
            Level: {result.experienceLevel}
            {result.confidence && ` • Confidence: ${result.confidence}`}
          </p>
        )}
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

        {/* ATS Breakdown */}
        {result.atsBreakdown && Object.keys(result.atsBreakdown).length > 0 && (
          <div className="ats-breakdown">
            <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '12px', marginBottom: '8px', fontWeight: '600' }}>Score Breakdown:</p>
            {Object.entries(result.atsBreakdown).map(([key, dim]) => (
              <div key={key} className="breakdown-row">
                <div className="breakdown-label">
                  <span className="breakdown-name">{formatDimensionName(key)}</span>
                  <span className="breakdown-weight">({dim.weight})</span>
                </div>
                <div className="breakdown-bar-bg">
                  <div
                    className="breakdown-bar-fill"
                    style={{
                      width: `${dim.score}%`,
                      backgroundColor: getScoreColor(dim.score),
                    }}
                  ></div>
                </div>
                <span className="breakdown-score" style={{ color: getScoreColor(dim.score) }}>{dim.score}</span>
                <p className="breakdown-details">{dim.details}</p>
              </div>
            ))}
          </div>
        )}
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

      {/* Detected Skills */}
      {result.detectedSkills && result.detectedSkills.length > 0 && (
        <div className="result-card">
          <div className="result-card-header">
            <span className="result-icon">✅</span>
            <h3>Detected Skills</h3>
          </div>
          <div className="skills-list">
            {result.detectedSkills.map((skill, index) => (
              <span key={index} className="skill-tag" style={{ background: '#dcfce7', color: '#166534' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

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

      {/* Career Roadmap */}
      {result.roadmap && (
        <div className="result-card" style={{ marginTop: '20px' }}>
          <div className="result-card-header">
            <span className="result-icon">🗺️</span>
            <h3>Career Roadmap</h3>
          </div>

          {/* Skills to Learn */}
          {result.roadmap.skills_to_learn && result.roadmap.skills_to_learn.length > 0 && (
            <div className="roadmap-section">
              <h4 className="roadmap-subtitle">📚 Skills to Learn</h4>
              <div className="roadmap-items">
                {result.roadmap.skills_to_learn.map((item, i) => (
                  <div key={i} className="roadmap-item" style={{ borderLeftColor: getPriorityColor(item.priority), backgroundColor: getPriorityBg(item.priority) }}>
                    <div className="roadmap-item-header">
                      <span className="roadmap-item-name">{item.skill}</span>
                      <span className="roadmap-priority" style={{ color: getPriorityColor(item.priority) }}>
                        {item.priority}
                      </span>
                    </div>
                    {item.reason && <p className="roadmap-item-reason">{item.reason}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tools to Master */}
          {result.roadmap.tools_to_master && result.roadmap.tools_to_master.length > 0 && (
            <div className="roadmap-section">
              <h4 className="roadmap-subtitle">🛠️ Tools to Master</h4>
              <div className="roadmap-items">
                {result.roadmap.tools_to_master.map((item, i) => (
                  <div key={i} className="roadmap-item" style={{ borderLeftColor: getPriorityColor(item.priority), backgroundColor: getPriorityBg(item.priority) }}>
                    <div className="roadmap-item-header">
                      <span className="roadmap-item-name">{item.tool}</span>
                      <span className="roadmap-priority" style={{ color: getPriorityColor(item.priority) }}>
                        {item.priority}
                      </span>
                    </div>
                    {item.reason && <p className="roadmap-item-reason">{item.reason}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {result.roadmap.certifications && result.roadmap.certifications.length > 0 && (
            <div className="roadmap-section">
              <h4 className="roadmap-subtitle">🏆 Certifications</h4>
              <div className="roadmap-items">
                {result.roadmap.certifications.map((cert, i) => (
                  <div key={i} className="roadmap-item" style={{ borderLeftColor: getPriorityColor(cert.priority), backgroundColor: getPriorityBg(cert.priority) }}>
                    <div className="roadmap-item-header">
                      <span className="roadmap-item-name">{cert.name}</span>
                      <span className="roadmap-priority" style={{ color: getPriorityColor(cert.priority) }}>
                        {cert.priority}
                      </span>
                    </div>
                    {cert.provider && <p className="roadmap-item-reason">Provider: {cert.provider}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Recommendations */}
          {result.roadmap.project_recommendations && result.roadmap.project_recommendations.length > 0 && (
            <div className="roadmap-section">
              <h4 className="roadmap-subtitle">💡 Project Recommendations</h4>
              <div className="roadmap-items">
                {result.roadmap.project_recommendations.map((proj, i) => (
                  <div key={i} className="roadmap-item" style={{ borderLeftColor: '#4f46e5', backgroundColor: '#f0f0ff' }}>
                    <span className="roadmap-item-name">{proj.title}</span>
                    {proj.description && <p className="roadmap-item-reason">{proj.description}</p>}
                    {proj.skills_demonstrated && proj.skills_demonstrated.length > 0 && (
                      <div className="skills-list" style={{ marginTop: '6px' }}>
                        {proj.skills_demonstrated.map((s, j) => (
                          <span key={j} className="skill-tag" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Path */}
          {result.roadmap.learning_path && (
            <div className="roadmap-section">
              <h4 className="roadmap-subtitle">📅 Learning Path</h4>
              <div className="learning-path">
                {result.roadmap.learning_path.month_1_3 && (
                  <div className="learning-phase">
                    <div className="phase-header">
                      <span className="phase-badge" style={{ background: '#ef4444' }}>Months 1–3</span>
                      <span className="phase-focus">{result.roadmap.learning_path.month_1_3.focus}</span>
                    </div>
                    {result.roadmap.learning_path.month_1_3.goals && (
                      <ul className="phase-goals">
                        {result.roadmap.learning_path.month_1_3.goals.map((g, i) => <li key={i}>{g}</li>)}
                      </ul>
                    )}
                  </div>
                )}
                {result.roadmap.learning_path.month_4_6 && (
                  <div className="learning-phase">
                    <div className="phase-header">
                      <span className="phase-badge" style={{ background: '#f59e0b' }}>Months 4–6</span>
                      <span className="phase-focus">{result.roadmap.learning_path.month_4_6.focus}</span>
                    </div>
                    {result.roadmap.learning_path.month_4_6.goals && (
                      <ul className="phase-goals">
                        {result.roadmap.learning_path.month_4_6.goals.map((g, i) => <li key={i}>{g}</li>)}
                      </ul>
                    )}
                  </div>
                )}
                {result.roadmap.learning_path.month_7_12 && (
                  <div className="learning-phase">
                    <div className="phase-header">
                      <span className="phase-badge" style={{ background: '#22c55e' }}>Months 7–12</span>
                      <span className="phase-focus">{result.roadmap.learning_path.month_7_12.focus}</span>
                    </div>
                    {result.roadmap.learning_path.month_7_12.goals && (
                      <ul className="phase-goals">
                        {result.roadmap.learning_path.month_7_12.goals.map((g, i) => <li key={i}>{g}</li>)}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ResultDisplay;
