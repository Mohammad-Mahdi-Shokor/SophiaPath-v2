import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
  Stack,
  Popover,
  Tooltip,
  Badge,
  ListItem} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Brightness6 as Brightness6Icon,
  DashboardRounded as DashboardRoundedIcon,
  EmojiEvents as EmojiEventsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  ChatBubbleOutline as ChatIcon,
  Code as CodeIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Groups as GroupsIcon,
  School as SchoolIcon,
  Science as ScienceIcon,
  InfoOutlined as InfoIcon,
  Notifications as NotificationsIcon,
  DoneAll as DoneAllIcon} from '@mui/icons-material';


import { AnimatePresence, motion } from 'framer-motion';
import LearningPage from '../pages/LearningPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import ProfilePage from '../features/profile/ProfilePage';
import AchievementsPage from '../features/achievements/AchievementsPage';
import SettingsPage from '../features/settings/SettingsPage';
import CourseDetailPage from './CourseDetailPage';
import LearningPathPage from './LearningPathPage';
import QuizPage from './QuizPage';
import LearningContentPage from './LearningContentPage';
import ChallengePage from './labs/ChallengePage';
import PhilosophyLabPage from './PhilosophyLabPage';
import ChatListPage from '../features/chat/ChatListPage';
import ChatPage from '../features/chat/ChatPage';
import CyberLabPage from './CyberLabPage';
import GroupChatPage from '../features/chat/GroupChatPage';
import GroupJoinLinkHandler from '../features/chat/GroupJoinLinkHandler';
import CommunityListPage from '../features/community/CommunityListPage';
import CommunityDetailPage from '../features/community/CommunityDetailPage';
import QuestionDetailPage from '../features/community/QuestionDetailPage';
import LabsPage from './LabsPage';
import SecurityChallenges from './labs/SecurityChallenges';


import { useNavigate, Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom';
import { socialStore } from '../data/socialStore';
import logoImg from '../assets/sp-logo.png';
const formatLogTime = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (isSameDay(d, today)) {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } else if (isSameDay(d, yesterday)) {
    return 'Yesterday';
  } else {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};
import './NavigationPage.css';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ConstellationBackground from '../components/ConstellationBackground';
import { coursesData } from '../data/courses';
import { ProtectedRoute } from '../components/ProtectedRoute';



const AnimatedPage = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    className="nav-page-motion"
  >
    {children}
  </motion.div>
);

const getRouteKey = (pathname) => {
  if (!pathname) return '';
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return '/';
  if (segments[0] === 'communities') {
    if (segments.length === 1) return 'communities-list';
    if (segments.length === 2) return `community-${segments[1]}`;
    if (segments.length === 4 && segments[2] === 'room') return `community-${segments[1]}-room-${segments[3]}`;
    if (segments.length === 6 && segments[4] === 'question') return `question-${segments[5]}`;
    return 'communities';
  }
  if (segments[0] === 'chat' || segments[0] === 'chats' || segments[0] === 'group') return 'chats';
  if (segments[0] === 'course' || segments[0] === 'learning-path' || segments[0] === 'learning') return pathname;
  return segments[0];
};

const TUTORIAL_STEPS = [
  {
    target: '.nav-topbar',
    title: 'Topbar Header',
    description: 'This is the top bar showing your current workspace title. It holds quick actions like theme toggling.',
    placement: 'bottom'
  },
  {
    target: '.nav-topbar-button',
    title: 'Theme Customization',
    description: 'Click here to toggle the interface theme between dark mode and light mode.',
    placement: 'bottom'
  },
  {
    target: '.nav-logout-btn',
    title: 'Safe Exit',
    description: 'Click this button to safely sign out of your SophiaPath account.',
    placement: 'bottom'
  },
  {
    target: '.nav-sidebar-toggle-btn',
    title: 'Sidebar Collapse Toggle',
    description: 'Minimize the sidebar to free up workspace reading area.',
    placement: 'right'
  },
  {
    target: '.nav-menu-list',
    title: 'Sidebar Items',
    description: 'Navigate easily to milestones achievements, playgrounds, chat rooms, and communities.',
    placement: 'right'
  },
  {
    target: '.nav-profile-card',
    title: 'Profile Summary',
    description: 'View your level, avatar, username, and overall accumulated progress XP.',
    placement: 'right'
  },
  {
    target: '.learning-search-field input',
    title: 'Course Catalog Search',
    description: 'Type a keyword here to find any course or topic you want to start learning.',
    placement: 'bottom'
  },
  {
    target: '.learning-category-chip:first-of-type',
    title: 'Category Filter Tabs',
    description: 'Click these chips to filter the course directory by study domains.',
    placement: 'bottom'
  },
  {
    target: '.learning-course-card:first-of-type',
    title: 'Start Learning Syllabus',
    description: 'Click this card to view the lessons syllabus roadmap and enroll in the course.',
    placement: 'top'
  }
];

const NavigationPage = () => {
  const { user, logout, hasRole } = useAuth();
  const { toggleTheme, isDarkMode } = useAppTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logoStyle, setLogoStyle] = useState(() => localStorage.getItem('sophiapath_logo_style') || 'split');
  const [showGlobalBg, setShowGlobalBg] = useState(() => localStorage.getItem('sophiapath_global_bg') === 'true');
  const [bgStyle, setBgStyle] = useState(() => localStorage.getItem('sophiapath_bg_style') || 'constellation');

  const [anchorEl, setAnchorEl] = useState(null);
  const handleLevelInfoClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleLevelInfoClose = () => {
    setAnchorEl(null);
  };
  const isPopoverOpen = Boolean(anchorEl);

  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const handleProfileClick = (event) => {
    event.stopPropagation();
    setProfileAnchorEl(event.currentTarget);
  };
  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };
  const isProfilePopoverOpen = Boolean(profileAnchorEl);

  const [activeTour, setActiveTour] = useState(null); // 'onboarding' | 'page' | null
  const [activeStepIndex, setActiveStepIndex] = useState(null);
  const [spotlightRect, setSpotlightRect] = useState(null);
  const [pageSteps, setPageSteps] = useState([]);
  const [currentPageKey, setCurrentPageKey] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // 1. Tour Orchestrator Effect
  useEffect(() => {
    // If onboarding is active, do not interrupt with page tutorials
    const showOnboarding = localStorage.getItem('show_onboarding_tutorial');
    if (showOnboarding === 'true') {
      if (activeTour !== 'onboarding') {
        setSidebarCollapsed(false); // Make sure sidebar is visible
        setActiveTour('onboarding');
        setActiveStepIndex(0);
      }
      return;
    }

    // Check for page-specific tutorials
    const path = location.pathname;
    let targetKey = '';
    let steps = [];

    if (path === '/' || path === '') {
      targetKey = 'learning';
      steps = [
        {
          target: '.learning-search-field input',
          title: 'Course Search Input',
          description: 'Type a keyword here to find any course or topic you want to start learning.',
          placement: 'bottom'
        },
        {
          target: '.learning-category-chip:first-of-type',
          title: 'Category Filter Tab',
          description: 'Click these chips to filter the course directory by study domains.',
          placement: 'bottom'
        }
      ];
    } else if (path.startsWith('/course/')) {
      targetKey = 'course_detail';
      steps = [
        {
          target: '.course-enroll-button',
          title: 'Enroll or Resume',
          description: 'Click this button to enroll in the course or pick up right where you left off.',
          placement: 'bottom'
        },
        {
          target: '.course-detail-back-button',
          title: 'Back to Catalog',
          description: 'Click here to return to your personalized learning dashboard.',
          placement: 'bottom'
        }
      ];
    } else if (path.startsWith('/learning-path/')) {
      targetKey = 'learning_path';
      steps = [
        {
          target: '.path-node-shell:first-of-type',
          title: 'Learning Nodes',
          description: 'These circular buttons represent lessons, exercises, and labs. Click on the first active node to open your lesson!',
          placement: 'right'
        },
        {
          target: '.path-header-sticky button:first-of-type',
          title: 'Back to Catalog',
          description: 'Click here to head back to the course details overview.',
          placement: 'bottom'
        }
      ];
    } else if (path.startsWith('/learning/')) {
      targetKey = 'lesson';
      steps = [
        {
          target: '.learning-content-header button:first-of-type',
          title: 'Exit Lesson',
          description: 'Click this button to safely leave the lesson and return to your roadmap.',
          placement: 'bottom'
        },
        {
          target: '.learning-content-footer button.footer-nav-btn:last-of-type',
          title: 'Navigate Slides',
          description: 'Click this button to flip to the next slide once you finish reading and answer any exercises.',
          placement: 'top'
        }
      ];
    } else if (path.startsWith('/quiz/')) {
      targetKey = 'quiz';
      steps = [
        {
          target: '.quiz-content-footer button.quiz-next-btn',
          title: 'Submit Answer',
          description: 'Click this button to submit your answers and check if they are correct.',
          placement: 'top'
        },
        {
          target: '.quiz-back-btn',
          title: 'Exit Quiz',
          description: 'Click this button if you need to pause or exit the quiz back to your roadmap.',
          placement: 'bottom'
        }
      ];
    } else if (path === '/challenge') {
      targetKey = 'hack_challenge';
      steps = [
        {
          target: '.challenge-left-col button:nth-of-type(2)',
          title: 'Execute Script',
          description: 'Click here to run your custom JavaScript payload and test if it triggers a pop-up alert.',
          placement: 'bottom'
        },
        {
          target: '.hint-button:first-of-type',
          title: 'Reveal Hints',
          description: 'Stuck on a challenge? Click here to unlock helpful hints step-by-step.',
          placement: 'top'
        },
        {
          target: '.solution-icon-btn:first-of-type',
          title: 'Video Walkthrough',
          description: 'Click this play icon to watch a video walk-through demonstrating the solution.',
          placement: 'top'
        }
      ];
    } else if (path === '/philosophy-lab') {
      targetKey = 'philosophy_lab';
      steps = [
        {
          target: '.glass-panel button:first-of-type',
          title: 'Make Your Choice',
          description: 'Click these choice buttons to select your moral options for each philosophical scenario.',
          placement: 'bottom'
        }
      ];
    } else if (path === '/cyber-lab') {
      const queryParams = new URLSearchParams(location.search);
      const tab = queryParams.get('tab') || 'xss';

      if (tab === 'xss') {
        targetKey = 'cyber_lab_xss';
        steps = [
          {
            target: '.xss-tab-btn:first-of-type',
            title: 'Stored XSS Lab',
            description: 'This switches the view to the Stored XSS sandbox.',
            placement: 'bottom'
          },
          {
            target: '.xss-panel button',
            title: 'Submit Payload',
            description: 'Click this button to submit comments containing custom JavaScript payloads.',
            placement: 'bottom'
          }
        ];
      } else if (tab === 'ransomware') {
        targetKey = 'cyber_lab_ransomware';
        steps = [
          {
            target: '.ransomware-attack-btn',
            title: 'Trigger Ransomware',
            description: 'Launches the ransomware simulation, demonstrating how user files get encrypted.',
            placement: 'bottom'
          },
          {
            target: '.ransomware-toggle-btn',
            title: 'Toggle EDR Agent',
            description: 'Enable endpoint detection and response monitoring to block the payload.',
            placement: 'bottom'
          },
          {
            target: '.ransomware-restore-btn',
            title: 'Restore Backup',
            description: 'Restores the original clean backups after a ransomware attack.',
            placement: 'top'
          },
          {
            target: '.ransomware-pay-btn',
            title: 'Pay Ransom',
            description: 'Simulates paying the attackers (and explains why this does not guarantee data return).',
            placement: 'top'
          }
        ];
      } else if (tab === 'dos') {
        targetKey = 'cyber_lab_dos';
        steps = [
          {
            target: '.dos-slider',
            title: 'Request Volume',
            description: 'Drag this slider to scale the traffic flood. High volumes crash the server.',
            placement: 'bottom'
          },
          {
            target: '.dos-toggle-btn',
            title: 'Firewall Filter',
            description: 'Turn on the firewall to drop packet lists from the attacker while keeping legitimate user access active.',
            placement: 'bottom'
          }
        ];
      } else if (tab === 'ddos') {
        targetKey = 'cyber_lab_ddos';
        steps = [
          {
            target: '.dos-slider',
            title: 'Botnet Request Volume',
            description: 'Scale the volume of botnet nodes and request frequency.',
            placement: 'bottom'
          },
          {
            target: '.dos-toggle-btn',
            title: 'Mitigation Shield',
            description: 'Toggle the CDN scrubber shield to scrub out botnet flood traffic.',
            placement: 'bottom'
          }
        ];
      } else if (tab === 'social') {
        targetKey = 'cyber_lab_social';
        steps = [
          {
            target: '.social-attack-btn.phishing',
            title: 'Phishing Attack',
            description: 'Send a malicious landing link lure to the target employees.',
            placement: 'bottom'
          },
          {
            target: '.social-attack-btn.vishing',
            title: 'CEO Vishing Call',
            description: 'Make a fake CEO phone request to compromise corporate resources.',
            placement: 'bottom'
          },
          {
            target: '.social-toggle-btn:first-of-type',
            title: 'Security Training',
            description: 'Deploy security awareness training to decrease the click rate.',
            placement: 'bottom'
          },
          {
            target: '.social-toggle-btn:nth-of-type(2)',
            title: 'MFA Enforcement',
            description: 'Toggle Multi-Factor Authentication to secure login verification.',
            placement: 'bottom'
          },
          {
            target: '.social-reset-btn',
            title: 'Reset Scenario',
            description: 'Restore the social engineering simulation stats to default.',
            placement: 'top'
          }
        ];
      } else if (tab === 'insider') {
        targetKey = 'cyber_lab_insider';
        steps = [
          {
            target: '.insider-attack-btn.usb',
            title: 'USB Exfiltration',
            description: 'Simulate a rogue employee copying confidential data to a USB flash drive.',
            placement: 'bottom'
          },
          {
            target: '.insider-attack-btn.cloud',
            title: 'Cloud Data Upload',
            description: 'Exfiltrate internal database tables to public cloud file sync networks.',
            placement: 'bottom'
          },
          {
            target: '.insider-toggle-btn:first-of-type',
            title: 'UEBA Monitoring',
            description: 'Deploy User and Entity Behavior Analytics to flag anomalous document downloads.',
            placement: 'bottom'
          },
          {
            target: '.insider-toggle-btn:nth-of-type(2)',
            title: 'DLP Block Policies',
            description: 'Activate Data Loss Prevention rules to drop file copies to unapproved hosts.',
            placement: 'bottom'
          },
          {
            target: '.insider-reset-btn',
            title: 'Reset Scenario',
            description: 'Restore the insider threat simulation parameters to default.',
            placement: 'top'
          }
        ];
      } else if (tab === 'caesar') {
        targetKey = 'cyber_lab_caesar';
        steps = [
          {
            target: '.caesar-textarea:first-of-type',
            title: 'Plaintext Message',
            description: 'Type the message you want to encrypt using the Caesar shift.',
            placement: 'bottom'
          },
          {
            target: '.caesar-slider',
            title: 'Rotation Shift Slider',
            description: 'Drag this slider to select the key offset (0-25). Watch the alphabet wheels spin.',
            placement: 'bottom'
          },
          {
            target: '.caesar-reset',
            title: 'Reset Visualizer',
            description: 'Click to clear input text and restore the shift index to default.',
            placement: 'top'
          }
        ];
      } else if (tab === 'vigenere') {
        targetKey = 'cyber_lab_vigenere';
        steps = [
          {
            target: '.vigenere-textarea',
            title: 'Plaintext Message',
            description: 'Type the message you want to encrypt with the Vigenère cipher.',
            placement: 'bottom'
          },
          {
            target: '.vigenere-input-key',
            title: 'Repeating Keyword',
            description: 'Type the key string that determines the shift sequence of the message.',
            placement: 'bottom'
          },
          {
            target: '.vigenere-tab-btn:first-of-type',
            title: 'Tabula Recta Grid',
            description: 'Toggles the grid visualizer showing full row and column intersections.',
            placement: 'bottom'
          },
          {
            target: '.vigenere-tab-btn:nth-of-type(2)',
            title: 'Caesar Ruler Slider',
            description: 'Toggles the sliding ruler view illustrating per-letter Caesar offsets.',
            placement: 'bottom'
          },
          {
            target: '.vigenere-reset-btn',
            title: 'Reset Cipher',
            description: 'Restores the inputs and visualizations back to default values.',
            placement: 'top'
          }
        ];
      } else if (tab === 'enigma') {
        targetKey = 'cyber_lab_enigma';
        steps = [
          {
            target: '.enigma-select:first-of-type',
            title: 'Rotor Slot Selection',
            description: 'Choose which historical Enigma rotor wiring model (I-V) is active in this slot.',
            placement: 'bottom'
          },
          {
            target: '.enigma-pos-input:first-of-type',
            title: 'Rotor Initial Offset',
            description: 'Enter the initial alphabet character position (A-Z) of the rotor.',
            placement: 'bottom'
          },
          {
            target: '.enigma-input-wide',
            title: 'Plugboard wiring pairs',
            description: 'Type space-separated letter swap pairs to configure your plugboard leads.',
            placement: 'bottom'
          },
          {
            target: '.enigma-textarea',
            title: 'Input Plaintext',
            description: 'Compose your message. Every keystroke is dynamically encoded through the rotors.',
            placement: 'bottom'
          }
        ];
      } else if (tab === 'rsa') {
        targetKey = 'cyber_lab_rsa';
        steps = [
          {
            target: '.rsa-select:first-of-type',
            title: 'Prime P Choice',
            description: 'Choose the first prime number parameter (P) to drive the key generation formula.',
            placement: 'bottom'
          },
          {
            target: '.rsa-select:nth-of-type(2)',
            title: 'Prime Q Choice',
            description: 'Choose the second prime number parameter (Q) - must be different from P.',
            placement: 'bottom'
          },
          {
            target: '.rsa-pub-exp-select',
            title: 'Public Exponent Selection',
            description: 'Select a valid public exponent (E) that is coprime with Euler\'s totient.',
            placement: 'bottom'
          },
          {
            target: '.rsa-text-input',
            title: 'Message Plaintext',
            description: 'Type a message (up to 12 letters) to encrypt using asymmetric key math.',
            placement: 'bottom'
          }
        ];
      } else if (tab === 'base64') {
        targetKey = 'cyber_lab_base64';
        steps = [
          {
            target: '.b64-mode-btn:first-of-type',
            title: 'Encoding Tab',
            description: 'Set the visualizer to Encode mode, translating ASCII characters into Base64 indices.',
            placement: 'bottom'
          },
          {
            target: '.b64-mode-btn:nth-of-type(2)',
            title: 'Decoding Tab',
            description: 'Set the visualizer to Decode mode, transforming Base64 indices back to ASCII.',
            placement: 'bottom'
          },
          {
            target: '.b64-input',
            title: 'Base64 Text Area',
            description: 'Write your message. Look at the step-by-step bitwise shifts below.',
            placement: 'bottom'
          }
        ];
      } else if (tab === 'xor') {
        targetKey = 'cyber_lab_xor';
        steps = [
          {
            target: '.xor-input:first-of-type',
            title: 'Plaintext Binary',
            description: 'Type the first byte array message to XOR-encrypt.',
            placement: 'bottom'
          },
          {
            target: '.xor-input:nth-of-type(2)',
            title: 'Secret Key Binary',
            description: 'Type the binary key. The logic XORs them column by column.',
            placement: 'bottom'
          }
        ];
      }
    } else if (path === '/communities') {
      targetKey = 'community';
      steps = [
        {
          target: '.community-list-header input',
          title: 'Search Communities',
          description: 'Type keywords here to filter active learning communities.',
          placement: 'bottom'
        },
        {
          target: '.community-list-header button:last-of-type',
          title: 'Create a Community',
          description: 'Start your own private or public study community.',
          placement: 'bottom'
        }
      ];
    } else if (path.startsWith('/communities/') && path.includes('/room/') && path.includes('/question/')) {
      targetKey = 'question_thread';
      steps = [
        {
          target: '.question-comment-input textarea',
          title: 'Write a comment',
          description: 'Type your reply or answer to the community question here.',
          placement: 'top'
        },
        {
          target: '.question-send-btn',
          title: 'Post comment',
          description: 'Submits your comment to the thread. Cooldown starts immediately.',
          placement: 'top'
        }
      ];
    } else if (path.startsWith('/communities/')) {
      targetKey = 'community_detail';
      steps = [
        {
          target: '.community-ask-btn',
          title: 'Ask a Question',
          description: 'Click this button to open the question submission form.',
          placement: 'bottom'
        }
      ];
    } else if (path === '/chats') {
      targetKey = 'chats';
      steps = [
        {
          target: '.chat-search-field input',
          title: 'Search Conversations',
          description: 'Type a friend\'s username here to filter your active chat list.',
          placement: 'bottom'
        },
        {
          target: '.chat-list-card button',
          title: 'New Group Chat',
          description: 'Click here to create a new group chat room and select friends to add.',
          placement: 'bottom'
        }
      ];
    } else if (path.startsWith('/chat/')) {
      targetKey = 'chat_room';
      steps = [
        {
          target: '.chat-text-field textarea',
          title: 'Type Message',
          description: 'Type your chat messages here. You can attach images or add emojis using the composer buttons.',
          placement: 'top'
        },
        {
          target: '.chat-send-btn',
          title: 'Send Message',
          description: 'Click this button to send your message instantly to your friend.',
          placement: 'top'
        }
      ];
    } else if (path.startsWith('/group/')) {
      targetKey = 'group_chat_room';
      steps = [
        {
          target: '.chat-input-field textarea',
          title: 'Type Message to Group',
          description: 'Type your message for the entire group here. Mention members using @.',
          placement: 'top'
        },
        {
          target: '.chat-send-btn',
          title: 'Send Message to Group',
          description: 'Click this button to post your message instantly to the group.',
          placement: 'top'
        }
      ];
    } else if (path === '/achievements') {
      targetKey = 'achievements';
      steps = [
        {
          target: '.achievements-filter-btn:first-of-type',
          title: 'Filter Badges',
          description: 'Toggle this filter button to view unlocked, locked, or all achievements milestones.',
          placement: 'bottom'
        },
        {
          target: '.achievement-card:first-of-type',
          title: 'Milestone Details',
          description: 'Hover or click these milestone cards to view descriptions, requirements, and completion metrics.',
          placement: 'bottom'
        }
      ];
    } else if (path === '/profile') {
      targetKey = 'profile';
      steps = [
        {
          target: '.profile-card button:first-of-type',
          title: 'Edit Profile Details',
          description: 'Click here to customize your name, bio, social links, or change your avatar.',
          placement: 'bottom'
        }
      ];
    } else if (path === '/settings') {
      targetKey = 'settings';
      steps = [
        {
          target: '.settings-row input[type="checkbox"]',
          title: 'Logo Customization Toggle',
          description: 'Toggle this switch to customize the brand logo style between gradient and split color presets.',
          placement: 'bottom'
        }
      ];
    }

    if (targetKey) {
      const alreadyVisited = localStorage.getItem(`visited_page_${targetKey}`);
      if (!alreadyVisited && user) {
        setPageSteps(steps);
        setCurrentPageKey(targetKey);
        setActiveTour('page');
        setActiveStepIndex(0);
      } else {
        if (activeTour === 'page' && currentPageKey !== targetKey) {
          setActiveTour(null);
          setActiveStepIndex(null);
        }
      }
    } else {
      if (activeTour === 'page') {
        setActiveTour(null);
        setActiveStepIndex(null);
      }
    }
  }, [location.pathname, user, activeTour]);

  // 2. Spotlight Rectangle Calculator Effect with auto-scrolling
  useEffect(() => {
    if (activeStepIndex === null || activeTour === null) {
      setSpotlightRect(null);
      return;
    }

    const steps = activeTour === 'onboarding' ? TUTORIAL_STEPS : pageSteps;
    if (!steps || steps.length === 0 || !steps[activeStepIndex]) return;

    const step = steps[activeStepIndex];
    let attempts = 0;

    const scrollAndMeasure = () => {
      const element = document.querySelector(step.target);
      if (element) {
        // Automatically scroll the target element into view smoothly and center it ONCE
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Wait for smooth scroll to finish settling before getting the bounding rect
        setTimeout(measureOnly, 300);
      } else if (attempts < 15) {
        attempts++;
        setTimeout(scrollAndMeasure, 200); // Poll every 200ms up to 3 seconds
      } else {
        setSpotlightRect(null);
      }
    };

    const measureOnly = () => {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setSpotlightRect({
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          right: rect.right,
          bottom: rect.bottom
        });
      }
    };

    // Trigger scroll and measurement chain
    scrollAndMeasure();

    // Event listeners only measure (no scroll recursion!)
    window.addEventListener('resize', measureOnly);
    window.addEventListener('scroll', measureOnly);
    return () => {
      window.removeEventListener('resize', measureOnly);
      window.removeEventListener('scroll', measureOnly);
    };
  }, [activeStepIndex, activeTour, pageSteps]);

  // 3. Disable body scroll during active tutorial
  useEffect(() => {
    if (activeTour !== null) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [activeTour]);

  const handleSkipTutorial = () => {
    if (activeTour === 'onboarding') {
      localStorage.removeItem('show_onboarding_tutorial');
    } else if (activeTour === 'page' && currentPageKey) {
      localStorage.setItem(`visited_page_${currentPageKey}`, 'true');
    }
    setActiveTour(null);
    setActiveStepIndex(null);
  };

  const handleNextStep = () => {
    const steps = activeTour === 'onboarding' ? TUTORIAL_STEPS : pageSteps;
    if (activeStepIndex < steps.length - 1) {
      const currentStep = steps[activeStepIndex];
      // Trigger programmatic navigation before moving to the next step
      if (activeTour === 'onboarding' && currentStep.action) {
        navigate(currentStep.action);
      }
      setActiveStepIndex(prev => prev + 1);
    } else {
      if (activeTour === 'onboarding') {
        localStorage.removeItem('show_onboarding_tutorial');
      } else if (activeTour === 'page' && currentPageKey) {
        localStorage.setItem(`visited_page_${currentPageKey}`, 'true');
      }
      setActiveTour(null);
      setActiveStepIndex(null);
    }
  };

  const handlePrevStep = () => {
    const steps = activeTour === 'onboarding' ? TUTORIAL_STEPS : pageSteps;
    if (activeStepIndex > 0) {
      const currentStep = steps[activeStepIndex];
      // Trigger programmatic back navigation if backAction is defined
      if (activeTour === 'onboarding' && currentStep.backAction) {
        navigate(currentStep.backAction);
      }
      setActiveStepIndex(prev => prev - 1);
    }
  };

  const renderTutorialOverlay = () => {
    if (activeTour === null || activeStepIndex === null) return null;
    return (
      <Box
        className="sp-tutorial-overlay-blocker"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 999980,
          backgroundColor: 'transparent',
          pointerEvents: 'auto'}}
      />
    );
  };

  const renderTutorialSpotlight = () => {
    if (activeTour === null || activeStepIndex === null || !spotlightRect) return null;

    return (
      <div
        className="sp-tutorial-spotlight"
        style={{
          position: 'fixed',
          left: `${spotlightRect.left - 8}px`,
          top: `${spotlightRect.top - 8}px`,
          width: `${spotlightRect.width + 16}px`,
          height: `${spotlightRect.height + 16}px`,
          
          borderRadius: '8px',
          border: '2px solid var(--primary-main)',
          pointerEvents: 'none',
          zIndex: 999990,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'}}
      />
    );
  };

  const renderTutorialTooltip = () => {
    if (activeTour === null || activeStepIndex === null) return null;
    const steps = activeTour === 'onboarding' ? TUTORIAL_STEPS : pageSteps;
    if (!steps || steps.length === 0 || !steps[activeStepIndex]) return null;

    const step = steps[activeStepIndex];

    let style = {
      position: 'fixed',
      zIndex: 999995,
      width: '320px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'};

    if (spotlightRect) {
      let placement = step.placement;

      // Auto-correct placement to prevent overlapping off-screen or target component
      if (placement === 'right' && spotlightRect.right + 336 > window.innerWidth) {
        placement = spotlightRect.left - 336 > 16 ? 'left' : 'bottom';
      }

      if (placement === 'bottom' && spotlightRect.bottom + 220 > window.innerHeight) {
        placement = spotlightRect.top - 220 > 16 ? 'top' : 'right';
      }

      // Calculate coordinates
      if (placement === 'right') {
        style.left = `${spotlightRect.right + 16}px`;
        style.top = `${spotlightRect.top + (spotlightRect.height / 2) - 100}px`;
      } else if (placement === 'left') {
        style.left = `${spotlightRect.left - 336}px`;
        style.top = `${spotlightRect.top + (spotlightRect.height / 2) - 100}px`;
      } else if (placement === 'top') {
        style.left = `${spotlightRect.left + (spotlightRect.width / 2) - 160}px`;
        style.top = `${spotlightRect.top - 220}px`;
      } else if (placement === 'bottom-left') {
        style.left = `${spotlightRect.left}px`;
        style.top = `${spotlightRect.bottom + 16}px`;
      } else {
        style.left = `${spotlightRect.left + (spotlightRect.width / 2) - 160}px`;
        style.top = `${spotlightRect.bottom + 16}px`;
      }

      // Prevent off-screen margins
      if (parseFloat(style.left) < 16) style.left = '16px';
      if (parseFloat(style.left) + 320 > window.innerWidth - 16) {
        style.left = `${window.innerWidth - 336}px`;
      }
      if (parseFloat(style.top) < 16) style.top = '16px';
      if (parseFloat(style.top) + 200 > window.innerHeight - 16) {
        style.top = `${window.innerHeight - 216}px`;
      }
    } else {
      style.left = '50%';
      style.top = '50%';
      style.transform = 'translate(-50%, -50%)';
    }

    return (
      <Paper
        className="glass-panel-strong sp-tutorial-tooltip"
        style={style}
        sx={{
          p: 2.5,
          borderRadius: 3,
          
          border: '1px solid rgba(255, 255, 255, 0.15)',
          background: 'var(--background-paper) !important'}}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, color: 'var(--primary-main)' }}>
          {step.title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 2, lineHeight: 1.5 }}>
          {step.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <Typography variant="caption" sx={{ color: 'var(--text-disabled)', fontWeight: 600 }}>
            Step {activeStepIndex + 1} of {steps.length}
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              onClick={handleSkipTutorial}
              sx={{ textTransform: 'none', color: 'var(--text-secondary)' }}
            >
              Skip
            </Button>
            {activeStepIndex > 0 && (
              <Button
                size="small"
                variant="outlined"
                onClick={handlePrevStep}
                sx={{ textTransform: 'none', borderRadius: 1.5 }}
              >
                Back
              </Button>
            )}
            <Button
              size="small"
              variant="contained"
              onClick={handleNextStep}
              sx={{ textTransform: 'none', borderRadius: 1.5 }}
            >
              {activeStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    );
  };

  useEffect(() => {
    const handleStyleChange = () => {
      setLogoStyle(localStorage.getItem('sophiapath_logo_style') || 'split');
    };
    const handleGlobalBgChange = () => {
      setShowGlobalBg(localStorage.getItem('sophiapath_global_bg') === 'true');
    };
    const handleBgStyleChange = () => {
      setBgStyle(localStorage.getItem('sophiapath_bg_style') || 'constellation');
    };
    window.addEventListener('logo_style_changed', handleStyleChange);
    window.addEventListener('sophiapath_global_bg_changed', handleGlobalBgChange);
    window.addEventListener('sophiapath_bg_style_changed', handleBgStyleChange);
    return () => {
      window.removeEventListener('logo_style_changed', handleStyleChange);
      window.removeEventListener('sophiapath_global_bg_changed', handleGlobalBgChange);
      window.removeEventListener('sophiapath_bg_style_changed', handleBgStyleChange);
    };
  }, []);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isStickyFooterPage = location.pathname.startsWith('/quiz/') || location.pathname.startsWith('/learning/');

  // Track manual sidebarCollapsed state
  const sidebarCollapsedRef = useRef(sidebarCollapsed);
  useEffect(() => {
    sidebarCollapsedRef.current = sidebarCollapsed;
  }, [sidebarCollapsed]);

  // Track if we were previously inside a community detail/room/post view
  const wasInCommunityDetailRef = useRef(false);
  const sidebarStateBeforeEnteringCommunityRef = useRef(false);

  useEffect(() => {
    const isCommunityDetailOnly = location.pathname.startsWith('/communities/') && !location.pathname.includes('/question/');

    if (isCommunityDetailOnly) {
      if (!wasInCommunityDetailRef.current) {
        // Save the manual state of the sidebar before entering the community detail view
        sidebarStateBeforeEnteringCommunityRef.current = sidebarCollapsedRef.current;
        setSidebarCollapsed(true);
      }
      wasInCommunityDetailRef.current = true;
    } else {
      if (wasInCommunityDetailRef.current) {
        // Restore the sidebar collapse state to whatever the user had it set to
        setSidebarCollapsed(sidebarStateBeforeEnteringCommunityRef.current);
      }
      wasInCommunityDetailRef.current = false;
    }
  }, [location.pathname]);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifAnchor, setNotifAnchor] = useState(null);

  const handleNotifClick = (event) => {
    setNotifAnchor(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchor(null);
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const [notifsRes, countRes] = await Promise.all([
        fetch('/api/notifications', { headers }),
        fetch('/api/notifications/unread-count', { headers })
      ]);

      if (notifsRes.ok && countRes.ok) {
        let notifs = await notifsRes.json();
        let countData = await countRes.json();
        let unreadCountVal = countData.count;

        // Check if inside active chat / group chat to auto-mute
        const chatMatch = location.pathname.match(/^\/chat\/(\d+)/);
        const activeChatPartnerId = chatMatch ? chatMatch[1] : null;

        const groupMatch = location.pathname.match(/^\/group\/(\d+)/);
        const activeGroupId = groupMatch ? groupMatch[1] : null;

        const readPromises = [];
        notifs = notifs.map(n => {
          if (!n.isRead) {
            const isViewingChat = n.type === 'chat' && String(n.sourceId) === String(activeChatPartnerId);
            const isViewingGroup = n.type === 'group_chat' && String(n.sourceId) === String(activeGroupId);
            if (isViewingChat || isViewingGroup) {
              n.isRead = true;
              unreadCountVal = Math.max(0, unreadCountVal - 1);
              readPromises.push(
                fetch(`/api/notifications/${n.id}/read`, { method: 'POST', headers })
              );
            }
          }
          return n;
        });

        if (readPromises.length > 0) {
          try {
            await Promise.all(readPromises);
          } catch (e) {
            console.error('Failed to auto-read current chat notifications:', e);
          }
        }

        setNotifications(notifs);
        setUnreadCount(unreadCountVal);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const res = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers
      });

      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (e) {
      console.error('Failed to mark notifications as read:', e);
    }
  };

  const handleClearAll = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const res = await fetch('/api/notifications', {
        method: 'DELETE',
        headers
      });

      if (res.ok) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (e) {
      console.error('Failed to clear notifications:', e);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const ids = notif.originalIds || [notif.id];
      await Promise.all(
        ids.map(id =>
          fetch(`/api/notifications/${id}/read`, {
            method: 'POST',
            headers
          })
        )
      );

      // Update state
      setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - ids.length));
      
      handleNotifClose();

      // Navigation routing based on notification type
      if (notif.type === 'system_role') {
        navigate('/profile');
      } else if (notif.type === 'community_role') {
        navigate(`/communities/${notif.sourceId}`);
      } else if (notif.type === 'comment' || notif.type === 'reply') {
        navigate(`/communities/${notif.sourceId}`);
      } else if (notif.type === 'chat') {
        navigate(`/chat/${notif.sourceId}`);
      } else if (notif.type === 'group_chat' || notif.type === 'group_role') {
        navigate(`/group/${notif.sourceId}`);
      } else if (notif.type === 'achievement') {
        navigate('/achievements');
      }
    } catch (e) {
      console.error('Failed to handle notification click:', e);
    }
  };

  const getGroupedNotifications = () => {
    const grouped = [];
    const unreadGroups = {}; // key: 'chat:sourceId', 'group_chat:sourceId', 'comment:sourceId', 'reply:sourceId'

    for (const notif of notifications) {
      if (!notif.isRead && (notif.type === 'chat' || notif.type === 'group_chat' || notif.type === 'comment' || notif.type === 'reply')) {
        const key = `${notif.type}:${notif.sourceId}`;
        if (!unreadGroups[key]) {
          unreadGroups[key] = [];
        }
        unreadGroups[key].push(notif);
      } else {
        grouped.push({ ...notif, originalIds: [notif.id] });
      }
    }

    for (const key in unreadGroups) {
      const groupNotifs = unreadGroups[key];
      // Sort by date descending (most recent first)
      groupNotifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      const mostRecent = groupNotifs[0];
      const count = groupNotifs.length;
      
      if (count > 1) {
        let mergedTitle = mostRecent.title;
        let mergedMessage = '';
        if (mostRecent.type === 'chat') {
          const parts = mostRecent.message.split(': ');
          const sender = parts[0] || 'User';
          const lastMsg = parts.slice(1).join(': ') || '';
          mergedMessage = `${sender} (${count} messages): ${lastMsg}`;
        } else if (mostRecent.type === 'group_chat') {
          // Group chat
          const parts = mostRecent.message.split(' - ');
          const groupName = parts[0] || 'Group';
          const rest = parts.slice(1).join(' - ') || '';
          const subParts = rest.split(': ');
          const sender = subParts[0] || 'User';
          const lastMsg = subParts.slice(1).join(': ') || '';
          mergedMessage = `${groupName} - ${sender} (${count} messages): ${lastMsg}`;
        } else if (mostRecent.type === 'comment') {
          mergedTitle = 'New Comments';
          mergedMessage = `${count} people commented on your post`;
        } else if (mostRecent.type === 'reply') {
          mergedTitle = 'New Replies';
          mergedMessage = `${count} people replied to your comment`;
        }

        grouped.push({
          ...mostRecent,
          title: mergedTitle,
          message: mergedMessage,
          originalIds: groupNotifs.map(n => n.id)
        });
      } else {
        grouped.push({
          ...mostRecent,
          originalIds: [mostRecent.id]
        });
      }
    }

    return grouped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 4000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    if (!localStorage.getItem('sophiapath_starred_cleared')) {
      localStorage.removeItem('starred_messages_list');
      localStorage.setItem('sophiapath_starred_cleared', 'true');
    }
  }, []);

  const userName = user?.name || (user ? 'Learner' : 'Guest User');


  const navigationItems = React.useMemo(() => {
    const items = [];
    if (hasRole([1, 3])) { // Admin (3) or Expert (1)
      items.push({ label: 'Dashboard', path: '/', icon: <DashboardRoundedIcon /> });
    }
    items.push({ label: 'Courses', path: '/courses', icon: <SchoolIcon /> });
    items.push({ label: 'Labs', path: '/labs', icon: <ScienceIcon /> });
    items.push({ label: 'Achievements', path: '/achievements', icon: <EmojiEventsIcon /> });
    items.push({ label: 'Chats', path: '/chats', icon: <ChatIcon /> });
    items.push({ label: 'Communities', path: '/communities', icon: <GroupsIcon /> });
    items.push({ label: 'Profile', path: '/profile', icon: <PersonIcon /> });
    items.push({ label: 'Settings', path: '/settings', icon: <SettingsIcon /> });
    return items;
  }, [user]);

  const pageTitles = {
    '/': Number(user?.roleID) === 1 ? 'Syllabus Editor' : 'Dashboard',
    '/courses': 'Your Courses',
    '/labs': 'Interactive Labs',
    '/learning-path': 'Your Roadmap',
    '/challenge': 'Chapter Challenge',
    '/achievements': 'Your Achievements',
    '/chats': 'Messages',
    '/communities': 'Learning Communities',
    '/profile': 'Your Profile',
    '/settings': 'Settings'};

  const pageDescriptions = {
    '/': Number(user?.roleID) === 1
      ? 'Manage and edit course sections, lessons, and content.'
      : 'Manage your platform, users, courses, and system settings.',
    '/courses': 'Browse courses, continue learning, and track your progress.',
    '/labs': 'Practice through interactive labs.',
    '/learning-path': 'Follow your personalized learning journey and unlock new milestones.',
    '/challenge': 'Sharpen your skills with problem-solving challenges.',
    '/achievements': 'View your achievements, streaks, and overall progress.',
    '/chats': 'Chat with friends, learners, and experts in real time.',
    '/communities': 'Join communities, participate in discussions, and connect with learners worldwide.',
    '/profile': 'View your profile, accomplishments, and learning activity.',
    '/settings': 'Customize your account, preferences, accessibility, and application settings.'};



  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const shellNav = (
    <div
      className={`nav-shell-sidebar ${sidebarCollapsed ? 'is-collapsed' : ''}`}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          height: '100%',
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'visible',
          pointerEvents: 'auto'
        }}
      >
        <div
          className="nav-brand"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.75rem 1rem'
          }}
        >
          {/* Empty placeholder reserving space for the floating animated logo */}
          <div style={{ width: '40px', height: '40px', flexShrink: 0 }} />
          {!sidebarCollapsed && (
            <div>
              <Typography className="nav-brand-title">
                <span style={{ color: 'var(--primary-main)' }}>Sophia</span>
                <span style={{ color: 'var(--primary-dark)' }}>Path</span>
              </Typography>
            </div>
          )}
        </div>

        {!sidebarCollapsed ? (
          <div className="nav-profile-card" style={{ padding: '0.65rem' }}>
            <div className="nav-profile-copy" style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flexGrow: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', flexWrap: 'nowrap' }}>
                <Typography className="nav-profile-name" style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                  {userName}
                </Typography>
                <span style={{
                  fontSize: '0.56rem',
                  fontWeight: 900,
                  padding: '1px 5px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: !user ? 'rgba(255,255,255,0.08)' : Number(user.roleID) >= 1 ? 'rgba(var(--primary-main-rgb), 0.15)' : 'rgba(255,255,255,0.06)',
                  color: !user ? 'var(--text-secondary)' : Number(user.roleID) >= 1 ? 'var(--primary-main)' : 'var(--text-secondary)',
                  border: '1px solid var(--divider)',
                  flexShrink: 0
                }}>
                  {!user ? 'Guest' : Number(user.roleID) === 3 ? 'Admin' : Number(user.roleID) === 2 ? 'Moderator' : Number(user.roleID) === 1 ? 'Expert' : 'Student'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', width: '100%', flexWrap: 'nowrap' }}>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 900, color: 'var(--primary-main)',
                  background: 'rgba(var(--primary-main-rgb), 0.12)',
                  padding: '1px 6px', borderRadius: '20px',
                  border: '1px solid rgba(var(--primary-main-rgb), 0.2)',
                  whiteSpace: 'nowrap', flexShrink: 0
                }}>
                  Lv.{user?.level ?? 1}
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {!user ? 'Novice Seeker' : (user?.levelName || 'Beginner')}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-disabled)', flexShrink: 0 }}>·</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {user?.xp ?? 0} XP
                </span>
                {user && (
                  <Tooltip title="View Level Guide">
                    <IconButton
                      size="small"
                      onClick={handleLevelInfoClick}
                      style={{ padding: '0 2px', color: 'var(--text-secondary)', marginLeft: '1px', flexShrink: 0 }}
                      className="interactive"
                    >
                      <InfoIcon style={{ fontSize: '0.8rem' }} />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        ) : (
          user && (
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <Tooltip title="View User Profile">
                <IconButton onClick={handleProfileClick} style={{ padding: '4px' }}>
                  <Avatar
                    src={user?.avatar || ''}
                    sx={{ width: 36, height: 36, border: '1.5px solid var(--primary-main)' }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </div>
          )
        )}

        <List className="nav-menu-list">
          {navigationItems.map((item) => {
            const active = location.pathname === item.path;
            const isGuestAccessible =
              item.path === '/courses' ||
              item.path === '/communities' ||
              item.path === '/labs' ||
              item.path === '/settings';
            const isDisabled = !user && !isGuestAccessible;

            return (
              <div key={item.path} style={{ width: '100%' }}>
                <ListItemButton
                  selected={active && !isDisabled}
                  className={`nav-menu-item ${active ? 'is-active' : ''} ${isDisabled ? 'is-disabled' : ''}`}
                  onClick={isDisabled ? undefined : () => handleNavigation(item.path)}
                  disabled={isDisabled}
                  sx={{
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    px: sidebarCollapsed ? 1 : 2,
                    width: '100%',
                    boxSizing: 'border-box',
                    color: isDisabled ? 'var(--text-disabled)' : 'inherit',
                    opacity: isDisabled ? 0.35 : 1}}
                >
                  <ListItemIcon
                    className="nav-menu-icon"
                    sx={{
                      minWidth: sidebarCollapsed ? 24 : 42,
                      display: 'flex',
                      justifyContent: 'center',
                      color: isDisabled ? 'var(--text-disabled)' : active ? 'var(--primary-main)' : 'inherit',
                      opacity: isDisabled ? 0.5 : 1
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!sidebarCollapsed && (
                    <ListItemText 
                      primary={item.label} 
                      primaryTypographyProps={{
                        sx: { color: isDisabled ? 'var(--text-disabled)' : 'inherit' }
                      }}
                    />
                  )}
                </ListItemButton>
              </div>
            );
          })}
        </List>
      </div>

      <Popover
        open={isPopoverOpen}
        anchorEl={anchorEl}
        onClose={handleLevelInfoClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'}}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'}}
        PaperProps={{
          style: {
            padding: '16px',
            width: '280px',
            borderRadius: '16px',
            background: 'var(--background-paper)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--divider)',
            color: 'var(--text-primary)'}
        }}
      >
        <Typography variant="subtitle2" style={{ fontWeight: 850, marginBottom: '6px', fontFamily: '"Outfit", sans-serif', color: 'var(--primary-main)' }}>
          XP & Levels Rank System
        </Typography>
        <Typography variant="body2" style={{ fontSize: '0.74rem', opacity: 0.7, marginBottom: '12px', lineHeight: 1.4 }}>
          Earn XP by finishing lessons and quizzes. Unlock a new rank every 100 XP!
        </Typography>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto', marginBottom: '12px', paddingRight: '4px' }}>
          {[
            { level: 1, name: 'Beginner', range: '0 - 99' },
            { level: 2, name: 'Learner', range: '100 - 199' },
            { level: 3, name: 'Explorer', range: '200 - 299' },
            { level: 4, name: 'Skilled', range: '300 - 399' },
            { level: 5, name: 'Advanced', range: '400 - 499' },
            { level: 6, name: 'Expert', range: '500 - 599' },
            { level: 7, name: 'Veteran', range: '600 - 699' },
            { level: 8, name: 'Elite', range: '700 - 799' },
            { level: 9, name: 'Master', range: '800 - 899' },
            { level: 10, name: 'Legend', range: '900+' },
          ].map((cfg) => {
            const currentLvl = user?.level || 1;
            const isCurrent = currentLvl === cfg.level || (cfg.level === 10 && currentLvl >= 10);
            return (
              <div
                key={cfg.level}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '5px 8px',
                  borderRadius: '8px',
                  background: isCurrent ? 'rgba(var(--primary-main-rgb), 0.18)' : 'transparent',
                  border: isCurrent ? '1.5px solid var(--primary-main)' : '1px solid transparent'}}
              >
                <span style={{ fontSize: '0.76rem', fontWeight: isCurrent ? 800 : 500, color: isCurrent ? 'var(--primary-main)' : 'inherit' }}>
                  Lvl {cfg.level}: {cfg.name}
                </span>
                <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>
                  {cfg.range} XP
                </span>
              </div>
            );
          })}
        </div>

        {(user?.level || 1) < 10 && (
          <div style={{ padding: '8px 10px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Typography style={{ fontSize: '0.74rem', fontWeight: 800 }}>
              Next Rank: <span style={{ color: '#3D5CFF' }}>
                {[
                  'Beginner', 'Learner', 'Explorer', 'Skilled', 'Advanced', 'Expert', 'Veteran', 'Elite', 'Master', 'Legend'
                ][(user?.level || 1)]}
              </span>
            </Typography>
            <Typography style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '2px' }}>
              Earn <strong>{((user?.level || 1) * 100) - (user?.xp || 0)} XP</strong> more to level up!
            </Typography>
          </div>
        )}
      </Popover>

      <Popover
        open={isProfilePopoverOpen}
        anchorEl={profileAnchorEl}
        onClose={handleProfileClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        PaperProps={{
          style: {
            padding: '16px',
            width: '280px',
            borderRadius: '16px',
            background: 'var(--background-paper)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--divider)',
            color: 'var(--text-primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <Typography style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
              {userName}
            </Typography>
            <span style={{
              fontSize: '0.56rem',
              fontWeight: 900,
              padding: '1px 5px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              background: !user ? 'rgba(255,255,255,0.08)' : Number(user.roleID) >= 1 ? 'rgba(var(--primary-main-rgb), 0.15)' : 'rgba(255,255,255,0.06)',
              color: !user ? 'var(--text-secondary)' : Number(user.roleID) >= 1 ? 'var(--primary-main)' : 'var(--text-secondary)',
              border: '1px solid var(--divider)',
              flexShrink: 0
            }}>
              {!user ? 'Guest' : Number(user.roleID) === 3 ? 'Admin' : Number(user.roleID) === 2 ? 'Moderator' : Number(user.roleID) === 1 ? 'Expert' : 'Student'}
            </span>
          </div>
          <Typography style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {user?.email || 'guest@sophiapath.com'}
          </Typography>
        </div>

        <Divider style={{ borderColor: 'var(--divider)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary-main)',
            background: 'rgba(var(--primary-main-rgb), 0.12)',
            padding: '2px 8px', borderRadius: '20px',
            border: '1px solid rgba(var(--primary-main-rgb), 0.2)',
            whiteSpace: 'nowrap', flexShrink: 0
          }}>
            Lv.{user?.level ?? 1}
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {user?.levelName || 'Beginner'}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-disabled)' }}>·</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {user?.xp ?? 0} XP
          </span>
        </div>

        {(user?.level || 1) < 10 && (
          <div style={{ padding: '8px 10px', borderRadius: '10px', background: 'rgba(var(--primary-main-rgb), 0.04)', border: '1px solid var(--divider)' }}>
            <Typography style={{ fontSize: '0.74rem', fontWeight: 800 }}>
              Next Rank: <span style={{ color: 'var(--primary-main)' }}>
                {[
                  'Beginner', 'Learner', 'Explorer', 'Skilled', 'Advanced', 'Expert', 'Veteran', 'Elite', 'Master', 'Legend'
                ][(user?.level || 1)]}
              </span>
            </Typography>
            <Typography style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '2px' }}>
              Earn <strong>{((user?.level || 1) * 100) - (user?.xp || 0)} XP</strong> more to level up!
            </Typography>
          </div>
        )}
      </Popover>
    </div>
  );
  const renderDrawer = () => (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      className="nav-mobile-drawer"
    >
      <div style={{ height: '100%' }}>
        {shellNav}
      </div>
    </Drawer>
  );

  const getHeaderDetails = () => {
    const path = location.pathname;

    // Check exact matches
    if (pageTitles[path]) {
      return {
        title: pageTitles[path],
        description: pageDescriptions[path]
      };
    }

    // Check dynamic routes
    if (path.startsWith('/course/')) {
      const courseId = path.substring(8);
      const course = coursesData.find(c =>
        String(c.id) === String(courseId) ||
        c.title.toLowerCase().replace(/\s+/g, '-') === String(courseId).toLowerCase()
      );
      return {
        title: course ? course.title : 'Course Details',
        description: course ? course.description : 'Explore course content and details.'
      };
    }

    if (path.startsWith('/learning-path/')) {
      const courseId = path.substring(15);
      const course = coursesData.find(c =>
        String(c.id) === String(courseId) ||
        c.title.toLowerCase().replace(/\s+/g, '-') === String(courseId).toLowerCase()
      );
      return {
        title: course ? `${course.title} Roadmap` : 'Your Roadmap',
        description: course ? `Complete modules to progress in ${course.title}.` : 'See the full roadmap and unlock your next milestone.'
      };
    }

    if (path.startsWith('/learning/')) {
      // Format: /learning/:courseId/:sectionId/:lessonId
      const parts = path.split('/');
      const courseId = parts[2];
      const sectionId = parts[3];
      const lessonId = parts[4];
      const course = coursesData.find(c =>
        String(c.id) === String(courseId) ||
        c.title.toLowerCase().replace(/\s+/g, '-') === String(courseId).toLowerCase()
      );
      let title = 'Lesson Content';
      if (course) {
        const section = course.sections?.find(s => String(s.id) === String(sectionId));
        const lesson = section?.lessons?.find(l => String(l.id) === String(lessonId));
        if (lesson) {
          title = lesson.title;
        }
      }
      return {
        title: title,
        description: 'Read the materials, understand the key concepts, and take the quiz when ready.'
      };
    }

    if (path.startsWith('/quiz/')) {
      // Format: /quiz/:courseDomain/:lessonId
      const parts = path.split('/');
      const courseDomain = parts[2];
      const lessonId = parts[3];
      const course = coursesData.find(c =>
        c.domain?.toLowerCase() === courseDomain?.toLowerCase() ||
        c.title?.toLowerCase() === courseDomain?.toLowerCase()
      );
      let title = 'Quiz';
      if (course) {
        const lesson = course.sections?.flatMap(s => s.lessons || [])?.find(l => String(l.id) === String(lessonId));
        if (lesson) {
          title = `${lesson.title} - Quiz`;
        }
      }
      return {
        title: title,
        description: 'Test your knowledge on this topic and review any incorrect answers.'
      };
    }

    if (path.startsWith('/chat/')) {
      return {
        title: 'Messages',
        description: 'Connect with other learners and share your insights.'
      };
    }

    if (path.startsWith('/group/')) {
      return {
        title: 'Group Chat',
        description: 'Collaborate with your learning squad.'
      };
    }

    if (path.startsWith('/communities')) {
      return {
        title: 'Learning Communities',
        description: 'Join community channels, ask questions, and share knowledge.'
      };
    }

    if (path === '/philosophy-lab') {
      return {
        title: 'Fallacy Matcher',
        description: 'Test your critical thinking by matching arguments with logical fallacies.'
      };
    }

    if (path === '/cyber-lab') {
      return {
        title: 'Interactive Cyber Lab',
        description: 'Experiment with hands-on labs and security exercises.'
      };
    }

    return {
      title: 'SophiaPath',
      description: 'Your space for structured learning and growth.'
    };
  };

  const { title: currentTitle, description: currentDescription } = getHeaderDetails();

  const hideTopbar =
    location.pathname.startsWith('/course/') ||
    location.pathname.startsWith('/learning-path') ||
    location.pathname.startsWith('/learning/') ||
    location.pathname.startsWith('/quiz/') ||
    location.pathname.startsWith('/chat/') ||
    location.pathname.startsWith('/group/') ||
    location.pathname.startsWith('/communities/') ||
    location.pathname.startsWith('/philosophy-lab') ||
    location.pathname.startsWith('/cyber-lab') ||
    location.pathname.startsWith('/challenge');

  if (!user) {
    if (location.pathname === '/') {
      return <Navigate to="/courses" replace />;
    }
    const isGuestAccessible =
      location.pathname === '/courses' ||
      location.pathname.startsWith('/course/') ||
      location.pathname.startsWith('/communities') ||
      location.pathname === '/labs' ||
      location.pathname === '/philosophy-lab' ||
      location.pathname === '/cyber-lab' ||
      location.pathname === '/settings';

    if (!isGuestAccessible && !isAuthPage) {
      return <Navigate to="/login" replace />;
    }
  }

  if (isAuthPage) {
    return (
      <Box className="auth-shell">
        <ConstellationBackground styleType={bgStyle} />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
            <Route path="/register" element={<AnimatedPage><RegisterPage /></AnimatedPage>} />
          </Routes>
        </AnimatePresence>
      </Box>
    );
  }

  const isChatRoute = location.pathname.startsWith('/chat') || location.pathname.startsWith('/group');

  return (
    <Box className={`nav-shell ${isStickyFooterPage ? 'has-sticky-footer' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${isChatRoute ? 'is-chat-page' : ''}`}>
      {showGlobalBg && <ConstellationBackground styleType={bgStyle} />}
      {/* Floating Animated Brand Logo */}
      {!isMobile && (
        <motion.div
          animate={{
            left: sidebarCollapsed ? '2.4rem' : '3.5rem',
            top: sidebarCollapsed ? '2.4rem' : '3.25rem',
            width: sidebarCollapsed ? '2.2rem' : '2.5rem',
            height: sidebarCollapsed ? '2.2rem' : '2.5rem'
          }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className={`nav-brand-logo-container absolute-corner-logo ${logoStyle === 'gradient' ? 'sp-logo-gradient' : ''}`}
          style={{
            position: 'fixed',
            zIndex: 1200, // Render above sidebar but below dialog modals
            cursor: sidebarCollapsed ? 'pointer' : 'default',
            WebkitMaskImage: `url(${logoImg})`,
            maskImage: `url(${logoImg})`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            WebkitMaskSize: 'contain',
            maskSize: 'contain'}}
          onClick={() => {
            if (sidebarCollapsed) {
              setSidebarCollapsed(false);
            }
          }}
          title={sidebarCollapsed ? "Open Navigation" : undefined}
        >
          <div className="nav-logo-left-half" />
          <div className="nav-logo-right-half" />
        </motion.div>
      )}

      {/* Floating Toggle Button (Visible in both states) */}
      {!isMobile && (
        <motion.div
          animate={{
            left: sidebarCollapsed ? '4.5rem' : '17.2rem',
            opacity: sidebarCollapsed ? 0 : 1,
            scale: sidebarCollapsed ? 0 : 1
          }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'fixed',
            top: '56px',
            transform: 'translate(-50%, -50%)',
            zIndex: 1200,
            pointerEvents: sidebarCollapsed ? 'none' : 'auto'}}
        >
          <IconButton
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="nav-sidebar-toggle-btn animate-fade-in"
            size="small"
            sx={{
              color: 'var(--text-secondary)',
              border: '1px solid var(--divider)',
              background: 'var(--background-paper) !important',
              
              width: '24px',
              height: '24px',
              transition: 'background 0.2s, color 0.2s',
              '&:hover': {
                background: 'var(--primary-main) !important',
                color: '#fff !important'
              }
            }}
          >
            {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </motion.div>
      )}

      {!isMobile && (
        <aside
          className={`nav-desktop-rail ${sidebarCollapsed ? 'sidebar-collapsed-rail' : ''}`}
        >
          {shellNav}
        </aside>
      )}
      {isMobile && renderDrawer()}

      <main className="nav-main">
        {!hideTopbar && (
          <header className="nav-topbar glass-panel">
            <div className="nav-topbar-copy">
              {isMobile && (
                <IconButton onClick={() => setDrawerOpen(true)} className="nav-menu-trigger">
                  <MenuIcon />
                </IconButton>
              )}
              <div>
                <Typography variant="h3" className="nav-topbar-title">{currentTitle}</Typography>
                <Typography variant="body1" className="nav-topbar-description">{currentDescription}</Typography>
              </div>
            </div>

            <div className="nav-topbar-actions">
              <Button
                variant="outlined"
                startIcon={<Brightness6Icon />}
                onClick={toggleTheme}
                className="nav-topbar-button nav-topbar-theme-btn"
              >
                <span className="nav-theme-label">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </Button>
              {!user ? (
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                  style={{ borderRadius: '8px', textTransform: 'none', background: 'var(--primary-main)', fontWeight: 800 }}
                >
                  Sign In
                </Button>
              ) : (
                <>
                  <IconButton onClick={handleNotifClick} className="nav-notif-btn" title="Notifications" style={{ color: 'var(--text-secondary)' }}>
                    <Badge badgeContent={unreadCount} color="error" max={99}>
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                  <IconButton onClick={handleLogout} className="nav-logout-btn" title="Logout">
                    <LogoutIcon />
                  </IconButton>
                  <Avatar
                    src={user?.avatar || ''}
                    sx={{ width: 48, height: 48 }}
                    onClick={() => navigate('/profile')}
                    style={{ cursor: 'pointer' }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </Avatar>

                  <Popover
                    open={Boolean(notifAnchor)}
                    anchorEl={notifAnchor}
                    onClose={handleNotifClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    PaperProps={{
                      style: {
                        width: '360px',
                        maxHeight: '480px',
                        background: 'var(--background-paper)',
                        border: '1px solid var(--divider)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)',
                        boxShadow: 'none',
                        marginTop: '8px'
                      },
                    }}
                  >
                    <Box style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--divider)' }}>
                      <Typography variant="h6" style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '15px' }}>
                        Notifications
                      </Typography>
                      <Box style={{ display: 'flex', gap: '8px' }}>
                        {unreadCount > 0 && (
                          <Button
                            size="small"
                            onClick={handleMarkAllRead}
                            style={{ textTransform: 'none', color: 'var(--primary-main)', fontWeight: 700, fontSize: '12px', padding: 0, minWidth: 0 }}
                          >
                            Mark read
                          </Button>
                        )}
                        {notifications.length > 0 && (
                          <Button
                            size="small"
                            onClick={handleClearAll}
                            style={{ textTransform: 'none', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '12px', padding: 0, minWidth: 0 }}
                          >
                            Clear all
                          </Button>
                        )}
                      </Box>
                    </Box>
                    <List style={{ padding: 0, overflowY: 'auto', maxHeight: '400px' }}>
                      {notifications.length === 0 ? (
                        <Box style={{ padding: '40px 16px', textAlign: 'center' }}>
                          <NotificationsIcon style={{ fontSize: '32px', color: 'var(--text-secondary)', opacity: 0.4, marginBottom: '8px' }} />
                          <Typography variant="body2" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                            You are all caught up!
                          </Typography>
                        </Box>
                      ) : (
                        getGroupedNotifications().map((notif) => (
                          <ListItem
                            key={notif.id}
                            disablePadding
                            style={{
                              borderBottom: '1px solid var(--divider)',
                              background: notif.isRead 
                                ? 'transparent' 
                                : (notif.type === 'achievement' 
                                    ? 'rgba(255, 181, 71, 0.08)' 
                                    : 'rgba(var(--primary-main-rgb), 0.04)'),
                            }}
                          >
                            <ListItemButton onClick={() => handleNotificationClick(notif)} style={{ padding: '12px 16px' }}>
                              <Box style={{ marginRight: '12px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                {notif.type === 'achievement' ? (
                                  <EmojiEventsIcon style={{ color: '#FFB547', fontSize: '20px' }} />
                                ) : notif.type === 'chat' ? (
                                  <ChatIcon style={{ color: 'var(--primary-main)', fontSize: '20px' }} />
                                ) : notif.type === 'group_chat' ? (
                                  <GroupsIcon style={{ color: 'var(--primary-main)', fontSize: '20px' }} />
                                ) : notif.type === 'comment' || notif.type === 'reply' ? (
                                  <ChatIcon style={{ color: 'var(--primary-main)', fontSize: '20px' }} />
                                ) : (
                                  <NotificationsIcon style={{ color: 'var(--text-secondary)', fontSize: '20px' }} />
                                )}
                              </Box>
                              <ListItemText
                                primary={
                                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                                    <Typography variant="subtitle2" style={{ fontWeight: notif.isRead ? 600 : 800, color: 'var(--text-primary)', fontSize: '13px' }}>
                                      {notif.type === 'chat' && notif.originalIds?.length > 1 ? 'New Chat Messages' : notif.type === 'group_chat' && notif.originalIds?.length > 1 ? 'New Group Messages' : notif.title}
                                    </Typography>
                                    <Typography variant="caption" style={{ color: 'var(--text-secondary)', fontSize: '9px', whiteSpace: 'nowrap' }}>
                                      {formatLogTime(notif.createdAt)}
                                    </Typography>
                                  </Box>
                                }
                                secondary={
                                  <Typography variant="body2" style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '4px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                                    {notif.message}
                                  </Typography>
                                }
                              />
                            </ListItemButton>
                          </ListItem>
                        ))
                      )}
                    </List>
                  </Popover>
                </>
              )}
            </div>
          </header>
        )}

        <section className="nav-content">
          <AnimatePresence mode="wait">
            <Routes location={location} key={getRouteKey(location.pathname)}>
              <Route element={<ProtectedRoute allowedRoles={[1, 3]} />}>
                <Route path="/" element={<AnimatedPage><AdminDashboardPage /></AnimatedPage>} />
              </Route>
              <Route path="/courses" element={<AnimatedPage><LearningPage /></AnimatedPage>} />
              <Route path="/labs" element={<AnimatedPage><LabsPage /></AnimatedPage>} />
              <Route path="/challenge" element={<AnimatedPage><ChallengePage /></AnimatedPage>} />
              <Route path="/profile" element={<AnimatedPage><ProfilePage /></AnimatedPage>} />
              <Route path="/achievements" element={<AnimatedPage><AchievementsPage /></AnimatedPage>} />
              <Route path="/chats" element={<AnimatedPage><ChatListPage /></AnimatedPage>} />


              <Route path="/chat/:userId" element={<AnimatedPage><ChatPage /></AnimatedPage>} />
              <Route path="/group/:groupId" element={<AnimatedPage><GroupChatPage /></AnimatedPage>} />
              <Route path="/communities" element={<AnimatedPage><CommunityListPage /></AnimatedPage>} />
              <Route path="/communities/:communityId" element={<AnimatedPage><CommunityDetailPage /></AnimatedPage>} />
              <Route path="/communities/:communityId/room/:roomId" element={<AnimatedPage><CommunityDetailPage /></AnimatedPage>} />
              <Route path="/communities/:communityId/room/:roomId/question/:questionId" element={<AnimatedPage><QuestionDetailPage /></AnimatedPage>} />
              <Route path="/settings" element={<AnimatedPage><SettingsPage /></AnimatedPage>} />

              <Route path="/course/:courseId" element={<AnimatedPage><CourseDetailPage /></AnimatedPage>} />
              <Route path="/learning-path/:courseId" element={<AnimatedPage><LearningPathPage /></AnimatedPage>} />

              <Route path="/quiz/:courseDomain/:lessonId" element={<AnimatedPage><QuizPage /></AnimatedPage>} />
              <Route path="/learning/:courseId/:sectionId/:lessonId" element={<AnimatedPage><LearningContentPage /></AnimatedPage>} />
              <Route path="/philosophy-lab" element={<AnimatedPage><PhilosophyLabPage /></AnimatedPage>} />
              <Route path="/cyber-lab" element={<AnimatedPage><CyberLabPage /></AnimatedPage>} />
              <Route path="/security-challenges" element={<AnimatedPage><SecurityChallenges /></AnimatedPage>} />
              <Route path="/communities/join-invite/:communityId" element={<AnimatedPage><JoinInviteHandler /></AnimatedPage>} />
              <Route path="/group/join/:token" element={<AnimatedPage><GroupJoinLinkHandler /></AnimatedPage>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </section>
      </main>

      {/* Onboarding Tutorial Spotlight and Tooltips */}
      {renderTutorialOverlay()}
      {renderTutorialSpotlight()}
      {renderTutorialTooltip()}
    </Box>
  );
};

const JoinInviteHandler = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const join = async () => {
      try {
        let decodedId = communityId;
        // Decode secure salted checksum hash with fallback to old XOR base36 for backward compatibility
        if (isNaN(Number(communityId))) {
          if (communityId.includes('-')) {
            const parts = communityId.split('-');
            if (parts.length >= 3) {
              const [mainPart, checksumPart1, checksumPart2] = parts;
              const salted = parseInt(mainPart, 36);
              const id = Math.round((salted - 27182818284) / 31415926535);

              let hash1 = 0;
              let hash2 = 0;
              const str = String(id) + "SophiaSecretSaltSuperLong123!";
              for (let i = 0; i < str.length; i++) {
                hash1 = (hash1 << 5) - hash1 + str.charCodeAt(i);
                hash1 |= 0;
                hash2 = (hash2 << 7) - hash2 + str.charCodeAt(i) * 17;
                hash2 |= 0;
              }
              const expectedChecksum1 = Math.abs(hash1).toString(36);
              const expectedChecksum2 = Math.abs(hash2).toString(36);

              if (checksumPart1 === expectedChecksum1 && checksumPart2 === expectedChecksum2) {
                decodedId = id;
              } else {
                console.error("Invalid invite double checksum!");
                navigate('/communities');
                return;
              }
            } else {
              const [mainPart, checksumPart] = parts;
              const salted = parseInt(mainPart, 36);
              const id = Math.round((salted - 271828) / 314159);

              let hash = 0;
              const str = String(id) + "SophiaSecretSalt123!";
              for (let i = 0; i < str.length; i++) {
                hash = (hash << 5) - hash + str.charCodeAt(i);
                hash |= 0;
              }
              const expectedChecksum = Math.abs(hash).toString(36);
              if (checksumPart === expectedChecksum) {
                decodedId = id;
              } else {
                console.error("Invalid invite checksum!");
                navigate('/communities');
                return;
              }
            }
          } else {
            const xor = parseInt(communityId, 36);
            if (!isNaN(xor)) {
              decodedId = xor ^ 98213;
            }
          }
        }
        await socialStore.joinCommunityByInvite(decodedId);
        navigate(`/communities/${decodedId}`);
      } catch (e) {
        console.error(e);
        navigate('/communities');
      }
    };
    join();
  }, [communityId, navigate]);

  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography>Joining community via invite link...</Typography>
    </Box>
  );
};


export default NavigationPage;
