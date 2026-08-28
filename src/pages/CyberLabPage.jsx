import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, Terminal, Database,
  Code, Globe, KeyRound, Activity, Lock, UserX, User, FileTerminal,
  AlertTriangle, CheckCircle, Wrench, TerminalSquare, MonitorPlay, Key, HelpCircle
} from 'lucide-react';
import { Box, Typography, Button, Paper, Divider } from '@mui/material';
import ChallengePage from './labs/ChallengePage';
import DenialOfServiceLab from './labs/DenialOfServiceLab';
import DistributedDenialOfServiceLab from './labs/DistributedDenialOfServiceLab';
import CaesarCipherExplorer from './labs/CaesarCipherExplorer';
import EnigmaMachine from './labs/EnigmaMachine';
import VigenereCipherExplorer from './labs/VigenereCipherExplorer';
import RSAVisualizer from './labs/RSAVisualizer';
import Base64Visualizer from './labs/Base64Visualizer';
import XORVisualizer from './labs/XORVisualizer';
import RansomwareLab from './labs/RansomwareLab';
import SocialEngineeringLab from './labs/SocialEngineeringLab';
import InsiderThreatLab from './labs/InsiderThreatLab';
import BiggerScreenRequired from '../components/BiggerScreenRequired';
import './CyberLabPage.css';

// Explanation box
function ExplanationBox({ isSecure, children }) {
  return (
    <div className={`cyber-explanation-box mt-8 border-l-4 p-4 rounded-r-lg ${isSecure ? 'border-emerald-500 bg-emerald-950/20' : 'border-red-500 bg-red-950/20'}`} style={{ borderLeft: '4px solid', padding: '16px', borderRadius: '0 12px 12px 0', marginTop: '24px', textAlign: 'left' }}>
      <h4 className="font-bold flex items-center gap-2 mb-2" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, marginBottom: '8px', color: isSecure ? '#3DDC97' : '#FF647C' }}>
        {isSecure ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
        {isSecure ? "How the Fix Works" : "Understanding the Vulnerability"}
      </h4>
      <div className="text-sm text-slate-300 leading-relaxed" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  );
}

// Lab layout wrapper
function LabLayout({ title, isSecure, children }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ textAlign: 'left' }}>
      <div className="mb-6 border-b border-slate-700 pb-4" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '16px', marginBottom: '24px' }}>
        <h1 className="text-3xl font-black mb-2" style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>{title}</h1>
        <p className="text-slate-400" style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
          State: {isSecure ? (
            <span className="text-emerald-400 font-bold bg-emerald-900/30 px-2 py-0.5 rounded" style={{ color: '#3DDC97', background: 'rgba(61, 220, 151, 0.15)', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>Secure & Patched</span>
          ) : (
            <span className="text-red-400 font-bold bg-red-900/30 px-2 py-0.5 rounded" style={{ color: '#FF647C', background: 'rgba(255, 100, 124, 0.15)', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>Vulnerable to Attack</span>
          )}
        </p>
      </div>

      <div className="mb-8">
        {children}
      </div>
    </div>
  );
}

// 1. Cross-Site Scripting (XSS) Lab
import './labs/XssLab.css';

function XSSLab({ isSecure, showAlert }) {
  const [xssType, setXssType] = useState('stored');
  const [simulatedAlert, setSimulatedAlert] = useState(null);

  // Stored State
  const [storedInput, setStoredInput] = useState('');
  const [comments, setComments] = useState([
    { id: 1, text: "Great article!", isVulnerable: true },
    { id: 2, text: "Thanks for sharing.", isVulnerable: true }
  ]);

  // Reflected State
  const [searchQuery, setSearchQuery] = useState('');
  const [reflectedResult, setReflectedResult] = useState(null);

  // DOM State
  const [urlHash, setUrlHash] = useState('WelcomeUser');

  const triggerAlert = (payload) => {
    const payloadMatch = payload.match(/alert\(['"]?(.*?)['"]?\)/);
    const alertText = payloadMatch ? payloadMatch[1] : "XSS Payload Executed!";
    showAlert(`🚨 BROWSER ALERT: ${alertText}. Session Cookie compromised!`, "danger");
    setSimulatedAlert(`🚨 SIMULATED BROWSER ALERT: \n\n${alertText}\n\nSession Cookie: session_id=abc123hacked`);
  };

  const handleStored = (e) => {
    e.preventDefault();
    if (!storedInput) return;
    if (!isSecure && (storedInput.includes('<script>') || storedInput.includes('onload='))) {
      triggerAlert(storedInput);
    }
    setComments([...comments, { id: Date.now(), text: storedInput, isVulnerable: !isSecure }]);
    setStoredInput('');
  };

  const handleReflected = (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    if (!isSecure && (searchQuery.includes('<script>') || searchQuery.includes('onload='))) {
      triggerAlert(searchQuery);
    }
    setReflectedResult({ query: searchQuery, isVulnerable: !isSecure });
  };

  useEffect(() => {
    if (xssType === 'dom' && !isSecure && urlHash.includes('<script>')) {
      triggerAlert(urlHash);
    }
  }, [urlHash, xssType, isSecure]);

  return (
    <LabLayout title="Cross-Site Scripting (XSS)" isSecure={isSecure}>
      <div className="xss-wrapper">
        <div className="xss-header">
          <div className="xss-tabs">
            {['stored', 'reflected', 'dom'].map(t => (
              <button
                key={t}
                onClick={() => { setXssType(t); setSimulatedAlert(null); }}
                className={`xss-tab-btn ${xssType === t ? 'active' : ''}`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="xss-desc" style={{ margin: 0, minHeight: 'auto', flex: 1, paddingLeft: '1rem' }}>
            {xssType === 'stored' && "Stored XSS: The script is saved on the server and executed when victims view the page."}
            {xssType === 'reflected' && "Reflected XSS: The script is embedded in a request and echoed back immediately."}
            {xssType === 'dom' && "DOM-Based XSS: The vulnerability exists purely in the client-side JavaScript execution."}
          </p>
        </div>

        <div className="xss-grid">
          {xssType === 'stored' && (
            <div className="xss-panel">
              <h4 className="xss-panel-title">Comments Section (Database)</h4>
              <div className="xss-comments-list custom-scrollbar">
                {comments.map(c => (
                  <div key={c.id} className="xss-comment">
                    {c.isVulnerable && c.text.includes('<script>') ? (
                      <span className="xss-comment-vuln">[Invisible Script Payload Executed]</span>
                    ) : (
                      c.text
                    )}
                  </div>
                ))}
              </div>
              <form onSubmit={handleStored} className="xss-form">
                <input 
                  type="text" value={storedInput} onChange={(e) => setStoredInput(e.target.value)}
                  placeholder="Write a comment..." className="xss-input"
                />
                <button type="submit" className="xss-btn">Post</button>
              </form>
            </div>
          )}

          {xssType === 'reflected' && (
            <div className="xss-panel">
              <h4 className="xss-panel-title">Search Catalog (URL Parameter)</h4>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                onClick={() => window.open('/challenges/search', '_blank')}
                style={{
                  marginTop: '8px',
                  marginBottom: '16px',
                  textTransform: 'none',
                  fontWeight: 800,
                  borderColor: 'var(--primary-main)',
                  color: 'var(--primary-main)',
                  alignSelf: 'flex-start'
                }}
              >
                🚀 Launch Live Reflected XSS Sandbox Target
              </Button>
              <form onSubmit={handleReflected} className="xss-form" style={{ marginBottom: '1rem', marginTop: 0 }}>
                <input 
                  type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..." className="xss-input"
                />
                <button type="submit" className="xss-btn">Search</button>
              </form>
              {reflectedResult && (
                <div className="xss-result-box">
                  <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>Results for: </span>
                  {reflectedResult.isVulnerable && reflectedResult.query.includes('<script>') ? (
                     <span className="xss-comment-vuln">[Script payload echoed in response...]</span>
                  ) : (
                     <span style={{ fontFamily: isSecure ? 'monospace' : 'inherit', backgroundColor: isSecure ? 'rgba(0,0,0,0.05)' : 'transparent', padding: isSecure ? '2px 4px' : 0 }}>{reflectedResult.query}</span>
                  )}
                  <div style={{ marginTop: '1rem', color: 'var(--text-disabled)', fontStyle: 'italic' }}>No products found.</div>
                </div>
              )}
            </div>
          )}

          {xssType === 'dom' && (
            <div className="xss-panel">
              <h4 className="xss-panel-title">Client-Side Dashboard (URL Hash)</h4>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 700 }}>Simulated URL Fragment (#)</label>
                <input 
                  type="text" value={urlHash} onChange={(e) => setUrlHash(e.target.value)}
                  className="xss-input" style={{ width: '100%', fontFamily: 'monospace' }}
                />
              </div>
              <div className="xss-dom-box">
                <code className="xss-dom-code">document.getElementById('msg').innerHTML = location.hash;</code>
                <div className="xss-dom-msg" id="msg">
                  {!isSecure && urlHash.includes('<script>') ? (
                    <span className="xss-comment-vuln" style={{ fontWeight: 400 }}>Script sink executed...</span>
                  ) : (
                    urlHash
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="xss-terminal">
            <h4 className="xss-term-header"><Terminal size={16} /> Code Execution Context</h4>
            <div className="xss-term-hint">
              Try: <code className="xss-code-tag">&lt;script&gt;alert('hacked')&lt;/script&gt;</code>
            </div>
            {simulatedAlert ? (
              <div className="xss-alert-box">
                <div className="xss-alert-modal">
                  <div className="xss-alert-header">
                    <AlertTriangle size={16} /> Browser Alert
                  </div>
                  <pre className="xss-alert-body">{simulatedAlert}</pre>
                  <button onClick={() => setSimulatedAlert(null)} className="xss-alert-btn">Dismiss</button>
                </div>
              </div>
            ) : (
              <div className="xss-waiting">
                Waiting for script execution...
              </div>
            )}
          </div>
        </div>
      </div>

      <ExplanationBox isSecure={isSecure}>
        {isSecure ? (
          <div>
            <p style={{ marginBottom: '8px' }}><strong>Fix: Output Encoding & Sanitization.</strong> Before displaying untrusted data (or saving it), the application converts special characters into their safe HTML entities or strips unsafe tags. The browser treats it as literal text, preventing execution.</p>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '8px' }}><strong>Flaw: Missing Output Sanitization.</strong> The application injects user input directly into the HTML structure or DOM. When an attacker provides a script tag, the victim's browser blindly executes it in the context of the vulnerable site.</p>
          </div>
        )}
      </ExplanationBox>
    </LabLayout>
  );
}

// 2. SQL Injection (SQLi) Lab
import './labs/SqliLab.css';

const USERS_DB = [
  { id: 1, username: 'admin', password: 'supersecretpassword123', role: 'admin', balance: 50000 },
  { id: 2, username: 'alice', password: 'password123', role: 'user', balance: 1500 },
  { id: 3, username: 'bob', password: 'password456', role: 'user', balance: 200 }
];

function SQLiLab({ isSecure }) {
  const [sqliType, setSqliType] = useState('inband');

  // Inband State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginResult, setLoginResult] = useState(null);

  // Blind State
  const [blindUserId, setBlindUserId] = useState('');
  const [blindResult, setBlindResult] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!isSecure) {
      const isAuthBypass = username.includes("' OR '1'='1") || password.includes("' OR '1'='1");
      if (isAuthBypass) {
        setLoginResult({ success: true, user: USERS_DB[0], message: "Authentication Bypassed! Logged in as Admin." });
      } else {
        const user = USERS_DB.find(u => u.username === username && u.password === password);
        setLoginResult(user ? { success: true, user, message: "Logged in successfully." } : { success: false, message: "Invalid credentials." });
      }
    } else {
      const user = USERS_DB.find(u => u.username === username && u.password === password);
      setLoginResult(user ? { success: true, user, message: "Logged in successfully." } : { success: false, message: "Invalid credentials." });
    }
  };

  const handleBlind = (e) => {
    e.preventDefault();
    if (!isSecure) {
      // Very basic simulation of evaluating SQL conditions for boolean-based blind SQLi
      const bypass = blindUserId.includes("' OR '1'='1") || blindUserId.includes("1=1");
      const validId = USERS_DB.some(u => u.id.toString() === blindUserId);
      setBlindResult(bypass || validId);
    } else {
      const validId = USERS_DB.some(u => u.id.toString() === blindUserId);
      setBlindResult(validId);
    }
  };

  return (
    <LabLayout title="SQL Injection (SQLi)" isSecure={isSecure}>
      <div className="sqli-wrapper">
        <div className="sqli-header">
          <div className="sqli-tabs">
            {['inband', 'blind'].map(t => (
              <button
                key={t} onClick={() => { setSqliType(t); setLoginResult(null); setBlindResult(null); }}
                className={`sqli-tab-btn ${sqliType === t ? 'active' : ''}`}
              >
                {t === 'inband' ? 'In-Band (Auth Bypass)' : 'Blind (Boolean)'}
              </button>
            ))}
          </div>
          <p className="sqli-desc" style={{ margin: 0, minHeight: 'auto', flex: 1, paddingLeft: '1rem' }}>
            {sqliType === 'inband' && "In-Band SQLi: Data is extracted or bypassed using the same channel that was used to inject the SQL code (e.g., authentication bypass)."}
            {sqliType === 'blind' && "Blind SQLi: The application doesn't return data directly, but the attacker infers data by observing behavioral differences (true/false responses)."}
          </p>
        </div>

        <div className="sqli-grid">
          {sqliType === 'inband' ? (
            <div className="sqli-panel">
              <h4 className="sqli-panel-title">Login Portal</h4>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                onClick={() => window.open('/challenges/login', '_blank')}
                style={{
                  marginTop: '8px',
                  marginBottom: '16px',
                  textTransform: 'none',
                  fontWeight: 800,
                  borderColor: 'var(--primary-main)',
                  color: 'var(--primary-main)',
                  alignSelf: 'flex-start'
                }}
              >
                🚀 Launch Live SQLi Sandbox Target
              </Button>
              <form onSubmit={handleLogin} className="sqli-form">
                <div className="sqli-input-group">
                  <label className="sqli-label">Username</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="sqli-input" />
                </div>
                <div className="sqli-input-group">
                  <label className="sqli-label">Password</label>
                  <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="sqli-input" />
                </div>
                <button type="submit" className="sqli-btn">Sign In</button>
              </form>
              <div className="sqli-hint">Try injecting: <code className="sqli-code-tag">' OR '1'='1</code></div>
              {loginResult && (
                <div className={loginResult.success ? 'sqli-result-success' : 'sqli-result-error'}>
                  {loginResult.success ? <CheckCircle size={18} /> : <AlertTriangle size={18} />} {loginResult.message}
                </div>
              )}
            </div>
          ) : (
            <div className="sqli-panel">
              <h4 className="sqli-panel-title">Check User Exists (API)</h4>
              <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--divider)' }}>
                This API only returns True or False. No data is visibly returned.
              </p>
              <form onSubmit={handleBlind} className="sqli-form">
                <div className="sqli-input-group">
                  <label className="sqli-label">User ID to check</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" value={blindUserId} onChange={(e) => setBlindUserId(e.target.value)} className="sqli-input" style={{ flex: 1 }} />
                    <button type="submit" className="sqli-btn" style={{ width: 'auto', marginTop: 0 }}>Verify</button>
                  </div>
                </div>
              </form>
              <div className="sqli-hint">Try injecting: <code className="sqli-code-tag">1' OR '1'='1</code></div>
              {blindResult !== null && (
                <div className={blindResult ? 'sqli-result-success' : 'sqli-result-error'} style={{ padding: '1rem', fontSize: '1.125rem' }}>
                  {blindResult ? '✅ TRUE (User Found)' : '❌ FALSE (Not Found)'}
                </div>
              )}
            </div>
          )}

          <div className="sqli-terminal">
            <h4 className="sqli-term-header"><Terminal size={16} /> Backend Query Execution</h4>
            
            <div className="sqli-query-box">
              {sqliType === 'inband' ? (
                <>
                  <span className="sqli-query-keyword">SELECT</span> * <span className="sqli-query-keyword">FROM</span> users <br/>
                  <span className="sqli-query-keyword">WHERE</span> username = {isSecure ? "'" : <span className="sqli-query-param">'</span>}
                  {!isSecure && <span className="sqli-query-vuln">{username}</span>}
                  {!isSecure && "' "} <br/>
                  <span className="sqli-query-keyword">AND</span> password = {isSecure ? "'" : <span className="sqli-query-param">'</span>}
                  {!isSecure && <span className="sqli-query-vuln">{password}</span>}
                  {!isSecure && "'"}
                </>
              ) : (
                <>
                  <span className="sqli-query-keyword">SELECT</span> count(*) <span className="sqli-query-keyword">FROM</span> users <br/>
                  <span className="sqli-query-keyword">WHERE</span> id = {isSecure ? "'" : <span className="sqli-query-param">?</span>}
                  {!isSecure && <span className="sqli-query-vuln">{blindUserId}</span>}
                  {!isSecure && "'"}
                </>
              )}
            </div>
            <div className="sqli-term-footer">
              {!isSecure ? (
                <span style={{ color: 'var(--danger-main)' }}>⚠️ Vulnerable: The red text modifies the underlying SQL logic due to string concatenation.</span>
              ) : (
                <span style={{ color: 'var(--success-main)' }}>✅ Secure: Using parameterized queries (?) ensures input is treated as literal strings.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <ExplanationBox isSecure={isSecure}>
        {isSecure ? (
          <div>
            <p style={{ marginBottom: '8px' }}><strong>Fix: Parameterized Queries (Prepared Statements).</strong> The database engine treats the user input purely as data, not as executable code. Even if the input contains SQL commands like <code>' OR '1'='1</code>, it searches for a user literally named that, neutralizing the attack.</p>
            <pre className="cyber-lab-terminal" style={{ fontSize: '0.75rem', minHeight: 'auto', background: '#0e111d' }}><code>{`// Secure Node.js/Postgres Example
const query = 'SELECT * FROM users WHERE username = $1 AND password = $2';
const values = [username, password];
await db.query(query, values);`}</code></pre>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '8px' }}><strong>Flaw: String Concatenation.</strong> User input is pasted directly into the database query. An attacker can use quote characters (<code>'</code>) to break out of the intended string and inject new SQL logic, such as appending <code>OR '1'='1'</code>, which always evaluates to true, bypassing the intended checks.</p>
          </div>
        )}
      </ExplanationBox>
    </LabLayout>
  );
}

// 3. Command Injection Lab
function CommandInjectionLab({ isSecure }) {
  const [ip, setIp] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePing = (e) => {
    e.preventDefault();
    if (!ip) return;
    setLoading(true);
    setOutput('');

    setTimeout(() => {
      setLoading(false);
      if (isSecure) {
        const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
        if (ipRegex.test(ip)) {
          setOutput(`PING ${ip} (${ip}) 56(84) bytes of data.\n64 bytes from ${ip}: icmp_seq=1 ttl=117 time=14.2 ms\n64 bytes from ${ip}: icmp_seq=2 ttl=117 time=14.5 ms`);
        } else {
          setOutput(`Error: Invalid IP address format. Allowed characters: numbers and dots only.`);
        }
      } else {
        let simulatedOutput = `PING ${ip.split(';')[0]} 56(84) bytes of data.\n64 bytes from ${ip.split(';')[0]}: icmp_seq=1 ttl=117 time=14.2 ms\n`;
        if (ip.includes('cat /etc/passwd')) {
          simulatedOutput += `\nroot:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nadmin:x:1000:1000::/home/admin:/bin/bash`;
        } else if (ip.includes('ls')) {
          simulatedOutput += `\nindex.php\nconfig.php\nutils.php`;
        }
        setOutput(simulatedOutput);
      }
    }, 600);
  };

  return (
    <LabLayout title="OS Command Injection" isSecure={isSecure}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <div>
          <h3 className="text-lg font-bold mb-2" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>1. Admin Diagnostic Tool</h3>
          <div className="cyber-lab-card">
            <p className="text-sm text-slate-400 mb-4" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Enter an IP address to check network connectivity using the system <code>ping</code> utility.</p>

            <form onSubmit={handlePing} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="e.g. 8.8.8.8"
                className="cyber-lab-input"
                style={{ flex: 1, marginBottom: 0 }}
              />
              <button type="submit" disabled={loading} className="cyber-lab-button" style={{ opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Pinging...' : 'Ping'}
              </button>
            </form>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => setIp('8.8.8.8')} className="cyber-lab-tab-btn" style={{ padding: '6px 12px', fontSize: '0.75rem', border: '1px solid var(--divider)', background: 'var(--background-default)', color: 'var(--text-primary)', borderRadius: '8px' }}>Normal IP</button>
              <button onClick={() => setIp('8.8.8.8; cat /etc/passwd')} className="cyber-lab-tab-btn" style={{ padding: '6px 12px', fontSize: '0.75rem', border: '1px solid #FF647C', background: 'rgba(255,100,124,0.1)', color: '#FF647C', borderRadius: '8px' }}>
                Inject Linux Command (;)
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-2" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>2. Server Terminal</h3>
          <div className="cyber-lab-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '260px' }}>
            <div style={{ background: '#1e293b', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #334155' }}>
              <FileTerminal size={14} style={{ color: '#94a3b8' }} />
              <Typography style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>bash console</Typography>
            </div>
            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#0e111d' }}>
              <div className="cyber-lab-terminal" style={{ flex: 1, background: 'transparent', color: output.includes('root:x:') && !isSecure ? '#ef4444' : '#00ff66' }}>
                <div style={{ color: '#94a3b8', marginBottom: '8px' }}>
                  $ ping -c 2 {isSecure && ip ? <span>{ip.replace(/[^0-9.]/g, '')}</span> : <span style={{ color: ip.includes(';') ? '#ef4444' : '#eab308' }}>{ip}</span>}
                </div>
                {loading ? <span className="animate-pulse" style={{ color: '#cbd5e1' }}>Executing command...</span> : output}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ExplanationBox isSecure={isSecure}>
        {isSecure ? (
          <div>
            <p style={{ marginBottom: '8px' }}><strong>Fix: Input Validation and API Usage.</strong> The server validates the input using a strict Regex to ensure it only contains an IP address. Even better, secure applications avoid calling OS shells entirely, relying on built-in language libraries instead of <code>exec()</code>.</p>
            <pre className="cyber-lab-terminal" style={{ fontSize: '0.75rem', minHeight: 'auto', background: '#0e111d' }}><code>{`// PHP Secure Example
if (filter_var($ip, FILTER_VALIDATE_IP)) {
    // Only execute if perfectly matches an IP
    system("ping -c 2 " . escapeshellarg($ip));
} else {
    echo "Invalid IP";
}`}</code></pre>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '8px' }}><strong>Flaw: Unsafe OS Calls.</strong> The application passes user input directly to a system shell command (like <code>exec("ping " + ip)</code>). Attackers use shell metacharacters like <code>;</code>, <code>|</code>, or <code>&&</code> to terminate the first command and append their own malicious system commands (e.g., reading sensitive files).</p>
          </div>
        )}
      </ExplanationBox>
    </LabLayout>
  );
}

// 4. Cross-Site Request Forgery (CSRF) Lab
import './labs/CsrfLab.css';

function CSRFLab({ isSecure, showAlert }) {
  const [csrfType, setCsrfType] = useState('post');
  const [balance, setBalance] = useState(1500);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => setLogs(prev => [msg, ...prev].slice(0, 5));

  const handleTransfer = (amount, source, method) => {
    if (isSecure && source === 'evil-site') {
      addLog(`❌ Blocked ${method} request: Anti-CSRF Token missing or SameSite strict enforcement.`);
      showAlert("Attack Blocked! Missing or invalid Anti-CSRF token in the request payload.", "info");
      return;
    }
    setBalance(prev => prev - amount);
    addLog(`✅ ${method} Transfer of $${amount} successful. (Triggered by ${source})`);
    if (source === 'evil-site') {
      showAlert(`Uh oh! $${amount} was silently transferred from your account while you were browsing the other site.`, "danger");
    }
  };

  return (
    <LabLayout title="Cross-Site Request Forgery (CSRF)" isSecure={isSecure}>
      <div className="csrf-wrapper">
        <div className="csrf-header">
          <div className="csrf-tabs">
            {['post', 'get'].map(t => (
              <button
                key={t} onClick={() => setCsrfType(t)}
                className={`csrf-tab-btn ${csrfType === t ? 'active' : ''}`}
              >
                {t}-Based
              </button>
            ))}
          </div>
          <p className="csrf-desc" style={{ margin: 0, minHeight: 'auto', flex: 1, paddingLeft: '1rem' }}>
            {csrfType === 'post' && "POST-Based CSRF: Attackers trick victims into submitting state-changing POST requests, often via invisible auto-submitting forms."}
            {csrfType === 'get' && "GET-Based CSRF: A severe design flaw where state-changing actions occur via GET requests, easily exploitable by embedding malicious URLs in image tags."}
          </p>
        </div>

        <div className="csrf-grid">
          <div className="csrf-panel">
            <div className="csrf-bank-header"><Lock size={14} /> https://mybank.com (Tab 1)</div>
            <div className="csrf-bank-body">
              <h4 className="csrf-bank-title">Welcome, Alice</h4>
              <div className="csrf-bank-balance-box">
                <div className="csrf-bank-balance-label">Account Balance</div>
                <div className="csrf-bank-balance-value">${balance}.00</div>
              </div>
              <button onClick={() => handleTransfer(10, 'mybank.com', csrfType.toUpperCase())} className="csrf-bank-btn">
                Simulate Legitimate Transfer ($10)
              </button>
            </div>
          </div>

          <div className="csrf-evil-panel">
            <div className="csrf-evil-header"><Globe size={14} /> https://evil-site.com (Tab 2)</div>
            <div className="csrf-evil-body">
              {csrfType === 'post' ? (
                <>
                  <h4 className="csrf-evil-title">🎉 You won an iPhone! 🎉</h4>
                  <button onClick={() => handleTransfer(500, 'evil-site', 'POST')} className="csrf-evil-btn">
                    CLAIM PRIZE NOW
                  </button>
                  <div className="csrf-evil-hint">Hidden Form: POST to /transfer<br/>(Fires automatically in background)</div>
                </>
              ) : (
                <>
                  <h4 className="csrf-evil-title" style={{ color: '#cbd5e1' }}>Cute Cats Forum</h4>
                  <div className="csrf-forum-post">
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>[Invisible Zero-Pixel Image]</span><br/>
                    <code className="csrf-forum-code">&lt;img src="mybank.com/transfer?amount=500"/&gt;</code>
                  </div>
                  <button onClick={() => handleTransfer(500, 'evil-site', 'GET')} className="csrf-forum-btn">
                    Load Forum Post
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="csrf-logs">
          <div className="csrf-logs-title">Server Activity Logs:</div>
          {logs.length === 0 && <span style={{ color: '#475569', fontStyle: 'italic' }}>No activity yet.</span>}
          {logs.map((log, i) => (
            <div key={i} className={log.includes('Blocked') ? 'csrf-log-item-error' : 'csrf-log-item-success'}>{'>'} {log}</div>
          ))}
        </div>
      </div>

      <ExplanationBox isSecure={isSecure}>
        {isSecure ? (
          <div>
            <p style={{ marginBottom: '8px' }}><strong>Fix: Anti-CSRF Tokens & SameSite Cookies.</strong> The server generates a unique, unpredictable token when the bank page loads. The browser must submit this token with the transfer request. The attacker site cannot read this token (due to the Same-Origin Policy) and thus cannot forge a valid request. Additionally, SameSite cookie attributes prevent the browser from sending session cookies with cross-site requests.</p>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '8px' }}><strong>Flaw: Unpredictable Requests Trusted.</strong> Browsers automatically include session cookies with requests sent to a domain, even if the request originated from a *different* domain. The bank relies entirely on the cookie for authentication and assumes the user intended to make the transfer triggered by the attacker's hidden form or image tag.</p>
          </div>
        )}
      </ExplanationBox>
    </LabLayout>
  );
}

// 5. Broken Access Control Lab
import './labs/AccessControlLab.css';

const MOCK_DOCS = [
  { id: 1, title: 'Public Welcome Guide', content: 'Welcome to our platform! Here are the public rules...', isSensitive: false },
  { id: 2, title: 'Company Financials 2024 (Internal)', content: 'Q1 Revenue: $2.4M\nQ2 Projection: $3.1M\nConfidential.', isSensitive: true },
  { id: 3, title: 'Admin Master Passwords', content: 'DB: prod_db_xyz123\nAPI_KEY: ak_live_998877\nAWS: AKIA...', isSensitive: true }
];

function AccessControlLab({ isSecure }) {
  const [acType, setAcType] = useState('idor');
  const [profileId, setProfileId] = useState('1');
  const loggedInUserId = '1';

  const profiles = {
    '1': { name: 'Alice (You)', role: 'Standard User', email: 'alice@example.com', sensitive: 'Credit Card: **** 1234' },
    '2': { name: 'Bob', role: 'Standard User', email: 'bob@example.com', sensitive: 'Credit Card: **** 5678' },
    '3': { name: 'Administrator', role: 'Super Admin', email: 'admin@system.local', sensitive: 'Server API Key: xyz_9999_abc' }};

  const getProfileDisplay = () => {
    if (!profiles[profileId]) return <div style={{ color: 'var(--text-disabled)', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>User not found</div>;

    if (isSecure && profileId !== loggedInUserId) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: 'rgba(255, 100, 124, 0.08)', border: '1.5px solid #FF647C', borderRadius: '12px', marginTop: '20px' }}>
          <Lock style={{ color: '#FF647C', width: '48px', height: '48px', marginBottom: '12px' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FF647C', margin: '0 0 4px 0' }}>403 Forbidden</h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.85rem', margin: 0 }}>
            Access Denied. You do not have permission to view other users' private profiles.
          </p>
        </div>
      );
    }

    const p = profiles[profileId];
    return (
      <div style={{ marginTop: '20px', padding: '24px', backgroundColor: 'var(--background-default)', borderRadius: '12px', border: '1px solid var(--divider)'}}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: profileId === loggedInUserId ? 'var(--primary-main)' : 'var(--info-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: 800 }}>
            {p.name.charAt(0)}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{p.name}</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', backgroundColor: 'rgba(0,0,0,0.1)', padding: '2px 8px', borderRadius: '12px' }}>{p.role}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--divider)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--text-disabled)', width: '80px' }}>Email:</span>
            <span style={{ color: 'var(--text-primary)' }}>{p.email}</span>
          </div>
          <div style={{ display: 'flex' }}>
             <span style={{ color: 'var(--text-disabled)', width: '80px' }}>Private:</span>
             <span style={{ color: profileId !== loggedInUserId && !isSecure ? '#FF647C' : 'var(--text-primary)', fontWeight: profileId !== loggedInUserId && !isSecure ? 'bold' : 'normal' }}>
               {p.sensitive}
               {profileId !== loggedInUserId && !isSecure && <span style={{ display: 'block', marginTop: '4px', fontSize: '0.75rem' }}>⚠️ EXPOSED VIA IDOR</span>}
             </span>
          </div>
        </div>
      </div>
    );
  };

  const [adminActionStatus, setAdminActionStatus] = useState(null);
  const [requestedRole, setRequestedRole] = useState('user');
  const [aliceRole, setAliceRole] = useState('user');

  const executeProfileUpdate = (e) => {
    e.preventDefault();
    if (isSecure) {
      setAdminActionStatus({ success: false, msg: 'Role update ignored. Server determines role based on session.' });
      setAliceRole('user'); 
    } else {
      setAliceRole(requestedRole);
      if (requestedRole === 'admin') {
        setAdminActionStatus({ success: true, msg: '⚠️ PRIVILEGE ESCALATION EXPLOITED: Role updated to admin!' });
      } else {
        setAdminActionStatus({ success: true, msg: 'Profile updated successfully.' });
      }
    }
  };

  return (
    <LabLayout title="Broken Access Control" isSecure={isSecure}>
      <div className="ac-wrapper">
        <div className="ac-header">
          <div className="ac-tabs">
            {['idor', 'priv-escalation'].map(t => (
              <button
                key={t} onClick={() => { setAcType(t); setProfileId('1'); setAdminActionStatus(null); }}
                className={`ac-tab-btn ${acType === t ? 'active' : ''}`}
              >
                {t === 'idor' ? 'IDOR' : 'Privilege Escalation'}
              </button>
            ))}
          </div>
          <p className="ac-desc" style={{ margin: 0, minHeight: 'auto', flex: 1, paddingLeft: '1rem' }}>
            {acType === 'idor' && "Insecure Direct Object Reference (IDOR): A user can access other users' data or private resources by simply guessing or modifying the requested object ID."}
            {acType === 'priv-escalation' && "Vertical Privilege Escalation: A standard user discovers a way to access functions or URLs reserved for administrators."}
          </p>
        </div>

        <div className={`ac-grid ${acType === 'idor' ? 'ac-grid-horizontal' : 'ac-grid-vertical'}`} style={acType === 'idor' ? { display: 'block' } : {}}>
          {acType === 'idor' ? (
            <div className="cyber-browser-mock" style={{ width: '50%', margin: '0 auto', minHeight: '380px', backgroundColor: 'var(--background-paper)', border: '1px solid var(--divider)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '12px', display: 'flex', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--divider)' }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={() => window.open('/challenges/files', '_blank')}
                  style={{
                    textTransform: 'none',
                    fontWeight: 800,
                    borderColor: 'var(--primary-main)',
                    color: 'var(--primary-main)',
                    width: '100%'
                  }}
                >
                  🚀 Launch Live IDOR Sandbox Target
                </Button>
              </div>
              <div className="cyber-browser-header" style={{ background: 'var(--background-default)', color: 'var(--text-primary)', borderBottom: '1px solid var(--divider)', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Browser URL:</span>
                 <div style={{ display: 'flex', background: 'var(--background-default)', border: '1px solid var(--divider)', borderRadius: '6px', overflow: 'hidden', flex: 1 }}>
                    <span style={{ background: 'rgba(0,0,0,0.15)', color: 'var(--text-secondary)', padding: '4px 8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>https://app.com/profile?id=</span>
                    <input 
                      type="number" 
                      value={profileId}
                      onChange={(e) => setProfileId(e.target.value)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--primary-main)',
                        fontWeight: 'bold',
                        padding: '4px 8px',
                        width: '100%',
                        outline: 'none'
                      }}
                    />
                 </div>
              </div>
              <div className="cyber-browser-content" style={{ padding: '24px' }}>
                {getProfileDisplay()}
              </div>
            </div>
          ) : (
            <>
              <div className="ac-panel ac-panel-dark">
                <h4 className="ac-panel-title" style={{ color: '#fff', marginBottom: '1.5rem', borderBottom: 'none' }}>Edit Profile API</h4>
                <form onSubmit={executeProfileUpdate} className="ac-form">
                  <div>
                    <label className="ac-label">Username (Read-only)</label>
                    <input type="text" value="alice" readOnly className="ac-input" style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                  </div>
                  <div>
                    <label className="ac-label">Requested Role</label>
                    <select value={requestedRole} onChange={(e) => setRequestedRole(e.target.value)} className="ac-select">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div className="ac-code-box" style={{ marginTop: '0.5rem', marginBottom: '1rem', whiteSpace: 'pre' }}>
                    <span style={{ color: '#94a3b8' }}>POST /api/profile</span><br/>
                    <span style={{ color: '#f8fafc' }}>{`{ "username": `}</span>
                    <span style={{ color: 'var(--success-main)' }}>"alice"</span>
                    <span style={{ color: '#f8fafc' }}>{`, "role": `}</span>
                    <span style={{ color: 'var(--success-main)' }}>"{requestedRole}"</span>
                    <span style={{ color: '#f8fafc' }}>{` }`}</span>
                  </div>

                  <button type="submit" className="ac-btn" style={{ width: '100%' }}>
                    Submit Request
                  </button>
                </form>
                {adminActionStatus && (
                  <div className={`ac-success-msg ${adminActionStatus.success && aliceRole === 'admin' ? 'danger' : 'user'}`} style={adminActionStatus.success && aliceRole === 'admin' ? { backgroundColor: 'rgba(255, 100, 124, 0.1)', color: 'var(--danger-main)', borderColor: 'var(--danger-main)' } : {}}>
                    {adminActionStatus.msg}
                  </div>
                )}
              </div>

              <div className="ac-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
                <div className="ac-role-display">
                  {aliceRole === 'admin' ? (
                     <ShieldCheck size={80} className="ac-profile-icon" style={{ color: '#c084fc', margin: '0 auto 1.5rem' }} />
                  ) : (
                     <User size={80} className="ac-profile-icon" style={{ color: 'var(--primary-main)', margin: '0 auto 1.5rem' }} />
                  )}
                  <div className="ac-role-title" style={{ color: '#334155' }}>Current Active Role</div>
                  <div className={`ac-role-badge ${aliceRole === 'admin' ? 'ac-role-admin' : 'ac-role-user'}`} style={{ color: aliceRole === 'admin' ? '#c084fc' : 'var(--primary-main)' }}>
                    {aliceRole.toUpperCase()}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <ExplanationBox isSecure={isSecure}>
        {isSecure ? (
          <div>
            <p style={{ marginBottom: '8px' }}><strong>Fix: Server-Side Authorization Checks.</strong> Never trust the client to restrict its own access. The server must check the active session to see *who* is logged in, and explicitly verify if that specific user has the required rights or roles to view the requested resource ID or execute the function.</p>
            <pre className="cyber-lab-terminal" style={{ fontSize: '0.75rem', minHeight: 'auto', background: '#0e111d' }}><code>{`// Secure Logic (Node.js/Express)
app.get('/api/doc/:id', (req, res) => {
    const requestedId = req.params.id;
    const user = req.session.user; // Authenticated user
    
    // Check if user owns the document or is admin
    if (!hasPermission(user, requestedId) && user.role !== 'admin') {
        return res.status(403).send("Forbidden");
    }
    return db.getDocument(requestedId);
});`}</code></pre>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '8px' }}><strong>Flaw: Missing Access Controls.</strong> The application fetches database records based entirely on the <code>id</code> parameter in the URL (IDOR) or exposes admin API endpoints without verifying the user's role on the server. It checks *if* you are logged in, but fails to check *who* you are allowed to look at or what you are allowed to do.</p>
          </div>
        )}
      </ExplanationBox>
    </LabLayout>
  );
}

import { useSearchParams } from 'react-router-dom';

// Main App Component
export default function CyberLabPage() {
  return (
    <BiggerScreenRequired pageName="The Cybersecurity Lab">
      <CyberLabContent />
    </BiggerScreenRequired>
  );
}

function CyberLabContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'xss');
  const [isSecure, setIsSecure] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: 'info' });

  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true });
  }, [activeTab, setSearchParams]);

  const showAlert = (message, type = 'danger') => {
    setAlertConfig({ show: true, message, type });
  };

  const closeAlert = () => {
    setAlertConfig({ show: false, message: '', type: 'info' });
  };

  const tabs = [
    { id: 'xss', name: 'XSS Lab', icon: <Code size={16} /> },
    { id: 'sqli', name: 'SQL Injection', icon: <Database size={16} /> },
    { id: 'cmd', name: 'Command Injection', icon: <Terminal size={16} /> },
    { id: 'csrf', name: 'CSRF Lab', icon: <Globe size={16} /> },
    { id: 'auth', name: 'Access Control', icon: <KeyRound size={16} /> },
    { id: 'ransomware', name: 'Ransomware', icon: <Lock size={16} /> },
    { id: 'social', name: 'Social Engineering', icon: <User size={16} /> },
    { id: 'insider', name: 'Insider Threat', icon: <UserX size={16} /> },
    { id: 'dos', name: 'DoS Lab', icon: <Activity size={16} /> },
    { id: 'ddos', name: 'DDoS Lab', icon: <Activity size={16} /> },
    { id: 'caesar', name: 'Caesar Cipher', icon: <Lock size={16} /> },
    { id: 'vigenere', name: 'Vigenère Cipher', icon: <Lock size={16} /> },
    { id: 'enigma', name: 'Enigma Machine', icon: <Lock size={16} /> },
    { id: 'rsa', name: 'RSA Visualizer', icon: <Lock size={16} /> },
    { id: 'base64', name: 'Base64 Visualizer', icon: <Activity size={16} /> },
    { id: 'xor', name: 'XOR Cipher', icon: <Activity size={16} /> },
    { id: 'cyberchef', name: 'CyberChef', icon: <Wrench size={16} /> },
    { id: 'gtfobins', name: 'GTFOBins', icon: <TerminalSquare size={16} /> },
    { id: 'revshells', name: 'Reverse Shells', icon: <MonitorPlay size={16} /> },
    { id: 'jwt', name: 'JWT Decoder', icon: <Key size={16} /> },
    { id: 'explainshell', name: 'ExplainShell', icon: <HelpCircle size={16} /> },
    { id: 'challenge', name: 'Google XSS Challenge', icon: <Activity size={16} /> }
  ];

  return (
    <div className="cyber-lab-container">
      {/* Sidebar Navigation */}
      <div className="cyber-lab-sidebar">
        <div className="cyber-lab-sidebar-header">
          <Activity size={20} />
          <span>Cyber SecLab</span>
        </div>

        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setIsSecure(false); // Reset to vulnerable on tab change
              closeAlert();
            }}
            className={`cyber-lab-tab-btn ${activeTab === tab.id ? 'is-active' : ''}`}
          >
            {tab.icon}
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="cyber-lab-content-area">
        {/* Top Bar with Security Toggle (disabled on challenge tab) */}
        <div className="cyber-lab-topbar">
          <h2 className="cyber-lab-title">
            {tabs.find(t => t.id === activeTab)?.name} Console
          </h2>

          {['xss', 'sqli', 'cmd', 'csrf', 'auth'].includes(activeTab) && (
            <div className="cyber-lab-security-toggle">
              <button
                onClick={() => setIsSecure(false)}
                className={`cyber-lab-toggle-btn vuln ${!isSecure ? 'active' : ''}`}
              >
                <ShieldAlert size={14} /> Vulnerable
              </button>
              <button
                onClick={() => setIsSecure(true)}
                className={`cyber-lab-toggle-btn secure ${isSecure ? 'active' : ''}`}
              >
                <ShieldCheck size={14} /> Secure
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Lab Content */}
        <div className="cyber-lab-body">
          {activeTab === 'xss' && <XSSLab isSecure={isSecure} showAlert={showAlert} />}
          {activeTab === 'sqli' && <SQLiLab isSecure={isSecure} />}
          {activeTab === 'cmd' && <CommandInjectionLab isSecure={isSecure} />}
          {activeTab === 'csrf' && <CSRFLab isSecure={isSecure} showAlert={showAlert} />}
          {activeTab === 'auth' && <AccessControlLab isSecure={isSecure} />}
          {activeTab === 'ransomware' && <RansomwareLab />}
          {activeTab === 'social' && <SocialEngineeringLab />}
          {activeTab === 'insider' && <InsiderThreatLab />}
          {activeTab === 'dos' && <div style={{ transform: 'scale(0.9)', transformOrigin: 'top center' }}><DenialOfServiceLab /></div>}
          {activeTab === 'ddos' && <div style={{ transform: 'scale(0.9)', transformOrigin: 'top center' }}><DistributedDenialOfServiceLab /></div>}
          {activeTab === 'caesar' && <div style={{ transform: 'scale(0.9)', transformOrigin: 'top center' }}><CaesarCipherExplorer /></div>}
          {activeTab === 'vigenere' && <div style={{ transform: 'scale(0.9)', transformOrigin: 'top center' }}><VigenereCipherExplorer /></div>}
          {activeTab === 'enigma' && <div style={{ transform: 'scale(0.9)', transformOrigin: 'top center' }}><EnigmaMachine /></div>}
          {activeTab === 'rsa' && <div style={{ transform: 'scale(0.9)', transformOrigin: 'top center' }}><RSAVisualizer /></div>}
          {activeTab === 'base64' && <div style={{ transform: 'scale(0.9)', transformOrigin: 'top center' }}><Base64Visualizer /></div>}
          {activeTab === 'xor' && <div style={{ transform: 'scale(0.9)', transformOrigin: 'top center' }}><XORVisualizer /></div>}
          {['cyberchef', 'gtfobins', 'revshells', 'jwt', 'explainshell'].includes(activeTab) && (
            <div style={{ width: '100%', height: '800px', backgroundColor: 'var(--background-paper)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--divider)' }}>
              <iframe 
                src={
                  activeTab === 'cyberchef' ? 'https://gchq.github.io/CyberChef/' :
                  activeTab === 'gtfobins' ? 'https://gtfobins.github.io/' :
                  activeTab === 'revshells' ? 'https://www.revshells.com/' :
                  activeTab === 'jwt' ? 'https://jwt.io/' :
                  'https://explainshell.com/'
                }
                title={activeTab} 
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          )}
          {activeTab === 'challenge' && <ChallengePage />}
        </div>
      </div>

      {/* Custom Alert Modal */}
      {alertConfig.show && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, backdropFilter: 'blur(4px)', padding: '16px' }}>
          <Paper style={{ backgroundColor: 'var(--background-paper)', padding: '24px', borderRadius: '16px', border: alertConfig.type === 'danger' ? '1.5px solid #FF647C' : '1.5px solid var(--primary-main)', maxWidth: '360px', width: '100%'}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              {alertConfig.type === 'danger' ? (
                <ShieldAlert style={{ color: '#FF647C', width: '32px', height: '32px' }} />
              ) : (
                <Activity style={{ color: 'var(--primary-main)', width: '32px', height: '32px' }} />
              )}
              <Typography variant="h6" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Browser Pop-up</Typography>
            </div>
            <p style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--divider)', color: 'var(--text-primary)', wordBreak: 'break-all', fontSize: '0.85rem', marginBottom: '24px', textAlign: 'center' }}>
              {alertConfig.message}
            </p>
            <Button
              fullWidth
              variant="contained"
              onClick={closeAlert}
              style={{ background: 'var(--hero-gradient)', color: '#fff', fontWeight: 800, borderRadius: '8px', height: '40px' }}
            >
              Close Alert
            </Button>
          </Paper>
        </div>
      )}
    </div>
  );
}
