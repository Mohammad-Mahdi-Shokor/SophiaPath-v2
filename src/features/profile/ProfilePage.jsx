import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Grid,
  IconButton,
  LinearProgress,
  Container,
  Button,
  Stack,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  School as CourseIcon,
  LocalFireDepartment as StreakIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  Explore as ExploreIcon,
  Check as CheckIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  Bolt as BoltIcon,
  Person as PersonIcon,
  Fingerprint as FingerprintIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { achievementsData } from '../../data/achievements';
import './ProfilePage.css';

const AVATAR_OPTIONS = [
  'https://cdn.wallpapersafari.com/95/19/uFaSYI.jpg',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80'
];

const safeFormatDate = (timestamp, options = {}, fallback = 'Recently') => {
  if (!timestamp || timestamp === 'null' || timestamp === 'undefined') return fallback;
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return fallback;
  if (Object.keys(options).length === 0) {
    return date.toLocaleDateString();
  }
  return date.toLocaleDateString(undefined, options);
};

const getRankName = (levelNum = 1, currentLevelName = '') => {
  if (currentLevelName && currentLevelName !== 'Beginner') return currentLevelName;
  const lvl = Number(levelNum) || 1;
  if (lvl < 5) return currentLevelName || 'Beginner';
  if (lvl < 10) return 'Learner';
  if (lvl < 20) return 'Explorer';
  if (lvl < 35) return 'Scholar';
  if (lvl < 50) return 'Expert';
  return 'Master';
};

const calculateLevelProgress = (levelNum = 1, xpNum = 0) => {
  const level = Math.max(1, Number(levelNum) || 1);
  const xp = Math.max(0, Number(xpNum) || 0);

  const xpPerLevel = 100;
  let baseXp = (level - 1) * xpPerLevel;
  let targetXp = level * xpPerLevel;

  if (xp < baseXp) {
    baseXp = Math.floor(xp / xpPerLevel) * xpPerLevel;
    targetXp = baseXp + xpPerLevel;
  } else if (xp >= targetXp) {
    targetXp = xp + (xpPerLevel - (xp % xpPerLevel));
    baseXp = targetXp - xpPerLevel;
  }

  const currentLevelXp = Math.max(0, xp - baseXp);
  const percent = Math.min(100, Math.max(0, Math.round((currentLevelXp / xpPerLevel) * 100)));
  const xpNeeded = Math.max(0, targetXp - xp);

  return {
    level,
    nextLevel: level + 1,
    currentXp: xp,
    targetXp,
    xpInLevel: currentLevelXp,
    xpNeeded,
    percent
  };
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await fetch('/courses');
        if (res.ok) {
          const list = await res.json();
          setCourses(list);
        }
      } catch (err) {
        console.error('Failed to load courses on profile page:', err);
      }
    };
    loadCourses();
  }, []);

  const resolvedAchievements = useMemo(() => {
    if (!user) return [];

    const getCourseDomain = (title) => {
      const t = title.toLowerCase();
      if (t.includes('cybersecurity') || t.includes('network') || t.includes('security')) return 'Technology';
      if (t.includes('physics') || t.includes('science') || t.includes('chemistry')) return 'Science';
      if (t.includes('philosophy') || t.includes('history') || t.includes('literature')) return 'Humanities';
      if (t.includes('marketing') || t.includes('business') || t.includes('management')) return 'Business';
      if (t.includes('design') || t.includes('graphic') || t.includes('art')) return 'Design';
      if (t.includes('mobile') || t.includes('web') || t.includes('app') || t.includes('code') || t.includes('development') || t.includes('ai') || t.includes('artificial')) return 'Technology';
      return 'Other';
    };

    const getRegisteredCoursesProgress = () => {
      if (!user || !user.registeredCourses) return [];
      return user.registeredCourses.map(courseTitle => {
        const courseTitleLower = courseTitle.toLowerCase();
        const loadedLessons = user.courseLessons?.[courseTitleLower] || [];
        const uniqueLessons = [];
        const seenTitles = new Set();
        loadedLessons.forEach(l => {
          const norm = (l.title || '').trim().toLowerCase();
          const isCheatsheet = norm.startsWith('cheatsheet:') || norm.startsWith('cheatsheet ') || norm === 'cheatsheet';
          if (norm && !isCheatsheet && !seenTitles.has(norm)) {
            seenTitles.add(norm);
            uniqueLessons.push(l);
          }
        });
        const completedLessons = uniqueLessons.filter(l => {
          const duplicates = loadedLessons.filter(dl => (dl.title || '').trim().toLowerCase() === (l.title || '').trim().toLowerCase());
          return duplicates.some(dl => dl.done || (dl.grade !== null && Number(dl.grade) >= 70));
        });
        return {
          title: courseTitle,
          completed: completedLessons.length,
          total: uniqueLessons.length,
          percent: uniqueLessons.length > 0 ? (completedLessons.length / uniqueLessons.length) * 100 : 0
        };
      });
    };

    const completedCoursesProgress = getRegisteredCoursesProgress();

    return achievementsData.map(ach => {
      let currentValue = 0;
      switch (ach.id) {
        case 'ach-course-1':
          currentValue = (user.registeredCourses || []).length >= 1 ? 1 : 0;
          break;
        case 'ach-course-2': {
          const has50Percent = completedCoursesProgress.some(p => p.percent >= 50);
          currentValue = has50Percent ? 50 : 0;
          break;
        }
        case 'ach-course-3': {
          const hasFinishedCourse = completedCoursesProgress.some(p => p.total > 0 && p.completed >= p.total);
          currentValue = hasFinishedCourse ? 1 : 0;
          break;
        }
        case 'ach-course-4':
          currentValue = completedCoursesProgress.filter(p => p.total > 0 && p.completed >= p.total).length;
          break;

        case 'ach-quiz-1':
          currentValue = Object.keys(user.quizScores || {}).length >= 1 ? 1 : 0;
          break;
        case 'ach-quiz-2':
          currentValue = Object.values(user.quizScores || {}).some(s => Number(s) >= 100) ? 1 : 0;
          break;
        case 'ach-quiz-3':
          currentValue = Object.values(user.quizScores || {}).filter(s => Number(s) >= 90).length;
          break;
        case 'ach-quiz-4': {
          const hasFullyDone = completedCoursesProgress.some(p => p.total > 0 && p.completed >= p.total);
          currentValue = hasFullyDone ? 1 : 0;
          break;
        }

        case 'ach-social-1':
          currentValue = user.commentsCreatedCount || 0;
          break;
        case 'ach-social-2':
          currentValue = user.commentsCreatedCount || 0;
          break;
        case 'ach-social-3':
          currentValue = user.postsApprovedCount || 0;
          break;
        case 'ach-social-4':
          currentValue = user.postsApprovedCount || 0;
          break;

        case 'ach-xp-1':
          currentValue = user.xp || 0;
          break;
        case 'ach-xp-2':
          currentValue = user.xp || 0;
          break;
        case 'ach-xp-3':
          currentValue = user.level || 1;
          break;
        case 'ach-xp-4':
          currentValue = user.level || 1;
          break;

        case 'ach-streak-1':
          currentValue = user.streak || 0;
          break;
        case 'ach-streak-2':
          currentValue = user.streak || 0;
          break;
        case 'ach-streak-3':
          currentValue = user.streak || 0;
          break;

        case 'ach-role-1':
        case 'ach-role-2': {
          const joinedDate = user.joinedDate ? new Date(user.joinedDate) : new Date();
          const diffDays = Math.floor((new Date() - joinedDate) / (1000 * 60 * 60 * 24));
          currentValue = diffDays >= 0 ? diffDays : 0;
          break;
        }
        case 'ach-role-3':
          currentValue = Number(user.roleID) === 1 ? 1 : 0;
          break;

        case 'ach-eng-1':
          currentValue = user.groupsCreatedCount || 0;
          break;
        case 'ach-eng-2':
          currentValue = user.groupsCreatedCount || 0;
          break;
        case 'ach-eng-3': {
          const domains = new Set((user.registeredCourses || []).map(getCourseDomain));
          currentValue = domains.size;
          break;
        }

        default:
          currentValue = 0;
      }

      const targetValue = ach.progress.targetValue;
      const isUnlocked = user.achievementIds?.includes(ach.id) || (currentValue >= targetValue);
      return {
        ...ach,
        isUnlocked,
        currentValue: isUnlocked ? targetValue : currentValue,
        targetValue
      };
    });
  }, [user]);

  const registeredCoursesProgress = useMemo(() => {
    if (!user || !user.registeredCourses || courses.length === 0) return [];

    return user.registeredCourses.map(title => {
      const course = courses.find(c => c.title.toLowerCase() === title.toLowerCase());
      if (!course) return { title, progress: 0, totalLessons: 0, completedLessons: 0 };

      const lessons = course.sections ? course.sections.flatMap(s => s.lessons || []) : [];
      const totalLessons = lessons.length;
      const completedLessons = lessons.filter(l => user.quizScores && user.quizScores[l.id] !== undefined).length;
      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        progress: progressPercent,
        totalLessons,
        completedLessons,
        course
      };
    });
  }, [user, courses]);

  const [editForm, setEditForm] = useState(() => ({
    name: user?.name || 'tester the 27th',
    username: user?.username || 'tester27',
    tag: user?.tag || 'Student',
    gender: user?.gender || 'Rather Not Say',
    age: user?.age || 20,
    avatar: user?.avatar || AVATAR_OPTIONS[0]
  }));

  const [isDragging, setIsDragging] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  const openEditModal = () => {
    setEditForm({
      name: user?.name || 'tester the 27th',
      username: user?.username || 'tester27',
      tag: user?.tag || 'Student',
      gender: user?.gender || 'Rather Not Say',
      age: user?.age || 20,
      avatar: user?.avatar || AVATAR_OPTIONS[0]
    });
    setSaveError('');
    setIsEditOpen(true);
  };

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Profile picture must be smaller than 2MB.');
      return;
    }

    setAvatarError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      setEditForm(prev => ({ ...prev, avatar: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError('');
    setSaving(true);

    if (!editForm.name.trim()) {
      setSaveError('Name cannot be empty');
      setSaving(false);
      return;
    }

    if (!editForm.username.trim() || editForm.username.length < 3) {
      setSaveError('Username must be at least 3 characters');
      setSaving(false);
      return;
    }

    const res = await updateProfile(editForm);
    if (res.success) {
      setIsEditOpen(false);
    } else {
      setSaveError(res.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  // Featured achievements list matching mobile style elements
  const featuredAchievementIds = ['ach-course-1', 'ach-quiz-2', 'ach-streak-1', 'ach-quiz-1', 'ach-streak-3', 'ach-eng-3'];

  const featuredAchievements = featuredAchievementIds.map(id => {
    const found = resolvedAchievements.find(a => a.id === id);
    if (found) return found;

    if (id === 'ach-course-1') {
      return { id: 'ach-course-1', name: 'First Step', isUnlocked: true, color: 'var(--primary-main)', iconType: 'school' };
    }
    if (id === 'ach-quiz-2') {
      return { id: 'ach-quiz-2', name: 'Perfect Score', isUnlocked: true, color: '#EAB308', iconType: 'trophy' };
    }
    if (id === 'ach-streak-1') {
      return { id: 'ach-streak-1', name: '3-Day Streak', isUnlocked: false, color: '#FF5722', iconType: 'flame' };
    }
    if (id === 'ach-quiz-1') {
      return { id: 'ach-quiz-1', name: 'Speed Learner', isUnlocked: false, color: 'var(--text-secondary)', iconType: 'timer' };
    }
    if (id === 'ach-streak-3') {
      return { id: 'ach-streak-3', name: 'Consistent', isUnlocked: true, color: '#A855F7', iconType: 'trending' };
    }
    return { id: 'ach-eng-3', name: 'Course Explorer', isUnlocked: true, color: '#06B6D4', iconType: 'explore' };
  });

  const remainingCount = Math.max(0, resolvedAchievements.length - featuredAchievements.length);

  const getAchievementThemeColor = (ach) => {
    if (ach.id === 'ach-course-1') return { bg: 'rgba(var(--primary-main-rgb), 0.15)', border: 'var(--primary-main)', icon: 'var(--primary-main)' };
    if (ach.id === 'ach-quiz-2') return { bg: 'rgba(234, 179, 8, 0.18)', border: '#EAB308', icon: '#EAB308' };
    if (ach.id === 'ach-streak-1') return { bg: 'rgba(255, 87, 34, 0.18)', border: '#FF5722', icon: '#FF5722' };
    if (ach.id === 'ach-quiz-1') return { bg: 'rgba(var(--divider-rgb), 0.15)', border: 'var(--divider)', icon: 'var(--text-secondary)' };
    if (ach.id === 'ach-streak-3') return { bg: 'rgba(168, 85, 247, 0.18)', border: '#A855F7', icon: '#A855F7' };
    if (ach.id === 'ach-eng-3') return { bg: 'rgba(6, 182, 212, 0.18)', border: '#06B6D4', icon: '#06B6D4' };
    return { bg: 'rgba(var(--primary-main-rgb), 0.15)', border: 'var(--primary-main)', icon: 'var(--primary-main)' };
  };

  const getAchievementIcon = (ach) => {
    const iconRef = ach.iconReference || ach.iconType;
    if (iconRef === 'school' || ach.id === 'ach-course-1') return <CourseIcon sx={{ fontSize: 28 }} />;
    if (iconRef === 'emoji_events' || iconRef === 'trophy' || ach.id === 'ach-quiz-2') return <TrophyIcon sx={{ fontSize: 28 }} />;
    if (iconRef === 'local_fire_department' || iconRef === 'flame' || ach.id === 'ach-streak-1') return <StreakIcon sx={{ fontSize: 28 }} />;
    if (iconRef === 'quiz' || iconRef === 'timer' || ach.id === 'ach-quiz-1') return <TimerIcon sx={{ fontSize: 28 }} />;
    if (iconRef === 'trending_up' || iconRef === 'trending' || ach.id === 'ach-streak-3') return <TrendingUpIcon sx={{ fontSize: 28 }} />;
    if (iconRef === 'explore' || ach.id === 'ach-eng-3') return <ExploreIcon sx={{ fontSize: 28 }} />;
    return <TrophyIcon sx={{ fontSize: 28 }} />;
  };

  const completedCount = user?.quizScores ? Object.keys(user.quizScores).length : 133;
  const userLevel = user?.level || 36;
  const userStreak = user?.streak || 1;
  const userName = user?.name || 'tester the 27th';
  const userUsername = user?.username ? `@${user.username}` : '@tester27';
  const userTag = user?.tag || 'Student';
  const userAvatar = user?.avatar || AVATAR_OPTIONS[0];
  const userXp = user?.xp || 3540;

  const userRankName = useMemo(() => {
    return getRankName(userLevel, user?.levelName);
  }, [userLevel, user?.levelName]);

  const levelStats = useMemo(() => {
    return calculateLevelProgress(userLevel, userXp);
  }, [userLevel, userXp]);

  return (
    <Box className="web-profile-wrapper">
      <Container maxWidth="xl" className="web-profile-container">
        
        {/* SYSTEM THEME DESKTOP PROFILE HERO BANNER */}
        <Paper className="web-profile-hero">
          <Box className="web-hero-bg-glow" />
          
          <Box className="web-hero-content">
            <Box className="web-hero-user-details">
              <Box className="web-avatar-wrapper">
                <Avatar src={userAvatar} className="web-avatar-img" />
              </Box>

              <Box className="web-user-meta">
                <Box className="web-user-title-row">
                  <Typography variant="h3" className="web-user-name">
                    {userName}
                  </Typography>
                  <Box className="web-role-chip">
                    <CourseIcon sx={{ fontSize: 16 }} />
                    <span>{userTag}</span>
                  </Box>
                </Box>

                <Typography className="web-user-handle">
                  {userUsername}
                </Typography>
              </Box>
            </Box>

            <Box className="web-hero-actions">
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />} 
                onClick={openEditModal}
                className="web-edit-profile-btn"
              >
                Edit Profile
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* MAIN DESKTOP 2-COLUMN GRID */}
        <Grid container spacing={3} className="web-main-grid">
          
          {/* LEFT / MAIN COLUMN (8 cols) */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              
              {/* STATS ROW (3 SYSTEM THEME METRIC CARDS SIDE BY SIDE) */}
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={4}>
                  <Paper className="web-stat-card">
                    <Box className="web-stat-info">
                      <Typography className="web-stat-label">Level</Typography>
                      <Typography className="web-stat-value">Lvl {userLevel}</Typography>
                    </Box>
                    <Box className="web-stat-icon-wrapper gold">
                      <TrophyIcon />
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Paper className="web-stat-card">
                    <Box className="web-stat-info">
                      <Typography className="web-stat-label">Streak</Typography>
                      <Typography className="web-stat-value">{userStreak} Day{userStreak !== 1 ? 's' : ''}</Typography>
                    </Box>
                    <Box className="web-stat-icon-wrapper orange">
                      <StreakIcon />
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Paper className="web-stat-card">
                    <Box className="web-stat-info">
                      <Typography className="web-stat-label">Finished</Typography>
                      <Typography className="web-stat-value">{completedCount}</Typography>
                    </Box>
                    <Box className="web-stat-icon-wrapper blue">
                      <CourseIcon />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* ACHIEVEMENTS CARD SECTION */}
              <Paper className="web-panel-card">
                <Box className="web-panel-header">
                  <Typography variant="h5" className="web-panel-title">
                    Achievements
                  </Typography>
                  <Button 
                    className="web-view-all-btn"
                    onClick={() => navigate('/achievements')}
                    endIcon={<ChevronRightIcon />}
                  >
                    View All
                  </Button>
                </Box>

                <Grid container spacing={2.5} className="web-achievements-grid">
                  {featuredAchievements.map((ach) => {
                    const themeColors = getAchievementThemeColor(ach);
                    return (
                      <Grid item xs={12} sm={6} md={4} key={ach.id}>
                        <Paper 
                          className={`web-ach-tile ${ach.isUnlocked ? 'unlocked' : 'locked'}`}
                          style={{
                            borderColor: ach.isUnlocked ? themeColors.border : 'var(--divider)'
                          }}
                        >
                          {ach.isUnlocked && (
                            <Box className="web-ach-check-badge">
                              <CheckIcon sx={{ fontSize: 13, color: '#ffffff', fontWeight: 900 }} />
                            </Box>
                          )}

                          <Box 
                            className="web-ach-icon-circle"
                            style={{
                              backgroundColor: ach.isUnlocked ? themeColors.bg : 'rgba(var(--divider-rgb), 0.1)',
                              color: ach.isUnlocked ? themeColors.icon : 'var(--text-disabled)'
                            }}
                          >
                            {getAchievementIcon(ach)}
                          </Box>

                          <Typography className="web-ach-title">
                            {ach.name}
                          </Typography>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>

                <Box className="web-ach-footer">
                  <Typography 
                    className="web-more-ach-link"
                    onClick={() => navigate('/achievements')}
                  >
                    + {remainingCount > 0 ? remainingCount : 5} more achievements
                  </Typography>
                </Box>
              </Paper>

              {/* REGISTERED COURSES SECTION */}
              <Paper className="web-panel-card">
                <Box className="web-panel-header">
                  <Typography variant="h5" className="web-panel-title">
                    Registered Courses
                  </Typography>
                  <Button 
                    variant="text"
                    onClick={() => navigate('/courses')}
                    className="web-view-all-btn"
                  >
                    Explore More
                  </Button>
                </Box>

                {registeredCoursesProgress.length === 0 ? (
                  <Box className="web-empty-courses">
                    <Typography className="web-empty-text">
                      You haven't registered in any courses yet.
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={() => navigate('/courses')}
                      className="web-browse-btn"
                    >
                      Browse Courses
                    </Button>
                  </Box>
                ) : (
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {registeredCoursesProgress.map((cp) => (
                      <Box key={cp.title} className="web-course-item">
                        <Box className="web-course-header">
                          <Box>
                            <Typography className="web-course-name">{cp.title}</Typography>
                            {cp.description && (
                              <Typography className="web-course-desc">{cp.description}</Typography>
                            )}
                          </Box>
                          <Button 
                            variant="outlined"
                            className="web-course-resume-btn"
                            onClick={() => {
                              const slug = cp.title.toLowerCase().replace(/\s+/g, '-');
                              navigate(`/course/${slug}`, { state: { course: cp.course } });
                            }}
                          >
                            Resume
                          </Button>
                        </Box>

                        <Box className="web-course-progress-box">
                          <Box className="web-progress-text">
                            <span>Lessons: {cp.completedLessons} / {cp.totalLessons} completed</span>
                            <span className="percent">{cp.progress}%</span>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={cp.progress} 
                            className="web-linear-progress"
                          />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Paper>

            </Stack>
          </Grid>

          {/* RIGHT SIDEBAR COLUMN (4 cols) */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              
              {/* LEVEL & XP PROGRESS CARD */}
              <Paper className="web-sidebar-card">
                <Typography className="web-sidebar-card-title">
                  Level & XP
                </Typography>
                
                <Box className="web-xp-level-banner">
                  <Box className="web-level-badge">
                    <BoltIcon sx={{ color: '#FACC15', fontSize: 24 }} />
                    <Typography className="web-rank-title">{userRankName}</Typography>
                  </Box>
                  <Typography className="web-level-subtitle">Level {userLevel}</Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Box className="web-progress-text" sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                      Next Level (Lvl {levelStats.nextLevel})
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--primary-main)', fontWeight: 700 }}>
                      {levelStats.percent}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={levelStats.percent} 
                    className="web-linear-progress" 
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ color: 'var(--text-secondary)', display: 'block', mt: 1.5, textAlign: 'right', fontSize: '0.78rem', fontWeight: 600 }}
                  >
                    {levelStats.xpNeeded} XP needed to reach Level {levelStats.nextLevel}
                  </Typography>
                </Box>
              </Paper>

              {/* ACCOUNT SUMMARY DETAILS CARD */}
              <Paper className="web-sidebar-card">
                <Typography className="web-sidebar-card-title">
                  Account Overview
                </Typography>

                <Stack spacing={2} className="web-meta-list">
                  <Box className="web-meta-item">
                    <FingerprintIcon className="web-meta-icon" />
                    <Box>
                      <Typography className="web-meta-label">Username</Typography>
                      <Typography className="web-meta-value">{userUsername}</Typography>
                    </Box>
                  </Box>

                  <Box className="web-meta-item">
                    <PersonIcon className="web-meta-icon" />
                    <Box>
                      <Typography className="web-meta-label">Gender / Age</Typography>
                      <Typography className="web-meta-value">
                        {user?.gender || 'Rather Not Say'} • {user?.age || 20} years old
                      </Typography>
                    </Box>
                  </Box>

                  <Box className="web-meta-item">
                    <CalendarIcon className="web-meta-icon" />
                    <Box>
                      <Typography className="web-meta-label">Member Since</Typography>
                      <Typography className="web-meta-value">
                        {safeFormatDate(user?.joinedDate, { year: 'numeric', month: 'long', day: 'numeric' }, 'Recently')}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>

            </Stack>
          </Grid>

        </Grid>
      </Container>

      {/* EDIT PROFILE DIALOG (SETTINGS MODAL) */}
      <Dialog 
        open={isEditOpen} 
        onClose={() => setIsEditOpen(false)}
        maxWidth="xs" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'var(--background-paper)',
            color: 'var(--text-primary)',
            borderRadius: '24px',
            border: '1px solid var(--divider)',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, pb: 1, color: 'var(--text-primary)' }}>
          Edit Profile
          <IconButton onClick={() => setIsEditOpen(false)} sx={{ color: 'var(--text-secondary)' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: 'var(--divider)' }}>
          {saveError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {saveError}
            </Alert>
          )}

          <Box className="avatar-upload-section" sx={{ mb: 3 }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <Box 
              className={`avatar-dropzone ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <Avatar
                src={editForm.avatar}
                sx={{ width: '100%', height: '100%' }}
              />
              <Box className="avatar-hover-overlay">
                <CameraAltIcon sx={{ fontSize: 32 }} />
              </Box>
            </Box>
            {avatarError && (
              <Alert severity="warning" className="avatar-error-alert" sx={{ mt: 1 }}>
                {avatarError}
              </Alert>
            )}
          </Box>

          <TextField
            fullWidth
            label="Full Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            margin="normal"
            variant="outlined"
            slotProps={{
              input: { sx: { color: 'var(--text-primary)', borderRadius: '12px' } },
              inputLabel: { sx: { color: 'var(--text-secondary)' } }
            }}
          />

          <TextField
            fullWidth
            label="Username"
            value={editForm.username}
            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
            margin="normal"
            slotProps={{
              input: { sx: { color: 'var(--text-primary)', borderRadius: '12px' } },
              inputLabel: { sx: { color: 'var(--text-secondary)' } }
            }}
          />

          <TextField
            fullWidth
            label="Role / Tag"
            value={editForm.tag}
            onChange={(e) => setEditForm({ ...editForm, tag: e.target.value })}
            margin="normal"
            slotProps={{
              input: { sx: { color: 'var(--text-primary)', borderRadius: '12px' } },
              inputLabel: { sx: { color: 'var(--text-secondary)' } }
            }}
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Age"
              type="number"
              value={editForm.age}
              onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
              margin="normal"
              slotProps={{
                input: { sx: { color: 'var(--text-primary)', borderRadius: '12px' } },
                inputLabel: { sx: { color: 'var(--text-secondary)' } }
              }}
            />

            <TextField
              fullWidth
              select
              label="Gender"
              value={editForm.gender}
              onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
              margin="normal"
              SelectProps={{ native: true }}
              slotProps={{
                input: { sx: { color: 'var(--text-primary)', borderRadius: '12px' } },
                inputLabel: { sx: { color: 'var(--text-secondary)' } }
              }}
            >
              <option value="Rather Not Say" style={{ background: 'var(--background-paper)', color: 'var(--text-primary)' }}>Rather Not Say</option>
              <option value="Male" style={{ background: 'var(--background-paper)', color: 'var(--text-primary)' }}>Male</option>
              <option value="Female" style={{ background: 'var(--background-paper)', color: 'var(--text-primary)' }}>Female</option>
            </TextField>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setIsEditOpen(false)} 
            sx={{ color: 'var(--text-secondary)', textTransform: 'none', fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={saving}
            sx={{
              background: 'var(--primary-main)',
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: '12px',
              px: 3
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;