function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">Analyzing your resume with AI...</p>
      <p className="loading-hint">This may take a few seconds</p>
    </div>
  );
}

export default LoadingSpinner;
