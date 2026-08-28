import { alpha, createTheme } from '@mui/material/styles';

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

const baseColors = {
  primary: '#3D5CFF',
  primaryDark: '#2E49D1',
  primaryGlow: '#7C8DFF',
  darkBg: '#1F1F39',
  darkSurface: '#161632',
  darkSurfaceAlt: '#18193C',
  lightBg: '#F5F7FA',
  lightSurface: '#FCFDFF',
  lightSurfaceAlt: '#F0F4F8',
  white: '#FFFFFF',
  darkText: '#2D2D4D'};

const buildTheme = (mode) => {
  let isDark = ['dark', 'lava', 'ocean', 'forest', 'amber', 'dracula', 'amethyst', 'nordic', 'midnight'].includes(mode);
  
  let primaryMain = baseColors.primary;
  let primaryDark = baseColors.primaryDark;
  let primaryLight = baseColors.primaryGlow;
  
  let bgDefault = isDark ? baseColors.darkBg : baseColors.lightBg;
  let bgPaper = isDark ? baseColors.darkSurface : baseColors.lightSurface;
  
  let textPrimary = isDark ? baseColors.white : baseColors.darkText;

  if (mode === 'custom') {
    try {
      const custom = JSON.parse(localStorage.getItem('customThemeColors') || '{}');
      bgDefault = custom.bgDefault || '#F5F7FA';
      isDark = isColorDark(bgDefault);
      primaryMain = custom.primaryMain || '#3D5CFF';
      primaryDark = custom.primaryDark || '#2E49D1';
      primaryLight = custom.primaryLight || '#7C8DFF';
      bgPaper = custom.bgPaper || (isDark ? '#1E1E2F' : '#FFFFFF');
      textPrimary = custom.textPrimary || (isDark ? '#FFFFFF' : '#2D2D4D');
      textSecondary = custom.textSecondary || (isDark ? 'rgba(255, 255, 255, 0.72)' : 'rgba(45, 45, 77, 0.7)');
      dividerColor = custom.divider || (isDark ? 'rgba(159, 174, 255, 0.18)' : 'rgba(61, 92, 255, 0.14)');
    } catch (e) {
      // fallback
    }
  }
  
  let textSecondary = isDark ? 'rgba(255, 255, 255, 0.72)' : 'rgba(45, 45, 77, 0.7)';
  let textDisabled = isDark ? 'rgba(255, 255, 255, 0.42)' : 'rgba(45, 45, 77, 0.4)';
  
  let dividerColor = isDark ? 'rgba(159, 174, 255, 0.18)' : 'rgba(61, 92, 255, 0.14)';

  if (mode === 'sepia') {
    primaryMain = '#856404';
    primaryDark = '#533f03';
    primaryLight = '#b08b1e';
    bgDefault = '#F4ECD8';
    bgPaper = '#FDF6E3';
    textPrimary = '#5C3E21';
    textSecondary = 'rgba(92, 62, 33, 0.72)';
    textDisabled = 'rgba(92, 62, 33, 0.4)';
    dividerColor = 'rgba(133, 100, 4, 0.18)';
  } else if (mode === 'lava') {
    primaryMain = '#ff4500';
    primaryDark = '#cc3700';
    primaryLight = '#ff7849';
    bgDefault = '#120505';
    bgPaper = '#1c0a0a';
    textPrimary = '#ffc83b';
    textSecondary = 'rgba(255, 200, 59, 0.72)';
    textDisabled = 'rgba(255, 200, 59, 0.4)';
    dividerColor = 'rgba(255, 69, 0, 0.22)';
  } else if (mode === 'ocean') {
    primaryMain = '#00bcd4';
    primaryDark = '#0097a7';
    primaryLight = '#4dd0e1';
    bgDefault = '#0a192f';
    bgPaper = '#0f3057';
    textPrimary = '#e0f7fa';
    textSecondary = 'rgba(224, 247, 250, 0.72)';
    textDisabled = 'rgba(224, 247, 250, 0.4)';
    dividerColor = 'rgba(0, 188, 212, 0.18)';
  } else if (mode === 'forest') {
    primaryMain = '#10b981';
    primaryDark = '#047857';
    primaryLight = '#34d399';
    bgDefault = '#091a10';
    bgPaper = '#0c2617';
    textPrimary = '#e2f3eb';
    textSecondary = 'rgba(226, 243, 235, 0.72)';
    textDisabled = 'rgba(226, 243, 235, 0.4)';
    dividerColor = 'rgba(16, 185, 129, 0.18)';
  } else if (mode === 'amber') {
    primaryMain = '#b58900';
    primaryDark = '#936c00';
    primaryLight = '#cb9b10';
    bgDefault = '#073642';
    bgPaper = '#002b36';
    textPrimary = '#fdf6e3';
    textSecondary = 'rgba(253, 246, 227, 0.72)';
    textDisabled = 'rgba(253, 246, 227, 0.4)';
    dividerColor = 'rgba(181, 137, 0, 0.18)';
  } else if (mode === 'dracula') {
    primaryMain = '#ff79c6';
    primaryDark = '#e25ca6';
    primaryLight = '#ff92df';
    bgDefault = '#282a36';
    bgPaper = '#1e1f29';
    textPrimary = '#f8f8f2';
    textSecondary = 'rgba(248, 248, 242, 0.72)';
    textDisabled = 'rgba(248, 248, 242, 0.4)';
    dividerColor = 'rgba(255, 121, 198, 0.18)';
  } else if (mode === 'amethyst') {
    primaryMain = '#d4af37';
    primaryDark = '#aa8920';
    primaryLight = '#e5c158';
    bgDefault = '#1c0c28';
    bgPaper = '#29153a';
    textPrimary = '#fae8ff';
    textSecondary = 'rgba(250, 232, 255, 0.72)';
    textDisabled = 'rgba(250, 232, 255, 0.4)';
    dividerColor = 'rgba(212, 175, 55, 0.18)';
  } else if (mode === 'nordic') {
    primaryMain = '#88c0d0';
    primaryDark = '#5e81ac';
    primaryLight = '#8fbcbb';
    bgDefault = '#2e3440';
    bgPaper = '#3b4252';
    textPrimary = '#eceff4';
    textSecondary = 'rgba(236, 239, 244, 0.72)';
    textDisabled = 'rgba(236, 239, 244, 0.4)';
    dividerColor = 'rgba(136, 192, 208, 0.18)';
  } else if (mode === 'mint') {
    primaryMain = '#00a86b';
    primaryDark = '#00704a';
    primaryLight = '#33cc99';
    bgDefault = '#eefdf6';
    bgPaper = '#f4fef9';
    textPrimary = '#0f3d2a';
    textSecondary = 'rgba(15, 61, 42, 0.72)';
    textDisabled = 'rgba(15, 61, 42, 0.4)';
    dividerColor = 'rgba(0, 168, 107, 0.14)';
  } else if (mode === 'lavender') {
    primaryMain = '#7c3aed';
    primaryDark = '#5b21b6';
    primaryLight = '#a78bfa';
    bgDefault = '#faf5ff';
    bgPaper = '#fdfaff';
    textPrimary = '#2e1065';
    textSecondary = 'rgba(46, 16, 101, 0.72)';
    textDisabled = 'rgba(46, 16, 101, 0.4)';
    dividerColor = 'rgba(124, 58, 237, 0.14)';
  } else if (mode === 'peach') {
    primaryMain = '#ea580c';
    primaryDark = '#c2410c';
    primaryLight = '#f97316';
    bgDefault = '#fffaf0';
    bgPaper = '#fffefc';
    textPrimary = '#431407';
    textSecondary = 'rgba(67, 20, 7, 0.72)';
    textDisabled = 'rgba(67, 20, 7, 0.4)';
    dividerColor = 'rgba(234, 88, 12, 0.14)';
  } else if (mode === 'rose') {
    primaryMain = '#db2777';
    primaryDark = '#be185d';
    primaryLight = '#f472b6';
    bgDefault = '#fff1f2';
    bgPaper = '#fffafb';
    textPrimary = '#500724';
    textSecondary = 'rgba(80, 7, 36, 0.72)';
    textDisabled = 'rgba(80, 7, 36, 0.4)';
    dividerColor = 'rgba(219, 39, 119, 0.14)';
  } else if (mode === 'clay') {
    primaryMain = '#4b5563';
    primaryDark = '#374151';
    primaryLight = '#6b7280';
    bgDefault = '#f3f4f6';
    bgPaper = '#fafafa';
    textPrimary = '#111827';
    textSecondary = 'rgba(17, 24, 39, 0.72)';
    textDisabled = 'rgba(17, 24, 39, 0.4)';
    dividerColor = 'rgba(75, 85, 99, 0.14)';
  } else if (mode === 'kitty') {
    primaryMain = '#ff6b8b';
    primaryDark = '#e64e70';
    primaryLight = '#ffb3c6';
    bgDefault = '#ffd1dc';
    bgPaper = '#ffebf0';
    textPrimary = '#4a1525';
    textSecondary = 'rgba(74, 21, 37, 0.72)';
    textDisabled = 'rgba(74, 21, 37, 0.42)';
    dividerColor = 'rgba(255, 107, 139, 0.15)';
  } else if (mode === 'midnight') {
    primaryMain = '#fbc02d';
    primaryDark = '#f57f17';
    primaryLight = '#fff59d';
    bgDefault = '#080c16';
    bgPaper = '#101726';
    textPrimary = '#ffffff';
    textSecondary = '#94a3b8';
    textDisabled = '#64748b';
    dividerColor = 'rgba(251, 192, 45, 0.15)';
  }

  const palette = {
    mode: isDark ? 'dark' : 'light',
    primary: {
      main: primaryMain,
      dark: primaryDark,
      light: primaryLight,
      contrastText: baseColors.white},
    secondary: {
      main: isDark ? baseColors.darkSurfaceAlt : baseColors.lightSurfaceAlt},
    success: {
      main: '#3DDC97'},
    warning: {
      main: '#FFB547'},
    error: {
      main: '#FF647C'},
    background: {
      default: bgDefault,
      paper: bgPaper},
    text: {
      primary: textPrimary,
      secondary: textSecondary,
      disabled: textDisabled},
    divider: dividerColor};

  return createTheme({
    palette,
    shape: {
      borderRadius: 20},
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.04em' },
      h2: { fontWeight: 800, letterSpacing: '-0.035em' },
      h3: { fontWeight: 800, letterSpacing: '-0.03em' },
      h4: { fontWeight: 700, letterSpacing: '-0.025em' },
      h5: { fontWeight: 700, letterSpacing: '-0.02em' },
      h6: { fontWeight: 700, letterSpacing: '-0.015em' },
      button: {
        fontWeight: 700,
        letterSpacing: '0.02em',
        textTransform: 'none'}},
    shadows: [
      'none',
      '0 1px 2px rgba(8, 10, 27, 0.06)',
      '0 2px 6px rgba(8, 10, 27, 0.08)',
      '0 4px 12px rgba(8, 10, 27, 0.10)',
      '0 8px 20px rgba(8, 10, 27, 0.12)',
      '0 12px 28px rgba(8, 10, 27, 0.16)',
      '0 16px 40px rgba(8, 10, 27, 0.20)',
      '0 18px 44px rgba(8, 10, 27, 0.22)',
      '0 20px 48px rgba(8, 10, 27, 0.24)',
      '0 22px 52px rgba(8, 10, 27, 0.26)',
      '0 24px 56px rgba(8, 10, 27, 0.28)',
      '0 26px 60px rgba(8, 10, 27, 0.30)',
      '0 28px 64px rgba(8, 10, 27, 0.32)',
      '0 30px 68px rgba(8, 10, 27, 0.34)',
      '0 32px 72px rgba(8, 10, 27, 0.36)',
      '0 34px 76px rgba(8, 10, 27, 0.38)',
      '0 36px 80px rgba(8, 10, 27, 0.40)',
      '0 38px 84px rgba(8, 10, 27, 0.42)',
      '0 40px 88px rgba(8, 10, 27, 0.44)',
      '0 42px 92px rgba(8, 10, 27, 0.46)',
      '0 44px 96px rgba(8, 10, 27, 0.48)',
      '0 46px 100px rgba(8, 10, 27, 0.50)',
      '0 48px 104px rgba(8, 10, 27, 0.52)',
      '0 50px 108px rgba(8, 10, 27, 0.54)',
      '0 52px 112px rgba(8, 10, 27, 0.56)',
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: bgDefault,
            backgroundImage: 'none'}}},
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 16,
            backgroundColor: bgPaper}}},
      MuiButton: {
        defaultProps: {
          disableElevation: true},
        styleOverrides: {
          root: {
            borderRadius: 18,
            paddingInline: 22,
            transition: 'all 0.2s ease'},
          containedPrimary: {
            backgroundColor: primaryMain,
            
            '&:hover': {
              backgroundColor: primaryDark},
            '&:active': {
              
            }}}},
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 600}}},
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? alpha(bgPaper, 0.94) : alpha(bgPaper, 0.92)}}},
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: 'transparent'}}}}});
};

export const darkTheme = buildTheme('dark');
export const lightTheme = buildTheme('light');
export { buildTheme };
