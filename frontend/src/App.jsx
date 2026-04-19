import { useState } from 'react';
import axios from 'axios';
import ResumeUpload from './components/ResumeUpload';
import ResultDisplay from './components/ResultDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetField, setTargetField] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setError('');
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a resume file first');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      formData.append('targetField', targetField);

      console.log('📤 Uploading resume:', selectedFile.name);

      const response = await axios.post(`${API_URL}/api/analyze-resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('✅ Analysis result:', response.data);

      if (response.data.success) {
        setResult(response.data.data);
      } else {
        setError('Analysis failed. Please try again.');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      const message =
        err.response?.data?.error || 'Failed to analyze resume. Make sure the backend is running.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1> AI Career Navigator</h1>
        <p>Upload your resume and get AI-powered career insights</p>
      </header>

      <main className="main">
        <div className="card">
          <ResumeUpload
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            targetField={targetField}
            setTargetField={setTargetField}
          />

          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={!selectedFile || loading}
          >
            {loading ? 'Analyzing...' : '🔍 Analyze Resume'}
          </button>

          {error && <div className="error-message">❌ {error}</div>}
        </div>

        {loading && <LoadingSpinner />}

        {result && <ResultDisplay result={result} />}
      </main>

      <footer className="footer">
        <p>AI Career Navigator — Powered by Groq</p>
      </footer>
    </div>
  );
}

export default App;
