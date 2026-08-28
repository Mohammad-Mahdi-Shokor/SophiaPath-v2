import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import logoImg from '../assets/sp-logo.png';

const ConstellationBackground = ({ styleType }) => {
  const canvasRef = useRef(null);
  const { themeMode } = useTheme();
  const [activeStyle, setActiveStyle] = useState(styleType || 'constellation');

  // Theme colors state
  const [colors, setColors] = useState({
    primary: '#3D5CFF',
    dark: '#2E49D1'
  });

  // Sync prop changes
  useEffect(() => {
    if (styleType) {
      setActiveStyle(styleType);
    }
  }, [styleType]);

  // Read from localStorage if no prop is provided
  useEffect(() => {
    if (!styleType) {
      const handleStyleChange = () => {
        setActiveStyle(localStorage.getItem('sophiapath_bg_style') || 'constellation');
      };
      window.addEventListener('sophiapath_bg_style_changed', handleStyleChange);
      handleStyleChange();
      return () => window.removeEventListener('sophiapath_bg_style_changed', handleStyleChange);
    }
  }, [styleType]);

  // Update theme colors reactively when theme changes
  useEffect(() => {
    const updateThemeColors = () => {
      const rootStyle = getComputedStyle(document.documentElement);
      const primary = rootStyle.getPropertyValue('--primary-main').trim() || '#3D5CFF';
      const dark = rootStyle.getPropertyValue('--primary-dark').trim() || '#2E49D1';
      setColors({ primary, dark });
    };

    updateThemeColors();
    const timer = setTimeout(updateThemeColors, 50);
    return () => clearTimeout(timer);
  }, [themeMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Load logo image for faint watermark
    const logo = new Image();
    logo.src = logoImg;

    // Setup canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // ==========================================
    // INITIALIZATION FOR THE VISUAL STYLES
    // ==========================================

    const cx = () => canvas.width / 2;
    const cy = () => canvas.height / 2;

    // 1. Constellation Network particles
    const constellationParticles = [];
    const CONST_COUNT = 85;
    const maxLineDistance = 140;
    for (let i = 0; i < CONST_COUNT; i++) {
      constellationParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 1.2,
        alpha: Math.random() * 0.6 + 0.3,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulseDir: 1
      });
    }

    // 2. Circuit paths ending in geometric nodes
    const circuitTraces = [];
    const CIRCUIT_MAX = 12;
    const getLogoVertices = (scale = 0.22) => {
      const size = Math.min(canvas.width, canvas.height) * scale;
      return [
        { x: cx(), y: cy() - size },
        { x: cx() + size * 0.7, y: cy() - size * 0.45 },
        { x: cx() + size * 0.7, y: cy() + size * 0.3 },
        { x: cx(), y: cy() + size * 0.8 },
        { x: cx() - size * 0.7, y: cy() + size * 0.3 },
        { x: cx() - size * 0.7, y: cy() - size * 0.45 },
      ];
    };

    const initCircuit = (index) => {
      const vertices = getLogoVertices(0.22);
      const target = vertices[index % vertices.length];
      const startFromLeft = Math.random() > 0.5;
      const startX = startFromLeft ? -20 : canvas.width + 20;
      const startY = Math.random() * canvas.height;
      const midX = startX + (target.x - startX) * 0.5;

      return {
        points: [
          { x: startX, y: startY },
          { x: midX, y: startY },
          { x: midX + (target.y - startY) * 0.5, y: target.y },
          { x: target.x, y: target.y }
        ],
        progress: 0,
        speed: 0.004 + Math.random() * 0.004,
        targetNode: target,
        colorType: Math.random() > 0.4 ? 'primary' : 'dark'
      };
    };
    for (let i = 0; i < CIRCUIT_MAX; i++) {
      circuitTraces.push(initCircuit(i));
    }


    // 4. 3D Mesh Grid
    const meshCols = 16;
    const meshRows = 12;

    // 5. Matrix Code Rain (Philosophical Rain)
    const matrixSymbols = '01αβγδεζηθικλμνξοπρστυφχψω'.split('');
    const matrixColumns = [];
    const columnFontSize = 14;
    const initMatrix = () => {
      const cols = Math.floor(canvas.width / columnFontSize) + 1;
      matrixColumns.length = 0;
      for (let i = 0; i < cols; i++) {
        matrixColumns.push({
          x: i * columnFontSize,
          y: Math.random() * -canvas.height,
          speed: 1.5 + Math.random() * 2.5,
          chars: Array.from({ length: 15 }, () => matrixSymbols[Math.floor(Math.random() * matrixSymbols.length)])
        });
      }
    };
    initMatrix();

    // 6. Cosmic Vortex (Spiral Galaxy particles)
    const vortexStars = [];
    const VORTEX_STAR_COUNT = 240;
    for (let i = 0; i < VORTEX_STAR_COUNT; i++) {
      vortexStars.push({
        radiusBase: 50 + Math.random() * Math.max(canvas.width, canvas.height) * 0.65,
        angle: Math.random() * Math.PI * 2,
        speed: 0.002 + Math.random() * 0.006,
        size: Math.random() * 1.5 + 0.8,
        pulseOffset: Math.random() * Math.PI * 2,
        color: Math.random() > 0.4 ? 'primary' : 'dark'
      });
    }

    // 7. Learning Warp (Space Tunnel)
    const warpStars = [];
    const WARP_COUNT = 160;
    for (let i = 0; i < WARP_COUNT; i++) {
      warpStars.push({
        x: (Math.random() - 0.5) * canvas.width,
        y: (Math.random() - 0.5) * canvas.height,
        z: Math.random() * canvas.width,
        color: Math.random() > 0.4 ? 'primary' : 'dark'
      });
    }

    // ==========================================
    // RENDER ANIMATION FRAME
    // ==========================================
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const baseLogoSize = Math.min(canvas.width, canvas.height) * 0.45;

      // Render faint brand watermark logo behind everything (except Matrix and Warp)
      if (logo.complete && activeStyle !== 'matrix' && activeStyle !== 'warp') {
        ctx.save();
        ctx.globalAlpha = 0.012;
        ctx.drawImage(logo, cx() - baseLogoSize / 2, cy() - baseLogoSize / 2, baseLogoSize, baseLogoSize);
        ctx.restore();
      }

      // ------------------------------------------
      // STYLE 1: Constellation Network
      // ------------------------------------------
      if (activeStyle === 'constellation') {
        // Draw nodes
        constellationParticles.forEach((p) => {
          p.alpha += p.pulseSpeed * p.pulseDir;
          if (p.alpha > 0.95 || p.alpha < 0.25) p.pulseDir *= -1;

          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = colors.primary;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
        });

        // Draw connections
        for (let i = 0; i < constellationParticles.length; i++) {
          const p1 = constellationParticles[i];
          for (let j = i + 1; j < constellationParticles.length; j++) {
            const p2 = constellationParticles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxLineDistance) {
              const lineAlpha = (1 - dist / maxLineDistance) * 0.14;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
              grad.addColorStop(0, colors.primary);
              grad.addColorStop(1, colors.dark);
              ctx.strokeStyle = grad;
              ctx.lineWidth = 0.85;
              ctx.globalAlpha = lineAlpha;
              ctx.stroke();
            }
          }
        }
      }

      // ------------------------------------------
      // STYLE 2: Circuit
      // ------------------------------------------
      else if (activeStyle === 'circuit') {
        circuitTraces.forEach((trace, idx) => {
          trace.progress += trace.speed;
          if (trace.progress > 1) {
            Object.assign(trace, initCircuit(idx));
          }

          const p = trace.points;
          const t = trace.progress;
          let curX = p[0].x;
          let curY = p[0].y;

          ctx.beginPath();
          ctx.moveTo(p[0].x, p[0].y);

          const segCount = p.length - 1;
          const currentSeg = Math.floor(t * segCount);
          const segProgress = (t * segCount) % 1;

          for (let i = 0; i < segCount; i++) {
            const pStart = p[i];
            const pEnd = p[i + 1];
            if (i < currentSeg) {
              ctx.lineTo(pEnd.x, pEnd.y);
            } else if (i === currentSeg) {
              curX = pStart.x + (pEnd.x - pStart.x) * segProgress;
              curY = pStart.y + (pEnd.y - pStart.y) * segProgress;
              ctx.lineTo(curX, curY);
              break;
            }
          }

          ctx.strokeStyle = trace.colorType === 'primary' ? colors.primary : colors.dark;
          ctx.lineWidth = 1.3;
          ctx.globalAlpha = 0.16;
          ctx.stroke();

          // Render moving node
          ctx.beginPath();
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = trace.colorType === 'primary' ? colors.primary : colors.dark;
          if (idx % 2 === 0) {
            ctx.arc(curX, curY, 3, 0, Math.PI * 2);
          } else {
            ctx.rect(curX - 2.5, curY - 2.5, 5, 5);
          }
          ctx.fill();

          // Faint glow circles at destinations
          if (trace.progress > 0.85) {
            ctx.beginPath();
            ctx.arc(trace.targetNode.x, trace.targetNode.y, 6, 0, Math.PI * 2);
            ctx.strokeStyle = colors.primary;
            ctx.globalAlpha = (trace.progress - 0.85) * 6 * 0.15;
            ctx.stroke();
          }
        });
      }

      // ------------------------------------------
      // STYLE 3: Aurora Waves (Cosmic Ambient Flow)
      // ------------------------------------------
      else if (activeStyle === 'aurora') {
        const time = Date.now() * 0.001;
        const sliceWidth = 6;
        const numSlices = Math.ceil(canvas.width / sliceWidth);
        
        // Define 3 different vertical levels where independent aurora curtains drift
        const curtains = [
          { yFraction: 0.22, color: colors.primary, speedMult: 0.25, amp: 55, baseHeight: 200 },
          { yFraction: 0.50, color: colors.dark,    speedMult: -0.18, amp: 70, baseHeight: 250 },
          { yFraction: 0.78, color: colors.primary, speedMult: 0.3,  amp: 50, baseHeight: 180 }
        ];

        curtains.forEach((curt, cIdx) => {
          ctx.lineWidth = sliceWidth + 0.5;
          const localTime = time * curt.speedMult;
          
          for (let i = 0; i <= numSlices; i++) {
            const x = i * sliceWidth;
            
            // Multiple sine/cosine harmonics for rich organic rippling curves
            const y1 = Math.sin(x * 0.0012 + localTime) * curt.amp;
            const y2 = Math.cos(x * 0.003 - localTime * 0.8) * (curt.amp * 0.5);
            const centerY = canvas.height * curt.yFraction + y1 + y2;
            const height = curt.baseHeight + Math.sin(x * 0.004 + time) * 35;

            const grad = ctx.createLinearGradient(x, centerY - height/2, x, centerY + height/2);
            grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
            grad.addColorStop(0.5, curt.color);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.beginPath();
            ctx.moveTo(x, centerY - height/2);
            ctx.lineTo(x, centerY + height/2);
            ctx.strokeStyle = grad;
            ctx.globalAlpha = 0.055; // clean, smooth overlapping opacity
            ctx.stroke();
          }
        });
      }

      // ------------------------------------------
      // STYLE 4: 3D Mesh Grid
      // ------------------------------------------
      else if (activeStyle === 'grid') {
        const time = Date.now() * 0.0012;
        const padding = 150; // Extend 150px beyond screen borders for infinite edge look
        const colWidth = (canvas.width + padding * 2) / (meshCols - 1);
        const rowHeight = (canvas.height + padding * 2) / (meshRows - 1);
        
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 0.75;
        
        // Render 3D waving mesh rows
        for (let r = 0; r < meshRows; r++) {
          ctx.beginPath();
          for (let c = 0; c < meshCols; c++) {
            const x = -padding + c * colWidth;
            const z = Math.sin(c * 0.35 + time) * Math.cos(r * 0.35 + time) * 130;
            const y = -padding + r * rowHeight + z;
            
            if (c === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.globalAlpha = 0.18;
          ctx.stroke();
        }

        // Render 3D waving mesh columns
        for (let c = 0; c < meshCols; c++) {
          ctx.beginPath();
          for (let r = 0; r < meshRows; r++) {
            const x = -padding + c * colWidth;
            const z = Math.sin(c * 0.35 + time) * Math.cos(r * 0.35 + time) * 130;
            const y = -padding + r * rowHeight + z;
            
            if (r === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.globalAlpha = 0.18;
          ctx.stroke();
        }
      }

      // ------------------------------------------
      // STYLE 5: Matrix Code Rain
      // ------------------------------------------
      else if (activeStyle === 'matrix') {
        ctx.font = `bold ${columnFontSize}px monospace`;
        matrixColumns.forEach((col) => {
          col.y += col.speed;
          if (col.y > canvas.height) {
            col.y = Math.random() * -180;
            col.speed = 1.5 + Math.random() * 2.5;
          }

          col.chars.forEach((char, idx) => {
            const charY = col.y + idx * columnFontSize;
            if (charY < 0 || charY > canvas.height) return;

            const cellAlpha = (idx / col.chars.length) * 0.15;
            ctx.globalAlpha = cellAlpha;
            ctx.fillStyle = colors.primary;
            ctx.fillText(char, col.x, charY);

            if (Math.random() < 0.01) {
              col.chars[idx] = matrixSymbols[Math.floor(Math.random() * matrixSymbols.length)];
            }
          });
        });
      }

      // ------------------------------------------
      // STYLE 6: Cosmic Vortex (Galaxy Swirl)
      // ------------------------------------------
      else if (activeStyle === 'vortex') {
        vortexStars.forEach((star) => {
          star.angle += star.speed;
          
          // Calculate pulsing radius
          const pulseFactor = Math.sin(Date.now() * 0.001 + star.pulseOffset) * 15;
          const r = star.radiusBase + pulseFactor;
          const x = cx() + r * Math.cos(star.angle);
          const y = cy() + r * Math.sin(star.angle);

          // Draw swirling star dot
          ctx.beginPath();
          ctx.arc(x, y, star.size, 0, Math.PI * 2);
          ctx.fillStyle = star.color === 'primary' ? colors.primary : colors.dark;
          ctx.globalAlpha = 0.22 + Math.sin(Date.now() * 0.002 + star.pulseOffset) * 0.08;
          ctx.fill();
        });
      }

      // ------------------------------------------
      // STYLE 7: Learning Warp
      // ------------------------------------------
      else if (activeStyle === 'warp') {
        warpStars.forEach((star) => {
          star.z -= 2.2;
          if (star.z <= 0) {
            star.z = canvas.width;
            star.x = (Math.random() - 0.5) * canvas.width;
            star.y = (Math.random() - 0.5) * canvas.height;
          }

          const k = 150 / star.z;
          const px = star.x * k + cx();
          const py = star.y * k + cy();

          const pzPrev = star.z + 18;
          const kPrev = 150 / pzPrev;
          const pxPrev = star.x * kPrev + cx();
          const pyPrev = star.y * kPrev + cy();

          if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
            const starAlpha = Math.min((1 - star.z / canvas.width) * 0.35, 0.45);
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(pxPrev, pyPrev);
            ctx.strokeStyle = star.color === 'primary' ? colors.primary : colors.dark;
            ctx.lineWidth = 1.6 * k;
            ctx.globalAlpha = starAlpha;
            ctx.stroke();
          }
        });
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [colors, activeStyle]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        display: 'block'
      }}
    />
  );
};

export default ConstellationBackground;
