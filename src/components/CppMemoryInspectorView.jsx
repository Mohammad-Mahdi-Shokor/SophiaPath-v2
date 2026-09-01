import React from 'react';
import {
  Box,
  Typography,
  Paper,
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
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexGrow: 1,
        overflowY: 'auto',
        gap: '10px'
      }}
    >
      {/* Title Header: Matching Interactive Output */}
      <Box style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingBottom: '6px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <MemoryIcon style={{ fontSize: '15px', color: 'var(--text-secondary)' }} />
        <Typography variant="caption" style={{ color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Memory Inspector
        </Typography>
      </Box>
        {stack.length === 0 ? (
          <Paper
            elevation={0}
            style={{
              padding: '24px 8px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontStyle: 'italic',
              background: '#0a0c12',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            No variables in memory yet.
          </Paper>
        ) : (
          Array.from(scopesMap.entries()).map(([scopeName, scopeVars], sIdx) => (
            <Paper
              key={sIdx}
              elevation={0}
              style={{
                padding: '12px',
                background: '#0a0c12',
                border: scopeName === activeScope ? '1px solid rgba(61, 92, 255, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              {/* Stack Frame Header Card (Left-Aligned) */}
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <ScopeIcon style={{ fontSize: '15px', color: scopeName === 'main()' ? '#38bdf8' : '#c084fc' }} />
                <Typography style={{ fontWeight: 800, fontFamily: '"Roboto Mono", monospace', fontSize: '0.8rem', color: scopeName === 'main()' ? '#38bdf8' : '#c084fc' }}>
                  {scopeName}
                </Typography>
                {scopeName === activeScope && (
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      background: '#3D5CFF',
                      color: '#fff',
                      letterSpacing: '0.04em'
                    }}
                  >
                    Active
                  </span>
                )}
              </Box>

              {/* Table Column Header: Address, Variable, Type, Value */}
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(84px, 1.1fr) minmax(55px, 0.9fr) minmax(48px, 0.75fr) minmax(90px, 1.35fr)',
                  gap: '8px',
                  padding: '2px 6px',
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                <span>Address</span>
                <span>Variable</span>
                <span>Type</span>
                <span>Value</span>
              </Box>

              {/* Scope Variables Rows */}
              <Box style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {scopeVars.map((item, idx) => {
                  const baseType = item.type?.replace('*', '').replace(/\[\d+\]/, '');
                  const typeColor = TYPE_COLORS[baseType] || '#38bdf8';
                  const hasHistory = item.history && item.history.length > 0;
                  const isCreatedNow = item.isCreated;
                  const isModifiedNow = item.isUpdated && item.hasChanged;

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
                        gridTemplateColumns: 'minmax(84px, 1.1fr) minmax(55px, 0.9fr) minmax(48px, 0.75fr) minmax(90px, 1.35fr)',
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
                      {/* 1. Memory Address */}
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
                        {item.address}
                      </span>

                      {/* 2. Variable Name */}
                      <span style={{ fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isCreatedNow && <span style={{ color: '#3DDC97', fontSize: '10px' }} title="Created">●</span>}
                        {isModifiedNow && <span style={{ color: '#F59E0B', fontSize: '10px' }} title="Modified">●</span>}
                        {item.name}
                      </span>

                      {/* 3. Type */}
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

                      {/* 4. Value: Green for created, Amber for modified with crossed-out previous */}
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
            </Paper>
          ))
        )}

        {/* 3. Heap Allocations Section (Only shown if dynamic memory is used) */}
        {heap.length > 0 && (
          <Paper
            elevation={0}
            style={{
              padding: '12px',
              background: '#0a0c12',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <Typography variant="caption" style={{ color: '#38BDF8', fontWeight: 800, fontFamily: '"Roboto Mono", monospace', display: 'block' }}>
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
          </Paper>
        )}
    </Box>
  );
};
