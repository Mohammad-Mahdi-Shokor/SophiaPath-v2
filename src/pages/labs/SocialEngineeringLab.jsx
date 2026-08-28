import React, { useState, useEffect } from 'react';
import './SocialEngineeringLab.css';

export default function SocialEngineeringLab({ startMitigated = false }) {
  // --- Layout Constants ---
  const hackerCenter = { x: 80, y: 180 };
  const empCenter = { x: 300, y: 180 };
  const vaultCenter = { x: 520, y: 180 };

  // --- Simulation State ---
  // phases: 'idle', 'lure', 'stealing', 'attacking_vault', 'mfa_prompt', 'breached', 'blocked_training', 'blocked_mfa'
  const [phase, setPhase] = useState('idle'); 
  const [attackType, setAttackType] = useState('phishing'); // 'phishing' or 'vishing'
  const [trainingEnabled, setTrainingEnabled] = useState(startMitigated);
  const [mfaEnabled, setMfaEnabled] = useState(startMitigated);
  
  // Animation progress from 0 to 100
  const [animProgress, setAnimProgress] = useState(0);

  // --- Attack Logic ---
  useEffect(() => {
    let timer;
    if (['lure', 'stealing', 'attacking_vault', 'mfa_prompt'].includes(phase)) {
      timer = setInterval(() => {
        setAnimProgress(p => {
          const nextP = p + 2.5; // Animation speed
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
  }, [phase, trainingEnabled, mfaEnabled]);

  const handlePhaseComplete = (completedPhase) => {
    if (completedPhase === 'lure') {
      if (trainingEnabled) {
        setPhase('blocked_training');
      } else {
        setAnimProgress(0);
        setPhase('stealing');
      }
    } else if (completedPhase === 'stealing') {
      setAnimProgress(0);
      setPhase('attacking_vault');
    } else if (completedPhase === 'attacking_vault') {
      if (mfaEnabled) {
        setAnimProgress(0);
        setPhase('mfa_prompt');
      } else {
        setPhase('breached');
      }
    } else if (completedPhase === 'mfa_prompt') {
      setPhase('blocked_mfa');
    }
  };

  // --- Handlers ---
  const handleLaunch = (type) => {
    if (['idle', 'breached', 'blocked_training', 'blocked_mfa'].includes(phase)) {
      setAttackType(type);
      setAnimProgress(0);
      setPhase('lure');
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
        return { title: 'Systems Normal', desc: 'Attacker is preparing a social engineering campaign.', colorClass: 'normal' };
      case 'lure':
        return { 
          title: attackType === 'phishing' ? 'Phishing Email Sent' : 'Vishing Call Initiated', 
          desc: 'Attacker is using urgency and manipulation to trick the employee.', 
          colorClass: 'warning' 
        };
      case 'blocked_training':
        return { title: 'Attack Blocked (Human Firewall)', desc: 'Security awareness training paid off! Employee recognized the lure and reported it.', colorClass: 'success' };
      case 'stealing':
        return { title: 'Employee Manipulated', desc: 'The employee fell for the trick and is handing over their password.', colorClass: 'orange' };
      case 'attacking_vault':
        return { title: 'Credentials Stolen', desc: 'Attacker is using the stolen password to access the company vault.', colorClass: 'danger' };
      case 'mfa_prompt':
        return { title: 'MFA Triggered', desc: 'Vault requires a second factor. Prompt sent to the real employee.', colorClass: 'info' };
      case 'blocked_mfa':
        return { title: 'Attack Blocked (MFA)', desc: 'Employee denied the unexpected MFA prompt. Attacker cannot access the vault without the physical device.', colorClass: 'success' };
      case 'breached':
        return { title: 'Data Breach!', desc: 'Attacker successfully bypassed all defenses and accessed the vault.', colorClass: 'danger' };
      default:
        return { title: '', desc: '', colorClass: '' };
    }
  };

  const statusInfo = getStatusContent();

  // --- Pixel-Perfect Animation Calculations ---
  const userAvatarX = empCenter.x - 45;
  const pcX = empCenter.x + 45;

  // Node Edges
  const hackerRight = hackerCenter.x + 30;
  const empAvatarLeft = userAvatarX - 14;
  const empAvatarRight = userAvatarX + 14;
  const pcLeft = pcX - 24;
  const pcRight = pcX + 24;
  const vaultLeft = vaultCenter.x - 30;

  // Payload travel boundaries
  const lureStartX = hackerRight + 14; 
  const lureEndX = empAvatarLeft - 14; 
  const blockedLureX = userAvatarX - 32; 
  const mfaStartX = vaultLeft - 10; 
  const mfaEndX = pcRight + 10; 

  // Determine exact end point
  const targetLureEndX = trainingEnabled ? blockedLureX : lureEndX;

  // Paths
  const lureX = phase === 'blocked_training' ? blockedLureX : lureStartX + ((targetLureEndX - lureStartX) * (animProgress / 100));
  const stealX = lureEndX - ((lureEndX - lureStartX) * (animProgress / 100));
  const mfaX = mfaStartX - ((mfaStartX - mfaEndX) * (animProgress / 100));
  
  // Hacker attacks vault: Arching path
  const t = animProgress / 100;
  const p0 = { x: hackerCenter.x, y: hackerCenter.y - 35 };
  const p1 = { x: empCenter.x, y: 20 }; 
  const p2 = { x: vaultCenter.x, y: vaultCenter.y - 45 }; 
  const attackVaultX = Math.pow(1-t, 2) * p0.x + 2 * (1-t) * t * p1.x + Math.pow(t, 2) * p2.x;
  const attackVaultY = Math.pow(1-t, 2) * p0.y + 2 * (1-t) * t * p1.y + Math.pow(t, 2) * p2.y;

  return (
    <div className="social-wrapper">
      <div className="social-header">
        <div>
          <h1 className="social-title">Social Engineering</h1>
          <p className="social-subtitle">Manipulation, Theft, and Layered Defenses</p>
        </div>
      </div>

      <div className="social-card">
        <div className="social-svg-container">
          <svg viewBox="0 0 600 280" className="social-svg">
            
            {/* --- CONNECTIVE LINES --- */}
            {/* Hacker <-> Employee */}
            <line 
              x1={hackerRight} y1={hackerCenter.y} 
              x2={empAvatarLeft} y2={empCenter.y} 
              stroke="var(--stroke-light)" strokeWidth="2" strokeDasharray="6 4"
              style={{ transition: 'all 0.3s' }}
            />
            {/* Employee (Human) <-> Employee (PC) */}
            <line 
              x1={empAvatarRight} y1={empCenter.y} 
              x2={pcLeft} y2={empCenter.y} 
              stroke="var(--stroke-light)" strokeWidth="2"
              style={{ transition: 'all 0.3s', opacity: 0.5 }}
            />
            {/* Employee <-> Vault */}
            <line 
              x1={pcRight} y1={empCenter.y} 
              x2={vaultLeft} y2={vaultCenter.y} 
              stroke="var(--stroke-main)" strokeWidth="2"
              style={{ transition: 'all 0.3s' }}
            />
            {/* Hacker -> Vault (Arch) */}
            <path 
              d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`}
              fill="none" stroke="var(--accent-red)" strokeWidth="2" strokeDasharray="8 4"
              style={{ transition: 'all 0.5s', opacity: (phase === 'attacking_vault' || phase === 'breached' || phase === 'mfa_prompt' || phase === 'blocked_mfa' ? 0.3 : 0) }}
            />

            {/* --- ANIMATED PAYLOADS --- */}
            
            {/* 1. Lure (Phishing/Vishing) */}
            {(phase === 'lure' || phase === 'blocked_training') && (
              <g transform={`translate(${lureX}, ${hackerCenter.y})`}>
                <g style={{ transition: 'all 0.3s', opacity: phase === 'blocked_training' ? 0.9 : 1, transform: phase === 'blocked_training' ? 'scale(1.1)' : 'scale(1)' }}>
                  <circle cx="0" cy="0" r="14" fill="var(--warning-main)" />
                  {attackType === 'phishing' ? (
                    <path d="M -7 -4 L 7 -4 L 7 4 L -7 4 Z M -7 -4 L 0 1 L 7 -4" fill="none" stroke="#b45309" strokeWidth="1.5" />
                  ) : (
                    <path d="M -4 -6 C -6 -6 -6 -3 -4 -1 C -2 1 1 4 3 6 C 5 8 8 8 8 6 C 9 5 10 3 8 1 C 6 -1 5 -2 3 0 C 1 2 -2 -1 0 -3 C 2 -5 1 -6 -1 -8 C -2 -9 -3 -6 -4 -6 Z" fill="#b45309" />
                  )}
                  {/* Blocked visual */}
                  {phase === 'blocked_training' && (
                    <g>
                      <path d="M -10 -10 L 10 10 M 10 -10 L -10 10" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
                      <path d="M -10 -10 L 10 10 M 10 -10 L -10 10" stroke="var(--danger-main)" strokeWidth="4" strokeLinecap="round" />
                    </g>
                  )}
                </g>
              </g>
            )}

            {/* 2. Stolen Data (Password) */}
            {phase === 'stealing' && (
              <g transform={`translate(${stealX}, ${hackerCenter.y})`}>
                <circle cx="0" cy="0" r="14" fill="#fca5a5" />
                <path d="M -4 2 A 3 3 0 1 1 0 -2 L 3 -2 L 3 0 L 5 0 L 5 -2 L 7 -2 L 7 2 Z" fill="var(--danger-main)" />
                <circle cx="-3" cy="0" r="1" fill="#fca5a5" />
              </g>
            )}

            {/* 3. Hacker Attacking Vault */}
            {phase === 'attacking_vault' && (
              <g transform={`translate(${attackVaultX}, ${attackVaultY})`}>
                <circle cx="0" cy="0" r="12" fill="var(--danger-main)" />
                <path d="M -4 2 A 3 3 0 1 1 0 -2 L 3 -2 L 3 0 L 5 0 L 5 -2 L 7 -2 L 7 2 Z" fill="#ffffff" />
              </g>
            )}

            {/* 4. MFA Prompt */}
            {phase === 'mfa_prompt' && (
              <g transform={`translate(${mfaX}, ${empCenter.y})`}>
                <rect x="-10" y="-14" width="20" height="28" rx="3" fill="#60a5fa" stroke="var(--info-main)" strokeWidth="2" />
                <circle cx="0" cy="8" r="2" fill="var(--info-main)" />
                <text x="0" y="2" fill="var(--info-main)" fontSize="12" fontWeight="bold" textAnchor="middle">?</text>
              </g>
            )}

            {/* --- NODES --- */}

            {/* Hacker Node */}
            <g transform={`translate(${hackerCenter.x - 30}, ${hackerCenter.y - 35})`}>
              <rect width="60" height="70" rx="8" fill="var(--hacker-bg)" style={{ transition: 'all 0.3s' }}/>
              <circle cx="30" cy="25" r="12" fill="var(--danger-main)" />
              <rect x="22" y="32" width="16" height="10" rx="2" fill="var(--danger-main)" />
              <path d="M 24 25 L 28 25 M 32 25 L 36 25" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <text x="30" y="60" fill="var(--danger-main)" fontSize="10" fontWeight="bold" textAnchor="middle">ATTACKER</text>
            </g>

            {/* Employee Node */}
            <g transform={`translate(${empCenter.x}, ${empCenter.y})`}>
              {/* Employee Avatar (Left) */}
              <g transform="translate(-45, 0)">
                <circle cx="0" cy="-2" r="14" fill={trainingEnabled ? "var(--accent-green)" : "var(--stroke-main)"} style={{ transition: 'all 0.3s' }} />
                <path d="M -22 28 C -22 3 22 3 22 28 Z" fill={trainingEnabled ? "var(--accent-green)" : "var(--stroke-main)"} style={{ transition: 'all 0.3s' }} />
                
                {/* Smart Glasses - Only visible when trained */}
                <g style={{ transition: 'opacity 0.3s', opacity: trainingEnabled ? 1 : 0 }}>
                  <rect x="-9" y="-6" width="7" height="5" rx="1" fill="#fff" />
                  <rect x="2" y="-6" width="7" height="5" rx="1" fill="#fff" />
                  <line x1="-2" y1="-3.5" x2="2" y2="-3.5" stroke="#fff" strokeWidth="1.5" />
                  <line x1="-12" y1="-3.5" x2="-9" y2="-3.5" stroke="#fff" strokeWidth="1.5" />
                  <line x1="9" y1="-3.5" x2="12" y2="-3.5" stroke="#fff" strokeWidth="1.5" />
                </g>

                {/* Little shield badge on chest - Only visible when trained */}
                <g style={{ transition: 'opacity 0.3s', opacity: trainingEnabled ? 1 : 0 }} transform="translate(8, 14)">
                  <path d="M -4 0 L 0 -3 L 4 0 L 4 3 C 4 6 0 8 0 8 C 0 8 -4 6 -4 3 Z" fill="#fff" />
                  <path d="M -1.5 1.5 L -0.5 3 L 2 0.5" fill="none" stroke="var(--accent-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </g>
              
              {/* PC / Monitor (Right) */}
              <g transform="translate(45, 0)">
                <rect x="-24" y="-18" width="48" height="36" rx="4" fill="var(--emp-bg)" stroke="var(--stroke-main)" strokeWidth="3" style={{ transition: 'all 0.3s' }} />
                <rect x="-18" y="-12" width="36" height="24" fill="var(--panel-bg)" style={{ transition: 'all 0.3s' }} />
                <path d="M 0 18 L 0 28 M -12 28 L 12 28" stroke="var(--stroke-main)" strokeWidth="3" strokeLinecap="round" style={{ transition: 'all 0.3s' }}/>
              </g>

              {/* Defense: MFA Phone rejection */}
              {phase === 'blocked_mfa' && (
                <g transform="translate(0, 0)">
                  <rect x="-12" y="-20" width="24" height="40" rx="4" fill="var(--emp-bg)" stroke="var(--stroke-main)" strokeWidth="2" />
                  <rect x="-8" y="-15" width="16" height="30" rx="2" fill="var(--danger-main)" />
                  <path d="M -4 -4 L 4 4 M 4 -4 L -4 4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              )}

              {/* Employee Status Indicators */}
              {phase === 'stealing' && <text x="-45" y="-25" fill="var(--warning-main)" fontSize="24" fontWeight="bold" textAnchor="middle">?</text>}
            </g>

            {/* Vault Node */}
            <g transform={`translate(${vaultCenter.x - 30}, ${vaultCenter.y - 45})`}>
              <rect width="60" height="80" rx="4" fill="var(--vault-bg)" />
              <line x1="10" y1="20" x2="50" y2="20" stroke="var(--info-main)" strokeWidth="4" strokeLinecap="round" />
              <line x1="10" y1="40" x2="50" y2="40" stroke="var(--info-main)" strokeWidth="4" strokeLinecap="round" />
              <line x1="10" y1="60" x2="50" y2="60" stroke="var(--info-main)" strokeWidth="4" strokeLinecap="round" />
              
              {/* Padlock */}
              <g transform="translate(30, 40)">
                {phase === 'breached' ? (
                   // Unlocked
                   <>
                    <path d="M -8 -2 V -8 A 8 8 0 0 1 8 -8 V -6" fill="none" stroke="var(--danger-main)" strokeWidth="3" strokeLinecap="round" />
                    <rect x="-12" y="-2" width="24" height="18" rx="2" fill="var(--danger-main)" />
                   </>
                ) : (
                   // Locked
                   <>
                    <path d="M -8 -2 V -8 A 8 8 0 0 1 8 -8 V -2" fill="none" stroke="var(--warning-main)" strokeWidth="3" />
                    <rect x="-12" y="-2" width="24" height="18" rx="2" fill="var(--warning-main)" />
                    <circle cx="0" cy="7" r="2" fill="#fff" />
                    <line x1="0" y1="9" x2="0" y2="12" stroke="#fff" strokeWidth="1.5" />
                   </>
                )}
              </g>
              
              {phase === 'breached' && (
                <text x="30" y="95" fill="var(--danger-main)" fontSize="12" fontWeight="bold" textAnchor="middle" className="pulse-anim">COMPROMISED</text>
              )}
            </g>

          </svg>
        </div>

        <div className="social-controls">
          <div className="social-attack-panel">
            <span className="social-attack-panel-title">Launch Attack</span>
            <div className="social-attack-buttons">
              <button 
                onClick={() => handleLaunch('phishing')}
                disabled={!['idle', 'breached', 'blocked_training', 'blocked_mfa'].includes(phase)}
                className="social-attack-btn phishing"
              >
                Phishing Email
              </button>
              <button 
                onClick={() => handleLaunch('vishing')}
                disabled={!['idle', 'breached', 'blocked_training', 'blocked_mfa'].includes(phase)}
                className="social-attack-btn vishing"
              >
                Fake CEO Call
              </button>
            </div>
            {['breached', 'blocked_training', 'blocked_mfa'].includes(phase) && (
               <button onClick={resetSim} className="social-reset-btn">Reset Simulation</button>
            )}
          </div>

          <div className="social-defense-panel">
            <div className="social-toggle-row">
              <div className="social-toggle-text">
                <span className="social-toggle-title">Security Training</span>
                <span className="social-toggle-subtitle">Human Firewall</span>
              </div>
              <button
                className={`social-toggle-btn ${trainingEnabled ? 'active training' : 'inactive'}`}
                onClick={() => {
                  setTrainingEnabled(!trainingEnabled);
                  resetSim();
                }}
              >
                <div className="social-toggle-thumb" />
              </button>
            </div>

            <div className="social-toggle-row" style={{ marginTop: '0.5rem' }}>
              <div className="social-toggle-text">
                <span className="social-toggle-title">MFA Enforcement</span>
                <span className="social-toggle-subtitle">Require phone approval</span>
              </div>
              <button
                className={`social-toggle-btn ${mfaEnabled ? 'active mfa' : 'inactive'}`}
                onClick={() => {
                  setMfaEnabled(!mfaEnabled);
                  resetSim();
                }}
              >
                <div className="social-toggle-thumb" />
              </button>
            </div>
          </div>
        </div>

        <div className="social-status-container">
          <p className={`social-status-title ${statusInfo.colorClass}`}>{statusInfo.title}</p>
          <p className="social-status-desc">{statusInfo.desc}</p>
        </div>
      </div>
    </div>
  );
}
