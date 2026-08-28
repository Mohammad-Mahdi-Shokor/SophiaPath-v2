import React, { useState, useEffect } from 'react';
import './RansomwareLab.css';

export default function RansomwareLab({ startMitigated = false }) {
  // --- Layout Constants ---
  const pcCenter = { x: 435, y: 175 };
  const hackerCenter = { x: 95, y: 175 };

  // --- Simulation State ---
  const [files, setFiles] = useState(
    Array.from({ length: 12 }, (_, i) => ({ id: i, status: 'normal' }))
  );
  // phases: 'idle', 'sending', 'encrypting', 'ransomed', 'blocked', 'restoring'
  const [attackPhase, setAttackPhase] = useState('idle'); 
  const [edrEnabled, setEdrEnabled] = useState(startMitigated);
  const [payloadPos, setPayloadPos] = useState(0);

  // --- Attack Logic ---
  useEffect(() => {
    let timer;
    if (attackPhase === 'sending') {
      // Animate payload flying across the network
      setPayloadPos(0);
      let pos = 0;

      timer = setInterval(() => {
        pos += 5;
        
        if (edrEnabled && pos >= 73) {
          setPayloadPos(73);
          clearInterval(timer);
          setAttackPhase('blocked');
        } else if (pos >= 100) {
          setPayloadPos(100);
          clearInterval(timer);
          setAttackPhase('encrypting');
        } else {
          setPayloadPos(pos);
        }
      }, 30);
    } 
    else if (attackPhase === 'encrypting') {
      // Encrypt files one by one
      timer = setInterval(() => {
        setFiles(prev => {
          const normalFiles = prev.filter(f => f.status === 'normal');
          if (normalFiles.length === 0) {
            clearInterval(timer);
            setAttackPhase('ransomed');
            return prev;
          }
          // Pick a random normal file to encrypt
          const target = normalFiles[Math.floor(Math.random() * normalFiles.length)];
          return prev.map(f => f.id === target.id ? { ...f, status: 'locked' } : f);
        });
      }, 250);
    }
    else if (attackPhase === 'restoring') {
       // Quickly restore files
       timer = setInterval(() => {
        setFiles(prev => {
          const lockedFiles = prev.filter(f => f.status === 'locked');
          if (lockedFiles.length === 0) {
            clearInterval(timer);
            setAttackPhase('idle');
            return prev;
          }
          // Restore a random locked file
          const target = lockedFiles[Math.floor(Math.random() * lockedFiles.length)];
          return prev.map(f => f.id === target.id ? { ...f, status: 'normal' } : f);
        });
      }, 100);
    }

    return () => clearInterval(timer);
  }, [attackPhase, edrEnabled]);

  // --- Handlers ---
  const handleStartAttack = () => {
    if (attackPhase === 'idle' || attackPhase === 'blocked' || attackPhase === 'ransomed') {
      setFiles(files.map(f => ({...f, status: 'normal'})));
      setAttackPhase('sending');
    }
  };

  const handleRestore = () => {
    if (attackPhase === 'ransomed' || attackPhase === 'encrypting') {
      setAttackPhase('restoring');
    }
  };

  const handlePayRansom = () => {
    alert("Payment sent... but the attackers didn't send the decryption key! \n\nNever trust cybercriminals. Always use backups.");
  };

  // --- Status UI ---
  const getStatusContent = () => {
    switch (attackPhase) {
      case 'idle':
        return { title: 'System Normal', desc: 'Files are safe. Waiting for events.', colorClass: 'normal' };
      case 'sending':
        return { title: 'Suspicious Email Opened', desc: 'User downloaded an unknown attachment...', colorClass: 'warning' };
      case 'blocked':
        return { title: 'Threat Neutralized', desc: 'EDR/Antivirus detected and quarantined the ransomware payload.', colorClass: 'success' };
      case 'encrypting':
        return { title: 'Encryption in Progress!', desc: 'Malware is locking user files. System resources spiking.', colorClass: 'danger' };
      case 'ransomed':
        return { title: 'System Compromised', desc: 'All files encrypted. Attackers are demanding payment.', colorClass: 'danger' };
      case 'restoring':
        return { title: 'Restoring from Backup', desc: 'Wiping infected system and recovering clean files.', colorClass: 'info' };
      default:
        return { title: '', desc: '', colorClass: '' };
    }
  };

  const statusInfo = getStatusContent();

  const payloadX = hackerCenter.x + ((pcCenter.x - 100 - hackerCenter.x) * (payloadPos / 100));

  return (
    <div className="ransomware-wrapper">
      <div className="ransomware-header">
        <div>
          <h1 className="ransomware-title">Ransomware Attack</h1>
          <p className="ransomware-subtitle">Infiltration, Encryption, and Recovery</p>
        </div>
      </div>

      <div className="ransomware-card">
        <div className="ransomware-svg-container">
          <svg viewBox="0 0 600 340" className="ransomware-svg">
            {/* Network Line */}
            <line 
              x1={hackerCenter.x} y1={hackerCenter.y} 
              x2={pcCenter.x} y2={pcCenter.y} 
              stroke="var(--pc-border)" strokeWidth="3" strokeDasharray="8 6"
              style={{ transition: 'all 0.3s' }}
            />

            {/* Attacker (Hacker) */}
            <g transform={`translate(${hackerCenter.x - 30}, ${hackerCenter.y - 35})`}>
              <rect width="60" height="70" rx="8" fill="var(--hacker-bg)" style={{ transition: 'all 0.3s' }}/>
              <circle cx="30" cy="25" r="12" fill="var(--danger-main)" />
              <rect x="22" y="32" width="16" height="10" rx="2" fill="var(--danger-main)" />
              <path d="M 24 25 L 28 25 M 32 25 L 36 25" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <text x="30" y="60" fill="var(--danger-main)" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="1">THREAT</text>
            </g>

            {/* Payload (Phishing Email / Malware) */}
            {attackPhase === 'sending' && (
              <g transform={`translate(${payloadX - 15}, ${hackerCenter.y - 10})`}>
                <rect width="30" height="20" rx="2" fill="var(--background-paper)" stroke="var(--danger-main)" strokeWidth="2" />
                <path d="M 0 0 L 15 10 L 30 0" fill="none" stroke="var(--danger-main)" strokeWidth="2" />
                <circle cx="28" cy="2" r="5" fill="var(--danger-main)" />
                <text x="28" y="5" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">!</text>
              </g>
            )}

            {/* EDR / Antivirus Shield */}
            <g style={{ transition: 'all 0.5s', opacity: edrEnabled ? 1 : 0, transform: edrEnabled ? 'scale(1)' : 'scale(1.1)', transformOrigin: `${pcCenter.x}px ${pcCenter.y}px` }}>
              <path 
                d={`M ${pcCenter.x - 140} ${pcCenter.y - 105} Q ${pcCenter.x - 165} ${pcCenter.y} ${pcCenter.x - 140} ${pcCenter.y + 105}`}
                fill="none" stroke="var(--shield-active)" strokeWidth="16" strokeLinecap="round" opacity="0.2"
              />
              <path 
                d={`M ${pcCenter.x - 140} ${pcCenter.y - 105} Q ${pcCenter.x - 165} ${pcCenter.y} ${pcCenter.x - 140} ${pcCenter.y + 105}`}
                fill="none" stroke="var(--shield-active)" strokeWidth="8" strokeLinecap="round" opacity="0.4"
              />
              <path 
                d={`M ${pcCenter.x - 140} ${pcCenter.y - 105} Q ${pcCenter.x - 165} ${pcCenter.y} ${pcCenter.x - 140} ${pcCenter.y + 105}`}
                fill="none" stroke="var(--shield-active)" strokeWidth="3" strokeLinecap="round"
                filter="drop-shadow(0 4px 3px rgba(0,0,0,0.07))"
              />
              <text 
                x={pcCenter.x - 152} 
                y={pcCenter.y - 115} 
                fill="var(--shield-active)" 
                fontSize="12" 
                fontWeight="bold" 
                textAnchor="middle" 
                letterSpacing="1"
              >
                EDR ACTIVE
              </text>
            </g>

            {/* Target PC */}
            <g transform={`translate(${pcCenter.x - 100}, ${pcCenter.y - 120})`}>
              <g className={attackPhase === 'encrypting' ? 'shake-anim' : ''}>
                <rect width="200" height="180" rx="12" fill="var(--pc-bg)" stroke="var(--pc-border)" strokeWidth="4" style={{ transition: 'all 0.3s' }} />
                <rect x="10" y="10" width="180" height="160" rx="4" fill="var(--background-paper)" stroke="var(--pc-border)" strokeWidth="2" style={{ transition: 'all 0.3s' }} />
                <path d="M 80 180 L 120 180 L 130 220 L 70 220 Z" fill="var(--pc-border)" style={{ transition: 'all 0.3s' }} />
                <rect x="50" y="220" width="100" height="8" rx="4" fill="var(--pc-border)" style={{ transition: 'all 0.3s' }} />

                <g transform="translate(30, 30)">
                  {files.map((file, i) => {
                    const row = Math.floor(i / 4);
                    const col = i % 4;
                    const x = col * 38;
                    const y = row * 45;
                    const isLocked = file.status === 'locked';

                    return (
                      <g key={file.id} transform={`translate(${x}, ${y})`} style={{ transition: 'all 0.3s' }}>
                        <path 
                          d="M 2 2 L 14 2 L 20 8 L 20 26 L 2 26 Z" 
                          fill={isLocked ? 'var(--file-locked)' : 'var(--file-normal)'} 
                          style={{ transition: 'all 0.3s' }}
                        />
                        <path d="M 14 2 L 14 8 L 20 8" fill="rgba(0,0,0,0.2)" />
                        
                        {isLocked ? (
                          <g transform="translate(6, 12)">
                            <rect y="4" width="10" height="8" rx="1" fill="#fff" />
                            <path d="M 2 4 V 2 A 3 3 0 0 1 8 2 V 4" fill="none" stroke="#fff" strokeWidth="1.5" />
                          </g>
                        ) : (
                          <g transform="translate(5, 12)">
                            <line x1="0" y1="0" x2="10" y2="0" stroke="#fff" strokeWidth="1.5" opacity="0.6"/>
                            <line x1="0" y1="4" x2="8" y2="4" stroke="#fff" strokeWidth="1.5" opacity="0.6"/>
                            <line x1="0" y1="8" x2="12" y2="8" stroke="#fff" strokeWidth="1.5" opacity="0.6"/>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>

                {attackPhase === 'ransomed' && (
                  <g className="glitch-text">
                    <rect x="10" y="10" width="180" height="160" rx="4" fill="var(--danger-main)" opacity="0.95" />
                    <text x="100" y="50" fill="#fff" fontSize="16" fontWeight="bold" textAnchor="middle">SYSTEM LOCKED</text>
                    <text x="100" y="75" fill="var(--background-paper)" fontSize="10" textAnchor="middle">Your files are encrypted.</text>
                    <text x="100" y="90" fill="var(--background-paper)" fontSize="10" textAnchor="middle">Send 2.5 BTC to:</text>
                    <text x="100" y="110" fill="#fff" fontSize="8" fontFamily="monospace" textAnchor="middle">1A1zP1eP5QGefi2DMPTfTL5SL...</text>
                    <rect x="50" y="130" width="100" height="20" rx="4" fill="rgba(255,255,255,0.2)" stroke="#fff" strokeWidth="1"/>
                    <text x="100" y="143" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">DECRYPT FILES</text>
                  </g>
                )}
              </g>
            </g>

          </svg>
        </div>

        <div className="ransomware-controls">
          <div className="ransomware-attack-panel">
            <button 
              onClick={handleStartAttack}
              disabled={attackPhase === 'sending' || attackPhase === 'encrypting' || attackPhase === 'restoring'}
              className="ransomware-attack-btn"
            >
              {attackPhase === 'ransomed' ? 'Launch New Attack' : 'Trigger Phishing Email'}
            </button>
            <span className="ransomware-attack-hint">Simulates user opening a malicious payload</span>
          </div>

          <div className="ransomware-defense-panel">
            <div className="ransomware-toggle-row">
              <div className="ransomware-toggle-text">
                <span className="ransomware-toggle-title">EDR / Antivirus</span>
                <span className="ransomware-toggle-subtitle">Block execution</span>
              </div>
              <button
                className={`ransomware-toggle-btn ${edrEnabled ? 'active' : 'inactive'}`}
                onClick={() => setEdrEnabled(!edrEnabled)}
              >
                <div className="ransomware-toggle-thumb" />
              </button>
            </div>

            <div className="ransomware-toggle-row" style={{ marginTop: '0.5rem' }}>
              <div className="ransomware-toggle-text">
                <span className="ransomware-toggle-title">Secure Backups</span>
                <span className="ransomware-toggle-subtitle">Disaster recovery</span>
              </div>
              <button 
                onClick={handleRestore}
                disabled={attackPhase !== 'ransomed' && attackPhase !== 'encrypting'}
                className="ransomware-restore-btn"
              >
                Restore Data
              </button>
            </div>
          </div>
        </div>

        <div className="ransomware-status-container">
          <p className={`ransomware-status-title ${statusInfo.colorClass}`}>{statusInfo.title}</p>
          <p className="ransomware-status-desc">{statusInfo.desc}</p>
          
          {attackPhase === 'ransomed' && (
            <button 
              onClick={handlePayRansom}
              className="ransomware-pay-btn"
            >
              Attempt to pay ransom?
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
