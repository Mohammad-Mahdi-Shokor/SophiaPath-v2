import React, { useState } from 'react';
import { Tooltip, Zoom } from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';

const FORM_URL = 'https://forms.gle/XbHBkpK88CxVdNqo8';

export default function ReportIssueButton() {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    window.open(FORM_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <Tooltip
      title="Found a bug or issue? Click to report it"
      arrow
      placement="right"
      TransitionComponent={Zoom}
    >
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Report an Issue"
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          zIndex: 9990,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: '42px',
          padding: '0 16px 0 12px',
          borderRadius: '21px',
          border: '1.5px solid rgba(239, 68, 68, 0.45)',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.92) 0%, rgba(220, 38, 38, 0.95) 100%)',
          color: '#ffffff',
          boxShadow: isHovered
            ? '0 6px 20px rgba(239, 68, 68, 0.45), 0 0 12px rgba(239, 68, 68, 0.3)'
            : '0 4px 14px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isHovered ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
          userSelect: 'none',
          fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}
      >
        <BugReportIcon
          style={{
            fontSize: '20px',
            color: '#ffffff',
            transform: isHovered ? 'rotate(-10deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease'
          }}
        />
        <span
          style={{
            fontWeight: 700,
            fontSize: '0.85rem',
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
            color: '#ffffff'
          }}
        >
          Report Issue
        </span>
      </button>
    </Tooltip>
  );
}
