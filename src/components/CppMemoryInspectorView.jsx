import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  FastForward as StepNextIcon,
  FastRewind as StepPrevIcon,
  Pause as PauseIcon,
  Refresh as ResetIcon,
  Memory as MemoryIcon,
  AccountTree as ScopeIcon
} from '@mui/icons-material';

const TYPE_COLORS = {
  int: '#38bdf8',      // Cyan
  float: '#38bdf8',
  double: '#60a5fa',    // Blue
  string: '#c084fc',    // Purple
  bool: '#4ade80',      // Green
  char: '#fbbf24',      // Amber
  pointer: '#f97316',   // Orange
  auto: '#94a3b8'       // Gray
};

export const CppMemoryInspectorView = ({
  currentStep,
  totalSteps,
  stepData,
  onStepNext,
  onStepPrev,
  onReset,
  isAutoPlaying,
  onToggleAutoPlay
}) => {
  if (!stepData) {
    return (
      <Box style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <MemoryIcon style={{ fontSize: '40px', opacity: 0.4, marginBottom: '8px' }} />
        <Typography variant="body2" style={{ fontSize: '0.82rem' }}>
          Click &quot;STEP LINE&quot; or &quot;RUN ALL&quot; to inspect memory state.
        </Typography>
      </Box>
    );
  }

  const {
    lineNumber,
    activeScope = 'main()',
    stack = [],
    heap = []
  } = stepData;

  // Group stack variables by their function scope
  const scopesMap = new Map();
  stack.forEach((item) => {
    const scopeName = item.scope || 'main()';
    if (!scopesMap.has(scopeName)) {
      scopesMap.set(scopeName, []);
    }
    scopesMap.get(scopeName).push(item);
  });

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
      {/* 1. Compact Step Controls Bar */}
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 10px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--divider)',
          borderRadius: '10px',
          flexWrap: 'wrap',
          gap: '6px'
        }}
      >
        {/* Step & Line & Scope info */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'var(--primary-main)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.72rem',
              fontFamily: '"Roboto Mono", monospace'
            }}
          >
            Step {currentStep + 1}/{totalSteps}
          </span>

          {lineNumber > 0 && (
            <span
              style={{
                color: '#38BDF8',
                fontWeight: 700,
                fontSize: '0.75rem',
                fontFamily: '"Roboto Mono", monospace'
              }}
            >
              Line {lineNumber}
            </span>
          )}

          <span
            style={{
              fontSize: '0.7rem',
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'var(--text-secondary)',
              fontFamily: '"Roboto Mono", monospace'
            }}
          >
            Active Scope: <strong style={{ color: '#fff' }}>{activeScope}</strong>
          </span>
        </Box>

        {/* Step Buttons */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Tooltip title="Previous Line">
            <span>
              <IconButton
                size="small"
                onClick={onStepPrev}
                disabled={currentStep <= 0}
                style={{ color: currentStep > 0 ? 'var(--text-primary)' : 'var(--text-disabled)', padding: '4px' }}
              >
                <StepPrevIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Button
            size="small"
            variant="contained"
            onClick={onStepNext}
            disabled={currentStep >= totalSteps - 1}
            startIcon={<StepNextIcon style={{ fontSize: '15px' }} />}
            style={{
              padding: '3px 10px',
              borderRadius: '6px',
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '0.74rem',
              background: '#3D5CFF',
              color: '#fff',
              boxShadow: 'none'
            }}
          >
            Next Line
          </Button>

          <Tooltip title={isAutoPlaying ? "Pause Auto-Run" : "Auto-Run (Line by Line)"}>
            <IconButton
              size="small"
              onClick={onToggleAutoPlay}
              style={{
                padding: '4px',
                color: isAutoPlaying ? '#FF6B6B' : '#38BDF8',
                background: isAutoPlaying ? 'rgba(255, 107, 107, 0.12)' : 'rgba(56, 189, 248, 0.12)'
              }}
            >
              {isAutoPlaying ? <PauseIcon fontSize="small" /> : <PlayIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Restart to Line 1">
            <IconButton size="small" onClick={onReset} style={{ color: 'var(--text-secondary)', padding: '4px' }}>
              <ResetIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* 2. Unified Memory Table (Grouped by Stack Frame Scope) */}
      <Paper
        elevation={0}
        style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '10px',
          background: '#0a0c12',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        {stack.length === 0 ? (
          <Box style={{ padding: '24px 8px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.78rem', fontStyle: 'italic' }}>
            No variables in memory yet.
          </Box>
        ) : (
          Array.from(scopesMap.entries()).map(([scopeName, scopeVars], sIdx) => (
            <Box key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Stack Frame Header */}
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  background: scopeName === activeScope ? 'rgba(61, 92, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: scopeName === activeScope ? '1px solid rgba(61, 92, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px'
                }}
              >
                <ScopeIcon style={{ fontSize: '14px', color: scopeName === 'main()' ? '#38bdf8' : '#c084fc' }} />
                <Typography style={{ fontWeight: 800, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', color: scopeName === activeScope ? '#fff' : 'var(--text-secondary)' }}>
                  Stack Frame: <span style={{ color: scopeName === 'main()' ? '#38bdf8' : '#c084fc' }}>{scopeName}</span>
                </Typography>
                {scopeName === activeScope && (
                  <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: '#3D5CFF', color: '#fff', fontWeight: 800, marginLeft: 'auto' }}>
                    Active
                  </span>
                )}
              </Box>

              {/* Table Column Header */}
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 0.9fr 1.3fr 1.6fr',
                  gap: '8px',
                  padding: '2px 8px',
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase'
                }}
              >
                <span>Variable</span>
                <span>Type</span>
                <span>Address</span>
                <span>Value</span>
              </Box>

              {/* Scope Variables Rows */}
              <Box style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {scopeVars.map((item, idx) => {
                  const baseType = item.type?.replace('*', '').replace(/\[\d+\]/, '');
                  const typeColor = TYPE_COLORS[baseType] || '#38bdf8';
                  const hasHistory = item.history && item.history.length > 0;
                  const isCreatedNow = item.isCreated;
                  const isModifiedNow = item.isUpdated && item.hasChanged;

                  // Row background & border based on state
                  let rowBg = 'rgba(255, 255, 255, 0.02)';
                  let rowBorder = '1px solid transparent';
                  if (isCreatedNow) {
                    rowBg = 'rgba(61, 220, 151, 0.12)';
                    rowBorder = '1px solid rgba(61, 220, 151, 0.35)';
                  } else if (isModifiedNow) {
                    rowBg = 'rgba(245, 158, 11, 0.12)';
                    rowBorder = '1px solid rgba(245, 158, 11, 0.35)';
                  }

                  return (
                    <Box
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 0.9fr 1.3fr 1.6fr',
                        gap: '8px',
                        alignItems: 'center',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        background: rowBg,
                        border: rowBorder,
                        fontFamily: '"Roboto Mono", monospace',
                        fontSize: '0.78rem',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      {/* Name */}
                      <span style={{ fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isCreatedNow && <span style={{ color: '#3DDC97', fontSize: '10px' }} title="Created">●</span>}
                        {isModifiedNow && <span style={{ color: '#F59E0B', fontSize: '10px' }} title="Modified">●</span>}
                        {item.name}
                      </span>

                      {/* Type */}
                      <span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: `rgba(255, 255, 255, 0.06)`,
                            color: typeColor
                          }}
                        >
                          {item.type}
                        </span>
                      </span>

                      {/* Memory Address */}
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
                        {item.address}
                      </span>

                      {/* Value: Green for created, Amber for modified with crossed-out previous */}
                      <span>
                        {item.isPointer ? (
                          <Box style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                            <span style={{ color: '#f97316', fontWeight: 700 }}>
                              {item.value} {item.targetName ? `➔ (${item.targetName})` : ''}
                            </span>
                            {hasHistory ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                {item.history.map((oldVal, hIdx) => (
                                  <React.Fragment key={hIdx}>
                                    <span style={{ textDecoration: 'line-through', opacity: 0.5, color: '#f87171' }}>
                                      *{item.name}={String(oldVal)}
                                    </span>
                                    <span style={{ color: 'var(--text-secondary)' }}>➔</span>
                                  </React.Fragment>
                                ))}
                                <span style={{ color: '#F59E0B', fontWeight: 800 }}>
                                  *{item.name}={String(item.targetValue)}
                                </span>
                              </span>
                            ) : (
                              <span style={{ color: isCreatedNow ? '#3DDC97' : '#fff', fontWeight: 700 }}>
                                *{item.name}={String(item.targetValue)}
                              </span>
                            )}
                          </Box>
                        ) : item.isArray ? (
                          <Box style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {item.elements?.map((el, eIdx) => {
                              const elHasHistory = el.history && el.history.length > 0;
                              const elCreated = el.isCreated;
                              return (
                                <span
                                  key={eIdx}
                                  style={{
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    background: elCreated ? 'rgba(61, 220, 151, 0.15)' : (elHasHistory ? 'rgba(245, 158, 11, 0.15)' : 'rgba(192, 132, 252, 0.15)'),
                                    color: elCreated ? '#3DDC97' : (elHasHistory ? '#F59E0B' : '#c084fc'),
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}
                                  title={`Address: ${el.address}`}
                                >
                                  [{el.index}]:{' '}
                                  {elHasHistory ? (
                                    <>
                                      {el.history.map((oldVal, hIdx) => (
                                        <React.Fragment key={hIdx}>
                                          <span style={{ textDecoration: 'line-through', opacity: 0.5, color: '#f87171' }}>
                                            {String(oldVal)}
                                          </span>
                                          <span>➔</span>
                                        </React.Fragment>
                                      ))}
                                      <span style={{ color: '#F59E0B', fontWeight: 800 }}>
                                        {String(el.value)}
                                      </span>
                                    </>
                                  ) : (
                                    <span>{String(el.value)}</span>
                                  )}
                                </span>
                              );
                            })}
                          </Box>
                        ) : (
                          <span>
                            {hasHistory ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                {item.history.map((oldVal, hIdx) => (
                                  <React.Fragment key={hIdx}>
                                    <span style={{ textDecoration: 'line-through', opacity: 0.5, color: '#f87171' }}>
                                      {typeof oldVal === 'string' ? `"${oldVal}"` : String(oldVal)}
                                    </span>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>➔</span>
                                  </React.Fragment>
                                ))}
                                <span style={{ color: '#F59E0B', fontWeight: 800 }}>
                                  {typeof item.value === 'string' ? `"${item.value}"` : String(item.value)}
                                </span>
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontWeight: 800,
                                  color: isCreatedNow ? '#3DDC97' : '#fff'
                                }}
                              >
                                {typeof item.value === 'string' ? `"${item.value}"` : String(item.value)}
                              </span>
                            )}
                          </span>
                        )}
                      </span>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ))
        )}

        {/* 3. Heap Allocations Section (Only shown if dynamic memory is used) */}
        {heap.length > 0 && (
          <Box style={{ marginTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '8px' }}>
            <Typography variant="caption" style={{ color: '#38BDF8', fontWeight: 800, fontFamily: '"Roboto Mono", monospace', display: 'block', marginBottom: '6px' }}>
              Heap Allocations (Dynamic Memory)
            </Typography>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {heap.map((h, hIdx) => (
                <Box
                  key={hIdx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '5px 8px',
                    borderRadius: '6px',
                    background: h.isCreated ? 'rgba(61, 220, 151, 0.12)' : 'rgba(56, 189, 248, 0.06)',
                    border: h.isCreated ? '1px solid rgba(61, 220, 151, 0.35)' : '1px solid rgba(56, 189, 248, 0.2)',
                    fontFamily: '"Roboto Mono", monospace',
                    fontSize: '0.74rem'
                  }}
                >
                  <span style={{ color: '#38BDF8', fontWeight: 800 }}>{h.address}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{h.label}</span>
                  <span style={{ color: h.isCreated ? '#3DDC97' : '#fff', fontWeight: 700 }}>Value: {String(h.value)}</span>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
