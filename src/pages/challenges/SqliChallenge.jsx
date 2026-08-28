import React, { useState, useEffect } from 'react';
import { 
  Shield, ShieldAlert, ShieldCheck, Terminal, Database, Code, Globe, 
  KeyRound, Activity, Lock, User, Info, ArrowRight, CheckCircle2, 
  AlertTriangle, Layers, Users, FileText, Settings, HelpCircle, X, 
  ChevronRight, MessageSquare, LogOut, HeartHandshake, Building2
} from 'lucide-react';
import './challenges.css';

export default function SqliChallenge() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'about', 'contact', 'portal'
  const [dashTab, setDashTab] = useState('overview'); // 'overview', 'users', 'logs', 'settings'

  // Input & API States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusCode, setStatusCode] = useState(null);

  // Contact form States
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  // DevTools / Assistant Panel State
  const [isAssistantOpen, setIsAssistantOpen] = useState(true);
  const [assistantTab, setAssistantTab] = useState('objectives'); // 'objectives', 'query', 'logs', 'hints'
  const [httpLogs, setHttpLogs] = useState([]);
  const [openHintIdx, setOpenHintIdx] = useState(null);

  const isSuccess = statusCode === 201 || statusCode === 200;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    setStatusCode(null);

    const payloadObj = { username, password };

    try {
      const res = await fetch('/challenges/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadObj),
      });

      const status = res.status;
      setStatusCode(status);

      let data;
      try {
        data = await res.json();
      } catch {
        data = { error: 'Non-JSON response from server' };
      }

      setResponse(data);

      // Log request in HTTP Logs
      setHttpLogs(prev => [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          method: 'POST',
          url: '/challenges/login',
          payload: JSON.stringify(payloadObj, null, 2),
          status: status,
          isSuccess: status >= 200 && status < 300,
          response: JSON.stringify(data, null, 2)
        },
        ...prev
      ]);

      if (status >= 200 && status < 300) {
        // Automatically switch to overview tab in dashboard
        setDashTab('overview');
      }
    } catch (err) {
      setStatusCode(0);
      const errMsg = { error: 'Network error — is the NestJS backend running?' };
      setResponse(errMsg);

      setHttpLogs(prev => [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          method: 'POST',
          url: '/challenges/login',
          payload: JSON.stringify(payloadObj, null, 2),
          status: 0,
          isSuccess: false,
          response: JSON.stringify(errMsg, null, 2)
        },
        ...prev
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUsername('');
    setPassword('');
    setResponse(null);
    setStatusCode(null);
    setActiveTab('portal');
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setContactName('');
      setContactEmail('');
      setContactMsg('');
    }, 3000);
  };

  // Live SQL Query string building
  const getSqlQueryMarkup = () => {
    return (
      <>
        <span className="sql-keyword">SELECT</span> * <span className="sql-keyword">FROM</span> security_challenges.challenge_users<br />
        <span className="sql-keyword">WHERE</span> username = '<span className="sql-input-hl">{username || 'your_input'}</span>'<br />
        <span className="sql-keyword">AND</span> password = '<span className="sql-input-hl">{password || 'your_input'}</span>'
      </>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* 1. TARGET APP NAVBAR (Apex Global Solutions) */}
      <nav className="apex-navbar">
        <div 
          className="apex-brand" 
          onClick={() => { if(!isSuccess) setActiveTab('home'); }} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: !isSuccess ? 'pointer' : 'default' }}
        >
          <Shield style={{ color: 'var(--primary)', fill: 'rgba(61,92,255,0.1)' }} size={24} />
          APEX GLOBAL SOLUTIONS
        </div>
        {!isSuccess && (
          <>
            <div className="apex-nav-links">
              <button 
                className={`apex-nav-link ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => setActiveTab('home')}
              >
                Home
              </button>
              <button 
                className={`apex-nav-link ${activeTab === 'solutions' ? 'active' : ''}`}
                onClick={() => setActiveTab('solutions')}
              >
                Solutions
              </button>
              <button 
                className={`apex-nav-link ${activeTab === 'contact' ? 'active' : ''}`}
                onClick={() => setActiveTab('contact')}
              >
                Contact Us
              </button>
            </div>
            <button 
              className="apex-portal-nav-btn"
              onClick={() => setActiveTab('portal')}
            >
              Client Portal
            </button>
          </>
        )}
        {isSuccess && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--success)', fontWeight: 'bold' }}>
            <ShieldCheck size={16} />
            SECURE SESSION ACTIVE
          </div>
        )}
      </nav>

      {/* 2. MAIN APP CONTENT CONTAINER */}
      <main className="apex-content-area">
        <div>
          {!isSuccess ? (
            /* Corporate website pages depending on activeTab */
            <div className="animate-in fade-in duration-300">
              {activeTab === 'home' && (
                <div className="apex-tab-content">
                  <section className="apex-hero">
                    <div className="hero-left">
                      <h1>Next-Gen Enterprise Infrastructure</h1>
                      <p>
                        Securing, scaling, and optimizing digital assets for global market leaders. 
                        We build robust database solutions and end-to-end cloud protection architectures.
                      </p>
                      <div className="hero-buttons">
                        <button className="apex-btn-primary" onClick={() => setActiveTab('solutions')}>
                          Explore Solutions
                        </button>
                        <button className="apex-btn-secondary" onClick={() => setActiveTab('contact')}>
                          Contact Consultant
                        </button>
                      </div>
                    </div>
                    <div className="hero-right-visual">
                      <div className="visual-grid">
                        <div className="visual-card">
                          <Globe className="visual-card-icon" />
                          <h4>Anywhere</h4>
                        </div>
                        <div className="visual-card">
                          <Lock className="visual-card-icon" />
                          <h4>Secure</h4>
                        </div>
                        <div className="visual-card">
                          <Activity className="visual-card-icon" />
                          <h4>Reliable</h4>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="apex-stats-strip">
                    <div className="stat-item">
                      <span className="stat-num">99.999%</span>
                      <span className="stat-lbl">Uptime SLA Guarantee</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-num">250+</span>
                      <span className="stat-lbl">Enterprise Customers</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-num">12+</span>
                      <span className="stat-lbl">Global Offices</span>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'solutions' && (
                <div className="apex-tab-content">
                  <div className="section-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2>Our Services & Solutions</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Designed to scale securely under extreme loads</p>
                  </div>
                  <div className="services-grid" style={{ marginTop: '30px' }}>
                    <div className="service-item-card">
                      <div className="service-icon-box">
                        <Database size={24} style={{ color: 'var(--primary)' }} />
                      </div>
                      <h3 className="service-card-title">Database Hardening</h3>
                      <p className="service-card-desc">
                        Strict query sanitization, optimized indexing, and robust encryption policies to protect tables from unauthorized intrusions.
                      </p>
                    </div>
                    <div className="service-item-card">
                      <div className="service-icon-box">
                        <ShieldCheck size={24} style={{ color: 'var(--primary)' }} />
                      </div>
                      <h3 className="service-card-title">Intrusion Prevention</h3>
                      <p className="service-card-desc">
                        Real-time heuristic analysis and automated firewall filters to mitigate malicious traffic patterns at the gateway level.
                      </p>
                    </div>
                    <div className="service-item-card">
                      <div className="service-icon-box">
                        <Activity size={24} style={{ color: 'var(--primary)' }} />
                      </div>
                      <h3 className="service-card-title">Infrastructure Monitoring</h3>
                      <p className="service-card-desc">
                        Live cluster health audits, query latency tracing, and automated scale actions for serverless deployment instances.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="apex-tab-content">
                  <div className="section-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2>Get in Touch</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Connect with a corporate security systems architect today</p>
                  </div>
                  {contactSuccess ? (
                    <div className="contact-success-card animate-in zoom-in duration-200">
                      <CheckCircle2 size={48} className="success-check-icon" style={{ color: 'var(--success)', marginBottom: '16px' }} />
                      <h3>Message Received Successfully</h3>
                      <p style={{ color: 'var(--text-muted)' }}>Thank you for reaching out. One of our consultants will contact you shortly.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="apex-contact-form">
                      <div className="input-field-group">
                        <label htmlFor="contact-name">Full Name</label>
                        <input 
                          id="contact-name"
                          type="text" 
                          className="apex-input-text" 
                          required
                          placeholder="Your name..."
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                        />
                      </div>
                      <div className="input-field-group">
                        <label htmlFor="contact-email">Email Address</label>
                        <input 
                          id="contact-email"
                          type="email" 
                          className="apex-input-text" 
                          required
                          placeholder="your.email@domain.com"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                        />
                      </div>
                      <div className="input-field-group">
                        <label htmlFor="contact-msg">Message Details</label>
                        <textarea 
                          id="contact-msg"
                          rows={4}
                          className="apex-input-text" 
                          required
                          style={{ resize: 'vertical', fontFamily: 'inherit' }}
                          placeholder="Explain your infrastructure scale or security requirements..."
                          value={contactMsg}
                          onChange={(e) => setContactMsg(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="apex-btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                        Send Message
                      </button>
                    </form>
                  )}
                </div>
              )}

              {activeTab === 'portal' && (
                <div className="apex-login-container">
                  <div className="apex-login-card animate-in fade-in slide-in-from-bottom-4">
                    <div className="apex-login-header">
                      <div className="login-icon-box">
                        <Lock size={20} />
                      </div>
                      <h2>Portal Authentication</h2>
                      <p>Access database logs, metrics, and administration tools</p>
                    </div>
                    <form onSubmit={handleLogin} className="apex-login-form">
                      <div className="input-field-group">
                        <label htmlFor="user-id">Username / ID</label>
                        <input 
                          id="user-id"
                          type="text" 
                          className="apex-input-text" 
                          placeholder="Enter email or username..." 
                          autoComplete="off"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                      <div className="input-field-group">
                        <label htmlFor="pass-id">Password</label>
                        <input 
                          id="pass-id"
                          type="password" 
                          className="apex-input-text" 
                          placeholder="Enter secure password..."
                          autoComplete="off"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          * Inputs directly feed into raw database query concatenation on backend.
                        </span>
                      </div>

                      {statusCode !== null && !isSuccess && (
                        <div className="login-error-alert">
                          <AlertTriangle size={16} />
                          <span>Authentication Failed. Status Code: {statusCode}. {response?.message || 'Check inputs.'}</span>
                        </div>
                      )}

                      <button 
                        type="submit" 
                        className="apex-btn-primary" 
                        style={{ width: '100%', marginTop: '8px' }}
                        disabled={loading}
                      >
                        {loading ? 'Validating credentials...' : 'Authenticate Account'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Admin Dashboard Panel */
              <div className="apex-dashboard animate-in fade-in duration-300">
                {/* Sidebar Navigation */}
                <div className="dash-sidebar">
                  <div className="dash-sidebar-header">
                    <h3>DB Management</h3>
                  </div>
                  <button 
                    className={`dash-nav-btn ${dashTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setDashTab('overview')}
                  >
                    <Layers size={16} /> Overview
                  </button>
                  <button 
                    className={`dash-nav-btn ${dashTab === 'users' ? 'active' : ''}`}
                    onClick={() => setDashTab('users')}
                  >
                    <Users size={16} /> User Directory
                  </button>
                  <button 
                    className={`dash-nav-btn ${dashTab === 'logs' ? 'active' : ''}`}
                    onClick={() => setDashTab('logs')}
                  >
                    <FileText size={16} /> System Audit Logs
                  </button>
                  <button 
                    className={`dash-nav-btn ${dashTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setDashTab('settings')}
                  >
                    <Settings size={16} /> Database Settings
                  </button>
                  <button 
                    className="dash-nav-btn" 
                    onClick={handleLogout}
                    style={{ marginTop: 'auto', color: 'var(--danger)' }}
                  >
                    <LogOut size={16} /> Terminate Session
                  </button>
                </div>

                {/* Main Content Pane */}
                <div className="dash-main-pane">
                  
                  {/* OVERVIEW PANEL */}
                  {dashTab === 'overview' && (
                    <div>
                      <div className="dash-pane-header">
                        <h2>System Dashboard</h2>
                      </div>
                      
                      {/* SQLi Exploit Success */}
                      <div className="success-banner-gold">
                        <div className="banner-title">
                          <ShieldCheck size={20} />
                          SQL INJECTION BYPASS CONFIRMED
                        </div>
                        <div className="banner-desc">
                          Successfully manipulated queries to authenticate without credentials. Seeded Admin user session instantiated. Take note of the lab verification flag below:
                        </div>
                        <div className="flag-box">
                          FLAG{SQL_INJECTION_BYPASS_SUCCESS}
                        </div>
                      </div>

                      <div className="dashboard-stats-grid">
                        <div className="stat-widget-card">
                          <div className="stat-label">Active Database Connections</div>
                          <div className="stat-value">14 / min</div>
                        </div>
                        <div className="stat-widget-card">
                          <div className="stat-label">CPU Core Usage</div>
                          <div className="stat-value">4.8%</div>
                        </div>
                        <div className="stat-widget-card">
                          <div className="stat-label">DB Engine Health</div>
                          <div className="stat-value" style={{ color: 'var(--success)' }}>100%</div>
                        </div>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '10px' }}>Node Environment Details</h4>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          Running NestJS / TypeORM backend. Query routing directly queries raw columns within schema <code>security_challenges</code>.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* USER DIRECTORY PANEL */}
                  {dashTab === 'users' && (
                    <div>
                      <div className="dash-pane-header">
                        <h2>User Directory</h2>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        Database tables pulled live from backend repository values. 
                      </p>
                      <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                        <table className="dash-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Username</th>
                              <th>Password (Plaintext)</th>
                              <th>Access Privilege</th>
                              <th>Department</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td><code>1</code></td>
                              <td><strong>admin</strong></td>
                              <td><code>super_secret_p4ss</code></td>
                              <td><span className="role-badge-admin">Admin</span></td>
                              <td>Core Infrastructure</td>
                            </tr>
                            <tr>
                              <td><code>2</code></td>
                              <td>guest</td>
                              <td><code>guest</code></td>
                              <td><span className="role-badge-user">User</span></td>
                              <td>External Access</td>
                            </tr>
                            <tr>
                              <td><code>3</code></td>
                              <td>hr_lead</td>
                              <td><code>password_hr_992</code></td>
                              <td><span className="role-badge-user">User</span></td>
                              <td>Human Resources</td>
                            </tr>
                            <tr>
                              <td><code>4</code></td>
                              <td>dev_lead</td>
                              <td><code>dev_master_key_88</code></td>
                              <td><span className="role-badge-user">User</span></td>
                              <td>Product Engineering</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* SYSTEM AUDIT LOGS */}
                  {dashTab === 'logs' && (
                    <div>
                      <div className="dash-pane-header">
                        <h2>Audit Events</h2>
                      </div>
                      <div className="audit-log-list">
                        <div className="audit-log-item">
                          <span className="log-time-stamp">[10:42:01]</span>
                          <span className="log-msg-text">INFO: Database connection pools successfully initialized. (postgres://security_challenges_db:5432)</span>
                        </div>
                        <div className="audit-log-item" style={{ borderLeft: '3px solid var(--success)' }}>
                          <span className="log-time-stamp">[10:45:12]</span>
                          <span className="log-msg-text">SUCCESS: Daily transaction backup sync complete. Created local dump payload index.</span>
                        </div>
                        <div className="audit-log-item" style={{ borderLeft: '3px solid var(--warning)' }}>
                          <span className="log-time-stamp">[10:50:33]</span>
                          <span className="log-msg-text">WARN: Multiple failed SSH login attempts detected on port 22 from root. Local firewall blacklisting updated.</span>
                        </div>
                        <div className="audit-log-item">
                          <span className="log-time-stamp">[10:55:12]</span>
                          <span className="log-msg-text">INFO: Session cookie successfully verified for user 'guest' from IP 192.168.1.103.</span>
                        </div>
                        <div className="audit-log-item" style={{ borderLeft: '3px solid var(--danger)' }}>
                          <span className="log-time-stamp">[11:02:14]</span>
                          <span className="log-msg-text" style={{ color: 'var(--danger)', fontWeight: 'bold' }}>
                            CRITICAL: SQL Injection pattern match bypass verified on POST /challenges/login. Admin portal access granted.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DATABASE SETTINGS */}
                  {dashTab === 'settings' && (
                    <div>
                      <div className="dash-pane-header">
                        <h2>Configuration Settings</h2>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '12px', color: '#fff' }}>Connection Parameters</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                            <div>Port: 5432</div>
                            <div>SSL Mode: Require</div>
                            <div>Max Connections: 100</div>
                            <div>Idle Timeout: 10000ms</div>
                          </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '12px', color: '#fff' }}>Security Headers</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                            <div>Strict-Transport-Security: Active</div>
                            <div>X-Content-Type-Options: nosniff</div>
                            <div>SQLi Protection: DISABLED (String Interpolation Active)</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </main>

      {/* 3. COLLAPSIBLE CYBER LAB ASSISTANT DRAWERS */}
      <button 
        className="cyber-assistant-btn"
        onClick={() => setIsAssistantOpen(!isAssistantOpen)}
      >
        <Terminal size={18} />
        {isAssistantOpen ? 'Hide Cyber Assistant' : 'Show Cyber Assistant'}
      </button>

      <div className={`cyber-assistant-drawer ${isAssistantOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <Code className="drawer-icon" />
            <h2 className="drawer-title">Cyber Lab Console</h2>
          </div>
          <button className="close-drawer-btn" onClick={() => setIsAssistantOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-tabs">
          <button 
            className={`drawer-tab ${assistantTab === 'objectives' ? 'active' : ''}`}
            onClick={() => setAssistantTab('objectives')}
          >
            Objectives
          </button>
          <button 
            className={`drawer-tab ${assistantTab === 'query' ? 'active' : ''}`}
            onClick={() => setAssistantTab('query')}
          >
            Live SQL
          </button>
          <button 
            className={`drawer-tab ${assistantTab === 'logs' ? 'active' : ''}`}
            onClick={() => setAssistantTab('logs')}
          >
            API Logs
          </button>
          <button 
            className={`drawer-tab ${assistantTab === 'hints' ? 'active' : ''}`}
            onClick={() => setAssistantTab('hints')}
          >
            Hints
          </button>
        </div>

        <div className="drawer-content">
          {/* TAB 1: OBJECTIVES */}
          {assistantTab === 'objectives' && (
            <>
              <div className="objective-card">
                <h3 className="objective-title">SQL Injection Challenge</h3>
                <p className="objective-text">
                  Bypass the portal login interface to gain administrative level privileges on the website dashboard.
                </p>
              </div>

              <div>
                <h4 className="drawer-section-title">Vulnerability Concept</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  The client login form passes the username and password parameters directly to the NestJS backend. The backend uses simple string interpolation to construct a database select command. 
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '8px' }}>
                  If the username contains quotes (e.g. <code>'</code>), it prematurely terminates the intended string literal. The rest of the query can then be modified or commented out, forcing the query to evaluate to true.
                </p>
              </div>
            </>
          )}

          {/* TAB 2: LIVE SQL PREVIEW */}
          {assistantTab === 'query' && (
            <>
              <div>
                <h4 className="drawer-section-title">Backend SQL Query Execution</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  This query updates dynamically as you type in the login form. Watch how special characters change the structure:
                </p>
              </div>

              <div className="terminal-card">
                <div className="terminal-header">SQL Live Preview</div>
                <div className="terminal-body">
                  {getSqlQueryMarkup()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', padding: '12px', background: 'rgba(255, 100, 124, 0.08)', borderRadius: '8px', border: '1px solid rgba(255, 100, 124, 0.2)', fontSize: '0.78rem', color: 'var(--danger)' }}>
                <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                <span>
                  <strong>STRING CONCATENATION ALERT:</strong> The input fields are loaded directly. Using comment syntax like <code>--</code> disables everything past it in Postgres.
                </span>
              </div>
            </>
          )}

          {/* TAB 3: HTTP API LOGS */}
          {assistantTab === 'logs' && (
            <>
              <h4 className="drawer-section-title">HTTP Requests (POST /challenges/login)</h4>
              {httpLogs.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '20px' }}>
                  No requests sent during this browser session. Submit the login form to capture traffic.
                </div>
              ) : (
                <div className="http-log-list">
                  {httpLogs.map(log => (
                    <div key={log.id} className={`http-log-item ${log.isSuccess ? 'success' : 'error'}`}>
                      <div className="log-meta">
                        <span className="log-method post">{log.method}</span>
                        <span style={{ color: '#cbd5e1' }}>{log.url}</span>
                        <span style={{ color: log.isSuccess ? 'var(--success)' : 'var(--danger)' }}>
                          Status: {log.status}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '4px' }}>Time: {log.timestamp}</div>
                      
                      <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.7rem', marginTop: '6px' }}>Request Body:</div>
                      <pre className="log-payload">{log.payload}</pre>
                      
                      <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.7rem', marginTop: '6px' }}>Response Body:</div>
                      <pre className="log-payload">{log.response}</pre>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB 4: ACCORDION HINTS */}
          {assistantTab === 'hints' && (
            <>
              <h4 className="drawer-section-title">Instructor Hints</h4>
              
              <div className="hint-item">
                <button 
                  className="hint-header-btn"
                  onClick={() => setOpenHintIdx(openHintIdx === 0 ? null : 0)}
                >
                  <span>Hint 1: Understanding String Literals</span>
                  <ChevronRight size={14} style={{ transform: openHintIdx === 0 ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {openHintIdx === 0 && (
                  <div className="hint-body">
                    A SQL parser sees user input enclosed in quotes: <code>'input'</code>. If you send the input as <code>admin'</code>, the parser reads: <code>'admin''</code>, which results in a syntax error because of the trailing quote.
                  </div>
                )}
              </div>

              <div className="hint-item">
                <button 
                  className="hint-header-btn"
                  onClick={() => setOpenHintIdx(openHintIdx === 1 ? null : 1)}
                >
                  <span>Hint 2: Disabling the Password Check</span>
                  <ChevronRight size={14} style={{ transform: openHintIdx === 1 ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {openHintIdx === 1 && (
                  <div className="hint-body">
                    In SQL, the double-dash (<code>--</code>) represents a single-line comment. If the query is <code>SELECT * FROM users WHERE username = 'USER' AND password = 'PASS'</code>, inserting <code>admin' --</code> as the username yields: <br/>
                    <code>SELECT * FROM users WHERE username = 'admin' --' AND password = 'PASS'</code>. <br/>
                    The password check becomes a comment and is ignored!
                  </div>
                )}
              </div>

              <div className="hint-item">
                <button 
                  className="hint-header-btn"
                  onClick={() => setOpenHintIdx(openHintIdx === 2 ? null : 2)}
                >
                  <span>Hint 3: Exploit Payloads to Try</span>
                  <ChevronRight size={14} style={{ transform: openHintIdx === 2 ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {openHintIdx === 2 && (
                  <div className="hint-body">
                    Go to the Client Portal tab and enter:
                    <div style={{ margin: '8px 0 4px', fontSize: '0.78rem' }}>
                      <strong>Username:</strong> <code className="inline-code">admin' --</code>
                    </div>
                    <div>
                      <strong>Password:</strong> <code className="inline-code">anything</code>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
