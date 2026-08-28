import React, { useState } from 'react';

export default function ChallengeHints({ chapterId, challengeName }) {
  const [hints, setHints] = useState([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleReveal = async () => {
    if (hints.length === 0) {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/challenges/${chapterId}/${encodeURIComponent(challengeName)}/hints`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!res.ok) {
          throw new Error('Failed to fetch hints');
        }
        const data = await res.json();
        setHints(data);
        setRevealedCount(1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      if (revealedCount < hints.length) {
        setRevealedCount(prev => prev + 1);
      }
    }
  };

  return (
    <div className="challenge-hints-container">
      <div className="hints-header-row">
        <h4>💡 Challenge Hints</h4>
        {revealedCount < hints.length || hints.length === 0 ? (
          <button className="reveal-hint-btn" onClick={handleReveal} disabled={loading}>
            {loading ? 'Fetching...' : hints.length === 0 ? 'Reveal Hint' : `Reveal Hint ${revealedCount + 1}/${hints.length}`}
          </button>
        ) : (
          <span className="all-hints-revealed">All hints revealed</span>
        )}
      </div>

      {error && <div className="hints-error-msg">{error}</div>}

      {revealedCount > 0 && (
        <ul className="hints-list">
          {hints.slice(0, revealedCount).map((hint, idx) => (
            <li key={idx} className="hint-item animate-fade-in">
              <span className="hint-number">Hint #{idx + 1}:</span> {hint}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
