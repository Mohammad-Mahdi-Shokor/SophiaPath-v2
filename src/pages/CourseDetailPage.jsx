import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './CourseDetailPage.css';
import {
  Typography,
  Container,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse
} from '@mui/material';
import { coursesData } from '../data/courses';
import { useAuth } from '../context/AuthContext';

import {
  ArrowBack as ArrowBackIcon,
  PlayCircleOutline as PlayIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as TimeIcon,
  MenuBook as BookIcon,
  EmojiEvents as TrophyIcon,
  DeleteOutline as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Shield as ShieldIcon,
  VpnKey as VpnKeyIcon,
  BugReport as BugReportIcon,
  Code as CodeIcon,
  Class as ClassIcon,
  Schema as SchemaIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';

import IntroToCybersecurityIcon from '../assets/IntroToCybersecurity.png';
import CryptographyIcon from '../assets/cryptography.png';
import CommonVulnerabilitiesIcon from '../assets/commonVulnerabilities.png';
import CppIcon from '../assets/cpp.png';
import OopIcon from '../assets/oop.png';
import DataStructuresIcon from '../assets/datast.png';
import IntroToPhilosophyIcon from '../assets/IntroToPhilosophy.png';

const getSectionIcon = (title) => {
  if (!title) return null;
  const t = title.toLowerCase();
  if (t.includes('cybersecurity') || t.includes('security')) return IntroToCybersecurityIcon;
  if (t.includes('cryptography') || t.includes('encryption')) return CryptographyIcon;
  if (t.includes('vulnerabilities') || t.includes('vuln') || t.includes('hack')) return CommonVulnerabilitiesIcon;
  if (t.includes('c++') || t.includes('cpp')) return CppIcon;
  if (t.includes('oop') || t.includes('object')) return OopIcon;
  if (t.includes('data structures') || t.includes('structure')) return DataStructuresIcon;
  if (t.includes('philosophy') || t.includes('logic')) return IntroToPhilosophyIcon;
  return null;
};

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, registerCourse, unregisterCourse } = useAuth();

  const [course, setCourse] = useState(location.state?.course || null);
  const [loading, setLoading] = useState(!course);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [onConfirmCallback, setOnConfirmCallback] = useState(null);

  const [expandedSection, setExpandedSection] = useState(null);

  const handleToggleSection = (sectionId) => {
    setExpandedSection(prev => prev === sectionId ? null : sectionId);
  };

  const showConfirmDialog = (title, message, callback) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setOnConfirmCallback(() => callback);
    setConfirmOpen(true);
  };

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        const res = await fetch('/courses');
        if (res.ok) {
          const list = await res.json();
          const mappedList = list.map(bc => ({
            id: bc.id,
            title: bc.title,
            description: bc.description || '',
            about: bc.about || '',
            imageUrl: bc.imageUrl || '',
            comingsoon: bc.comingsoon || false,
            sections: (bc.sections || []).map(sec => {
              const uniqueLessons = [];
              const seenTitles = new Set();
              (sec.lessons || []).forEach(les => {
                const norm = (les.title || '').trim().toLowerCase();
                if (norm && !seenTitles.has(norm)) {
                  seenTitles.add(norm);
                  uniqueLessons.push({
                    id: les.id,
                    category: les.category || 'learning',
                    chapterName: les.chapterName || '',
                    title: les.title || 'Untitled Lesson',
                    orderIndex: les.orderIndex || 0,
                    pages: les.pages || []
                  });
                }
              });

              return {
                id: sec.id,
                title: sec.title,
                description: sec.description || '',
                lessons: uniqueLessons
              };
            })
          }));

          const matched = mappedList.find(c =>
            String(c.id) === String(courseId) ||
            c.title.toLowerCase().replace(/\s+/g, '-') === String(courseId).toLowerCase()
          );
          if (matched) {
            setCourse(matched);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load course details from database:', err);
      }

      // Fallback to local data
      const fallback = coursesData.find(c =>
        c.title.toLowerCase().replace(/\s+/g, '-') === courseId ||
        String(c.id) === String(courseId)
      );
      setCourse(fallback);
      setLoading(false);
    };

    loadCourseData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="course-not-found" style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="loading-spinner" style={{ width: '50px', height: '50px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary-main)', animation: 'spin 1s linear infinite' }} />
        <Typography variant="h6" style={{ color: 'var(--text-secondary)' }}>Loading Course Curriculum...</Typography>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-not-found">
        <Typography variant="h5" className="course-not-found-title">Course not found</Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          className="course-not-found-button"
        >
          Go Back
        </Button>
      </div>
    );
  }

  const isRegistered = user?.registeredCourses?.some(
    title => title.toLowerCase() === course.title.toLowerCase()
  );

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isRegistered) {
      await registerCourse(course.title);
    }
    navigate(`/learning-path/${course.id}`, { state: { course } });
  };

  const handleUnregister = async () => {
    showConfirmDialog(
      "Unenroll Course?",
      `Are you sure you want to unenroll from ${course.title}? Your progress will be reset.`,
      async () => {
        await unregisterCourse(course.title);
      }
    );
  };

  const handleLessonClick = async (sectionIndex, lessonObj) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isRegistered) {
      await registerCourse(course.title);
    }
    navigate(`/learning-path/${course.id}`, { 
      state: { 
        course,
        initialSectionIndex: sectionIndex,
        targetLessonId: lessonObj.id
      } 
    });
  };

  return (
    <div className="course-detail-container">
      <div className="course-detail-header">
        <Container maxWidth="lg" className="course-detail-header-content" style={{ display: 'flex', flexDirection: 'column' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => {
                navigate('/courses');
              }, 250);
            }}
            sx={{
              alignSelf: 'flex-start',
              mb: 2,
              textTransform: 'none',
              color: 'rgba(255, 255, 255, 0.75)',
              fontWeight: 700,
              fontSize: '0.9rem',
              '&:hover': {
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.15)'}
            }}
          >
            Back to Courses
          </Button>

          <div className="course-detail-copy">
            <Typography variant="overline" className="course-detail-kicker">
              EXPLORE COURSE
            </Typography>
            <Typography variant="h2" className="course-detail-title">
              {course.title}
            </Typography>
            <Typography variant="h6" className="course-detail-subtitle">
              {course.description}
            </Typography>
            <br></br>
             <div className="course-detail-meta">
               <div className="course-detail-meta-item">
                 <BookIcon fontSize="small" />
                 <span>{course.totalLessons || course.sections?.reduce((sum, s) => sum + (s.lessons?.length || 0), 0) || 6} Comprehensive Lessons and Exercises</span>
               </div>
             </div>
          </div>
        </Container>
      </div>

      {/* Main Content: Just Descriptions and Sections */}
      <Container maxWidth="lg" className="course-detail-content">
        <div className="course-detail-grid">
          <div className="course-detail-main-stack">
            {/* Combined About & Curriculum Section */}
            <Paper className="course-card">
              <Typography variant="h4" className="course-card-header">
                About this course
              </Typography>
              <br></br>
              <Typography className="course-about-text">
                {course.about}
              </Typography>

              <br /><br /><br />

              <Typography variant="h4" className="course-card-header">
                Course Curriculum
              </Typography>
              <br></br>
              <div className="course-section-list">
                {course.sections?.map((section, index) => {
                  const isExpanded = expandedSection === section.id;

                  let lessonsCount = 0;
                  let exercisesCount = 0;
                  (section.lessons || []).forEach(l => {
                    if (l.category === 'learning' || !l.category) {
                      lessonsCount++;
                    } else {
                      const pagesLength = Array.isArray(l.pages) ? l.pages.length : 0;
                      exercisesCount += Math.max(pagesLength, 1);
                    }
                  });

                  const isComingSoon = lessonsCount === 0;

                  return (
                    <div
                      key={section.id}
                      className={`course-section-item ${isComingSoon ? 'coming-soon-section' : ''}`}
                      style={{ flexDirection: 'column', alignItems: 'stretch', padding: 0, overflow: 'hidden' }}
                    >
                      {/* Section Header (Clickable) */}
                      <div
                        onClick={() => {
                          if (!isComingSoon) {
                            handleToggleSection(section.id);
                          }
                        }}
                        style={{ display: 'flex', alignItems: 'center', padding: '1.75rem 2rem', cursor: isComingSoon ? 'not-allowed' : 'pointer', width: '100%', boxSizing: 'border-box' }}
                      >
                        <div style={{ width: '4.5rem', height: '4.5rem', marginRight: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: isComingSoon ? 0.5 : 1 }}>
                          {(() => {
                            const iconPath = section.iconUrl || section.icon || getSectionIcon(section.title);
                            if (iconPath) {
                              return <img src={iconPath} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
                            }
                            return <BookIcon style={{ fontSize: '3rem', color: 'var(--primary-main)' }} />;
                          })()}
                        </div>
                        <div className="course-section-content">
                          <Typography className="course-section-title" style={{ opacity: isComingSoon ? 0.7 : 1 }}>
                            {section.title}
                          </Typography>
                           <div className="course-section-meta" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                             {isComingSoon ? (
                               <span className="course-section-meta-label" style={{ color: 'var(--text-disabled)', fontWeight: 800 }}>Coming Soon</span>
                             ) : (
                               <>
                                 <span className="course-section-meta-label">{lessonsCount} Lessons</span>
                                 {exercisesCount > 0 && (
                                   <>
                                     <span style={{ color: 'var(--text-disabled)', fontSize: '0.65rem', opacity: 0.7 }}>•</span>
                                     <span className="course-section-meta-label" style={{ color: '#c084fc' }}>{exercisesCount} Exercises</span>
                                   </>
                                 )}
                               </>
                             )}
                           </div>
                        </div>
                        <div className="course-section-action" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ color: 'var(--text-secondary)' }}>
                            {isComingSoon ? (
                              <TimeIcon style={{ fontSize: '1.35rem', color: 'var(--text-disabled)' }} />
                            ) : isExpanded ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Lessons */}
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <div className="course-lesson-list" style={{ padding: '0 2rem 1.75rem 2rem' }}>
                           {section.lessons?.map((lesson, idx) => (
                             <div 
                               key={lesson.id || idx} 
                               onClick={() => handleLessonClick(index, lesson)}
                               className="course-lesson-row-interactive"
                               style={{ 
                                 display: 'flex', 
                                 alignItems: 'center', 
                                 padding: '1rem', 
                                 borderTop: '1px solid rgba(var(--divider-rgb), 0.2)', 
                                 gap: '1rem',
                                 cursor: 'pointer'
                               }}
                             >
                               <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                                 {(() => {
                                   const isDone = user?.quizScores?.[lesson.id] !== undefined;
                                   if (isDone) {
                                     return <CheckCircleIcon fontSize="small" style={{ color: 'var(--success-main)' }} />;
                                   }
                                   return (index === 0 || isRegistered) ? <PlayIcon fontSize="small" style={{ color: 'var(--primary-main)' }} /> : <LockIcon fontSize="small" />;
                                 })()}
                               </div>
                               <Typography style={{ flexGrow: 1, fontWeight: 600, color: 'var(--text-primary)', opacity: (index === 0 || isRegistered) ? 1 : 0.6 }}>
                                 {lesson.title}
                               </Typography>
                             </div>
                           ))}
                        </div>
                      </Collapse>
                    </div>
                  );
                })}
              </div>
            </Paper>
          </div>

          {/* Action Sidebar */}
          <div>
            <Paper className="course-sidebar">
              <div className="course-sidebar-decoration"></div>

              <Typography variant="h5" className="course-sidebar-title">
                {!user ? "Sign up to learn!" : isRegistered ? "Ready to resume?" : "Ready to begin?"}
              </Typography>
              <div style={{ height: "10px" }}></div>
              <Typography className="course-sidebar-description">
                {!user
                  ? `Create an account or sign in to enroll in courses, track your learning journey, and participate in interactive playgrounds.`
                  : isRegistered
                    ? `Pick up right where you left off and complete your mastery of ${course.title}.`
                    : `Join thousands of students and start your journey in ${course.title} today.`
                }
              </Typography>
              <div style={{ height: "20px" }}></div>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleEnroll}
                className="course-enroll-button"
              >
                {!user ? "Sign In to Register" : isRegistered ? "Continue" : "Register Now"}
              </Button>

              {isRegistered && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <Button
                    size="small"
                    style={{ color: 'var(--danger-main)', textTransform: 'none' }}
                    onClick={handleUnregister}
                  >
                    Unenroll
                  </Button>
                </div>
              )}

              <div className="course-perks">
                {[
                  "Comprehensive curriculum access",
                  "Hands-on interactive learning",
                  "Roadmap progress tracking",
                  "Downloadable cheatsheets"
                ].map((perk) => (
                  <div key={perk} className="course-perk-item">
                    <CheckCircleIcon sx={{ fontSize: 20, color: 'var(--success-main)' }} />
                    <span className="course-perk-text">{perk}</span>
                  </div>
                ))}
              </div>
            </Paper>
          </div>
        </div>
      </Container>

      {/* Themed Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: 2.5, p: 1, maxWidth: 340 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>{confirmTitle}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            {confirmMessage}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => setConfirmOpen(false)}
            fullWidth
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (onConfirmCallback) onConfirmCallback();
              setConfirmOpen(false);
            }}
            fullWidth
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CourseDetailPage;
