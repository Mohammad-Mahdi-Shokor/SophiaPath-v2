import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  useTheme
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
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

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
      <Box style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingBottom: '6px', borderBottom: '1px solid var(--divider)' }}>
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
              background: isDarkMode ? '#0a0c12' : 'var(--background-paper)',
              borderRadius: '12px',
              border: '1px solid var(--divider)'
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
                background: isDarkMode ? '#0a0c12' : 'var(--background-paper)',
                border: scopeName === activeScope ? '1px solid rgba(61, 92, 255, 0.45)' : '1px solid var(--divider)',
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
                  borderBottom: '1px solid var(--divider)'
                }}
              >
                <ScopeIcon style={{ fontSize: '15px', color: scopeName === 'main()' ? (isDarkMode ? '#38bdf8' : '#0284c7') : (isDarkMode ? '#c084fc' : '#9333ea') }} />
                <Typography style={{ fontWeight: 800, fontFamily: '"Roboto Mono", monospace', fontSize: '0.8rem', color: scopeName === 'main()' ? (isDarkMode ? '#38bdf8' : '#0284c7') : (isDarkMode ? '#c084fc' : '#9333ea') }}>
                  {scopeName}
                </Typography>
                {scopeName === activeScope && (
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      background: 'var(--primary-main)',
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
                  const typeColor = TYPE_COLORS[baseType] || (isDarkMode ? '#38bdf8' : '#0284c7');
                  const hasHistory = item.history && item.history.length > 0;
                  const isCreatedNow = item.isCreated;
                  const isModifiedNow = item.isUpdated && item.hasChanged;

                  let rowBg = isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)';
                  let rowBorder = '1px solid transparent';
                  if (isCreatedNow) {
                    rowBg = isDarkMode ? 'rgba(61, 220, 151, 0.12)' : 'rgba(16, 185, 129, 0.1)';
                    rowBorder = '1px solid rgba(16, 185, 129, 0.35)';
                  } else if (isModifiedNow) {
                    rowBg = isDarkMode ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.1)';
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
                      <span style={{ fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isCreatedNow && <span style={{ color: '#10b981', fontSize: '10px' }} title="Created">●</span>}
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
                            background: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
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
                            <span style={{ color: isDarkMode ? '#f97316' : '#ea580c', fontWeight: 700 }}>
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
                              <span style={{ color: isCreatedNow ? '#10b981' : 'var(--text-primary)', fontWeight: 700 }}>
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
                                    background: elCreated ? (isDarkMode ? 'rgba(61, 220, 151, 0.15)' : 'rgba(16, 185, 129, 0.12)') : (elHasHistory ? 'rgba(245, 158, 11, 0.12)' : (isDarkMode ? 'rgba(192, 132, 252, 0.15)' : 'rgba(147, 51, 234, 0.1)')),
                                    color: elCreated ? (isDarkMode ? '#3DDC97' : '#059669') : (elHasHistory ? '#D97706' : (isDarkMode ? '#c084fc' : '#7e22ce')),
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
                                  color: isCreatedNow ? (isDarkMode ? '#3DDC97' : '#059669') : 'var(--text-primary)'
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
              background: isDarkMode ? '#0a0c12' : 'var(--background-paper)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <Typography variant="caption" style={{ color: isDarkMode ? '#38BDF8' : '#0284c7', fontWeight: 800, fontFamily: '"Roboto Mono", monospace', display: 'block' }}>
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
                    background: h.isCreated ? (isDarkMode ? 'rgba(61, 220, 151, 0.12)' : 'rgba(16, 185, 129, 0.1)') : (isDarkMode ? 'rgba(56, 189, 248, 0.06)' : 'rgba(2, 132, 199, 0.06)'),
                    border: h.isCreated ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(56, 189, 248, 0.25)',
                    fontFamily: '"Roboto Mono", monospace',
                    fontSize: '0.74rem'
                  }}
                >
                  <span style={{ color: isDarkMode ? '#38BDF8' : '#0284c7', fontWeight: 800 }}>{h.address}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{h.label}</span>
                  <span style={{ color: h.isCreated ? (isDarkMode ? '#3DDC97' : '#059669') : 'var(--text-primary)', fontWeight: 700 }}>Value: {String(h.value)}</span>
                </Box>
              ))}
            </Box>
          </Paper>
        )}
    </Box>
  );
};
