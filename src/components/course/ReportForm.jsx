import React, { useState } from 'react';

export default function ReportForm({ chapterId, challengeName, onEvaluationReceived }) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [contents, setContents] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/challenges/reports/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          chapterId,
          challengeName,
          userTitle: title,
          userSummary: summary,
          userContents: contents
        })
      });
      if (!res.ok) {
        throw new Error('Failed to evaluate report. Ensure you are signed in and backend is running.');
      }
      const data = await res.json();
      onEvaluationReceived(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="report-form-container" onSubmit={handleSubmit}>
      <h3 className="form-title">📝 Submit Vulnerability Report</h3>
      <p className="form-subtitle">Write a comprehensive report to be graded by our automated AI Auditor.</p>
      
      <div className="form-group">
        <label className="form-label">Vulnerability Title</label>
        <input 
          type="text" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          required 
          className="form-input"
          placeholder="e.g., Reflected XSS in Search Input"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Executive Summary</label>
        <textarea 
          value={summary} 
          onChange={e => setSummary(e.target.value)} 
          required 
          className="form-textarea"
          placeholder="Provide a high-level summary of the vulnerability, explaining what was discovered..."
          rows={3}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Report Contents (Steps, Impact, Mitigation)</label>
        <textarea 
          value={contents} 
          onChange={e => setContents(e.target.value)} 
          required 
          className="form-textarea large-textarea"
          placeholder="Steps to Reproduce:&#10;1. Navigate to...&#10;2. Input payload...&#10;&#10;Impact:&#10;Allows execution of...&#10;&#10;Mitigation:&#10;Sanitize user input by..."
          rows={8}
        />
      </div>

      {error && <div className="form-error-msg">⚠️ {error}</div>}

      <button type="submit" className="form-submit-btn" disabled={loading}>
        {loading ? 'Submitting to AI Triager...' : 'Submit Report'}
      </button>
    </form>
  );
}
