import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Loader2, 
  Plus, 
  X, 
  Check, 
  AlertCircle, 
  Globe, 
  Sliders, 
  Tag, 
  Clock, 
  HelpCircle,
  FileText,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Select, MenuItem, FormControl } from '@mui/material';
import './AiAuditorDashboard.css';

/**
 * Helper to make authenticated requests to the backend.
 */
const auditFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }
  
  return response.json().catch(() => ({}));
};

/**
 * AiAuditorDashboard Component
 * Allows instructors to configure the AI Auditor, trigger manual runs,
 * view tech news summaries, and review/approve course content updates.
 */
const BumbleBeeIcon = ({ className = '', size = 32 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ filter: 'drop-shadow(0 0 10px rgba(250, 204, 21, 0.7))' }}
  >
    {/* Wings */}
    <path d="M7 7C4.5 3.5 1.5 4.5 3 8C4.5 11.5 8 10.5 8.5 9" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" fill="rgba(96, 165, 250, 0.3)" />
    <path d="M17 7C19.5 3.5 22.5 4.5 21 8C19.5 11.5 16 10.5 15.5 9" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" fill="rgba(96, 165, 250, 0.3)" />
    {/* Body */}
    <ellipse cx="12" cy="14.5" rx="5" ry="5.5" fill="#FACC15" stroke="#1E293B" strokeWidth="1.5" />
    {/* Stripes */}
    <path d="M7.5 13H16.5" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M8 16H16" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
    {/* Head & Eyes */}
    <circle cx="12" cy="7.5" r="3" fill="#1E293B" />
    <circle cx="10.8" cy="7" r="0.75" fill="#FFFFFF" />
    <circle cx="13.2" cy="7" r="0.75" fill="#FFFFFF" />
    {/* Antennae */}
    <path d="M10.5 5L9 3" stroke="#FACC15" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M13.5 5L15 3" stroke="#FACC15" strokeWidth="1.2" strokeLinecap="round" />
    {/* Stinger */}
    <path d="M12 20L12 22" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function AiAuditorDashboard({ courseId, courseTitle, sections = [] }) {
  // --- STATE MANAGEMENT ---
  const [config, setConfig] = useState({
    isActive: true,
    autoSearch: true,
    autoFixHighRelevance: false,
    auditInterval: '1d',
    searchKeywords: [],
    websites: []
  });
  
  const [pendingReports, setPendingReports] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [selectedReportId, setSelectedReportId] = useState('');
  
  // Loading states
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [, setIsLoadingReports] = useState(true);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [actioningId, setActioningId] = useState(null); // Tracks active suggestion index/action
  
  // Form input state
  const [keywordInput, setKeywordInput] = useState('');
  const [websiteInput, setWebsiteInput] = useState('');
  
  // Feedback notifications
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  // Get active selected report
  const activeReport = pendingReports.find(r => r.id === selectedReportId) || pendingReports[0] || null;

  // --- INITIAL DATA FETCHING ---
  useEffect(() => {
    if (courseId) {
      fetchConfig();
      fetchPendingReports();
    }
  }, [courseId]);

  const fetchConfig = async () => {
    setIsLoadingConfig(true);
    setApiError('');
    try {
      const data = await auditFetch(`/audit/config/${courseId}`);
      if (data) {
        setConfig({
          isActive: data.isActive !== undefined ? !!data.isActive : true,
          autoSearch: data.autoSearch !== undefined ? !!data.autoSearch : true,
          autoFixHighRelevance: data.autoFixHighRelevance !== undefined ? !!data.autoFixHighRelevance : false,
          auditInterval: data.auditInterval || '1d',
          searchKeywords: Array.isArray(data.searchKeywords) ? data.searchKeywords : [],
          websites: Array.isArray(data.websites) ? data.websites : []
        });
      }
    } catch (err) {
      // 404 is expected if config has never been created. We keep defaults.
      if (err.message && (err.message.includes('404') || err.message.includes('Not Found') || err.message.includes('Cannot GET'))) {
        console.log('No existing config found. Instructor can create one.');
      } else {
        setApiError(`Failed to load auditor configuration: ${err.message}`);
      }
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const fetchPendingReports = async () => {
    setIsLoadingReports(true);
    try {
      const reportsData = await auditFetch(`/audit/reports/${courseId}/pending`);
      const reportsArray = Array.isArray(reportsData) ? reportsData : [];
      setPendingReports(reportsArray);
      if (reportsArray.length > 0) {
        setSelectedReportId(reportsArray[0].id);
      } else {
        setSelectedReportId('');
      }
    } catch (err) {
      console.error('Failed to load pending reports:', err);
      setPendingReports([]);
      setSelectedReportId('');
    } finally {
      setIsLoadingReports(false);
    }
  };

  // --- CONFIGURATION FORM HANDLERS ---
  const handleToggleActive = () => {
    setConfig(prev => {
      const nextActive = !prev.isActive;
      return {
        ...prev,
        isActive: nextActive,
        auditInterval: nextActive ? '1d' : 'manual'
      };
    });
  };

  const handleIntervalChange = (e) => {
    const value = e.target.value;
    setConfig(prev => ({
      ...prev,
      auditInterval: value,
      isActive: value !== 'manual'
    }));
  };

  const handleAddKeyword = (e) => {
    e.preventDefault();
    const cleanKeyword = keywordInput.trim();
    if (!cleanKeyword) return;
    
    if (config.searchKeywords.includes(cleanKeyword)) {
      setKeywordInput('');
      return;
    }

    setConfig(prev => ({
      ...prev,
      searchKeywords: [...prev.searchKeywords, cleanKeyword]
    }));
    setKeywordInput('');
  };

  const handleRemoveKeyword = (keywordToRemove) => {
    setConfig(prev => ({
      ...prev,
      searchKeywords: prev.searchKeywords.filter(k => k !== keywordToRemove)
    }));
  };

  const handleAddWebsite = (e) => {
    e.preventDefault();
    const cleanUrl = websiteInput.trim();
    if (!cleanUrl) return;

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      setApiError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    if (config.websites && config.websites.includes(cleanUrl)) {
      setWebsiteInput('');
      return;
    }

    setConfig(prev => ({
      ...prev,
      websites: [...(prev.websites || []), cleanUrl]
    }));
    setWebsiteInput('');
  };

  const handleRemoveWebsite = (websiteToRemove) => {
    setConfig(prev => ({
      ...prev,
      websites: (prev.websites || []).filter(w => w !== websiteToRemove)
    }));
  };

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    setApiError('');
    setApiSuccess('');
    try {
      const savedConfig = await auditFetch(`/audit/config/${courseId}`, {
        method: 'POST',
        body: JSON.stringify({
          isActive: config.isActive,
          autoSearch: config.autoSearch,
          autoFixHighRelevance: config.autoFixHighRelevance,
          auditInterval: config.auditInterval,
          searchKeywords: config.searchKeywords,
          websites: config.websites || []
        })
      });
      setConfig({
        isActive: savedConfig.isActive,
        autoSearch: savedConfig.autoSearch,
        autoFixHighRelevance: savedConfig.autoFixHighRelevance,
        auditInterval: savedConfig.auditInterval,
        searchKeywords: savedConfig.searchKeywords,
        websites: savedConfig.websites || []
      });
      setApiSuccess('Configuration updated successfully!');
      setTimeout(() => setApiSuccess(''), 4000);
    } catch (err) {
      setApiError(`Failed to save configuration: ${err.message}`);
    } finally {
      setIsSavingConfig(false);
    }
  };

  // --- MANUAL AUDIT TRIGGER ---
  const handleAuditNow = async () => {
    if (!config.autoSearch && (config.searchKeywords?.length || 0) === 0 && (!config.websites || config.websites.length === 0)) {
      setApiError('Add at least one search keyword or reference website URL, or enable Self-Directed Search, before executing a manual audit.');
      return;
    }
    
    setIsAuditing(true);
    setApiError('');
    setApiSuccess('');
    try {
      // First save configuration to ensure keywords and websites are synced
      await auditFetch(`/audit/config/${courseId}`, {
        method: 'POST',
        body: JSON.stringify({
          isActive: config.isActive,
          autoSearch: config.autoSearch,
          autoFixHighRelevance: config.autoFixHighRelevance,
          auditInterval: config.auditInterval,
          searchKeywords: config.searchKeywords,
          websites: config.websites || []
        })
      });

      let runNowUrl = `/audit/${courseId}/run-now`;
      const queryParams = [];
      if (selectedSectionId) {
        queryParams.push(`sectionId=${selectedSectionId}`);
        if (selectedLessonId) {
          queryParams.push(`lessonId=${selectedLessonId}`);
        }
      }
      if (queryParams.length > 0) {
        runNowUrl += `?${queryParams.join('&')}`;
      }

      const newReport = await auditFetch(runNowUrl, {
        method: 'POST'
      });

      if (newReport.status === 'FAILED') {
        throw new Error(newReport.errorMessage || 'Audit failed with an unknown error');
      }

      setApiSuccess('Manual audit completed successfully!');
      setTimeout(() => setApiSuccess(''), 4000);
      
      // Reload reports
      await fetchPendingReports();
    } catch (err) {
      setApiError(`Audit execution failed: ${err.message}`);
    } finally {
      setIsAuditing(false);
    }
  };

  // --- SUGGESTION ACTION HANDLERS ---
  const [relevanceFilter, setRelevanceFilter] = useState('all');
  const [changeIndex, setChangeIndex] = useState(0);

  // Reset pagination index when report or relevance filter changes
  useEffect(() => {
    setChangeIndex(0);
  }, [selectedReportId, relevanceFilter]);

  const selectSx = {
    width: '100%',
    borderRadius: '12px',
    backgroundColor: 'var(--background-paper-alt, rgba(255, 255, 255, 0.05))',
    color: 'var(--text-primary, #ffffff)',
    fontSize: '0.85rem',
    '& .MuiOutlinedInput-notchedOutline': { border: '1px solid var(--divider, rgba(255, 255, 255, 0.1))' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' },
    '& .MuiSelect-select': { padding: '8px 12px' },
    '& .MuiSelect-icon': { color: 'var(--text-secondary)' }
  };

  const menuProps = {
    PaperProps: {
      sx: {
        backgroundColor: 'var(--background-paper, #0b0b1e)',
        border: '1px solid var(--divider, rgba(255, 255, 255, 0.1))',
        color: 'var(--text-primary, #ffffff)',
        borderRadius: '12px',
        '& .MuiMenuItem-root': {
          fontSize: '0.85rem',
          color: 'var(--text-primary, #ffffff)',
          '&:hover': {
            backgroundColor: 'transparent !important',
            color: 'var(--text-primary, #ffffff) !important'
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(var(--primary-main-rgb), 0.12) !important',
            '&:hover': {
              backgroundColor: 'rgba(var(--primary-main-rgb), 0.12) !important'
            }
          }
        }
      }
    }
  };

  const reportSelectSx = {
    ...selectSx,
    width: 'auto',
    borderRadius: '8px',
    fontSize: '0.8rem',
    '& .MuiSelect-select': { padding: '6px 12px' },
  };

  const handleApproveSuggestion = async (reportId, index) => {
    const suggestion = activeReport?.suggestedUpdates?.[index];
    if (suggestion?.action === 'delete_page') {
      if (!window.confirm('⚠️ WARNING: Approving this suggestion will PERMANENTLY delete the entire lesson page. Are you sure you want to proceed?')) {
        return;
      }
    } else if (suggestion?.action === 'delete_content') {
      if (!window.confirm('🗑️ WARNING: Approving this suggestion will PERMANENTLY remove this content block. Are you sure you want to proceed?')) {
        return;
      }
    }

    setActioningId(`approve-${index}`);
    setApiError('');
    setApiSuccess('');
    try {
      await auditFetch(`/audit/reports/${reportId}/approve/${index}`, {
        method: 'POST'
      });
      
      setApiSuccess(`Successfully applied modification to the course content.`);
      setTimeout(() => setApiSuccess(''), 4000);
      
      // Reload reports to get fresh status
      await fetchPendingReports();
    } catch (err) {
      setApiError(`Failed to apply update: ${err.message}`);
    } finally {
      setActioningId(null);
    }
  };

  const handleApproveAllHighRelevance = async () => {
    if (!activeReport || !activeReport.suggestedUpdates) return;
    const highRelevanceItems = activeReport.suggestedUpdates
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.relevance === 'high');

    if (highRelevanceItems.length === 0) return;

    if (!window.confirm(`Are you sure you want to approve all ${highRelevanceItems.length} high-relevance suggestions?`)) {
      return;
    }

    setActioningId('approve-all-high');
    setApiError('');
    setApiSuccess('');

    try {
      const sortedItems = [...highRelevanceItems].sort((a, b) => b.index - a.index);
      for (const { index } of sortedItems) {
        await auditFetch(`/audit/reports/${activeReport.id}/approve/${index}`, {
          method: 'POST'
        });
      }
      setApiSuccess(`Successfully approved all high-relevance suggestions.`);
      setTimeout(() => setApiSuccess(''), 4000);
      await fetchPendingReports();
    } catch (err) {
      setApiError(`Failed to approve high-relevance suggestions: ${err.message}`);
    } finally {
      setActioningId(null);
    }
  };

  const handleRejectReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to dismiss and reject this entire audit report? No changes will be applied to the course.')) {
      return;
    }
    
    setActioningId(`reject-all`);
    setApiError('');
    setApiSuccess('');
    try {
      await auditFetch(`/audit/reports/${reportId}/reject`, {
        method: 'POST'
      });
      
      setApiSuccess('Audit report dismissed and rejected.');
      setTimeout(() => setApiSuccess(''), 4000);
      
      // Reload reports
      await fetchPendingReports();
    } catch (err) {
      setApiError(`Failed to reject report: ${err.message}`);
    } finally {
      setActioningId(null);
    }
  };

  // --- SECURITY-SAFE ESCAPING ---
  // To protect against Cross-Site Scripting (XSS), text chunks from the AI are rendered
  // as standard React text children inside pre/code tags. React's default behavior 
  // escapes all HTML characters, rendering them safely as plain text rather than executing code.
  const renderSafeContent = (text) => {
    if (!text) return null;
    return (
      <pre className="diff-pre">
        {text}
      </pre>
    );
  };

  return (
    <div className="auditor-dashboard">
      
      {/* HEADER SECTION */}
      <div className="auditor-header">
        <div className="auditor-title-group">
          <div className="auditor-title-flex">
            <BumbleBeeIcon className="auditor-title-icon pulse" size={32} />
            <h2 className="auditor-title">
              BumbleBee
            </h2>
          </div>
          <p className="auditor-subtitle">
            Keep your course material updated with the latest technological developments using DuckDuckGo search grounding.
          </p>
        </div>
        
        {/* MANUAL OVERRIDE TRIGGER */}
        <button
          onClick={handleAuditNow}
          disabled={isAuditing || isLoadingConfig}
          className="btn btn-primary"
        >
          {isAuditing ? (
            <>
              <Loader2 className="loading-spinner" style={{ width: '16px', height: '16px', margin: 0 }} />
              <span>Auditing...</span>
            </>
          ) : (
            <>
              <Play style={{ width: '16px', height: '16px', fill: 'currentColor' }} />
              <span>Audit Now</span>
            </>
          )}
        </button>
      </div>

      {/* FEEDBACK BANNERS */}
      {apiError && (
        <div className="feedback-banner error">
          <AlertCircle className="feedback-icon" />
          <div>
            <span className="feedback-bold">Error:</span> {apiError}
          </div>
        </div>
      )}
      {apiSuccess && (
        <div className="feedback-banner success">
          <Check className="feedback-icon" />
          <div>
            <span className="feedback-bold">Success:</span> {apiSuccess}
          </div>
        </div>
      )}

      {/* AUDIT NOW PROGRESS SCREEN */}
      {isAuditing && (
        <div className="loading-screen">
          <Loader2 className="loading-spinner" />
          <h3 className="loading-title">DeepSeek is searching the web and auditing your content...</h3>
          <p className="loading-text">
            The AI is analyzing your lessons, searching online for recent changes, and preparing suggested replacements. This slow operation may take 5 to 15 seconds.
          </p>
        </div>
      )}

      {!isAuditing && (
        <div className="dashboard-grid">
          
          {/* LEFT COLUMN: CONFIGURATION PANEL */}
          <div className="left-col">
            <div className="settings-card">
              <div className="card-title-group">
                <Sliders className="card-title-icon" />
                <h3 className="card-title">Auditor Settings</h3>
              </div>

              {/* Audit Scope Scoping */}
              <div className="form-group" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px', marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '8px' }}>
                  Audit Scope Selection
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <span>Course:</span>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{courseTitle}</span>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Select Section (Optional)
                    </label>
                    <Select
                      value={selectedSectionId}
                      onChange={(e) => {
                        setSelectedSectionId(e.target.value);
                        setSelectedLessonId('');
                      }}
                      displayEmpty
                      size="small"
                      sx={selectSx}
                      MenuProps={menuProps}
                    >
                      <MenuItem value="">All Sections (Entire Course)</MenuItem>
                      {sections.map((sec) => (
                        <MenuItem key={sec.id} value={sec.id}>
                          {sec.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>

                  {selectedSectionId && (
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Select Lesson (Optional)
                      </label>
                      <Select
                        value={selectedLessonId}
                        onChange={(e) => setSelectedLessonId(e.target.value)}
                        displayEmpty
                        size="small"
                        sx={selectSx}
                        MenuProps={menuProps}
                      >
                        <MenuItem value="">All Lessons in Section</MenuItem>
                        {((sections.find(s => String(s.id) === String(selectedSectionId)) || {}).lessons || []).map((les) => (
                          <MenuItem key={les.id} value={les.id}>
                            {les.title}
                          </MenuItem>
                        ))}
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Toggle Switch */}
              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-label">Periodic Auditing</span>
                  <span className="toggle-description">Run background audits automatically</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleActive}
                  className={`toggle-switch ${config.isActive ? 'active' : ''}`}
                  aria-label="Toggle Periodic Auditing"
                >
                  <div className="toggle-thumb" />
                </button>
              </div>

              {/* Intelligent Self-Search Toggle Switch */}
              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-label">Self-Directed Search</span>
                  <span className="toggle-description">Let AI generate queries if keywords are empty</span>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, autoSearch: !prev.autoSearch }))}
                  className={`toggle-switch ${config.autoSearch ? 'active' : ''}`}
                  aria-label="Toggle Self-Directed Search"
                >
                  <div className="toggle-thumb" />
                </button>
              </div>

              {/* Auto Fix High Relevance Toggle Switch */}
              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-label">Auto-Apply Critical Fixes</span>
                  <span className="toggle-description">Instantly apply high-importance updates</span>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, autoFixHighRelevance: !prev.autoFixHighRelevance }))}
                  className={`toggle-switch ${config.autoFixHighRelevance ? 'active' : ''}`}
                  aria-label="Toggle Auto-Apply Critical Fixes"
                >
                  <div className="toggle-thumb" />
                </button>
              </div>

              {/* Run Interval Dropdown */}
              <div className="form-group">
                <label className="form-label">
                  <Clock className="form-label-icon" />
                  Run Interval
                </label>
                <Select
                  value={config.auditInterval}
                  onChange={handleIntervalChange}
                  size="small"
                  sx={selectSx}
                  MenuProps={menuProps}
                >
                  <MenuItem value="manual">Manual Only (No Auto-Run)</MenuItem>
                  <MenuItem value="10m">Every 10 Minutes (Test Mode)</MenuItem>
                  <MenuItem value="1h">Every Hour</MenuItem>
                  <MenuItem value="1d">Every Day (Recommended)</MenuItem>
                  <MenuItem value="7d">Every Week</MenuItem>
                </Select>
              </div>

              {/* Keywords Tag Panel */}
              <div className="form-group">
                <label className="form-label">
                  <Tag className="form-label-icon" />
                  Search Grounding Keywords
                </label>
                
                {/* Keyword tags container */}
                <div className="tags-box">
                  {config.searchKeywords.length === 0 ? (
                    <span className="tags-empty">
                      No keywords configured. Add tags like "Next.js 15" or "Kubernetes".
                    </span>
                  ) : (
                    config.searchKeywords.map((kw, i) => (
                      <span key={i} className="tag-pill">
                        {kw}
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(kw)}
                          className="tag-close"
                          title="Remove keyword"
                        >
                          <X style={{ width: '12px', height: '12px' }} />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Tag Input Form */}
                <form onSubmit={handleAddKeyword} className="input-row-form">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="e.g. React 19, Django 5"
                    className="input-text"
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '10px 14px' }}
                  >
                    <Plus style={{ width: '16px', height: '16px' }} />
                  </button>
                </form>
              </div>

              {/* Reference Websites (URLs) Panel */}
              <div className="form-group">
                <label className="form-label">
                  <Globe className="form-label-icon" />
                  Reference Websites (URLs)
                </label>
                
                {/* Website tags container */}
                <div className="tags-box">
                  {!config.websites || config.websites.length === 0 ? (
                    <span className="tags-empty">
                      No reference websites configured. Add URLs to compare with curriculum.
                    </span>
                  ) : (
                    config.websites.map((url, i) => (
                      <span key={i} className="tag-pill">
                        {url}
                        <button
                          type="button"
                          onClick={() => handleRemoveWebsite(url)}
                          className="tag-close"
                          title="Remove website"
                        >
                          <X style={{ width: '12px', height: '12px' }} />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Website Input Form */}
                <form onSubmit={handleAddWebsite} className="input-row-form">
                  <input
                    type="url"
                    value={websiteInput}
                    onChange={(e) => setWebsiteInput(e.target.value)}
                    placeholder="e.g. https://react.dev/reference/react"
                    className="input-text"
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '10px 14px' }}
                  >
                    <Plus style={{ width: '16px', height: '16px' }} />
                  </button>
                </form>
              </div>

              {/* Save Settings Button */}
              <button
                onClick={handleSaveConfig}
                disabled={isSavingConfig || isLoadingConfig}
                className="btn btn-outline"
                style={{ width: '100%', marginTop: '8px' }}
              >
                {isSavingConfig ? (
                  <>
                    <Loader2 className="loading-spinner" style={{ width: '14px', height: '14px', margin: 0 }} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Configuration</span>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: NEWS CARD + SUGGESTIONS DIFF PANEL */}
          <div className="right-col">
            
            {/* MULTIPLE REPORTS SELECTOR */}
            {pendingReports.length > 1 && (
              <div className="report-bar">
                <span className="report-bar-label">Pending Audits:</span>
                <Select
                  value={selectedReportId}
                  onChange={(e) => setSelectedReportId(e.target.value)}
                  size="small"
                  sx={reportSelectSx}
                  MenuProps={menuProps}
                >
                  {pendingReports.map((rep, idx) => (
                    <MenuItem key={rep.id} value={rep.id}>
                      Audit suggestion #{pendingReports.length - idx} ({new Date(rep.createdAt).toLocaleString()})
                    </MenuItem>
                  ))}
                </Select>
              </div>
            )}

            {/* IF NO PENDING REPORTS */}
            {pendingReports.length === 0 ? (
              <div className="empty-state">
                <FileText className="empty-icon" />
                <h4 className="empty-title">All Caught Up!</h4>
                <p className="empty-text">
                  There are no pending auditor reports for this course. Click the "Audit Now" button in the top right to check for updates immediately.
                </p>
              </div>
            ) : (
              <>
                {/* 1. NEWS SUMMARY CARD */}
                {activeReport?.techNewsSummary && (
                  <div className="news-card">
                    <div className="news-icon-container">
                      <Info style={{ width: '20px', height: '20px' }} />
                    </div>
                    <div className="news-details">
                      <h4 className="news-title">AI Grounding News Summary</h4>
                      <p className="news-content">
                        {activeReport.techNewsSummary}
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. SUGGESTED UPDATES PANEL (GIT DIFF REVIEW) */}
                <div className="diff-container">
                  <div className="diff-panel-title-row">
                    <h3 className="diff-panel-title">
                      <span>Suggested Changes</span>
                      <span className="diff-badge-count">
                        {activeReport?.suggestedUpdates?.length || 0}
                      </span>
                    </h3>
                    
                    <button
                      type="button"
                      onClick={() => activeReport && handleRejectReport(activeReport.id)}
                      disabled={actioningId === 'reject-all' || !activeReport}
                      className="btn-text-link"
                    >
                      {actioningId === 'reject-all' ? (
                        <>
                          <Loader2 className="loading-spinner" style={{ width: '12px', height: '12px', margin: 0 }} />
                          <span>Dismissing...</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle style={{ width: '14px', height: '14px' }} />
                          <span>Dismiss Report</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Filter and Bulk Action Row */}
                  <div className="filter-controls-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: 'rgba(255, 255, 255, 0.03)', padding: '10px 16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Importance Filter:</span>
                      <button
                        type="button"
                        onClick={() => setRelevanceFilter('all')}
                        className={`btn-pill ${relevanceFilter === 'all' ? 'active' : ''}`}
                        style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', cursor: 'pointer', border: 'none' }}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setRelevanceFilter('high')}
                        className={`btn-pill ${relevanceFilter === 'high' ? 'active' : ''}`}
                        style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', cursor: 'pointer', border: 'none' }}
                      >
                        High Only
                      </button>
                    </div>

                    {activeReport?.suggestedUpdates?.some(s => s.relevance === 'high') && (
                      <button
                        type="button"
                        onClick={handleApproveAllHighRelevance}
                        disabled={actioningId !== null}
                        className="btn btn-success"
                        style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        {actioningId === 'approve-all-high' ? (
                          <>
                            <Loader2 className="loading-spinner" style={{ width: '12px', height: '12px', margin: 0 }} />
                            <span>Approving...</span>
                          </>
                        ) : (
                          <>
                            <Check style={{ width: '12px', height: '12px' }} />
                            <span>Approve All High Importance</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {(() => {
                    const filteredUpdates = (activeReport?.suggestedUpdates || [])
                      .map((update, originalIndex) => ({ update, originalIndex }))
                      .filter(({ update }) => {
                        if (relevanceFilter === 'high') {
                          return update.relevance === 'high';
                        }
                        return true;
                      });

                    if (filteredUpdates.length === 0) {
                      return (
                        <div className="empty-state" style={{ minHeight: '150px', padding: '20px' }}>
                          <p className="empty-text" style={{ fontStyle: 'italic' }}>
                            No suggestions found matching the current filter.
                          </p>
                        </div>
                      );
                    }
                    const maxIdx = Math.max(0, filteredUpdates.length - 1);
                    const currentIdx = Math.min(changeIndex, maxIdx);
                    const { update, originalIndex } = filteredUpdates[currentIdx];

                    return (
                      <div className="diff-container" style={{ gap: '16px' }}>
                        {/* Pagination Bar */}
                        {filteredUpdates.length > 1 && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', background: 'rgba(255, 255, 255, 0.02)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--divider)' }}>
                            <button
                              type="button"
                              className="btn btn-outline"
                              disabled={currentIdx === 0}
                              onClick={() => setChangeIndex(prev => prev - 1)}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px', cursor: 'pointer', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--divider)' }}
                            >
                              Previous
                            </button>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                              Change {currentIdx + 1} of {filteredUpdates.length}
                            </span>
                            <button
                              type="button"
                              className="btn btn-outline"
                              disabled={currentIdx === maxIdx}
                              onClick={() => setChangeIndex(prev => prev + 1)}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px', cursor: 'pointer', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--divider)' }}
                            >
                              Next
                            </button>
                          </div>
                        )}

                        <div key={originalIndex} className="diff-card">
                          
                          {/* Header */}
                          <div className="diff-card-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span className="diff-card-index">
                                Suggestion #{originalIndex + 1}
                              </span>
                              {update?.relevance && (
                                <span className={`relevance-badge relevance-${update.relevance}`} style={{
                                  fontSize: '0.7rem',
                                  fontWeight: '800',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: update.relevance === 'high' ? 'rgba(229, 57, 53, 0.15)' : update.relevance === 'medium' ? 'rgba(251, 140, 0, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                                  color: update.relevance === 'high' ? '#ff8a80' : update.relevance === 'medium' ? '#ffd180' : '#cfd8dc',
                                  border: `1px solid ${update.relevance === 'high' ? 'rgba(229,57,53,0.3)' : update.relevance === 'medium' ? 'rgba(251,140,0,0.3)' : 'rgba(255,255,255,0.15)'}`
                                }}>
                                  {update.relevance.toUpperCase()} IMPORTANCE
                                </span>
                              )}
                              {update?.action && (
                                <span className={`action-badge action-${update.action}`} style={{
                                  fontSize: '0.7rem',
                                  fontWeight: '800',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: update.action === 'delete_page' ? 'rgba(244, 67, 54, 0.2)' : update.action === 'delete_content' ? 'rgba(255, 152, 0, 0.2)' : 'rgba(76, 175, 80, 0.15)',
                                  color: update.action === 'delete_page' ? '#ff1744' : update.action === 'delete_content' ? '#ff9100' : '#b9f6ca',
                                  border: `1px solid ${update.action === 'delete_page' ? 'rgba(244,67,54,0.4)' : update.action === 'delete_content' ? 'rgba(255,152,0,0.4)' : 'rgba(76, 175, 80, 0.3)'}`
                                }}>
                                  {update.action === 'delete_page' ? '⚠️ DELETE PAGE' : update.action === 'delete_content' ? '🗑️ DELETE CONTENT' : 'REPLACE TEXT'}
                                </span>
                              )}
                            </div>
                            <span className="diff-card-target">
                              Target: Lesson Content
                            </span>
                          </div>

                          {/* Diff Side-by-side or Stacked grid */}
                          <div className="diff-grid">
                            
                            {/* Current Content (Light Red Background, Red Border) */}
                            <div className="diff-original">
                              <div className="diff-label-row red">
                                <span className="diff-sign red">-</span>
                                <span>Current Content</span>
                              </div>
                              <div className="diff-content-wrapper">
                                {renderSafeContent(update?.originalTextChunk)}
                              </div>
                            </div>

                            {/* Suggested Replacement (Light Green Background, Green Border) */}
                            <div className="diff-suggested">
                              <div className="diff-label-row green">
                                <span className="diff-sign green">+</span>
                                <span>Suggested Update</span>
                              </div>
                              <div className="diff-content-wrapper">
                                {renderSafeContent(update?.suggestedReplacement)}
                              </div>
                            </div>

                          </div>

                          {/* Footer: Reasoning and Action Buttons */}
                          <div className="diff-card-footer">
                            
                            {/* Reasoning (Neutral Gray Callout) */}
                            <div className="reasoning-callout">
                              <HelpCircle className="reasoning-icon" />
                              <div>
                                <span className="reasoning-label">Reasoning: </span>
                                {update?.reasoning}
                              </div>
                            </div>

                            {/* Actions Group (Approve next to block) */}
                            <div className="diff-action-group">
                              <button
                                onClick={() => activeReport && handleApproveSuggestion(activeReport.id, originalIndex)}
                                disabled={actioningId !== null || !activeReport}
                                className="btn btn-success"
                              >
                                {actioningId === `approve-${originalIndex}` ? (
                                  <>
                                    <Loader2 className="loading-spinner" style={{ width: '14px', height: '14px', margin: 0 }} />
                                    <span>Applying...</span>
                                  </>
                                ) : (
                                  <>
                                    <Check style={{ width: '14px', height: '14px' }} />
                                    <span>Approve Change</span>
                                  </>
                                )}
                              </button>
                            </div>

                          </div>

                        </div>
                      </div>
                    );
                  })()}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
