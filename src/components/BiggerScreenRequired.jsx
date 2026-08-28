import React from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import MonitorIcon from '@mui/icons-material/DesktopWindows';

/**
 * BiggerScreenRequired
 * Renders a full-page "bigger screen required" screen when the viewport
 * is below the given breakpoint (default: 'md' = 900px).
 */
const BiggerScreenRequired = ({
  children,
  breakpoint = 'md',
  title = 'Bigger Screen Required',
  description,
  pageName = 'this page',
}) => {
  const theme = useTheme();
  const isTooSmall = useMediaQuery(theme.breakpoints.down(breakpoint));

  if (!isTooSmall) return children;

  const defaultDescription = `${pageName} is designed for larger screens. Please open it on a desktop or laptop for the best experience.`;

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 80px)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        py: 6,
        gap: 3,
        textAlign: 'center',
        background: 'var(--background-default)',
      }}
    >
      {/* Animated monitor icon */}
      <Box
        sx={{
          width: 96,
          height: 96,
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface-glass)',
          border: '1.5px solid var(--divider)',
          mb: 1,
          animation: 'pulse-screen 2.5s ease-in-out infinite',
          '@keyframes pulse-screen': {
            '0%, 100%': { transform: 'scale(1)', opacity: 1 },
            '50%': { transform: 'scale(1.06)', opacity: 0.85 },
          },
        }}
      >
        <MonitorIcon sx={{ fontSize: 52, color: 'var(--primary-main)' }} />
      </Box>

      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          color: 'var(--text-primary)',
          fontFamily: '"Outfit", sans-serif',
          fontSize: 'clamp(1.2rem, 5vw, 1.6rem)',
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: 'var(--text-secondary)',
          maxWidth: 340,
          lineHeight: 1.7,
          fontSize: 'clamp(0.875rem, 3vw, 1rem)',
        }}
      >
        {description || defaultDescription}
      </Typography>

      {/* Decorative screen size illustration */}
      <Box
        sx={{
          mt: 2,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          opacity: 0.5,
        }}
      >
        {/* Mobile — small, dimmed */}
        <Box
          sx={{
            width: 20,
            height: 34,
            borderRadius: '4px',
            border: '2px solid var(--divider)',
            background: 'transparent',
          }}
        />
        {/* Tablet — medium, dimmed */}
        <Box
          sx={{
            width: 30,
            height: 42,
            borderRadius: '5px',
            border: '2px solid var(--divider)',
            background: 'transparent',
          }}
        />
        {/* Desktop — highlighted */}
        <Box
          sx={{
            width: 58,
            height: 42,
            borderRadius: '6px',
            border: '2.5px solid var(--primary-main)',
            background: 'color-mix(in srgb, var(--primary-main) 12%, transparent)',
            opacity: 1,
            boxShadow: '0 0 12px color-mix(in srgb, var(--primary-main) 30%, transparent)',
          }}
        />
      </Box>

      <Typography
        variant="caption"
        sx={{
          color: 'var(--text-secondary)',
          fontSize: '0.72rem',
          opacity: 0.6,
          mt: -1,
        }}
      >
        Minimum recommended: 900px width
      </Typography>
    </Box>
  );
};

export default BiggerScreenRequired;
