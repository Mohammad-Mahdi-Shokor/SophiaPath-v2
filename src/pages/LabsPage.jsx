import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Chip,
  Paper,
  TextField,
  Typography,
  IconButton} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CodeIcon from '@mui/icons-material/Code';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { ArrowOutward as ArrowOutwardIcon } from '@mui/icons-material';
// Lucide icons for high-tech premium representation of individual labs
import {
  Code,
  Database,
  Terminal,
  Globe,
  KeyRound,
  Lock,
  User,
  UserX,
  Activity,
  Wrench,
  Brain,
  HelpCircle,
  Ship,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './LearningPage.css'; // Reuse the excellent glassmorphic dashboard styles

// Import the existing high-fidelity dialog components
import { CppPlaygroundDialog } from '../components/CppPlaygroundDialog';
import { JavaOopUmlPlayground } from '../components/JavaOopUmlPlayground';
import { SoftwareEngineeringLab } from '../components/SoftwareEngineeringLab';

const labsData = [
  {
    title: "Computer Science",
    description: "Dive into low-level runtime execution systems, standard terminal compilation, and object-oriented class diagrams.",
    category: "Computer Science",
    iconKey: "cs",
    labsCount: 3,
    labs: [
      {
        id: 'cpp',
        title: 'C++ Playground',
        description: 'Write, compile, and run C++ code with simulated standard terminal outputs and OOP templates.',
        path: 'dialog:cpp',
        iconName: 'terminal'
      },
      {
        id: 'java-uml',
        title: 'Java-UML Playground',
        description: 'Write Java classes and see them rendered into inheritance and relationship structures in real time.',
        path: 'dialog:java-uml',
        iconName: 'activity'
      },
      {
        id: 'swe-diagrams',
        title: 'Software Engineering Lab',
        description: 'Design ER Diagrams, Use Cases, Sequence Diagrams, and Gantt charts with a live visualizer.',
        path: 'dialog:swe-diagrams',
        iconName: 'wrench'
      }
    ]
  },
  {
    title: "Cybersecurity",
    description: "Launch direct penetration testing suites, exploit simulation tools, and defensive network monitors.",
    category: "Security",
    iconKey: "security",
    labsCount: 11,
    labs: []
  },
  {
    title: "Philosophy",
    description: "Engage with Socrates AI dialogue systems, investigate fallacy matchers, and resolve classical paradoxes.",
    category: "Humanities",
    iconKey: "philosophy",
    labsCount: 7,
    labs: []
  }
];

const SEARCHABLE_LABS = [
  // Computer Science
  {
    id: 'cpp',
    title: 'C++ Playground',
    description: 'Write, compile, and run C++ code with simulated standard terminal outputs and OOP templates.',
    path: 'dialog:cpp',
    iconName: 'terminal',
    labCategoryTitle: 'Computer Science',
    category: 'Computer Science'
  },
  {
    id: 'java-uml',
    title: 'Java-UML Playground',
    description: 'Write Java classes and see them rendered into inheritance and relationship structures in real time.',
    path: 'dialog:java-uml',
    iconName: 'activity',
    labCategoryTitle: 'Computer Science',
    category: 'Computer Science'
  },
  {
    id: 'swe-diagrams',
    title: 'Software Engineering Lab',
    description: 'Design ER Diagrams, Use Cases, Sequence Diagrams, and Gantt charts with a live visualizer.',
    path: 'dialog:swe-diagrams',
    iconName: 'wrench',
    labCategoryTitle: 'Computer Science',
    category: 'Computer Science'
  },
  // Cybersecurity
  {
    id: 'xss',
    title: 'Cross-Site Scripting (Stored XSS)',
    description: 'Simulate Stored, Reflected, and DOM-based script injections on web input forms and apply sanitization guards.',
    path: '/cyber-lab?tab=xss',
    iconName: 'code',
    labCategoryTitle: 'Cybersecurity',
    category: 'Security'
  },
  {
    id: 'sqli',
    title: 'SQL Injection (SQLi) Vulnerability',
    description: 'Execute database query bypasses to extract mock administrator credentials and implement parameterized queries.',
    path: '/cyber-lab?tab=sqli',
    iconName: 'database',
    labCategoryTitle: 'Cybersecurity',
    category: 'Security'
  },
  {
    id: 'cmd',
    title: 'Remote Command Injection',
    description: 'Exploit unvalidated OS shell commands via network forms. Master strict whitelist inputs and character escaping.',
    path: '/cyber-lab?tab=cmd',
    iconName: 'terminal',
    labCategoryTitle: 'Cybersecurity',
    category: 'Security'
  },
  {
    id: 'csrf',
    title: 'Cross-Site Request Forgery (CSRF)',
    description: 'Forge cross-site transfer requests and deploy anti-CSRF token parameters to protect endpoints.',
    path: '/cyber-lab?tab=csrf',
    iconName: 'globe',
    labCategoryTitle: 'Cybersecurity',
    category: 'Security'
  },
  {
    id: 'auth',
    title: 'Broken Access Control (IDOR)',
    description: 'Manipulate URL resource identifiers to bypass access authorization and review unauthorized records.',
    path: '/cyber-lab?tab=auth',
    iconName: 'key',
    labCategoryTitle: 'Cybersecurity',
    category: 'Security'
  },
  {
    id: 'ransomware',
    title: 'Ransomware Threat Simulator',
    description: 'Simulate file encryption payloads, study symmetric key exchanges, and analyze shadow volume recovery.',
    path: '/cyber-lab?tab=ransomware',
    iconName: 'lock',
    labCategoryTitle: 'Cybersecurity',
    category: 'Security'
  },
  {
    id: 'social',
    title: 'Social Engineering Attack Vector',
    description: 'Analyze email headers for phishing indicators, trace domain spoofing, and identify human exploitation vectors.',
    path: '/cyber-lab?tab=social',
    iconName: 'user',
    labCategoryTitle: 'Cybersecurity',
    category: 'Security'
  },
  {
    id: 'insider',
    title: 'Insider Threat Audit Trail',
    description: 'Monitor system logs to identify unauthorized exfiltration surges and privilege escalation patterns.',
    path: '/cyber-lab?tab=insider',
    iconName: 'userx',
    labCategoryTitle: 'Cybersecurity',
    category: 'Security'
  },
  {
    id: 'dos',
    title: 'Single-Source DoS Stress Tester',
    description: 'Simulate connection floods and stress-test mock target servers to analyze resource exhaustion.',
    path: '/cyber-lab?tab=dos',
    iconName: 'activity',
    labCategoryTitle: 'Cybersecurity',
    category: 'Security'
  },
  {
    id: 'ddos',
    title: 'Distributed Botnet DDoS Defense',
    description: 'Coordinate botnet TCP SYN floods. Deploy rate-limiting firewalls and CDN request filters to mitigate attacks.',
    path: '/cyber-lab?tab=ddos',
    iconName: 'activity',
    labCategoryTitle: 'Cybersecurity',
    category: 'Security'
  },
  {
    id: 'cyberchef',
    title: 'GCHQ CyberChef Tool Suite',
    description: 'Directly invoke GCHQ\'s CyberChef utility kitchen to perform data carving and hex decoding recipes.',
    path: '/cyber-lab?tab=cyberchef',
    iconName: 'wrench',
    labCategoryTitle: 'Cybersecurity',
    category: 'Security'
  },
  {
    id: 'security-challenges',
    title: 'Interactive Security Challenges',
    description: 'Exploit live Reflected XSS, SQL Injection, and Broken Access Control targets connected to a live PostgreSQL database and get AI-evaluated reports.',
    path: '/security-challenges',
    iconName: 'lock',
    labCategoryTitle: 'Cybersecurity',
    category: 'Security'
  },
  // Philosophy
  {
    id: 'dialogue',
    title: 'Socrates AI Cognitive Dialogue',
    description: 'Engage with the Socrates AI agent to challenge cognitive biases, examine logical contradictions, and refine ethical definitions.',
    path: '/philosophy-lab?tab=0',
    iconName: 'brain',
    labCategoryTitle: 'Philosophy',
    category: 'Humanities'
  },
  {
    id: 'fallacy',
    title: 'Cognitive Fallacy Matcher',
    description: 'Analyze real-world arguments, identify logical fallacies, and map them to their correct classical definitions.',
    path: '/philosophy-lab?tab=1',
    iconName: 'help',
    labCategoryTitle: 'Philosophy',
    category: 'Humanities'
  },
  {
    id: 'theseus',
    title: 'Identity Paradox: Ship of Theseus',
    description: 'Experiment with identity paradoxes. Replace physical components and analyze the continuity of identity over time.',
    path: '/philosophy-lab?tab=2',
    iconName: 'ship',
    labCategoryTitle: 'Philosophy',
    category: 'Humanities'
  },
  {
    id: 'trolley',
    title: 'Trolley Dilemma Matrix',
    description: 'Evaluate classic moral dilemmas under utilitarianism, deontology, and virtue ethics with live decision matrices.',
    path: '/philosophy-lab?tab=3',
    iconName: 'compass',
    labCategoryTitle: 'Philosophy',
    category: 'Humanities'
  },
  {
    id: 'cave',
    title: "Allegory of Forms: Plato's Cave",
    description: 'Journey from sensory shadows to objective enlightenment. Explore classical epistemological models in an interactive format.',
    path: '/philosophy-lab?tab=4',
    iconName: 'brain',
    labCategoryTitle: 'Philosophy',
    category: 'Humanities'
  },
  {
    id: 'political',
    title: 'Geopolitical Compass',
    description: 'Map socio-economic ideological axes and explore political theory on a formal two-dimensional grid.',
    path: '/philosophy-lab?tab=5',
    iconName: 'compass',
    labCategoryTitle: 'Philosophy',
    category: 'Humanities'
  },
  {
    id: 'religions',
    title: 'Religion Tree Map',
    description: 'Explore the historical relationships, lineages, and core beliefs of major faith traditions in an interactive tree.',
    path: '/philosophy-lab?tab=6',
    iconName: 'compass',
    labCategoryTitle: 'Philosophy',
    category: 'Humanities'
  }
];

const getLabIcon = (iconName) => {
  switch (iconName) {
    case 'code':
      return <Code size={24} />;
    case 'database':
      return <Database size={24} />;
    case 'terminal':
      return <Terminal size={24} />;
    case 'globe':
      return <Globe size={24} />;
    case 'key':
      return <KeyRound size={24} />;
    case 'lock':
      return <Lock size={24} />;
    case 'user':
      return <User size={24} />;
    case 'userx':
      return <UserX size={24} />;
    case 'activity':
      return <Activity size={24} />;
    case 'wrench':
      return <Wrench size={24} />;
    case 'brain':
      return <Brain size={24} />;
    case 'help':
      return <HelpCircle size={24} />;
    case 'ship':
      return <Ship size={24} />;
    case 'compass':
      return <Compass size={24} />;
    default:
      return <Code size={24} />;
  }
};

const getLabGroupIcon = (iconKey) => {
  switch (iconKey) {
    case 'cs':
      return <CodeIcon />;
    case 'security':
      return <SecurityIcon />;
    case 'philosophy':
      return <PsychologyIcon />;
    default:
      return <CodeIcon />;
  }
};

const LabsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  // Dialog States
  const [isCppOpen, setIsCppOpen] = useState(false);
  const [isJavaUmlOpen, setIsJavaUmlOpen] = useState(false);
  const [isSweOpen, setIsSweOpen] = useState(false);

  // Read URL query parameter for active lab to ensure persistence on refresh
  const [selectedLabGroup, setSelectedLabGroup] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const labParam = params.get('lab');
    if (labParam === 'Philosophy' || labParam === 'Cybersecurity') {
      return null;
    }
    return labParam || null;
  });

  const categories = ['All', 'Computer Science', 'Security', 'Humanities'];

  const handleSelectLabGroup = (name) => {
    if (name === 'Philosophy') {
      navigate('/philosophy-lab');
      return;
    }
    if (name === 'Cybersecurity') {
      navigate('/cyber-lab');
      return;
    }

    setSelectedLabGroup(name);
    const params = new URLSearchParams(window.location.search);
    if (name) {
      params.set('lab', name);
    } else {
      params.delete('lab');
    }
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.pushState(null, '', newUrl);
  };

  // Get active selected lab object (only CS supports drill-down now)
  const activeLabGroupObj = useMemo(() => {
    if (!selectedLabGroup) return null;
    return labsData.find(c => c.title.toLowerCase() === selectedLabGroup.toLowerCase()) || null;
  }, [selectedLabGroup]);

  // Compute all matching labs (for search query or category filter)
  const filteredLabsAcrossAll = useMemo(() => {
    return SEARCHABLE_LABS.filter(lab => {
      const matchesSearch =
        lab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        activeCategory === 'All' ||
        lab.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const handleLabClick = (path) => {
    if (path === 'dialog:cpp') {
      setIsCppOpen(true);
    } else if (path === 'dialog:java-uml') {
      setIsJavaUmlOpen(true);
    } else if (path === 'dialog:swe-diagrams') {
      setIsSweOpen(true);
    } else {
      navigate(path);
    }
  };

  const isSearchingOrFiltering = searchQuery.trim() !== '' || activeCategory !== 'All';

  return (
    <Box className="learning-page">
      <section className="learning-intro glass-panel-strong">
        <div className="learning-intro-copy">
          <div className="learning-intro-search">
            <TextField
              fullWidth
              placeholder="Search labs, ciphers, or mechanics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="learning-search-field"
              InputProps={{
                startAdornment: <SearchIcon className="learning-search-icon" />}}
            />
          </div>

          <div className="learning-category-row">
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                onClick={() => {
                  setActiveCategory(category);
                  handleSelectLabGroup(null);
                }}
                className={`learning-category-chip ${activeCategory === category ? 'is-active' : ''}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* RENDER VIEWS WITH SMOOTH MOTION TRANSITIONS */}
      <AnimatePresence mode="wait">
        {activeLabGroupObj && !isSearchingOrFiltering ? (
          /* COMPUTER SCIENCE LAB DETAIL MODE */
          <motion.div
            key="cs-detail-mode"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Back Button is now inside the animated card container to transition smoothly */}
            <Box style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
              <IconButton
                onClick={() => handleSelectLabGroup(null)}
                style={{
                  color: 'var(--text-primary)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  marginRight: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="body1" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                Back to Labs
              </Typography>
            </Box>

            <section className="learning-section">
              <div className="learning-course-grid">
                {activeLabGroupObj.labs.map((lab) => (
                  <Paper
                    key={lab.id}
                    className="learning-course-card glass-panel lab-card"
                    elevation={0}
                    onClick={() => handleLabClick(lab.path)}
                  >
                    <ArrowOutwardIcon className="learning-course-arrow" />
                    <div className="learning-course-card-top">
                      <div className="learning-course-icon">
                        {getLabIcon(lab.iconName)}
                      </div>
                    </div>

                    <Typography variant="h5" className="learning-course-title">
                      {lab.title}
                    </Typography>
                    <Typography variant="body2" className="learning-course-description">
                      {lab.description}
                    </Typography>
                    <div className="cyber-badge" style={{
                      background: 'color-mix(in srgb, var(--primary-main) 12%, transparent)',
                      color: 'var(--primary-main)',
                      border: '1px solid color-mix(in srgb, var(--primary-main) 22%, transparent)'
                    }}>
                      {activeLabGroupObj.category}
                    </div>
                  </Paper>
                ))}
              </div>
            </section>
          </motion.div>
        ) : isSearchingOrFiltering ? (
          /* SEARCH & FILTER GLOBAL MODE */
          <motion.div
            key="search-filter-mode"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <section className="learning-section">
              <div className="learning-section-head" style={{ alignItems: 'flex-start', textAlign: 'left', marginBottom: '24px' }}>
                <div>
                  <Typography variant="h4" className="learning-section-title" style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>
                    Search Results ({filteredLabsAcrossAll.length})
                  </Typography>
                  <Typography variant="body1" className="learning-section-copy" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Showing matching interactive tools and sandboxes across all domains.
                  </Typography>
                </div>
              </div>

              {filteredLabsAcrossAll.length > 0 ? (
                <div className="learning-course-grid">
                  {filteredLabsAcrossAll.map((lab) => (
                    <Paper
                      key={lab.id}
                      className="learning-course-card glass-panel lab-card"
                      elevation={0}
                      onClick={() => handleLabClick(lab.path)}
                    >
                      <ArrowOutwardIcon className="learning-course-arrow" />
                      <div className="learning-course-card-top">
                        <div className="learning-course-icon">
                          {getLabIcon(lab.iconName)}
                        </div>
                      </div>

                      <Typography variant="h5" className="learning-course-title">
                        {lab.title}
                      </Typography>
                      <Typography variant="body2" className="learning-course-description" style={{ color: 'var(--text-secondary)' }}>
                        {lab.description}
                      </Typography>
                      <div className="cyber-badge" style={{
                        background: 'color-mix(in srgb, var(--primary-main) 12%, transparent)',
                        color: 'var(--primary-main)',
                        border: '1px solid color-mix(in srgb, var(--primary-main) 22%, transparent)'
                      }}>
                        {lab.labCategoryTitle}
                      </div>
                    </Paper>
                  ))}
                </div>
              ) : (
                <Paper className="learning-empty-state glass-panel" elevation={0} style={{ width: '100%', padding: '40px', textAlign: 'center' }}>
                  <Typography variant="h6">No interactive labs found for your search query.</Typography>
                  <Typography variant="body2" style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Try typing a different keyword or resetting your filter category chips.
                  </Typography>
                </Paper>
              )}
            </section>
          </motion.div>
        ) : (
          /* LABS LANDING MODE (CS, Cyber, Philosophy cards) */
          <motion.div
            key="labs-landing-mode"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <section className="learning-section">
              <div className="learning-course-grid">
                {labsData.map((col) => (
                  <Paper
                    key={col.title}
                    className="learning-course-card glass-panel lab-card"
                    elevation={0}
                    onClick={() => handleSelectLabGroup(col.title)}
                    style={{ cursor: 'pointer' }}
                  >
                    <ArrowOutwardIcon className="learning-course-arrow" />
                    <div className="learning-course-card-top">
                      <div className="learning-course-icon" style={{ background: 'rgba(28, 176, 246, 0.1)', color: 'var(--primary-main)' }}>
                        {getLabGroupIcon(col.iconKey)}
                      </div>
                    </div>

                    <Typography variant="h5" className="learning-course-title">
                      {col.title}
                    </Typography>
                    <Typography variant="body2" className="learning-course-description">
                      {col.description}
                    </Typography>
                    <div className="cyber-badge" style={{
                      background: 'color-mix(in srgb, var(--primary-main) 12%, transparent)',
                      color: 'var(--primary-main)',
                      border: '1px solid color-mix(in srgb, var(--primary-main) 22%, transparent)'
                    }}>
                      {col.labsCount} {col.title === 'Computer Science' ? 'Playgrounds' : 'Labs'}
                    </div>
                  </Paper>
                ))}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER THE HIGH-FIDELITY BUILT-IN PLAYGROUND DIALOGS */}
      <CppPlaygroundDialog
        open={isCppOpen}
        onClose={() => setIsCppOpen(false)}
        initialCode={`#include <iostream>\n\nint main() {\n    std::cout << "Hello SophiaPath C++!" << std::endl;\n    return 0;\n}`}
      />

      <JavaOopUmlPlayground
        open={isJavaUmlOpen}
        onClose={() => setIsJavaUmlOpen(false)}
        initialCode={`public class Person {\n    private String name;\n    private int age;\n    \n    public void speak() {\n        System.out.println("Hello!");\n    }\n}\n\npublic class Student extends Person {\n    private String studentId;\n    private double gpa;\n}`}
      />

      <SoftwareEngineeringLab
        open={isSweOpen}
        onClose={() => setIsSweOpen(false)}
      />
    </Box>
  );
};

export default LabsPage;
