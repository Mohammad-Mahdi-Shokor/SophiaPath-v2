import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Chip,
  LinearProgress,
  Paper,
  TextField,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import SecurityIcon from '@mui/icons-material/Security';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ScienceIcon from '@mui/icons-material/Science';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CodeIcon from '@mui/icons-material/Code';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PaletteIcon from '@mui/icons-material/Palette';
import BusinessIcon from '@mui/icons-material/Business';
import SchoolIcon from '@mui/icons-material/School';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { ArrowOutward as ArrowOutwardIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { coursesData } from '../data/courses';
import './LearningPage.css';

import computerScienceIcon from '../assets/courses/computerScience.png';
import cybersecurityIcon from '../assets/courses/cybersecurity.png';
import philosophyCourseIcon from '../assets/courses/philosophy.png';

const getCourseImage = (title) => {
  const t = (title || '').toLowerCase();
  if (t.includes('cyber') || t.includes('security')) {
    return cybersecurityIcon;
  }
  if (t.includes('philosoph')) {
    return philosophyCourseIcon;
  }
  if (t.includes('computer') || t.includes('science') || t.includes('c++') || t.includes('programming') || t.includes('oop')) {
    return computerScienceIcon;
  }
  return computerScienceIcon; // Default fallback
};

const getCourseDomain = (title) => {
  const t = title.toLowerCase();
  if (t.includes('cyber') || t.includes('security') || t.includes('network')) {
    return 'Technology';
  }
  if (t.includes('computer') || t.includes('develop') || t.includes('ai') || t.includes('code') || t.includes('basics') || t.includes('programming') || t.includes('mobile')) {
    return 'Technology';
  }
  if (t.includes('physics') || t.includes('science') || t.includes('math') || t.includes('chem')) {
    return 'Science';
  }
  if (t.includes('philosophy') || t.includes('ethics') || t.includes('history') || t.includes('art') || t.includes('humanities')) {
    return 'Humanities';
  }
  if (t.includes('design') || t.includes('graphic') || t.includes('ui') || t.includes('ux') || t.includes('creative')) {
    return 'Design';
  }
  if (t.includes('business') || t.includes('marketing') || t.includes('management') || t.includes('finance')) {
    return 'Business';
  }
  return 'Technology';
};

const LearningPage = () => {
  const { user, registerCourse, unregisterCourse } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [courses, setCourses] = useState(coursesData);
  const navigate = useNavigate();

  // Role Application State (FR-S-46)
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [appEmail, setAppEmail] = useState(user?.email || '');
  const [appPhone, setAppPhone] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [cvFile, setCvFile] = useState(null); // { name, base64 }

  const [appSubmitting, setAppSubmitting] = useState(false);
  const [appError, setAppError] = useState('');
  const [appSuccess, setAppSuccess] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCvFile({
        name: file.name,
        base64: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAppSubmit = async (e) => {
    e.preventDefault();
    setAppError('');
    setAppSuccess('');
    setAppSubmitting(true);

    if (!appEmail.trim()) {
      setAppError('Email is required.');
      setAppSubmitting(false);
      return;
    }
    if (!cvFile) {
      setAppError('Please upload your CV (file).');
      setAppSubmitting(false);
      return;
    }

    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (!token) {
      setAppError('You must be logged in to apply.');
      setAppSubmitting(false);
      return;
    }

    try {
      // Build custom JSON string to fit in reasons field
      const reasonsPayload = JSON.stringify({
        email: appEmail,
        phone: appPhone || '',
        cvFileName: cvFile.name,
        cvBase64: cvFile.base64,
        reasons: appDescription
      });

      const payload = {
        title: "Expert Position Application",
        fullName: user?.name || user?.username || "Anonymous Applicant",
        description: `Expert candidacy request for course ID ${selectedCourse?.id}.`,
        requestedRole: 1, // Expert
        reasons: reasonsPayload,
        reasonableQuestions: "Not Applicable",
        courseId: selectedCourse?.id
      };

      const res = await fetch('/users/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setAppSuccess('Your application has been submitted successfully!');
        setAppEmail(user?.email || '');
        setAppPhone('');
        setAppDescription('');
        setCvFile(null);
        setTimeout(() => {
          setDialogOpen(false);
          setAppSuccess('');
        }, 1500);
      } else {
        const err = await res.json();
        setAppError(err.message || 'Failed to submit application.');
      }
    } catch (err) {
      console.error(err);
      setAppError('Network error, please try again.');
    } finally {
      setAppSubmitting(false);
    }
  };

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await fetch('/courses');
        if (res.ok) {
          const backendCourses = await res.json();
          if (backendCourses && backendCourses.length > 0) {
            const mapped = backendCourses.map(bc => ({
              id: bc.id,
              title: bc.title,
              description: bc.description || '',
              about: bc.about || '',
              imageUrl: bc.imageUrl || '',
              comingsoon: bc.comingsoon || false,
              domain: getCourseDomain(bc.title),
              sections: (bc.sections || []).map(sec => ({
                id: sec.id,
                title: sec.title,
                description: sec.description || '',
                lessons: (sec.lessons || []).map(les => ({
                  id: les.id,
                  category: les.category || 'learning',
                  chapterName: les.chapterName || '',
                  title: les.title || 'Untitled Lesson',
                  orderIndex: les.orderIndex || 0
                }))
              }))
            }));
            setCourses(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to load courses from backend /courses:', err);
      }
    };
    loadCourses();
  }, []);

  const categories = useMemo(() => {
    const domains = courses.map(c => c.domain).filter(Boolean);
    const uniqueDomains = Array.from(new Set(domains));
    uniqueDomains.sort();
    return ['All', ...uniqueDomains];
  }, [courses]);

  const registeredCourseTitles = user?.registeredCourses || [];

  const courseProgress = useMemo(() => {
    const progress = {};
    if (!user) return progress;

    courses.forEach(course => {
      const courseTitleLower = course.title.toLowerCase();
      const loadedLessons = user.courseLessons?.[courseTitleLower];

      if (loadedLessons && loadedLessons.length > 0) {
        // Apply title-based deduplication to match LearningPathPage roadmap view
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

        progress[course.title] = {
          completed: completedLessons.length,
          total: uniqueLessons.length
        };
      } else {
        const fallbackTotal = course.sections?.flatMap(s => s.lessons || []).length || 0;
        progress[course.title] = {
          completed: 0,
          total: course.totalLessons || fallbackTotal || 0
        };
      }
    });
    return progress;
  }, [user, courses]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === 'All' || course.domain === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const totalAvailableCourses = courses.length;

  const comingSoon = [
    'Artificial Intelligence',
    'Web Development',
    'Data Science',
    'Digital Marketing',
    'Graphic Design',
    'Business Management',
  ];

  const getCourseIcon = (courseTitle) => {
    const lowerTitle = courseTitle.toLowerCase();
    switch (lowerTitle) {
      case 'cybersecurity':
        return <SecurityIcon />;
      case 'mobile development':
        return <PhoneAndroidIcon />;
      case 'physics':
        return <ScienceIcon />;
      case 'philosophy':
        return <PsychologyIcon />;
      case 'artificial intelligence':
        return <SmartToyIcon />;
      case 'web development':
        return <CodeIcon />;
      case 'data science':
        return <AnalyticsIcon />;
      case 'digital marketing':
        return <TrendingUpIcon />;
      case 'graphic design':
        return <PaletteIcon />;
      case 'business management':
        return <BusinessIcon />;
      default:
        return <SchoolIcon />;
    }
  };

  const dashboardStats = useMemo(() => {
    const activeCourses = registeredCourseTitles.length;
    const totalLessonsCompleted = Object.values(courseProgress).reduce((sum, value) => sum + (value.completed || 0), 0);
    const totalCoursesCompleted = Object.entries(courseProgress).filter(([title, progressObj]) => {
      return progressObj.total > 0 && progressObj.completed === progressObj.total;
    }).length;

    return [
      { label: 'Active Courses', value: String(activeCourses).padStart(2, '0') },
      { label: 'Lessons Cleared', value: String(totalLessonsCompleted).padStart(2, '0') },
      { label: 'Courses Completed', value: String(totalCoursesCompleted).padStart(2, '0') },
    ];
  }, [courseProgress, registeredCourseTitles]);

  const isCourseRegistered = (courseTitle) => {
    return registeredCourseTitles.some(title => title.toLowerCase() === courseTitle.toLowerCase());
  };

  const getLessonsFinished = (courseTitle) => {
    return courseProgress[courseTitle]?.completed || 0;
  };

  const getTotalLessons = (courseTitle) => {
    if (courseProgress[courseTitle]) {
      return courseProgress[courseTitle].total;
    }
    const course = courses.find(c => c.title.toLowerCase() === courseTitle.toLowerCase());
    return course ? (course.totalLessons || 0) : 0;
  };

  const handleCourseClick = (course) => {
    const freshCourse = courses.find(c => c.title.toLowerCase() === course.title.toLowerCase()) || course;
    const courseUrlSlug = course.title.toLowerCase().replace(/\s+/g, '-');

    navigate(`/course/${courseUrlSlug}`, {
      state: { course: freshCourse }
    });
  };

  return (
    <Box className="learning-page">
      <section className="learning-intro glass-panel-strong">
        <div className="learning-intro-copy">
          <div className="learning-intro-search">
            <TextField
              fullWidth
              placeholder="Search courses or technologies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="learning-search-field"
              InputProps={{
                startAdornment: <SearchIcon className="learning-search-icon" />
              }}
            />
          </div>

          <div className="learning-category-row">
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                onClick={() => setActiveCategory(category)}
                className={`learning-category-chip ${activeCategory === category ? 'is-active' : ''}`}
              />
            ))}
          </div>

          <Box style={{ width: '100%', marginTop: '24px' }}>
            <Paper className="learning-stats-panel glass-panel" elevation={0} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'row', gap: '24px', justifyContent: 'space-around', alignItems: 'center', width: '100%', borderRadius: '24px' }}>
              {dashboardStats.map((stat) => (
                <Box key={stat.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                  <Typography style={{ fontWeight: 900, fontSize: '1.8rem', color: 'var(--primary-main)', fontFamily: '"Outfit", sans-serif' }}>{stat.value}</Typography>
                  <Typography style={{ color: 'var(--text-secondary)', fontWeight: 750, fontSize: '0.78rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</Typography>
                </Box>
              ))}
            </Paper>
          </Box>
        </div>
      </section>

      <section className="learning-section">
        {filteredCourses.length > 0 ? (
          <div className="learning-course-grid">
            {filteredCourses.map((course) => {
              const isRegistered = isCourseRegistered(course.title);
              const lessonsFinished = getLessonsFinished(course.title);
              const totalLessons = getTotalLessons(course.title);
              const progress = totalLessons > 0 ? (lessonsFinished / totalLessons) * 100 : 0;

              const isCybersecurity = course.title.toLowerCase().includes('cybersecurity');
              const isPhilosophy = course.title.toLowerCase() === 'philosophy';

              return (
                <Paper
                  key={course.title}
                  className="learning-course-card glass-panel"
                  elevation={0}
                  onClick={() => handleCourseClick(course)}
                  style={{ position: 'relative' }}
                >
                  {/* Settings or More options button overlay */}
                  {(Number(user?.roleID) === 3 || (Number(user?.roleID) === 1 && user.assignedCourseIds?.map(Number).includes(Number(course.id)))) ? (
                    <IconButton
                      size="small"
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'none',
                        color: 'var(--primary-main)',
                        border: 'none',
                        zIndex: 10
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to Dashboard with editCourse state
                        navigate('/', { state: { editCourse: course } });
                      }}
                      title="Manage Course Syllabus"
                    >
                      <SettingsIcon style={{ fontSize: '1.15rem' }} />
                    </IconButton>
                  ) : (
                    <IconButton
                      size="small"
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'none',
                        color: 'var(--text-secondary)',
                        border: 'none',
                        zIndex: 10
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCourse(course);
                        setMenuAnchor(e.currentTarget);
                      }}
                      title="More Options"
                    >
                      <MoreVertIcon style={{ fontSize: '1.15rem' }} />
                    </IconButton>
                  )}

                  <img
                    src={getCourseImage(course.title)}
                    alt=""
                    className={`learning-course-card-bg ${
                      (course.title || '').toLowerCase().includes('science') || (course.title || '').toLowerCase().includes('computer') || (course.title || '').toLowerCase().includes('c++') ? 'cs-icon-bg' :
                      (course.title || '').toLowerCase().includes('philosoph') ? 'philosophy-icon-bg' : ''
                    }`}
                  />

                  <div className="learning-course-content-box">
                    <Typography variant="h5" className="learning-course-title">
                      {course.title}
                    </Typography>

                    <div className="learning-course-footer">
                      {isRegistered ? (
                        <div className="learning-course-progress">
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            className="learning-course-progress-bar"
                          />
                          <span className="learning-course-progress-text">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      ) : (
                        <div className="learning-course-cta">
                          <span>Start learning</span>
                          <PlayArrowIcon fontSize="small" />
                        </div>
                      )}
                    </div>
                  </div>
                </Paper>
              );
            })}
          </div>
        ) : (
          <Paper className="learning-empty-state glass-panel" elevation={0}>
            <Typography variant="h6">No courses found for "{searchQuery}"</Typography>
            <Typography variant="body2">
              Try another keyword or switch the active category filter.
            </Typography>
          </Paper>
        )}
      </section>

      <section className="learning-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginTop: '2rem' }}>
        <Box style={{ textAlign: 'center' }}>
          <Typography variant="h4" className="learning-section-title">
            Coming Soon
          </Typography>
          <br />
        </Box>

        <Box style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', maxWidth: '800px' }}>
          {comingSoon.map((title) => (
            <Box key={title} style={{ display: 'flex' }}>
              <Chip
                icon={getCourseIcon(title)}
                label={title}
                style={{
                  background: 'var(--surface-glass)',
                  border: '1px solid var(--divider)',
                  padding: '8px 12px',
                  height: 'auto',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem'
                }}
              />
            </Box>
          ))}
        </Box>
      </section>

      {/* Course Options Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{
          style: {
            background: 'var(--background-paper)',
            color: 'var(--text-primary)',
            border: '1px solid rgba(255,255,255,0.08)'
          }
        }}
      >
        {selectedCourse?.title?.toLowerCase()?.includes('cybersecurity') ? (
          <>
            {isCourseRegistered(selectedCourse.title) ? (
              <>
                <MenuItem
                  onClick={() => {
                    setMenuAnchor(null);
                    handleCourseClick(selectedCourse);
                  }}
                  style={{ fontWeight: 600, color: '#00f3ff' }}
                >
                  Continue Learning
                </MenuItem>
                <MenuItem
                  onClick={async () => {
                    setMenuAnchor(null);
                    if (unregisterCourse) {
                      await unregisterCourse(selectedCourse.title);
                    }
                  }}
                  style={{ fontWeight: 650, color: 'var(--danger-main, #ef4444)' }}
                >
                  Unenroll from Course
                </MenuItem>
              </>
            ) : (
              <MenuItem
                onClick={async () => {
                  setMenuAnchor(null);
                  if (registerCourse) {
                    await registerCourse(selectedCourse.title);
                  }
                }}
                style={{ fontWeight: 600, color: '#00f3ff' }}
              >
                Register / Enroll
              </MenuItem>
            )}
            {(Number(user?.roleID) === 3 || (Number(user?.roleID) === 1 && user.assignedCourseIds?.map(Number).includes(Number(selectedCourse.id)))) && (
              <MenuItem
                onClick={() => {
                  setMenuAnchor(null);
                  navigate('/', { state: { editCourse: selectedCourse } });
                }}
                style={{ fontWeight: 600 }}
              >
                Manage Course Syllabus
              </MenuItem>
            )}
          </>
        ) : (
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              setDialogOpen(true);
            }}
            style={{ fontWeight: 700 }}
          >
            Apply for expert position
          </MenuItem>
        )}
      </Menu>

      {/* Expert Application Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        PaperProps={{
          style: {
            background: 'var(--background-paper)',
            color: 'var(--text-primary)',
            border: '1px solid var(--divider)',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '12px'
          }
        }}
      >
        <DialogTitle style={{ fontWeight: 900, fontFamily: '"Outfit", sans-serif' }}>
          Apply for Expert Position
        </DialogTitle>
        <form onSubmit={handleAppSubmit}>
          <DialogContent>
            <Typography variant="body2" style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              You are applying to become the Course Expert for: <strong>{selectedCourse?.title}</strong>. Please upload your CV and fill in the contact details.
            </Typography>

            {appError && <Chip label={appError} color="error" style={{ marginBottom: '16px', width: '100%', fontWeight: 700 }} />}
            {appSuccess && <Chip label={appSuccess} color="success" style={{ marginBottom: '16px', width: '100%', fontWeight: 700 }} />}

            <Box style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <TextField
                fullWidth
                label="Email Address"
                value={appEmail}
                onChange={(e) => setAppEmail(e.target.value)}
                required
                size="small"
                sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--divider)' } }}
                InputProps={{ style: { color: 'var(--text-primary)' } }}
                InputLabelProps={{ style: { color: 'var(--text-secondary)' } }}
              />

              <TextField
                fullWidth
                label="Phone Number (Optional)"
                value={appPhone}
                onChange={(e) => setAppPhone(e.target.value)}
                size="small"
                sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--divider)' } }}
                InputProps={{ style: { color: 'var(--text-primary)' } }}
                InputLabelProps={{ style: { color: 'var(--text-secondary)' } }}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Qualifications & Motivation"
                value={appDescription}
                onChange={(e) => setAppDescription(e.target.value)}
                required
                size="small"
                sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--divider)' } }}
                InputProps={{ style: { color: 'var(--text-primary)' } }}
                InputLabelProps={{ style: { color: 'var(--text-secondary)' } }}
              />

              <Box>
                <Typography variant="caption" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                  Upload CV (Required)
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  style={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '8px',
                    borderColor: 'var(--divider)',
                    color: 'var(--text-primary)',
                    padding: '8px 12px'
                  }}
                >
                  {cvFile ? `✓ ${cvFile.name}` : '📁 Choose CV File'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    hidden
                    onChange={handleFileChange}
                  />
                </Button>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions style={{ padding: '16px', gap: '8px' }}>
            <Button
              variant="outlined"
              onClick={() => setDialogOpen(false)}
              style={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px', color: 'var(--text-primary)', borderColor: 'var(--divider)' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={appSubmitting}
              style={{ background: 'var(--hero-gradient)', color: '#fff', textTransform: 'none', fontWeight: 800, borderRadius: '8px' }}
            >
              {appSubmitting ? 'Sending...' : 'Send Application'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default LearningPage;
