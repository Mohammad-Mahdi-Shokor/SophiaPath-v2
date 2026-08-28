import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { buildTheme } from '../theme/theme';

const hexToRgb = (color) => {
  if (!color) return '';
  if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g);
    if (match && match.length >= 3) {
      return `${match[0]}, ${match[1]}, ${match[2]}`;
    }
  }
  const cleanHex = color.replace('#', '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0].repeat(2), 16);
    const g = parseInt(cleanHex[1].repeat(2), 16);
    const b = parseInt(cleanHex[2].repeat(2), 16);
    return `${r}, ${g}, ${b}`;
  } else if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }
  return '';
};

const isColorDark = (hexColor) => {
  if (!hexColor) return false;
  const cleanHex = hexColor.replace('#', '');
  let r, g, b;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0].repeat(2), 16);
    g = parseInt(cleanHex[1].repeat(2), 16);
    b = parseInt(cleanHex[2].repeat(2), 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else {
    return false;
  }
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 128;
};

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);


const updateFavicon = (primaryMain, primaryDark) => {
  try {
    const faviconLink = document.querySelector("link[rel='icon']");
    if (!faviconLink) return;
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
      <defs>
        <mask id="logo-mask">
          <image width="64" height="64" href="data:image/png;base64,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" />
        </mask>
      </defs>
      <g mask="url(#logo-mask)">
        <rect x="0" y="0" width="32" height="64" fill="${primaryMain}" />
        <rect x="32" y="0" width="32" height="64" fill="${primaryDark}" />
      </g>
    </svg>`;
    faviconLink.href = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgContent);
  } catch (e) {
    console.error('Failed to update favicon:', e);
  }
};

export const CustomThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    const savedTheme = localStorage.getItem('themeMode') || localStorage.getItem('theme');
    if (['light', 'dark', 'sepia', 'lava', 'ocean', 'forest', 'amber', 'dracula', 'amethyst', 'nordic', 'mint', 'lavender', 'peach', 'rose', 'clay', 'kitty', 'midnight', 'custom'].includes(savedTheme)) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [customColors, setCustomColors] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('customThemeColors') || '{}');
    } catch (e) {
      return {};
    }
  });

  const updateCustomColors = (newColors) => {
    localStorage.setItem('customThemeColors', JSON.stringify(newColors));
    setCustomColors(newColors);
    // Force re-renders for theme propagation
    setThemeMode((prev) => (prev === 'custom' ? 'custom' : prev));
  };

  const currentTheme = useMemo(() => buildTheme(themeMode), [themeMode, customColors]);

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    localStorage.setItem('theme', themeMode); // fallback for older code
    document.documentElement.setAttribute('data-theme', themeMode);
    
    const rootStyle = document.documentElement.style;
    const isDark = ['dark', 'lava', 'ocean', 'forest', 'amber', 'dracula', 'amethyst', 'nordic', 'midnight'].includes(themeMode);
    
    // Extract colors dynamically from MUI theme palette
    const primaryMain = currentTheme.palette.primary.main;
    const primaryDark = currentTheme.palette.primary.dark;
    const primaryLight = currentTheme.palette.primary.light;
    const bgDefault = currentTheme.palette.background.default;
    const bgPaper = currentTheme.palette.background.paper;
    const textPrimary = currentTheme.palette.text.primary;
    const textSecondary = currentTheme.palette.text.secondary;
    const divider = currentTheme.palette.divider;

    const presetPaperAlts = {
      light: '#F0F4F8',
      dark: '#18193C',
      sepia: '#F3E8CE',
      lava: '#2a0e0e',
      ocean: '#143c6d',
      forest: '#11331f',
      amber: '#003746',
      dracula: '#242533',
      amethyst: '#341b4a',
      nordic: '#434c5e',
      mint: '#eafbf2',
      lavender: '#f6efff',
      peach: '#ffeeda',
      rose: '#ffe5eb',
      clay: '#f0f0f0',
      kitty: '#ffdce5',
      midnight: '#172033'
    };

    const presetCodeBgs = {
      light: '#F7F9FC',
      dark: '#0F1424',
      sepia: '#F5ECD5',
      lava: '#110505',
      ocean: '#001b3a',
      forest: '#05140b',
      amber: '#073642',
      dracula: '#282a36',
      amethyst: '#1a0b28',
      nordic: '#2e3440',
      mint: '#e8f7f0',
      lavender: '#f5efff',
      peach: '#fff5ea',
      rose: '#ffeef2',
      clay: '#f3f4f6',
      kitty: '#ffd1dc',
      midnight: '#080c16'
    };

    const bgPaperAlt = themeMode === 'custom' ? (customColors.bgPaperAlt || '#F0F4F8') : (presetPaperAlts[themeMode] || (isDark ? '#18193C' : '#F0F4F8'));
    const codeBg = themeMode === 'custom' ? (customColors.codeBg || '#f8f9fa') : (presetCodeBgs[themeMode] || (isDark ? '#0F1424' : '#F7F9FC'));

    const primaryMainRgb = hexToRgb(primaryMain);
    const primaryDarkRgb = hexToRgb(primaryDark);
    const dividerRgb = hexToRgb(divider) || primaryMainRgb;
    const bgPaperRgb = hexToRgb(bgPaper);
    const textPrimaryRgb = hexToRgb(textPrimary);
    const textSecondaryRgb = hexToRgb(textSecondary);

    rootStyle.setProperty('--primary-main', primaryMain);
    rootStyle.setProperty('--primary-dark', primaryDark);
    rootStyle.setProperty('--primary-light', primaryLight);
    rootStyle.setProperty('--primary-main-rgb', primaryMainRgb);
    rootStyle.setProperty('--primary-dark-rgb', primaryDarkRgb);
    updateFavicon(primaryMain, primaryDark);
    
    rootStyle.setProperty('--background-default', bgDefault);
    rootStyle.setProperty('--background-paper', bgPaper);
    rootStyle.setProperty('--background-paper-alt', bgPaperAlt);
    rootStyle.setProperty('--surface-elevated', bgPaper);
    rootStyle.setProperty('--surface-glass', bgPaperRgb ? `rgba(${bgPaperRgb}, 0.76)` : 'rgba(255, 255, 255, 0.76)');
    rootStyle.setProperty('--surface-glass-strong', bgPaperRgb ? `rgba(${bgPaperRgb}, 0.9)` : 'rgba(255, 255, 255, 0.9)');
    
    rootStyle.setProperty('--text-primary', textPrimary);
    rootStyle.setProperty('--text-secondary', textSecondary);
    rootStyle.setProperty('--text-disabled', textPrimaryRgb ? `rgba(${textPrimaryRgb}, 0.42)` : 'rgba(0, 0, 0, 0.42)');
    
    rootStyle.setProperty('--divider', divider);
    rootStyle.setProperty('--divider-rgb', dividerRgb);
    rootStyle.setProperty('--action-hover', primaryMainRgb ? `rgba(${primaryMainRgb}, 0.08)` : 'rgba(61, 92, 255, 0.08)');
    rootStyle.setProperty('--hero-gradient', primaryMain);
    
    rootStyle.setProperty('--code-bg', codeBg);
    rootStyle.setProperty('--code-header-bg', bgPaperAlt);
    rootStyle.setProperty('--code-border', divider);
    rootStyle.setProperty('--code-line-num', textSecondaryRgb ? `rgba(${textSecondaryRgb}, 0.38)` : 'rgba(0, 0, 0, 0.38)');
    rootStyle.setProperty('--code-text-default', textPrimary);
    
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  }, [themeMode, customColors, currentTheme]);

  const toggleTheme = () => {
    setThemeMode((prev) => {
      const isCurrentlyDark = ['dark', 'lava', 'ocean', 'forest', 'amber', 'dracula', 'amethyst', 'nordic', 'midnight'].includes(prev);
      return isCurrentlyDark ? 'light' : 'dark';
    });
  };
  
  const isDarkMode = useMemo(() => {
    if (themeMode === 'custom') {
      return isColorDark(customColors.bgDefault || '#F5F7FA');
    }
    return ['dark', 'lava', 'ocean', 'forest', 'amber', 'dracula', 'amethyst', 'nordic', 'midnight'].includes(themeMode);
  }, [themeMode, customColors]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, themeMode, setThemeMode, toggleTheme, customColors, updateCustomColors }}>
      <ThemeProvider theme={currentTheme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export { ThemeContext };
