import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, Star, Filter, Heart, MessageSquare, Terminal, 
  Code, AlertTriangle, ShieldCheck, HelpCircle, X, ChevronRight, 
  BookMarked, HelpCircle as HelpIcon, ArrowRight
} from 'lucide-react';
import './challenges.css';

// Seeded Books mock database
const MOCK_BOOKS = [
  { id: 1, title: 'Introduction to Modern Cryptography', author: 'Jonathan Katz', category: 'technology', price: '$49.99', rating: 4.8, pages: 584 },
  { id: 2, title: 'Linux Command Line and Shell Scripting', author: 'Richard Blum', category: 'technology', price: '$34.50', rating: 4.7, pages: 648 },
  { id: 3, title: 'The Elegant Universe', author: 'Brian Greene', category: 'science', price: '$18.99', rating: 4.6, pages: 448 },
  { id: 4, title: 'Quantum Mechanics: The Theoretical Minimum', author: 'Leonard Susskind', category: 'science', price: '$22.00', rating: 4.7, pages: 384 },
  { id: 5, title: 'Neuromancer (Sprawl Trilogy)', author: 'William Gibson', category: 'fiction', price: '$9.99', rating: 4.5, pages: 271 },
  { id: 6, title: 'Dune (Deluxe Edition)', author: 'Frank Herbert', category: 'fiction', price: '$28.00', rating: 4.9, pages: 688 },
];

export default function XssChallenge() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'catalog', 'contact'
  
  // Search & API States
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Custom alert payload capture modal
  const [alertPayload, setAlertPayload] = useState(null);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('all');

  // DevTools / Assistant Panel State
  const [isAssistantOpen, setIsAssistantOpen] = useState(true);
  const [assistantTab, setAssistantTab] = useState('objectives'); // 'objectives', 'payloads', 'logs', 'hints'
  const [httpLogs, setHttpLogs] = useState([]);
  const [openHintIdx, setOpenHintIdx] = useState(null);

  // Override window.alert specifically for this sandbox screen
  // to intercept and show a beautiful modal while satisfying XSS execution checks.
  useEffect(() => {
    const originalAlert = window.alert;
    
    window.alert = (message) => {
      setAlertPayload(message || "XSS Alert Triggered!");
      // We can also trigger the standard console log for debugging
      console.log("Captured Sandboxed Alert:", message);
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError(null);
    setSubmittedQuery(query);

    try {
      const response = await fetch(`/challenges/search?q=${encodeURIComponent(query)}`);
      const status = response.status;
      let data;
      try {
        data = await response.json();
      } catch {
        data = { query: query, results: [] };
      }

      // Log request in HTTP Logs
      setHttpLogs(prev => [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          method: 'GET',
          url: `/challenges/search?q=${encodeURIComponent(query)}`,
          status: status,
          isSuccess: status >= 200 && status < 300,
          response: JSON.stringify(data, null, 2)
        },
        ...prev
      ]);

      setResults(data.results || []);
    } catch (err) {
      setError('Failed to reach the server. Is the NestJS backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (keyword) => {
    setQuery(keyword);
    setTimeout(() => {
      setLoading(true);
      setSubmittedQuery(keyword);
      fetch(`/challenges/search?q=${encodeURIComponent(keyword)}`)
        .then(res => res.json())
        .then(data => {
          setResults(data.results || []);
          setLoading(false);
          setHttpLogs(prev => [
            {
              id: Date.now(),
              timestamp: new Date().toLocaleTimeString(),
              method: 'GET',
              url: `/challenges/search?q=${encodeURIComponent(keyword)}`,
              status: 200,
              isSuccess: true,
              response: JSON.stringify(data, null, 2)
            },
            ...prev
          ]);
        }).catch(() => {
          setResults([]);
          setLoading(false);
        });
    }, 50);
  };

  const filteredCatalog = selectedCategory === 'all' 
    ? MOCK_BOOKS 
    : MOCK_BOOKS.filter(b => b.category === selectedCategory);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      
      {/* 1. TARGET APP NAVBAR (Nova Book Finder) */}
      <nav className="nova-navbar" style={{ justifyContent: 'center' }}>
        <div className="nova-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookMarked style={{ color: 'var(--warning)' }} size={24} />
          NOVA BOOK FINDER
        </div>
      </nav>

      {/* 2. MAIN APP CONTENT AREA */}
      <main className="apex-content-area">
        <div>
          <section className="nova-hero">
            <h1>Find Your Next Educational Asset</h1>
            <p>Search over thousands of technical and scientific textbooks instantly</p>
            
            <form onSubmit={handleSearchSubmit} className="nova-search-bar">
              <input 
                type="text" 
                className="nova-search-input" 
                placeholder="Search by title, author, or topic..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
              />
              <button type="submit" className="nova-search-btn">
                Search
              </button>
            </form>
          </section>

          {/* Render results */}
          {submittedQuery && (
            <div style={{ marginTop: '30px' }} className="animate-in fade-in">
              <div className="nova-search-results-strip">
                Showing results for:{' '}
                {/* ——— INTENTIONALLY VULNERABLE INJECTION POINT ——— */}
                <span 
                  className="nova-query-highlight"
                  dangerouslySetInnerHTML={{ __html: submittedQuery }}
                />
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Searching database catalog...</div>
              ) : results.length === 0 ? (
                <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)' }}>No textbooks found matching that query.</p>
                </div>
              ) : (
                <div className="nova-books-container">
                  {results.map(book => (
                    <div key={book.id} className="nova-book-card">
                      <div className="book-cover-container">
                        {book.thumbnail ? (
                          <img src={book.thumbnail} alt={book.title} className="book-cover-img" />
                        ) : (
                          <div className="book-cover-fallback">
                            <BookOpen size={36} className="fallback-icon" />
                          </div>
                        )}
                        {book.categories && book.categories.length > 0 && (
                          <span className="book-badge-tag">{book.categories[0]}</span>
                        )}
                      </div>
                      <div className="book-card-details">
                        <h3 className="book-card-title" title={book.title}>{book.title}</h3>
                        <span className="book-card-author">
                          {book.authors && book.authors.length > 0
                            ? `By ${book.authors.join(', ')}`
                            : 'Unknown Author'}
                        </span>
                        <p className="book-card-description">
                          {book.description 
                            ? (book.description.length > 120 
                               ? `${book.description.substring(0, 120)}...` 
                               : book.description)
                            : 'No description available for this book.'}
                        </p>
                        <div className="book-card-footer">
                          {book.rating ? (
                            <span className="book-rating">
                              <Star size={13} className="star-icon" fill="var(--warning)" style={{ color: 'var(--warning)', marginRight: '4px' }} />
                              {book.rating}
                            </span>
                          ) : (
                            <span className="book-rating-empty">Unrated</span>
                          )}
                          {book.infoLink && (
                            <a 
                              href={book.infoLink} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="view-book-btn"
                            >
                              View Book
                              <ArrowRight size={13} style={{ marginLeft: '4px' }} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 3. CAPTURED XSS ALERT POPUP MODAL */}
      {alertPayload !== null && (
        <div className="xss-custom-alert-overlay">
          <div className="xss-custom-alert-modal animate-in zoom-in duration-200">
            <div className="xss-alert-icon">🎉</div>
            <h3 className="xss-alert-title">XSS Script Executed!</h3>
            <p className="xss-alert-text">
              <strong>Alert Message Content:</strong> <br/>
              <code>{alertPayload}</code>
            </p>
            <div style={{ background: 'rgba(255, 100, 124, 0.08)', border: '1px solid rgba(255, 100, 124, 0.2)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--danger)', marginBottom: '20px', textAlign: 'left', fontFamily: 'monospace' }}>
              🔑 compromised_session_cookie = "jwt_auth_token_993abc"
            </div>
            <button className="xss-alert-btn" onClick={() => setAlertPayload(null)}>
              Dismiss Console Alert
            </button>
          </div>
        </div>
      )}

      {/* 4. COLLAPSIBLE CYBER LAB ASSISTANT DRAWERS */}
      <button 
        className="cyber-assistant-btn"
        onClick={() => setIsAssistantOpen(!isAssistantOpen)}
        style={{ background: 'linear-gradient(135deg, var(--warning), #ea580c)', boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)' }}
      >
        <Terminal size={18} style={{ color: '#0f172a' }} />
        <span style={{ color: '#0f172a' }}>{isAssistantOpen ? 'Hide Cyber Assistant' : 'Show Cyber Assistant'}</span>
      </button>

      <div className={`cyber-assistant-drawer ${isAssistantOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <Code className="drawer-icon" style={{ color: 'var(--warning)' }} />
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
            style={{ color: assistantTab === 'objectives' ? 'var(--warning)' : 'inherit', borderColor: assistantTab === 'objectives' ? 'var(--warning)' : 'transparent' }}
          >
            Objectives
          </button>
          <button 
            className={`drawer-tab ${assistantTab === 'payloads' ? 'active' : ''}`}
            onClick={() => setAssistantTab('payloads')}
            style={{ color: assistantTab === 'payloads' ? 'var(--warning)' : 'inherit', borderColor: assistantTab === 'payloads' ? 'var(--warning)' : 'transparent' }}
          >
            Payloads
          </button>
          <button 
            className={`drawer-tab ${assistantTab === 'logs' ? 'active' : ''}`}
            onClick={() => setAssistantTab('logs')}
            style={{ color: assistantTab === 'logs' ? 'var(--warning)' : 'inherit', borderColor: assistantTab === 'logs' ? 'var(--warning)' : 'transparent' }}
          >
            API Logs
          </button>
          <button 
            className={`drawer-tab ${assistantTab === 'hints' ? 'active' : ''}`}
            onClick={() => setAssistantTab('hints')}
            style={{ color: assistantTab === 'hints' ? 'var(--warning)' : 'inherit', borderColor: assistantTab === 'hints' ? 'var(--warning)' : 'transparent' }}
          >
            Hints
          </button>
        </div>

        <div className="drawer-content">
          {/* TAB 1: OBJECTIVES */}
          {assistantTab === 'objectives' && (
            <>
              <div className="objective-card" style={{ background: 'rgba(245, 158, 11, 0.06)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                <h3 className="objective-title" style={{ color: 'var(--warning)' }}>Reflected XSS Challenge</h3>
                <p className="objective-text">
                  Craft a search query payload that executes custom JavaScript when output back into the browser document page.
                </p>
              </div>

              <div>
                <h4 className="drawer-section-title">Vulnerability Concept</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  The application search bar accepts queries and directly injects the submitted string inside the search results summary box.
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '8px' }}>
                  The frontend uses the React command <code>dangerouslySetInnerHTML</code> to output the text string. This bypasses React's default protection which escapes tags, meaning HTML elements supplied by the user will build active DOM components.
                </p>
              </div>
            </>
          )}

          {/* TAB 2: PAYLOADS HELPERS */}
          {assistantTab === 'payloads' && (
            <>
              <h4 className="drawer-section-title">Common XSS Payloads</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Modern browsers block standard <code>&lt;script&gt;</code> tags when injected via <code>innerHTML</code>. Security researchers utilize alternate tags:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 'bold', display: 'block', color: 'var(--warning)', marginBottom: '4px' }}>Image Error Trigger</span>
                  <code style={{ fontSize: '0.75rem', display: 'block', wordBreak: 'break-all', color: '#fca5a5' }}>
                    &lt;img src=x onerror=alert('Reflected_XSS')&gt;
                  </code>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 'bold', display: 'block', color: 'var(--warning)', marginBottom: '4px' }}>SVG Load Trigger</span>
                  <code style={{ fontSize: '0.75rem', display: 'block', wordBreak: 'break-all', color: '#fca5a5' }}>
                    &lt;svg onload=alert('XSS')&gt;
                  </code>
                </div>
              </div>
            </>
          )}

          {/* TAB 3: API LOGS */}
          {assistantTab === 'logs' && (
            <>
              <h4 className="drawer-section-title">HTTP Requests (GET /challenges/search)</h4>
              {httpLogs.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '20px' }}>
                  No search logs captured. Search using the input bar above.
                </div>
              ) : (
                <div className="http-log-list">
                  {httpLogs.map(log => (
                    <div key={log.id} className="http-log-item success" style={{ borderLeftColor: 'var(--warning)' }}>
                      <div className="log-meta">
                        <span className="log-method" style={{ color: 'var(--warning)' }}>{log.method}</span>
                        <span style={{ color: '#cbd5e1', fontSize: '0.72rem', wordBreak: 'break-all', maxWidth: '70%' }}>{log.url}</span>
                        <span style={{ color: 'var(--success)' }}>
                          {log.status}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '4px' }}>Time: {log.timestamp}</div>
                      
                      <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.7rem', marginTop: '6px' }}>JSON Response payload:</div>
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
                  <span>Hint 1: React Escape Behavior</span>
                  <ChevronRight size={14} style={{ transform: openHintIdx === 0 ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {openHintIdx === 0 && (
                  <div className="hint-body">
                    Normally, if you write <code>{"{query}"}</code> in React JSX, React auto-encodes characters (e.g. <code>&lt;</code> turns into <code>&amp;lt;</code>). This prevents rendering user input as HTML. The bookstore page uses <code>dangerouslySetInnerHTML</code> to output search feedback, creating the exploit point.
                  </div>
                )}
              </div>

              <div className="hint-item">
                <button 
                  className="hint-header-btn"
                  onClick={() => setOpenHintIdx(openHintIdx === 1 ? null : 1)}
                >
                  <span>Hint 2: Image Onerror Event</span>
                  <ChevronRight size={14} style={{ transform: openHintIdx === 1 ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {openHintIdx === 1 && (
                  <div className="hint-body">
                    When you insert <code>&lt;img src=x onerror=alert('XSS')&gt;</code>, the browser immediately attempts to fetch the file named <code>x</code>. Because this image source is invalid, the browser triggers the <code>onerror</code> JavaScript handler, invoking the code.
                  </div>
                )}
              </div>

              <div className="hint-item">
                <button 
                  className="hint-header-btn"
                  onClick={() => setOpenHintIdx(openHintIdx === 2 ? null : 2)}
                >
                  <span>Hint 3: Crafting the Search</span>
                  <ChevronRight size={14} style={{ transform: openHintIdx === 2 ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {openHintIdx === 2 && (
                  <div className="hint-body">
                    Type or paste the following into the search bar: <br/>
                    <code className="inline-code">&lt;img src=1 onerror=alert('cookie_stolen')&gt;</code> <br/>
                    and click Search. The query reflects into the document, rendering the image element and launching the custom alert.
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
