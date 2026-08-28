import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { CustomThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import NavigationPage from './pages/NavigationPage';
import XssChallenge from './pages/challenges/XssChallenge';
import SqliChallenge from './pages/challenges/SqliChallenge';
import BacChallenge from './pages/challenges/BacChallenge';

import ScrollToTop from './components/ScrollToTop';
import logoImg from './assets/sp-logo.png';

function SplashWrapper() {
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashFade, setSplashFade] = useState(false);
  const [logoStyle, setLogoStyle] = useState(() => localStorage.getItem('sophiapath_logo_style') || 'split');

  useEffect(() => {
    const handleStyleChange = () => {
      setLogoStyle(localStorage.getItem('sophiapath_logo_style') || 'split');
    };
    window.addEventListener('logo_style_changed', handleStyleChange);
    return () => window.removeEventListener('logo_style_changed', handleStyleChange);
  }, []);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setSplashFade(true);
    }, 2500);

    const removeTimer = setTimeout(() => {
      setSplashVisible(false);
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <>
      {splashVisible && (
        <div className={`sp-splash-screen ${splashFade ? 'fade-out' : ''}`}>
          <div className="sp-splash-content-wrapper">
            <div 
              className={`sp-splash-logo-container ${logoStyle === 'gradient' ? 'sp-logo-gradient' : ''}`}
              style={{
                WebkitMaskImage: `url(${logoImg})`,
                maskImage: `url(${logoImg})`,
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
                WebkitMaskSize: 'contain',
                maskSize: 'contain'
              }}
            >
              <div className="sp-splash-logo-left" />
              <div className="sp-splash-logo-right" />
            </div>
            <div className="sp-splash-text">SophiaPath</div>
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  useEffect(() => {
    const applyCursor = () => {
      const cursorType = localStorage.getItem('sophiapath_custom_cursor') || 'default';
      let cursorStyle = 'default';
      if (cursorType === 'rounded') {
        cursorStyle = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M0 0l0 17l4.5 -4l4 8l2.5 -1l-4 -8l5.5 0z' fill='%23ffffff' stroke='%235c5c5c' stroke-width='2' stroke-linejoin='round' stroke-linecap='round'/></svg>") 0 0, auto`;
      } else if (cursorType === 'minimal') {
        cursorStyle = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M0 0l0 14l3.5 -3l3 6.5l1.5 -0.7l-3 -6.5l4.5 0z' fill='%23ffffff' stroke='%23222222' stroke-width='1'/></svg>") 0 0, auto`;
      } else if (cursorType === 'bold') {
        cursorStyle = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M0 0l0 18l5 -4l4.5 7.5l2.5 -1.5l-4.5 -7.5l6 0z' fill='%23ffffff' stroke='%23000000' stroke-width='2.5'/></svg>") 0 0, auto`;
      } else if (cursorType === 'glass') {
        cursorStyle = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M0 0l0 17l4.5 -4l4 8l2.5 -1l-4 -8l5.5 0z' fill='rgba(255,255,255,0.55)' stroke='rgba(255,255,255,0.95)' stroke-width='1.5'/></svg>") 0 0, auto`;
      } else if (cursorType === 'neon') {
        cursorStyle = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M0 0l0 17l4.5 -4l4 8l2.5 -1l-4 -8l5.5 0z' fill='%23090a15' stroke='%233D5CFF' stroke-width='1.75' style='filter:drop-shadow(0 0 2px %233D5CFF)'/></svg>") 0 0, auto`;
      } else if (cursorType === 'pixel') {
        cursorStyle = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M0 0v16h2v-2h2v-2h2v-2h4v-2h-2v-2h-2v-2h-2v-2h-2v-2z' fill='%238a2be2' stroke='%23ffffff' stroke-width='1.5'/></svg>") 0 0, auto`;
      } else if (cursorType === 'futuristic') {
        cursorStyle = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M0 0l6 18l3 -5l5 -5z' fill='%233D5CFF' stroke='%2300ffcc' stroke-width='1.5'/></svg>") 0 0, auto`;
      } else if (cursorType === 'crystal') {
        cursorStyle = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M0 0l0 17l5 -6z' fill='%23e0f7fa' stroke='%23ffffff' stroke-width='0.75'/><path d='M0 0l5 -6l5 0z' fill='%2380deea' stroke='%23ffffff' stroke-width='0.75'/><path d='M5 11l3 8l2 -1l-3 -7z' fill='%2300acc1' stroke='%23ffffff' stroke-width='0.75'/></svg>") 0 0, auto`;
      } else if (cursorType === 'contrast') {
        cursorStyle = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><path d='M0 0l0 24l6.5 -6l5.5 11l3.5 -2l-5.5 -11l7.5 0z' fill='%23000000' stroke='%23ffffff' stroke-width='2.5'/></svg>") 0 0, auto`;
      }
      
      document.documentElement.style.cursor = cursorStyle;
      
      let styleTag = document.getElementById('custom-cursor-style');
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'custom-cursor-style';
        document.head.appendChild(styleTag);
      }
      if (cursorStyle !== 'default') {
        styleTag.innerHTML = `a, button, [role="button"], input[type="submit"], input[type="button"], .interactive, .MuiButtonBase-root, .MuiIconButton-root, .MuiButton-root, .MuiChip-root, .MuiSwitch-root, .MuiListItem-button { cursor: ${cursorStyle} !important; }`;
      } else {
        styleTag.innerHTML = '';
      }
    };
    
    const applyGlobalFont = () => {
      const fontPref = localStorage.getItem('sophiapath_font_preference') || 'default';
      let fontStyleTag = document.getElementById('global-font-style');
      if (!fontStyleTag) {
        fontStyleTag = document.createElement('style');
        fontStyleTag.id = 'global-font-style';
        document.head.appendChild(fontStyleTag);
      }
      
      let fontLinkTag = document.getElementById('google-font-link');
      if (!fontLinkTag) {
        fontLinkTag = document.createElement('link');
        fontLinkTag.id = 'google-font-link';
        fontLinkTag.rel = 'stylesheet';
        document.head.appendChild(fontLinkTag);
      }

      if (fontPref === 'dyslexic') {
        fontLinkTag.href = '';
        fontStyleTag.innerHTML = `
          * {
            font-family: 'Comic Sans MS', 'Dyslexic', sans-serif !important;
            letter-spacing: 0.08em !important;
            word-spacing: 0.12em !important;
            line-height: 1.6 !important;
          }
        `;
      } else if (fontPref === 'serif') {
        fontLinkTag.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap';
        fontStyleTag.innerHTML = `
          body, p, span, li, button, input, textarea, div:not(.nav-brand):not(.nav-logo) {
            font-family: 'Playfair Display', Georgia, serif !important;
            letter-spacing: 0.01em !important;
            line-height: 1.65 !important;
          }
          h1, h2, h3, h4, h5, h6 {
            font-family: 'Playfair Display', Georgia, serif !important;
            font-weight: 800 !important;
          }
        `;
      } else if (fontPref === 'monospace') {
        fontLinkTag.href = 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&display=swap';
        fontStyleTag.innerHTML = `
          body, p, span, li, button, input, textarea, div {
            font-family: 'Fira Code', 'Consolas', monospace !important;
            letter-spacing: -0.02em !important;
          }
        `;
      } else if (fontPref === 'sans') {
        fontLinkTag.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300..900&display=swap';
        fontStyleTag.innerHTML = `
          body, p, span, li, button, input, textarea, div {
            font-family: 'Inter', sans-serif !important;
            letter-spacing: 0.02em !important;
          }
        `;
      } else {
        fontLinkTag.href = '';
        fontStyleTag.innerHTML = '';
      }
    };

    applyCursor();
    applyGlobalFont();
    
    window.addEventListener('custom_cursor_changed', applyCursor);
    window.addEventListener('dyslexic_font_changed', applyGlobalFont);
    return () => {
      window.removeEventListener('custom_cursor_changed', applyCursor);
      window.removeEventListener('dyslexic_font_changed', applyGlobalFont);
    };
  }, []);

  return (
    <CustomThemeProvider>
      <AuthProvider>
        <CssBaseline />
        <SplashWrapper />
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Standalone challenge sandbox routes — render outside the Navigation layout */}
            <Route path="/challenges/search" element={<XssChallenge />} />
            <Route path="/challenges/login" element={<SqliChallenge />} />
            <Route path="/challenges/files" element={<BacChallenge />} />
            {/* All other routes go through the Navigation layout */}
            <Route path="*" element={<NavigationPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;