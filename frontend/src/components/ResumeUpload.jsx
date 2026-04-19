import { useState } from 'react';

function ResumeUpload({ onFileSelect, selectedFile, targetField, setTargetField }) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className="upload-container">
      <div className="target-field-section" style={{ marginBottom: '20px', textAlign: 'left' }}>
        <label htmlFor="targetField" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '0.95rem' }}>🎯 Which field do you want to switch into? (Optional)</label>
        <input 
          id="targetField"
          type="text" 
          placeholder="e.g. Data Scientist, Game Developer"
          value={targetField}
          onChange={(e) => setTargetField(e.target.value)}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#333', outline: 'none', fontSize: '0.95rem' }}
        />
      </div>
      <div
        className={`upload-area ${dragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="upload-icon">📄</div>
      <p className="upload-text">
        {selectedFile
          ? selectedFile.name
          : 'Drag & drop your resume here, or click to browse'}
      </p>
      <p className="upload-hint">Supports PDF, DOC, DOCX (max 5MB)</p>
      <input
        type="file"
        id="resume-input"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        className="file-input"
      />
      <label htmlFor="resume-input" className="browse-btn">
        Browse Files
      </label>
      </div>
    </div>
  );
}

export default ResumeUpload;
