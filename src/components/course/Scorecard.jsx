import React from 'react';

export default function Scorecard({ evaluation }) {
  if (!evaluation) return null;

  const getVerdictClass = (verdict) => {
    if (!verdict) return 'verdict-neutral';
    const lower = verdict.toLowerCase();
    if (lower.includes('pass') || lower.includes('accept') || lower.includes('success')) {
      return 'verdict-pass';
    }
    if (lower.includes('fail') || lower.includes('reject')) {
      return 'verdict-fail';
    }
    return 'verdict-neutral';
  };

  return (
    <div className="scorecard-container animate-fade-in">
      <h3 className="scorecard-title">🏆 AI Evaluation Scorecard</h3>
      
      <div className="scorecard-hero">
        <div className="total-score-badge">
          <span className="score-number">{evaluation.total_score}</span>
          <span className="score-max">/100</span>
        </div>
        <div className="verdict-wrapper">
          <span className="verdict-label">Verdict:</span>
          <span className={`verdict-value ${getVerdictClass(evaluation.final_verdict)}`}>
            {evaluation.final_verdict}
          </span>
        </div>
      </div>

      <div className="scorecard-breakdown">
        <div className="breakdown-section">
          <div className="breakdown-row">
            <span className="section-name font-bold">Vulnerability Title</span>
            <span className="section-pts font-bold">{evaluation.title_score} / 15</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill fill-title" style={{ width: `${(evaluation.title_score / 15) * 100}%` }}></div>
          </div>
          <p className="section-feedback">{evaluation.title_feedback}</p>
        </div>

        <div className="breakdown-section">
          <div className="breakdown-row">
            <span className="section-name font-bold">Executive Summary</span>
            <span className="section-pts font-bold">{evaluation.summary_score} / 25</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill fill-summary" style={{ width: `${(evaluation.summary_score / 25) * 100}%` }}></div>
          </div>
          <p className="section-feedback">{evaluation.summary_feedback}</p>
        </div>

        <div className="breakdown-section">
          <div className="breakdown-row">
            <span className="section-name font-bold">Report Contents</span>
            <span className="section-pts font-bold">{evaluation.contents_score} / 60</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill fill-contents" style={{ width: `${(evaluation.contents_score / 60) * 100}%` }}></div>
          </div>
          <p className="section-feedback">{evaluation.contents_feedback}</p>
        </div>
      </div>
    </div>
  );
}
