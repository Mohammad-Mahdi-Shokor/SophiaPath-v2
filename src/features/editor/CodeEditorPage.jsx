import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Button,
  Snackbar,
  Alert,
  Collapse
} from '@mui/material';
import { 
  FileCode, 
  Code2,
  Folder as FolderIcon, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Copy, 
  Settings, 
  Plus, 
  FolderPlus, 
  Trash2, 
  Download, 
  Layout, 
  PanelLeftClose, 
  PanelLeftOpen,
  Edit2
} from 'lucide-react';
import Editor, { loader } from '@monaco-editor/react';
import { useTheme as useAppTheme } from '../../context/ThemeContext';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import './CodeEditor.css';

// Using a fresh, stable key for the final version
const STORAGE_FILES = 'sophia_ide_v6_files';
const STORAGE_ACTIVE = 'sophia_ide_v6_active';
const STORAGE_WIDTH = 'sophia_ide_v6_width';
const STORAGE_SIDEBAR = 'sophia_ide_v6_open';

const INITIAL_FILES = [
  { id: '1', name: 'index.html', content: '<div id="root"></div>', language: 'html', type: 'file', parentId: null },
  { id: '2', name: 'App.tsx', content: `import React from 'react';\n\nconst App = () => {\n  return (\n    <div className="p-10 text-center">\n      <h1 className="text-4xl font-bold">Hello World</h1>\n      <p className="mt-4">Everything is working! Edit this to start.</p>\n    </div>\n  );\n};\n\nexport default App;`, language: 'typescript', type: 'file', parentId: null },
  { id: '3', name: 'styles.css', content: 'body { margin: 0; font-family: system-ui; }', language: 'css', type: 'file', parentId: null }
];

const CodeEditorPage = () => {
  const { isDarkMode } = useAppTheme();
  
  // 1. Onboarding first-time tour state
  const [activeStepIndex, setActiveStepIndex] = useState(null);
  const [spotlightRect, setSpotlightRect] = useState(null);
  const [activeTour, setActiveTour] = useState(null);

  const EDITOR_STEPS = [
    {
      target: '.vscode-sidebar-header button:first-of-type',
      title: 'New File Creation',
      description: 'Click here to create a blank new file in your current workspace directory.',
      placement: 'right'
    },
    {
      target: '.vscode-sidebar-header button:nth-of-type(2)',
      title: 'New Folder Creation',
      description: 'Click here to create a new subfolder to organize your workspace files.',
      placement: 'right'
    },
    {
      target: '.vscode-export-btn',
      title: 'Export Workspace',
      description: 'Click this button to download your entire project files compiled as a ZIP archive.',
      placement: 'bottom'
    }
  ];

  useEffect(() => {
    const visited = localStorage.getItem('visited_page_editor');
    if (!visited) {
      setActiveTour('page');
      setActiveStepIndex(0);
    }
  }, []);

  // 2. Scroll and measure target elements
  useEffect(() => {
    if (activeStepIndex === null || activeTour === null) {
      setSpotlightRect(null);
      return;
    }
    const step = EDITOR_STEPS[activeStepIndex];
    let attempts = 0;
    
    const scrollAndMeasure = () => {
      const element = document.querySelector(step.target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(measureOnly, 300);
      } else if (attempts < 15) {
        attempts++;
        setTimeout(scrollAndMeasure, 200);
      } else {
        setSpotlightRect(null);
      }
    };
    
    const measureOnly = () => {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setSpotlightRect({
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          right: rect.right,
          bottom: rect.bottom
        });
      }
    };
    
    scrollAndMeasure();
    window.addEventListener('resize', measureOnly);
    window.addEventListener('scroll', measureOnly);
    return () => {
      window.removeEventListener('resize', measureOnly);
      window.removeEventListener('scroll', measureOnly);
    };
  }, [activeStepIndex, activeTour]);

  // 3. Lock scroll during active tour
  useEffect(() => {
    if (activeTour !== null) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [activeTour]);

  const handleSkipTutorial = () => {
    localStorage.setItem('visited_page_editor', 'true');
    setActiveTour(null);
    setActiveStepIndex(null);
  };

  const handleNextStep = () => {
    if (activeStepIndex < EDITOR_STEPS.length - 1) {
      setActiveStepIndex(prev => prev + 1);
    } else {
      localStorage.setItem('visited_page_editor', 'true');
      setActiveTour(null);
      setActiveStepIndex(null);
    }
  };

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(prev => prev - 1);
    }
  };

  const renderTutorialOverlay = () => {
    if (activeTour === null || activeStepIndex === null) return null;
    return (
      <Box 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 999980,
          backgroundColor: 'transparent',
          pointerEvents: 'auto'}}
      />
    );
  };

  const renderTutorialSpotlight = () => {
    if (activeTour === null || activeStepIndex === null || !spotlightRect) return null;
    return (
      <div 
        style={{
          position: 'fixed',
          left: `${spotlightRect.left - 8}px`,
          top: `${spotlightRect.top - 8}px`,
          width: `${spotlightRect.width + 16}px`,
          height: `${spotlightRect.height + 16}px`,
          
          borderRadius: '8px',
          border: '2px solid var(--primary-main)',
          pointerEvents: 'none',
          zIndex: 999990,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'}}
      />
    );
  };

  const renderTutorialTooltip = () => {
    if (activeTour === null || activeStepIndex === null) return null;
    const step = EDITOR_STEPS[activeStepIndex];
    
    let style = {
      position: 'fixed',
      zIndex: 999995,
      width: '320px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'};
    
    if (spotlightRect) {
      let placement = step.placement;
      if (placement === 'right' && spotlightRect.right + 336 > window.innerWidth) {
        placement = spotlightRect.left - 336 > 16 ? 'left' : 'bottom';
      }
      if (placement === 'bottom' && spotlightRect.bottom + 220 > window.innerHeight) {
        placement = spotlightRect.top - 220 > 16 ? 'top' : 'right';
      }
      
      if (placement === 'right') {
        style.left = `${spotlightRect.right + 16}px`;
        style.top = `${spotlightRect.top + (spotlightRect.height / 2) - 100}px`;
      } else if (placement === 'left') {
        style.left = `${spotlightRect.left - 336}px`;
        style.top = `${spotlightRect.top + (spotlightRect.height / 2) - 100}px`;
      } else if (placement === 'top') {
        style.left = `${spotlightRect.left + (spotlightRect.width / 2) - 160}px`;
        style.top = `${spotlightRect.top - 220}px`;
      } else {
        style.left = `${spotlightRect.left + (spotlightRect.width / 2) - 160}px`;
        style.top = `${spotlightRect.bottom + 16}px`;
      }
      
      if (parseFloat(style.left) < 16) style.left = '16px';
      if (parseFloat(style.left) + 320 > window.innerWidth - 16) {
        style.left = `${window.innerWidth - 336}px`;
      }
      if (parseFloat(style.top) < 16) style.top = '16px';
      if (parseFloat(style.top) + 200 > window.innerHeight - 16) {
        style.top = `${window.innerHeight - 216}px`;
      }
    } else {
      style.left = '50%';
      style.top = '50%';
      style.transform = 'translate(-50%, -50%)';
    }
    
    return (
      <Paper 
        style={style}
        sx={{
          p: 2.5,
          borderRadius: 3,
          
          border: '1px solid rgba(255, 255, 255, 0.15)',
          background: 'var(--background-paper) !important'}}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, color: 'var(--primary-main)' }}>
          {step.title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 2, lineHeight: 1.5 }}>
          {step.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <Typography variant="caption" sx={{ color: 'var(--text-disabled)', fontWeight: 600 }}>
            Step {activeStepIndex + 1} of {EDITOR_STEPS.length}
          </Typography>
          
          <Box style={{ display: 'flex', gap: '8px' }}>
            <Button 
              size="small"
              onClick={handleSkipTutorial}
              sx={{ textTransform: 'none', color: 'var(--text-secondary)' }}
            >
              Skip
            </Button>
            {activeStepIndex > 0 && (
              <Button 
                size="small" 
                variant="outlined"
                onClick={handlePrevStep}
                sx={{ textTransform: 'none', borderRadius: 1.5 }}
              >
                Back
              </Button>
            )}
            <Button 
              size="small" 
              variant="contained"
              onClick={handleNextStep}
              sx={{ textTransform: 'none', borderRadius: 1.5 }}
            >
              {activeStepIndex === EDITOR_STEPS.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </Box>
      </Paper>
    );
  };

  // State Initialization
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem(STORAGE_FILES);
    return saved ? JSON.parse(saved) : INITIAL_FILES;
  });
  const [activeFileId, setActiveFileId] = useState(() => localStorage.getItem(STORAGE_ACTIVE) || '2');
  const [sidebarWidth, setSidebarWidth] = useState(() => parseInt(localStorage.getItem(STORAGE_WIDTH)) || 260);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem(STORAGE_SIDEBAR);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [srcDoc, setSrcDoc] = useState('');
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState(['root']);
  const [editingId, setEditingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Persistence Hook
  useEffect(() => {
    localStorage.setItem(STORAGE_FILES, JSON.stringify(files));
    localStorage.setItem(STORAGE_ACTIVE, activeFileId);
    localStorage.setItem(STORAGE_WIDTH, sidebarWidth.toString());
    localStorage.setItem(STORAGE_SIDEBAR, JSON.stringify(isSidebarOpen));
  }, [files, activeFileId, sidebarWidth, isSidebarOpen]);

  // Monaco Initialization
  useEffect(() => {
    loader.init().then((monaco) => {
      monaco.editor.defineTheme('black-theme', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: { 'editor.background': '#000000', 'editor.lineHighlightBackground': '#111111' }});
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        jsx: monaco.languages.typescript.JsxEmit.React,
        allowJs: true,
        target: monaco.languages.typescript.ScriptTarget.ESNext});
      setThemeLoaded(true);
    });
  }, []);

  // Bundler logic
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        const htmlFile = files.find(f => f.name.endsWith('.html'))?.content || '';
        const cssFiles = files.filter(f => f.name.endsWith('.css')).map(f => f.content).join('\n');
        const reactFiles = files.filter(f => f.type === 'file' && (f.name.endsWith('.tsx') || f.name.endsWith('.jsx') || f.name.endsWith('.js')));
        
        const combinedJs = reactFiles.map(f => {
          let content = f.content || '';
          content = content.replace(/import .* from .*/g, '').replace(/export default (\w+);/, 'window.App = $1;'); 
          return content;
        }).join('\n');

        setSrcDoc(`
          <!DOCTYPE html>
          <html>
            <head>
              <script src="https://cdn.tailwindcss.com"></script>
              <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
              <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
              <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
              <style>${cssFiles}</style>
            </head>
            <body>
              ${htmlFile}
              <script type="text/babel">
                try {
                  ${combinedJs}
                  const root = ReactDOM.createRoot(document.getElementById('root'));
                  if (window.App) root.render(React.createElement(window.App));
                } catch (e) {
                  console.error(e);
                  document.body.innerHTML = '<div style="color:red;padding:20px;">Runtime Error: ' + e.message + '</div>';
                }
              </script>
            </body>
          </html>
        `);
      } catch (err) {
        console.error('Bundler error:', err);
      }
    }, 800);
    return () => clearTimeout(timeout);
  }, [files]);

  // Sidebar Resizing
  const isResizing = useRef(false);
  const handleMouseDown = () => { isResizing.current = true; document.body.style.cursor = 'col-resize'; };
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      const newWidth = e.clientX - 50;
      if (newWidth > 150 && newWidth < 600) setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => { isResizing.current = false; document.body.style.cursor = 'default'; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const activeFile = useMemo(() => files.find(f => f.id === activeFileId), [files, activeFileId]);

  const handleExport = async () => {
    const zip = new JSZip();
    const buildZip = (parentId = null, currentPath = '') => {
      files.filter(f => f.parentId === parentId).forEach(item => {
        const itemPath = currentPath ? `${currentPath}/${item.name}` : item.name;
        if (item.type === 'file') zip.file(itemPath, item.content || '');
        else buildZip(item.id, itemPath);
      });
    };
    buildZip();
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'sophia-project.zip');
    setSnackbar({ open: true, message: 'Project Exported!', severity: 'success' });
  };

  const createEntry = (type) => {
    const selectedFolderId = activeFile?.type === 'folder' ? activeFile.id : (activeFile?.parentId || null);
    const name = type === 'file' ? 'new-file.tsx' : 'new-folder';
    const newEntry = {
      id: Date.now().toString(),
      name,
      type,
      content: type === 'file' ? '' : null,
      language: name.endsWith('.html') ? 'html' : name.endsWith('.css') ? 'css' : 'typescript',
      parentId: selectedFolderId
    };
    setFiles(prev => [...prev, newEntry]);
    setEditingId(newEntry.id);
    setRenameValue(newEntry.name);
    if (type === 'file') setActiveFileId(newEntry.id);
    else if (selectedFolderId) setExpandedFolders(prev => [...new Set([...prev, selectedFolderId])]);
  };

  const handleRename = () => {
    if (!renameValue) return setEditingId(null);
    setFiles(prev => prev.map(f => f.id === editingId ? { ...f, name: renameValue, language: renameValue.endsWith('.html') ? 'html' : renameValue.endsWith('.css') ? 'css' : 'typescript' } : f));
    setEditingId(null);
  };

  const renderTree = (parentId = null, level = 0) => {
    return files.filter(f => f.parentId === parentId).map(item => (
      <React.Fragment key={item.id}>
        <div
          draggable
          onDragStart={(e) => { e.stopPropagation(); e.dataTransfer.setData('text/plain', item.id); }}
          onDragOver={(e) => { if (item.type === 'folder') e.preventDefault(); }}
          onDrop={(e) => {
            e.preventDefault(); e.stopPropagation();
            const sourceId = e.dataTransfer.getData('text/plain');
            if (sourceId && sourceId !== item.id) {
              setFiles(prev => prev.map(f => f.id === sourceId ? { ...f, parentId: item.type === 'folder' ? item.id : item.parentId } : f));
            }
          }}
        >
          <ListItem disablePadding sx={{ pl: level * 1.5 }}>
            <ListItemButton 
              selected={activeFileId === item.id}
              onClick={() => item.type === 'file' ? setActiveFileId(item.id) : setExpandedFolders(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])}
              onDoubleClick={() => { setEditingId(item.id); setRenameValue(item.name); }}
              className="vscode-item"
            >
              <ListItemIcon className="vscode-icon">
                {item.type === 'folder' ? (
                  expandedFolders.includes(item.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                ) : (
                  item.name.endsWith('.html') ? <FileCode size={16} color="#e34f26" /> :
                  item.name.endsWith('.css') ? <Code2 size={16} color="#1572b6" /> :
                  <FileCode size={16} color="#61dafb" />
                )}
              </ListItemIcon>
              {editingId === item.id ? (
                <TextField autoFocus size="small" variant="standard" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onBlur={handleRename} onKeyDown={(e) => e.key === 'Enter' && handleRename()} sx={{ '& input': { color: 'white', fontSize: '0.8rem', padding: 0 } }} />
              ) : (
                <ListItemText primary={item.name} className="vscode-text" />
              )}
              <Box className="vscode-actions">
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setEditingId(item.id); setRenameValue(item.name); }}><Edit2 size={12} /></IconButton>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setFiles(prev => prev.filter(f => f.id !== item.id)); }}><Trash2 size={12} /></IconButton>
              </Box>
            </ListItemButton>
          </ListItem>
        </div>
        {item.type === 'folder' && (
          <Collapse in={expandedFolders.includes(item.id)}><List disablePadding>{renderTree(item.id, level + 1)}</List></Collapse>
        )}
      </React.Fragment>
    ));
  };

  return (
    <Box className="vscode-container" onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
      const sourceId = e.dataTransfer.getData('text/plain');
      if (sourceId) setFiles(prev => prev.map(f => f.id === sourceId ? { ...f, parentId: null } : f));
    }}>
      {/* Activity Bar */}
      <Box className="vscode-activity-bar">
        <Tooltip title="Explorer" placement="right">
          <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)} sx={{ color: isSidebarOpen ? 'var(--primary-main)' : 'inherit' }}><Copy size={24} /></IconButton>
        </Tooltip>
        <Tooltip title="Search" placement="right"><IconButton><Search size={24} /></IconButton></Tooltip>
        <Tooltip title="Source Control" placement="right"><IconButton><Layout size={24} /></IconButton></Tooltip>
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Settings" placement="right"><IconButton><Settings size={24} /></IconButton></Tooltip>
      </Box>

      {/* Sidebar */}
      {isSidebarOpen && (
        <Box className="vscode-sidebar-wrapper" style={{ width: sidebarWidth }}>
          <Box className="vscode-sidebar">
            <Box className="vscode-sidebar-header">
              <Typography variant="caption" className="vscode-sidebar-title">PROJECT</Typography>
              <Box>
                <Tooltip title="New File"><IconButton size="small" onClick={() => createEntry('file')}><Plus size={16} /></IconButton></Tooltip>
                <Tooltip title="New Folder"><IconButton size="small" onClick={() => createEntry('folder')}><FolderPlus size={16} /></IconButton></Tooltip>
              </Box>
            </Box>
            <List className="vscode-list">{renderTree(null)}</List>
          </Box>
          <Box className="vscode-resizer" onMouseDown={handleMouseDown} />
        </Box>
      )}

      {/* Editor & Preview */}
      <Box className="vscode-main">
        <Box className="vscode-editor-panel">
          <Box className="vscode-tabs">
            <Box className="vscode-tab active">
              {activeFile?.name?.endsWith('.html') ? <FileCode size={14} color="#e34f26" /> :
               activeFile?.name?.endsWith('.css') ? <Code2 size={14} color="#1572b6" /> :
               <FileCode size={14} color="#61dafb" />}
              <Typography variant="caption" sx={{ ml: 1 }}>{activeFile?.name || 'No file selected'}</Typography>
              <IconButton size="small" onClick={() => setIsSidebarOpen(!isSidebarOpen)} sx={{ ml: 1 }}>
                {isSidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
              </IconButton>
            </Box>
            <Box sx={{ flex: 1 }} />
            <Button startIcon={<Download size={14} />} variant="contained" onClick={handleExport} className="vscode-export-btn">EXPORT PROJECT (ZIP)</Button>
          </Box>
          <Box className="vscode-editor-content">
            {!themeLoaded && isDarkMode ? (
              <Box className="vscode-loading"><Typography variant="caption">Booting IDE...</Typography></Box>
            ) : activeFile && activeFile.type === 'file' ? (
              <Editor
                height="100%"
                language={activeFile.language || 'typescript'}
                value={activeFile.content || ''}
                onChange={(v) => setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: v || '' } : f))}
                options={{ fontSize: 13, minimap: { enabled: false }, automaticLayout: true, theme: isDarkMode ? 'black-theme' : 'vs-light' }}
              />
            ) : (
              <Box className="vscode-loading">
                <Typography variant="body2" color="text.secondary">Select a file to edit</Typography>
              </Box>
            )}
          </Box>
        </Box>
        <Box className="vscode-preview-panel">
          <Box className="vscode-preview-header"><Typography variant="caption">LIVE PREVIEW</Typography><Box className="status-dot" /></Box>
          <iframe srcDoc={srcDoc} className="vscode-iframe" title="preview" frameBorder="0" />
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>

      {renderTutorialOverlay()}
      {renderTutorialSpotlight()}
      {renderTutorialTooltip()}
    </Box>
  );
};

export default CodeEditorPage;
