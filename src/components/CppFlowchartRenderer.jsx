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
  AccountTree as FlowchartIcon,
  CallSplit as DecisionIcon
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
    <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '3px 0' }}>
      <svg width="24" height="26" viewBox="0 0 24 26" fill="none">
        <line x1="12" y1="0" x2="12" y2="20" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" strokeDasharray="3 3" />
        <polygon points="7,18 12,25 17,18" fill="rgba(255, 255, 255, 0.5)" />
      </svg>
    </Box>
  );

  // 2. Render Standard Single or Grouped Node
  const renderStandardNode = (node) => {
    const { shape, label, items, ioType } = node;

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
            maxWidth: '340px'
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

    // Input / Output Shape: Angled Parallelogram (Single or Multi-item Group)
    if (shape === 'parallelogram') {
      const isInput = ioType === 'input' || label.toUpperCase().startsWith('INPUT') || label.toUpperCase().startsWith('READ');
      const hasMultipleItems = items && items.length > 1;

      if (hasMultipleItems) {
        return (
          <Box
            style={{
              transform: 'skewX(-10deg)',
              padding: '10px 20px',
              borderRadius: '10px',
              background: isInput ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)' : 'linear-gradient(135deg, rgba(0, 210, 255, 0.15) 0%, rgba(0, 210, 255, 0.05) 100%)',
              border: `2px solid ${isInput ? '#06B6D4' : '#00D2FF'}`,
              boxShadow: `0 4px 20px ${isInput ? 'rgba(6, 182, 212, 0.2)' : 'rgba(0, 210, 255, 0.2)'}`,
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: '480px',
              minWidth: '220px'
            }}
          >
            <div style={{ transform: 'skewX(10deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: `1px solid ${isInput ? 'rgba(6, 182, 212, 0.3)' : 'rgba(0, 210, 255, 0.3)'}`, paddingBottom: '4px', width: '100%', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 900, color: isInput ? '#67E8F9' : '#38BDF8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {isInput ? '📥 INPUT' : '📤 OUTPUT'} ({items.length} lines)
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                {items.map((item, itIdx) => (
                  <Typography
                    key={itIdx}
                    style={{
                      fontFamily: '"Roboto Mono", monospace',
                      fontWeight: 600,
                      fontSize: '0.76rem',
                      color: isInput ? '#CFFAFE' : '#E0F2FE',
                      textAlign: 'center',
                      wordBreak: 'break-word',
                      lineHeight: 1.35
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </div>
            </div>
          </Box>
        );
      }

      // Single item I/O Parallelogram
      return (
        <Box
          style={{
            transform: 'skewX(-12deg)',
            padding: '8px 22px',
            borderRadius: '8px',
            background: isInput ? 'rgba(6, 182, 212, 0.08)' : 'rgba(0, 210, 255, 0.08)',
            border: `2px solid ${isInput ? '#06B6D4' : '#00D2FF'}`,
            boxShadow: `0 0 14px ${isInput ? 'rgba(6, 182, 212, 0.15)' : 'rgba(0, 210, 255, 0.15)'}`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '380px'
          }}
        >
          <Typography
            style={{
              transform: 'skewX(12deg)',
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

    // Function Call / Predefined Process: Subroutine box with double vertical borders
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
            maxWidth: '360px'
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
          padding: '8px 20px',
          borderRadius: '8px',
          background: 'rgba(129, 140, 248, 0.08)',
          border: '2px solid rgba(129, 140, 248, 0.6)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '360px'
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

  // 3. Render Decision Branch Node (IF / ELSE IF / ELSE with Multi-Branch Support)
  const renderBranchNode = (node) => {
    const hasElseIfs = node.elseIfs && node.elseIfs.length > 0;

    // A. Multi-branch IF - ELSE IF - ELSE Chain
    if (hasElseIfs) {
      const allBranches = [
        { label: `IF (${node.condition})`, tag: 'TRUE ✔️', isTrue: true, nodes: node.trueBranch },
        ...node.elseIfs.map(e => ({ label: `ELSE IF (${e.condition})`, tag: 'TRUE ✔️', isTrue: true, nodes: e.nodes })),
        { label: 'ELSE', tag: 'FALSE ❌', isTrue: false, nodes: node.falseBranch }
      ];

      return (
        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', margin: '10px 0' }}>
          {/* Main Decision Header Card */}
          <Box
            style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(245, 158, 11, 0.05) 100%)',
              border: '2px solid #F59E0B',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              minWidth: '220px',
              maxWidth: '420px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <DecisionIcon style={{ fontSize: '15px', color: '#F59E0B' }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#F59E0B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                CONDITIONAL BRANCH
              </span>
            </div>
            <Typography style={{ fontFamily: '"Roboto Mono", monospace', fontWeight: 800, color: '#FFF', fontSize: '0.82rem', textAlign: 'center', wordBreak: 'break-word' }}>
              {node.condition} ?
            </Typography>
          </Box>

          <Box style={{ width: '2px', height: '18px', borderLeft: '2px dashed rgba(255, 255, 255, 0.25)', zIndex: 1 }} />

          {/* Multi-Track Parallel Branches */}
          <Box style={{ display: 'flex', width: '100%', maxWidth: `${Math.max(680, allBranches.length * 240)}px`, position: 'relative', marginTop: '-2px', justifyContent: 'center' }}>
            {/* Top Bus Line connecting all tracks */}
            <Box
              style={{
                position: 'absolute',
                top: '0',
                left: `${100 / (allBranches.length * 2)}%`,
                right: `${100 / (allBranches.length * 2)}%`,
                height: '2px',
                borderTop: '2px dashed rgba(255, 255, 255, 0.25)',
                zIndex: 1
              }}
            />

            {allBranches.map((br, bIdx) => (
              <Box key={bIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, padding: '0 8px', minWidth: '180px' }}>
                <Box style={{ width: '2px', height: '16px', borderLeft: '2px dashed rgba(255, 255, 255, 0.25)', zIndex: 1 }} />
                
                <span
                  style={{
                    background: br.isTrue ? 'rgba(61, 220, 151, 0.15)' : 'rgba(255, 100, 124, 0.15)',
                    border: `1px solid ${br.isTrue ? '#3DDC97' : '#FF647C'}`,
                    borderRadius: '12px',
                    padding: '3px 10px',
                    color: br.isTrue ? '#3DDC97' : '#FF647C',
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    fontFamily: '"Roboto Mono", monospace',
                    marginBottom: '8px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {br.tag} : {br.label}
                </span>

                <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  {br.nodes && br.nodes.length > 0 ? (
                    renderTreeNodes(br.nodes)
                  ) : (
                    <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', padding: '8px' }}>
                      pass
                    </Typography>
                  )}
                </Box>

                <Box style={{ width: '2px', flexGrow: 1, minHeight: '20px', borderLeft: '2px dashed rgba(255, 255, 255, 0.25)', zIndex: 1 }} />
              </Box>
            ))}
          </Box>

          {/* Bottom Bus Line */}
          <Box style={{ display: 'flex', width: '100%', maxWidth: `${Math.max(680, allBranches.length * 240)}px`, position: 'relative', height: '2px', marginTop: '-2px' }}>
            <Box
              style={{
                position: 'absolute',
                bottom: '0',
                left: `${100 / (allBranches.length * 2)}%`,
                right: `${100 / (allBranches.length * 2)}%`,
                height: '2px',
                borderTop: '2px dashed rgba(255, 255, 255, 0.25)',
                zIndex: 1
              }}
            />
          </Box>

          <Box style={{ width: '2px', height: '18px', borderLeft: '2px dashed rgba(255, 255, 255, 0.25)', zIndex: 1 }} />
        </Box>
      );
    }

    // B. Standard Binary IF / ELSE Branch
    return (
      <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', margin: '10px 0' }}>
        {/* Dynamic ISO Decision Diamond / Hexagon Card */}
        <Box
          style={{
            position: 'relative',
            minWidth: '200px',
            maxWidth: '380px',
            padding: '12px 28px',
            clipPath: 'polygon(14px 0%, calc(100% - 14px) 0%, 100% 50%, calc(100% - 14px) 100%, 14px 100%, 0% 50%)',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(245, 158, 11, 0.05) 100%)',
            border: '2px solid #F59E0B',
            borderRadius: '6px',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            margin: '6px 0'
          }}
        >
          <span style={{ fontSize: '0.66rem', fontWeight: 900, color: '#F59E0B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>
            DECISION
          </span>
          <Typography style={{ fontFamily: '"Roboto Mono", monospace', fontWeight: 800, color: '#FFF', fontSize: '0.8rem', textAlign: 'center', wordBreak: 'break-word' }}>
            {node.condition} ?
          </Typography>
        </Box>

        <Box style={{ width: '2px', height: '16px', borderLeft: '2px dashed rgba(255, 255, 255, 0.25)', zIndex: 1 }} />

        {/* Horizontal Split Wings */}
        <Box style={{ display: 'flex', width: '100%', maxWidth: '680px', position: 'relative', marginTop: '-2px' }}>
          {/* Top Horizontal Bar */}
          <Box
            style={{
              position: 'absolute',
              top: '0',
              left: '25%',
              right: '25%',
              height: '2px',
              borderTop: '2px dashed rgba(255, 255, 255, 0.25)',
              zIndex: 1
            }}
          />

          {/* Left Branch (TRUE - YES) */}
          <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, paddingRight: '14px', minWidth: '180px' }}>
            <Box style={{ width: '2px', height: '16px', borderLeft: '2px dashed rgba(255, 255, 255, 0.25)', zIndex: 1 }} />
            
            <span
              style={{
                background: 'rgba(61, 220, 151, 0.15)',
                border: '1px solid #3DDC97',
                borderRadius: '12px',
                padding: '3px 12px',
                color: '#3DDC97',
                fontWeight: 800,
                fontSize: '0.7rem',
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

            <Box style={{ width: '2px', flexGrow: 1, minHeight: '20px', borderLeft: '2px dashed rgba(255, 255, 255, 0.25)', zIndex: 1 }} />
          </Box>

          {/* Right Branch (FALSE - NO) */}
          <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, paddingLeft: '14px', minWidth: '180px' }}>
            <Box style={{ width: '2px', height: '16px', borderLeft: '2px dashed rgba(255, 255, 255, 0.25)', zIndex: 1 }} />

            <span
              style={{
                background: 'rgba(255, 100, 124, 0.15)',
                border: '1px solid #FF647C',
                borderRadius: '12px',
                padding: '3px 12px',
                color: '#FF647C',
                fontWeight: 800,
                fontSize: '0.7rem',
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

            <Box style={{ width: '2px', flexGrow: 1, minHeight: '20px', borderLeft: '2px dashed rgba(255, 255, 255, 0.25)', zIndex: 1 }} />
          </Box>
        </Box>

        {/* Bottom Horizontal Merge Bar */}
        <Box style={{ display: 'flex', width: '100%', maxWidth: '680px', position: 'relative', height: '2px', marginTop: '-2px' }}>
          <Box
            style={{
              position: 'absolute',
              bottom: '0',
              left: '25%',
              right: '25%',
              height: '2px',
              borderTop: '2px dashed rgba(255, 255, 255, 0.25)',
              zIndex: 1
            }}
          />
        </Box>

        {/* Exit Stem */}
        <Box style={{ width: '2px', height: '18px', borderLeft: '2px dashed rgba(255, 255, 255, 0.25)', zIndex: 1 }} />
      </Box>
    );
  };

  // 4. Render SWITCH-CASE Multi-Way Branch Node
  const renderSwitchNode = (node) => {
    const cases = node.cases || [];

    return (
      <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', margin: '10px 0' }}>
        {/* Switch Header Card */}
        <Box
          style={{
            padding: '10px 24px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(245, 158, 11, 0.05) 100%)',
            border: '2px solid #F59E0B',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            minWidth: '220px',
            maxWidth: '380px'
          }}
        >
          <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#F59E0B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            SWITCH SELECTOR
          </span>
          <Typography style={{ fontFamily: '"Roboto Mono", monospace', fontWeight: 800, color: '#FFF', fontSize: '0.82rem', textAlign: 'center' }}>
            {node.expression}
          </Typography>
        </Box>

        <Box style={{ width: '2px', height: '18px', borderLeft: '2px dashed rgba(255, 255, 255, 0.25)', zIndex: 1 }} />

        {/* Multi-Track Cases */}
        <Box style={{ display: 'flex', width: '100%', maxWidth: `${Math.max(640, cases.length * 220)}px`, position: 'relative', marginTop: '-2px', justifyContent: 'center' }}>
          <Box
            style={{
              position: 'absolute',
              top: '0',
              left: `${100 / (cases.length * 2)}%`,
              right: `${100 / (cases.length * 2)}%`,
              height: '2px',
              borderTop: '2px dashed rgba(255, 255, 255, 0.25)',
              zIndex: 1
            }}
          />

          {cases.map((c, cIdx) => (
            <Box key={cIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, padding: '0 8px', minWidth: '160px' }}>
              <Box style={{ width: '2px', height: '16px', borderLeft: '2px dashed rgba(255, 255, 255, 0.25)', zIndex: 1 }} />

              <span
                style={{
                  background: c.isDefault ? 'rgba(168, 85, 247, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                  border: `1px solid ${c.isDefault ? '#A855F7' : '#38BDF8'}`,
                  borderRadius: '12px',
                  padding: '3px 10px',
                  color: c.isDefault ? '#C084FC' : '#38BDF8',
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  fontFamily: '"Roboto Mono", monospace',
                  marginBottom: '8px',
                  whiteSpace: 'nowrap'
                }}
              >
                CASE: {c.match}
              </span>

              <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                {c.nodes && c.nodes.length > 0 ? (
                  renderTreeNodes(c.nodes)
                ) : (
                  <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', padding: '8px' }}>
                    pass
                  </Typography>
                )}
              </Box>

              <Box style={{ width: '2px', flexGrow: 1, minHeight: '20px', borderLeft: '2px dashed rgba(255, 255, 255, 0.25)', zIndex: 1 }} />
            </Box>
          ))}
        </Box>

        {/* Bottom Merge Bar */}
        <Box style={{ display: 'flex', width: '100%', maxWidth: `${Math.max(640, cases.length * 220)}px`, position: 'relative', height: '2px', marginTop: '-2px' }}>
          <Box
            style={{
              position: 'absolute',
              bottom: '0',
              left: `${100 / (cases.length * 2)}%`,
              right: `${100 / (cases.length * 2)}%`,
              height: '2px',
              borderTop: '2px dashed rgba(255, 255, 255, 0.25)',
              zIndex: 1
            }}
          />
        </Box>

        <Box style={{ width: '2px', height: '18px', borderLeft: '2px dashed rgba(255, 255, 255, 0.25)', zIndex: 1 }} />
      </Box>
    );
  };

  // 5. Render Loop Node (WHILE / FOR / DO-WHILE)
  const renderLoopNode = (node) => {
    return (
      <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', margin: '10px 0' }}>
        {/* Loop Diamond / Header Card */}
        <Box
          style={{
            position: 'relative',
            minWidth: '200px',
            maxWidth: '380px',
            padding: '12px 28px',
            clipPath: 'polygon(14px 0%, calc(100% - 14px) 0%, 100% 50%, calc(100% - 14px) 100%, 14px 100%, 0% 50%)',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.16) 0%, rgba(139, 92, 246, 0.05) 100%)',
            border: '2px solid #8B5CF6',
            borderRadius: '6px',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            margin: '6px 0'
          }}
        >
          <span style={{ fontSize: '0.66rem', fontWeight: 900, color: '#A78BFA', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>
            LOOP ({node.loopType.toUpperCase()})
          </span>
          <Typography style={{ fontFamily: '"Roboto Mono", monospace', fontWeight: 800, color: '#FFF', fontSize: '0.8rem', textAlign: 'center', wordBreak: 'break-word' }}>
            {node.condition} ?
          </Typography>
        </Box>

        <Box style={{ width: '2px', height: '16px', borderLeft: '2px dashed rgba(255, 255, 255, 0.25)', zIndex: 1 }} />

        {/* Split: Loop Body (True) vs Loop Exit (False) */}
        <Box style={{ display: 'flex', width: '100%', maxWidth: '680px', position: 'relative', marginTop: '-2px' }}>
          <Box
            style={{
              position: 'absolute',
              top: '0',
              left: '25%',
              right: '25%',
              height: '2px',
              borderTop: '2px dashed rgba(255, 255, 255, 0.25)',
              zIndex: 1
            }}
          />

          {/* Left Column: Loop Body */}
          <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, paddingRight: '14px', borderLeft: '2px dashed rgba(139, 92, 246, 0.35)', borderRadius: '12px 0 0 12px', minWidth: '180px' }}>
            <Box style={{ width: '2px', height: '16px', borderLeft: '2px dashed rgba(255, 255, 255, 0.25)', zIndex: 1 }} />

            <span
              style={{
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid #8B5CF6',
                borderRadius: '12px',
                padding: '3px 12px',
                color: '#C4B5FD',
                fontWeight: 800,
                fontSize: '0.7rem',
                fontFamily: '"Roboto Mono", monospace',
                marginBottom: '10px'
              }}
            >
              LOOP BODY 🔄
            </span>

            <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              {renderTreeNodes(node.body)}
            </Box>

            {/* Upward Loop-back indicator */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '8px 0', padding: '2px 8px', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.1)' }}>
              <span style={{ fontSize: '0.66rem', color: '#A78BFA', fontWeight: 800, fontFamily: '"Roboto Mono", monospace' }}>
                ▲ REPEAT LOOP
              </span>
            </Box>

            <Box style={{ width: '2px', flexGrow: 1, minHeight: '14px', borderLeft: '2px dashed rgba(139, 92, 246, 0.4)', zIndex: 1 }} />
          </Box>

          {/* Right Column: Loop Exit */}
          <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, paddingLeft: '14px', minWidth: '180px' }}>
            <Box style={{ width: '2px', height: '16px', borderLeft: '2px dashed rgba(255, 255, 255, 0.25)', zIndex: 1 }} />

            <span
              style={{
                background: 'rgba(255, 100, 124, 0.15)',
                border: '1px solid #FF647C',
                borderRadius: '12px',
                padding: '3px 12px',
                color: '#FF647C',
                fontWeight: 800,
                fontSize: '0.7rem',
                fontFamily: '"Roboto Mono", monospace',
                marginBottom: '10px'
              }}
            >
              EXIT LOOP ➔
            </span>

            <Box style={{ width: '2px', flexGrow: 1, minHeight: '40px', borderLeft: '2px dashed rgba(255, 255, 255, 0.25)', zIndex: 1 }} />
          </Box>
        </Box>

        {/* Bottom Merge Bar */}
        <Box style={{ display: 'flex', width: '100%', maxWidth: '680px', position: 'relative', height: '2px', marginTop: '-2px' }}>
          <Box
            style={{
              position: 'absolute',
              bottom: '0',
              left: '25%',
              right: '25%',
              height: '2px',
              borderTop: '2px dashed rgba(255, 255, 255, 0.25)',
              zIndex: 1
            }}
          />
        </Box>

        <Box style={{ width: '2px', height: '18px', borderLeft: '2px dashed rgba(255, 255, 255, 0.25)', zIndex: 1 }} />
      </Box>
    );
  };

  // 6. Render Tree Nodes Recursively
  const renderTreeNodes = (nodes) => {
    if (!nodes || nodes.length === 0) return null;

    return nodes.map((node, idx) => {
      const isLast = idx === nodes.length - 1;
      let element = null;

      if (node.type === 'branch') {
        element = renderBranchNode(node);
      } else if (node.type === 'switch') {
        element = renderSwitchNode(node);
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
          background: '#0c0d12',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start'
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
            padding: '20px',
            minWidth: '320px',
            width: '100%'
          }}
        >
          {activeModule && renderTreeNodes(activeModule.nodes)}
        </Box>
      </Box>
    </Box>
  );
};
