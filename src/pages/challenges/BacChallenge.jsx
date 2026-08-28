import React, { useState, useEffect } from 'react';
import { 
  Terminal, Code, AlertTriangle, ShieldCheck, HelpCircle, X, ChevronRight,
  LayoutDashboard, User, FolderOpen, Users, Download, Lock, CheckCircle2,
  FileText, Calendar, Building, ShieldAlert, ArrowRight, Server, Globe,
  Shield, CreditCard, LogOut, Check
} from 'lucide-react';
import './challenges.css';

export default function BacChallenge() {
  // Authentication & Navigation States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'features', 'pricing', 'login', 'signup'
  
  // Login & Signup Input States
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Selected Document ID State (URL Query Param Synced)
  const [selectedDocId, setSelectedDocId] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('docId') || null;
  });

  // DevTools / Assistant Panel State
  const [isAssistantOpen, setIsAssistantOpen] = useState(true);
  const [assistantTab, setAssistantTab] = useState('objectives'); // 'objectives', 'manipulator', 'logs', 'hints'
  const [httpLogs, setHttpLogs] = useState([]);
  const [openHintIdx, setOpenHintIdx] = useState(null);

  // HTTP Request Manipulator State
  const [manipulatorId, setManipulatorId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [responseHeaders, setResponseHeaders] = useState('');
  const [responseBody, setResponseBody] = useState('');

  // Flag tracker state (if Merger Proposal content is successfully fetched)
  const [hasFlag, setHasFlag] = useState(false);
  const [secretContent, setSecretContent] = useState('');

  // Sync state with URL parameter docId
  const updateDocIdInUrl = (id) => {
    const newUrl = `${window.location.pathname}?docId=${id}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
    setSelectedDocId(id);
  };

  // Listen to popstate to support browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const searchParams = new URLSearchParams(window.location.search);
      setSelectedDocId(searchParams.get('docId') || null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check if selected document contains the flag (direct fetch analysis for flag confirmation)
  useEffect(() => {
    if (!selectedDocId) return;
    const checkDocContent = async () => {
      try {
        const res = await fetch(`/challenges/files/${selectedDocId}`);
        if (res.ok) {
          const text = await res.text();
          if (text.includes('FLAG{IDOR_ACCESS_CONTROL_BYPASS}')) {
            setHasFlag(true);
            setSecretContent(text);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkDocContent();
  }, [selectedDocId]);

  // If a docId exists in URL, force view to vault if user is logged in
  useEffect(() => {
    if (selectedDocId && isLoggedIn) {
      // Stay on vault view
    } else if (selectedDocId && !isLoggedIn) {
      // Force Login view if URL has docId but user not authenticated
      setActiveTab('login');
    }
  }, [selectedDocId, isLoggedIn]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      const res = await fetch('/challenges/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();
      setStatus(res.status);

      // Log request in HTTP Logs
      setHttpLogs(prev => [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          method: 'POST',
          url: '/challenges/login',
          status: res.status,
          isSuccess: res.ok,
          response: JSON.stringify(data, null, 2)
        },
        ...prev
      ]);

      if (res.ok) {
        setUser(data);
        setIsLoggedIn(true);
        if (!selectedDocId) {
          updateDocIdInUrl('1'); // Default to document 1
        }
      } else {
        setLoginError(data.message || 'Authentication failed. Check credentials.');
      }
    } catch (err) {
      setLoginError('Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');
    setLoading(true);
    try {
      const res = await fetch('/challenges/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: signupUsername, password: signupPassword }),
      });
      const data = await res.json();
      setStatus(res.status);

      // Log request in HTTP Logs
      setHttpLogs(prev => [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          method: 'POST',
          url: '/challenges/signup',
          status: res.status,
          isSuccess: res.ok,
          response: JSON.stringify(data, null, 2)
        },
        ...prev
      ]);

      if (res.ok) {
        setSignupSuccess(true);
        setTimeout(() => {
          setUser(data);
          setIsLoggedIn(true);
          setSignupSuccess(false);
          if (!selectedDocId) {
            updateDocIdInUrl('1');
          }
        }, 1200);
      } else {
        setSignupError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setSignupError('Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setSelectedDocId(null);
    setLoginUsername('');
    setLoginPassword('');
    setSignupUsername('');
    setSignupPassword('');
    setActiveTab('home');
    window.history.pushState(null, '', window.location.pathname);
  };

  const handleManipulatorSend = async (e) => {
    e.preventDefault();
    if (!manipulatorId) return;

    setLoading(true);
    setResponseHeaders('');
    setResponseBody('');
    setStatus(null);

    try {
      const res = await fetch(`/challenges/files/${manipulatorId}`);
      setStatus(res.status);
      
      let headersStr = `HTTP/1.1 ${res.status} ${res.statusText}\n`;
      res.headers.forEach((val, key) => {
        headersStr += `${key}: ${val}\n`;
      });
      setResponseHeaders(headersStr);

      const text = await res.text();
      setResponseBody(text);

      // Log request in HTTP Logs
      setHttpLogs(prev => [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          method: 'GET',
          url: `/challenges/files/${manipulatorId}`,
          status: res.status,
          isSuccess: res.ok,
          response: text
        },
        ...prev
      ]);
    } catch (err) {
      setStatus(0);
      setResponseHeaders('Network Error');
      setResponseBody('Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }} className="hr-portal-layout">
      
      {/* 1. SAAS NAVBAR (SophiaDocs Cloud) */}
      <nav className="hr-navbar" style={{ background: '#0d0f17', borderBottom: '1.5px solid var(--border-color)', padding: '14px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div 
          className="hr-sidebar-brand" 
          onClick={() => { if (!isLoggedIn) setActiveTab('home'); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: 0, borderBottom: 'none', margin: 0, cursor: !isLoggedIn ? 'pointer' : 'default' }}
        >
          <FolderOpen size={22} style={{ color: 'var(--purple)' }} />
          SOPHIADOCS CLOUD
        </div>

        {!isLoggedIn ? (
          <div className="apex-nav-links" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <button className={`apex-nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>Home</button>
            <button className={`apex-nav-link ${activeTab === 'features' ? 'active' : ''}`} onClick={() => setActiveTab('features')}>Features</button>
            <button className={`apex-nav-link ${activeTab === 'pricing' ? 'active' : ''}`} onClick={() => setActiveTab('pricing')}>Pricing</button>
            <button className="apex-portal-nav-btn" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: '#fff' }} onClick={() => setActiveTab('login')}>Login</button>
            <button className="apex-portal-nav-btn" style={{ background: 'var(--purple)' }} onClick={() => setActiveTab('signup')}>Sign Up</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="hr-user-summary" style={{ padding: 0, borderBottom: 'none', margin: 0, gap: '10px' }}>
              <div className="hr-user-avatar" style={{ width: '28px', height: '28px', fontSize: '0.8rem', background: 'var(--purple)', color: '#fff' }}>
                {user?.username?.substring(0, 2).toUpperCase() || 'US'}
              </div>
              <div className="hr-user-meta-info" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span className="hr-user-name" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#fff', lineHeight: 1.2 }}>{user?.username || 'Guest'}</span>
                <span className="hr-user-role" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Free Plan Member</span>
              </div>
            </div>
            <button onClick={handleLogout} className="view-book-btn" style={{ border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', background: 'rgba(239,68,68,0.05)', padding: '6px 12px' }}>
              <LogOut size={13} style={{ marginRight: '4px' }} /> Sign Out
            </button>
          </div>
        )}
      </nav>

      {/* 2. MAIN CONTENT AREA */}
      <main className="hr-main-content" style={{ padding: isLoggedIn ? '30px' : '40px 80px', maxWidth: isLoggedIn ? '100%' : '1200px', margin: '0 auto', width: '100%' }}>
        {!isLoggedIn ? (
          /* Normal SaaS Landing Page Content */
          <div className="animate-in fade-in duration-300">
            {activeTab === 'home' && (
              <div>
                <section className="apex-hero" style={{ padding: '60px 0' }}>
                  <div className="hero-left">
                    <h1 style={{ background: 'linear-gradient(135deg, #fff 40%, #c084fc)' }}>Secure Cloud PDF Hosting</h1>
                    <p>
                      Store, audit, and share critical corporate files with ironclad encryption. 
                      Trusted by over 14,000 security teams and remote compliance managers worldwide.
                    </p>
                    <div className="hero-buttons">
                      <button className="apex-btn-primary" style={{ background: 'var(--purple)' }} onClick={() => setActiveTab('signup')}>
                        Create Free Account <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                      </button>
                      <button className="apex-btn-secondary" onClick={() => setActiveTab('features')}>
                        Learn More
                      </button>
                    </div>
                  </div>
                  <div className="hero-right-visual" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(99, 102, 241, 0.05))' }}>
                    <div className="visual-grid">
                      <div className="visual-card">
                        <Globe style={{ color: 'var(--purple)' }} />
                        <h4>Anywhere</h4>
                      </div>
                      <div className="visual-card">
                        <Lock style={{ color: 'var(--purple)' }} />
                        <h4>Protected</h4>
                      </div>
                      <div className="visual-card">
                        <Server style={{ color: 'var(--purple)' }} />
                        <h4>Backup</h4>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="apex-stats-strip">
                  <div className="stat-item">
                    <span className="stat-num" style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', WebkitBackgroundClip: 'text' }}>14K+</span>
                    <span className="stat-lbl">Active Administrators</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-num" style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', WebkitBackgroundClip: 'text' }}>99.99%</span>
                    <span className="stat-lbl">Secure Download SLA</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-num" style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', WebkitBackgroundClip: 'text' }}>2M+</span>
                    <span className="stat-lbl">Documents Encrypted</span>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="apex-tab-content">
                <div className="section-header">
                  <h2>Built for Deep Integrity</h2>
                  <p>Enterprise grade document sharing with comprehensive auditing structures</p>
                </div>
                <div className="services-grid" style={{ marginTop: '30px' }}>
                  <div className="service-item-card" style={{ borderLeft: '4px solid var(--purple)' }}>
                    <div className="service-icon-box" style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
                      <Lock size={24} style={{ color: 'var(--purple)' }} />
                    </div>
                    <h3 className="service-card-title">Encrypted Storage</h3>
                    <p className="service-card-desc">
                      Every uploaded file is passed through our dynamic chunk encryption engine before being committed to persistent databases.
                    </p>
                  </div>
                  <div className="service-item-card" style={{ borderLeft: '4px solid var(--purple)' }}>
                    <div className="service-icon-box" style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
                      <Server size={24} style={{ color: 'var(--purple)' }} />
                    </div>
                    <h3 className="service-card-title">Dedicated Gateways</h3>
                    <p className="service-card-desc">
                      Secure object streaming handles PDF compilation dynamically on-demand, streaming files block-by-block directly to the browser.
                    </p>
                  </div>
                  <div className="service-item-card" style={{ borderLeft: '4px solid var(--purple)' }}>
                    <div className="service-icon-box" style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
                      <FileText size={24} style={{ color: 'var(--purple)' }} />
                    </div>
                    <h3 className="service-card-title">Audit Log Verification</h3>
                    <p className="service-card-desc">
                      Full visibility into data trails. Every download request is traced, logged, and timestamped inside our compliance portal ledger.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="apex-tab-content">
                <div className="section-header">
                  <h2>Pricing Plans</h2>
                  <p>Choose the level of security compliance required for your database files</p>
                </div>
                <div className="services-grid" style={{ marginTop: '30px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {/* FREE TIER */}
                  <div className="service-item-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '8px' }}>Free Plan</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>For individual students and test users.</p>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--purple)', marginBottom: '20px' }}>$0 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ forever</span></div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} style={{ color: 'var(--success)' }} /> Access public files</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} style={{ color: 'var(--success)' }} /> Standard PDF Rendering</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} style={{ color: 'var(--success)' }} /> Max File ID: 1</li>
                    </ul>
                    <button className="apex-btn-primary" style={{ width: '100%', marginTop: 'auto', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }} onClick={() => setActiveTab('signup')}>Get Started</button>
                  </div>
                  {/* PRO TIER */}
                  <div className="service-item-card" style={{ display: 'flex', flexDirection: 'column', borderColor: 'var(--purple)', boxShadow: '0 10px 30px rgba(168,85,247,0.1)' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '8px' }}>Professional</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>For small engineering teams and security developers.</p>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--purple)', marginBottom: '20px' }}>$9 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ month</span></div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} style={{ color: 'var(--success)' }} /> Access user files</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} style={{ color: 'var(--success)' }} /> Interactive download panel</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} style={{ color: 'var(--success)' }} /> Max File ID: 5</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} style={{ color: 'var(--success)' }} /> Full SSL Tunnel Encryption</li>
                    </ul>
                    <button className="apex-btn-primary" style={{ width: '100%', marginTop: 'auto', background: 'var(--purple)' }} onClick={() => setActiveTab('signup')}>Upgrade to Pro</button>
                  </div>
                  {/* ENTERPRISE TIER */}
                  <div className="service-item-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '8px' }}>Enterprise</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>For strict compliance mandates and global firms.</p>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--purple)', marginBottom: '20px' }}>Custom <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ quote</span></div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} style={{ color: 'var(--success)' }} /> Access all documents</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} style={{ color: 'var(--success)' }} /> Dedicated auditor panel</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} style={{ color: 'var(--success)' }} /> Sandbox API access</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} style={{ color: 'var(--success)' }} /> Single-Sign-On support</li>
                    </ul>
                    <button className="apex-btn-primary" style={{ width: '100%', marginTop: 'auto', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }} onClick={() => setActiveTab('signup')}>Contact Sales</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'login' && (
              <div className="apex-login-container">
                <div className="apex-login-card animate-in fade-in slide-in-from-bottom-4">
                  <div className="apex-login-header">
                    <div className="login-icon-box" style={{ background: 'rgba(168,85,247,0.1)', color: 'var(--purple)' }}>
                      <Lock size={20} />
                    </div>
                    <h2>SophiaDocs Sign In</h2>
                    <p>Enter your credentials to load your PDF document vault</p>
                  </div>
                  <form onSubmit={handleLoginSubmit} className="apex-login-form">
                    <div className="input-field-group">
                      <label htmlFor="user-username">Username</label>
                      <input 
                        id="user-username"
                        type="text" 
                        className="apex-input-text" 
                        required
                        placeholder="Your username..."
                        autoComplete="off"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                      />
                    </div>
                    <div className="input-field-group">
                      <label htmlFor="user-password">Password</label>
                      <input 
                        id="user-password"
                        type="password" 
                        className="apex-input-text" 
                        required
                        placeholder="Enter password..."
                        autoComplete="off"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                    </div>

                    {loginError && (
                      <div className="login-error-alert">
                        <AlertTriangle size={16} />
                        <span>{loginError}</span>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      className="apex-btn-primary" 
                      style={{ width: '100%', marginTop: '8px', background: 'var(--purple)' }}
                      disabled={loading}
                    >
                      {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'signup' && (
              <div className="apex-login-container">
                <div className="apex-login-card animate-in fade-in slide-in-from-bottom-4">
                  <div className="apex-login-header">
                    <div className="login-icon-box" style={{ background: 'rgba(168,85,247,0.1)', color: 'var(--purple)' }}>
                      <Users size={20} />
                    </div>
                    <h2>Register Account</h2>
                    <p>Create a free hosting user profile to start storing PDFs</p>
                  </div>
                  {signupSuccess ? (
                    <div className="contact-success-card" style={{ border: 'none', background: 'transparent', padding: '32px' }}>
                      <CheckCircle2 size={44} style={{ color: 'var(--success)', marginBottom: '12px', margin: '0 auto' }} />
                      <h3>Account Created!</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Logging you into the document center vault...</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSignupSubmit} className="apex-login-form">
                      <div className="input-field-group">
                        <label htmlFor="reg-username">Username</label>
                        <input 
                          id="reg-username"
                          type="text" 
                          className="apex-input-text" 
                          required
                          placeholder="Choose unique username..."
                          autoComplete="off"
                          value={signupUsername}
                          onChange={(e) => setSignupUsername(e.target.value)}
                        />
                      </div>
                      <div className="input-field-group">
                        <label htmlFor="reg-password">Password</label>
                        <input 
                          id="reg-password"
                          type="password" 
                          className="apex-input-text" 
                          required
                          placeholder="Create strong password..."
                          autoComplete="off"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                        />
                      </div>

                      {signupError && (
                        <div className="login-error-alert">
                          <AlertTriangle size={16} />
                          <span>{signupError}</span>
                        </div>
                      )}

                      <button 
                        type="submit" 
                        className="apex-btn-primary" 
                        style={{ width: '100%', marginTop: '8px', background: 'var(--purple)' }}
                        disabled={loading}
                      >
                        {loading ? 'Creating Account...' : 'Register Profile'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Authenticated Document Vault App Layout */
          <div className="animate-in fade-in" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' }}>
            {/* Left Sidebar (Document Navigation) */}
            <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>My Document Vault</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Storage files bound to your account authorization</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Free plan public document */}
                <button 
                  onClick={() => updateDocIdInUrl('1')} 
                  className={`view-book-btn ${selectedDocId === '1' ? 'active' : ''}`}
                  style={{ 
                    justifyContent: 'flex-start', 
                    padding: '12px', 
                    borderRadius: '10px', 
                    background: selectedDocId === '1' ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.02)',
                    borderColor: selectedDocId === '1' ? 'var(--purple)' : 'var(--border-color)',
                    color: '#fff',
                    textAlign: 'left'
                  }}
                >
                  <FileText size={16} style={{ marginRight: '8px', color: 'var(--purple)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Public_User_Agreement.pdf</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>ID: 1 | Public Agreement</span>
                  </div>
                </button>

                {/* Mock User File (to show more than 1 in list) */}
                <button 
                  onClick={() => updateDocIdInUrl('5')} 
                  className={`view-book-btn ${selectedDocId === '5' ? 'active' : ''}`}
                  style={{ 
                    justifyContent: 'flex-start', 
                    padding: '12px', 
                    borderRadius: '10px', 
                    background: selectedDocId === '5' ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.02)',
                    borderColor: selectedDocId === '5' ? 'var(--purple)' : 'var(--border-color)',
                    color: '#fff',
                    textAlign: 'left'
                  }}
                >
                  <FileText size={16} style={{ marginRight: '8px', color: 'var(--purple)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Welcome_Workspace.pdf</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>ID: 5 | User Note</span>
                  </div>
                </button>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-color)', borderRadius: '10px', padding: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
                <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>Free Tier Limit</div>
                <div>Your account does not have permissions to request higher document indices (IDs 2, 3, 4). Upgrade to Pro/Enterprise for restricted data assets.</div>
              </div>
            </div>

            {/* Right Panel (Interactive Inline PDF Viewer) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Flag success banner */}
              {hasFlag && (
                <div className="success-banner-gold" style={{ borderLeft: '4px solid var(--purple)' }}>
                  <div className="banner-title" style={{ color: 'var(--purple)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                    <ShieldCheck size={20} />
                    INSECURE DIRECT OBJECT REFERENCE BYPASS SUCCESS
                  </div>
                  <div className="banner-desc" style={{ marginTop: '8px', fontSize: '0.88rem' }}>
                    You successfully changed the query parameter in your browser URL to request a restricted document ID belonging to another user.
                    The backend streamed the file with no permission validation:
                    <div style={{ marginTop: '8px', color: '#fff', fontSize: '0.8rem', fontStyle: 'italic', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '4px' }}>
                      "{secretContent}"
                    </div>
                  </div>
                  <div className="flag-box" style={{ border: '1px solid rgba(139,92,246,0.3)', color: '#d8b4fe', marginTop: '12px' }}>
                    FLAG{IDOR_ACCESS_CONTROL_BYPASS}
                  </div>
                </div>
              )}

              {/* PDF Inline Iframe Viewer */}
              <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '620px' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} style={{ color: 'var(--purple)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>
                      {selectedDocId === '1' && 'Public_User_Agreement.pdf'}
                      {selectedDocId === '2' && 'Q2_Financial_Earnings.pdf (CONFIDENTIAL)'}
                      {selectedDocId === '3' && 'SophiaPath_Merger_Proposal.pdf (CONFIDENTIAL)'}
                      {selectedDocId === '4' && 'Employee_Payroll_Registry.pdf (CONFIDENTIAL)'}
                      {selectedDocId === '5' && 'Welcome_Workspace.pdf'}
                      {!['1', '2', '3', '4', '5'].includes(selectedDocId) && `Document ID: ${selectedDocId || 'None'}`}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {selectedDocId ? `PATH: /challenges/files/${selectedDocId}` : 'NO FILE LOADED'}
                  </div>
                </div>

                <div style={{ flexGrow: 1, background: '#171926', position: 'relative' }}>
                  {selectedDocId ? (
                    selectedDocId === '5' ? (
                      /* Display mock layout for ID 5 which isn't on NestJS disk but is a local mock */
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px', textAlign: 'center' }}>
                        <ShieldCheck size={48} style={{ color: 'var(--purple)', marginBottom: '16px' }} />
                        <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '8px' }}>Welcome to your Personal SophiaDocs Workspace</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', maxWidth: '400px' }}>
                          This workspace is only visible to your account. You can create text notes, upload personal images, and structure your corporate sharing folder.
                        </p>
                      </div>
                    ) : (
                      /* Iframe viewer mapping directly to NestJS server route streaming PDF bytes */
                      <iframe 
                        src={`/challenges/files/${selectedDocId}`} 
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        title="SophiaDocs PDF Viewer"
                      />
                    )
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '10px' }}>
                      <FolderOpen size={48} style={{ opacity: 0.3 }} />
                      <span style={{ fontSize: '0.85rem' }}>Select a document from the left vault directory to load inline reader</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* 3. COLLAPSIBLE CYBER LAB ASSISTANT DRAWERS */}
      <button 
        className="cyber-assistant-btn"
        onClick={() => setIsAssistantOpen(!isAssistantOpen)}
        style={{ background: 'linear-gradient(135deg, var(--purple), #6366f1)', boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)' }}
      >
        <Terminal size={18} />
        {isAssistantOpen ? 'Hide Cyber Assistant' : 'Show Cyber Assistant'}
      </button>

      <div className={`cyber-assistant-drawer ${isAssistantOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <Code className="drawer-icon" style={{ color: 'var(--purple)' }} />
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
            style={{ color: assistantTab === 'objectives' ? 'var(--purple)' : 'inherit', borderColor: assistantTab === 'objectives' ? 'var(--purple)' : 'transparent' }}
          >
            Objectives
          </button>
          <button 
            className={`drawer-tab ${assistantTab === 'manipulator' ? 'active' : ''}`}
            onClick={() => setAssistantTab('manipulator')}
            style={{ color: assistantTab === 'manipulator' ? 'var(--purple)' : 'inherit', borderColor: assistantTab === 'manipulator' ? 'var(--purple)' : 'transparent' }}
          >
            Manipulator
          </button>
          <button 
            className={`drawer-tab ${assistantTab === 'logs' ? 'active' : ''}`}
            onClick={() => setAssistantTab('logs')}
            style={{ color: assistantTab === 'logs' ? 'var(--purple)' : 'inherit', borderColor: assistantTab === 'logs' ? 'var(--purple)' : 'transparent' }}
          >
            API Logs
          </button>
          <button 
            className={`drawer-tab ${assistantTab === 'hints' ? 'active' : ''}`}
            onClick={() => setAssistantTab('hints')}
            style={{ color: assistantTab === 'hints' ? 'var(--purple)' : 'inherit', borderColor: assistantTab === 'hints' ? 'var(--purple)' : 'transparent' }}
          >
            Hints
          </button>
        </div>

        <div className="drawer-content">
          {/* TAB 1: OBJECTIVES */}
          {assistantTab === 'objectives' && (
            <>
              <div className="objective-card" style={{ background: 'rgba(139, 92, 246, 0.06)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                <h3 className="objective-title" style={{ color: 'var(--purple)' }}>IDOR / Broken Access Control</h3>
                <p className="objective-text">
                  Leverage Parameter Insecure Direct Object Reference to view restricted PDF files not listed in your account's workspace vault.
                </p>
              </div>

              <div>
                <h4 className="drawer-section-title">Vulnerability Concept</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  The web application loads document assets inside an inline iframe reader pointing directly to the server path: <code>/challenges/files/:id</code>.
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '8px' }}>
                  The specific document rendering in the panel is governed by the <code>?docId=X</code> query parameter in the browser's address bar. While the sidebar directory only links to public or user-owned IDs, the backend streams files without verifying whether the requesting user is the rightful owner of that document ID.
                </p>
              </div>
            </>
          )}

          {/* TAB 2: HTTP REQUEST MANIPULATOR */}
          {assistantTab === 'manipulator' && (
            <>
              <div className="manipulator-header">HTTP Query Console</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Test direct API endpoints by modifying target parameters.
              </p>

              <form onSubmit={handleManipulatorSend}>
                <div className="manipulator-row">
                  <span className="manipulator-method">GET</span>
                  <div className="manipulator-url">
                    /challenges/files/
                    <input 
                      type="text" 
                      className="manipulator-input-id" 
                      value={manipulatorId}
                      onChange={(e) => setManipulatorId(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="manipulator-send-btn" disabled={loading}>
                    {loading ? '...' : 'Send'}
                  </button>
                </div>
              </form>

              {status !== null && (
                <div className="manipulator-response-box animate-in fade-in">
                  <div className="response-meta-line">
                    <span>Response Console Headers:</span>
                    <span className={`response-status-text ${status >= 200 && status < 300 ? 'ok' : 'forbidden'}`}>
                      {status} {status === 200 ? 'OK' : 'ERROR'}
                    </span>
                  </div>
                  <pre style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace', margin: '0 0 10px', maxHeight: '100px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                    {responseHeaders}
                  </pre>
                  
                  <div className="response-meta-line" style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '8px', marginTop: '8px' }}>
                    <span>Response Contents Body:</span>
                  </div>
                  <pre className="response-body-pre">
                    {responseBody}
                  </pre>
                </div>
              )}
            </>
          )}

          {/* TAB 3: API REQUEST LOGS */}
          {assistantTab === 'logs' && (
            <>
              <h4 className="drawer-section-title">HTTP Request Traffic Logs (GET /challenges/files/*)</h4>
              {httpLogs.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '20px' }}>
                  No requests sent. Interact with the website or use the manipulator console above.
                </div>
              ) : (
                <div className="http-log-list">
                  {httpLogs.map(log => (
                    <div key={log.id} className="http-log-item success" style={{ borderLeftColor: 'var(--purple)' }}>
                      <div className="log-meta">
                        <span className="log-method" style={{ color: 'var(--purple)' }}>{log.method}</span>
                        <span style={{ color: '#cbd5e1', fontSize: '0.72rem' }}>{log.url}</span>
                        <span style={{ color: 'var(--success)' }}>
                          {log.status}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '4px' }}>Time: {log.timestamp}</div>
                      <pre className="log-payload">{log.response}</pre>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB 4: HINTS ACCORDION */}
          {assistantTab === 'hints' && (
            <>
              <h4 className="drawer-section-title">Instructor Hints</h4>

              <div className="hint-item">
                <button 
                  className="hint-header-btn"
                  onClick={() => setOpenHintIdx(openHintIdx === 0 ? null : 0)}
                >
                  <span>Hint 1: Inspect URL Parameters</span>
                  <ChevronRight size={14} style={{ transform: openHintIdx === 0 ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {openHintIdx === 0 && (
                  <div className="hint-body">
                    When you click on Document 1 inside your logged-in vault, notice that the browser URL changes to include a query parameter: <code>?docId=1</code>.
                  </div>
                )}
              </div>

              <div className="hint-item">
                <button 
                  className="hint-header-btn"
                  onClick={() => setOpenHintIdx(openHintIdx === 1 ? null : 1)}
                >
                  <span>Hint 2: Parameter Manipulation</span>
                  <ChevronRight size={14} style={{ transform: openHintIdx === 1 ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {openHintIdx === 1 && (
                  <div className="hint-body">
                    Try editing the <code>docId</code> query parameter directly in your browser's address bar to index numbers other than 1 or 5, such as <code>2</code>, <code>3</code>, or <code>4</code>, and reload.
                  </div>
                )}
              </div>

              <div className="hint-item">
                <button 
                  className="hint-header-btn"
                  onClick={() => setOpenHintIdx(openHintIdx === 2 ? null : 2)}
                >
                  <span>Hint 3: Solving the Challenge</span>
                  <ChevronRight size={14} style={{ transform: openHintIdx === 2 ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {openHintIdx === 2 && (
                  <div className="hint-body">
                    Navigate to <code>http://localhost:5173/challenges/files?docId=3</code>. This will force the inline iframe viewer to fetch and display <code>SophiaPath_Merger_Proposal.pdf</code> directly, unlocking the flag.
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
