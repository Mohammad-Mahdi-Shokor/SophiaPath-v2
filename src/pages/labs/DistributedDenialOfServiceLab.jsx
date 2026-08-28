import React, { useState, useMemo, useEffect, useRef } from 'react';
import './DistributedDenialOfServiceLab.css';

export default function DistributedDenialOfServiceLab({ startMitigated = false }) {
  // --- Simulation State ---
  const [requestLevel, setRequestLevel] = useState(20);
  const [firewallEnabled, setFirewallEnabled] = useState(startMitigated);
  const [externalRequests, setExternalRequests] = useState([]);
  const [internalRequests, setInternalRequests] = useState([]);
  
  const extReqIdCounter = useRef(0);
  const intReqIdCounter = useRef(0);

  // --- Constants and Thresholds ---
  const THRESHOLD = 70;
  const isOverloaded = requestLevel > THRESHOLD;
  
  // Determine current state
  let status = 'normal';
  if (isOverloaded && !firewallEnabled) status = 'crashing';
  if (isOverloaded && firewallEnabled) status = 'protected';

  const numClients = Math.floor(4 + (requestLevel / 100) * 28);
  const center = 250;
  const orbitRadius = 190;
  const serverRadius = 45;
  const shieldOuterRadius = 75;
  const shieldInnerRadius = 55;

  // --- Simulation Logic ---
  const clients = useMemo(() => {
    const nodes = [];
    for (let i = 0; i < numClients; i++) {
      const angle = (i / numClients) * 2 * Math.PI - Math.PI / 2; 
      const cx = center + orbitRadius * Math.cos(angle);
      const cy = center + orbitRadius * Math.sin(angle);
      const isRedBase = (i % 2 !== 0 || i % 3 === 0) && requestLevel > 40;
      nodes.push({ id: i, cx, cy, angle, isRedBase });
    }
    return nodes;
  }, [numClients, requestLevel]);

  // Spawn external requests
  useEffect(() => {
    const spawnSpeed = Math.max(20, 800 - (requestLevel * 7.8)); 
    const interval = setInterval(() => {
      if (clients.length === 0) return;
      
      const client = clients[Math.floor(Math.random() * clients.length)];
      const isRed = status === 'crashing' ? true : client.isRedBase;
      const targetRadius = status === 'protected' ? shieldOuterRadius : serverRadius + 4;
      
      const tx = center + targetRadius * Math.cos(client.angle);
      const ty = center + targetRadius * Math.sin(client.angle);
      
      const id = extReqIdCounter.current++;
      const newReq = { id, cx: client.cx, cy: client.cy, tx, ty, isRed };
      
      setExternalRequests(prev => {
        const next = [...prev, newReq];
        return next.length > 80 ? next.slice(next.length - 80) : next;
      });
      
      setTimeout(() => setExternalRequests(prev => prev.filter(r => r.id !== id)), 800);
    }, spawnSpeed);
    
    return () => clearInterval(interval);
  }, [clients, requestLevel, status]);

  // Spawn internal requests (Firewall active)
  useEffect(() => {
    if (status !== 'protected') return;
    const interval = setInterval(() => {
      const queueIndex = Math.floor(Math.random() * 8);
      const angle = (queueIndex / 8) * 2 * Math.PI;
      const cx = center + shieldInnerRadius * Math.cos(angle);
      const cy = center + shieldInnerRadius * Math.sin(angle);
      const tx = center + (serverRadius + 4) * Math.cos(angle);
      const ty = center + (serverRadius + 4) * Math.sin(angle);

      const id = intReqIdCounter.current++;
      const newReq = { id, cx, cy, tx, ty, isRed: false };
      
      setInternalRequests(prev => {
        const next = [...prev, newReq];
        return next.length > 20 ? next.slice(next.length - 20) : next;
      });
      
      setTimeout(() => setInternalRequests(prev => prev.filter(r => r.id !== id)), 400);
    }, 250); 
    
    return () => clearInterval(interval);
  }, [status]);

  const getStatusText = () => {
    if (status === 'normal') {
      return (
        <React.Fragment>
          <p className="dos-status-title dos-status-normal">Server works normally</p>
          <p className="dos-status-subtitle">(number of requests &lt; what it could handle)</p>
        </React.Fragment>
      );
    }
    if (status === 'crashing') {
      return (
        <React.Fragment>
          <p className="dos-status-title dos-status-crashing">Server Crashing!</p>
          <p className="dos-status-subtitle">(number of requests &gt; what it could handle)</p>
        </React.Fragment>
      );
    }
    if (status === 'protected') {
      return (
        <React.Fragment>
          <p className="dos-status-title dos-status-protected">Firewall Organizing Traffic</p>
          <p className="dos-status-subtitle">Absorbing flood & sending safe queue to server</p>
        </React.Fragment>
      );
    }
  };

  return (
    <div className="dos-wrapper" style={{ '--thumb-color': isOverloaded ? 'var(--danger-main)' : 'var(--primary-main)' }}>
      
      <div className="dos-header">
        <div>
          <h1 className="dos-title">
            Distributed Denial of Service (DDoS)
          </h1>
          <p className="dos-subtitle">Interactive Simulation</p>
        </div>
      </div>

      <div className="dos-card">
          
          <div className="dos-svg-container">
            <svg viewBox="0 0 500 500" className="dos-svg">
              <defs>
                <marker id="arrow-gray" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L9,3 z" fill="var(--text-disabled)" />
                </marker>
                <marker id="arrow-red" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L9,3 z" fill="var(--danger-main)" />
                </marker>
                <marker id="arrow-blue-small" markerWidth="8" markerHeight="8" refX="6" refY="2" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,4 L6,2 z" fill="var(--primary-main)" />
                </marker>
              </defs>

              <circle cx={center} cy={center} r={orbitRadius} fill="none" stroke="var(--divider)" strokeWidth="4" />

              {clients.map((client) => {
                const isRedLine = status === 'crashing' ? true : client.isRedBase;
                const strokeColor = isRedLine ? "var(--danger-main)" : "var(--text-disabled)";
                const markerId = isRedLine ? "url(#arrow-red)" : "url(#arrow-gray)";
                const targetR = status === 'protected' ? shieldOuterRadius : serverRadius + 4;
                const tx = center + targetR * Math.cos(client.angle);
                const ty = center + targetR * Math.sin(client.angle);

                return (
                  <line 
                    key={`line-${client.id}`}
                    x1={client.cx} y1={client.cy} x2={tx} y2={ty} 
                    stroke={strokeColor} strokeWidth="2" markerEnd={markerId}
                    style={{ transition: 'all 0.3s ease-out' }}
                  />
                );
              })}

              {status === 'protected' && Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * 2 * Math.PI;
                const x1 = center + shieldInnerRadius * Math.cos(angle);
                const y1 = center + shieldInnerRadius * Math.sin(angle);
                const x2 = center + (serverRadius + 4) * Math.cos(angle);
                const y2 = center + (serverRadius + 4) * Math.sin(angle);
                
                return (
                  <line 
                    key={`internal-line-${i}`}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="var(--primary-main)" strokeWidth="1.5" strokeDasharray="4 2"
                    markerEnd="url(#arrow-blue-small)"
                    style={{ opacity: 0.6, transition: 'opacity 0.5s' }}
                  />
                );
              })}

              <g className={`fw-group ${status === 'protected' ? 'protected' : 'crashing'}`}>
                <circle cx={center} cy={center} r="65" fill="var(--success-main)" fillOpacity="0.1" stroke="var(--success-main)" strokeWidth="20" strokeOpacity="0.15" />
                <circle cx={center} cy={center} r={shieldOuterRadius} fill="none" stroke="var(--success-main)" strokeWidth="2" strokeDasharray="12 8" className="fw-spin" />
                <circle cx={center} cy={center} r={shieldInnerRadius} fill="none" stroke="var(--success-main)" strokeWidth="2" />
                {Array.from({ length: 16 }).map((_, i) => {
                  const angle = (i / 16) * 2 * Math.PI;
                  const r = 65;
                  return (
                    <circle 
                      key={`node-${i}`} cx={center + r * Math.cos(angle)} cy={center + r * Math.sin(angle)} 
                      r="2.5" fill="var(--success-main)" className="fw-pulse" style={{ animationDelay: `${(i % 4) * 0.5}s` }}
                    />
                  );
                })}
              </g>

              <g className={status === 'crashing' ? 'server-crash-anim' : 'server-node'}>
                <circle cx={center} cy={center} r={serverRadius} fill={status === 'crashing' ? 'var(--danger-main)' : 'var(--background-paper)'} stroke="var(--text-primary)" strokeWidth="1.5" style={{ transition: 'fill 0.3s' }} />
                <text x={center} y={center + 5} textAnchor="middle" className={`server-text ${status === 'crashing' ? 'crashing' : 'normal'}`}>
                  Server
                </text>
              </g>

              {externalRequests.map((req) => {
                const endScale = (req.isRed || status !== 'protected') ? 3 : 0;
                return (
                  <circle 
                    key={req.id} r="4.5" fill={req.isRed ? 'var(--danger-main)' : 'var(--primary-main)'} className="request-particle"
                    style={{ '--start-x': `${req.cx}px`, '--start-y': `${req.cy}px`, '--end-x': `${req.tx}px`, '--end-y': `${req.ty}px`, '--end-scale': endScale }}
                  />
                );
              })}

              {internalRequests.map((req) => (
                 <circle 
                    key={`int-${req.id}`} r="3.5" fill="var(--primary-main)" className="internal-particle"
                    style={{ '--start-x': `${req.cx}px`, '--start-y': `${req.cy}px`, '--end-x': `${req.tx}px`, '--end-y': `${req.ty}px`, '--end-scale': 0 }}
                  />
              ))}

              {clients.map((client) => {
                const isZombie = status === 'crashing' ? true : client.isRedBase;
                
                return isZombie ? (
                  <g key={`comp-${client.id}`} transform={`translate(${client.cx}, ${client.cy}) scale(0.85)`}>
                    {/* Zombie Monitor Screen */}
                    <rect x="-14" y="-11" width="28" height="18" rx="2" fill="var(--background-paper)" stroke="var(--danger-main)" strokeWidth="2.5" />
                    {/* X eyes */}
                    <path d="M-8 -6 L-4 -2 M-4 -6 L-8 -2" stroke="var(--danger-main)" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M4 -6 L8 -2 M8 -6 L4 -2" stroke="var(--danger-main)" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Zigzag mouth */}
                    <path d="M-6 4 L-3 2 L0 4 L3 2 L6 4" fill="none" stroke="var(--danger-main)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Base & Stand */}
                    <path d="M-18 11 L18 11" stroke="var(--danger-main)" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="-5" y1="7" x2="-5" y2="11" stroke="var(--danger-main)" strokeWidth="2.5" />
                    <line x1="5" y1="7" x2="5" y2="11" stroke="var(--danger-main)" strokeWidth="2.5" />
                  </g>
                ) : (
                  <g key={`comp-${client.id}`} transform={`translate(${client.cx}, ${client.cy}) scale(0.85)`}>
                    {/* Normal Monitor Screen */}
                    <rect x="-14" y="-11" width="28" height="18" rx="2" fill="var(--background-paper)" stroke="var(--text-primary)" strokeWidth="2.5" />
                    <path d="M-18 11 L18 11" stroke="var(--text-primary)" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="-5" y1="7" x2="-5" y2="11" stroke="var(--text-primary)" strokeWidth="2.5" />
                    <line x1="5" y1="7" x2="5" y2="11" stroke="var(--text-primary)" strokeWidth="2.5" />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="dos-controls">
            <div className="dos-slider-container">
              <input 
                type="range" min="1" max="100" 
                value={requestLevel}
                onChange={(e) => setRequestLevel(parseInt(e.target.value))}
                className="dos-slider"
              />
              <span className="dos-slider-label">Adjust Request Volume</span>
            </div>

            <div className="dos-firewall-toggle">
              <button
                className={`dos-toggle-btn ${firewallEnabled ? 'active' : 'inactive'}`}
                onClick={() => setFirewallEnabled(!firewallEnabled)}
              >
                <div className={`dos-toggle-thumb ${firewallEnabled ? 'active' : 'inactive'}`} />
              </button>
              <span className="dos-firewall-label">Firewall</span>
            </div>
          </div>

          <div className="dos-status-container">
            {getStatusText()}
          </div>
        </div>

    </div>
  );
}
