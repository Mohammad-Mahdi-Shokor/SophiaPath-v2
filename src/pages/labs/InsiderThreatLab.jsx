import React, { useState, useEffect } from 'react';
import './InsiderThreatLab.css';

export default function InsiderThreatLab({ startMitigated = false }) {
  // --- Layout Constants ---
  const dbCenter = { x: 80, y: 150 };
  const empCenter = { x: 300, y: 150 };
  const extCenter = { x: 520, y: 150 };

  // --- Simulation State ---
  const [phase, setPhase] = useState('idle'); 
  const [attackType, setAttackType] = useState('usb'); // 'usb' or 'cloud'
  const [uebaEnabled, setUebaEnabled] = useState(startMitigated);
  const [dlpEnabled, setDlpEnabled] = useState(startMitigated);
  
  const [animProgress, setAnimProgress] = useState(0);

  // --- Attack Logic ---
  useEffect(() => {
    let timer;
    if (['gathering', 'exfiltrating'].includes(phase)) {
      timer = setInterval(() => {
        setAnimProgress(p => {
          const nextP = p + 2.5;
          if (nextP >= 100) {
            clearInterval(timer);
            handlePhaseComplete(phase);
            return 100;
          }
          return nextP;
        });
      }, 30);
    }
    return () => clearInterval(timer);
  }, [phase, uebaEnabled, dlpEnabled]);

  const handlePhaseComplete = (completedPhase) => {
    if (completedPhase === 'gathering') {
      if (uebaEnabled) {
        setPhase('blocked_ueba');
      } else {
        setAnimProgress(0);
        setPhase('exfiltrating');
      }
    } else if (completedPhase === 'exfiltrating') {
      if (dlpEnabled) {
        setPhase('blocked_dlp');
      } else {
        setPhase('breached');
      }
    }
  };

  const handleLaunch = (type) => {
    if (['idle', 'breached', 'blocked_ueba', 'blocked_dlp'].includes(phase)) {
      setAttackType(type);
      setAnimProgress(0);
      setPhase('gathering');
    }
  };

  const resetSim = () => {
    setPhase('idle');
    setAnimProgress(0);
  };

  // --- Status UI ---
  const getStatusContent = () => {
    switch (phase) {
      case 'idle':
        return { title: 'Systems Normal', desc: 'Employee is working. No anomalous activity detected.', colorClass: 'normal' };
      case 'gathering':
        return { 
          title: 'Data Hoarding Detected', 
          desc: 'Rogue employee is downloading a massive amount of sensitive data to their local machine.', 
          colorClass: 'warning' 
        };
      case 'blocked_ueba':
        return { title: 'Attack Blocked (UEBA)', desc: 'Behavioral analytics detected the anomalous download spike and suspended the account immediately.', colorClass: 'success' };
      case 'exfiltrating':
        return { 
          title: attackType === 'usb' ? 'USB Exfiltration in Progress' : 'Cloud Exfiltration in Progress', 
          desc: 'Employee is attempting to transfer the stolen data outside the company perimeter.', 
          colorClass: 'orange' 
        };
      case 'blocked_dlp':
        return { title: 'Attack Blocked (DLP)', desc: 'Data Loss Prevention intercepted the transfer of sensitive files to an unauthorized destination.', colorClass: 'success' };
      case 'breached':
        return { title: 'Data Exfiltrated!', desc: 'The insider successfully stole the company data and moved it off-site.', colorClass: 'danger' };
      default:
        return { title: '', desc: '', colorClass: '' };
    }
  };

  const statusInfo = getStatusContent();

  // --- Pixel-Perfect Animation Calculations ---
  const dbRight = dbCenter.x + 30;
  const empLeft = empCenter.x - 45;
  const empRight = empCenter.x + 55;
  const extLeft = extCenter.x - 45;

  const perimeterX = empRight + ((extLeft - empRight) / 2);

  const gatherStartX = dbRight + 14; 
  const gatherEndX = empLeft - 14; 
  const blockedGatherX = gatherEndX - 20;

  const exfilStartX = empRight + 14; 
  const exfilEndX = extCenter.x; 
  const blockedExfilX = perimeterX - 20;

  const targetGatherEndX = uebaEnabled ? blockedGatherX : gatherEndX;
  const targetExfilEndX = dlpEnabled ? blockedExfilX : exfilEndX;

  const gatherX = phase === 'blocked_ueba' ? blockedGatherX : gatherStartX + ((targetGatherEndX - gatherStartX) * (animProgress / 100));
  const exfilX = phase === 'blocked_dlp' ? blockedExfilX : exfilStartX + ((targetExfilEndX - exfilStartX) * (animProgress / 100));

  const isRogue = phase !== 'idle' && phase !== 'blocked_ueba';

  return (
    <div className="insider-wrapper">
      <div className="insider-header">
        <div>
          <h1 className="insider-title">Insider Threat</h1>
          <p className="insider-subtitle">Data Hoarding and Exfiltration</p>
        </div>
      </div>

      <div className="insider-card">
          <div className="insider-svg-container">
            <svg viewBox="0 0 600 280" className="insider-svg">
              
              {/* --- CONNECTIVE LINES --- */}
              <line 
                x1={dbRight} y1={dbCenter.y} 
                x2={empLeft} y2={empCenter.y} 
                stroke="var(--stroke-main)" strokeWidth="3"
                style={{ transition: 'all 0.3s' }}
              />
              <line 
                x1={empRight} y1={empCenter.y} 
                x2={perimeterX - 15} y2={extCenter.y} 
                stroke="var(--stroke-light)" strokeWidth="3" strokeDasharray="8 6"
                style={{ transition: 'all 0.3s' }}
              />
              <line 
                x1={perimeterX + 15} y1={extCenter.y} 
                x2={extLeft} y2={extCenter.y} 
                stroke="var(--stroke-light)" strokeWidth="3" strokeDasharray="8 6"
                style={{ transition: 'all 0.3s' }}
              />

              {/* Perimeter Boundary line */}
              <line 
                x1={perimeterX} y1={50} 
                x2={perimeterX} y2={250} 
                stroke="var(--stroke-main)" strokeWidth="2" strokeDasharray="4 4" 
                opacity={dlpEnabled ? 0 : 0.5}
                style={{ transition: 'opacity 0.3s' }}
              />
              <text x={perimeterX} y={40} fill="var(--stroke-main)" fontSize="10" textAnchor="middle" opacity="0.6">COMPANY PERIMETER</text>

              {/* DLP Aura */}
              <g style={{ transition: 'opacity 0.5s', opacity: dlpEnabled ? 1 : 0 }}>
                 <line x1={perimeterX} y1={50} x2={perimeterX} y2={250} stroke="var(--accent-green)" strokeWidth="16" strokeLinecap="round" opacity={phase === 'blocked_dlp' ? "0.3" : "0.15"} style={{ transition: 'opacity 0.3s' }} />
                 <line 
                   x1={perimeterX} y1={50} 
                   x2={perimeterX} y2={250} 
                   stroke="var(--accent-green)" 
                   strokeWidth="3" 
                   strokeDasharray="8 8" 
                   className="dash-move" 
                 />
                 <rect x={perimeterX - 20} y={extCenter.y - 70} width="40" height="20" rx="10" fill="var(--panel-bg)" stroke="var(--accent-green)" strokeWidth="2" />
                 <text x={perimeterX} y={extCenter.y - 56} fill="var(--accent-green)" fontSize="10" fontWeight="bold" textAnchor="middle">DLP</text>
              </g>

              {/* --- DESTINATION PANEL --- */}
              <g transform={`translate(${extCenter.x - 45}, ${extCenter.y - 35})`}>
                <rect width="90" height="65" rx="6" fill="var(--panel-bg)" stroke="var(--stroke-main)" strokeWidth="2" style={{ transition: 'all 0.3s' }}/>
                <path d="M 0 6 Q 0 0 6 0 L 84 0 Q 90 0 90 6 L 90 16 L 0 16 Z" fill="var(--stroke-main)" opacity="0.1" />
                <line x1="0" y1="16" x2="90" y2="16" stroke="var(--stroke-main)" strokeWidth="1" opacity="0.2" />
                
                {attackType === 'usb' ? (
                  <>
                    <circle cx="10" cy="8" r="2.5" fill="#ef4444" />
                    <circle cx="18" cy="8" r="2.5" fill="#fcd34d" />
                    <circle cx="26" cy="8" r="2.5" fill="#22c55e" />
                    <text x="45" y="42" fill="var(--stroke-light)" fontSize="10" fontWeight="500" textAnchor="middle" opacity={phase === 'breached' ? 0 : 0.6} style={{ transition: 'opacity 0.3s' }}>
                      Folder Empty
                    </text>
                  </>
                ) : (
                  <>
                    <circle cx="8" cy="8" r="1.5" fill="var(--stroke-main)" opacity="0.5" />
                    <circle cx="13" cy="8" r="1.5" fill="var(--stroke-main)" opacity="0.5" />
                    <circle cx="18" cy="8" r="1.5" fill="var(--stroke-main)" opacity="0.5" />
                    <rect x="24" y="4" width="61" height="8" rx="2" fill="var(--panel-bg)" stroke="var(--stroke-main)" strokeWidth="0.5" opacity="0.5" />
                    <text x="28" y="10" fill="var(--stroke-main)" fontSize="4" fontWeight="bold" opacity="0.7">https://cloud.box</text>
                    
                    <g opacity={phase === 'breached' ? 0 : 0.5} style={{ transition: 'opacity 0.3s' }}>
                      <g transform="translate(45, 34) scale(0.6)">
                        <path d="M -15 5 C -20 5 -20 -2 -15 -2 C -15 -10 -5 -12 -2 -8 C 2 -15 15 -12 15 -2 C 22 -2 22 5 15 5 Z" fill="none" stroke="var(--stroke-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M 0 -2 L 0 6 M -3 1 L 0 -2 L 3 1" fill="none" stroke="var(--stroke-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </g>
                      <text x="45" y="52" fill="var(--stroke-main)" fontSize="7" fontWeight="bold" textAnchor="middle">
                        Drop files here
                      </text>
                    </g>
                  </>
                )}
              </g>

              {/* --- ANIMATED PAYLOADS --- */}
              {(phase === 'gathering' || phase === 'blocked_ueba') && (
                <g transform={`translate(${gatherX}, ${dbCenter.y})`}>
                  <g style={{ transition: 'all 0.3s', opacity: phase === 'blocked_ueba' ? 0.9 : 1, transform: phase === 'blocked_ueba' ? 'scale(1.1)' : 'scale(1)' }}>
                    <path d="M -16 -8 L -4 -8 L 0 -4 L 16 -4 C 17.1 -4 18 -3.1 18 -2 L 18 10 C 18 11.1 17.1 12 16 12 L -16 12 C -17.1 12 -18 11.1 -18 10 L -18 -6 C -18 -7.1 -17.1 -8 -16 -8 Z" fill="#60a5fa" stroke="#2563eb" strokeWidth="1.5"/>
                    <rect x="-10" y="-1" width="20" height="3" fill="#fff" opacity="0.5" />
                    <rect x="-10" y="4" width="14" height="3" fill="#fff" opacity="0.5" />
                    {phase === 'blocked_ueba' && (
                      <g>
                        <path d="M -14 -12 L 14 12 M 14 -12 L -14 12" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
                        <path d="M -14 -12 L 14 12 M 14 -12 L -14 12" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                      </g>
                    )}
                  </g>
                </g>
              )}

              {(phase === 'exfiltrating' || phase === 'blocked_dlp' || phase === 'breached') && (
                <g transform={`translate(${exfilX}, ${extCenter.y})`}>
                   <g style={{ transition: 'all 0.3s', opacity: phase === 'blocked_dlp' ? 0.9 : 1, transform: phase === 'blocked_dlp' ? 'scale(1.1)' : 'scale(1)' }}>
                    <path d="M -16 -8 L -4 -8 L 0 -4 L 16 -4 C 17.1 -4 18 -3.1 18 -2 L 18 10 C 18 11.1 17.1 12 16 12 L -16 12 C -17.1 12 -18 11.1 -18 10 L -18 -6 C -18 -7.1 -17.1 -8 -16 -8 Z" fill="#fca5a5" stroke="#dc2626" strokeWidth="1.5"/>
                    <text x="0" y="6" fill="#991b1b" fontSize="8" fontWeight="bold" textAnchor="middle">SECRET</text>
                    {phase === 'blocked_dlp' && (
                      <g>
                        <path d="M -14 -12 L 14 12 M 14 -12 L -14 12" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
                        <path d="M -14 -12 L 14 12 M 14 -12 L -14 12" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                      </g>
                    )}
                  </g>
                </g>
              )}

              {/* --- NODES --- */}
              <g transform={`translate(${dbCenter.x - 30}, ${dbCenter.y - 45})`}>
                <rect width="60" height="90" rx="4" fill="var(--db-bg)" />
                {[0,1,2,3].map(i => (
                   <g key={i} transform={`translate(8, ${15 + i * 18})`}>
                     <rect width="44" height="10" fill="#1e40af" rx="2" />
                     <circle cx="5" cy="5" r="2" fill={phase === 'gathering' ? "var(--accent-green)" : "#94a3b8"} className={phase === 'gathering' ? 'pulse-anim' : ''} />
                     <line x1="12" y1="5" x2="38" y2="5" stroke="#3b82f6" strokeWidth="2" />
                   </g>
                ))}
                <text x="30" y="110" fill="var(--stroke-main)" fontSize="12" fontWeight="bold" textAnchor="middle">DB SERVER</text>
              </g>

              <g transform={`translate(${empCenter.x}, ${empCenter.y})`}>
                <g transform="translate(0, -18)">
                  <g style={{ transition: 'all 0.5s', opacity: uebaEnabled ? 1 : 0, transformOrigin: 'center' }}>
                     <line x1="-60" y1="0" x2="60" y2="0" stroke="var(--accent-green)" strokeWidth="2" opacity="0.6" className={phase !== 'blocked_ueba' ? 'scan-anim' : ''} />
                     {phase === 'blocked_ueba' && (
                       <text x="0" y="-55" fill="var(--accent-green)" fontSize="12" fontWeight="bold" textAnchor="middle" className="pulse-anim">ACCOUNT SUSPENDED</text>
                     )}
                  </g>

                  <g transform="translate(-30, 0)">
                    {/* Replaced stroke-light with stroke-main as requested */}
                    <circle cx="0" cy="-2" r="14" fill={isRogue ? "var(--accent-red)" : "var(--stroke-main)"} style={{ transition: 'all 0.5s' }} />
                    <path d="M -22 28 C -22 3 22 3 22 28 Z" fill={isRogue ? "var(--accent-red)" : "var(--stroke-main)"} style={{ transition: 'all 0.5s' }} />
                    
                    <g style={{ transition: 'opacity 0.5s', opacity: isRogue ? 1 : 0 }}>
                      <path d="M -12 -5 Q 0 -2 12 -5 L 12 1 Q 0 -2 -12 1 Z" fill="#000" />
                      <circle cx="-5" cy="-2" r="2" fill="#fff" />
                      <circle cx="5" cy="-2" r="2" fill="#fff" />
                    </g>

                    {phase === 'blocked_ueba' && (
                       <g transform="translate(0, 10)">
                         <circle cx="0" cy="0" r="16" fill="var(--emp-bg)" stroke="#ef4444" strokeWidth="2" />
                         <path d="M -4 -2 V -5 A 4 4 0 0 1 4 -5 V -2" fill="none" stroke="#ef4444" strokeWidth="2" />
                         <rect x="-6" y="-2" width="12" height="10" rx="1" fill="#ef4444" />
                       </g>
                    )}
                  </g>
                  
                  <g transform="translate(30, 0)">
                    <rect x="-24" y="-18" width="48" height="36" rx="4" fill="var(--emp-bg)" stroke="var(--stroke-main)" strokeWidth="3" style={{ transition: 'all 0.3s' }} />
                    <rect x="-18" y="-12" width="36" height="24" fill={phase === 'blocked_ueba' ? 'var(--accent-red)' : 'var(--panel-bg)'} style={{ transition: 'all 0.3s' }} />
                    <path d="M 0 18 L 0 28 M -12 28 L 12 28" stroke="var(--stroke-main)" strokeWidth="3" strokeLinecap="round" style={{ transition: 'all 0.3s' }}/>
                    {phase === 'blocked_ueba' && <text x="0" y="4" fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle">!</text>}
                  </g>
                  
                  <text x="0" y="55" fill={isRogue ? "var(--accent-red)" : "var(--stroke-main)"} fontSize="12" fontWeight="bold" textAnchor="middle" style={{ transition: 'all 0.3s' }}>
                    {isRogue ? "ROGUE INSIDER" : "EMPLOYEE"}
                  </text>
                </g>
              </g>

              <g transform={`translate(${extCenter.x}, ${extCenter.y - 45})`}>
                {attackType === 'usb' ? (
                  <g transform="translate(-10, -32) scale(0.6)">
                    <rect x="8" y="0" width="14" height="12" fill="var(--stroke-main)" />
                    <line x1="12" y1="2" x2="12" y2="8" stroke="var(--panel-bg)" strokeWidth="2" />
                    <line x1="18" y1="2" x2="18" y2="8" stroke="var(--panel-bg)" strokeWidth="2" />
                    <rect x="5" y="12" width="20" height="24" rx="2" fill="var(--stroke-main)" />
                    <circle cx="15" cy="24" r="4" fill="var(--panel-bg)" />
                  </g>
                ) : (
                  <g transform="translate(0, -20) scale(0.7)">
                    <path d="M -15 5 C -20 5 -20 -2 -15 -2 C -15 -10 -5 -12 -2 -8 C 2 -15 15 -12 15 -2 C 22 -2 22 5 15 5 Z" fill="var(--info-main)" />
                    <path d="M 0 5 L 0 -2 M -4 2 L 0 -2 L 4 2" fill="none" stroke="var(--panel-bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                )}
                <text x="0" y="-2" fill="var(--stroke-main)" fontSize="10" fontWeight="bold" textAnchor="middle">
                  {attackType === 'usb' ? 'USB DRIVE' : 'PERSONAL CLOUD'}
                </text>
              </g>

              {phase === 'breached' && (
                <text x={extCenter.x} y={extCenter.y + 45} fill="var(--accent-red)" fontSize="12" fontWeight="bold" textAnchor="middle" className="pulse-anim">COMPROMISED</text>
              )}

            </svg>
          </div>

          <div className="insider-controls">
            
            <div className="insider-attack-panel">
              <span className="insider-attack-panel-title">Insider Actions</span>
              <div className="insider-attack-buttons">
                <button 
                  onClick={() => handleLaunch('usb')}
                  disabled={!['idle', 'breached', 'blocked_ueba', 'blocked_dlp'].includes(phase)}
                  className="insider-attack-btn usb"
                >
                  USB Exfiltration
                </button>
                <button 
                  onClick={() => handleLaunch('cloud')}
                  disabled={!['idle', 'breached', 'blocked_ueba', 'blocked_dlp'].includes(phase)}
                  className="insider-attack-btn cloud"
                >
                  Cloud Upload
                </button>
              </div>
              {['breached', 'blocked_ueba', 'blocked_dlp'].includes(phase) && (
                 <button onClick={resetSim} className="insider-reset-btn">Reset Simulation</button>
              )}
            </div>

            <div className="insider-defense-panel">
              
              <div className="insider-toggle-row">
                <div className="insider-toggle-text">
                  <span className="insider-toggle-title">Behavior Analytics (UEBA)</span>
                  <span className="insider-toggle-subtitle">Detect abnormal downloads</span>
                </div>
                <button
                  className={`insider-toggle-btn ${uebaEnabled ? 'active ueba' : 'inactive'}`}
                  onClick={() => {
                    setUebaEnabled(!uebaEnabled);
                    resetSim();
                  }}
                >
                  <div className="insider-toggle-thumb" />
                </button>
              </div>

              <div className="insider-toggle-row">
                <div className="insider-toggle-text">
                  <span className="insider-toggle-title">Data Loss Prevention (DLP)</span>
                  <span className="insider-toggle-subtitle">Block unauthorized uploads/USBs</span>
                </div>
                <button
                  className={`insider-toggle-btn ${dlpEnabled ? 'active dlp' : 'inactive'}`}
                  onClick={() => {
                    setDlpEnabled(!dlpEnabled);
                    resetSim();
                  }}
                >
                  <div className="insider-toggle-thumb" />
                </button>
              </div>

            </div>
          </div>

          <div className="insider-status-container">
            <p className={`insider-status-title ${statusInfo.colorClass}`}>{statusInfo.title}</p>
            <p className="insider-status-desc">{statusInfo.desc}</p>
          </div>
        </div>
    </div>
  );
}
