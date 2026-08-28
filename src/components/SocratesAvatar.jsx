import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const THEME = {
  skin: '#F4C09E',
  skinShadow: '#DFA783',
  hair: '#8E949F',
  mustache: '#5E6470',
  tunic: '#E5E7EB',
  sash: '#D5A429',
  eyes: '#FFFFFF',
  pupils: '#222222'
};

const POSES = {
  idle: {
    rArm: { cx: 250, cy: 580, ex: 260, ey: 720, rot: 0, type: 'rest' },
    lArm: { cx: 550, cy: 580, ex: 540, ey: 720, rot: 0, type: 'rest' },
    headRot: 0, headY: 0, eyesX: 0, eyebrows: 0, 
    leftArmBehind: false
  },
  thinking: {
    rArm: { cx: 180, cy: 580, ex: 350, ey: 380, rot: 15, type: 'chin' },
    lArm: { cx: 550, cy: 580, ex: 540, ey: 720, rot: 0, type: 'rest' },
    headRot: 2, headY: -4, eyesX: 4, eyebrows: -3,
    leftArmBehind: false
  },
  open: {
    rArm: { cx: 160, cy: 620, ex: 130, ey: 500, rot: -40, type: 'open' },
    lArm: { cx: 640, cy: 620, ex: 670, ey: 500, rot: 40, type: 'open' },
    headRot: -2, headY: -2, eyesX: 0, eyebrows: -6,
    leftArmBehind: false
  },
  pointing: {
    rArm: { cx: 250, cy: 580, ex: 260, ey: 720, rot: 0, type: 'rest' },
    lArm: { cx: 640, cy: 580, ex: 460, ey: 350, rot: -25, type: 'point' },
    headRot: -1, headY: 1, eyesX: -2, eyebrows: -2,
    leftArmBehind: false
  },
  scratching: {
    rArm: { cx: 220, cy: 620, ex: 380, ey: 590, rot: -75, type: 'rest' },
    lArm: { cx: 650, cy: 400, ex: 450, ey: 180, rot: 45, type: 'open' },
    headRot: 6, headY: 6, eyesX: -5, eyebrows: 4,
    leftArmBehind: true
  }
};

const MONOLOGUE_SCRIPT = [
  { time: 0, pose: 'thinking', text: "True wisdom begins when we realize..." },
  { time: 2500, pose: 'open', text: "...how little we understand." },
  { time: 5500, pose: 'scratching', text: "To find yourself..." },
  { time: 7500, pose: 'pointing', text: "...you must first learn to think for yourself." },
  { time: 11000, pose: 'idle', text: "The only true wisdom is in knowing you know nothing." },
  { time: 15500, pose: 'idle', text: "" }
];

export default function SocratesAvatar({ isTalking = false, aiLoading = false, size = 200 }) {
  const [poseName, setPoseName] = useState('idle');
  const [currentPose, setCurrentPose] = useState('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [mouthPhase, setMouthPhase] = useState(0);
  const [subtitle, setSubtitle] = useState("");
  const [isBlinking, setIsBlinking] = useState(false);
  
  // cycleTime spans 0 to 240. 0-120 is Day/Sunset, 120-240 is Night/Sunrise.
  const [cycleTime, setCycleTime] = useState(60); 
  const [isCycleAuto, setIsCycleAuto] = useState(true);

  const talkInterval = useRef(null);
  const sequenceTimeouts = useRef([]);
  const speechRef = useRef(null);

  // Time cycle animation frame loop
  useEffect(() => {
    if (!isCycleAuto) return;
    let lastTime = performance.now();
    let frameId;

    const loop = (now) => {
      const deltaSeconds = (now - lastTime) / 1000;
      lastTime = now;

      // Complete one unit cycle slowly (one full cycle is 240 seconds long)
      setCycleTime((prev) => (prev + deltaSeconds) % 240);
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isCycleAuto]);

  const getCycleData = () => {
    let dayOpacity = 0;
    let sunsetOpacity = 0;
    let nightOpacity = 0;
    let timeLabel = "Midday";
    let activeIcon = "sun";

    if (cycleTime >= 0 && cycleTime < 95) {
      dayOpacity = 1;
      sunsetOpacity = 0;
      nightOpacity = 0;
      timeLabel = "High Noon in Athens";
      activeIcon = "sun";
    } else if (cycleTime >= 95 && cycleTime < 120) {
      const ratio = (cycleTime - 95) / 25;
      dayOpacity = 1 - ratio;
      sunsetOpacity = ratio;
      nightOpacity = 0;
      timeLabel = "Golden Hour (Dusk)";
      activeIcon = "sunset";
    } else if (cycleTime >= 120 && cycleTime < 140) {
      const ratio = (cycleTime - 120) / 20;
      dayOpacity = 0;
      sunsetOpacity = 1 - ratio;
      nightOpacity = ratio;
      timeLabel = "Socratic Twilight";
      activeIcon = "twilight";
    } else if (cycleTime >= 140 && cycleTime < 200) {
      dayOpacity = 0;
      sunsetOpacity = 0;
      nightOpacity = 1;
      timeLabel = "Athenian Midnight";
      activeIcon = "moon";
    } else if (cycleTime >= 200 && cycleTime < 220) {
      const ratio = (cycleTime - 200) / 20;
      dayOpacity = 0;
      sunsetOpacity = ratio;
      nightOpacity = 1 - ratio;
      timeLabel = "Aurora (First Light)";
      activeIcon = "sunrise";
    } else {
      const ratio = (cycleTime - 220) / 20;
      dayOpacity = ratio;
      sunsetOpacity = 1 - ratio;
      nightOpacity = 0;
      timeLabel = "Morning Ascent";
      activeIcon = "sun";
    }

    // Perfect continuous orbital paths (angle shifted backward -11*Math.PI / 24 to delay the setting of the sun further)
    const angle = (cycleTime / 240) * 2 * Math.PI - Math.PI / 2 - 11 * Math.PI / 24;
    const sunX = 500 + Math.cos(angle) * 400;
    const sunY = 430 + Math.sin(angle) * 300;

    const moonX = 500 + Math.cos(angle + Math.PI) * 400;
    const moonY = 430 + Math.sin(angle + Math.PI) * 300;

    return {
      dayOpacity,
      sunsetOpacity,
      nightOpacity,
      timeLabel,
      activeIcon,
      sunX,
      sunY,
      moonX,
      moonY
    };
  };

  const cycleData = getCycleData();

  // Blinking loop
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  // Mouth animation when speaking
  const activeTalking = isPlaying || (size !== 'full' && isTalking);
  useEffect(() => {
    if (activeTalking) {
      talkInterval.current = setInterval(() => {
        setMouthPhase(Math.floor(Math.random() * 4));
      }, 120);
    } else {
      clearInterval(talkInterval.current);
      setMouthPhase(0);
    }
    return () => clearInterval(talkInterval.current);
  }, [activeTalking]);

  // Automatic pose cycling when external talking is true
  useEffect(() => {
    if (size !== 'full') {
      if (isTalking) {
        const speakingPoses = ['thinking', 'open', 'pointing', 'scratching'];
        let idx = 0;
        setCurrentPose(speakingPoses[idx]);
        const interval = setInterval(() => {
          idx = (idx + 1) % speakingPoses.length;
          setCurrentPose(speakingPoses[idx]);
        }, 3500);
        return () => clearInterval(interval);
      } else if (aiLoading) {
        setCurrentPose('thinking');
      } else {
        setCurrentPose('idle');
      }
    }
  }, [isTalking, aiLoading, size]);

  const stopMonologue = useCallback(() => {
    setIsPlaying(false);
    setSubtitle("");
    setPoseName('idle');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    sequenceTimeouts.current.forEach(clearTimeout);
    sequenceTimeouts.current = [];
  }, []);

  const playMonologue = () => {
    stopMonologue();
    setIsPlaying(true);
    
    const fullText = "True wisdom begins when we realize how little we understand. To find yourself, you must first learn to think for yourself. The only true wisdom is in knowing you know nothing.";
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(fullText);
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google') || v.lang.startsWith('en'));
      if (preferredVoice) utterance.voice = preferredVoice;
      
      utterance.rate = 0.9;
      utterance.pitch = 0.9;
      utterance.onend = stopMonologue;
      utterance.onerror = stopMonologue;
      
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(stopMonologue, 16000);
    }

    MONOLOGUE_SCRIPT.forEach((step) => {
      const tid = setTimeout(() => {
        setPoseName(step.pose);
        setSubtitle(step.text);
        if (step.text === "") setIsPlaying(false);
      }, step.time);
      sequenceTimeouts.current.push(tid);
    });
  };

  useEffect(() => {
    return stopMonologue;
  }, [stopMonologue]);

  const activePose = size === 'full' ? poseName : currentPose;
  const p = POSES[activePose] || POSES.idle;

  const renderHand = (type) => {
    switch(type) {
      case 'chin':
        return (
          <g>
            <rect x="-18" y="-15" width="36" height="30" rx="12" fill={THEME.skin} />
            <rect x="0" y="-38" width="12" height="30" rx="6" fill={THEME.skin} />
            <line x1="-8" y1="-5" x2="10" y2="-5" stroke={THEME.skinShadow} strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      case 'point':
        return (
          <g>
            <rect x="-18" y="-15" width="36" height="30" rx="12" fill={THEME.skin} />
            <rect x="-6" y="-45" width="12" height="40" rx="6" fill={THEME.skin} />
          </g>
        );
      case 'open':
        return (
          <g>
            <rect x="-22" y="-12" width="44" height="30" rx="14" fill={THEME.skin} />
          </g>
        );
      case 'rest':
      default:
        return (
          <g>
            <rect x="-20" y="-10" width="40" height="45" rx="20" fill={THEME.skin} />
            <line x1="10" y1="5" x2="10" y2="25" stroke={THEME.skinShadow} strokeWidth="3" strokeLinecap="round" />
          </g>
        );
    }
  };

  const animationTransition = { type: 'tween', duration: 0.5, ease: [0.4, 0, 0.2, 1] };

  const backgroundAndSocratesSVG = (
    <svg viewBox="0 0 1000 800" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.35))' }}>
      
      {/* CSS Injection for custom environment animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.9; transform: scale(1.1); }
        }
        .star-item {
          animation: twinkle var(--speed, 3s) infinite ease-in-out;
        }
        @keyframes branchSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(1.8deg); }
        }
        .foliage-sway {
          transform-origin: bottom center;
          animation: branchSway 6s infinite ease-in-out;
        }
        .tree-sway-slow {
          transform-origin: bottom center;
          animation: branchSway 8s infinite ease-in-out;
        }
      `}</style>

      {/* Gradients Definitions */}
      <defs>
        <linearGradient id="daySky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4173b3" />
          <stop offset="60%" stopColor="#7cb5a4" />
          <stop offset="100%" stopColor="#efddbf" />
        </linearGradient>

        <linearGradient id="sunsetSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2c163d" />
          <stop offset="45%" stopColor="#80284f" />
          <stop offset="80%" stopColor="#db3755" />
          <stop offset="100%" stopColor="#ff7a73" />
        </linearGradient>

        <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#040308" />
          <stop offset="50%" stopColor="#090a18" />
          <stop offset="100%" stopColor="#151733" />
        </linearGradient>

        <radialGradient id="sunGlow">
          <stop offset="0%" stopColor="#fffee8" />
          <stop offset="35%" stopColor="#ffd254" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ff858a" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="moonGlow">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#d1e0d7" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#a0b8aa" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Backdrop Sky Layer Fades */}
      <rect width="1000" height="800" fill="url(#nightSky)" />
      <rect width="1000" height="800" fill="url(#sunsetSky)" style={{ opacity: cycleData.sunsetOpacity }} />
      <rect width="1000" height="800" fill="url(#daySky)" style={{ opacity: cycleData.dayOpacity }} />

      {/* Stars (Active & twinkling only at night) */}
      <g id="stars" style={{ opacity: cycleData.nightOpacity }}>
        <circle cx="120" cy="70" r="1.5" fill="#FFF" className="star-item" style={{ '--speed': '2s' }} />
        <circle cx="260" cy="120" r="2.2" fill="#FFF" className="star-item" style={{ '--speed': '3.5s' }} />
        <circle cx="320" cy="50" r="1.2" fill="#FFE" className="star-item" style={{ '--speed': '2.8s' }} />
        <circle cx="490" cy="180" r="2" fill="#FFF" className="star-item" style={{ '--speed': '4.2s' }} />
        <circle cx="610" cy="80" r="1.8" fill="#FFF" className="star-item" style={{ '--speed': '1.8s' }} />
        <circle cx="730" cy="130" r="2.5" fill="#FFF" className="star-item" style={{ '--speed': '4s' }} />
        <circle cx="870" cy="100" r="1.5" fill="#FFF" className="star-item" style={{ '--speed': '3s' }} />
        <circle cx="950" cy="190" r="2" fill="#FFE" className="star-item" style={{ '--speed': '2.5s' }} />
      </g>

      {/* Beautiful High-Design Solar Sun */}
      <g transform={`translate(${cycleData.sunX}, ${cycleData.sunY})`}>
        {/* Multi-layered corona */}
        <circle cx="0" cy="0" r="110" fill="url(#sunGlow)" opacity="0.35" />
        <circle cx="0" cy="0" r="75" fill="url(#sunGlow)" opacity="0.8" />
        <circle cx="0" cy="0" r="42" fill="#FFCA28" />
        <circle cx="0" cy="0" r="26" fill="#FFF59D" />
        <circle cx="0" cy="0" r="14" fill="#FFFFFF" />
      </g>

      {/* Beautiful High-Design Crescent Moon */}
      <g transform={`translate(${cycleData.moonX}, ${cycleData.moonY})`}>
        {/* Soft lunar glow */}
        <circle cx="0" cy="0" r="80" fill="url(#moonGlow)" opacity="0.4" />
        <circle cx="0" cy="0" r="50" fill="url(#moonGlow)" opacity="0.75" />
        {/* Outer body */}
        <path d="M 0,-30 A 30,30 0 0,0 0,30 A 24,30 0 0,1 0,-30" fill="#ECEFF1" />
        {/* Moon craters inside the crescent body */}
        <g opacity="0.16" fill="#78909C">
          <circle cx="-14" cy="-8" r="3.5" />
          <circle cx="-18" cy="6" r="3" />
          <circle cx="-10" cy="16" r="4.5" />
          <circle cx="-4" cy="-16" r="2" />
        </g>
      </g>

      {/* Ancient Athens Skyline (Layered for Day, Sunset, Night transitions with full opacity) */}
      {/* Back Mountain Layer */}
      <path d="M 0,560 L 130,450 L 320,540 L 540,390 L 800,520 L 1000,400 L 1000,800 L 0,800 Z" fill="#0f101a" />
      <path d="M 0,560 L 130,450 L 320,540 L 540,390 L 800,520 L 1000,400 L 1000,800 L 0,800 Z" fill="#5c305c" style={{ opacity: cycleData.sunsetOpacity }} />
      <path d="M 0,560 L 130,450 L 320,540 L 540,390 L 800,520 L 1000,400 L 1000,800 L 0,800 Z" fill="#6493c8" style={{ opacity: cycleData.dayOpacity }} />

      {/* Front Mountain Layer */}
      <path d="M 0,610 L 240,500 L 430,590 L 700,460 L 930,570 L 1000,530 L 1000,800 L 0,800 Z" fill="#090a12" />
      <path d="M 0,610 L 240,500 L 430,590 L 700,460 L 930,570 L 1000,530 L 1000,800 L 0,800 Z" fill="#432043" style={{ opacity: cycleData.sunsetOpacity }} />
      <path d="M 0,610 L 240,500 L 430,590 L 700,460 L 930,570 L 1000,530 L 1000,800 L 0,800 Z" fill="#4a72a1" style={{ opacity: cycleData.dayOpacity }} />





      {/* Temple Platform Floor Base (Layered for Day, Sunset, Night transitions) */}
      {/* Night floor (base) */}
      <rect x="0" y="730" width="1000" height="70" fill="#040408" />
      <line x1="0" y1="730" x2="1000" y2="730" stroke="#161826" strokeWidth="3" />

      {/* Sunset floor overlay */}
      <rect x="0" y="730" width="1000" height="70" fill="#221625" style={{ opacity: cycleData.sunsetOpacity }} />
      <line x1="0" y1="730" x2="1000" y2="730" stroke="#422b49" strokeWidth="3" style={{ opacity: cycleData.sunsetOpacity }} />

      {/* Day floor overlay */}
      <rect x="0" y="730" width="1000" height="70" fill="#1c1d1b" style={{ opacity: cycleData.dayOpacity }} />
      <line x1="0" y1="730" x2="1000" y2="730" stroke="#3b3b35" strokeWidth="3" style={{ opacity: cycleData.dayOpacity }} />


      {/* ───────────────────────────────────────────────────────────────── */}
      {/* ── Socrates Group (Centered at 500 by translating 100 on X) ── */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <g transform="translate(100, 0)">
        {/* Left Arm (Behind Head) - Used ONLY when scratching */}
        <g style={{ display: p.leftArmBehind ? 'block' : 'none' }}>
          <g id="left-arm-behind">
            <motion.path 
              initial={{ d: `M 520,440 Q ${p.lArm.cx},${p.lArm.cy} ${p.lArm.ex},${p.lArm.ey}` }}
              animate={{ d: `M 520,440 Q ${p.lArm.cx},${p.lArm.cy} ${p.lArm.ex},${p.lArm.ey}` }}
              transition={animationTransition}
              stroke={THEME.skin} 
              strokeWidth="38" 
              strokeLinecap="round" 
              fill="none" 
            />
            <motion.g 
              initial={{ x: p.lArm.ex, y: p.lArm.ey, rotate: p.lArm.rot }}
              animate={{ x: p.lArm.ex, y: p.lArm.ey, rotate: p.lArm.rot }}
              transition={animationTransition}
              style={{ transformOrigin: '0px 0px' }}
            >
              {renderHand(p.lArm.type)}
            </motion.g>
          </g>
        </g>

        {/* Body Group (Tunic & Sash) */}
        <g id="body">
          <path d="M 240,460 C 240,420 300,400 400,400 C 500,400 560,420 560,460 L 580,800 L 220,800 Z" fill={THEME.tunic} />
          <path 
            d="M 450,400 C 520,400 550,440 560,480 C 550,600 400,750 220,800 L 220,600 C 320,550 400,450 450,400 Z" 
            fill={THEME.sash} 
          />
          <path d="M 430,420 Q 340,550 220,650" stroke="#C39322" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.5" />
          <path d="M 480,450 Q 400,600 240,730" stroke="#C39322" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.5" />
        </g>

        {/* Left Arm (Front) - Used for all poses except scratching */}
        <g style={{ display: p.leftArmBehind ? 'none' : 'block' }}>
          <g id="left-arm-front">
            <motion.path 
              initial={{ d: `M 520,440 Q ${p.lArm.cx},${p.lArm.cy} ${p.lArm.ex},${p.lArm.ey}` }}
              animate={{ d: `M 520,440 Q ${p.lArm.cx},${p.lArm.cy} ${p.lArm.ex},${p.lArm.ey}` }}
              transition={animationTransition}
              stroke={THEME.skin} 
              strokeWidth="38" 
              strokeLinecap="round" 
              fill="none" 
            />
            <motion.g 
              initial={{ x: p.lArm.ex, y: p.lArm.ey, rotate: p.lArm.rot }}
              animate={{ x: p.lArm.ex, y: p.lArm.ey, rotate: p.lArm.rot }}
              transition={animationTransition}
              style={{ transformOrigin: '0px 0px' }}
            >
              {renderHand(p.lArm.type)}
            </motion.g>
          </g>
        </g>

        {/* Neck */}
        <rect x="370" y="360" width="60" height="60" fill={THEME.skinShadow} />

        {/* Head Group (Dynamic Rotations and Translations) */}
        <motion.g 
          id="head" 
          initial={{ y: p.headY, rotate: p.headRot }}
          animate={{ y: p.headY, rotate: p.headRot }}
          transition={animationTransition}
          style={{ transformOrigin: '400px 300px' }}
        >
          {/* Scalp/Base Face */}
          <rect x="310" y="160" width="180" height="200" rx="50" fill={THEME.skin} />
          
          {/* Forehead wrinkles */}
          <g stroke={THEME.skinShadow} strokeWidth="4" strokeLinecap="round">
            <line x1="360" y1="180" x2="440" y2="180" />
            <line x1="350" y1="195" x2="450" y2="195" />
            <line x1="370" y1="210" x2="430" y2="210" />
          </g>

          {/* Grey Hair (Sides) */}
          <path d="M 310,190 C 270,190 270,260 310,260 Z" fill={THEME.hair} />
          <path d="M 490,190 C 530,190 530,260 490,260 Z" fill={THEME.hair} />

          {/* Eyes */}
          <g id="eyes">
            <rect x="340" y="240" width="30" height="20" fill={THEME.eyes} rx="3" />
            <rect x="430" y="240" width="30" height="20" fill={THEME.eyes} rx="3" />
            
            {/* Pupils with dynamic gaze shift */}
            <motion.g 
              initial={{ x: p.eyesX }}
              animate={{ x: p.eyesX }} 
              transition={{ duration: 0.3 }}
            >
              <rect x="352" y="245" width="12" height="14" fill={THEME.pupils} rx="2" />
              <rect x="442" y="245" width="12" height="14" fill={THEME.pupils} rx="2" />
            </motion.g>

            {/* Blink Layer */}
            {isBlinking && (
              <g>
                <rect x="338" y="238" width="34" height="24" fill={THEME.skin} />
                <rect x="428" y="238" width="34" height="24" fill={THEME.skin} />
                <line x1="340" y1="250" x2="370" y2="250" stroke={THEME.skinShadow} strokeWidth="3" />
                <line x1="430" y1="250" x2="460" y2="250" stroke={THEME.skinShadow} strokeWidth="3" />
              </g>
            )}
          </g>

          {/* Thick Blocky Eyebrows */}
          <g id="eyebrows">
            <motion.rect 
              x="330" y="225" width="45" height="10" rx="3" fill={THEME.hair} 
              style={{ transformOrigin: '352px 230px' }} 
              initial={{ rotate: p.eyebrows }}
              animate={{ rotate: p.eyebrows }} 
              transition={animationTransition}
            />
            <motion.rect 
              x="425" y="225" width="45" height="10" rx="3" fill={THEME.hair} 
              style={{ transformOrigin: '447px 230px' }} 
              initial={{ rotate: -p.eyebrows }}
              animate={{ rotate: -p.eyebrows }} 
              transition={animationTransition}
            />
          </g>

          {/* Nose */}
          <path d="M 395,240 L 395,290 L 415,290" stroke={THEME.skinShadow} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

          {/* Beard */}
          <path d="M 310,310 C 310,430 490,430 490,310 C 470,320 450,320 400,320 C 350,320 330,320 310,310 Z" fill={THEME.hair} />
          
          {/* Mustache */}
          <path d="M 330,305 C 370,290 430,290 470,305 C 480,320 450,335 400,320 C 350,335 320,320 330,305 Z" fill={THEME.mustache} />

          {/* Animated Mouth (Inside mustache) */}
          <g transform="translate(400, 316)">
            {activeTalking ? (
              mouthPhase === 3 ? <rect x="-14" y="-2" width="28" height="12" rx="4" fill="#111" /> :
              mouthPhase === 2 ? <rect x="-12" y="-1" width="24" height="8" rx="3" fill="#111" /> :
              mouthPhase === 1 ? <rect x="-10" y="0" width="20" height="4" rx="2" fill="#111" /> :
              <line x1="-12" y1="2" x2="12" y2="2" stroke="#111" strokeWidth="4" strokeLinecap="round" />
            ) : (
              <path d="M -12,0 Q 0,4 12,0" stroke="#111" strokeWidth="3" fill="none" strokeLinecap="round" />
            )}
          </g>
        </motion.g>

        {/* Right Arm (Always Front to overlap beard in thinking pose) */}
        <g id="right-arm">
          <motion.path 
            initial={{ d: `M 280,440 Q ${p.rArm.cx},${p.rArm.cy} ${p.rArm.ex},${p.rArm.ey}` }}
            animate={{ d: `M 280,440 Q ${p.rArm.cx},${p.rArm.cy} ${p.rArm.ex},${p.rArm.ey}` }}
            transition={animationTransition}
            stroke={THEME.skin} 
            strokeWidth="38" 
            strokeLinecap="round" 
            fill="none" 
          />
          <motion.g 
            initial={{ x: p.rArm.ex, y: p.rArm.ey, rotate: p.rArm.rot }}
            animate={{ x: p.rArm.ex, y: p.rArm.ey, rotate: p.rArm.rot }}
            transition={animationTransition}
            style={{ transformOrigin: '0px 0px' }}
          >
            {renderHand(p.rArm.type)}
          </motion.g>
        </g>
      </g>

    </svg>
  );

  // Stretch mode (fills container, used in PhilosophyLabPage)
  if (size === 'stretch') {
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        {backgroundAndSocratesSVG}
      </div>
    );
  }

  // Compact mode
  if (size !== 'full') {
    return (
      <div style={{ width: size, height: size, display: 'inline-block' }}>
        {backgroundAndSocratesSVG}
      </div>
    );
  }

  // FullStandalone player mode
  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 flex flex-col md:flex-row font-sans items-stretch">
      {/* Video stage view */}
      <div className="flex-1 relative overflow-hidden flex flex-col border-r border-slate-900">
        
        {/* Backdrop SVG is self-contained in backgroundAndSocratesSVG now, so we just render it! */}
        <div className="flex-1 relative z-10 w-full h-full flex items-center justify-center min-h-[600px] p-8">
          {backgroundAndSocratesSVG}
        </div>

        {/* Subtitles Overlay */}
        <div className="absolute bottom-24 left-0 right-0 flex justify-center px-8 z-30 pointer-events-none">
          <p className={`text-xl md:text-2xl font-serif font-bold text-center text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] transition-opacity duration-300 ${subtitle ? 'opacity-100' : 'opacity-0'}`}>
            <span className="bg-black/60 px-4 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
              "{subtitle}"
            </span>
          </p>
        </div>
      </div>

      {/* Control panel view */}
      <div className="w-full md:w-[340px] bg-[#0c0d12] flex flex-col justify-between border-t md:border-t-0 border-slate-900">
        <div className="p-6 space-y-6">
          
          {/* Section: Environment Dialectic */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 mr-2" />
              Athens Horizon
            </h2>

            <div className="bg-[#12131a] rounded-2xl p-4 border border-slate-900 shadow-inner space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                  <span>Time Cycle Engine</span>
                </span>
                <button
                  onClick={() => setIsCycleAuto(!isCycleAuto)}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider transition ${
                    isCycleAuto 
                      ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30' 
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {isCycleAuto ? 'Active (Auto)' : 'Paused'}
                </button>
              </div>

              {/* Time Warp Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Daybreak (0s)</span>
                  <span>Midnight (120s)</span>
                  <span>Sunrise (240s)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="239"
                  value={cycleTime}
                  onChange={(e) => {
                    setCycleTime(parseFloat(e.target.value));
                    setIsCycleAuto(false);
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500 focus:outline-none"
                />
              </div>

              <p className="text-[10px] text-slate-400 leading-normal">
                Adjust the warp slider to fast-forward the smooth 240-second cycle transition of golden sunburst and midnight sky gradients.
              </p>
            </div>
          </div>

          {/* Playback Controls */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 mr-2" />
              Playback Engine
            </h2>

            <div className="bg-[#12131a] rounded-2xl p-5 border border-slate-900 shadow-inner flex flex-col items-center justify-center space-y-4">
              <button
                onClick={isPlaying ? stopMonologue : playMonologue}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
                  isPlaying 
                    ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' 
                    : 'bg-yellow-500 hover:bg-yellow-400 shadow-yellow-500/20 hover:scale-105'
                }`}
              >
                {isPlaying ? (
                  <span className="text-white text-xl font-bold">■</span>
                ) : (
                  <span className="text-slate-900 text-xl font-bold">▶</span>
                )}
              </button>

              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-slate-200">
                  {isPlaying ? 'Playing...' : 'Trigger Monologue'}
                </p>
                <p className="text-[10px] text-slate-500 leading-snug">
                  Mouth moves dynamically; body rotates to the active philosophical stance.
                </p>
              </div>
            </div>
          </div>

          {/* Manual Pose Override section */}
          <div className="border-t border-slate-900/80 pt-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
              Pose Configuration
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(POSES).map((pose) => (
                <button
                  key={pose}
                  disabled={isPlaying}
                  onClick={() => setPoseName(pose)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition border ${
                    poseName === pose && !isPlaying
                      ? 'bg-slate-800 border-slate-600 text-white shadow-md' 
                      : 'bg-[#12131a] border-slate-900 text-slate-400 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {pose.charAt(0).toUpperCase() + pose.slice(1)}
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className="p-4 bg-black/50 text-[9px] text-slate-600 text-center border-t border-slate-900/50 space-y-1">
          <p>Flat Vector Athens Architecture • Continuous Solar Horizon Engine</p>
          <p>© Classical Academic Series, 399 BCE</p>
        </div>
      </div>
    </div>
  );
}
