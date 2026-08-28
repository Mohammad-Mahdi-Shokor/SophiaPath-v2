import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CppPlaygroundDialog } from '../components/CppPlaygroundDialog';
import { JavaOopUmlPlayground } from '../components/JavaOopUmlPlayground';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  useTheme,
  Tabs,
  Tab,
  Alert,
  Popover,
  Dialog,
  useMediaQuery,
  IconButton
} from '@mui/material';
import {
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  EmojiEvents as TrophyIcon,
  ArrowForward as ArrowForwardIcon,
  Lock as LockIcon,
  PlayArrow as PlayIcon,
  ChevronRight as ChevronRightIcon,
  MenuBook as BookIcon,
  Close as CloseIcon,
  FitnessCenter as ExerciseIcon,
  SportsEsports as AssessmentIcon,
  Check as CheckIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Terminal as TerminalIcon,
  ArrowBack as ArrowBackIcon,
  Shield as ShieldIcon,
  VpnKey as VpnKeyIcon,
  BugReport as BugReportIcon,
  Code as CodeIcon,
  Class as ClassIcon,
  Schema as SchemaIcon,
  Psychology as PsychologyIcon,
  InfoOutlined as InfoOutlinedIcon,
  DesktopWindows as LaptopIcon
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

import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { coursesData } from '../data/courses';
import { motion, AnimatePresence } from 'framer-motion';
import './LearningPathPage.css';

const getNodeIcon = (node) => {
  if (node.status === 'upcoming') {
    return <LockIcon sx={{ fontSize: 22 }} />;
  }

  const titleLower = (node.title || '').toLowerCase();
  if (titleLower.startsWith('chapter test')) {
    return <TrophyIcon sx={{ fontSize: 26 }} />;
  }

  const cat = node.category?.toLowerCase() || 'learning';
  if (cat === 'exercise' || cat === 'quiz' || cat === 'mcq') {
    return <ExerciseIcon sx={{ fontSize: 26 }} />;
  }
  if (cat === 'assessment' || cat === 'test' || cat === 'exam') {
    return <AssessmentIcon sx={{ fontSize: 26 }} />;
  }
  return <BookIcon sx={{ fontSize: 26 }} />;
};

const LearningPathPage = () => {
  const { courseId } = useParams();
  const theme = useTheme();
  const isMobileViewport = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateQuizScore } = useAuth();

  const [isCompilerOpen, setIsCompilerOpen] = useState(false);
  const [isJavaUmlPlaygroundOpen, setIsJavaUmlPlaygroundOpen] = useState(false);

  const [course, setCourse] = useState(location.state?.course || null);
  const [courseLoading, setCourseLoading] = useState(!course);
  const [backendLessons, setBackendLessons] = useState({});
  const [backendCheatsheets, setBackendCheatsheets] = useState({});
  const [loadingLessons, setLoadingLessons] = useState(false);

  // Roadmap Preview Popover & Dialog State
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [resultModalData, setResultModalData] = useState(null);

  // FAB scrolling states
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);
  const scrolledLocationStateRef = useRef(null);

  // Dynamic database course loading
  useEffect(() => {
    const loadCourse = async () => {
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
            sections: (bc.sections || []).map(sec => ({
              id: sec.id,
              title: sec.title,
              description: sec.description || '',
              cheatsheet: sec.cheatsheet || null,
              lessons: (sec.lessons || []).map(les => ({
                id: les.id,
                category: les.category || 'learning',
                chapterName: les.chapterName || '',
                title: les.title || 'Untitled Lesson',
                orderIndex: les.orderIndex || 0
              }))
            }))
          }));


          const matched = mappedList.find(c =>
            String(c.id) === String(courseId) ||
            c.title.toLowerCase().replace(/\s+/g, '-') === String(courseId).toLowerCase()
          );
          if (matched) {
            setCourse(matched);
            setCourseLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load course path from database:', err);
      }

      const fallback = coursesData.find(c =>
        String(c.id) === String(courseId) ||
        c.title.toLowerCase().replace(/\s+/g, '-') === String(courseId).toLowerCase()
      );
      setCourse(fallback);
      setCourseLoading(false);
    };

    loadCourse();
  }, [courseId]);

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [hasInitialSectionBeenSet, setHasInitialSectionBeenSet] = useState(false);



  const domainKey = course ? course.id : 'unknown';

  const scores = useMemo(() => {
    return user?.quizScores || {};
  }, [user]);

  const sections = useMemo(() => {
    if (!course || !course.sections) return [];

    return course.sections.map((section, sIndex) => {
      let currentLessons = backendLessons[section.id] || section.lessons || [];
      currentLessons = currentLessons.filter(l => {
        const title = (l.title || '').trim().toLowerCase();
        return !(title.startsWith('cheatsheet:') || title.startsWith('cheatsheet ') || title === 'cheatsheet');
      });

      // Title-based deduplication for section lessons progress calculation
      const uniqueLessons = [];
      const seenTitles = new Set();
      currentLessons.forEach(l => {
        const norm = (l.title || '').trim().toLowerCase();
        if (norm && !seenTitles.has(norm)) {
          seenTitles.add(norm);
          uniqueLessons.push(l);
        }
      });

      const completedLessons = uniqueLessons.filter(l => {
        const duplicates = currentLessons.filter(dl => (dl.title || '').trim().toLowerCase() === (l.title || '').trim().toLowerCase());
        return duplicates.some(dl => (scores[dl.id] || 0) >= 70);
      });

      const isComplete = uniqueLessons.length > 0 && completedLessons.length === uniqueLessons.length;

      let isUnlocked = true;

      return {
        ...section,
        isComplete,
        isUnlocked,
        progress: uniqueLessons.length > 0 ? (completedLessons.length / uniqueLessons.length) * 100 : 0
      };
    });
  }, [course, scores, backendLessons]);

  // Automatically select and open the first incomplete section when accessing the page or returning
  useEffect(() => {
    if (sections.length > 0 && !hasInitialSectionBeenSet) {
      if (location.state?.initialSectionIndex !== undefined) {
        const targetIdx = Number(location.state.initialSectionIndex);
        if (targetIdx >= 0 && targetIdx < sections.length) {
          setActiveSectionIndex(targetIdx);
          setHasInitialSectionBeenSet(true);
          return;
        }
      }

      const finishedLessonId = location.state?.quizResult?.lessonId || location.state?.lessonFinished?.lessonId;
      if (finishedLessonId) {
        const sectionIdx = sections.findIndex(s =>
          s.lessons?.some(l => l.id === finishedLessonId)
        );
        if (sectionIdx !== -1) {
          setActiveSectionIndex(sectionIdx);
          setHasInitialSectionBeenSet(true);
          return;
        }
      }

      const firstIncompleteIdx = sections.findIndex(s => !s.isComplete);
      if (firstIncompleteIdx !== -1) {
        setActiveSectionIndex(firstIncompleteIdx);
      } else {
        setActiveSectionIndex(0);
      }
      setHasInitialSectionBeenSet(true);
    }
  }, [sections, location.state, hasInitialSectionBeenSet]);

  const activeSection = sections[activeSectionIndex];

  // Load lessons for the active section dynamically from backend section lessons endpoint
  useEffect(() => {
    if (!course || !activeSection) return;

    const courseDbId = course.id;
    const sectionId = activeSection.id;

    const loadBackendLessons = async () => {
      setLoadingLessons(true);
      try {
        let dbId = courseDbId;
        if (isNaN(Number(dbId))) {
          const res = await fetch('/courses');
          if (res.ok) {
            const list = await res.json();
            const matched = list.find(c => c.title.toLowerCase() === course.title.toLowerCase());
            if (matched) dbId = matched.id;
          }
        }

        const secRes = await fetch(`/courses/${dbId}/sections/${sectionId}`);
        if (secRes.ok) {
          const sectionData = await secRes.json();
          if (sectionData) {
            setBackendLessons(prev => ({
              ...prev,
              [sectionId]: sectionData.lessons || []
            }));
            setBackendCheatsheets(prev => ({
              ...prev,
              [sectionId]: sectionData.cheatsheet || null
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load lessons from backend section:', err);
      } finally {
        setLoadingLessons(false);
      }
    };

    loadBackendLessons();
  }, [course, activeSectionIndex]);

  const cheatsheetLesson = useMemo(() => {
    if (activeSection && backendCheatsheets[activeSection.id] !== undefined) {
      return backendCheatsheets[activeSection.id];
    }
    return activeSection?.cheatsheet || null;
  }, [activeSection, backendCheatsheets]);

  const isComputerScience = useMemo(() => {
    return course?.title?.toLowerCase()?.includes('computer science') || String(course?.id) === '2';
  }, [course]);

  const showCppPlayground = useMemo(() => {
    if (!isComputerScience || !activeSection) return false;
    const title = (activeSection.title || '').toLowerCase();
    const isJavaOop = title.includes('java') || title.includes('oop') || title.includes('object') || title.includes('uml') || title.includes('design') || title.includes('pattern') || title.includes('class') || title.includes('inheritance') || title.includes('polymorphism') || title.includes('exception');
    return !isJavaOop;
  }, [isComputerScience, activeSection]);

  const showJavaPlayground = useMemo(() => {
    if (!isComputerScience || !activeSection) return false;
    const title = (activeSection.title || '').toLowerCase();
    return title.includes('java') || title.includes('oop') || title.includes('object') || title.includes('uml') || title.includes('design') || title.includes('pattern') || title.includes('class') || title.includes('inheritance') || title.includes('polymorphism') || title.includes('exception');
  }, [isComputerScience, activeSection]);

  const lessons = useMemo(() => {
    let rawLessons = [];
    if (activeSection && backendLessons[activeSection.id] && backendLessons[activeSection.id].length > 0) {
      rawLessons = backendLessons[activeSection.id];
    } else {
      rawLessons = activeSection?.lessons || [];
    }

    // Filter out cheatsheet lessons
    rawLessons = rawLessons.filter(l => {
      const title = (l.title || '').trim().toLowerCase();
      return !(title.startsWith('cheatsheet:') || title.startsWith('cheatsheet ') || title === 'cheatsheet');
    });

    // Title-based deduplication for nodes path list
    const uniqueLessons = [];
    const seenTitles = new Set();
    rawLessons.forEach(les => {
      const norm = (les.title || '').trim().toLowerCase();
      if (norm && !seenTitles.has(norm)) {
        seenTitles.add(norm);
        uniqueLessons.push(les);
      }
    });

    return uniqueLessons;
  }, [activeSection, backendLessons]);

  const syncedLocationStateRef = useRef(null);

  // Sync results from QuizPage or LessonContentPage if any and open score dialog for exercises
  useEffect(() => {
    const finishedKey = location.state?.quizResult 
      ? `quiz-${location.state.quizResult.lessonId}-${location.state.quizResult.percentage}`
      : location.state?.lessonFinished
      ? `lesson-${location.state.lessonFinished.lessonId}-${location.state.lessonFinished.score}`
      : null;

    if (finishedKey && syncedLocationStateRef.current !== finishedKey) {
      syncedLocationStateRef.current = finishedKey;
      let scoreVal = 0;
      let targetLessonId = null;

      if (location.state?.quizResult) {
        const { lessonId, percentage, score } = location.state.quizResult;
        scoreVal = percentage !== undefined ? Number(percentage) : (score !== undefined ? Number(score) : 0);
        targetLessonId = lessonId;
        updateQuizScore(lessonId, scoreVal);
      } else if (location.state?.lessonFinished) {
        const { lessonId, score } = location.state.lessonFinished;
        scoreVal = score !== undefined ? Number(score) : (scores[lessonId] !== undefined ? Number(scores[lessonId]) : 0);
        targetLessonId = lessonId;
        updateQuizScore(lessonId, scoreVal);
      }

      if (targetLessonId && lessons.length > 0) {
        const targetLesson = lessons.find(l => String(l.id) === String(targetLessonId));
        const tTitleLower = (targetLesson?.title || '').toLowerCase();
        const isExerciseOrQuiz = Boolean(location.state?.quizResult) || 
          targetLesson?.category === 'exercise' || 
          targetLesson?.category === 'quiz' || 
          targetLesson?.category === 'mcq' || 
          tTitleLower.includes('quiz') || 
          tTitleLower.includes('exercise') || 
          tTitleLower.includes('test') || 
          tTitleLower.includes('practice');

        if (isExerciseOrQuiz) {
          setResultModalData({
            lessonId: targetLessonId,
            title: targetLesson?.title || 'Exercise Result',
            score: scoreVal,
            category: targetLesson?.category || 'exercise'
          });
        }
      }
    }
  }, [location.state, updateQuizScore, lessons]);

  const uniqueChapterNames = useMemo(() => {
    const list = [];
    lessons.forEach(l => {
      const raw = l.chapterName || 'General';
      const name = raw.trim().length > 0 ? raw.trim() : 'General';
      if (!list.includes(name)) {
        list.push(name);
      }
    });
    return list;
  }, [lessons]);

  const { numLessons, numExercises } = useMemo(() => {
    let lessonsCount = 0;
    let exercisesCount = 0;

    lessons.forEach(l => {
      if (l.category === 'learning' || !l.category) {
        lessonsCount++;
      } else {
        const pagesLength = Array.isArray(l.pages) ? l.pages.length : 0;
        exercisesCount += Math.max(pagesLength, 1);
      }
    });

    return { numLessons: lessonsCount, numExercises: exercisesCount };
  }, [lessons]);

  const nodes = useMemo(() => {
    const rawList = (activeSection && backendLessons[activeSection.id]) || activeSection?.lessons || [];
    let currentY = 0;

    return lessons.map((lesson, index) => {
      // Find all database duplicates of this unique lesson title
      const duplicates = rawList.filter(dl => (dl.title || '').trim().toLowerCase() === (lesson.title || '').trim().toLowerCase());
      const allMatching = [lesson, ...duplicates];

      // Consolidate highest score among matching instances
      let score = 0;
      allMatching.forEach(dl => {
        if (scores[dl.id] !== undefined && scores[dl.id] !== null) {
          const numS = Number(scores[dl.id]);
          if (numS > score) score = numS;
        }
      });

      // Auto-detect category for exercises & quizzes if not explicitly set
      const titleLower = (lesson.title || '').toLowerCase();
      const hasQuestions = (lesson.questions && lesson.questions.length > 0) || (lesson.questionCount && lesson.questionCount > 0);
      const isQuizTitle = titleLower.includes('quiz') || titleLower.includes('exercise') || titleLower.includes('test') || titleLower.includes('mcq') || titleLower.includes('assessment') || titleLower.includes('practice');

      let category = lesson.category || 'learning';
      if (category === 'learning' && (hasQuestions || isQuizTitle)) {
        category = 'exercise';
      }

      // Passing condition: for exercises/quizzes, passing threshold is >= 70% matching mobile app. For reading lessons, score > 0 is passed.
      const isQuizOrExercise = category !== 'learning' || isQuizTitle || hasQuestions;
      const isPassed = isQuizOrExercise ? score >= 70 : score > 0;

      let isPreviousPassed = index === 0;
      if (index > 0) {
        const prevLesson = lessons[index - 1];
        const prevDuplicates = rawList.filter(dl => (dl.title || '').trim().toLowerCase() === (prevLesson.title || '').trim().toLowerCase());
        const prevMatching = [prevLesson, ...prevDuplicates];
        isPreviousPassed = prevMatching.some(dl => {
          const s = scores[dl.id] || 0;
          const pTitleLower = (dl.title || '').toLowerCase();
          const pIsQuiz = pTitleLower.includes('quiz') || pTitleLower.includes('exercise') || pTitleLower.includes('test') || pTitleLower.includes('mcq');
          return pIsQuiz ? s >= 70 : s > 0;
        });
      }

      let status = 'upcoming';
      if (isPassed) status = 'completed';
      else if (isPreviousPassed) status = 'active';

      // Group and calculate dynamic height gap for new chapters
      const rawChapter = lesson.chapterName || 'General';
      const chapterName = rawChapter.trim().length > 0 ? rawChapter.trim() : 'General';

      let isNewChapter = false;
      if (index === 0) {
        isNewChapter = true;
      } else {
        const prevRawChapter = lessons[index - 1].chapterName || 'General';
        const prevChapterName = prevRawChapter.trim().length > 0 ? prevRawChapter.trim() : 'General';
        if (chapterName !== prevChapterName) {
          isNewChapter = true;
        }
      }

      currentY += index === 0 ? 220 : (isNewChapter ? 250 : 150);

      const x = index % 2 === 0 ? 45 : 255; // Larger horizontal zigzag within 300px visual container
      const y = currentY;

      return {
        ...lesson,
        chapterName,
        isNewChapter,
        category,
        status,
        score,
        pos: { x, y },
        icon: category === 'learning' ? <BookIcon /> : <SchoolIcon />
      };
    });
  }, [lessons, scores, activeSection, backendLessons]);

  const isSectionComplete = useMemo(() => {
    return nodes.length > 0 && nodes.every(n => n.status === 'completed');
  }, [nodes]);

  // 1. Automatically scroll to the current/active node shell on load, after finishing a lesson/exercise, or on section switch
  useEffect(() => {
    if (nodes.length > 0 && !courseLoading && !loadingLessons && !isSectionComplete) {
      const finishedKey = location.state?.quizResult?.lessonId || location.state?.lessonFinished?.lessonId;
      const isFinishedReturn = Boolean(finishedKey) && scrolledLocationStateRef.current !== finishedKey;

      if (!hasInitialScrolled || isFinishedReturn) {
        if (finishedKey) {
          scrolledLocationStateRef.current = finishedKey;
        }
        const timer = setTimeout(() => {
          const activeNodeEl = document.getElementById('current-active-node-shell');
          if (activeNodeEl) {
            activeNodeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          if (!hasInitialScrolled) {
            setHasInitialScrolled(true);
          }
        }, 350);
        return () => clearTimeout(timer);
      }
    }
  }, [nodes, courseLoading, loadingLessons, hasInitialScrolled, location.state, isSectionComplete]);

  useEffect(() => {
    if (nodes.length > 0 && !courseLoading && !loadingLessons && !isSectionComplete) {
      const timer = setTimeout(() => {
        const activeNodeEl = document.getElementById('current-active-node-shell');
        if (activeNodeEl) {
          activeNodeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [activeSectionIndex, isSectionComplete]);

  const generatePath = useCallback(() => {
    return "";
  }, []);

  // 2. Track viewport scrolling to toggle the fixed "Go to Current" FAB arrow
  useEffect(() => {
    const handleScroll = () => {
      const activeNodeEl = document.getElementById('current-active-node-shell');
      if (!activeNodeEl) {
        setShowScrollArrow(false);
        return;
      }

      const rect = activeNodeEl.getBoundingClientRect();
      // Element is visible if it is fully or partially within the vertical viewport bounds
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

      setShowScrollArrow(!isVisible);

      if (rect.top < 0) {
        setScrollDirection('up');
      } else if (rect.top > window.innerHeight) {
        setScrollDirection('down');
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    const initialTimer = setTimeout(handleScroll, 400);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(initialTimer);
    };
  }, [nodes, courseLoading, loadingLessons]);

  const handleScrollToActive = () => {
    const activeNodeEl = document.getElementById('current-active-node-shell');
    if (activeNodeEl) {
      activeNodeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const pathHeight = useMemo(() => {
    if (nodes.length === 0) return 300;
    return nodes[nodes.length - 1].pos.y + 110;
  }, [nodes]);

  const generatePathSegments = useMemo(() => {
    if (nodes.length < 2) return [];
    const segments = [];
    for (let i = 1; i < nodes.length; i++) {
      if (nodes[i].isNewChapter) continue;
      const prev = nodes[i - 1];
      const curr = nodes[i];
      const prevPos = prev.pos;
      const currPos = curr.pos;
      const cp1y = prevPos.y + (currPos.y - prevPos.y) * 0.5;
      const cp2y = prevPos.y + (currPos.y - prevPos.y) * 0.5;
      const d = `M ${prevPos.x} ${prevPos.y} C ${prevPos.x} ${cp1y}, ${currPos.x} ${cp2y}, ${currPos.x} ${currPos.y}`;

      let stroke = 'var(--divider)';
      let strokeDasharray = '10 10';
      let strokeWidth = 10;

      if (prev.status === 'completed' && curr.status === 'completed') {
        stroke = '#58cc02'; // Green for completed path segments
        strokeDasharray = '15 15';
        strokeWidth = 12;
      } else if (
        (prev.status === 'completed' && curr.status === 'active') ||
        (prev.status === 'active' && curr.status === 'completed')
      ) {
        stroke = 'var(--primary-main)'; // Theme-based primary color for active path leading to current lesson
        strokeDasharray = '15 15';
        strokeWidth = 12;
      } else {
        stroke = 'var(--divider)'; // Locked grey dashed line for upcoming lessons like before
        strokeDasharray = '15 15';
        strokeWidth = 12;
      }

      segments.push({
        id: `${prev.id || i - 1}-${curr.id || i}`,
        d,
        stroke,
        strokeDasharray,
        strokeWidth
      });
    }
    return segments;
  }, [nodes]);

  // Click handler: opens preview box instead of immediate navigation
  const handleNodeClick = (event, node) => {
    if (node.status === 'upcoming') return;
    setSelectedNode(node);

    // Check viewport width for adaptive UX
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setOpenDialog(true);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClosePreview = () => {
    setAnchorEl(null);
    setSelectedNode(null);
    setOpenDialog(false);
  };

  const handleStartLesson = () => {
    if (!selectedNode) return;
    navigate(`/learning/${domainKey}/${activeSection.id}/${selectedNode.id}`, { state: { course } });
    handleClosePreview();
  };

  const renderPreviewContent = () => {
    if (!selectedNode) return null;
    const isCompleted = selectedNode.status === 'completed';
    const accentColor = isCompleted ? '#58CC02' : 'var(--primary-main)';
    const buttonLabel = isCompleted ? 'RETAKE THE LESSON' : 'START THE LESSON';
    const categoryLabel = isCompleted ? 'COMPLETED LESSON' : (selectedNode.category === 'exercise' ? 'PRACTICE QUIZ' : 'ROADMAP LESSON');

    // Premium dynamic description based on category/title
    const description = selectedNode.category === 'exercise'
      ? `Test your knowledge with a quiz on "${selectedNode.title}". Answer the questions to prove your mastery and earn points!`
      : `Dive into "${selectedNode.title}" and learn key concepts in a step-by-step interactive slide viewer. Perfect for solidifying your fundamentals.`;

    return (
      <Box style={{ position: 'relative' }}>
        {isMobileViewport && (
          <IconButton
            style={{ position: 'absolute', right: '-12px', top: '-12px', color: 'var(--text-secondary)' }}
            onClick={handleClosePreview}
          >
            <CloseIcon />
          </IconButton>
        )}
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          <Box style={{ flex: 1 }}>
            <Typography
              variant="caption"
              style={{
                color: accentColor,
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '4px'
              }}
            >
              {categoryLabel}
            </Typography>
            <Typography
              variant="h5"
              style={{
                fontWeight: 900,
                fontSize: '1.25rem',
                lineHeight: 1.3,
                color: 'var(--text-primary)',
                fontFamily: '"Outfit", sans-serif'
              }}
            >
              {selectedNode.title}
            </Typography>
          </Box>
          <Box
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: isCompleted ? '#58CC02' : '#1CB0F6',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0
            }}
          >
            {selectedNode.category === 'exercise' || selectedNode.category === 'quiz' || selectedNode.category === 'mcq' ? (
              <ExerciseIcon style={{ color: '#fff', fontSize: '26px' }} />
            ) : selectedNode.category === 'assessment' || selectedNode.category === 'test' ? (
              <AssessmentIcon style={{ color: '#fff', fontSize: '26px' }} />
            ) : (
              <BookIcon style={{ color: '#fff', fontSize: '26px' }} />
            )}
          </Box>
        </Box>

        <Typography
          variant="body2"
          style={{
            marginTop: '16px',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            fontSize: '0.9rem'
          }}
        >
          {description}
        </Typography>

        {selectedNode.score > 0 && selectedNode.category !== 'learning' && (() => {
          const scoreColor = selectedNode.score >= 70 ? '#58cc02' : selectedNode.score >= 50 ? 'var(--primary-main)' : 'var(--error-main, #ef4444)';
          return (
            <Box
              style={{
                marginTop: '14px',
                padding: '8px 12px',
                backgroundColor: 'var(--surface-glass)',
                border: `1px solid ${scoreColor}`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircleIcon style={{ color: scoreColor, fontSize: '18px' }} />
              <Typography variant="body2" style={{ color: scoreColor, fontWeight: 700, fontSize: '0.85rem' }}>
                High Score: {selectedNode.score}%
              </Typography>
            </Box>
          );
        })()}

        {/* Mobile non-blocking desktop recommendation banner for exercises */}
        {isMobileViewport && selectedNode.category !== 'learning' && (
          <Box
            style={{
              marginTop: '14px',
              padding: '10px 14px',
              backgroundColor: 'rgba(255, 179, 0, 0.12)',
              border: '1px solid rgba(255, 179, 0, 0.3)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textAlign: 'left'
            }}
          >
            <LaptopIcon style={{ color: '#ffb300', fontSize: '22px', flexShrink: 0 }} />
            <Typography variant="caption" style={{ color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.4, fontSize: '0.8rem' }}>
              <strong style={{ color: '#ffb300' }}>Desktop Recommended:</strong> This exercise involves code or lab tools and is best experienced on a computer screen.
            </Typography>
          </Box>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={handleStartLesson}
          style={{
            marginTop: '20px',
            padding: '12px',
            borderRadius: '14px',
            fontWeight: 800,
            fontSize: '0.9rem',
            backgroundColor: accentColor,
            color: '#fff',
            transition: 'transform 0.2s ease',
            fontFamily: '"Outfit", sans-serif',
            textTransform: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {buttonLabel}
        </Button>
      </Box>
    );
  };

  const nextActiveNode = useMemo(() => {
    if (location.state?.targetLessonId) {
      const matchedNode = nodes.find(n => Number(n.id) === Number(location.state.targetLessonId));
      if (matchedNode) return matchedNode;
    }
    return nodes.find(n => n.status === 'active') || nodes[nodes.length - 1];
  }, [nodes, location.state]);

  if (courseLoading) {
    return (
      <div className="course-not-found" style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)', width: '100%', boxSizing: 'border-box' }}>
        <div className="loading-spinner" style={{ width: '50px', height: '50px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary-main)', animation: 'spin 1s linear infinite' }} />
        <Typography variant="h6" style={{ color: 'var(--text-secondary)', fontFamily: '"Outfit", sans-serif', fontWeight: 600 }}>Loading Learning Path...</Typography>
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
      <Box className="path-page-empty">
        <Typography variant="h5">No course selected</Typography>
        <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
      </Box>
    );
  }

  const getNodeStyle = (node) => {
    if (node.status !== 'completed') return {};

    // For learning categories (lessons), use default Duolingo success green
    if (node.category === 'learning' || !node.score) {
      return {
        '--node-bg': '#58cc02',
        '--node-border': '#58cc02',
        '--node-shadow': '#46a302',
      };
    }

    if (node.score >= 80) {
      return {
        '--node-bg': '#58cc02',
        '--node-border': '#58cc02',
        '--node-shadow': '#46a302',
      };
    } else if (node.score >= 50) {
      return {
        '--node-bg': '#ff9900',
        '--node-border': '#ff9900',
        '--node-shadow': '#cc7a00',
      };
    } else {
      return {
        '--node-bg': '#ff4d4d',
        '--node-border': '#ff4d4d',
        '--node-shadow': '#cc3d3d',
      };
    }
  };



  return (
    <Box className="path-page">
      <Container maxWidth="xl" sx={{ maxWidth: '1300px !important' }}>

        <Box sx={{ maxWidth: '980px', margin: '0 auto', width: '100%' }}>
          <Box className="path-header-sticky">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setTimeout(() => {
                    navigate(`/course/${course?.id || courseId}`);
                  }, 250);
                }}
                sx={{ color: 'var(--text-primary)', mr: 1 }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h5" style={{ fontWeight: 900, fontFamily: '"Outfit", sans-serif', color: 'var(--text-primary)' }}>
                Course Roadmap
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
              {showCppPlayground && (
                <Button
                  variant="contained"
                  startIcon={<TerminalIcon />}
                  onClick={() => setIsCompilerOpen(true)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    textTransform: 'none',
                    background: 'var(--hero-gradient)',
                    color: '#fff',
                    fontFamily: '"Outfit", sans-serif'
                  }}
                >
                  C++ Compiler Playground
                </Button>
              )}
              {showJavaPlayground && (
                <Button
                  variant="contained"
                  startIcon={<SchoolIcon />}
                  onClick={() => setIsJavaUmlPlaygroundOpen(true)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    textTransform: 'none',
                    background: 'var(--primary-main)',
                    color: '#fff',
                    fontFamily: '"Outfit", sans-serif'
                  }}
                >
                  Java OOP UML Playground
                </Button>
              )}
              {cheatsheetLesson && (
                <Button
                  variant="outlined"
                  startIcon={<BookIcon />}
                  onClick={() => {
                    navigate(`/learning/${domainKey}/${activeSection.id}/${cheatsheetLesson.id}`, { state: { course } });
                  }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    textTransform: 'none',
                    borderColor: 'var(--primary-main)',
                    color: 'var(--primary-main)',
                    fontFamily: '"Outfit", sans-serif'
                  }}
                >
                  View Cheatsheet
                </Button>
              )}
              {(courseId?.toLowerCase()?.includes('philosophy') || course?.title?.toLowerCase()?.includes('philosophy')) && (
                <Button
                  variant="contained"
                  startIcon={<SchoolIcon />}
                  onClick={() => navigate('/philosophy-lab', { state: { course } })}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    textTransform: 'none',
                    background: '#FF6B6B',
                    color: '#fff',
                    fontFamily: '"Outfit", sans-serif'
                  }}
                >
                  Interactive Philosophy Lab
                </Button>
              )}
              {(courseId?.toLowerCase()?.includes('cyber') || course?.title?.toLowerCase()?.includes('cyber')) && (
                <Button
                  variant="contained"
                  startIcon={<TerminalIcon />}
                  onClick={() => navigate('/cyber-lab', { state: { course } })}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    textTransform: 'none',
                    background: '#10b981',
                    color: '#fff',
                    fontFamily: '"Outfit", sans-serif'
                  }}
                >
                  Interactive Cyber Lab
                </Button>
              )}
            </Box>
          </Box>

          <Tabs
            value={activeSectionIndex}
            onChange={(e, val) => setActiveSectionIndex(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '.MuiTabs-flexContainer': {
                gap: '0.5rem'
              }
            }}
          >
            {sections.map((section) => (
              <Tab
                key={section.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {(() => {
                      const iconPath = section.iconUrl || section.icon || getSectionIcon(section.title);
                      if (iconPath) {
                        return <img src={iconPath} alt="" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />;
                      }
                      return <BookIcon sx={{ fontSize: 18 }} />;
                    })()}
                    {section.title}
                    {!section.isUnlocked && <LockIcon sx={{ fontSize: 16 }} />}
                  </Box>
                }
                disabled={!section.isUnlocked}
              />
            ))}
          </Tabs>
        </Box>

          {!activeSection?.isUnlocked && (
            <Alert severity="warning" sx={{ mb: 4, borderRadius: 3 }}>
              Complete the previous section to unlock this path.
            </Alert>
          )}

          {/* Sibling Container: The path-visual-shell (path block) */}
          <Box
            className="path-visual-shell glass-panel-strong"
            sx={{
              width: '100%',
              padding: nodes.length === 0 ? '64px 24px' : { xs: '16px 16px 32px 16px', md: '20px 48px 48px 48px' },
              display: 'flex',
              justifyContent: 'center',
              boxSizing: 'border-box',
              position: 'relative'
            }}
          >
            {nodes.length > 0 && (
              <IconButton
                onClick={() => setIsInfoDialogOpen(true)}
                sx={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  color: 'var(--text-secondary)',
                  background: 'var(--surface-glass)',
                  border: '1px solid var(--divider)',
                  borderRadius: '12px',
                  padding: '10px',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-primary)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease',
                  zIndex: 100
                }}
              >
                <InfoOutlinedIcon sx={{ fontSize: 22 }} />
              </IconButton>
            )}
            {nodes.length === 0 ? (
              <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', textAlign: 'center' }}>
                <Typography variant="h5" style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: '"Outfit", sans-serif' }}>
                  Coming Soon
                </Typography>
                <Typography variant="body2" style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
                  We are currently crafting high-quality interactive lessons for this chapter. Stay tuned!
                </Typography>
              </Box>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSectionIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="path-visual"
                  style={{ height: `${pathHeight}px`, width: '300px' }}
                >
                  <svg
                    width="300"
                    height={pathHeight}
                    className="path-svg"
                    viewBox={`0 0 300 ${pathHeight}`}
                  >
                    {generatePathSegments.map(seg => (
                      <path
                        key={seg.id}
                        d={seg.d}
                        fill="none"
                        stroke={seg.stroke}
                        strokeWidth={seg.strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={seg.strokeDasharray !== 'none' ? seg.strokeDasharray : undefined}
                      />
                    ))}
                  </svg>

                  {nodes.map((node, index) => (
                    <React.Fragment key={node.id}>
                      {node.isNewChapter && (() => {
                        const chapterIndex = uniqueChapterNames.indexOf(node.chapterName) + 1;
                        const chapterNodes = nodes.filter(n => n.chapterName === node.chapterName);
                        const allCompleted = chapterNodes.every(n => n.status === 'completed');
                        const hasActive = chapterNodes.some(n => n.status === 'active');
                        const hasCompleted = chapterNodes.some(n => n.status === 'completed');

                        let chapterStatus = 'upcoming';
                        if (allCompleted) {
                          chapterStatus = 'completed';
                        } else if (hasActive || hasCompleted) {
                          chapterStatus = 'active';
                        }

                        let containerStyle = {
                          fontWeight: 900,
                          color: 'var(--text-primary)',
                          background: 'var(--surface-glass)',
                          padding: '16px 32px',
                          borderRadius: '30px',
                          border: '1px solid var(--divider)',
                          backdropFilter: 'blur(12px)',
                          fontFamily: '"Outfit", sans-serif',
                          textAlign: 'center',
                          textTransform: 'uppercase',
                          letterSpacing: '1.5px',
                          fontSize: '0.95rem',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          width: '330px',
                          boxSizing: 'border-box',
                          transition: 'all 0.3s ease-in-out'
                        };

                        let labelColor = 'var(--text-secondary)';

                        if (chapterStatus === 'completed') {
                          labelColor = '#10b981';
                          containerStyle.border = '1px solid rgba(16, 185, 129, 0.4)';
                        } else if (chapterStatus === 'active') {
                          labelColor = 'var(--primary-main)';
                          containerStyle.border = '1px solid var(--primary-main)';
                        }

                        return (
                          <Box
                            style={{
                              position: 'absolute',
                              left: '50%',
                              top: index === 0 ? '30px' : `${(nodes[index - 1].pos.y + node.pos.y) / 2}px`,
                              transform: 'translate(-50%, -50%)',
                              zIndex: 5,
                              width: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              pointerEvents: 'none',
                              gap: '24px'
                            }}
                          >

                            <Typography
                              variant="h5"
                              style={containerStyle}
                            >
                              <span style={{
                                fontSize: '0.625rem',
                                fontWeight: 800,
                                letterSpacing: '2px',
                                color: labelColor,
                                textTransform: 'uppercase',
                                marginBottom: '4px'
                              }}>
                                Chapter {chapterIndex}
                              </span>
                              {node.chapterName}
                            </Typography>
                          </Box>
                        );
                      })()}


                      <Box
                        id={node.id === nextActiveNode?.id ? "current-active-node-shell" : undefined}
                        className="path-node-shell"
                        style={{
                          left: `${node.pos.x}px`,
                          top: `${node.pos.y}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        onClick={(e) => handleNodeClick(e, node)}
                      >
                        <Box className="path-node-wrapper">
                          {node.status === 'active' && (
                            <Box className="path-node-pulse" />
                          )}

                          <Box
                            className={`path-node path-node-${node.status}`}
                            style={getNodeStyle(node)}
                          >
                            {getNodeIcon(node)}
                          </Box>

                          {/* Top-right completed check badge matching mobile app */}
                          {node.status === 'completed' && (
                            <Box
                              style={{
                                position: 'absolute',
                                top: '-4px',
                                right: '-4px',
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                backgroundColor: '#fff',
                                border: '2.5px solid #29c57b',
                                display: 'grid',
                                placeItems: 'center',
                                zIndex: 10
                              }}
                            >
                              <CheckIcon style={{ color: '#29c57b', fontSize: '12px', fontWeight: 'bold' }} />
                            </Box>
                          )}

                          {/* Bottom percentage badge matching mobile app */}
                          {node.score > 0 && node.category !== 'learning' && (
                            <Box
                              style={{
                                position: 'absolute',
                                bottom: '-8px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                backgroundColor: node.score >= 70 ? '#58cc02' : node.score >= 50 ? 'var(--primary-main)' : 'var(--error-main, #ef4444)',
                                border: '1.5px solid #fff',
                                zIndex: 10
                              }}
                            >
                              <Typography
                                style={{
                                  color: '#fff',
                                  fontWeight: 900,
                                  fontSize: '0.68rem',
                                  lineHeight: 1,
                                  fontFamily: '"Nunito", sans-serif'
                                }}
                              >
                                {node.score}%
                              </Typography>
                            </Box>
                          )}

                          <Typography className={`path-node-caption-title status-${node.status}`}>
                            {node.title}
                          </Typography>
                        </Box>
                      </Box>
                    </React.Fragment>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </Box>

        {nodes.length > 0 && (
          <Box className="path-footer glass-panel">
            <Box className="path-footer-content">
              <Typography variant="h4" className="path-footer-title">
                {activeSection?.isComplete ? "Section Completed!" : "Ready for the next challenge?"}
              </Typography>
              <div className="path-footer-copy">
                {activeSection?.isComplete
                  ? `You've mastered all lessons in ${activeSection.title}.`
                  : `Progress in this section: ${Math.round(activeSection?.progress || 0)}%`}
              </div>
              {!activeSection?.isComplete && (
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  className="path-footer-button"
                  onClick={(e) => handleNodeClick(e, nextActiveNode)}
                >
                  {nextActiveNode?.status === 'active' ? `Start ${nextActiveNode.title}` : "Continue Learning"}
                </Button>
              )}
              {activeSection?.isComplete && activeSectionIndex < sections.length - 1 && (
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ChevronRightIcon />}
                  className="path-footer-button"
                  onClick={() => setActiveSectionIndex(prev => prev + 1)}
                >
                  Next Section
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Box>

        {/* Roadmap Node Preview - Desktop Floating Popover */}
        <Popover
          open={Boolean(anchorEl) && !isMobileViewport}
          anchorEl={anchorEl}
          onClose={handleClosePreview}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: 'left'
          }}
          PaperProps={{
            style: {
              borderRadius: '24px',
              padding: '24px',
              width: '320px',
              border: selectedNode?.status === 'completed'
                ? '2px solid rgba(88, 204, 2, 0.4)'
                : '1px solid var(--divider)',
              background: selectedNode?.status === 'completed'
                ? (theme.palette.mode === 'dark' ? 'rgba(31, 45, 31, 0.96)' : 'rgba(242, 251, 240, 0.96)')
                : 'var(--surface-glass)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }
          }}
        >
          {renderPreviewContent()}
        </Popover>

        {/* Roadmap Node Preview - Mobile Centered Dialog */}
        <Dialog
          open={openDialog && isMobileViewport}
          onClose={handleClosePreview}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            style: {
              borderRadius: '24px',
              padding: '24px',
              border: selectedNode?.status === 'completed'
                ? '2px solid rgba(88, 204, 2, 0.4)'
                : '1px solid var(--divider)',
              background: selectedNode?.status === 'completed'
                ? (theme.palette.mode === 'dark' ? 'rgba(31, 45, 31, 0.96)' : 'rgba(242, 251, 240, 0.96)')
                : 'var(--surface-glass)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }
          }}
        >
          {renderPreviewContent()}
        </Dialog>

      </Container>
      {(showScrollArrow && !isCompilerOpen && !isJavaUmlPlaygroundOpen) && createPortal(
        <IconButton
          className="path-floating-action-btn"
          onClick={handleScrollToActive}
          aria-label="scroll to current lesson"
        >
          {scrollDirection === 'up' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
        </IconButton>,
        document.body
      )}

      <CppPlaygroundDialog
        open={isCompilerOpen}
        onClose={() => setIsCompilerOpen(false)}
      />
      <JavaOopUmlPlayground
        open={isJavaUmlPlaygroundOpen}
        onClose={() => setIsJavaUmlPlaygroundOpen(false)}
      />
      <Dialog
        open={isInfoDialogOpen}
        onClose={() => setIsInfoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'var(--background-paper)',
            backgroundImage: 'none',
            borderRadius: '24px',
            border: '1px solid var(--divider)',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            position: 'relative'
          }
        }}
      >
        <IconButton
          onClick={() => setIsInfoDialogOpen(false)}
          sx={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            color: 'var(--text-secondary)',
            '&:hover': { color: 'var(--text-primary)' }
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textAlign: 'center', mt: 1 }}>
          {/* Section Icon */}
          {(() => {
            const iconPath = activeSection?.iconUrl || activeSection?.icon || getSectionIcon(activeSection?.title);
            if (iconPath) {
              return (
                <img 
                  src={iconPath} 
                  alt={activeSection?.title || ''} 
                  style={{ 
                    width: '100px', 
                    height: '100px', 
                    objectFit: 'contain',
                    filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.3))' 
                  }} 
                />
              );
            }
            return <BookIcon sx={{ fontSize: 100, color: 'var(--primary-main)' }} />;
          })()}

          {/* Title and Description */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800, 
                color: 'var(--text-primary)',
                fontFamily: '"Outfit", sans-serif',
                fontSize: '2.25rem',
                letterSpacing: '-0.02em'
              }}
            >
              {activeSection?.title}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                fontSize: '1.05rem',
                maxWidth: '460px',
                margin: '0 auto'
              }}
            >
              {activeSection?.description || `Master the concepts and practical exercises of ${activeSection?.title || ''}.`}
            </Typography>
          </Box>

          {/* Divider */}
          <Box sx={{ width: '100%', height: '1px', background: 'var(--divider)', my: 1 }} />

          {/* Stats Row */}
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <BookIcon sx={{ color: 'var(--primary-main)', fontSize: 24 }} />
              <Typography variant="body1" sx={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                {numLessons} Lessons
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ExerciseIcon sx={{ color: '#c084fc', fontSize: 24 }} />
              <Typography variant="body1" sx={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                {numExercises} Exercises
              </Typography>
            </Box>
          </Box>
        </Box>
      </Dialog>

      {/* Completion Score Result Dialog for Exercises */}
      <Dialog
        open={Boolean(resultModalData)}
        onClose={() => setResultModalData(null)}
        PaperProps={{
          style: {
            borderRadius: '28px',
            padding: '28px 24px',
            maxWidth: '420px',
            width: '100%',
            background: 'var(--background-paper)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--divider)',
            boxShadow: 'none',
            textAlign: 'center'
          }
        }}
      >
        {resultModalData && (() => {
          const score = resultModalData.score;
          const isPassed = score >= 70;
          const themeScoreColor = score >= 70 ? '#58cc02' : score >= 50 ? 'var(--primary-main)' : 'var(--error-main, #ef4444)';
          const titleMsg = score >= 90 ? 'Outstanding Performance! 🏆' : score >= 70 ? 'Great Job! You Passed! 👍' : score >= 50 ? 'Good Effort! 👏' : 'Keep Practicing! 💪';
          const subMsg = isPassed 
            ? 'You achieved a passing score and unlocked the next lesson!'
            : 'Passing score is 70%. Retake the exercise to unlock the next lesson!';

          return (
            <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              {/* Circular Theme-Based Score Badge */}
              <Box
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--surface-glass)',
                  border: `4px solid ${themeScoreColor}`,
                  boxShadow: 'none',
                  marginTop: '8px'
                }}
              >
                <Typography style={{ fontSize: '2.2rem', fontWeight: 900, color: themeScoreColor, lineHeight: 1, fontFamily: '"Outfit", sans-serif' }}>
                  {score}%
                </Typography>
                <Typography style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '1px' }}>
                  Score
                </Typography>
              </Box>

              <Typography variant="h5" style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: '"Outfit", sans-serif', marginTop: '6px' }}>
                {titleMsg}
              </Typography>

              <Typography variant="body2" style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.92rem' }}>
                {subMsg}
              </Typography>

              <Box style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setResultModalData(null)}
                  style={{
                    padding: '12px',
                    borderRadius: '14px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    textTransform: 'none',
                    background: 'var(--primary-main)',
                    color: '#fff',
                    boxShadow: 'none'
                  }}
                >
                  Continue Learning
                </Button>
                {!isPassed && (
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      const lid = resultModalData.lessonId;
                      setResultModalData(null);
                      navigate(`/learning/${courseId}/1/${lid}`);
                    }}
                    style={{
                      padding: '10px',
                      borderRadius: '14px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textTransform: 'none',
                      borderColor: 'var(--divider)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    Retake Exercise
                  </Button>
                )}
              </Box>
            </Box>
          );
        })()}
      </Dialog>
    </Box>
  );
};

export default LearningPathPage;
