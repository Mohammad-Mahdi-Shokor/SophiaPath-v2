import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ZoomResetIcon,
  AccountTree as FlowchartIcon
} from '@mui/icons-material';
import { parsePseudocodeToFlowchartTree } from './cppFlowchartEngine';

export const CppFlowchartRenderer = ({ pseudocodeText, onDownloadPng }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);

  const modules = parsePseudocodeToFlowchartTree(pseudocodeText);
  const activeModule = modules[activeModuleIndex] || modules[0];

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.15, 1.8));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.15, 0.5));
  const handleZoomReset = () => setZoomLevel(1);

  // 1. Render Downward Vector Arrow
  const renderDownArrow = () => (
    <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2px 0' }}>
      <svg width="24" height="26" viewBox="0 0 24 26" fill="none">
        <line x1="12" y1="0" x2="12" y2="20" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" strokeDasharray="3 3" />
        <polygon points="7,18 12,25 17,18" fill="rgba(255, 255, 255, 0.5)" />
      </svg>
    </Box>
  );

  // 2. Render Standard Single Node
  const renderStandardNode = (node) => {
    const { shape, label, color } = node;

    // Terminal Shape (Start / End / Return): Stadium / Pill
    if (shape === 'stadium') {
      const isStart = label.toUpperCase().includes('START') || label.toUpperCase().includes('BEGIN') || label.toUpperCase().includes('FUNCTION');
      return (
        <Box
          style={{
            padding: '8px 24px',
            borderRadius: '9999px',
            background: isStart ? 'rgba(61, 220, 151, 0.12)' : 'rgba(255, 100, 124, 0.12)',
            border: `2px solid ${isStart ? '#3DDC97' : '#FF647C'}`,
            boxShadow: `0 0 16px ${isStart ? 'rgba(61, 220, 151, 0.2)' : 'rgba(255, 100, 124, 0.2)'}`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '300px'
          }}
        >
          <Typography
            style={{
              fontFamily: '"Roboto Mono", monospace',
              fontWeight: 800,
              fontSize: '0.8rem',
              color: '#fff',
              letterSpacing: '0.04em'
            }}
          >
            {label}
          </Typography>
        </Box>
      );
    }

    // Input / Output Shape: Angled Parallelogram
    if (shape === 'parallelogram') {
      const isInput = label.toUpperCase().startsWith('INPUT') || label.toUpperCase().startsWith('READ');
      return (
        <Box
          style={{
            transform: 'skewX(-14deg)',
            padding: '8px 20px',
            borderRadius: '8px',
            background: 'rgba(0, 210, 255, 0.08)',
            border: '2px solid #00D2FF',
            boxShadow: '0 0 14px rgba(0, 210, 255, 0.15)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '340px'
          }}
        >
          <Typography
            style={{
              transform: 'skewX(14deg)',
              fontFamily: '"Roboto Mono", monospace',
              fontWeight: 700,
              fontSize: '0.78rem',
              color: isInput ? '#67e8f9' : '#38bdf8',
              textAlign: 'center',
              wordBreak: 'break-word'
            }}
          >
            {label}
          </Typography>
        </Box>
      );
    }

    // Function Call / Predefined Process: Subroutine box with double vertical stripes
    if (shape === 'subroutine') {
      return (
        <Box
          style={{
            padding: '8px 20px',
            borderRadius: '8px',
            background: 'rgba(192, 132, 252, 0.08)',
            border: '2px solid #C084FC',
            borderLeft: '7px double #C084FC',
            borderRight: '7px double #C084FC',
            boxShadow: '0 0 14px rgba(192, 132, 252, 0.15)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '340px'
          }}
        >
          <Typography
            style={{
              fontFamily: '"Roboto Mono", monospace',
              fontWeight: 700,
              fontSize: '0.78rem',
              color: '#e9d5ff',
              textAlign: 'center',
              wordBreak: 'break-word'
            }}
          >
            {label}
          </Typography>
        </Box>
      );
    }

    // Default Process: Clean Rounded Rectangle
    return (
      <Box
        style={{
          padding: '8px 18px',
          borderRadius: '8px',
          background: 'rgba(129, 140, 248, 0.08)',
          border: '2px solid rgba(129, 140, 248, 0.6)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '340px'
        }}
      >
        <Typography
          style={{
            fontFamily: '"Roboto Mono", monospace',
            fontWeight: 700,
            fontSize: '0.78rem',
            color: '#E0E7FF',
            textAlign: 'center',
            wordBreak: 'break-word'
          }}
        >
          {label}
        </Typography>
      </Box>
    );
  };

  // 3. Render Decision Branch Node (IF / ELSE IF / ELSE)
  const renderBranchNode = (node) => {
    return (
      <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', margin: '8px 0' }}>
        {/* Decision Diamond */}
        <Box
          style={{
            width: '120px',
            height: '120px',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '2.5px solid #F59E0B',
            boxShadow: '0 0 16px rgba(245, 158, 11, 0.2)',
            transform: 'rotate(45deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '10px',
            zIndex: 2,
            margin: '10px 0'
          }}
        >
          <Typography
            style={{
              fontFamily: '"Roboto Mono", monospace',
              fontWeight: 800,
              color: '#fff',
              transform: 'rotate(-45deg)',
              textAlign: 'center',
              fontSize: '0.75rem',
              lineHeight: 1.25,
              padding: '12px',
              maxWidth: '95px',
              wordBreak: 'break-word'
            }}
          >
            {node.condition} ?
          </Typography>
        </Box>

        {/* Stem down from diamond */}
        <Box style={{ width: '2px', height: '16px', borderLeft: '2px dashed rgba(255, 255, 255, 0.2)', zIndex: 1 }} />

        {/* Horizontal Split Wings */}
        <Box style={{ display: 'flex', width: '100%', maxWidth: '640px', position: 'relative', marginTop: '-2px' }}>
          {/* Top Horizontal Bar */}
          <Box
            style={{
              position: 'absolute',
              top: '0',
              left: '25%',
              right: '25%',
              height: '2px',
              borderTop: '2px dashed rgba(255, 255, 255, 0.2)',
              zIndex: 1
            }}
          />

          {/* Left Branch (TRUE - YES) */}
          <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, paddingRight: '12px' }}>
            <Box style={{ width: '2px', height: '16px', borderLeft: '2px dashed rgba(255, 255, 255, 0.2)', zIndex: 1 }} />
            
            <span
              style={{
                background: 'rgba(61, 220, 151, 0.15)',
                border: '1px solid #3DDC97',
                borderRadius: '12px',
                padding: '2px 10px',
                color: '#3DDC97',
                fontWeight: 800,
                fontSize: '0.68rem',
                fontFamily: '"Roboto Mono", monospace',
                marginBottom: '10px'
              }}
            >
              TRUE ✔️
            </span>

            <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              {node.trueBranch && node.trueBranch.length > 0 ? (
                renderTreeNodes(node.trueBranch)
              ) : (
                <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', padding: '10px' }}>
                  pass
                </Typography>
              )}
            </Box>

            <Box style={{ width: '2px', flexGrow: 1, minHeight: '20px', borderLeft: '2px dashed rgba(255, 255, 255, 0.2)', zIndex: 1 }} />
          </Box>

          {/* Right Branch (FALSE - NO) */}
          <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, paddingLeft: '12px' }}>
            <Box style={{ width: '2px', height: '16px', borderLeft: '2px dashed rgba(255, 255, 255, 0.2)', zIndex: 1 }} />

            <span
              style={{
                background: 'rgba(255, 100, 124, 0.15)',
                border: '1px solid #FF647C',
                borderRadius: '12px',
                padding: '2px 10px',
                color: '#FF647C',
                fontWeight: 800,
                fontSize: '0.68rem',
                fontFamily: '"Roboto Mono", monospace',
                marginBottom: '10px'
              }}
            >
              FALSE ❌
            </span>

            <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              {node.falseBranch && node.falseBranch.length > 0 ? (
                renderTreeNodes(node.falseBranch)
              ) : (
                <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', padding: '10px' }}>
                  pass
                </Typography>
              )}
            </Box>

            <Box style={{ width: '2px', flexGrow: 1, minHeight: '20px', borderLeft: '2px dashed rgba(255, 255, 255, 0.2)', zIndex: 1 }} />
          </Box>
        </Box>

        {/* Bottom Horizontal Merge Bar */}
        <Box style={{ display: 'flex', width: '100%', maxWidth: '640px', position: 'relative', height: '2px', marginTop: '-2px' }}>
          <Box
            style={{
              position: 'absolute',
              bottom: '0',
              left: '25%',
              right: '25%',
              height: '2px',
              borderTop: '2px dashed rgba(255, 255, 255, 0.2)',
              zIndex: 1
            }}
          />
        </Box>

        {/* Exit Stem */}
        <Box style={{ width: '2px', height: '16px', borderLeft: '2px dashed rgba(255, 255, 255, 0.2)', zIndex: 1 }} />
      </Box>
    );
  };

  // 4. Render Loop Node (WHILE / FOR / DO-WHILE)
  const renderLoopNode = (node) => {
    return (
      <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', margin: '8px 0' }}>
        {/* Loop Diamond */}
        <Box
          style={{
            width: '120px',
            height: '120px',
            background: 'rgba(139, 92, 246, 0.08)',
            border: '2.5px solid #8B5CF6',
            boxShadow: '0 0 16px rgba(139, 92, 246, 0.2)',
            transform: 'rotate(45deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '10px',
            zIndex: 2,
            margin: '10px 0'
          }}
        >
          <Typography
            style={{
              fontFamily: '"Roboto Mono", monospace',
              fontWeight: 800,
              color: '#fff',
              transform: 'rotate(-45deg)',
              textAlign: 'center',
              fontSize: '0.74rem',
              lineHeight: 1.25,
              padding: '12px',
              maxWidth: '95px',
              wordBreak: 'break-word'
            }}
          >
            {node.condition} ?
          </Typography>
        </Box>

        <Box style={{ width: '2px', height: '16px', borderLeft: '2px dashed rgba(255, 255, 255, 0.2)', zIndex: 1 }} />

        {/* Split: Loop Body (True) vs Loop Exit (False) */}
        <Box style={{ display: 'flex', width: '100%', maxWidth: '640px', position: 'relative', marginTop: '-2px' }}>
          <Box
            style={{
              position: 'absolute',
              top: '0',
              left: '25%',
              right: '25%',
              height: '2px',
              borderTop: '2px dashed rgba(255, 255, 255, 0.2)',
              zIndex: 1
            }}
          />

          {/* Left Column: Loop Body */}
          <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, paddingRight: '12px', borderLeft: '2px dashed rgba(139, 92, 246, 0.3)', borderRadius: '12px 0 0 12px' }}>
            <Box style={{ width: '2px', height: '16px', borderLeft: '2px dashed rgba(255, 255, 255, 0.2)', zIndex: 1 }} />

            <span
              style={{
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid #8B5CF6',
                borderRadius: '12px',
                padding: '2px 10px',
                color: '#8B5CF6',
                fontWeight: 800,
                fontSize: '0.68rem',
                fontFamily: '"Roboto Mono", monospace',
                marginBottom: '10px'
              }}
            >
              LOOP BODY ✔️
            </span>

            <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              {node.body && node.body.length > 0 ? (
                renderTreeNodes(node.body)
              ) : (
                <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', padding: '10px' }}>
                  pass
                </Typography>
              )}
            </Box>

            {/* Loop-back arrow returning up */}
            <Box style={{ width: '2px', flexGrow: 1, minHeight: '20px', borderLeft: '2px dashed rgba(139, 92, 246, 0.5)', zIndex: 1 }} />
            <Typography style={{ color: '#8B5CF6', fontSize: '0.65rem', fontWeight: 800, marginTop: '-4px', marginBottom: '8px', fontFamily: '"Roboto Mono", monospace' }}>
              ▲ loop back
            </Typography>
          </Box>

          {/* Right Column: Loop Exit */}
          <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, paddingLeft: '12px' }}>
            <Box style={{ width: '2px', height: '16px', borderLeft: '2px dashed rgba(255, 255, 255, 0.2)', zIndex: 1 }} />

            <span
              style={{
                background: 'rgba(255, 100, 124, 0.15)',
                border: '1px solid #FF647C',
                borderRadius: '12px',
                padding: '2px 10px',
                color: '#FF647C',
                fontWeight: 800,
                fontSize: '0.68rem',
                fontFamily: '"Roboto Mono", monospace',
                marginBottom: '10px'
              }}
            >
              EXIT LOOP ❌
            </span>

            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '40px' }}>
              <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', fontSize: '0.72rem' }}>
                Condition False ➔ Exit
              </Typography>
            </Box>

            <Box style={{ width: '2px', flexGrow: 1, minHeight: '20px', borderLeft: '2px dashed rgba(255, 255, 255, 0.2)', zIndex: 1 }} />
          </Box>
        </Box>

        {/* Bottom Merge Bar */}
        <Box style={{ display: 'flex', width: '100%', maxWidth: '640px', position: 'relative', height: '2px', marginTop: '-2px' }}>
          <Box
            style={{
              position: 'absolute',
              bottom: '0',
              left: '25%',
              right: '25%',
              height: '2px',
              borderTop: '2px dashed rgba(255, 255, 255, 0.2)',
              zIndex: 1
            }}
          />
        </Box>

        <Box style={{ width: '2px', height: '16px', borderLeft: '2px dashed rgba(255, 255, 255, 0.2)', zIndex: 1 }} />
      </Box>
    );
  };

  // 5. Render Tree Nodes Recursively
  const renderTreeNodes = (nodes) => {
    if (!nodes || nodes.length === 0) return null;

    return nodes.map((node, idx) => {
      const isLast = idx === nodes.length - 1;
      let element = null;

      if (node.type === 'branch') {
        element = renderBranchNode(node);
      } else if (node.type === 'loop') {
        element = renderLoopNode(node);
      } else {
        element = renderStandardNode(node);
      }

      return (
        <React.Fragment key={idx}>
          {element}
          {!isLast && renderDownArrow()}
        </React.Fragment>
      );
    });
  };

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', gap: '10px' }}>
      {/* Top Toolbar: Module / Function Switcher + Zoom Controls */}
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '38px',
          padding: 'clamp(5px, 0.7vh, 8px) clamp(10px, 1vw, 16px)',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--divider)',
          borderRadius: '12px',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        {/* Module Switcher (if multiple functions exist) */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, flexWrap: 'wrap' }}>
          <FlowchartIcon style={{ fontSize: 'clamp(18px, 1.2vw, 22px)', color: 'var(--primary-main)' }} />
          <Typography variant="caption" style={{ fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '4px', whiteSpace: 'nowrap', fontSize: 'clamp(0.72rem, 0.78vw, 0.84rem)' }}>
            Module:
          </Typography>
          {modules.map((mod, mIdx) => (
            <button
              key={mIdx}
              onClick={() => setActiveModuleIndex(mIdx)}
              style={{
                padding: 'clamp(4px, 0.6vh, 8px) clamp(10px, 0.9vw, 16px)',
                borderRadius: '7px',
                border: 'none',
                background: activeModuleIndex === mIdx ? 'var(--primary-main)' : 'rgba(255, 255, 255, 0.06)',
                color: activeModuleIndex === mIdx ? '#fff' : 'var(--text-secondary)',
                fontSize: 'clamp(0.75rem, 0.8vw, 0.88rem)',
                fontWeight: 800,
                fontFamily: '"Roboto Mono", monospace',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {mod.moduleName}
            </button>
          ))}
        </Box>

        {/* Zoom Controls */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(0,0,0,0.2)', padding: '3px', borderRadius: '8px', flexShrink: 0 }}>
          <Tooltip title="Zoom In">
            <IconButton size="small" onClick={handleZoomIn} style={{ color: 'var(--text-secondary)', padding: 'clamp(4px, 0.5vh, 7px)' }}>
              <ZoomInIcon style={{ fontSize: 'clamp(17px, 1.1vw, 21px)' }} />
            </IconButton>
          </Tooltip>
          <span style={{ fontSize: 'clamp(0.72rem, 0.78vw, 0.84rem)', fontWeight: 800, color: 'var(--text-secondary)', minWidth: 'clamp(38px, 3vw, 48px)', textAlign: 'center', fontFamily: '"Roboto Mono", monospace' }}>
            {Math.round(zoomLevel * 100)}%
          </span>
          <Tooltip title="Zoom Out">
            <IconButton size="small" onClick={handleZoomOut} style={{ color: 'var(--text-secondary)', padding: 'clamp(4px, 0.5vh, 7px)' }}>
              <ZoomOutIcon style={{ fontSize: 'clamp(17px, 1.1vw, 21px)' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset Zoom">
            <IconButton size="small" onClick={handleZoomReset} style={{ color: 'var(--text-secondary)', padding: 'clamp(4px, 0.5vh, 7px)' }}>
              <ZoomResetIcon style={{ fontSize: 'clamp(17px, 1.1vw, 21px)' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Visual Canvas Area */}
      <Box
        style={{
          flexGrow: 1,
          overflowY: 'auto',
          overflowX: 'auto',
          padding: '24px',
          background: '#090a10',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Box
          id="flowchart-capture-content"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: '320px',
            padding: '10px 0'
          }}
        >
          {activeModule ? (
            renderTreeNodes(activeModule.nodes)
          ) : (
            <Typography variant="body2" style={{ color: 'var(--text-secondary)', fontStyle: 'italic', padding: '30px' }}>
              No flowchart nodes available.
            </Typography>
          )}
        </Box>
      </Box>

      {/* Legend */}
      <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap', padding: '4px 0' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', color: '#3DDC97', fontWeight: 700 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3DDC97' }} /> Start/End
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', color: '#00D2FF', fontWeight: 700 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#00D2FF' }} /> Input/Output
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', color: '#818CF8', fontWeight: 700 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#818CF8' }} /> Process
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', color: '#C084FC', fontWeight: 700 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#C084FC' }} /> Function Call
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', color: '#F59E0B', fontWeight: 700 }}>
          <span style={{ width: '8px', height: '8px', transform: 'rotate(45deg)', background: '#F59E0B' }} /> Decision
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', color: '#8B5CF6', fontWeight: 700 }}>
          <span style={{ width: '8px', height: '8px', transform: 'rotate(45deg)', background: '#8B5CF6' }} /> Loop
        </span>
      </Box>
    </Box>
  );
};
