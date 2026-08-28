import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  LinearProgress,
  Button,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Trophy, 
  Lock, 
  GraduationCap, 
  Flame, 
  Zap, 
  Compass, 
  Award, 
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Medal,
  HelpCircle,
  BookOpen,
  MessageSquare,
  MessagesSquare,
  ThumbsUp,
  Star,
  ArrowUp,
  Calendar,
  History,
  UserCheck,
  UserPlus,
  Users
} from 'lucide-react';
import './AchievementsPage.css';
import { useAuth } from '../../context/AuthContext';
import { achievementsData } from '../../data/achievements';

const iconMap = {
  'school': <GraduationCap className="icon-main" />,
  'emoji_events': <Trophy className="icon-main" />,
  'local_fire_department': <Flame className="icon-main" />,
  'bolt': <Zap className="icon-main" />,
  'explore': <Compass className="icon-main" />,
  'workspace_premium': <Award className="icon-main" />,
  
  'trending_up': <TrendingUp className="icon-main" />,
  'military_tech': <Medal className="icon-main" />,
  'quiz': <HelpCircle className="icon-main" />,
  'verified': <ShieldCheck className="icon-main" />,
  'auto_stories': <BookOpen className="icon-main" />,
  'chat_bubble_outline': <MessageSquare className="icon-main" />,
  'forum': <MessagesSquare className="icon-main" />,
  'thumb_up': <ThumbsUp className="icon-main" />,
  'stars': <Sparkles className="icon-main" />,
  'star_outline': <Star className="icon-main" style={{ fill: 'none' }} />,
  'star': <Star className="icon-main" style={{ fill: 'currentColor' }} />,
  'arrow_upward': <ArrowUp className="icon-main" />,
  'whatshot': <Flame className="icon-main" style={{ color: '#FF8A3D' }} />,
  'flame_member': <Flame className="icon-main" />,
  'calendar_today': <Calendar className="icon-main" />,
  'history': <History className="icon-main" />,
  'assignment_ind': <UserCheck className="icon-main" />,
  'group_add': <UserPlus className="icon-main" />,
  'groups': <Users className="icon-main" />,
};

const AchievementsPage = () => {
  const { user, unlockAchievement } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'course', label: 'Course Progress' },
    { id: 'quiz', label: 'Quiz & Performance' },
    { id: 'social', label: 'Social & Community' },
    { id: 'xp', label: 'XP & Levels' },
    { id: 'streak', label: 'Streaks' },
    { id: 'role', label: 'Roles & Account' },
    { id: 'engagement', label: 'Engagement & Misc' }
  ];

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

  const calculateAchievementProgress = (ach) => {
    if (!user) return ach.progress;

    let currentValue = 0;
    const completedCoursesProgress = getRegisteredCoursesProgress();

    switch (ach.id) {
      // 📚 Course Progress
      case 'ach-course-1': // First Step
        currentValue = (user.registeredCourses || []).length >= 1 ? 1 : 0;
        break;
      case 'ach-course-2': // Getting Somewhere
        const has50Percent = completedCoursesProgress.some(p => p.percent >= 50);
        currentValue = has50Percent ? 50 : 0;
        break;
      case 'ach-course-3': // Finished What I Started
        const hasFinishedCourse = completedCoursesProgress.some(p => p.total > 0 && p.completed >= p.total);
        currentValue = hasFinishedCourse ? 1 : 0;
        break;
      case 'ach-course-4': // On a Roll
        currentValue = completedCoursesProgress.filter(p => p.total > 0 && p.completed >= p.total).length;
        break;

      // 🧪 Quiz & Performance
      case 'ach-quiz-1': // Tried My Best
        currentValue = Object.keys(user.quizScores || {}).length >= 1 ? 1 : 0;
        break;
      case 'ach-quiz-2': // Nailed It
        currentValue = Object.values(user.quizScores || {}).some(s => Number(s) >= 100) ? 1 : 0;
        break;
      case 'ach-quiz-3': // High Achiever
        currentValue = Object.values(user.quizScores || {}).filter(s => Number(s) >= 90).length;
        break;
      case 'ach-quiz-4': // Cover to Cover
        const hasFullyDone = completedCoursesProgress.some(p => p.total > 0 && p.completed >= p.total);
        currentValue = hasFullyDone ? 1 : 0;
        break;

      // 💬 Social & Community
      case 'ach-social-1': // Speak Up
        currentValue = user.commentsCreatedCount || 0;
        break;
      case 'ach-social-2': // Always Has Something to Say
        currentValue = user.commentsCreatedCount || 0;
        break;
      case 'ach-social-3': // Making an Impact
        currentValue = user.postsApprovedCount || 0;
        break;
      case 'ach-social-4': // Known Around Here
        currentValue = user.postsApprovedCount || 0;
        break;

      // ⚡ XP & Levels
      case 'ach-xp-1': // Getting Started
        currentValue = user.xp || 0;
        break;
      case 'ach-xp-2': // Making Moves
        currentValue = user.xp || 0;
        break;
      case 'ach-xp-3': // Moving Up
        currentValue = user.level || 1;
        break;
      case 'ach-xp-4': // At the Top
        currentValue = user.level || 1;
        break;

      // 🔥 Streaks
      case 'ach-streak-1': // Warming Up
        currentValue = user.streak || 0;
        break;
      case 'ach-streak-2': // In the Zone
        currentValue = user.streak || 0;
        break;
      case 'ach-streak-3': // Creature of Habit
        currentValue = user.streak || 0;
        break;

      // 🎭 Roles & Account Age
      case 'ach-role-1': // Day One
      case 'ach-role-2': // Been Here Forever
        const joinedDate = user.joinedDate ? new Date(user.joinedDate) : new Date();
        const diffDays = Math.floor((new Date() - joinedDate) / (1000 * 60 * 60 * 24));
        currentValue = diffDays >= 0 ? diffDays : 0;
        break;
      case 'ach-role-3': // Teacher's Got the Floor
        currentValue = Number(user.roleID) === 1 ? 1 : 0;
        break;

      // 🏠 Engagement & Misc
      case 'ach-eng-1': // Party Starter
        currentValue = user.groupsCreatedCount || 0;
        break;
      case 'ach-eng-2': // Always Hosting
        currentValue = user.groupsCreatedCount || 0;
        break;
      case 'ach-eng-3': // Bit of Everything
        const domains = new Set((user.registeredCourses || []).map(getCourseDomain));
        currentValue = domains.size;
        break;

      default:
        currentValue = 0;
    }

    const targetValue = ach.progress.targetValue;
    const isUnlocked = user.achievementIds?.includes(ach.id) || (currentValue >= targetValue);
    
    return {
      currentValue: isUnlocked ? targetValue : currentValue,
      targetValue,
      isUnlocked,
      unlockedAt: isUnlocked ? new Date() : null
    };
  };

  const achievements = achievementsData.map(ach => {
    const progress = calculateAchievementProgress(ach);
    const isCompleted = progress.isUnlocked;
    const progressPercent = ach.progress.targetValue > 0 
      ? Math.min((progress.currentValue / ach.progress.targetValue) * 100, 100) 
      : 0;

    return {
      id: ach.id,
      title: ach.name,
      desc: ach.description,
      icon: iconMap[ach.iconReference] || iconMap['school'],
      status: isCompleted ? 'completed' : (progress.currentValue > 0 ? 'in_progress' : 'locked'),
      progress: progressPercent,
      currentValue: progress.currentValue,
      targetValue: ach.progress.targetValue,
      color: ach.associatedColor || 'var(--primary-main)',
      categoryType: ach.categoryType,
      date: isCompleted ? new Date().toISOString().split('T')[0] : null
    };
  });

  // Auto-unlock observer
  useEffect(() => {
    if (!user || !user.achievementIds || !unlockAchievement) return;
    achievementsData.forEach(ach => {
      const progress = calculateAchievementProgress(ach);
      if (progress.isUnlocked && !user.achievementIds.includes(ach.id)) {
        unlockAchievement(ach.id);
      }
    });
  }, [user?.registeredCourses, user?.quizScores, user?.xp, user?.level, user?.streak, user?.commentsCreatedCount, user?.postsApprovedCount, user?.groupsCreatedCount, user?.achievementIds]);

  const unlockedCount = achievements.filter(a => a.status === 'completed').length;
  const overallPercentage = Math.round((unlockedCount / achievements.length) * 100);

  const filteredAchievements = achievements.filter(a => {
    // 1. Completion status filter
    if (activeFilter === 'completed' && a.status !== 'completed') return false;
    if (activeFilter === 'locked' && a.status !== 'locked') return false;

    // 2. Category filter
    if (categoryFilter !== 'all' && a.categoryType !== categoryFilter) return false;

    return true;
  });

  return (
    <Box className="achievements-container">
      <Container maxWidth="lg">
        <Box className="badge-glow-container">
          <Trophy className="hero-trophy-icon" />
        </Box>

        {/* Grid Title & Filter Controls */}
        <Box className="grid-section-header" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', width: '100%' }}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h5" className="grid-title" style={{ textAlign: 'center' }}>Milestones & Badge Collection</Typography>
            </Box>
            <box></box>
            <Box style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
              <Button
                className="achievements-filter-btn"
                variant={activeFilter === 'all' ? 'contained' : 'outlined'}
                onClick={() => setActiveFilter('all')}
                size="small"
                style={{ borderRadius: '8px', textTransform: 'none', fontWeight: 800 }}
              >
                All
              </Button>
              <Button
                className="achievements-filter-btn"
                variant={activeFilter === 'completed' ? 'contained' : 'outlined'}
                onClick={() => setActiveFilter('completed')}
                size="small"
                style={{ borderRadius: '8px', textTransform: 'none', fontWeight: 800 }}
              >
                Unlocked
              </Button>
              <Button
                className="achievements-filter-btn"
                variant={activeFilter === 'locked' ? 'contained' : 'outlined'}
                onClick={() => setActiveFilter('locked')}
                size="small"
                style={{ borderRadius: '8px', textTransform: 'none', fontWeight: 800 }}
              >
                Locked
              </Button>

              {/* Theme-based Category Dropdown Menu */}
              <FormControl size="small" style={{ minWidth: '170px', marginLeft: '8px' }}>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--background-paper)',
                    border: '1px solid var(--divider)',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    height: '32px'
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        backgroundColor: 'var(--background-paper)',
                        border: '1px solid var(--divider)',
                        color: 'var(--text-primary)',
                        borderRadius: '8px'
                      }
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    '& .MuiSelect-icon': { color: 'var(--text-secondary)' }
                  }}
                >
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id} style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>

        {/* Achievements Grouped by Category - One Category Per Row */}
        {(() => {
          const categoriesToDisplay = categoryFilter === 'all'
            ? categories.filter(c => c.id !== 'all')
            : categories.filter(c => c.id === categoryFilter);

          return categoriesToDisplay.map((cat) => {
            const catAchievements = filteredAchievements.filter(a => a.categoryType === cat.id);
            if (catAchievements.length === 0) return null;

            return (
              <Box key={cat.id} className="category-row-wrapper" style={{ marginBottom: '40px' }}>
                <Typography variant="h5" style={{ fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Outfit, sans-serif' }}>
                  <span style={{ width: '4px', height: '24px', backgroundColor: 'var(--primary-main)', borderRadius: '2px', display: 'inline-block' }}></span>
                  {cat.label}
                </Typography>
                
                <Box className="achievements-row-container">
                  {catAchievements.map((item, index) => {
                    const mixPercent = index === 0 ? '5%' : index === 1 ? '12%' : index === 2 ? '22%' : '35%';
                    const hoverMixPercent = index === 0 ? '9%' : index === 1 ? '18%' : index === 2 ? '30%' : '45%';
                    
                    const borderColor = index === 0 
                      ? 'color-mix(in srgb, var(--primary-main) 20%, var(--divider))'
                      : index === 1
                      ? 'color-mix(in srgb, var(--primary-main) 45%, var(--divider))'
                      : index === 2
                      ? 'color-mix(in srgb, var(--primary-main) 70%, var(--divider))'
                      : 'var(--primary-main)';
                      
                    const hoverBorderColor = index === 0
                      ? 'color-mix(in srgb, var(--primary-main) 40%, var(--divider))'
                      : index === 1
                      ? 'color-mix(in srgb, var(--primary-main) 65%, var(--divider))'
                      : index === 2
                      ? 'color-mix(in srgb, var(--primary-main) 90%, var(--divider))'
                      : 'var(--primary-main)';

                    const borderWidth = index === 0 ? '1px' : index === 1 ? '1.5px' : index === 2 ? '2px' : '2.5px';
                    const borderWidthCompleted = index === 0 ? '1.5px' : index === 1 ? '2px' : index === 2 ? '2.5px' : '3px';

                    return (
                      <Paper 
                        key={item.id}
                        className={`premium-achievement-card ${item.status}`}
                        style={{ 
                          '--card-accent-color': item.color,
                          '--difficulty-mix': mixPercent,
                          '--difficulty-hover-mix': hoverMixPercent,
                          '--difficulty-border': borderColor,
                          '--difficulty-hover-border': hoverBorderColor,
                          '--difficulty-border-width': borderWidth,
                          '--difficulty-border-width-completed': borderWidthCompleted,
                          borderTop: `4px solid ${item.color}`
                        }}
                      >
                      {/* Lock Overlay for Locked Items */}
                      {item.status === 'locked' && (
                        <Box className="card-lock-overlay">
                          <Lock className="card-lock-icon" size={18} />
                          <span>Locked</span>
                        </Box>
                      )}

                      {/* Card Header with Glowing Icon (background container removed) */}
                      <Box 
                        className={`card-icon-wrapper ${item.status}`}
                        style={{ 
                          color: item.status === 'completed' ? item.color : undefined
                        }}
                      >
                        {item.icon}
                      </Box>

                      {/* Card Text Content */}
                      <Typography variant="h6" className="premium-card-title">
                        {item.title}
                      </Typography>
                      <Typography variant="body2" className="premium-card-desc">
                        {item.desc}
                      </Typography>

                      {/* Card Footer Status Indicator */}
                      <Box className="premium-card-footer">
                        {item.status === 'completed' ? (
                          <Box className="achievement-unlocked-status">
                            <ShieldCheck size={16} className="unlocked-icon" />
                            <Typography variant="caption">
                              Unlocked
                            </Typography>
                          </Box>
                        ) : item.status === 'in_progress' ? (
                          <Box className="achievement-progress-status">
                            <Box className="progress-text-row">
                              <span>Progress</span>
                              <span>{item.currentValue} / {item.targetValue}</span>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={item.progress} 
                              className="card-progress-bar"
                              style={{ '--bar-accent-color': item.color }}
                            />
                          </Box>
                        ) : (
                          <Box className="achievement-locked-status">
                            <Lock size={14} className="locked-icon" />
                            <Typography variant="caption">
                              Requirement: {item.targetValue}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  )})}
                </Box>
              </Box>
            );
          });
        })()}

      </Container>
    </Box>
  );
};

export default AchievementsPage;