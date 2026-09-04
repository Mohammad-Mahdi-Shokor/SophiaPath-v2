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
  Compass,
  GitBranch,
  Calendar,
  Layers
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
    description: "Dive into runtime compiler execution systems, object-oriented UML class diagrams, and software engineering modeling architectures.",
    category: "Computer Science",
    iconKey: "cs",
    labsCount: 7,
    labs: [
      {
        id: 'cpp',
        title: 'C++ Playground',
        description: 'Write, compile, and run C++ code with simulated standard terminal outputs, memory inspection, and runtime tracing.',
        path: 'dialog:cpp',
        iconName: 'terminal',
        course: 'C++ Basics'
      },
      {
        id: 'java-uml',
        title: 'Java OOP & UML Diagram Lab',
        description: 'Write Java classes and see them rendered into inheritance, method signatures, and class relationship structures in real time.',
        path: 'dialog:java-uml',
        iconName: 'layers',
        course: 'OOP'
      },
      {
        id: 'swe-er',
        title: 'ER Diagram Modeler',
        description: 'Design entity-relationship schemas, primary/foreign keys, and cardinalities with automated layout algorithms.',
        path: 'dialog:swe:er',
        iconName: 'database',
        course: 'Software Engineering'
      },
      {
        id: 'swe-usecase',
        title: 'Use Case Diagram Lab',
        description: 'Model system boundaries, actors, use cases, include/extend relationships, and user interactions.',
        path: 'dialog:swe:usecase',
        iconName: 'user',
        course: 'Software Engineering'
      },
      {
        id: 'swe-activity',
        title: 'Activity Diagram & Flow Lab',
        description: 'Construct control flow graphs, swimlanes, decision diamonds, fork/join branches, and step through workflow simulations.',
        path: 'dialog:swe:activity',
        iconName: 'branch',
        course: 'Software Engineering'
      },
      {
        id: 'swe-sequence',
        title: 'Sequence Diagram Modeler',
        description: 'Trace object lifelines, asynchronous/synchronous messages, activation boxes, and system interaction sequences.',
        path: 'dialog:swe:sequence',
        iconName: 'code',
        course: 'Software Engineering'
      },
      {
        id: 'swe-gantt',
        title: 'Gantt Chart & Scrum Scheduler',
        description: 'Schedule project milestones, sprint tasks, critical paths, and duration timelines with interactive visual controls.',
        path: 'dialog:swe:gantt',
        iconName: 'calendar',
        course: 'Software Engineering'
      }
    ]
  },
  {
    title: "Cybersecurity",
    description: "Launch direct penetration testing suites, exploit simulation tools, and defensive network monitors.",
    category: "Security",
    iconKey: "security",
    labsCount: 22,
    labs: []
  }
];

const SEARCHABLE_LABS = [
  // Computer Science
  {
    id: 'cpp',
    title: 'C++ Playground',
    description: 'Write, compile, and run C++ code with simulated standard terminal outputs, memory inspection, and runtime tracing.',
    path: 'dialog:cpp',
    iconName: 'terminal',
    course: 'C++ Basics',
    labCategoryTitle: 'Computer Science',
    category: 'Computer Science'
  },
  {
    id: 'java-uml',
    title: 'Java OOP & UML Diagram Lab',
    description: 'Write Java classes and see them rendered into inheritance, method signatures, and class relationship structures in real time.',
    path: 'dialog:java-uml',
    iconName: 'layers',
    course: 'OOP',
    labCategoryTitle: 'Computer Science',
    category: 'Computer Science'
  },
  {
    id: 'swe-er',
    title: 'ER Diagram Modeler',
    description: 'Design entity-relationship schemas, primary/foreign keys, and cardinalities with automated layout algorithms.',
    path: 'dialog:swe:er',
    iconName: 'database',
    course: 'Software Engineering',
    labCategoryTitle: 'Computer Science',
    category: 'Computer Science'
  },
  {
    id: 'swe-usecase',
    title: 'Use Case Diagram Lab',
    description: 'Model system boundaries, actors, use cases, include/extend relationships, and user interactions.',
    path: 'dialog:swe:usecase',
    iconName: 'user',
    course: 'Software Engineering',
    labCategoryTitle: 'Computer Science',
    category: 'Computer Science'
  },
  {
    id: 'swe-activity',
    title: 'Activity Diagram & Flow Lab',
    description: 'Construct control flow graphs, swimlanes, decision diamonds, fork/join branches, and step through workflow simulations.',
    path: 'dialog:swe:activity',
    iconName: 'branch',
    course: 'Software Engineering',
    labCategoryTitle: 'Computer Science',
    category: 'Computer Science'
  },
  {
    id: 'swe-sequence',
    title: 'Sequence Diagram Modeler',
    description: 'Trace object lifelines, asynchronous/synchronous messages, activation boxes, and system interaction sequences.',
    path: 'dialog:swe:sequence',
    iconName: 'code',
    course: 'Software Engineering',
    labCategoryTitle: 'Computer Science',
    category: 'Computer Science'
  },
  {
    id: 'swe-gantt',
    title: 'Gantt Chart & Scrum Scheduler',
    description: 'Schedule project milestones, sprint tasks, critical paths, and duration timelines with interactive visual controls.',
    path: 'dialog:swe:gantt',
    iconName: 'calendar',
    course: 'Software Engineering',
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
    id: 'caesar',
    title: 'Caesar Cipher Explorer',
    description: 'Interactive visualization of rotational Caesar cipher shifts, encryption tables, and frequency analysis.',
    path: '/cyber-lab?tab=caesar',
    iconName: 'lock',
    labCategoryTitle: 'Cybersecurity',
    category: 'Security'
  },
  {
    id: 'vigenere',
    title: 'Vigenère Cipher Explorer',
    description: 'Polyalphabetic substitution cipher matrix visualizer with dynamic keyword repeating shifts.',
    path: '/cyber-lab?tab=vigenere',
    iconName: 'lock',
    labCategoryTitle: 'Cybersecurity',
    category: 'Security'
  },
  {
    id: 'enigma',
    title: 'Enigma Machine Simulator',
    description: 'Full simulation of WWII military Enigma rotors, reflector stepping mechanics, and plugboard cross-wiring.',
    path: '/cyber-lab?tab=enigma',
    iconName: 'lock',
    labCategoryTitle: 'Cybersecurity',
    category: 'Security'
  },
  {
    id: 'rsa',
    title: 'RSA Asymmetric Key Visualizer',
    description: 'Prime factorization, modular exponentiation, public/private keypair computation, and payload encryption.',
    path: '/cyber-lab?tab=rsa',
    iconName: 'lock',
    labCategoryTitle: 'Cybersecurity',
    category: 'Security'
  },
  {
    id: 'base64',
    title: 'Base64 Encoding Visualizer',
    description: 'Step-by-step binary bit-grouping (6-bit chunking) and ASCII-to-Base64 radix table translation.',
    path: '/cyber-lab?tab=base64',
    iconName: 'activity',
    labCategoryTitle: 'Cybersecurity',
    category: 'Security'
  },
  {
    id: 'xor',
    title: 'Bitwise XOR Cipher Visualizer',
    description: 'Inspect bitwise truth tables, byte-level XOR keystream operations, and reversible cipher logic.',
    path: '/cyber-lab?tab=xor',
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
    id: 'gtfobins',
    title: 'GTFOBins Privilege Escalation',
    description: 'Curated list of Unix binaries used to bypass local security restrictions in misconfigured systems.',
    path: '/cyber-lab?tab=gtfobins',
    iconName: 'terminal',
    labCategoryTitle: 'Cybersecurity',
    category: 'Security'
  },
  {
    id: 'revshells',
    title: 'Reverse Shell Generator',
    description: 'Interactive one-liner generator for bash, python, nc, powershell, and socat reverse connections.',
    path: '/cyber-lab?tab=revshells',
    iconName: 'terminal',
    labCategoryTitle: 'Cybersecurity',
    category: 'Security'
  },
  {
    id: 'jwt',
    title: 'JWT Token Decoder & Debugger',
    description: 'Decode, verify, and inspect JSON Web Tokens headers, payloads, and digital signatures in real time.',
    path: '/cyber-lab?tab=jwt',
    iconName: 'key',
    labCategoryTitle: 'Cybersecurity',
    category: 'Security'
  },
  {
    id: 'explainshell',
    title: 'ExplainShell Command Breakdown',
    description: 'Interactive manual page analyzer that explains complex command-line syntax and flags argument-by-argument.',
    path: '/cyber-lab?tab=explainshell',
    iconName: 'terminal',
    labCategoryTitle: 'Cybersecurity',
    category: 'Security'
  },
  {
    id: 'challenge',
    title: 'Google XSS Game Sandbox',
    description: 'Interactive six-level real-world web exploitation challenge targeting reflected and stored XSS vectors.',
    path: '/cyber-lab?tab=challenge',
    iconName: 'activity',
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
];

const getLabIcon = (iconName, size = 48) => {
  switch (iconName) {
    case 'code':
      return <Code size={size} />;
    case 'database':
      return <Database size={size} />;
    case 'terminal':
      return <Terminal size={size} />;
    case 'globe':
      return <Globe size={size} />;
    case 'key':
      return <KeyRound size={size} />;
    case 'lock':
      return <Lock size={size} />;
    case 'user':
      return <User size={size} />;
    case 'userx':
      return <UserX size={size} />;
    case 'activity':
      return <Activity size={size} />;
    case 'wrench':
      return <Wrench size={size} />;
    case 'brain':
      return <Brain size={size} />;
    case 'help':
      return <HelpCircle size={size} />;
    case 'ship':
      return <Ship size={size} />;
    case 'compass':
      return <Compass size={size} />;
    case 'branch':
      return <GitBranch size={size} />;
    case 'calendar':
      return <Calendar size={size} />;
    case 'layers':
      return <Layers size={size} />;
    default:
      return <Code size={size} />;
  }
};

const getLabGroupIcon = (iconKey) => {
  switch (iconKey) {
    case 'cs':
      return <CodeIcon style={{ fontSize: '2.4rem' }} />;
    case 'security':
      return <SecurityIcon style={{ fontSize: '2.4rem' }} />;
    default:
      return <CodeIcon style={{ fontSize: '2.4rem' }} />;
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
  const [sweInitialTab, setSweInitialTab] = useState('er');

  // Read URL query parameter for active lab to ensure persistence on refresh, defaulting to Computer Science
  const [selectedLabGroup, setSelectedLabGroup] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const labParam = params.get('lab');
    if (labParam === 'Philosophy' || labParam === 'Cybersecurity') {
      return null;
    }
    return labParam || 'Computer Science';
  });

  const categories = ['All', 'Software Engineering', 'C++ Basics', 'OOP'];

  const handleSelectLabGroup = (name) => {
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

  // Get active selected lab object (defaults to Computer Science)
  const activeLabGroupObj = useMemo(() => {
    return labsData.find(c => c.title.toLowerCase() === (selectedLabGroup || 'computer science').toLowerCase()) || labsData[0];
  }, [selectedLabGroup]);

  // Hide C++, Java/OOP, and Sequence diagram labs
  const isVisibleLab = (lab) => lab.id !== 'cpp' && lab.id !== 'java-uml' && lab.id !== 'swe-sequence';

  // Check if a specific lab is disabled
  const isLabDisabled = (lab) => lab.id === 'swe-er';

  // Compute all matching labs for active view (filters by search query)
  const displayedLabs = useMemo(() => {
    const baseLabs = (activeLabGroupObj?.labs || []).filter(isVisibleLab);
    return baseLabs.filter(lab => {
      const matchesSearch =
        !searchQuery.trim() ||
        lab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lab.description && lab.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSearch;
    });
  }, [activeLabGroupObj, searchQuery]);

  const handleLabClick = (path) => {
    if (path === 'dialog:cpp') {
      setIsCppOpen(true);
    } else if (path === 'dialog:java-uml') {
      setIsJavaUmlOpen(true);
    } else if (path.startsWith('dialog:swe:')) {
      const tab = path.replace('dialog:swe:', '');
      setSweInitialTab(tab);
      setIsSweOpen(true);
    } else if (path === 'dialog:swe-diagrams') {
      setSweInitialTab('er');
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
        </div>
      </section>

      {/* RENDER VIEWS WITH SMOOTH MOTION TRANSITIONS */}
      <AnimatePresence mode="wait">
        {activeLabGroupObj ? (
          /* COMPUTER SCIENCE LAB DETAIL MODE WITH LIVE SEARCH */
          <motion.div
            key="cs-detail-mode"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <section className="learning-section">
              {displayedLabs.length > 0 ? (
                <div className="learning-course-grid">
                  {displayedLabs.map((lab) => {
                    const disabled = isLabDisabled(lab);
                    return (
                      <Paper
                        key={lab.id}
                        className={`learning-course-card glass-panel lab-card ${disabled ? 'is-disabled' : ''}`}
                        elevation={0}
                        onClick={() => !disabled && handleLabClick(lab.path)}
                        style={disabled ? { opacity: 0.45, cursor: 'not-allowed' } : {}}
                      >
                        {!disabled && <ArrowOutwardIcon className="learning-course-arrow" />}
                        <div className="learning-course-card-top">
                          <div className="learning-course-icon" style={disabled ? { filter: 'grayscale(60%)' } : {}}>
                            {getLabIcon(lab.iconName, 48)}
                          </div>
                        </div>

                        <Typography variant="h5" className="learning-course-title" style={disabled ? { opacity: 0.8 } : {}}>
                          {lab.title}
                        </Typography>
                        <div className="cyber-badge" style={{
                          background: disabled ? 'rgba(255, 179, 0, 0.12)' : 'color-mix(in srgb, var(--primary-main) 12%, transparent)',
                          color: disabled ? '#ffb300' : 'var(--primary-main)',
                          border: `1px solid ${disabled ? 'rgba(255, 179, 0, 0.3)' : 'color-mix(in srgb, var(--primary-main) 22%, transparent)'}`,
                          letterSpacing: '0.04em'
                        }}>
                          {disabled ? 'Coming Soon' : (lab.course || activeLabGroupObj.category)}
                        </div>
                      </Paper>
                    );
                  })}
                </div>
              ) : (
                <Paper className="learning-empty-state glass-panel" elevation={0} style={{ width: '100%', padding: '40px', textAlign: 'center' }}>
                  <Typography variant="h6">No interactive labs found for your search query.</Typography>
                  <Typography variant="body2" style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Try typing a different keyword in the search bar.
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
                      {col.labsCount} {col.title === 'Computer Science' ? 'Labs & Playgrounds' : 'Labs'}
                    </div>
                  </Paper>
                ))}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER THE HIGH-FIDELITY BUILT-IN PLAYGROUND DIALOGS */}
      {isCppOpen && (
        <CppPlaygroundDialog
          open={isCppOpen}
          onClose={() => setIsCppOpen(false)}
          initialCode={`#include <iostream>\n\nint main() {\n    std::cout << "Hello SophiaPath C++!" << std::endl;\n    return 0;\n}`}
        />
      )}

      {isJavaUmlOpen && (
        <JavaOopUmlPlayground
          open={isJavaUmlOpen}
          onClose={() => setIsJavaUmlOpen(false)}
          initialCode={`public class Person {\n    private String name;\n    private int age;\n    \n    public void speak() {\n        System.out.println("Hello!");\n    }\n}\n\npublic class Student extends Person {\n    private String studentId;\n    private double gpa;\n}`}
        />
      )}

      {isSweOpen && (
        <SoftwareEngineeringLab
          open={isSweOpen}
          initialTab={sweInitialTab}
          hideDiagramSelector={true}
          onClose={() => setIsSweOpen(false)}
        />
      )}
    </Box>
  );
};

export default LabsPage;
