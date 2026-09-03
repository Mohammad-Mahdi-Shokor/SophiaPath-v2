import React, { useState, useEffect, useRef, useContext, useCallback, useDeferredValue, useMemo } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  useTheme,
  Typography,
  IconButton,
  Button,
  FormControl,
  Select,
  MenuItem,
  Alert,
  Tooltip,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  InputLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  useMediaQuery,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Visibility as PreviewIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  SkipNext as NextIcon,
  AltRoute as BranchIcon,
  CheckCircle as CheckCircleIcon,
  AccountTree as FlowIcon,
  AutoFixHigh as AutoFixHighIcon,
  AutoAwesome as AutoAwesomeIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import html2canvas from 'html2canvas';
import logoImg from '../assets/sp-logo.png';

// Comprehensive Default Templates for all Diagram Types in SophiaPath
// Designed with complete syntax specifications so users and AI models understand all DSL features.
const TEMPLATES = {
  activity: `// ========================================================
// SOPHIAPATH ACTIVITY DIAGRAM SPECIFICATION (DSL)
// ========================================================
// Keywords:
// - ACTIVITY <title> : Declares the workflow title
// - SWIMLANE <name> / PARTITION <name> : Defines a swimlane column
// - START <id> ["label"] : Initial node (🟢)
// - ACTION <id> ["label"] / STEP <id> ["label"] : Action state (🟦)
// - DECISION <id> ["label"] : Decision diamond (🔶)
// - FORK <id> ["label"] : Parallel execution split (══)
// - JOIN <id> ["label"] : Parallel execution merge (══)
// - END <id> ["label"] / FINAL <id> ["label"] : Final state (🎯)
// - <source> -> <target> [guard] : Transition with conditional badge
// - <source> -> <target> : Direct transition

ACTIVITY Student Enrollment & Course Access Workflow

SWIMLANE Student
START start_student "Start"
ACTION browse_courses "Browse Course Catalog"
ACTION select_course "Select Target Course"
ACTION submit_form "Submit Enrollment Form"
ACTION view_dashboard "Access Student Dashboard"
END end_student "Onboarding Complete"

SWIMLANE System
ACTION validate_input "Validate Input Data"
DECISION check_prereqs "Prerequisites Met?"
ACTION notify_missing "Notify Missing Prerequisites"
END end_rejected "Application Rejected"

FORK fork_provisioning "Parallel Provisioning"
ACTION create_records "Create DB & LMS Records"
ACTION generate_invoice "Generate Billing Invoice"
ACTION send_welcome "Send Welcome Email"
JOIN join_provisioning "Sync Provisioning"

ACTION activate_account "Activate Student Account"

// ── Student Lane Flow ──
start_student -> browse_courses
browse_courses -> select_course
select_course -> submit_form

// ── Cross-Lane to System Lane ──
submit_form -> validate_input
validate_input -> check_prereqs

// ── Decision Branches ──
check_prereqs -> notify_missing [No]
notify_missing -> end_rejected

check_prereqs -> fork_provisioning [Yes]

// ── Fork & Join (Parallel Processing) ──
fork_provisioning -> create_records
fork_provisioning -> generate_invoice
fork_provisioning -> send_welcome

create_records -> join_provisioning
generate_invoice -> join_provisioning
send_welcome -> join_provisioning

// ── Completion Flow ──
join_provisioning -> activate_account
activate_account -> view_dashboard
view_dashboard -> end_student`,

  er: `// ========================================================
// SOPHIAPATH ENTITY-RELATIONSHIP (ER) SPECIFICATION (DSL)
// ========================================================
// Keywords:
// - ENTITY <Name> : Declares an entity
// - ATTRIBUTES : Begins attribute field definitions
// - <attr_name> : <type> PRIMARY KEY : Primary key field (PK)
// - <attr_name> : <type> FOREIGN KEY : Foreign key field (FK)
// - <attr_name> : <type> : Standard attribute field
// - RELATIONSHIP <EntityA> <CardA> <Verb> <EntityB> <CardB>
//   - Cardinality: ONE or MANY (supports 1:1, 1:N, N:M)

ENTITY Student
ATTRIBUTES
  student_id : int PRIMARY KEY
  full_name : string
  email : string
  gpa : float
  enrollment_date : date

ENTITY Department
ATTRIBUTES
  dept_id : int PRIMARY KEY
  dept_name : string
  building : string
  budget : float

ENTITY Instructor
ATTRIBUTES
  instructor_id : int PRIMARY KEY
  dept_id : int FOREIGN KEY
  name : string
  office_number : string
  salary : float

ENTITY Course
ATTRIBUTES
  course_id : int PRIMARY KEY
  dept_id : int FOREIGN KEY
  title : string
  credits : int
  max_capacity : int

ENTITY Enrollment
ATTRIBUTES
  enrollment_id : int PRIMARY KEY
  student_id : int FOREIGN KEY
  course_id : int FOREIGN KEY
  semester : string
  grade : string

// ── Relationships & Cardinalities ──
// 1:N (One Department employs Many Instructors)
RELATIONSHIP Department ONE Employs Instructor MANY

// 1:N (One Department offers Many Courses)
RELATIONSHIP Department ONE Offers Course MANY

// 1:N (One Instructor teaches Many Courses)
RELATIONSHIP Instructor ONE Teaches Course MANY

// N:M (Many Students enroll in Many Courses via Enrollment associative entity)
RELATIONSHIP Student ONE Submits Enrollment MANY
RELATIONSHIP Course ONE Receives Enrollment MANY`,

  usecase: `SYSTEM University Application System

ACTOR Guest
ACTOR Student
ACTOR Instructor
ACTOR Admin

Student INHERITS Guest
Instructor INHERITS Guest
Admin INHERITS Guest

USE CASE Sign Up
USE CASE Login
USE CASE Edit Profile
USE CASE Register Courses
USE CASE View Grades
USE CASE Apply for Certificate
USE CASE Set Student Grades
USE CASE Review Certificate Applications
USE CASE Monitor System

Guest -> Sign Up
Guest -> Login

Student -> Edit Profile
Student -> Register Courses
Student -> View Grades
Student -> Apply for Certificate

Instructor -> Edit Profile
Instructor -> Set Student Grades

Admin -> Review Certificate Applications
Admin -> Monitor System
`,

  sequence: `// ========================================================
// SOPHIAPATH SEQUENCE DIAGRAM SPECIFICATION (DSL)
// ========================================================
// Keywords:
// - SEQUENCE <title> : Declares diagram title
// - PARTICIPANT <name> : Declares participant lifeline
// - <Src> sends <msg> to <Dest>. : Synchronous message call
// - <Src> requests <msg> from <Dest>. : Request message call
// - <Src> returns <msg> to <Dest>. : Return/reply message
// - <Src> displays <msg> to <Dest>. : UI render/display message
// - IF <condition> THEN ... ELSE ... END : Alternative execution blocks

SEQUENCE Student Course Enrollment & Payment Verification

PARTICIPANT Student
PARTICIPANT Web App
PARTICIPANT Auth Service
PARTICIPANT Course Service
PARTICIPANT Payment Gateway
PARTICIPANT Database

Student sends "Enter Login Credentials" to Web App.
Web App sends "Validate User & Token" to Auth Service.
Auth Service requests "User Record & Roles" from Database.
Database returns "User Record Valid".
Auth Service returns "JWT Session Token" to Web App.
Web App displays "Personalized Dashboard" to Student.

Student sends "Select Course & Click Enroll" to Web App.
Web App sends "Check Seat Availability" to Course Service.
Course Service requests "Current Roster Count" from Database.
Database returns "Available Seats: 12".

IF seats are available THEN
    Web App displays "Payment Checkout Modal" to Student.
    Student sends "Credit Card Details" to Web App.
    Web App sends "Process Charge($199)" to Payment Gateway.
    Payment Gateway requests "Bank Authorization" from Database.
    Payment Gateway returns "Payment Approved (TX_8849)".

    IF payment succeeds THEN
        Web App sends "Record Confirmed Enrollment" to Course Service.
        Course Service sends "Write Enrollment Record" to Database.
        Database returns "Record Created Successfully".
        Web App displays "Enrollment Successful & Course Unlocked" to Student.
    ELSE
        Web App displays "Payment Declined - Try Again" to Student.
    END
ELSE
    Web App displays "Course is Full - Join Waitlist" to Student.
END`,

  gantt: `// ========================================================
// SOPHIAPATH GANTT CHART SPECIFICATION (DSL)
// ========================================================
// Keywords:
// - GANTT <title> : Declares chart title
// - PROJECT <name> : Declares project phase section
// - TASK <name> : Declares a scheduled task
// - START <YYYY-MM-DD> : Task start date
// - END <YYYY-MM-DD> : Task end date
// - DEPENDS ON <task_name> : Predecessor dependency linking
// - MILESTONE <name> : Declares a zero-duration milestone
// - DATE <YYYY-MM-DD> : Milestone occurrence date

GANTT SophiaPath Platform Development Lifecycle

PROJECT Planning & Architecture
TASK Requirements Analysis
START 2026-07-01
END 2026-07-08

TASK System Architecture Design
START 2026-07-06
END 2026-07-16
DEPENDS ON Requirements Analysis

MILESTONE Architecture Sign-off
DATE 2026-07-16

PROJECT Core Engineering
TASK Database Schema & Migrations
START 2026-07-17
END 2026-07-28
DEPENDS ON System Architecture Design

TASK Backend REST APIs
START 2026-07-22
END 2026-08-14
DEPENDS ON Database Schema & Migrations

TASK Frontend UI Components
START 2026-07-25
END 2026-08-18
DEPENDS ON System Architecture Design

PROJECT Testing & Launch
TASK Security & Integration Testing
START 2026-08-15
END 2026-08-26
DEPENDS ON Backend REST APIs

TASK Production Deployment
START 2026-08-25
END 2026-08-30
DEPENDS ON Security & Integration Testing

MILESTONE Official Platform Launch
DATE 2026-08-31`
};

const AddEntityDialog = ({ open, onClose, onSubmit, existingEntityNames }) => {
  const [name, setName] = useState('');
  const [fields, setFields] = useState([{ name: '', type: 'int', key: '' }]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName('');
      setFields([{ name: '', type: 'int', key: '' }]);
      setError('');
    }
  }, [open]);

  const handleAddField = () => {
    setFields([...fields, { name: '', type: 'int', key: '' }]);
  };

  const handleRemoveField = (idx) => {
    const updated = [...fields];
    updated.splice(idx, 1);
    setFields(updated);
  };

  const handleFieldChange = (idx, key, val) => {
    const updated = [...fields];
    updated[idx][key] = val;
    setFields(updated);
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Entity name cannot be empty.');
      return;
    }
    if (/\s/.test(trimmedName)) {
      setError('Entity name cannot contain spaces.');
      return;
    }
    if (existingEntityNames.some(n => n.toLowerCase() === trimmedName.toLowerCase())) {
      setError(`An entity named "${trimmedName}" already exists.`);
      return;
    }

    const validFields = fields.filter(f => f.name.trim() !== '');
    if (validFields.length === 0) {
      setError('You must specify at least one attribute.');
      return;
    }

    const fieldNames = validFields.map(f => f.name.trim());
    if (new Set(fieldNames).size !== fieldNames.length) {
      setError('Attribute names must be unique.');
      return;
    }

    onSubmit(trimmedName, validFields);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          background: 'var(--background-paper)',
          border: '1px solid var(--divider)',
          color: 'var(--text-primary)',
          borderRadius: '16px',
          padding: '12px',
          maxWidth: '600px',
          width: '100%'}
      }}
    >
      <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--divider)', paddingBottom: '12px', color: 'var(--text-primary)' }}>
        ✨ Add New Entity
      </DialogTitle>
      <DialogContent style={{ marginTop: '16px' }}>
        {error && <Alert severity="error" style={{ marginBottom: '16px', borderRadius: '8px' }}>{error}</Alert>}

        <TextField
          fullWidth
          label="Entity Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Employee"
          variant="outlined"
          size="small"
          InputLabelProps={{ style: { color: 'var(--text-secondary)' } }}
          inputProps={{ style: { color: 'var(--text-primary)' } }}
          sx={{
            marginBottom: '24px',
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'var(--divider)' },
              '&:hover fieldset': { borderColor: 'var(--primary-main)' },
              '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' }}
          }}
        />

        <Typography variant="subtitle2" style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
          Attributes / Fields
        </Typography>

        <Box style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--divider)', borderRadius: '8px', background: 'rgba(0,0,0,0.15)' }}>
          <Table size="small" stickyHeader style={{ background: 'transparent' }}>
            <TableHead>
              <TableRow>
                <TableCell style={{ background: 'var(--background-default)', color: 'var(--text-primary)', borderBottom: '1px solid var(--divider)', fontWeight: 'bold' }}>Field Name</TableCell>
                <TableCell style={{ background: 'var(--background-default)', color: 'var(--text-primary)', borderBottom: '1px solid var(--divider)', fontWeight: 'bold' }}>Type</TableCell>
                <TableCell style={{ background: 'var(--background-default)', color: 'var(--text-primary)', borderBottom: '1px solid var(--divider)', fontWeight: 'bold' }}>Constraint</TableCell>
                <TableCell style={{ background: 'var(--background-default)', color: 'var(--text-primary)', borderBottom: '1px solid var(--divider)', width: '50px' }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((field, idx) => (
                <TableRow key={idx}>
                  <TableCell style={{ borderBottom: '1px solid var(--divider)' }}>
                    <TextField
                      value={field.name}
                      onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                      placeholder="e.g. email"
                      variant="standard"
                      size="small"
                      inputProps={{ style: { color: 'var(--text-primary)', fontSize: '0.85rem' } }}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell style={{ borderBottom: '1px solid var(--divider)' }}>
                    <Select
                      value={field.type}
                      onChange={(e) => handleFieldChange(idx, 'type', e.target.value)}
                      variant="standard"
                      style={{ color: 'var(--text-primary)', fontSize: '0.85rem', width: '100px' }}
                    >
                      <MenuItem value="int">int</MenuItem>
                      <MenuItem value="varchar">varchar</MenuItem>
                      <MenuItem value="string">string</MenuItem>
                      <MenuItem value="datetime">datetime</MenuItem>
                      <MenuItem value="boolean">boolean</MenuItem>
                      <MenuItem value="float">float</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell style={{ borderBottom: '1px solid var(--divider)' }}>
                    <Select
                      value={field.key}
                      onChange={(e) => handleFieldChange(idx, 'key', e.target.value)}
                      variant="standard"
                      style={{ color: 'var(--text-primary)', fontSize: '0.85rem', width: '120px' }}
                    >
                      <MenuItem value="">None</MenuItem>
                      <MenuItem value="PK">Primary Key</MenuItem>
                      <MenuItem value="FK">Foreign Key</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell style={{ borderBottom: '1px solid var(--divider)', textAlign: 'center' }}>
                    <IconButton size="small" onClick={() => handleRemoveField(idx)} style={{ color: '#ff647c' }} disabled={fields.length <= 1}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <Button
          startIcon={<AddIcon />}
          onClick={handleAddField}
          style={{ color: 'var(--primary-main)', textTransform: 'none', marginTop: '12px', fontWeight: 'bold' }}
        >
          Add Attribute
        </Button>
      </DialogContent>
      <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 24px', gap: '8px' }}>
        <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none' }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" style={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 'bold' }}>
          Create Entity
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CreateRelationDialog = ({ open, onClose, source, target, onSubmit }) => {
  const [sourceCard, setSourceCard] = useState('MANY');
  const [targetCard, setTargetCard] = useState('ONE');
  const [relationName, setRelationName] = useState('TO');

  useEffect(() => {
    if (open) {
      setSourceCard('MANY');
      setTargetCard('ONE');
      setRelationName('TO');
    }
  }, [open]);

  const handleSubmit = () => {
    onSubmit(source, target, sourceCard, targetCard, relationName);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          background: 'var(--background-paper)',
          border: '1px solid var(--divider)',
          color: 'var(--text-primary)',
          borderRadius: '16px',
          padding: '12px',
          maxWidth: '450px',
          width: '100%'}
      }}
    >
      <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--divider)', paddingBottom: '12px', color: 'var(--text-primary)' }}>
        🔗 Create Relationship
      </DialogTitle>
      <DialogContent style={{ marginTop: '16px' }}>
        <Typography variant="body2" style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Define the cardinality constraint and the relationship label name:
        </Typography>

        <Box style={{ marginBottom: '24px' }}>
          <TextField
            fullWidth
            label="Relationship Name (e.g. enrolls, orders, TO)"
            variant="outlined"
            size="small"
            value={relationName}
            onChange={(e) => setRelationName(e.target.value)}
            InputLabelProps={{ style: { color: 'var(--text-secondary)' } }}
            inputProps={{ style: { color: 'var(--text-primary)' } }}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--divider)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' }
            }}
          />
        </Box>

        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
          <Box style={{ flex: 1, padding: '16px', background: 'var(--background-default)', border: '1px solid var(--divider)', borderRadius: '12px', textAlign: 'center' }}>
            <Typography variant="subtitle2" style={{ fontWeight: 'bold', color: 'var(--primary-main)', marginBottom: '12px' }}>
              {source}
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Cardinality</InputLabel>
              <Select
                value={sourceCard}
                label="Cardinality"
                onChange={(e) => setSourceCard(e.target.value)}
                style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--divider)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' }}}
              >
                <MenuItem value="ONE">ONE (1)</MenuItem>
                <MenuItem value="MANY">MANY (M)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Typography variant="body1" style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>
            TO
          </Typography>

          <Box style={{ flex: 1, padding: '16px', background: 'var(--background-default)', border: '1px solid var(--divider)', borderRadius: '12px', textAlign: 'center' }}>
            <Typography variant="subtitle2" style={{ fontWeight: 'bold', color: 'var(--primary-main)', marginBottom: '12px' }}>
              {target}
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Cardinality</InputLabel>
              <Select
                value={targetCard}
                label="Cardinality"
                onChange={(e) => setTargetCard(e.target.value)}
                style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--divider)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' }}}
              >
                <MenuItem value="ONE">ONE (1)</MenuItem>
                <MenuItem value="MANY">MANY (N)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 24px', gap: '8px' }}>
        <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none' }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" style={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 'bold' }}>
          Create Relation
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AddActorDialog = ({ open, onClose, onSubmit, existingNames }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) { setName(''); setError(''); }
  }, [open]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return setError('Actor name cannot be empty.');
    if (existingNames.some(n => n.toLowerCase() === trimmed.toLowerCase())) {
      return setError(`Actor "${trimmed}" already exists.`);
    }
    onSubmit(trimmed);
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ style: { background: 'var(--background-paper)', border: '1px solid var(--divider)', color: 'var(--text-primary)', borderRadius: '16px', padding: '12px', maxWidth: '400px', width: '100%' } }}>
      <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--divider)', paddingBottom: '12px', color: 'var(--text-primary)' }}>
        👤 Add Actor
      </DialogTitle>
      <DialogContent style={{ marginTop: '16px' }}>
        {error && <Alert severity="error" style={{ marginBottom: '16px', borderRadius: '8px' }}>{error}</Alert>}
        <TextField fullWidth label="Actor Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. User" variant="outlined" size="small" InputLabelProps={{ style: { color: 'var(--text-secondary)' } }} inputProps={{ style: { color: 'var(--text-primary)' } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'var(--divider)' }, '&:hover fieldset': { borderColor: 'var(--primary-main)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' } } }} />
      </DialogContent>
      <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 24px', gap: '8px' }}>
        <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none' }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" style={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 'bold' }}>Create Actor</Button>
      </DialogActions>
    </Dialog>
  );
};

const AddUseCaseDialog = ({ open, onClose, onSubmit, existingNames }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) { setName(''); setError(''); }
  }, [open]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return setError('Use Case name cannot be empty.');
    if (existingNames.some(n => n.toLowerCase() === trimmed.toLowerCase())) {
      return setError(`Use Case "${trimmed}" already exists.`);
    }
    onSubmit(trimmed);
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ style: { background: 'var(--background-paper)', border: '1px solid var(--divider)', color: 'var(--text-primary)', borderRadius: '16px', padding: '12px', maxWidth: '400px', width: '100%' } }}>
      <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--divider)', paddingBottom: '12px', color: 'var(--text-primary)' }}>
        🎯 Add Use Case
      </DialogTitle>
      <DialogContent style={{ marginTop: '16px' }}>
        {error && <Alert severity="error" style={{ marginBottom: '16px', borderRadius: '8px' }}>{error}</Alert>}
        <TextField fullWidth label="Use Case Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Login to System" variant="outlined" size="small" InputLabelProps={{ style: { color: 'var(--text-secondary)' } }} inputProps={{ style: { color: 'var(--text-primary)' } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'var(--divider)' }, '&:hover fieldset': { borderColor: 'var(--primary-main)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' } } }} />
      </DialogContent>
      <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 24px', gap: '8px' }}>
        <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none' }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" style={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 'bold' }}>Create Use Case</Button>
      </DialogActions>
    </Dialog>
  );
};

const AddParticipantDialog = ({ open, onClose, onSubmit, existingNames }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) { setName(''); setError(''); }
  }, [open]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return setError('Participant name cannot be empty.');
    if (existingNames.some(n => n.toLowerCase() === trimmed.toLowerCase())) {
      return setError(`Participant "${trimmed}" already exists.`);
    }
    onSubmit(trimmed);
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ style: { background: 'var(--background-paper)', border: '1px solid var(--divider)', color: 'var(--text-primary)', borderRadius: '16px', padding: '12px', maxWidth: '400px', width: '100%' } }}>
      <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--divider)', paddingBottom: '12px', color: 'var(--text-primary)' }}>
        ⏹ Add Participant
      </DialogTitle>
      <DialogContent style={{ marginTop: '16px' }}>
        {error && <Alert severity="error" style={{ marginBottom: '16px', borderRadius: '8px' }}>{error}</Alert>}
        <TextField fullWidth label="Participant Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Database" variant="outlined" size="small" InputLabelProps={{ style: { color: 'var(--text-secondary)' } }} inputProps={{ style: { color: 'var(--text-primary)' } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'var(--divider)' }, '&:hover fieldset': { borderColor: 'var(--primary-main)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' } } }} />
      </DialogContent>
      <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 24px', gap: '8px' }}>
        <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none' }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" style={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 'bold' }}>Create Participant</Button>
      </DialogActions>
    </Dialog>
  );
};

const AddSequenceMessageDialog = ({ open, onClose, onSubmit, participants }) => {
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) { setSource(''); setTarget(''); setMessage(''); setError(''); }
  }, [open]);

  const handleSubmit = () => {
    const trimmedMsg = message.trim();
    if (!source || !target) return setError('Please select a Source and Target participant.');
    if (!trimmedMsg) return setError('Message cannot be empty.');
    onSubmit(source, target, trimmedMsg);
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ style: { background: 'var(--background-paper)', border: '1px solid var(--divider)', color: 'var(--text-primary)', borderRadius: '16px', padding: '12px', maxWidth: '450px', width: '100%' } }}>
      <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--divider)', paddingBottom: '12px', color: 'var(--text-primary)' }}>
        ✉️ Add Message
      </DialogTitle>
      <DialogContent style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && <Alert severity="error" style={{ borderRadius: '8px' }}>{error}</Alert>}

        <Box style={{ display: 'flex', gap: '16px' }}>
          <FormControl fullWidth size="small">
            <InputLabel style={{ color: 'var(--text-secondary)' }}>From</InputLabel>
            <Select value={source} label="From" onChange={(e) => setSource(e.target.value)} style={{ color: 'var(--text-primary)' }} sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--divider)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' } }}>
              {participants.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel style={{ color: 'var(--text-secondary)' }}>To</InputLabel>
            <Select value={target} label="To" onChange={(e) => setTarget(e.target.value)} style={{ color: 'var(--text-primary)' }} sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--divider)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' } }}>
              {participants.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <TextField fullWidth label="Message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. Request Data" variant="outlined" size="small" InputLabelProps={{ style: { color: 'var(--text-secondary)' } }} inputProps={{ style: { color: 'var(--text-primary)' } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'var(--divider)' }, '&:hover fieldset': { borderColor: 'var(--primary-main)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' } } }} />
      </DialogContent>
      <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 24px', gap: '8px' }}>
        <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none' }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" style={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 'bold' }}>Create Message</Button>
      </DialogActions>
    </Dialog>
  );
};

const AddTaskDialog = ({ open, onClose, onSubmit, existingTasks }) => {
  const [name, setName] = useState('');
  const [mode, setMode] = useState('date'); // 'date' or 'duration'
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [durationValue, setDurationValue] = useState(1);
  const [durationUnit, setDurationUnit] = useState('days'); // 'days', 'weeks', 'months'
  const [deps, setDeps] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) { setName(''); setMode('date'); setStart(''); setEnd(''); setDurationValue(1); setDurationUnit('days'); setDeps([]); setError(''); }
  }, [open]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return setError('Task name cannot be empty.');
    if (!start) return setError('Start date is required.');
    
    let finalEnd = end;
    if (mode === 'date') {
      if (!end) return setError('End date is required.');
      if (new Date(start) > new Date(end)) return setError('Start date must be before End date.');
    } else {
      if (durationValue <= 0) return setError('Duration must be greater than 0.');
      const startDate = new Date(start);
      let days = durationValue;
      if (durationUnit === 'weeks') days = durationValue * 7;
      else if (durationUnit === 'months') days = durationValue * 30; // Approx for gantt
      const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
      finalEnd = endDate.toISOString().split('T')[0];
    }

    if (existingTasks.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      return setError(`Task "${trimmed}" already exists.`);
    }
    onSubmit(trimmed, start, finalEnd, deps);
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ style: { background: 'var(--background-paper)', border: '1px solid var(--divider)', color: 'var(--text-primary)', borderRadius: '16px', padding: '12px', maxWidth: '400px', width: '100%' } }}>
      <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--divider)', paddingBottom: '12px', color: 'var(--text-primary)' }}>
        📅 Add Task
      </DialogTitle>
      <DialogContent style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && <Alert severity="error" style={{ borderRadius: '8px' }}>{error}</Alert>}

        <TextField fullWidth label="Task Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Design UI" variant="outlined" size="small" InputLabelProps={{ style: { color: 'var(--text-secondary)' } }} inputProps={{ style: { color: 'var(--text-primary)' } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'var(--divider)' }, '&:hover fieldset': { borderColor: 'var(--primary-main)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' } } }} />

        <FormControl component="fieldset" style={{ marginTop: '8px' }}>
          <RadioGroup row value={mode} onChange={(e) => setMode(e.target.value)} style={{ color: 'var(--text-primary)' }}>
            <FormControlLabel value="date" control={<Radio style={{ color: 'var(--primary-main)' }} />} label="By Date" style={{ color: 'var(--text-primary)' }} />
            <FormControlLabel value="duration" control={<Radio style={{ color: 'var(--primary-main)' }} />} label="By Duration" style={{ color: 'var(--text-primary)' }} />
          </RadioGroup>
        </FormControl>

        <Box style={{ display: 'flex', gap: '16px' }}>
          <TextField fullWidth label="Start Date" type="date" value={start} onChange={(e) => setStart(e.target.value)} InputLabelProps={{ shrink: true, style: { color: 'var(--text-secondary)' } }} inputProps={{ style: { color: 'var(--text-primary)' } }} size="small" sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'var(--divider)' }, '&:hover fieldset': { borderColor: 'var(--primary-main)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' } } }} />
          
          {mode === 'date' ? (
            <TextField fullWidth label="End Date" type="date" value={end} onChange={(e) => setEnd(e.target.value)} InputLabelProps={{ shrink: true, style: { color: 'var(--text-secondary)' } }} inputProps={{ style: { color: 'var(--text-primary)' } }} size="small" sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'var(--divider)' }, '&:hover fieldset': { borderColor: 'var(--primary-main)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' } } }} />
          ) : (
            <>
              <TextField fullWidth label="Duration" type="number" value={durationValue} onChange={(e) => setDurationValue(Number(e.target.value))} InputLabelProps={{ style: { color: 'var(--text-secondary)' } }} inputProps={{ min: 1, style: { color: 'var(--text-primary)' } }} size="small" sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'var(--divider)' }, '&:hover fieldset': { borderColor: 'var(--primary-main)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' } } }} />
              <FormControl fullWidth size="small">
                <InputLabel style={{ color: 'var(--text-secondary)' }}>Unit</InputLabel>
                <Select value={durationUnit} label="Unit" onChange={(e) => setDurationUnit(e.target.value)} style={{ color: 'var(--text-primary)' }} sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--divider)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' } }}>
                  <MenuItem value="days">Days</MenuItem>
                  <MenuItem value="weeks">Weeks</MenuItem>
                  <MenuItem value="months">Months</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </Box>

        {existingTasks.length > 0 && (
          <FormControl fullWidth size="small">
            <InputLabel style={{ color: 'var(--text-secondary)' }}>Depends On</InputLabel>
            <Select multiple value={deps} label="Depends On" onChange={(e) => setDeps(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)} style={{ color: 'var(--text-primary)' }} sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--divider)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' } }}>
              {existingTasks.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 24px', gap: '8px' }}>
        <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none' }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" style={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 'bold' }}>Create Task</Button>
      </DialogActions>
    </Dialog>
  );
};

const AddActivityNodeDialog = ({ open, onClose, onSubmit, existingNodeIds }) => {
  const [nodeType, setNodeType] = useState('ACTION');
  const [nodeId, setNodeId] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setNodeType('ACTION');
      setNodeId('');
      setLabel('');
      setError('');
    }
  }, [open]);

  const handleSubmit = () => {
    const trimmedId = nodeId.trim().replace(/\s+/g, '_');
    const trimmedLabel = label.trim();
    if (!trimmedId) return setError('Node ID cannot be empty.');
    if (existingNodeIds.some(id => id.toLowerCase() === trimmedId.toLowerCase())) {
      return setError(`Node ID "${trimmedId}" already exists.`);
    }
    onSubmit(nodeType, trimmedId, trimmedLabel || trimmedId);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          background: 'var(--background-paper)',
          border: '1px solid var(--divider)',
          color: 'var(--text-primary)',
          borderRadius: '16px',
          padding: '12px',
          maxWidth: '450px',
          width: '100%'
        }
      }}
    >
      <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--divider)', paddingBottom: '12px', color: 'var(--text-primary)' }}>
        ⚡ Add Activity Node
      </DialogTitle>
      <DialogContent style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && <Alert severity="error" style={{ borderRadius: '8px' }}>{error}</Alert>}

        <FormControl fullWidth size="small">
          <InputLabel style={{ color: 'var(--text-secondary)' }}>Node Type</InputLabel>
          <Select
            value={nodeType}
            label="Node Type"
            onChange={(e) => setNodeType(e.target.value)}
            style={{ color: 'var(--text-primary)' }}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--divider)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' }
            }}
          >
            <MenuItem value="ACTION">Action / Step (Rounded Card)</MenuItem>
            <MenuItem value="DECISION">Decision / Condition (Diamond 🔶)</MenuItem>
            <MenuItem value="FORK">Fork Bar (Split Parallel Flows ══)</MenuItem>
            <MenuItem value="JOIN">Join Bar (Merge Parallel Flows ══)</MenuItem>
            <MenuItem value="START">Initial / Start Node (🟢)</MenuItem>
            <MenuItem value="END">Activity Final / End Node (🎯)</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Node ID (Unique Identifier)"
          value={nodeId}
          onChange={(e) => setNodeId(e.target.value)}
          placeholder="e.g. VerifyIdentity"
          variant="outlined"
          size="small"
          InputLabelProps={{ style: { color: 'var(--text-secondary)' } }}
          inputProps={{ style: { color: 'var(--text-primary)' } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'var(--divider)' },
              '&:hover fieldset': { borderColor: 'var(--primary-main)' },
              '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' }
            }
          }}
        />

        <TextField
          fullWidth
          label="Display Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Verify User Identity"
          variant="outlined"
          size="small"
          InputLabelProps={{ style: { color: 'var(--text-secondary)' } }}
          inputProps={{ style: { color: 'var(--text-primary)' } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'var(--divider)' },
              '&:hover fieldset': { borderColor: 'var(--primary-main)' },
              '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' }
            }
          }}
        />
      </DialogContent>
      <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 24px', gap: '8px' }}>
        <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none' }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" style={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 'bold' }}>Create Node</Button>
      </DialogActions>
    </Dialog>
  );
};

const AddActivityTransitionDialog = ({ open, onClose, onSubmit, nodes }) => {
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [guard, setGuard] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setSource('');
      setTarget('');
      setGuard('');
      setError('');
    }
  }, [open]);

  const handleSubmit = () => {
    if (!source || !target) return setError('Please select both a Source and a Target node.');
    if (source === target) return setError('Source and Target cannot be the same node.');
    onSubmit(source, target, guard.trim());
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          background: 'var(--background-paper)',
          border: '1px solid var(--divider)',
          color: 'var(--text-primary)',
          borderRadius: '16px',
          padding: '12px',
          maxWidth: '450px',
          width: '100%'
        }
      }}
    >
      <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--divider)', paddingBottom: '12px', color: 'var(--text-primary)' }}>
        ➡️ Add Transition
      </DialogTitle>
      <DialogContent style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && <Alert severity="error" style={{ borderRadius: '8px' }}>{error}</Alert>}

        <Box style={{ display: 'flex', gap: '16px' }}>
          <FormControl fullWidth size="small">
            <InputLabel style={{ color: 'var(--text-secondary)' }}>From (Source)</InputLabel>
            <Select
              value={source}
              label="From (Source)"
              onChange={(e) => setSource(e.target.value)}
              style={{ color: 'var(--text-primary)' }}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--divider)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' }
              }}
            >
              {nodes.map(n => (
                <MenuItem key={n.id} value={n.id}>
                  {n.label} ({n.id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel style={{ color: 'var(--text-secondary)' }}>To (Target)</InputLabel>
            <Select
              value={target}
              label="To (Target)"
              onChange={(e) => setTarget(e.target.value)}
              style={{ color: 'var(--text-primary)' }}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--divider)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' }
              }}
            >
              {nodes.map(n => (
                <MenuItem key={n.id} value={n.id}>
                  {n.label} ({n.id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TextField
          fullWidth
          label="Guard Condition (Optional)"
          value={guard}
          onChange={(e) => setGuard(e.target.value)}
          placeholder="e.g. in stock or score >= 50"
          variant="outlined"
          size="small"
          helperText="Condition will be enclosed in [brackets]"
          InputLabelProps={{ style: { color: 'var(--text-secondary)' } }}
          inputProps={{ style: { color: 'var(--text-primary)' } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'var(--divider)' },
              '&:hover fieldset': { borderColor: 'var(--primary-main)' },
              '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' }
            }
          }}
        />
      </DialogContent>
      <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 24px', gap: '8px' }}>
        <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none' }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" style={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 'bold' }}>Create Transition</Button>
      </DialogActions>
    </Dialog>
  );
};

const AiPromptModal = ({ open, onClose, diagramKey, diagramTitle, templateCode }) => {
  const [userTarget, setUserTarget] = useState('');
  const [copied, setCopied] = useState(false);

  const getFullPrompt = () => {
    return `You are an expert Software Engineer and System Architecture AI assistant.
I am using SophiaPath Software Engineering Lab to design a ${diagramTitle} (${diagramKey.toUpperCase()}).

Below is the EXACT SophiaPath DSL syntax specification, keywords, and example format:
==================================================
SOPHIAPATH ${diagramKey.toUpperCase()} DSL SPECIFICATION & EXAMPLE:
==================================================
${templateCode}

==================================================
MY TARGET SYSTEM / PROJECT REQUIREMENTS:
==================================================
${userTarget.trim() ? userTarget.trim() : 'Please design a clean, comprehensive, real-world diagram for my system.'}

==================================================
AI RESPONSE RULES:
==================================================
1. Output ONLY valid SophiaPath DSL code adhering strictly to the keywords and syntax rules above.
2. Enclose the generated DSL code in a single markdown code block (\`\`\`).
3. Make sure all entities, attributes, relationships, actors, use cases, states, transitions, or lifelines accurately reflect my requirements.
4. Do not wrap the code with markdown headers or conversational filler so I can copy-paste it directly into SophiaPath.`;
  };

  const fullPrompt = getFullPrompt();

  const handleOpenChatGPT = () => {
    const url = `https://chatgpt.com/?q=${encodeURIComponent(fullPrompt)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 0,
        style: {
          borderRadius: '20px',
          background: 'var(--background-paper)',
          border: '1px solid var(--divider)',
          backdropFilter: 'blur(20px)'
        }
      }}
    >
      <DialogTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--divider)' }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AutoAwesomeIcon style={{ color: '#10a37f' }} />
          <Typography variant="h6" style={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
            Generate {diagramTitle} with AI (ChatGPT)
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" style={{ color: 'var(--text-secondary)' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Typography variant="body2" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Describe your system, database entities, or workflow targets below. SophiaPath will format your requirements with the exact DSL syntax rules and open ChatGPT ready to generate your custom diagram.
        </Typography>

        <TextField
          label="Your Target Requirements / Description (Optional)"
          placeholder="e.g. E-Commerce platform with customer accounts, shopping cart, product catalog with categories, order checkout, invoices, and Stripe payments..."
          multiline
          rows={3}
          value={userTarget}
          onChange={(e) => setUserTarget(e.target.value)}
          fullWidth
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: 'var(--background-default)',
              '& fieldset': { borderColor: 'var(--divider)' },
              '&:hover fieldset': { borderColor: 'var(--primary-main)' },
              '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' }
            }
          }}
        />

        <Box>
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <Typography variant="caption" style={{ fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pre-Engineered ChatGPT Prompt Preview
            </Typography>
            <Button
              size="small"
              startIcon={<CopyIcon style={{ fontSize: '0.9rem' }} />}
              onClick={handleCopy}
              style={{ textTransform: 'none', fontSize: '0.75rem', color: copied ? '#4CAF50' : 'var(--primary-main)' }}
            >
              {copied ? 'Copied to Clipboard!' : 'Copy Prompt'}
            </Button>
          </Box>
          <Box
            style={{
              maxHeight: '180px',
              overflowY: 'auto',
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'var(--background-default)',
              border: '1px solid var(--divider)',
              fontFamily: 'monospace',
              fontSize: '0.78rem',
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.5
            }}
          >
            {fullPrompt}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions style={{ padding: '16px 24px', borderTop: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none' }}>
          Cancel
        </Button>
        <Box style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="outlined"
            onClick={handleCopy}
            startIcon={<CopyIcon />}
            style={{
              borderRadius: '10px',
              textTransform: 'none',
              borderColor: 'var(--divider)',
              color: 'var(--text-primary)',
              fontWeight: 700
            }}
          >
            {copied ? 'Copied!' : 'Copy Prompt'}
          </Button>
          <Button
            variant="contained"
            onClick={handleOpenChatGPT}
            startIcon={<OpenInNewIcon />}
            style={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 800,
              background: '#10a37f',
              color: '#ffffff'
            }}
          >
            Open in ChatGPT
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

const SWE_TABS_META = [
  { key: 'er', label: 'ER Diagram', title: 'Entity-Relationship Editor' },
  { key: 'usecase', label: 'Use Case Diagram', title: 'Use Case Modeler' },
  { key: 'activity', label: 'Activity Diagram', title: 'Activity Flow Modeler' },
  { key: 'sequence', label: 'Sequence Diagram', title: 'Sequence Flow Modeler' },
  { key: 'gantt', label: 'Gantt Chart', title: 'Scrum Gantt Scheduler' }
];

const getSweTabIndex = (tab) => {
  if (typeof tab === 'number') return Math.max(0, Math.min(SWE_TABS_META.length - 1, tab));
  const idx = SWE_TABS_META.findIndex(t => t.key === tab);
  return idx >= 0 ? idx : 0;
};

export const SoftwareEngineeringLab = ({ open, onClose, initialTab = 'er', hideDiagramSelector = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDarkMode = theme.palette.mode === 'dark';
  const themeContext = useContext(ThemeContext);
  const themeMode = themeContext?.themeMode || (isDarkMode ? 'dark' : 'light');

  // Core Editor & Panel states
  const [activeTab, setActiveTab] = useState(() => getSweTabIndex(initialTab));
  const [editorCode, setCode] = useState(() => {
    const idx = getSweTabIndex(initialTab);
    return TEMPLATES[SWE_TABS_META[idx].key] || TEMPLATES.er;
  });
  const code = useDeferredValue(editorCode);
  const [error, setError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const idx = getSweTabIndex(initialTab);
      setActiveTab(idx);
      const key = SWE_TABS_META[idx].key;
      setCode(TEMPLATES[key] || TEMPLATES.er);
      setZoomScale(0.8);
      setError(null);
    }
  }, [open, initialTab]);

  // States for visual entity and relationship builder
  const [isAddEntityOpen, setIsAddEntityOpen] = useState(false);
  const [isAddActorOpen, setIsAddActorOpen] = useState(false);
  const [isAddUseCaseOpen, setIsAddUseCaseOpen] = useState(false);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isAddSequenceMessageOpen, setIsAddSequenceMessageOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddActivityNodeOpen, setIsAddActivityNodeOpen] = useState(false);
  const [isAddActivityTransitionOpen, setIsAddActivityTransitionOpen] = useState(false);
  const [ganttViewScale, setGanttViewScale] = useState('weeks'); // 'days', 'weeks', 'months'

  // Activity Diagram Simulation states
  const [isSimulating, setIsSimulating] = useState(false);
  const [simActiveNodeIds, setSimActiveNodeIds] = useState([]);
  const [simVisitedEdges, setSimVisitedEdges] = useState([]);
  const [simLog, setSimLog] = useState([]);
  const [simBranchChoices, setSimBranchChoices] = useState(null);
  const [simCompleted, setSimCompleted] = useState(false);

  const [isRelationDialogOpen, setIsRelationDialogOpen] = useState(false);
  const [pendingRelationSource, setPendingRelationSource] = useState(null);
  const [relationTarget, setRelationTarget] = useState(null);

  // Split-pane slider state
  const [splitPercent, setSplitPercent] = useState(35);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Zooming and Panning states (defaults to 0.8 - zoomed out twice)
  const [zoomScale, setZoomScale] = useState(0.8);
  const [draggingNode, setDraggingNode] = useState(null);
  const [ganttWaypoints, setGanttWaypoints] = useState({});
  const [usecaseWaypoints, setUsecaseWaypoints] = useState({});
  const [draggingWaypoint, setDraggingWaypoint] = useState(null);

  // Preview Dialog states matching Java UML playground
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(themeMode || 'dark');
  const [previewZoomScale, setPreviewZoomScale] = useState(0.8);

  useEffect(() => {
    if (themeMode) {
      setActiveTheme(themeMode);
    }
  }, [themeMode]);

  // Separate layout states per diagram type to prevent overlap/loss
  const [allNodePositions, setAllNodePositions] = useState({
    er: {},
    usecase: {},
    activity: {}
  });

  const tabsMeta = SWE_TABS_META;

  const activeTabKey = tabsMeta[activeTab].key;
  const activeTabTitle = tabsMeta[activeTab].title;

  useEffect(() => {
    setPendingRelationSource(null);
    setRelationTarget(null);
    setIsSimulating(false);
    setSimActiveNodeIds([]);
    setSimVisitedEdges([]);
    setSimLog([]);
    setSimBranchChoices(null);
    setSimCompleted(false);
  }, [activeTabKey]);

  // Refs for tracking interactive mouse states
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const canvasContainerRef = useRef(null);
  const [canvasContainer, setCanvasContainerState] = useState(null);
  const setCanvasContainer = useCallback((node) => {
    canvasContainerRef.current = node;
    setCanvasContainerState(node);
  }, []);
  const dragStartOffset = useRef({ x: 0, y: 0 });
  const zoomAnchorRef = useRef(null);
  const isDraggingSplitRef = useRef(false);

  // Refs for Preview Dialog panning
  const isPanningPreviewRef = useRef(false);
  const panStartPreviewRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const previewCanvasContainerRef = useRef(null);
  const [previewCanvasContainer, setPreviewCanvasContainerState] = useState(null);
  const setPreviewCanvasContainer = useCallback((node) => {
    previewCanvasContainerRef.current = node;
    setPreviewCanvasContainerState(node);
  }, []);
  const previewZoomAnchorRef = useRef(null);

  const nodePositions = allNodePositions[activeTabKey] || {};
  const setNodePositions = (updater) => {
    setAllNodePositions(prev => {
      const current = prev[activeTabKey] || {};
      const next = typeof updater === 'function' ? updater(current) : updater;
      return {
        ...prev,
        [activeTabKey]: next
      };
    });
  };

  const parsedActivity = useMemo(() => {
    if (activeTabKey !== 'activity') return { nodes: [], transitions: [], partitions: [] };
    return parseActivity(code);
  }, [code, activeTabKey]);

  const activityAutoPositions = useMemo(() => {
    if (activeTabKey !== 'activity') return {};
    return computeActivityAutoLayout(parsedActivity.nodes, parsedActivity.transitions, parsedActivity.partitions);
  }, [parsedActivity, activeTabKey]);

  const handleTabChange = (event) => {
    const newValue = event.target.value;
    setActiveTab(newValue);
    const nextKey = tabsMeta[newValue].key;
    setCode(TEMPLATES[nextKey]);
    setZoomScale(0.8);
    setError(null);
    if (canvasContainerRef.current) {
      canvasContainerRef.current.scrollLeft = 0;
      canvasContainerRef.current.scrollTop = 0;
    }
  };

  const [useCaseActorPlacement, setUseCaseActorPlacement] = useState('both'); // 'both' | 'left' | 'right'

  const handleActorPlacementChange = (newPlacement) => {
    setUseCaseActorPlacement(newPlacement);
    if (activeTabKey === 'usecase') {
      const { actors, usecases, links } = parseUseCase(code);
      const newPositions = computeUseCaseAutoLayout(actors, usecases, links, newPlacement);
      setNodePositions(() => newPositions);
    }
  };

  const getEntityWidth = (name) => {
    const len = (name || '').length;
    return Math.max(140, Math.min(360, Math.round(len * 10.5 + 40)));
  };

  const handleAutoLayout = () => {
    setNodePositions(() => {
      if (activeTabKey === 'er') {
        const { entities, relationships } = parseER(code);
        return computeERAutoLayout(entities, relationships);
      } else if (activeTabKey === 'usecase') {
        const { actors, usecases, links } = parseUseCase(code);
        return computeUseCaseAutoLayout(actors, usecases, links, useCaseActorPlacement);
      } else if (activeTabKey === 'activity') {
        const { nodes, transitions, partitions } = parseActivity(code);
        return computeActivityAutoLayout(nodes, transitions, partitions);
      }
      return {};
    });
  };

  // 1. Initial position generator for nodes
  useEffect(() => {
    setNodePositions(prev => {
      const next = { ...prev };
      let updated = false;

      if (activeTabKey === 'er') {
        const { entities, relationships } = parseER(code);
        const needsLayout = entities.some(e => !next[e.name]);
        if (needsLayout) {
          const autoPositions = computeERAutoLayout(entities, relationships);
          let anyNew = false;
          Object.entries(autoPositions).forEach(([id, pos]) => {
            if (!next[id]) {
              next[id] = pos;
              anyNew = true;
            }
          });
          if (anyNew) updated = true;
        }
      } else if (activeTabKey === 'usecase') {
        const { actors, usecases, links } = parseUseCase(code);
        // Check if any nodes need positions assigned
        const needsLayout =
          actors.some(a => !next[a.id]) ||
          usecases.some(u => !next[u.id]);
        if (needsLayout) {
          const autoPositions = computeUseCaseAutoLayout(actors, usecases, links, useCaseActorPlacement);
          let anyNew = false;
          Object.entries(autoPositions).forEach(([id, pos]) => {
            if (!next[id]) {
              next[id] = pos;
              anyNew = true;
            }
          });
          if (anyNew) updated = true;
        }
      } else if (activeTabKey === 'activity') {
        const { nodes, transitions, partitions } = parseActivity(code);
        const needsLayout = nodes.some(n => !next[n.id]);
        if (needsLayout) {
          const autoPositions = computeActivityAutoLayout(nodes, transitions, partitions);
          let anyNew = false;
          Object.entries(autoPositions).forEach(([id, pos]) => {
            if (!next[id]) {
              next[id] = pos;
              anyNew = true;
            }
          });
          if (anyNew) updated = true;
        }
      }

      return updated ? next : prev;
    });
  }, [code, activeTabKey]);

  // 2. Zoom Scroll Anchor centering
  useEffect(() => {
    if (zoomAnchorRef.current && canvasContainer) {
      const { x_virtual, y_virtual, mx, my } = zoomAnchorRef.current;
      canvasContainer.scrollLeft = x_virtual * zoomScale - mx;
      canvasContainer.scrollTop = y_virtual * zoomScale - my;
      zoomAnchorRef.current = null;
    }
  }, [zoomScale, canvasContainer]);

  useEffect(() => {
    if (previewZoomAnchorRef.current && previewCanvasContainer) {
      const { x_virtual, y_virtual, mx, my } = previewZoomAnchorRef.current;
      previewCanvasContainer.scrollLeft = x_virtual * previewZoomScale - mx;
      previewCanvasContainer.scrollTop = y_virtual * previewZoomScale - my;
      previewZoomAnchorRef.current = null;
    }
  }, [previewZoomScale, previewCanvasContainer]);

  // 3. Wheel listener for zooming main canvas (Ctrl + Mousewheel zooming)
  useEffect(() => {
    if (!canvasContainer) return;

    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const rect = canvasContainer.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const x_virtual = (canvasContainer.scrollLeft + mx) / zoomScale;
        const y_virtual = (canvasContainer.scrollTop + my) / zoomScale;
        zoomAnchorRef.current = { x_virtual, y_virtual, mx, my };

        const step = 0.05;
        setZoomScale(prev => Math.max(0.2, Math.min(2.0, prev + (e.deltaY < 0 ? step : -step))));
      }
    };

    canvasContainer.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvasContainer.removeEventListener('wheel', handleWheel);
    };
  }, [canvasContainer, zoomScale]);

  // Wheel listener for zooming preview canvas (Ctrl + Mousewheel zooming)
  useEffect(() => {
    if (!previewCanvasContainer) return;

    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const rect = previewCanvasContainer.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const x_virtual = (previewCanvasContainer.scrollLeft + mx) / previewZoomScale;
        const y_virtual = (previewCanvasContainer.scrollTop + my) / previewZoomScale;
        previewZoomAnchorRef.current = { x_virtual, y_virtual, mx, my };

        const step = 0.05;
        setPreviewZoomScale(prev => Math.max(0.2, Math.min(2.0, prev + (e.deltaY < 0 ? step : -step))));
      }
    };

    previewCanvasContainer.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      previewCanvasContainer.removeEventListener('wheel', handleWheel);
    };
  }, [previewCanvasContainer, previewZoomScale]);

  // 4. Global window listeners for drag partition resizing and canvas panning
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingSplitRef.current) {
        const container = document.getElementById('se-split-container');
        if (container) {
          const rect = container.getBoundingClientRect();
          const offset = e.clientX - rect.left;
          const newPercent = Math.max(25, Math.min(75, (offset / rect.width) * 100));
          setSplitPercent(newPercent);
        }
      } else if (isPanningRef.current) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        if (canvasContainerRef.current) {
          canvasContainerRef.current.scrollLeft = panStartRef.current.scrollLeft - dx;
          canvasContainerRef.current.scrollTop = panStartRef.current.scrollTop - dy;
        }
      } else if (isPanningPreviewRef.current) {
        const dx = e.clientX - panStartPreviewRef.current.x;
        const dy = e.clientY - panStartPreviewRef.current.y;
        if (previewCanvasContainerRef.current) {
          previewCanvasContainerRef.current.scrollLeft = panStartPreviewRef.current.scrollLeft - dx;
          previewCanvasContainerRef.current.scrollTop = panStartPreviewRef.current.scrollTop - dy;
        }
      }
    };

    const handleMouseUp = () => {
      if (isDraggingSplitRef.current) {
        isDraggingSplitRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
      if (isPanningRef.current) {
        isPanningRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
      if (isPanningPreviewRef.current) {
        isPanningPreviewRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // 5. Throttled Node card and waypoint dragging using requestAnimationFrame
  useEffect(() => {
    if (!draggingNode && !draggingWaypoint) return;

    let animationFrameId = null;

    const handleMouseMove = (e) => {
      if (animationFrameId) return;

      animationFrameId = requestAnimationFrame(() => {
        animationFrameId = null;

        if (draggingNode) {
          let minX = 0;
          let minY = 0;

          if (draggingNode.includes('::attr::')) {
            minX = 42; // attribute oval rx
            minY = 18; // attribute oval ry
          } else if (draggingNode.includes('::rel::')) {
            minX = 40; // relationship diamond half-width
            minY = 22; // relationship diamond half-height
          }

          const newX = Math.max(minX, e.clientX / zoomScale - dragStartOffset.current.x);
          const yOffsetVal = e.clientY / zoomScale - dragStartOffset.current.y;
          const newY = Math.max(minY, yOffsetVal);

          setNodePositions(prev => {
            const current = prev[draggingNode];
            if (current && Math.abs(current.x - newX) < 0.5 && Math.abs(current.y - newY) < 0.5) {
              return prev;
            }
            
            const next = {
              ...prev,
              [draggingNode]: { x: newX, y: newY }
            };

            // If dragging a parent entity (meaning no "::" in the node key)
            if (!draggingNode.includes('::')) {
              const deltaX = newX - (current ? current.x : newX);
              const deltaY = newY - (current ? current.y : newY);
              
              if (Math.abs(deltaX) > 0.01 || Math.abs(deltaY) > 0.01) {
                // Shift all attribute keys belonging to this entity
                Object.keys(prev).forEach(key => {
                  if (key.startsWith(`${draggingNode}::attr::`)) {
                    const attrPos = prev[key];
                    if (attrPos) {
                      next[key] = {
                        x: attrPos.x + deltaX,
                        y: attrPos.y + deltaY
                      };
                    }
                  }
                });
              }
            }

            return next;
          });
        } else if (draggingWaypoint) {
          const rect = canvasContainerRef.current?.getBoundingClientRect();
          if (rect) {
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const newX = (canvasContainerRef.current.scrollLeft + mx) / zoomScale;
            const newY = (canvasContainerRef.current.scrollTop + my) / zoomScale;

            const parts = draggingWaypoint.split('::');
            const wpKey = parts[0];
            const prop = parts[1];
            const context = parts[2];

            if (context === 'usecase') {
              setUsecaseWaypoints(prev => ({
                ...prev,
                [wpKey]: {
                  ...(prev[wpKey] || {}),
                  x: newX,
                  y: newY
                }
              }));
            } else {
              setGanttWaypoints(prev => {
                const existing = prev[wpKey] || {};
                return {
                  ...prev,
                  [wpKey]: {
                    ...existing,
                    [prop]: prop === 'gapY' ? newY : newX
                  }
                };
              });
            }
          }
        }
      });
    };

    const handleMouseUp = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      setDraggingNode(null);
      setDraggingWaypoint(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [draggingNode, draggingWaypoint, zoomScale, activeTabKey]);

  // Escape key to exit fullscreen mode or cancel relationship selection
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (pendingRelationSource) {
          setPendingRelationSource(null);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, pendingRelationSource]);

  // Calculate canvas dimensions dynamically to expand scroll boundaries
  const getCanvasDimensions = () => {
    let maxX = 1600;
    let maxY = 1200;

    if (activeTabKey === 'er') {
      const { entities } = parseER(code);
      entities.forEach(ent => {
        const pos = nodePositions[ent.name];
        if (pos) {
          if (pos.x + 350 + 200 > maxX) maxX = pos.x + 350 + 200;
          if (pos.y + 300 + 200 > maxY) maxY = pos.y + 300 + 200;
        }
      });
    } else if (activeTabKey === 'usecase') {
      const { actors, usecases, links } = parseUseCase(code);
      const autoPos = computeUseCaseAutoLayout(actors, usecases, links, useCaseActorPlacement);
      actors.forEach(act => {
        const pos = nodePositions[act.id] || autoPos[act.id];
        if (pos) {
          if (pos.x + 200 + 200 > maxX) maxX = pos.x + 200 + 200;
          if (pos.y + 150 + 200 > maxY) maxY = pos.y + 150 + 200;
        }
      });
      usecases.forEach(uc => {
        const pos = nodePositions[uc.id] || autoPos[uc.id];
        if (pos) {
          if (pos.x + 250 + 200 > maxX) maxX = pos.x + 250 + 200;
          if (pos.y + 150 + 200 > maxY) maxY = pos.y + 150 + 200;
        }
      });
    } else if (activeTabKey === 'activity') {
      const { nodes, partitions } = parseActivity(code);
      const autoPos = computeActivityAutoLayout(nodes, [], partitions);
      nodes.forEach(n => {
        const pos = nodePositions[n.id] || autoPos[n.id];
        if (pos) {
          if (pos.x + 250 + 200 > maxX) maxX = pos.x + 250 + 200;
          if (pos.y + 150 + 200 > maxY) maxY = pos.y + 150 + 200;
        }
      });
      if (partitions && partitions.length > 0) {
        let currentX = 80;
        partitions.forEach((partName) => {
          const partNodes = nodes.filter(n => (n.partition || partitions[0]) === partName);
          let maxNodeRight = currentX + 380;
          partNodes.forEach(n => {
            const p = nodePositions[n.id] || autoPos[n.id];
            if (p && p.x + 196 + 50 > maxNodeRight) {
              maxNodeRight = p.x + 196 + 50;
            }
          });
          currentX = Math.max(currentX + 380, maxNodeRight);
        });
        if (currentX + 200 > maxX) maxX = currentX + 200;
      }
    } else if (activeTabKey === 'sequence') {
      const { participants, messages } = parseSequence(code);
      maxX = Math.max(1200, participants.length * 220 + 200);
      maxY = Math.max(800, messages.length * 52 + 180);
    } else if (activeTabKey === 'gantt') {
      const { tasks } = parseGantt(code);
      let earliestDate = new Date('2026-07-01');
      let latestDate = new Date('2026-08-31');
      let foundDate = false;
      
      tasks.forEach(task => {
        if (task.startDateStr) {
          const d = new Date(task.startDateStr);
          if (!isNaN(d.getTime())) {
            const endDate = new Date(d.getTime() + task.duration * 24 * 60 * 60 * 1000);
            if (!foundDate) {
              earliestDate = d;
              latestDate = endDate;
              foundDate = true;
            } else {
              if (d < earliestDate) earliestDate = d;
              if (endDate > latestDate) latestDate = endDate;
            }
          }
        }
      });
      
      const mStart = earliestDate.getMonth();
      const yStart = earliestDate.getFullYear();
      const mEnd = latestDate.getMonth();
      const yEnd = latestDate.getFullYear();
      let numMonths = (yEnd - yStart) * 12 + (mEnd - mStart) + 1;
      if (numMonths < 2 && !foundDate) numMonths = 2;
      if (numMonths < 1) numMonths = 1;
      
      const monthWidth = ganttViewScale === 'days' ? 930 : ganttViewScale === 'months' ? 160 : 480;
      maxX = 240 + numMonths * monthWidth + 20;
      maxY = 800;
    }

    return { width: maxX, height: maxY };
  };

  const canvasDim = getCanvasDimensions();

  // Canvas background drag panning triggers
  const handleCanvasMouseDown = (e) => {
    if (e.target.closest('.se-node-card') || e.target.closest('button') || e.target.closest('.MuiSelect-select')) {
      return;
    }
    e.preventDefault();
    isPanningRef.current = true;
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: canvasContainerRef.current ? canvasContainerRef.current.scrollLeft : 0,
      scrollTop: canvasContainerRef.current ? canvasContainerRef.current.scrollTop : 0
    };
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  const handleCreateEntity = (entityName, fields) => {
    if (!entityName) return;
    let entityStr = `\n\nENTITY ${entityName}\nATTRIBUTES\n`;
    fields.forEach(field => {
      if (!field.name) return;
      const keyType = field.key === 'PK' ? ' PRIMARY KEY' : (field.key === 'FK' ? ' FOREIGN KEY' : '');
      entityStr += `${field.name} : ${field.type}${keyType}\n`;
    });

    setCode(prevCode => {
      const newCode = prevCode + entityStr;
      return organizeERCode(newCode);
    });

    // Find first empty space in the 450x360 grid starting at (200, 200)
    let foundSpace = false;
    let col = 0;
    let row = 0;
    let newX = 200;
    let newY = 200;

    while (!foundSpace) {
      newX = col * 450 + 200;
      newY = row * 360 + 200;

      // Check if any existing entity overlaps with this position (threshold 250px)
      const isOccupied = Object.entries(nodePositions).some(([nodeName, pos]) => {
        if (nodeName.includes('::')) return false; 
        const dist = Math.sqrt(Math.pow(pos.x - newX, 2) + Math.pow(pos.y - newY, 2));
        return dist < 250;
      });

      if (!isOccupied) {
        foundSpace = true;
      } else {
        col++;
        if (col >= 3) {
          col = 0;
          row++;
        }
      }
    }

    const entityW = 150;
    const entityH = 50;

    setNodePositions(prev => {
      const next = {
        ...prev,
        [entityName]: { x: newX, y: newY }
      };

      const cx = newX + entityW / 2;
      const cy = newY + entityH / 2;
      const validFields = fields.filter(f => f.name);
      const numFields = validFields.length;
      
      let currentFieldIdx = 0;
      let layerIndex = 0;
      
      while (currentFieldIdx < numFields) {
        const R = 120 + layerIndex * 90;
        const maxInLayer = Math.floor((2 * Math.PI * R) / 95);
        const countInThisLayer = Math.min(maxInLayer, numFields - currentFieldIdx);
        
        for (let j = 0; j < countInThisLayer; j++) {
          const f = validFields[currentFieldIdx + j];
          const attrKey = `${entityName}::attr::${f.name}`;
          const startAngle = -Math.PI / 2 + (layerIndex * Math.PI / 6);
          const angle = startAngle + (2 * Math.PI * j) / countInThisLayer;
          next[attrKey] = {
            x: cx + R * Math.cos(angle),
            y: cy + R * Math.sin(angle)
          };
        }
        currentFieldIdx += countInThisLayer;
        layerIndex++;
      }

      return next;
    });

    setIsAddEntityOpen(false);
  };

  const handleCreateRelationship = (source, target, sourceCard, targetCard, relationName) => {
    if (!source || !target) return;
    const actualRelName = relationName.trim() || 'TO';
    const relStr = `\n\nRELATIONSHIP ${source} ${sourceCard} ${actualRelName} ${target} ${targetCard}`;
    
    setCode(prevCode => {
      const newCode = prevCode + relStr;
      return organizeERCode(newCode);
    });

    const relKey = `${source}::rel::${target}`;
    const start = nodePositions[source] || { x: 200, y: 200 };
    const end = nodePositions[target] || { x: 200, y: 200 };
    const entityW = 150;
    const entityH = 50;
    const cx1 = start.x + entityW / 2;
    const cy1 = start.y + entityH / 2;
    const cx2 = end.x + entityW / 2;
    const cy2 = end.y + entityH / 2;

    setNodePositions(prev => ({
      ...prev,
      [relKey]: {
        x: (cx1 + cx2) / 2,
        y: (cy1 + cy2) / 2
      }
    }));

    setPendingRelationSource(null);
    setRelationTarget(null);
    setIsRelationDialogOpen(false);
  };

  const handleCreateActor = (name) => {
    setCode(prev => prev + `\nACTOR ${name}`);
    const count = Object.keys(nodePositions).length;
    setNodePositions(prev => ({
      ...prev,
      [name]: { x: 100, y: count * 180 + 150 }
    }));
    setIsAddActorOpen(false);
  };

  const handleCreateUseCase = (name) => {
    setCode(prev => prev + `\nUSE CASE ${name}`);
    const count = Object.keys(nodePositions).length;
    setNodePositions(prev => ({
      ...prev,
      [name]: { x: 420, y: count * 110 + 100 }
    }));
    setIsAddUseCaseOpen(false);
  };

  const handleCreateParticipant = (name) => {
    setCode(prev => prev + `\nPARTICIPANT ${name}`);
    setIsAddParticipantOpen(false);
  };

  const handleCreateSequenceMessage = (source, target, message) => {
    setCode(prev => prev + `\n\n${source} sends "${message}" to ${target}.`);
    setIsAddSequenceMessageOpen(false);
  };

  const handleCreateGanttTask = (name, start, end, deps) => {
    let taskStr = `\n\nTASK ${name}\nSTART ${start}\nEND ${end}`;
    deps.forEach(dep => {
      taskStr += `\nDEPENDS ON ${dep}`;
    });
    setCode(prev => prev + taskStr);
    setIsAddTaskOpen(false);
  };

  const handleRelationDotClick = (entityName) => {
    if (pendingRelationSource) {
      if (pendingRelationSource === entityName) {
        setPendingRelationSource(null);
      } else {
        setRelationTarget(entityName);
        setIsRelationDialogOpen(true);
      }
    } else {
      setPendingRelationSource(entityName);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editorCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePreviewCanvasMouseDown = (e) => {
    if (e.target.closest('.se-node-card') || e.target.closest('button') || e.target.closest('.MuiSelect-select')) {
      return;
    }
    e.preventDefault();
    isPanningPreviewRef.current = true;
    panStartPreviewRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: previewCanvasContainerRef.current ? previewCanvasContainerRef.current.scrollLeft : 0,
      scrollTop: previewCanvasContainerRef.current ? previewCanvasContainerRef.current.scrollTop : 0
    };
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  const getDiagramBounds = (tabKey, diagramCode) => {
    let minX = 0;
    let minY = 0;
    let maxX = 1200;
    let maxY = 800;
    let hasCoords = false;

    if (tabKey === 'er') {
      const { entities, relationships } = parseER(diagramCode);
      const autoPositions = computeERAutoLayout(entities, relationships);
      let xs = [];
      let ys = [];

      entities.forEach((entity, idx) => {
        const entW = getEntityWidth(entity.name);
        const entPos = nodePositions[entity.name] || autoPositions[entity.name] || { x: (idx % 3) * 320 + 120, y: Math.floor(idx / 3) * 220 + 100 };
        if (entPos) {
          xs.push(entPos.x);
          xs.push(entPos.x + entW);
          ys.push(entPos.y);
          ys.push(entPos.y + 50);
        }

        // Attributes bounds (radius 42x18)
        const fields = entity.fields || [];
        fields.forEach(f => {
          const attrKey = `${entity.name}::attr::${f.name}`;
          const attrPos = nodePositions[attrKey] || autoPositions[attrKey];
          if (attrPos) {
            xs.push(attrPos.x - 42);
            xs.push(attrPos.x + 42);
            ys.push(attrPos.y - 18);
            ys.push(attrPos.y + 18);
          }
        });
      });

      // Relationships bounds (diamond half-width 40x22)
      relationships.forEach(rel => {
        const relKey = `${rel.source}::rel::${rel.target}`;
        const relPos = nodePositions[relKey] || autoPositions[relKey];
        if (relPos) {
          xs.push(relPos.x - 40);
          xs.push(relPos.x + 40);
          ys.push(relPos.y - 22);
          ys.push(relPos.y + 22);
        }
      });

      if (xs.length > 0) {
        minX = Math.min(...xs);
        maxX = Math.max(...xs);
        minY = Math.min(...ys);
        maxY = Math.max(...ys);
        hasCoords = true;
      }
    }
    else if (tabKey === 'usecase') {
      const { actors, usecases, links } = parseUseCase(diagramCode);
      const autoPositions = computeUseCaseAutoLayout(actors, usecases, links, useCaseActorPlacement);
      let xs = [];
      let ys = [];

      actors.forEach((act, idx) => {
        const pos = nodePositions[act.id] || autoPositions[act.id] || { x: 100, y: idx * 180 + 150 };
        xs.push(pos.x - 30);
        xs.push(pos.x + 120);
        ys.push(pos.y - 20);
        ys.push(pos.y + 120);
      });

      usecases.forEach((uc, idx) => {
        const pos = nodePositions[uc.id] || autoPositions[uc.id] || { x: 420, y: idx * 110 + 100 };
        xs.push(pos.x - 60);
        xs.push(pos.x + 260);
        ys.push(pos.y - 60);
        ys.push(pos.y + 100);
      });

      if (xs.length > 0) {
        minX = Math.min(...xs);
        maxX = Math.max(...xs);
        minY = Math.min(...ys);
        maxY = Math.max(...ys);
        hasCoords = true;
      }
    }
    else if (tabKey === 'activity') {
      const { nodes, transitions, partitions } = parseActivity(diagramCode);
      const autoPositions = computeActivityAutoLayout(nodes, transitions, partitions);
      let xs = [];
      let ys = [];

      if (partitions && partitions.length > 0) {
        let currentX = 80;
        xs.push(80);
        partitions.forEach((partName) => {
          const partNodes = nodes.filter(n => (n.partition || partitions[0]) === partName);
          let maxNodeRight = currentX + 380;
          partNodes.forEach(n => {
            const p = nodePositions[n.id] || autoPositions[n.id];
            if (p && p.x + 196 + 50 > maxNodeRight) {
              maxNodeRight = p.x + 196 + 50;
            }
          });
          currentX = Math.max(currentX + 380, maxNodeRight);
        });
        xs.push(currentX);
        ys.push(10);
      }

      nodes.forEach((n) => {
        const pos = nodePositions[n.id] || autoPositions[n.id] || { x: 400, y: 100 };
        let w = 196;
        let h = 54;
        if (n.type === 'start' || n.type === 'end') { w = 36; h = 36; }
        else if (n.type === 'decision') { w = 140; h = 70; }
        else if (n.type === 'fork' || n.type === 'join') { w = 160; h = 12; }

        xs.push(pos.x);
        xs.push(pos.x + w);
        ys.push(pos.y);
        ys.push(pos.y + h);
      });

      if (xs.length > 0) {
        minX = Math.min(...xs);
        maxX = Math.max(...xs);
        minY = Math.min(...ys);
        maxY = Math.max(...ys);
        hasCoords = true;
      }
    }
    else if (tabKey === 'sequence') {
      const { participants, messages } = parseSequence(diagramCode);
      if (participants.length > 0) {
        minX = 50;
        maxX = (participants.length - 1) * 260 + 250;
        minY = 30;
        maxY = messages.length * 52 + 180;
        hasCoords = true;
      }
    }
    else if (tabKey === 'gantt') {
      const { sections, tasks } = parseGantt(diagramCode);
      if (tasks.length > 0) {
        const monthWidth = ganttViewScale === 'days' ? 930 : ganttViewScale === 'months' ? 160 : 480;
        const dayWidth = monthWidth / 31;
        const rowHeight = 48;
        let xs = [20];
        let ys = [30];

        sections.forEach((section, secIdx) => {
          const sectionTasks = tasks.filter(t => t.section === section);
          const sectionYStart = secIdx * 450 + 60;

          let earliestDate = new Date('2026-07-01');
          let latestDate = new Date('2026-08-31');
          let foundDate = false;

          tasks.forEach(task => {
            if (task.startDateStr) {
              const d = new Date(task.startDateStr);
              if (!isNaN(d.getTime())) {
                const endDate = new Date(d.getTime() + task.duration * 24 * 60 * 60 * 1000);
                if (!foundDate) {
                  earliestDate = d;
                  latestDate = endDate;
                  foundDate = true;
                } else {
                  if (d < earliestDate) earliestDate = d;
                  if (endDate > latestDate) latestDate = endDate;
                }
              }
            }
          });

          const mStart = earliestDate.getMonth();
          const yStart = earliestDate.getFullYear();
          const mEnd = latestDate.getMonth();
          const yEnd = latestDate.getFullYear();
          let numMonths = (yEnd - yStart) * 12 + (mEnd - mStart) + 1;
          if (numMonths < 2 && !foundDate) numMonths = 2;
          if (numMonths < 1) numMonths = 1;

          const svgWidth = 240 + numMonths * monthWidth + 20;
          xs.push(svgWidth); // Include full timeline width to end at the right of the last month


          sectionTasks.forEach((task, taskIdx) => {
            const y = sectionYStart + taskIdx * rowHeight;
            const width = Math.max(12, task.duration * dayWidth);

            let x = 240;
            if (task.startDateStr) {
              const tDate = new Date(task.startDateStr);
              if (!isNaN(tDate.getTime())) {
                const m = tDate.getMonth();
                const year = tDate.getFullYear();
                const d = tDate.getDate();
                const monthDiff = (year - yStart) * 12 + (m - mStart);
                if (monthDiff >= 0 && monthDiff < numMonths) {
                  x = 240 + monthDiff * monthWidth + (d - 1) * dayWidth;
                } else if (monthDiff < 0) {
                  x = 240;
                } else {
                  x = svgWidth - 20;
                }
              }
            }

            xs.push(x + width + 80);
            ys.push(y + rowHeight + 20);
          });
        });

        minX = 10;
        maxX = Math.max(...xs);
        minY = 10;
        maxY = Math.max(...ys);
        hasCoords = true;
      }
    }

    if (hasCoords) {
      const padding = 30;
      const padRight = tabKey === 'gantt' ? 0 : padding; // Exactly 0 extra right padding for Gantt
      const padBottom = tabKey === 'gantt' ? 80 : padding;
      return {
        x: Math.max(0, minX - padding),
        y: Math.max(0, minY - padding),
        width: (maxX - minX) + padding * 2,
        height: (maxY - minY) + padding * 2
      };
    }

    return { x: 0, y: 0, width: 1200, height: 800 };
  };

  const getExportThemeColors = () => {
    const computedStyle = getComputedStyle(document.documentElement);
    const primaryMain = computedStyle.getPropertyValue('--primary-main').trim() || '#3B82F6';
    const primaryDark = computedStyle.getPropertyValue('--primary-dark').trim() || '#1D4ED8';
    const textPrimary = computedStyle.getPropertyValue('--text-primary').trim() || (activeTheme === 'dark' ? '#F9FAFB' : '#111827');
    const textSecondary = computedStyle.getPropertyValue('--text-secondary').trim() || '#6B7280';
    const bgPaper = computedStyle.getPropertyValue('--background-paper').trim() || (activeTheme === 'dark' ? '#1E1E1E' : '#FFFFFF');
    const bgDefault = activeTheme === 'dark' ? '#121212' : '#ffffff';
    const divider = computedStyle.getPropertyValue('--divider').trim() || '#E5E7EB';
    return { primaryMain, primaryDark, textPrimary, textSecondary, bgPaper, bgDefault, divider };
  };

  const generatePureDiagramSvg = (tabKey, diagramCode, bounds, themeColors, activePositions = {}) => {
    const padding = 40;
    const x = Math.max(0, bounds.x - padding);
    const y = Math.max(0, bounds.y - padding);
    const width = bounds.width + padding * 2;
    const height = bounds.height + padding * 2;

    const { primaryMain, primaryDark, textPrimary, textSecondary, bgPaper, bgDefault, divider } = themeColors;

    const escapeXml = (str) => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const renderCenteredTextLines = (text, cx, cy, nodeW, options = {}) => {
      const fontSize = options.fontSize || 13;
      const fontWeight = options.fontWeight || 700;
      const fill = options.fill || textPrimary;
      const lineHeight = options.lineHeight || Math.round(fontSize * 1.3);
      const maxChars = options.maxChars || Math.max(10, Math.floor((nodeW - 20) / (fontSize * 0.58)));

      const words = (text || '').split(/\s+/).filter(Boolean);
      const lines = [];
      let currentLine = '';

      words.forEach(word => {
        if ((currentLine + ' ' + word).trim().length <= maxChars) {
          currentLine = (currentLine + ' ' + word).trim();
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      });
      if (currentLine) lines.push(currentLine);
      if (lines.length === 0) lines.push(text || '');

      const totalHeight = lines.length * lineHeight;
      const startY = cy - totalHeight / 2 + lineHeight / 2;

      return lines.map((line, idx) => {
        const lineY = startY + idx * lineHeight;
        return `<text x="${cx}" y="${lineY}" text-anchor="middle" dominant-baseline="central" fill="${fill}" font-size="${fontSize}" font-weight="${fontWeight}" font-family="'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">${escapeXml(line)}</text>`;
      }).join('\n');
    };

    let innerSvgContent = '';

    if (tabKey === 'activity') {
      const { nodes, transitions, partitions } = parseActivity(diagramCode);
      const hasPartitions = partitions && partitions.length > 0;
      const autoPos = computeActivityAutoLayout(nodes, transitions, partitions);

      const nodeDim = (type) => {
        if (type === 'start' || type === 'end') return { w: 36, h: 36 };
        if (type === 'decision') return { w: 140, h: 70 };
        if (type === 'fork' || type === 'join') return { w: 160, h: 12 };
        return { w: 196, h: 54 };
      };

      let maxY = 700;
      nodes.forEach(n => {
        const p = activePositions[n.id] || autoPos[n.id] || { x: 400, y: 100 };
        const dim = nodeDim(n.type);
        if (p && p.y + dim.h + 80 > maxY) maxY = p.y + dim.h + 80;
      });

      const partBounds = [];
      if (hasPartitions) {
        let currentX = 80;
        partitions.forEach((partName) => {
          const partNodes = nodes.filter(n => (n.partition || partitions[0]) === partName);
          let maxNodeRight = currentX + 380;
          partNodes.forEach(n => {
            const p = activePositions[n.id] || autoPos[n.id];
            const dim = nodeDim(n.type);
            if (p && p.x + dim.w + 50 > maxNodeRight) {
              maxNodeRight = p.x + dim.w + 50;
            }
          });
          const partW = Math.max(380, maxNodeRight - currentX);
          const xLeft = currentX;
          const xRight = currentX + partW;
          partBounds.push({ xLeft, xRight, width: partW, xCenter: xLeft + partW / 2, partName });
          currentX = xRight;
        });
      }

      // 1. Swimlane headers and dividers
      let swimlanesSvg = '';
      if (hasPartitions) {
        swimlanesSvg = `<g id="export-activity-swimlanes">` + partBounds.map((pb, pIdx) => `
          <rect x="${pb.xLeft + 10}" y="16" width="${pb.width - 20}" height="42" rx="10" fill="${bgPaper}" stroke="${primaryMain}" stroke-width="2" />
          <text x="${pb.xCenter}" y="37" text-anchor="middle" dominant-baseline="central" fill="${primaryMain}" font-size="16" font-weight="900" font-family="'Outfit', sans-serif" letter-spacing="0.08em">${escapeXml(pb.partName.toUpperCase())}</text>
          <line x1="${pb.xLeft}" y1="16" x2="${pb.xLeft}" y2="${maxY}" stroke="${primaryMain}" stroke-opacity="0.4" stroke-width="2.5" stroke-dasharray="${pIdx === 0 ? 'none' : '5,5'}" />
          ${pIdx === partBounds.length - 1 ? `<line x1="${pb.xRight}" y1="16" x2="${pb.xRight}" y2="${maxY}" stroke="${primaryMain}" stroke-opacity="0.4" stroke-width="2.5" />` : ''}
        `).join('') + `</g>`;
      }

      // 2. Transitions
      const transitionsSvg = `<g id="export-activity-transitions">` + (transitions || []).map((t, idx) => {
        const srcNode = nodes.find(n => n.id === t.source);
        const tgtNode = nodes.find(n => n.id === t.target);
        if (!srcNode || !tgtNode) return '';

        const rawP1 = activePositions[t.source] || autoPos[t.source];
        const rawP2 = activePositions[t.target] || autoPos[t.target];
        const p1 = { x: rawP1 && Number.isFinite(rawP1.x) ? rawP1.x : 400, y: rawP1 && Number.isFinite(rawP1.y) ? rawP1.y : 100 };
        const p2 = { x: rawP2 && Number.isFinite(rawP2.x) ? rawP2.x : 400, y: rawP2 && Number.isFinite(rawP2.y) ? rawP2.y : 220 };

        const dim1 = nodeDim(srcNode.type);
        const dim2 = nodeDim(tgtNode.type);

        const srcCenter = { x: p1.x + dim1.w / 2, y: p1.y + dim1.h / 2 };
        const tgtCenter = { x: p2.x + dim2.w / 2, y: p2.y + dim2.h / 2 };
        const dx = tgtCenter.x - srcCenter.x;
        const dy = tgtCenter.y - srcCenter.y;
        const isLoopBack = (p2.y + dim2.h) < p1.y;

        let pathD = '';
        let midX = (srcCenter.x + tgtCenter.x) / 2;
        let midY = (srcCenter.y + tgtCenter.y) / 2;

        if (isLoopBack) {
          const startX = p1.x + dim1.w;
          const startY = srcCenter.y;
          const endX = p2.x + dim2.w;
          const endY = tgtCenter.y;
          const loopX = Math.max(p1.x + dim1.w, p2.x + dim2.w) + 60;
          const r = 12;
          pathD = `M ${startX} ${startY} H ${loopX - r} Q ${loopX} ${startY} ${loopX} ${startY - r} V ${endY + r} Q ${loopX} ${endY} ${loopX - r} ${endY} H ${endX}`;
          midX = loopX;
          midY = (startY + endY) / 2;
        } else if (Math.abs(dy) < 35 && Math.abs(dx) > 40) {
          if (dx > 0) {
            const startX = p1.x + dim1.w;
            const startY = srcCenter.y;
            const endX = p2.x;
            const endY = tgtCenter.y;
            pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
            midX = (startX + endX) / 2;
            midY = startY;
          } else {
            const startX = p1.x;
            const startY = srcCenter.y;
            const endX = p2.x + dim2.w;
            const endY = tgtCenter.y;
            pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
            midX = (startX + endX) / 2;
            midY = startY;
          }
        } else if (srcNode.type === 'decision' && Math.abs(dx) > 60) {
          const startX = dx > 0 ? p1.x + dim1.w : p1.x;
          const startY = srcCenter.y;
          const endX = tgtCenter.x;
          const endY = p2.y;
          const r = 12;
          const cornerX = endX;
          if (cornerX > startX) {
            pathD = `M ${startX} ${startY} H ${cornerX - r} Q ${cornerX} ${startY} ${cornerX} ${startY + r} V ${endY}`;
          } else {
            pathD = `M ${startX} ${startY} H ${cornerX + r} Q ${cornerX} ${startY} ${cornerX} ${startY + r} V ${endY}`;
          }
          midX = (startX + endX) / 2;
          midY = startY;
        } else {
          const startX = srcCenter.x;
          const startY = p1.y + dim1.h;
          const endX = tgtCenter.x;
          const endY = p2.y;

          if (Math.abs(startX - endX) < 8) {
            pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
            midX = startX;
            midY = (startY + endY) / 2;
          } else {
            const r = 12;
            const stepY = startY + Math.min(28, Math.max(16, (endY - startY) * 0.45));
            if (endX > startX) {
              pathD = `M ${startX} ${startY} V ${stepY - r} Q ${startX} ${stepY} ${startX + r} ${stepY} H ${endX - r} Q ${endX} ${stepY} ${endX} ${stepY + r} V ${endY}`;
            } else {
              pathD = `M ${startX} ${startY} V ${stepY - r} Q ${startX} ${stepY} ${startX - r} ${stepY} H ${endX + r} Q ${endX} ${stepY} ${endX} ${stepY + r} V ${endY}`;
            }
            midX = (startX + endX) / 2;
            midY = stepY;
          }
        }

        return `
          <g id="trans-${idx}">
            <path d="${pathD}" fill="none" stroke="${primaryMain}" stroke-width="2" marker-end="url(#activity-arrow)" />
            ${t.guard ? `
              <g transform="translate(${midX}, ${midY})">
                <rect x="${-((t.guard.length * 7 + 16) / 2)}" y="-10" width="${t.guard.length * 7 + 16}" height="20" rx="10" fill="${bgPaper}" stroke="${divider}" stroke-width="1" />
                <text x="0" y="0" text-anchor="middle" dominant-baseline="central" fill="${textSecondary}" font-size="10" font-weight="700" font-family="'Outfit', sans-serif">[${escapeXml(t.guard)}]</text>
              </g>
            ` : ''}
          </g>
        `;
      }).join('') + `</g>`;

      // 3. Nodes
      const nodesSvg = `<g id="export-activity-nodes">` + nodes.map((node, idx) => {
        const p = activePositions[node.id] || autoPos[node.id] || { x: 400, y: idx * 110 + 80 };

        if (node.type === 'start') {
          const cx = p.x + 18;
          const cy = p.y + 18;
          return `
            <circle cx="${cx}" cy="${cy}" r="14" fill="#10B981" />
            <circle cx="${cx}" cy="${cy}" r="6" fill="${bgDefault}" />
          `;
        }
        if (node.type === 'end') {
          const cx = p.x + 18;
          const cy = p.y + 18;
          return `
            <circle cx="${cx}" cy="${cy}" r="15" fill="${bgPaper}" stroke="#EF4444" stroke-width="2" />
            <circle cx="${cx}" cy="${cy}" r="9" fill="#EF4444" />
          `;
        }
        if (node.type === 'fork' || node.type === 'join') {
          return `<rect x="${p.x}" y="${p.y}" width="160" height="12" rx="6" fill="${primaryMain}" />`;
        }
        if (node.type === 'decision') {
          const cx = p.x + 70;
          const cy = p.y + 35;
          const textSvg = renderCenteredTextLines(node.label, cx, cy, 110, { fontSize: 11, lineHeight: 14, fontWeight: 800 });
          return `
            <g id="decision-${node.id}">
              <polygon points="${cx},${p.y} ${p.x + 140},${cy} ${cx},${p.y + 70} ${p.x},${cy}" fill="${bgPaper}" stroke="${primaryMain}" stroke-width="1.5" />
              ${textSvg}
            </g>
          `;
        }
        // Action card
        const cx = p.x + 98;
        const cy = p.y + 27;
        const textSvg = renderCenteredTextLines(node.label, cx, cy, 175, { fontSize: 13, lineHeight: 16, fontWeight: 700 });
        return `
          <g id="action-${node.id}">
            <rect x="${p.x}" y="${p.y}" width="196" height="54" rx="12" fill="${bgPaper}" stroke="${primaryMain}" stroke-width="1.5" />
            ${textSvg}
          </g>
        `;
      }).join('') + `</g>`;

      innerSvgContent = swimlanesSvg + transitionsSvg + nodesSvg;
    } else if (tabKey === 'usecase') {
      const { actors, usecases, links } = parseUseCase(diagramCode);
      const autoPos = computeUseCaseAutoLayout(actors, usecases, links, useCaseActorPlacement);

      const rightActors = actors.filter(a => (activePositions[a.id]?.x || autoPos[a.id]?.x || 0) >= 600);
      const isDualColumn = rightActors.length > 0;
      const boxLeft = 240;
      const boxWidth = isDualColumn ? 680 : 480;
      const boxTop = 60;
      const boxHeight = Math.max(500, usecases.length * 110 + 120);

      const systemBoundarySvg = `
        <rect x="${boxLeft}" y="${boxTop}" width="${boxWidth}" height="${boxHeight}" rx="16" fill="${bgDefault}" stroke="${primaryMain}" stroke-width="1.5" stroke-dasharray="6,6" />
        <text x="${boxLeft + boxWidth / 2}" y="${boxTop + 24}" text-anchor="middle" dominant-baseline="central" fill="${primaryMain}" font-size="14" font-weight="900" font-family="'Outfit', sans-serif" letter-spacing="0.05em">SYSTEM BOUNDARY</text>
      `;

      const linksSvg = `<g id="export-usecase-links">` + (links || []).map(link => {
        const act = actors.find(a => a.id === link.source || a.name === link.source);
        const uc = usecases.find(u => u.id === link.target || u.name === link.target);
        if (!act || !uc) return '';
        const pAct = activePositions[act.id] || autoPos[act.id] || { x: 100, y: 150 };
        const pUc = activePositions[uc.id] || autoPos[uc.id] || { x: 420, y: 100 };

        const isActLeft = pAct.x < pUc.x;
        const startX = isActLeft ? pAct.x + 76 : pAct.x;
        const startY = pAct.y + 40;
        const endX = isActLeft ? pUc.x : pUc.x + 200;
        const endY = pUc.y + 25;

        return `<path d="M ${startX} ${startY} L ${endX} ${endY}" fill="none" stroke="${primaryMain}" stroke-width="1.5" marker-end="url(#usecase-arrow)" />`;
      }).join('') + `</g>`;

      const usecasesSvg = `<g id="export-usecases">` + usecases.map((uc, idx) => {
        const p = activePositions[uc.id] || autoPos[uc.id] || { x: 420, y: idx * 110 + 100 };
        const cx = p.x + 100;
        const cy = p.y + 25;
        const textSvg = renderCenteredTextLines(uc.label || uc.name, cx, cy, 180, { fontSize: 12, lineHeight: 15, fontWeight: 700 });
        return `
          <g id="uc-${uc.id}">
            <ellipse cx="${cx}" cy="${cy}" rx="100" ry="25" fill="${bgPaper}" stroke="${primaryMain}" stroke-width="1.5" />
            ${textSvg}
          </g>
        `;
      }).join('') + `</g>`;

      const actorsSvg = `<g id="export-actors">` + actors.map((act, idx) => {
        const p = activePositions[act.id] || autoPos[act.id] || { x: 100, y: idx * 180 + 150 };
        const cx = p.x + 38;
        return `
          <g id="act-${act.id}">
            <circle cx="${cx}" cy="${p.y + 24}" r="12" fill="${bgPaper}" stroke="${primaryMain}" stroke-width="3" />
            <line x1="${cx}" y1="${p.y + 36}" x2="${cx}" y2="${p.y + 68}" stroke="${primaryMain}" stroke-width="3" />
            <line x1="${cx - 20}" y1="${p.y + 46}" x2="${cx + 20}" y2="${p.y + 46}" stroke="${primaryMain}" stroke-width="3" />
            <line x1="${cx}" y1="${p.y + 68}" x2="${cx - 15}" y2="${p.y + 92}" stroke="${primaryMain}" stroke-width="3" />
            <line x1="${cx}" y1="${p.y + 68}" x2="${cx + 15}" y2="${p.y + 92}" stroke="${primaryMain}" stroke-width="3" />
            <text x="${cx}" y="${p.y + 106}" text-anchor="middle" dominant-baseline="central" fill="${textPrimary}" font-size="12" font-weight="800" font-family="'Outfit', sans-serif">${escapeXml(act.label || act.name)}</text>
          </g>
        `;
      }).join('') + `</g>`;

      innerSvgContent = systemBoundarySvg + linksSvg + usecasesSvg + actorsSvg;
    } else if (tabKey === 'er') {
      const { entities, relationships } = parseER(diagramCode);
      const autoPos = computeERAutoLayout(entities, relationships);

      const entitiesSvg = `<g id="export-er-entities">` + entities.map((entity, idx) => {
        const p = activePositions[entity.name] || autoPos[entity.name] || { x: (idx % 3) * 320 + 120, y: Math.floor(idx / 3) * 220 + 100 };
        const entW = getEntityWidth(entity.name);
        const cx = p.x + entW / 2;
        const cy = p.y + 25;
        return `
          <g id="ent-${entity.name}">
            <rect x="${p.x}" y="${p.y}" width="${entW}" height="50" rx="12" fill="${primaryMain}" />
            <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-size="14" font-weight="800" font-family="'Outfit', sans-serif" letter-spacing="0.5px">${escapeXml(entity.name)}</text>
          </g>
        `;
      }).join('') + `</g>`;

      let attributesSvg = `<g id="export-er-attributes">`;
      entities.forEach(entity => {
        const fields = entity.fields || [];
        fields.forEach(f => {
          const attrKey = `${entity.name}::attr::${f.name}`;
          const attrPos = activePositions[attrKey] || autoPos[attrKey];
          if (attrPos) {
            const isPk = f.isPk;
            const isFk = f.isFk;
            attributesSvg += `
              <ellipse cx="${attrPos.x}" cy="${attrPos.y}" rx="42" ry="18" fill="${bgPaper}" stroke="${isPk ? primaryMain : divider}" stroke-width="${isPk ? 2 : 1.5}" ${isFk ? 'stroke-dasharray="3,3"' : ''} />
              <text x="${attrPos.x}" y="${attrPos.y}" text-anchor="middle" dominant-baseline="central" fill="${textPrimary}" font-size="11" font-weight="${isPk ? 800 : 500}" font-family="'Outfit', sans-serif" ${isPk ? 'text-decoration="underline"' : ''}>${escapeXml(f.name)}</text>
            `;
          }
        });
      });
      attributesSvg += `</g>`;

      const relsSvg = `<g id="export-er-relationships">` + relationships.map(rel => {
        const relKey = `${rel.source}::rel::${rel.target}`;
        const relPos = activePositions[relKey] || autoPos[relKey];
        if (!relPos) return '';
        return `
          <g id="rel-${rel.source}-${rel.target}">
            <polygon points="${relPos.x},${relPos.y - 22} ${relPos.x + 40},${relPos.y} ${relPos.x},${relPos.y + 22} ${relPos.x - 40},${relPos.y}" fill="${bgPaper}" stroke="${primaryMain}" stroke-width="1.5" />
            <text x="${relPos.x}" y="${relPos.y}" text-anchor="middle" dominant-baseline="central" fill="${textPrimary}" font-size="11" font-weight="800" font-family="'Outfit', sans-serif">${escapeXml(rel.label || 'Rel')}</text>
          </g>
        `;
      }).join('') + `</g>`;

      innerSvgContent = entitiesSvg + attributesSvg + relsSvg;
    } else {
      // Sequence & Gantt fallback
      const inner = document.getElementById(activePositions._isPreview ? 'se-preview-canvas-inner' : 'se-main-canvas-inner');
      if (inner) {
        const clone = inner.cloneNode(true);
        let cloneHtml = clone.innerHTML
          .replaceAll('var(--primary-main)', primaryMain)
          .replaceAll('var(--primary-dark)', primaryDark)
          .replaceAll('var(--text-primary)', textPrimary)
          .replaceAll('var(--text-secondary)', textSecondary)
          .replaceAll('var(--background-paper)', bgPaper)
          .replaceAll('var(--background-default)', bgDefault)
          .replaceAll('var(--divider)', divider);
        return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="${x} ${y} ${width} ${height}" style="background-color: ${bgDefault}; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <defs>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&amp;display=swap');
    </style>
  </defs>
  <foreignObject x="0" y="0" width="4000" height="4000">
    <div xmlns="http://www.w3.org/1999/xhtml" style="width: 4000px; height: 4000px; position: relative; background-color: ${bgDefault}; color: ${textPrimary}; font-family: 'Outfit', sans-serif;">
      ${cloneHtml}
    </div>
  </foreignObject>
</svg>`;
      }
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="${x} ${y} ${width} ${height}" style="background-color: ${bgDefault}; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <defs>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&amp;display=swap');
    </style>
    <marker id="crow-foot-many" viewBox="0 0 20 20" refX="20" refY="10" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
      <path d="M 0 4 L 20 10 L 0 16 M 10 0 L 10 20" fill="none" stroke="${primaryMain}" stroke-width="2" />
    </marker>
    <marker id="crow-foot-one" viewBox="0 0 20 20" refX="20" refY="10" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
      <line x1="8" y1="2" x2="8" y2="18" stroke="${primaryMain}" stroke-width="2" />
      <line x1="14" y1="2" x2="14" y2="18" stroke="${primaryMain}" stroke-width="2" />
    </marker>
    <marker id="usecase-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9" fill="none" stroke="${primaryMain}" stroke-width="1.5" />
    </marker>
    <marker id="usecase-generalization-arrow" viewBox="0 0 12 12" refX="12" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 0 2 L 12 6 L 0 10 Z" fill="${bgDefault}" stroke="${primaryMain}" stroke-width="1.5" />
    </marker>
    <marker id="activity-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1.5 L 9 5 L 0 8.5 Z" fill="${primaryMain}" stroke="${primaryMain}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
    </marker>
  </defs>
  ${innerSvgContent}
</svg>`;
  };

  const renderSvgToPngBlob = (svgString, width, height, themeColors) => {
    return new Promise((resolve, reject) => {
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = width * 2;
          canvas.height = height * 2;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = themeColors.bgDefault;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);

          const W = canvas.width;
          const H = canvas.height;
          const pad = 20 * 2;
          const logoSize = 32 * 2;
          const fontSize = 22 * 2;
          const gap = 10 * 2;
          const sophiaText = 'Sophia';
          const pathText = 'Path';

          const logoImage = new Image();
          logoImage.src = logoImg;
          await new Promise((res) => {
            logoImage.onload = res;
            logoImage.onerror = res;
          });

          const logoH = logoSize;
          const logoW = logoImage.naturalWidth > 0
            ? Math.round(logoSize * (logoImage.naturalWidth / logoImage.naturalHeight))
            : logoSize;

          ctx.save();
          ctx.font = `900 ${fontSize}px "Outfit", sans-serif`;
          const sophiaWidth = ctx.measureText(sophiaText).width;
          const pathWidth = ctx.measureText(pathText).width;
          const totalWidth = logoW + gap + sophiaWidth + pathWidth;
          const startX = W - pad - totalWidth;
          const logoY = H - pad - logoH;
          const textBaselineY = H - pad - logoH * 0.15;

          if (logoImage.complete && logoImage.naturalWidth > 0) {
            const offscreen = document.createElement('canvas');
            offscreen.width = logoW;
            offscreen.height = logoH;
            const offCtx = offscreen.getContext('2d');
            offCtx.fillStyle = themeColors.primaryMain;
            offCtx.fillRect(0, 0, logoW / 2, logoH);
            offCtx.fillStyle = themeColors.primaryDark;
            offCtx.fillRect(logoW / 2, 0, logoW / 2, logoH);
            offCtx.globalCompositeOperation = 'destination-in';
            offCtx.drawImage(logoImage, 0, 0, logoW, logoH);

            ctx.globalAlpha = 0.5;
            ctx.drawImage(offscreen, startX, logoY, logoW, logoH);
          }

          ctx.globalAlpha = 0.5;
          ctx.font = `900 ${fontSize}px "Outfit", sans-serif`;
          ctx.fillStyle = themeColors.primaryMain;
          ctx.fillText(sophiaText, startX + logoW + gap, textBaselineY);
          ctx.fillStyle = themeColors.primaryDark;
          ctx.fillText(pathText, startX + logoW + gap + sophiaWidth, textBaselineY);
          ctx.restore();

          canvas.toBlob((pngBlob) => {
            resolve(pngBlob);
          }, 'image/png');
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };
      img.src = url;
    });
  };

  const handleDownloadPreviewPng = async () => {
    try {
      const bounds = getDiagramBounds(activeTabKey, code);
      const themeColors = getExportThemeColors();
      const svgDoc = generatePureDiagramSvg(activeTabKey, code, bounds, themeColors, { ...nodePositions, _isPreview: true });
      const pngBlob = await renderSvgToPngBlob(svgDoc, bounds.width + 80, bounds.height + 80, themeColors);
      if (pngBlob) {
        const link = document.createElement('a');
        link.download = `${activeTabKey}_diagram.png`;
        link.href = URL.createObjectURL(pngBlob);
        link.click();
        URL.revokeObjectURL(link.href);
      }
    } catch (err) {
      console.error('Failed to capture preview PNG:', err);
    }
  };

  const handleDownloadPng = async () => {
    try {
      const bounds = getDiagramBounds(activeTabKey, code);
      const themeColors = getExportThemeColors();
      const svgDoc = generatePureDiagramSvg(activeTabKey, code, bounds, themeColors, nodePositions);
      const pngBlob = await renderSvgToPngBlob(svgDoc, bounds.width + 80, bounds.height + 80, themeColors);
      if (pngBlob) {
        const link = document.createElement('a');
        link.download = `${activeTabKey}_diagram.png`;
        link.href = URL.createObjectURL(pngBlob);
        link.click();
        URL.revokeObjectURL(link.href);
      }
    } catch (err) {
      console.error('Failed to capture PNG:', err);
    }
  };

  const handleDownloadSvg = async () => {
    try {
      const bounds = getDiagramBounds(activeTabKey, code);
      const themeColors = getExportThemeColors();
      const svgDoc = generatePureDiagramSvg(activeTabKey, code, bounds, themeColors, nodePositions);
      const blob = new Blob([svgDoc], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeTabKey}_diagram.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export SVG:', err);
    }
  };

  const handleDownloadPreviewSvg = async () => {
    try {
      const bounds = getDiagramBounds(activeTabKey, code);
      const themeColors = getExportThemeColors();
      const svgDoc = generatePureDiagramSvg(activeTabKey, code, bounds, themeColors, { ...nodePositions, _isPreview: true });
      const blob = new Blob([svgDoc], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeTabKey}_diagram.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export preview SVG:', err);
    }
  };

  // Custom Local Parsers
  function parseER(text) {
    const entities = [];
    const relationships = [];
    const lines = text.split('\n');
    let currentEntity = null;
    let inAttributes = false;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('%%') || trimmed.startsWith('#')) return;

      const entityMatch = trimmed.match(/^ENTITY\s+([A-Za-z0-9_-]+)/i);
      if (entityMatch) {
        currentEntity = { name: entityMatch[1], fields: [] };
        entities.push(currentEntity);
        inAttributes = false;
        return;
      }

      if (trimmed.toUpperCase() === 'ATTRIBUTES') {
        inAttributes = true;
        return;
      }

      const relMatch = trimmed.match(/^RELATIONSHIP\s+([A-Za-z0-9_-]+)\s+(ONE|MANY)\s+([A-Za-z0-9_-]+)\s+([A-Za-z0-9_-]+)\s+(ONE|MANY)/i);
      if (relMatch) {
        inAttributes = false;
        currentEntity = null;
        const relLabel = relMatch[3].toUpperCase() === 'TO' ? '' : relMatch[3];
        relationships.push({
          source: relMatch[1],
          sourceCard: relMatch[2].toUpperCase(),
          target: relMatch[4],
          targetCard: relMatch[5].toUpperCase(),
          label: relLabel
        });
        return;
      }

      if (currentEntity && inAttributes) {
        const attrMatch = trimmed.match(/^([A-Za-z0-9_-]+)\s*:\s*([A-Za-z0-9_-]+)(?:\s+(PRIMARY KEY|FOREIGN KEY))?/i);
        if (attrMatch) {
          currentEntity.fields.push({
            name: attrMatch[1],
            type: attrMatch[2],
            key: attrMatch[3] ? (attrMatch[3].toUpperCase() === 'PRIMARY KEY' ? 'PK' : 'FK') : ''
          });
        }
      }
    });

    return { entities, relationships };
  }

  function organizeERCode(codeText) {
    const { entities, relationships } = parseER(codeText);
    
    let organizedText = '';
    
    // 1. Write Entities
    entities.forEach((entity) => {
      organizedText += `ENTITY ${entity.name}\n`;
      if (entity.fields && entity.fields.length > 0) {
        organizedText += `ATTRIBUTES\n`;
        entity.fields.forEach(f => {
          const keyType = f.key === 'PK' ? ' PRIMARY KEY' : (f.key === 'FK' ? ' FOREIGN KEY' : '');
          organizedText += `  ${f.name} : ${f.type}${keyType}\n`;
        });
      }
      organizedText += `\n`;
    });
    
    // 2. Write Relationships
    relationships.forEach(rel => {
      const relName = rel.label || 'TO';
      organizedText += `RELATIONSHIP ${rel.source} ${rel.sourceCard} ${relName} ${rel.target} ${rel.targetCard}\n`;
    });
    
    return organizedText.trim();
  }

  function parseUseCase(text) {
    const actors = [];
    const usecases = [];
    const links = [];
    let systemName = 'System Boundary';
    const lines = text.split('\n');

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('%%') || trimmed.startsWith('#')) return;

      const systemMatch = trimmed.match(/^SYSTEM\s+(.+)$/i);
      if (systemMatch) {
        systemName = systemMatch[1];
        return;
      }

      const actorMatch = trimmed.match(/^ACTOR\s+([A-Za-z0-9_\-\s]+)$/i);
      if (actorMatch) {
        const id = actorMatch[1].trim().replace(/\s+/g, '_');
        actors.push({ id, label: actorMatch[1].trim() });
        return;
      }

      const ucMatch = trimmed.match(/^USE\s+CASE\s+([A-Za-z0-9_\-\s]+)$/i);
      if (ucMatch) {
        const id = ucMatch[1].trim().replace(/\s+/g, '_');
        usecases.push({ id, label: ucMatch[1].trim() });
        return;
      }

      const assocMatch = trimmed.match(/^([A-Za-z0-9_\-\s]+)\s*->\s*([A-Za-z0-9_\-\s]+)$/i);
      if (assocMatch) {
        const src = assocMatch[1].trim();
        const tgt = assocMatch[2].trim();
        const srcId = src.replace(/\s+/g, '_');
        const tgtId = tgt.replace(/\s+/g, '_');

        if (!actors.find(a => a.id === srcId) && !usecases.find(u => u.id === srcId)) {
          usecases.push({ id: srcId, label: src });
        }
        if (!actors.find(a => a.id === tgtId) && !usecases.find(u => u.id === tgtId)) {
          usecases.push({ id: tgtId, label: tgt });
        }

        links.push({ source: srcId, target: tgtId, label: '' });
        return;
      }

      const extendMatch = trimmed.match(/^([A-Za-z0-9_\-\s]+)\s+(EXTENDS|INCLUDES|EXTEND|INCLUDE|INHERITS)\s+([A-Za-z0-9_\-\s]+)$/i);
      if (extendMatch) {
        const src = extendMatch[1].trim();
        const tgt = extendMatch[3].trim();
        const srcId = src.replace(/\s+/g, '_');
        const tgtId = tgt.replace(/\s+/g, '_');

        if (!actors.find(a => a.id === srcId) && !usecases.find(u => u.id === srcId)) {
          usecases.push({ id: srcId, label: src });
        }
        if (!actors.find(a => a.id === tgtId) && !usecases.find(u => u.id === tgtId)) {
          usecases.push({ id: tgtId, label: tgt });
        }

        let type = extendMatch[2].toUpperCase();
        if (type === 'EXTENDS') type = 'EXTEND';
        if (type === 'INCLUDES') type = 'INCLUDE';
        
        links.push({ source: srcId, target: tgtId, label: type });
        return;
      }
    });

    return { systemName, actors, usecases, links };
  }

  function computeERAutoLayout(entities, relationships) {
    const positions = {};
    const entityH = 50;

    if (!entities || entities.length === 0) return {};

    // 1. Build Adjacency Graph & Degrees
    const adj = {};
    const degree = {};
    entities.forEach(e => {
      adj[e.name] = [];
      degree[e.name] = 0;
    });

    relationships.forEach(rel => {
      if (adj[rel.source] && adj[rel.target]) {
        if (!adj[rel.source].includes(rel.target)) adj[rel.source].push(rel.target);
        if (!adj[rel.target].includes(rel.source)) adj[rel.target].push(rel.source);
        degree[rel.source] = (degree[rel.source] || 0) + 1;
        degree[rel.target] = (degree[rel.target] || 0) + 1;
      }
    });

    // Helper: calculate entity envelope radius (card width/height + attribute halo)
    const getEntityEnvelope = (name) => {
      const ent = entities.find(e => e.name === name);
      const w = getEntityWidth(name);
      const numAttrs = (ent?.fields || []).length;
      const rx = numAttrs > 0 ? Math.max(w / 2 + 18, 52 + numAttrs * 2.5) : w / 2;
      const ry = numAttrs > 0 ? Math.max(36, 28 + numAttrs * 1.6) : 25;
      return { rx: rx + 24, ry: ry + 24, w, h: entityH };
    };

    // 2. Identify Connected Components
    const visited = new Set();
    const components = [];

    entities.forEach(e => {
      if (!visited.has(e.name)) {
        const comp = [];
        const queue = [e.name];
        visited.add(e.name);

        while (queue.length > 0) {
          const curr = queue.shift();
          comp.push(curr);
          (adj[curr] || []).forEach(nbr => {
            if (!visited.has(nbr)) {
              visited.add(nbr);
              queue.push(nbr);
            }
          });
        }
        components.push(comp);
      }
    });

    // Sort components by size descending
    components.sort((a, b) => b.length - a.length);

    let currentCompX = 600;
    let currentCompY = 450;
    const placedNodes = new Set();

    // 3. Process Each Connected Component starting with the entity with MOST relationships
    components.forEach((compNodeNames, cIdx) => {
      // Find entity with the most relationships in this component
      const sortedComp = [...compNodeNames].sort((a, b) => {
        const dDiff = (degree[b] || 0) - (degree[a] || 0);
        if (dDiff !== 0) return dDiff;
        return a.localeCompare(b);
      });

      const rootName = sortedComp[0];
      const rootPos = { x: currentCompX + cIdx * 900, y: currentCompY };
      positions[rootName] = { x: rootPos.x, y: rootPos.y };
      placedNodes.add(rootName);

      // Recursive Branching Queue
      const branchAngles = {}; // entityName -> angle in radians from parent
      const queue = [rootName];

      while (queue.length > 0) {
        const curr = queue.shift();
        const currPos = positions[curr];
        const currEnv = getEntityEnvelope(curr);

        // Get unplaced neighbors of curr, sorted by degree descending
        const unplacedNeighbors = (adj[curr] || [])
          .filter(nbr => !placedNodes.has(nbr))
          .sort((a, b) => (degree[b] || 0) - (degree[a] || 0));

        if (unplacedNeighbors.length === 0) continue;

        const count = unplacedNeighbors.length;

        // Determine base angular distribution
        const incomingAngle = branchAngles[curr];
        let angles = [];

        if (incomingAngle === undefined) {
          // Root entity: full circle distribution
          if (count === 1) angles = [-Math.PI / 2];
          else if (count === 2) angles = [Math.PI, 0];
          else if (count === 3) angles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];
          else if (count === 4) angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
          else {
            for (let i = 0; i < count; i++) {
              angles.push(-Math.PI / 2 + (2 * Math.PI * i) / count);
            }
          }
        } else {
          // Branch entity: outward fan facing away from parent
          const baseOutwardAngle = incomingAngle;
          if (count === 1) {
            angles = [baseOutwardAngle];
          } else {
            const spread = Math.min(Math.PI * 0.9, 0.42 * count + 0.3);
            for (let i = 0; i < count; i++) {
              angles.push(baseOutwardAngle - spread / 2 + (spread * i) / (count - 1));
            }
          }
        }

        unplacedNeighbors.forEach((nbrName, idx) => {
          placedNodes.add(nbrName);
          const angle = angles[idx];
          branchAngles[nbrName] = angle;
          const nbrEnv = getEntityEnvelope(nbrName);

          // Distance accounting for both entity attribute halos + relationship diamond clearance
          const dist = currEnv.rx + nbrEnv.rx + 85;

          const nbrX = Math.round(currPos.x + dist * Math.cos(angle));
          const nbrY = Math.round(currPos.y + dist * Math.sin(angle));

          positions[nbrName] = { x: nbrX, y: nbrY };
          queue.push(nbrName);
        });
      }
    });

    // Fallback for any unvisited isolated entities
    entities.forEach((e, idx) => {
      if (!positions[e.name]) {
        const angle = (2 * Math.PI * idx) / entities.length;
        positions[e.name] = {
          x: currentCompX + 250 * Math.cos(angle),
          y: currentCompY + 250 * Math.sin(angle)
        };
      }
    });

    // 4. Layout Attributes in Genuinely Unblocked Exterior Sectors
    entities.forEach(entity => {
      const coord = positions[entity.name];
      if (!coord) return;

      const ew = getEntityWidth(entity.name);
      const cx = coord.x + ew / 2;
      const cy = coord.y + entityH / 2;
      const fields = entity.fields || [];
      const numFields = fields.length;
      if (numFields === 0) return;

      const blockedAngles = [];

      // Block angles towards all connected relationships
      relationships.forEach(rel => {
        let otherName = null;
        if (rel.source === entity.name) otherName = rel.target;
        else if (rel.target === entity.name) otherName = rel.source;
        if (otherName && positions[otherName]) {
          const oW = getEntityWidth(otherName);
          const oCx = positions[otherName].x + oW / 2;
          const oCy = positions[otherName].y + entityH / 2;
          blockedAngles.push({ angle: Math.atan2(oCy - cy, oCx - cx), span: Math.PI / 4.2 });
        }
      });

      // Block angles towards any other nearby entity within 300px
      entities.forEach(other => {
        if (other.name !== entity.name && positions[other.name]) {
          const oW = getEntityWidth(other.name);
          const oCx = positions[other.name].x + oW / 2;
          const oCy = positions[other.name].y + entityH / 2;
          const dist = Math.hypot(oCx - cx, oCy - cy);
          if (dist < 300) {
            const span = Math.max(Math.PI / 4.5, Math.atan2(entityH + 30, dist));
            blockedAngles.push({ angle: Math.atan2(oCy - cy, oCx - cx), span });
          }
        }
      });

      const isAngleBlocked = (ang) => {
        return blockedAngles.some(b => {
          let diff = Math.abs(ang - b.angle);
          while (diff > Math.PI) diff = Math.abs(diff - 2 * Math.PI);
          return diff < b.span;
        });
      };

      const candidateAngles = [];
      const steps = 72;
      for (let s = 0; s < steps; s++) {
        const ang = -Math.PI + (2 * Math.PI * s) / steps;
        if (!isAngleBlocked(ang)) {
          candidateAngles.push(ang);
        }
      }

      const chosenAngles = [];
      if (candidateAngles.length >= numFields) {
        for (let i = 0; i < numFields; i++) {
          const idx = Math.floor((i * candidateAngles.length) / numFields);
          chosenAngles.push(candidateAngles[idx]);
        }
      } else {
        for (let i = 0; i < numFields; i++) {
          chosenAngles.push(-Math.PI / 2 + (2 * Math.PI * i) / numFields);
        }
      }

      const Rx = Math.max(ew / 2 + 18, 52 + numFields * 2.5);
      const Ry = Math.max(36, 28 + numFields * 1.6);

      fields.forEach((f, idx) => {
        const attrKey = `${entity.name}::attr::${f.name}`;
        const angle = chosenAngles[idx];
        positions[attrKey] = {
          x: Math.round(cx + Rx * Math.cos(angle)),
          y: Math.round(cy + Ry * Math.sin(angle))
        };
      });
    });

    // 5. Layout Relationship Diamonds at Exact Midpoints
    relationships.forEach(rel => {
      const relKey = `${rel.source}::rel::${rel.target}`;
      const start = positions[rel.source] || { x: 200, y: 200 };
      const end = positions[rel.target] || { x: 200, y: 200 };
      const w1 = getEntityWidth(rel.source);
      const w2 = getEntityWidth(rel.target);
      const cx1 = start.x + w1 / 2;
      const cy1 = start.y + entityH / 2;
      const cx2 = end.x + w2 / 2;
      const cy2 = end.y + entityH / 2;

      positions[relKey] = {
        x: Math.round((cx1 + cx2) / 2),
        y: Math.round((cy1 + cy2) / 2)
      };
    });

    // 6. Overlap & Clearance Post-Pass
    const nodeBoxes = [];
    entities.forEach(e => {
      (e.fields || []).forEach(f => {
        const attrKey = `${e.name}::attr::${f.name}`;
        if (positions[attrKey]) {
          nodeBoxes.push({
            id: attrKey,
            hw: 38 + 8,
            hh: 16 + 8,
            cx: positions[attrKey].x,
            cy: positions[attrKey].y
          });
        }
      });
    });

    for (let iter = 0; iter < 30; iter++) {
      let moved = false;
      for (let i = 0; i < nodeBoxes.length; i++) {
        for (let j = i + 1; j < nodeBoxes.length; j++) {
          const a = nodeBoxes[i];
          const b = nodeBoxes[j];
          const dx = b.cx - a.cx;
          const dy = b.cy - a.cy;
          const overlapX = (a.hw + b.hw) - Math.abs(dx);
          const overlapY = (a.hh + b.hh) - Math.abs(dy);

          if (overlapX > 0 && overlapY > 0) {
            moved = true;
            const signX = dx >= 0 ? 1 : -1;
            const signY = dy >= 0 ? 1 : -1;
            if (overlapX < overlapY) {
              a.cx -= (overlapX / 2) * signX;
              b.cx += (overlapX / 2) * signX;
            } else {
              a.cy -= (overlapY / 2) * signY;
              b.cy += (overlapY / 2) * signY;
            }
          }
        }
      }
      if (!moved) break;
    }

    nodeBoxes.forEach(box => {
      if (positions[box.id]) {
        positions[box.id] = {
          x: Math.round(box.cx),
          y: Math.round(box.cy)
        };
      }
    });

    // 7. Normalize Coordinates (minX >= 100, minY >= 100)
    let minX = Infinity;
    let minY = Infinity;
    Object.keys(positions).forEach(key => {
      const pos = positions[key];
      if (pos.x < minX) minX = pos.x;
      if (pos.y < minY) minY = pos.y;
    });

    const shiftX = 100 - minX;
    const shiftY = 100 - minY;
    Object.keys(positions).forEach(key => {
      positions[key].x = Math.round(positions[key].x + shiftX);
      positions[key].y = Math.round(positions[key].y + shiftY);
    });

    return positions;
  }

  /**
   * Computes a clean 3-column UML use-case auto-layout:
   *
   *  LEFT   │  CENTER (system boundary)  │  RIGHT
   * ────────┼───────────────────────────┼──────────────────
   *  Actors │  Primary use cases         │  Secondary use cases
   *         │  (directly connected       │  (connected only via
   *         │   to actors)               │   extend/include/inherits)
   *
   * Pipeline:
   *  1. Split links: actor↔uc vs uc↔uc (extend/include/inherits).
   *  2. Classify use cases:
   *       Primary   = directly reachable from any actor.
   *       Secondary = everything else (only reachable via uc↔uc links).
   *  3. Order primary UCs by which actor (in actor-declaration order)
   *     first connects to them, so the actor's lines fan outward cleanly.
   *  4. Order secondary UCs by which primary UC they extend/include,
   *     keeping related secondaries together with a small gap between groups.
   *  5. Each actor is positioned at the exact Y-midpoint of the primary
   *     UCs it connects to — no fixed grid spacing needed.
   */
  function computeUseCaseAutoLayout(actors, usecases, links, placement = 'both') {
    if (usecases.length === 0 && actors.length === 0) return {};

    const UC_W = 200;
    const UC_H = 50;
    const UC_GAP_PRIMARY  = 22;   // halved vertical gap between primary UCs
    const UC_GAP_SECONDARY = 19;  // halved vertical gap between secondary UCs
    const AC_W = 76;
    const AC_H = 118;            // bounding box for actor stickman + text label with comfortable clearance
    const ACTOR_PADDING = 85;     // comfortable vertical padding between actors so no line crosses any actor/text
    const LEFT_X          = 100;  // left edge of root actor column
    const MARGIN_TOP      = 80;
    const ACTOR_COL_WIDTH = 150;  // lowered horizontal separation between parent and child actor columns

    const positions  = {};
    const actorIds   = new Set(actors.map(a => a.id));
    const ucIds      = new Set(usecases.map(u => u.id));

    // ── Step 0: Split links and determine Actor Hierarchy & Levels ───────
    const ucUcLinks    = links.filter(l => ucIds.has(l.source) && ucIds.has(l.target));
    const actorUcLinks = links.filter(l => actorIds.has(l.source) || actorIds.has(l.target));
    const inheritsLinks = links.filter(l => l.label === 'INHERITS');
    
    // Map actor ID to its parent ID
    const parentMap = {};
    inheritsLinks.forEach(l => {
      parentMap[l.source] = l.target;
    });

    // Map actor ID to its children IDs
    const childrenMap = {};
    actors.forEach(a => {
      childrenMap[a.id] = [];
    });
    inheritsLinks.forEach(l => {
      if (childrenMap[l.target]) {
        childrenMap[l.target].push(l.source);
      }
    });

    // Compute levels (depths in inheritance tree)
    const actorLevels = {};
    const getLevel = (actorId, visitedMap = new Set()) => {
      if (actorLevels[actorId] !== undefined) return actorLevels[actorId];
      if (visitedMap.has(actorId)) {
        actorLevels[actorId] = 0;
        return 0;
      }
      visitedMap.add(actorId);
      const parentId = parentMap[actorId];
      if (!parentId) {
        actorLevels[actorId] = 0;
        return 0;
      }
      actorLevels[actorId] = getLevel(parentId, visitedMap) + 1;
      return actorLevels[actorId];
    };
    actors.forEach(a => getLevel(a.id));

    // Find all root actors (level 0)
    const roots = actors.filter(a => actorLevels[a.id] === 0);

    // Partition actor trees between LEFT and RIGHT sides based on user choice ('left' | 'right' | 'both')
    const leftActorIds = new Set();
    const rightActorIds = new Set();
    const actorSide = {}; // actorId -> 'left' | 'right'

    const markTreeSide = (actorId, side, set) => {
      set.add(actorId);
      actorSide[actorId] = side;
      const kids = childrenMap[actorId] || [];
      kids.forEach(k => markTreeSide(k, side, set));
    };

    if (placement === 'left') {
      roots.forEach(r => markTreeSide(r.id, 'left', leftActorIds));
    } else if (placement === 'right') {
      roots.forEach(r => markTreeSide(r.id, 'right', rightActorIds));
    } else {
      // 'both': distribute across Left and Right if >= 2 roots exist
      if (roots.length <= 1) {
        roots.forEach(r => markTreeSide(r.id, 'left', leftActorIds));
      } else {
        const numLeftRoots = Math.ceil(roots.length / 2);
        roots.slice(0, numLeftRoots).forEach(r => markTreeSide(r.id, 'left', leftActorIds));
        roots.slice(numLeftRoots).forEach(r => markTreeSide(r.id, 'right', rightActorIds));
      }
    }

    // Fallback for any actor not captured in roots
    actors.forEach(a => {
      if (!actorSide[a.id]) {
        const fallbackSide = placement === 'right' ? 'right' : 'left';
        if (fallbackSide === 'right') rightActorIds.add(a.id);
        else leftActorIds.add(a.id);
        actorSide[a.id] = fallbackSide;
      }
    });

    // Affinity helper: calculates how strongly an actor is connected to features shared with opposite-side actors
    const getActorCrossSideScore = (actorId) => {
      const side = actorSide[actorId] || 'left';
      let score = 0;
      actorUcLinks.forEach(l => {
        const aId = actorIds.has(l.source) ? l.source : l.target;
        const uId = actorIds.has(l.source) ? l.target : l.source;
        if (aId === actorId && ucIds.has(uId)) {
          // Check if this use case is shared with any other actor
          actorUcLinks.forEach(otherL => {
            const otherAId = actorIds.has(otherL.source) ? otherL.source : otherL.target;
            const otherUId = actorIds.has(otherL.source) ? otherL.target : otherL.source;
            if (otherUId === uId && otherAId !== actorId) {
              const otherSide = actorSide[otherAId];
              if (otherSide && otherSide !== side) {
                score += 10; // shared across sides -> position closer to the boundary
              } else {
                score += 1;
              }
            }
          });
        }
      });
      return score;
    };

    roots.sort((a, b) => {
      const hasKidsA = (childrenMap[a.id] && childrenMap[a.id].length > 0) ? 1 : 0;
      const hasKidsB = (childrenMap[b.id] && childrenMap[b.id].length > 0) ? 1 : 0;
      if (hasKidsA !== hasKidsB) return hasKidsB - hasKidsA;
      const crossA = getActorCrossSideScore(a.id);
      const crossB = getActorCrossSideScore(b.id);
      if (crossA !== crossB) return crossA - crossB;
      return actors.indexOf(a) - actors.indexOf(b);
    });

    // Group/traverse actors hierarchically per side (parents on top, children below)
    const visited = new Set();
    const sortedLeftActors = [];
    const sortedRightActors = [];

    const traverseActor = (actorId, targetList) => {
      if (visited.has(actorId)) return;
      visited.add(actorId);
      
      const actorObj = actors.find(a => a.id === actorId);
      if (actorObj) {
        targetList.push(actorObj);
      }
      
      const kids = childrenMap[actorId] || [];
      kids.sort((a, b) => {
        const crossA = getActorCrossSideScore(a);
        const crossB = getActorCrossSideScore(b);
        if (crossA !== crossB) return crossA - crossB;
        const idxA = actors.findIndex(x => x.id === a);
        const idxB = actors.findIndex(x => x.id === b);
        return idxA - idxB;
      });
      kids.forEach(k => traverseActor(k, targetList));
    };

    roots.filter(r => actorSide[r.id] === 'left').forEach(r => traverseActor(r.id, sortedLeftActors));
    roots.filter(r => actorSide[r.id] === 'right').forEach(r => traverseActor(r.id, sortedRightActors));
    actors.forEach(a => {
      if (!visited.has(a.id)) {
        if (actorSide[a.id] === 'right') sortedRightActors.push(a);
        else sortedLeftActors.push(a);
      }
    });

    const sortedActors = [...sortedLeftActors, ...sortedRightActors];

    // Calculate maximum left actor level to determine primary column X coordinate dynamically
    const maxLeftLevel = sortedLeftActors.length > 0 ? Math.max(...sortedLeftActors.map(a => actorLevels[a.id] || 0)) : 0;
    const PRIMARY_COL_X = sortedLeftActors.length > 0
      ? Math.max(520, LEFT_X + maxLeftLevel * ACTOR_COL_WIDTH + 340)
      : 220;
    const SECONDARY_COL_X = PRIMARY_COL_X + 460;

    // ── Step 2: classify use cases ───────────────────────────────────────
    const primaryUcIds = new Set();
    actorUcLinks.forEach(l => {
      const ucId = actorIds.has(l.source) ? l.target : l.source;
      if (ucIds.has(ucId)) primaryUcIds.add(ucId);
    });
    const secondaryUcIds = new Set([...ucIds].filter(id => !primaryUcIds.has(id)));

    const primaryUcs   = usecases.filter(uc => primaryUcIds.has(uc.id));
    const secondaryUcs = usecases.filter(uc => secondaryUcIds.has(uc.id));

    // ── Step 3: order primary UCs ────────────────────────────────────────
    // Rules:
    // 1. Never cut/fragment an actor's features; keep each actor's features contiguous.
    // 2. Prioritise use cases with least actors (exclusive) to be in the core/middle of the actor's cluster.
    // 3. Place use cases with multiple/many actors accessing them at the boundary/side in between those actors.
    const ucActorData = {};
    primaryUcs.forEach(uc => {
      const actorIndices = [];
      let hasLeft = false;
      let hasRight = false;

      actorUcLinks.forEach(l => {
        const ucId    = actorIds.has(l.source) ? l.target : l.source;
        const actorId = actorIds.has(l.source) ? l.source : l.target;
        if (ucId === uc.id) {
          const aIdx = sortedActors.findIndex(a => a.id === actorId);
          if (aIdx !== -1 && !actorIndices.includes(aIdx)) {
            actorIndices.push(aIdx);
          }
          if (actorSide[actorId] === 'left') hasLeft = true;
          if (actorSide[actorId] === 'right') hasRight = true;
        }
      });
      actorIndices.sort((a, b) => a - b);
      const firstIdx = actorIndices.length > 0 ? actorIndices[0] : 9999;
      const actorCount = actorIndices.length;
      const isShared = actorCount > 1;
      const nextActorIdx = isShared ? actorIndices[1] : firstIdx;

      // Group affinity: 0 = left only, 1 = shared (left & right), 2 = right only
      let sideAffinity = 0;
      if (hasLeft && hasRight) sideAffinity = 1;
      else if (hasRight && !hasLeft) sideAffinity = 2;

      ucActorData[uc.id] = {
        firstIdx,
        actorCount,
        isShared,
        nextActorIdx,
        sideAffinity,
        originalIdx: usecases.indexOf(uc)
      };
    });

    primaryUcs.sort((a, b) => {
      const dataA = ucActorData[a.id];
      const dataB = ucActorData[b.id];
      // 1. Group under the primary actor (never cut or fragment an actor's features)
      if (dataA.firstIdx !== dataB.firstIdx) {
        return dataA.firstIdx - dataB.firstIdx;
      }
      // 2. Put least-actor use cases first (in the middle/core of the actor's cluster),
      //    and high-actor shared use cases on the side in between transitioning to the next actor
      if (dataA.actorCount !== dataB.actorCount) {
        return dataA.actorCount - dataB.actorCount;
      }
      // 3. If both are shared with the same actor count, sort by the next actor they connect to
      if (dataA.nextActorIdx !== dataB.nextActorIdx) {
        return dataA.nextActorIdx - dataB.nextActorIdx;
      }
      // 4. Preserve declaration order
      return dataA.originalIdx - dataB.originalIdx;
    });

    // ── Step 4: lay out primary UCs (Dual-Column when actors are on both sides) ──
    const isDualColumn = (placement === 'both' || placement === undefined) &&
      sortedLeftActors.length > 0 &&
      sortedRightActors.length > 0;

    let LEFT_UC_COL_X = PRIMARY_COL_X;
    let RIGHT_UC_COL_X = PRIMARY_COL_X + 280;
    let MID_UC_COL_X = (LEFT_UC_COL_X + RIGHT_UC_COL_X) / 2;
    if (!isDualColumn) {
      LEFT_UC_COL_X = PRIMARY_COL_X;
      RIGHT_UC_COL_X = PRIMARY_COL_X;
      MID_UC_COL_X = PRIMARY_COL_X;
    }

    const primaryYCenter = {}; // ucId → Y of the ellipse's centre

    if (isDualColumn) {
      // Separate primary use cases into Left-only, Right-only, and Shared
      const leftColUcs = primaryUcs.filter(uc => ucActorData[uc.id]?.sideAffinity === 0);
      const rightColUcs = primaryUcs.filter(uc => ucActorData[uc.id]?.sideAffinity === 2);
      const sharedColUcs = primaryUcs.filter(uc => ucActorData[uc.id]?.sideAffinity === 1 || ucActorData[uc.id]?.sideAffinity === undefined);

      // Layout left column UCs
      let leftY = MARGIN_TOP;
      leftColUcs.forEach(uc => {
        positions[uc.id] = { x: LEFT_UC_COL_X - UC_W / 2, y: leftY };
        primaryYCenter[uc.id] = leftY + UC_H / 2;
        leftY += UC_H + UC_GAP_PRIMARY;
      });

      // Layout right column UCs
      let rightY = MARGIN_TOP;
      rightColUcs.forEach(uc => {
        positions[uc.id] = { x: RIGHT_UC_COL_X - UC_W / 2, y: rightY };
        primaryYCenter[uc.id] = rightY + UC_H / 2;
        rightY += UC_H + UC_GAP_PRIMARY;
      });

      // Layout shared UCs centered in between
      let sharedY = Math.max(leftY, rightY);
      sharedColUcs.forEach(uc => {
        positions[uc.id] = { x: MID_UC_COL_X - UC_W / 2, y: sharedY };
        primaryYCenter[uc.id] = sharedY + UC_H / 2;
        sharedY += UC_H + UC_GAP_PRIMARY;
      });
    } else {
      // Single column layout
      let primaryY = MARGIN_TOP;
      primaryUcs.forEach(uc => {
        positions[uc.id] = { x: PRIMARY_COL_X - UC_W / 2, y: primaryY };
        primaryYCenter[uc.id] = primaryY + UC_H / 2;
        primaryY += UC_H + UC_GAP_PRIMARY;
      });
    }

    // ── Step 5: order secondary UCs by their nearest primary UC ──────────
    const getParentPrimary = (ucId, depth = 0) => {
      if (depth > 20) return null;
      const parentLink = ucUcLinks.find(
        l => (l.source === ucId && ucIds.has(l.target)) ||
             (l.target === ucId && ucIds.has(l.source))
      );
      if (!parentLink) return null;
      const parentId = parentLink.source === ucId ? parentLink.target : parentLink.source;
      if (primaryUcIds.has(parentId)) return parentId;
      return getParentPrimary(parentId, depth + 1);
    };

    const ucParentPrimary = {};
    secondaryUcs.forEach(uc => { ucParentPrimary[uc.id] = getParentPrimary(uc.id); });

    secondaryUcs.sort((a, b) => {
      const aParent = ucParentPrimary[a.id];
      const bParent = ucParentPrimary[b.id];
      const aIdx = aParent ? primaryUcs.findIndex(p => p.id === aParent) : 9999;
      const bIdx = bParent ? primaryUcs.findIndex(p => p.id === bParent) : 9999;
      if (aIdx !== bIdx) return aIdx - bIdx;
      return usecases.indexOf(a) - usecases.indexOf(b);
    });

    // ── Step 6: lay out secondary UCs aligned with their parent primary UC ─
    const secGroups = new Map();
    secondaryUcs.forEach(uc => {
      const parent = ucParentPrimary[uc.id] ?? null;
      if (!secGroups.has(parent)) secGroups.set(parent, []);
      secGroups.get(parent).push(uc);
    });

    const orderedParents = [
      ...primaryUcs.map(p => p.id).filter(id => secGroups.has(id)),
      ...(secGroups.has(null) ? [null] : [])
    ];

    let prevGroupBottom = -Infinity;

    orderedParents.forEach(parentId => {
      const group = secGroups.get(parentId) || [];
      if (group.length === 0) return;

      const parentCenterY = parentId ? (primaryYCenter[parentId] ?? MARGIN_TOP) : MARGIN_TOP;
      const groupH = group.length * UC_H + (group.length - 1) * UC_GAP_SECONDARY;

      let groupTop = parentCenterY - groupH / 2;
      const minTop = prevGroupBottom + UC_GAP_SECONDARY;
      if (groupTop < minTop) groupTop = minTop;

      const parentPos = parentId && positions[parentId] ? positions[parentId] : { x: PRIMARY_COL_X - UC_W / 2 };
      const secX = isDualColumn ? (RIGHT_UC_COL_X + 260 - UC_W / 2) : (SECONDARY_COL_X - UC_W / 2);

      group.forEach((uc, idx) => {
        positions[uc.id] = {
          x: secX,
          y: groupTop + idx * (UC_H + UC_GAP_SECONDARY)
        };
      });

      prevGroupBottom = groupTop + groupH;
    });

    // ── Step 7: position actors (Left and Right) with guaranteed vertical padding ──
    const maxPrimaryOrSecX = isDualColumn
      ? (secondaryUcs.length > 0 ? (RIGHT_UC_COL_X + 260 + UC_W / 2) : (RIGHT_UC_COL_X + UC_W / 2))
      : (secondaryUcs.length > 0 ? (SECONDARY_COL_X + UC_W / 2) : (PRIMARY_COL_X + UC_W / 2));
    const RIGHT_BASE_X = maxPrimaryOrSecX + 220;

    const prevBottomPerLevelLeft = {};
    const prevBottomPerLevelRight = {};

    // Position Left Actors (Parent on top/outer-left, children below/inner-right)
    sortedLeftActors.forEach((actor) => {
      const level = actorLevels[actor.id] || 0;
      const prevBottom = prevBottomPerLevelLeft[level] !== undefined ? prevBottomPerLevelLeft[level] : (MARGIN_TOP - ACTOR_PADDING);

      const connectedYs = actorUcLinks
        .filter(l => l.source === actor.id || l.target === actor.id)
        .map(l => {
          const ucId = l.source === actor.id ? l.target : l.source;
          return primaryYCenter[ucId] ?? null;
        })
        .filter(y => y !== null);

      let idealCenterY;
      if (connectedYs.length > 0) {
        idealCenterY = connectedYs.reduce((a, b) => a + b, 0) / connectedYs.length;
      } else {
        const parentId = parentMap[actor.id];
        if (parentId && positions[parentId]) {
          idealCenterY = positions[parentId].y + AC_H / 2;
        } else {
          idealCenterY = prevBottom + ACTOR_PADDING + AC_H / 2;
        }
      }

      let actorTop = idealCenterY - AC_H / 2;
      const minTop = prevBottom + ACTOR_PADDING;
      if (actorTop < minTop) {
        actorTop = minTop;
      }

      const actorX = LEFT_X + level * ACTOR_COL_WIDTH;
      positions[actor.id] = { x: actorX, y: actorTop };
      prevBottomPerLevelLeft[level] = actorTop + AC_H;
    });

    // Position Right Actors (Mirrors Left: Parent on top/outer-right, children below/inner-left)
    const maxRightLevel = sortedRightActors.length > 0 ? Math.max(...sortedRightActors.map(a => actorLevels[a.id] || 0)) : 0;

    sortedRightActors.forEach((actor) => {
      const level = actorLevels[actor.id] || 0;
      const prevBottom = prevBottomPerLevelRight[level] !== undefined ? prevBottomPerLevelRight[level] : (MARGIN_TOP - ACTOR_PADDING);

      const connectedYs = actorUcLinks
        .filter(l => l.source === actor.id || l.target === actor.id)
        .map(l => {
          const ucId = l.source === actor.id ? l.target : l.source;
          return primaryYCenter[ucId] ?? null;
        })
        .filter(y => y !== null);

      let idealCenterY;
      if (connectedYs.length > 0) {
        idealCenterY = connectedYs.reduce((a, b) => a + b, 0) / connectedYs.length;
      } else {
        const parentId = parentMap[actor.id];
        if (parentId && positions[parentId]) {
          idealCenterY = positions[parentId].y + AC_H / 2;
        } else {
          idealCenterY = prevBottom + ACTOR_PADDING + AC_H / 2;
        }
      }

      let actorTop = idealCenterY - AC_H / 2;
      const minTop = prevBottom + ACTOR_PADDING;
      if (actorTop < minTop) {
        actorTop = minTop;
      }

      // Inverted level on the right side: child (higher level) is on the left closer to system block, parent (level 0) is on the right
      const actorX = RIGHT_BASE_X + (maxRightLevel - level) * ACTOR_COL_WIDTH;
      positions[actor.id] = { x: actorX, y: actorTop };
      prevBottomPerLevelRight[level] = actorTop + AC_H;
    });

    return positions;
  }

  function parseActivity(text) {
    const nodes = [];
    const transitions = [];
    const partitions = [];
    let currentPartition = null;
    let title = 'Activity Diagram';
    const lines = (text || '').split('\n');

    const cleanLabel = (raw) => {
      if (!raw) return '';
      let s = raw.trim();
      if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
        s = s.slice(1, -1);
      }
      return s.replace(/\\"/g, '"').replace(/\\'/g, "'").trim();
    };

    const ensureNode = (id, defaultType = 'action', defaultLabel = '') => {
      const cleanId = id.trim().replace(/\s+/g, '_');
      let found = nodes.find(n => n.id.toLowerCase() === cleanId.toLowerCase());
      if (!found) {
        let detectedType = defaultType;
        const lower = cleanId.toLowerCase();
        if (lower.startsWith('start') || lower.startsWith('initial') || lower.startsWith('begin')) {
          detectedType = 'start';
        } else if (lower.startsWith('end') || lower.startsWith('final') || lower.startsWith('stop')) {
          detectedType = 'end';
        } else if (lower.startsWith('decision') || lower.startsWith('cond') || lower.startsWith('check')) {
          detectedType = 'decision';
        } else if (lower.startsWith('fork')) {
          detectedType = 'fork';
        } else if (lower.startsWith('join') || lower.startsWith('merge')) {
          detectedType = 'join';
        }

        found = {
          id: cleanId,
          label: defaultLabel || cleanId.replace(/_/g, ' '),
          type: detectedType,
          partition: currentPartition
        };
        nodes.push(found);
      }
      return found;
    };

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('%%') || trimmed.startsWith('//') || trimmed.startsWith('#')) return;

      const titleMatch = trimmed.match(/^ACTIVITY\s+(.+)$/i);
      if (titleMatch) {
        title = cleanLabel(titleMatch[1]);
        return;
      }

      // SWIMLANE / PARTITION <Name>
      const partMatch = trimmed.match(/^(?:SWIMLANE|PARTITION)\s+(.+)$/i);
      if (partMatch) {
        currentPartition = cleanLabel(partMatch[1]);
        if (!partitions.includes(currentPartition)) {
          partitions.push(currentPartition);
        }
        return;
      }

      // Explicit START <id> ["Label"]
      const startMatch = trimmed.match(/^START\s+([A-Za-z0-9_\-]+)(?:\s+(.+))?$/i);
      if (startMatch) {
        const id = startMatch[1].trim();
        const label = startMatch[2] ? cleanLabel(startMatch[2]) : 'Start';
        const existing = nodes.find(n => n.id === id);
        if (existing) { existing.type = 'start'; existing.label = label; existing.partition = currentPartition; }
        else nodes.push({ id, label, type: 'start', partition: currentPartition });
        return;
      }

      // Explicit END / FINAL / STOP <id> ["Label"]
      const endMatch = trimmed.match(/^(?:END|FINAL|STOP)\s+([A-Za-z0-9_\-]+)(?:\s+(.+))?$/i);
      if (endMatch) {
        const id = endMatch[1].trim();
        const label = endMatch[2] ? cleanLabel(endMatch[2]) : 'End';
        const existing = nodes.find(n => n.id === id);
        if (existing) { existing.type = 'end'; existing.label = label; existing.partition = currentPartition; }
        else nodes.push({ id, label, type: 'end', partition: currentPartition });
        return;
      }

      // Explicit DECISION / CONDITION / MERGE <id> ["Label"]
      const decMatch = trimmed.match(/^(?:DECISION|CONDITION|MERGE)\s+([A-Za-z0-9_\-]+)(?:\s+(.+))?$/i);
      if (decMatch) {
        const id = decMatch[1].trim();
        const label = decMatch[2] ? cleanLabel(decMatch[2]) : id.replace(/_/g, ' ');
        const existing = nodes.find(n => n.id === id);
        if (existing) { existing.type = 'decision'; existing.label = label; existing.partition = currentPartition; }
        else nodes.push({ id, label, type: 'decision', partition: currentPartition });
        return;
      }

      // Explicit FORK <id> ["Label"]
      const forkMatch = trimmed.match(/^FORK\s+([A-Za-z0-9_\-]+)(?:\s+(.+))?$/i);
      if (forkMatch) {
        const id = forkMatch[1].trim();
        const label = forkMatch[2] ? cleanLabel(forkMatch[2]) : 'Fork';
        const existing = nodes.find(n => n.id === id);
        if (existing) { existing.type = 'fork'; existing.label = label; existing.partition = currentPartition; }
        else nodes.push({ id, label, type: 'fork', partition: currentPartition });
        return;
      }

      // Explicit JOIN <id> ["Label"]
      const joinMatch = trimmed.match(/^JOIN\s+([A-Za-z0-9_\-]+)(?:\s+(.+))?$/i);
      if (joinMatch) {
        const id = joinMatch[1].trim();
        const label = joinMatch[2] ? cleanLabel(joinMatch[2]) : 'Join';
        const existing = nodes.find(n => n.id === id);
        if (existing) { existing.type = 'join'; existing.label = label; existing.partition = currentPartition; }
        else nodes.push({ id, label, type: 'join', partition: currentPartition });
        return;
      }

      // Explicit ACTION / STEP <id> ["Label"]
      const actionMatch = trimmed.match(/^(?:ACTION|STEP)\s+([A-Za-z0-9_\-]+)(?:\s+(.+))?$/i);
      if (actionMatch) {
        const id = actionMatch[1].trim();
        const label = actionMatch[2] ? cleanLabel(actionMatch[2]) : id.replace(/_/g, ' ');
        const existing = nodes.find(n => n.id === id);
        if (existing) { existing.type = 'action'; existing.label = label; existing.partition = currentPartition; }
        else nodes.push({ id, label, type: 'action', partition: currentPartition });
        return;
      }

      // Transitions: e.g. A -> B [guard] or A -> B : guard or A -> B
      const transMatch = trimmed.match(/^([A-Za-z0-9_\-]+)\s*->\s*([A-Za-z0-9_\-]+)(?:\s*(?:\[([^\]]+)\]|:\s*(.+)))?$/i);
      if (transMatch) {
        const srcId = transMatch[1].trim();
        const tgtId = transMatch[2].trim();
        const rawGuard = transMatch[3] || transMatch[4] || '';
        const guard = cleanLabel(rawGuard);

        ensureNode(srcId);
        ensureNode(tgtId);

        transitions.push({
          source: srcId,
          target: tgtId,
          guard,
          id: `${srcId}->${tgtId}${guard ? `[${guard}]` : ''}`
        });
        return;
      }
    });

    return { title, nodes, transitions, partitions };
  }

  function validateActivityLogic(parsed) {
    const { nodes = [], transitions = [] } = (parsed || {});
    const warnings = [];
    const errors = [];

    if (nodes.length === 0) {
      return { isValid: true, warnings: [], errors: [] };
    }

    const startNodes = nodes.filter(n => n.type === 'start');
    const endNodes = nodes.filter(n => n.type === 'end');

    if (startNodes.length === 0) {
      warnings.push('No START node defined. Flow begins at the first action.');
    } else if (startNodes.length > 1) {
      warnings.push(`Multiple START nodes found (${startNodes.map(s => s.id).join(', ')}).`);
    }

    if (endNodes.length === 0) {
      warnings.push('No END/FINAL node defined. Add an END node to mark workflow termination.');
    }

    // In-degree & Out-degree maps
    const inDeg = {};
    const outDeg = {};
    nodes.forEach(n => {
      inDeg[n.id] = 0;
      outDeg[n.id] = 0;
    });

    (transitions || []).forEach(t => {
      if (outDeg[t.source] !== undefined) outDeg[t.source]++;
      if (inDeg[t.target] !== undefined) inDeg[t.target]++;
    });

    // Check unreachable nodes and dead-ends
    nodes.forEach(n => {
      if (n.type !== 'start' && inDeg[n.id] === 0) {
        warnings.push(`Node "${n.label}" (${n.id}) has no incoming transitions (unreachable).`);
      }
      if (n.type !== 'end' && outDeg[n.id] === 0) {
        warnings.push(`Node "${n.label}" (${n.id}) has no outgoing transitions (dead-end).`);
      }
    });

    // Check decision nodes
    const decisions = nodes.filter(n => n.type === 'decision');
    decisions.forEach(d => {
      const outgoing = (transitions || []).filter(t => t.source === d.id);
      if (outgoing.length < 2) {
        warnings.push(`Decision "${d.label}" has only ${outgoing.length} branch (expected at least 2).`);
      }
      const unlabelled = outgoing.filter(t => !t.guard);
      if (unlabelled.length > 0 && outgoing.length > 1) {
        warnings.push(`Decision "${d.label}" has branch without a [guard condition].`);
      }
    });

    // Check fork/join balance
    const forks = nodes.filter(n => n.type === 'fork');
    forks.forEach(f => {
      const outgoing = (transitions || []).filter(t => t.source === f.id);
      if (outgoing.length < 2) {
        warnings.push(`Fork bar "${f.label}" should split into at least 2 parallel flows.`);
      }
    });

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }

  function computeActivityAutoLayout(nodes, transitions = [], partitions = []) {
    if (!nodes || nodes.length === 0) return {};

    const positions = {};
    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    const getNodeDim = (type) => {
      if (type === 'start' || type === 'end') return { w: 36, h: 36 };
      if (type === 'decision') return { w: 140, h: 70 };
      if (type === 'fork' || type === 'join') return { w: 160, h: 12 };
      return { w: 196, h: 54 };
    };

    // 1. Build adjacency list, parents list, and degrees
    const adj = {};
    const parents = {};
    const inDeg = {};
    const outDeg = {};
    nodes.forEach(n => {
      adj[n.id] = [];
      parents[n.id] = [];
      inDeg[n.id] = 0;
      outDeg[n.id] = 0;
    });

    (transitions || []).forEach(t => {
      if (adj[t.source] && nodeMap[t.target]) {
        adj[t.source].push(t.target);
        parents[t.target].push(t.source);
        inDeg[t.target] = (inDeg[t.target] || 0) + 1;
        outDeg[t.source] = (outDeg[t.source] || 0) + 1;
      }
    });

    // 2. Layer assignment using Longest Path on DAG (breaking back-edges)
    const layers = {};
    let roots = nodes.filter(n => n.type === 'start').map(n => n.id);
    if (roots.length === 0) {
      roots = nodes.filter(n => inDeg[n.id] === 0).map(n => n.id);
    }
    if (roots.length === 0 && nodes.length > 0) {
      roots = [nodes[0].id];
    }

    const queue = [];
    const visitCounts = {};
    roots.forEach(r => {
      layers[r] = 0;
      queue.push(r);
      visitCounts[r] = 1;
    });

    const maxQueueSteps = Math.max(80, nodes.length * 5);
    let stepCount = 0;

    while (queue.length > 0 && stepCount < maxQueueSteps) {
      stepCount++;
      const curr = queue.shift();
      const currLayer = layers[curr] ?? 0;
      const neighbors = adj[curr] || [];

      neighbors.forEach(nxt => {
        const nextTargetLayer = currLayer + 1;
        const currentNxtLayer = layers[nxt];
        const visits = (visitCounts[nxt] || 0);

        if (visits < 4 && (currentNxtLayer === undefined || currentNxtLayer < nextTargetLayer)) {
          if (currentNxtLayer === undefined || (nextTargetLayer - currentNxtLayer <= 6)) {
            layers[nxt] = nextTargetLayer;
            visitCounts[nxt] = visits + 1;
            queue.push(nxt);
          }
        }
      });
    }

    // Ensure join nodes are placed below all their predecessors
    nodes.filter(n => n.type === 'join').forEach(joinNode => {
      const predLayers = parents[joinNode.id].map(p => layers[p] ?? 0);
      if (predLayers.length > 0) {
        layers[joinNode.id] = Math.max(layers[joinNode.id] ?? 0, Math.max(...predLayers) + 1);
      }
    });

    // Assign any unvisited nodes to appropriate layers
    nodes.forEach((n, idx) => {
      if (layers[n.id] === undefined || !Number.isFinite(layers[n.id])) {
        layers[n.id] = idx + 1;
      }
    });

    const hasPartitions = partitions && partitions.length > 0;
    const LAYER_GAP_Y = 160;
    const START_Y = 130;
    const NODE_SPACING_X = 240;

    if (hasPartitions) {
      let currentPartX = 80;

      partitions.forEach(partName => {
        const partNodes = nodes.filter(n => (n.partition || partitions[0]) === partName);
        if (partNodes.length === 0) {
          currentPartX += 420;
          return;
        }

        // Group partition nodes by layer
        const partLayerGroups = {};
        partNodes.forEach(n => {
          const l = layers[n.id] ?? 0;
          if (!partLayerGroups[l]) partLayerGroups[l] = [];
          partLayerGroups[l].push(n);
        });

        const sortedLayerKeys = Object.keys(partLayerGroups).map(Number).sort((a, b) => a - b);
        const minPartX = currentPartX + 40;

        // Top-down pass: align each node to its parent or parent branch slot
        sortedLayerKeys.forEach(l => {
          const layerNodes = partLayerGroups[l];

          // Sort layer nodes by the horizontal center of their parents
          layerNodes.sort((a, b) => {
            const aParents = parents[a.id].filter(pid => positions[pid] !== undefined);
            const bParents = parents[b.id].filter(pid => positions[pid] !== undefined);
            const aMeanX = aParents.length > 0 ? aParents.reduce((sum, pid) => sum + positions[pid].x + getNodeDim(nodeMap[pid].type).w / 2, 0) / aParents.length : 0;
            const bMeanX = bParents.length > 0 ? bParents.reduce((sum, pid) => sum + positions[pid].x + getNodeDim(nodeMap[pid].type).w / 2, 0) / bParents.length : 0;
            if (aMeanX !== bMeanX) return aMeanX - bMeanX;
            return nodes.indexOf(a) - nodes.indexOf(b);
          });

          const y = START_Y + l * LAYER_GAP_Y;

          layerNodes.forEach((node) => {
            const dim = getNodeDim(node.type);
            const nodeParents = parents[node.id].filter(pid => positions[pid] !== undefined);

            let desiredCenterX;
            if (nodeParents.length > 0) {
              const parentObj = nodeMap[nodeParents[0]];
              const parentChildren = (adj[parentObj.id] || []).filter(cid => partNodes.some(pn => pn.id === cid));

              if (parentChildren.length > 1) {
                const childIdx = parentChildren.indexOf(node.id);
                const parentCenter = positions[parentObj.id].x + getNodeDim(parentObj.type).w / 2;
                const totalSpan = (parentChildren.length - 1) * NODE_SPACING_X;
                desiredCenterX = parentCenter - totalSpan / 2 + childIdx * NODE_SPACING_X;
              } else {
                desiredCenterX = nodeParents.reduce((sum, pid) => sum + positions[pid].x + getNodeDim(nodeMap[pid].type).w / 2, 0) / nodeParents.length;
              }
            } else {
              desiredCenterX = minPartX + 180;
            }

            positions[node.id] = {
              x: desiredCenterX - dim.w / 2,
              y
            };
          });

          // Resolve horizontal overlaps within this layer
          for (let i = 0; i < layerNodes.length - 1; i++) {
            const currNode = layerNodes[i];
            const nextNode = layerNodes[i + 1];
            const currDim = getNodeDim(currNode.type);
            const minNextX = positions[currNode.id].x + currDim.w + 40;
            if (positions[nextNode.id].x < minNextX) {
              const shift = minNextX - positions[nextNode.id].x;
              for (let j = i + 1; j < layerNodes.length; j++) {
                positions[layerNodes[j].id].x += shift;
              }
            }
          }
        });

        // Bottom-up pass: center Fork and Join bars over their children / predecessors
        sortedLayerKeys.slice().reverse().forEach(l => {
          const layerNodes = partLayerGroups[l];
          layerNodes.forEach(node => {
            const children = (adj[node.id] || []).filter(cid => positions[cid] !== undefined && partNodes.some(pn => pn.id === cid));
            if (children.length > 1) {
              const childrenCenters = children.map(cid => positions[cid].x + getNodeDim(nodeMap[cid].type).w / 2);
              const meanChildCenter = childrenCenters.reduce((a, b) => a + b, 0) / childrenCenters.length;
              positions[node.id].x = meanChildCenter - getNodeDim(node.type).w / 2;
            }
          });
        });

        // Ensure all partition nodes stay within positive coordinates >= minPartX
        let partMinX = Infinity;
        let partMaxX = -Infinity;
        partNodes.forEach(n => {
          const p = positions[n.id];
          const dim = getNodeDim(n.type);
          if (p) {
            if (p.x < partMinX) partMinX = p.x;
            if (p.x + dim.w > partMaxX) partMaxX = p.x + dim.w;
          }
        });

        if (partMinX < minPartX) {
          const offset = minPartX - partMinX;
          partNodes.forEach(n => {
            if (positions[n.id]) positions[n.id].x += offset;
          });
          partMaxX += offset;
        }

        currentPartX = Math.max(currentPartX + 420, partMaxX + 80);
      });
    } else {
      // Global layout without partitions
      const layerGroups = {};
      nodes.forEach(n => {
        const l = layers[n.id] ?? 0;
        if (!layerGroups[l]) layerGroups[l] = [];
        layerGroups[l].push(n);
      });

      const sortedLayerKeys = Object.keys(layerGroups).map(Number).sort((a, b) => a - b);
      const BASE_CENTER_X = 540;

      sortedLayerKeys.forEach(l => {
        const layerNodes = layerGroups[l];
        const y = START_Y + l * LAYER_GAP_Y;

        layerNodes.sort((a, b) => {
          const aParents = parents[a.id].filter(pid => positions[pid] !== undefined);
          const bParents = parents[b.id].filter(pid => positions[pid] !== undefined);
          const aMeanX = aParents.length > 0 ? aParents.reduce((sum, pid) => sum + positions[pid].x + getNodeDim(nodeMap[pid].type).w / 2, 0) / aParents.length : 0;
          const bMeanX = bParents.length > 0 ? bParents.reduce((sum, pid) => sum + positions[pid].x + getNodeDim(nodeMap[pid].type).w / 2, 0) / bParents.length : 0;
          if (aMeanX !== bMeanX) return aMeanX - bMeanX;
          return nodes.indexOf(a) - nodes.indexOf(b);
        });

        layerNodes.forEach((node) => {
          const dim = getNodeDim(node.type);
          const nodeParents = parents[node.id].filter(pid => positions[pid] !== undefined);

          let desiredCenterX;
          if (nodeParents.length > 0) {
            const parentObj = nodeMap[nodeParents[0]];
            const parentChildren = (adj[parentObj.id] || []).filter(cid => nodes.some(pn => pn.id === cid));

            if (parentChildren.length > 1) {
              const childIdx = parentChildren.indexOf(node.id);
              const parentCenter = positions[parentObj.id].x + getNodeDim(parentObj.type).w / 2;
              const totalSpan = (parentChildren.length - 1) * NODE_SPACING_X;
              desiredCenterX = parentCenter - totalSpan / 2 + childIdx * NODE_SPACING_X;
            } else {
              desiredCenterX = nodeParents.reduce((sum, pid) => sum + positions[pid].x + getNodeDim(nodeMap[pid].type).w / 2, 0) / nodeParents.length;
            }
          } else {
            desiredCenterX = BASE_CENTER_X;
          }

          positions[node.id] = {
            x: desiredCenterX - dim.w / 2,
            y
          };
        });

        // Resolve overlaps
        for (let i = 0; i < layerNodes.length - 1; i++) {
          const currNode = layerNodes[i];
          const nextNode = layerNodes[i + 1];
          const currDim = getNodeDim(currNode.type);
          const minNextX = positions[currNode.id].x + currDim.w + 40;
          if (positions[nextNode.id].x < minNextX) {
            const shift = minNextX - positions[nextNode.id].x;
            for (let j = i + 1; j < layerNodes.length; j++) {
              positions[layerNodes[j].id].x += shift;
            }
          }
        }
      });

      // Bottom-up pass for Fork and Join centering
      sortedLayerKeys.slice().reverse().forEach(l => {
        const layerNodes = layerGroups[l];
        layerNodes.forEach(node => {
          const children = (adj[node.id] || []).filter(cid => positions[cid] !== undefined);
          if (children.length > 1) {
            const childrenCenters = children.map(cid => positions[cid].x + getNodeDim(nodeMap[cid].type).w / 2);
            const meanChildCenter = childrenCenters.reduce((a, b) => a + b, 0) / childrenCenters.length;
            positions[node.id].x = meanChildCenter - getNodeDim(node.type).w / 2;
          }
        });
      });
    }

    nodes.forEach((n, idx) => {
      if (!positions[n.id] || !Number.isFinite(positions[n.id].x) || !Number.isFinite(positions[n.id].y)) {
        positions[n.id] = { x: 400, y: idx * 110 + 80 };
      }
    });

    return positions;
  }

  function parseSequence(text) {
    const participants = [];
    const messages = [];
    let title = 'Sequence Diagram';
    const lines = text.split('\n');
    const callStack = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('%%') || trimmed.startsWith('#')) return;

      const titleMatch = trimmed.match(/^SEQUENCE\s+(.+)$/i);
      if (titleMatch) {
        title = titleMatch[1];
        return;
      }

      const partMatch = trimmed.match(/^PARTICIPANT\s+(.+)$/i);
      if (partMatch) {
        const name = partMatch[1].trim();
        const id = name.replace(/\s+/g, '_');
        participants.push({ id, label: name });
        return;
      }

      const ifMatch = trimmed.match(/^IF\s+(.+)\s+THEN/i);
      if (ifMatch) {
        messages.push({
          type: 'control',
          label: `IF: ${ifMatch[1].trim()}`
        });
        return;
      }

      if (trimmed.toUpperCase() === 'ELSE') {
        messages.push({
          type: 'control',
          label: 'ELSE'
        });
        return;
      }

      if (trimmed.toUpperCase() === 'END') {
        messages.push({
          type: 'control',
          label: 'END'
        });
        return;
      }

      // Sends/Requests
      const sendMatch = trimmed.match(/^([A-Za-z0-9_\-\s]+)\s+(sends|requests)\s+(.+?)\s+(?:to|from)\s+([A-Za-z0-9_\-\s]+)\.?$/i);
      if (sendMatch) {
        const src = sendMatch[1].trim();
        const srcId = src.replace(/\s+/g, '_');
        const action = sendMatch[2].toLowerCase();
        let label = sendMatch[3].trim();
        if (label.startsWith('"') && label.endsWith('"')) {
          label = label.substring(1, label.length - 1);
        }
        const dest = sendMatch[4].trim();
        const destId = dest.replace(/\s+/g, '_');

        if (!participants.find(p => p.id === srcId)) participants.push({ id: srcId, label: src });
        if (!participants.find(p => p.id === destId)) participants.push({ id: destId, label: dest });

        messages.push({
          type: action === 'requests' ? 'request' : 'message',
          source: srcId,
          target: destId,
          label: label
        });

        callStack.push({ caller: srcId, callee: destId });
        return;
      }

      // Returns
      const returnMatch = trimmed.match(/^([A-Za-z0-9_\-\s]+)\s+returns\s+(.+?)\.?$/i);
      if (returnMatch) {
        const src = returnMatch[1].trim();
        const srcId = src.replace(/\s+/g, '_');
        let rawLabel = returnMatch[2].trim();

        let label = rawLabel;
        let destId = '';

        const toMatch = rawLabel.match(/(.+?)\s+to\s+([A-Za-z0-9_\-\s]+)$/i);
        if (toMatch) {
          label = toMatch[1].trim();
          destId = toMatch[2].trim().replace(/\s+/g, '_');
        } else {
          const lastCallIdx = [...callStack].reverse().findIndex(c => c.callee === srcId);
          if (lastCallIdx !== -1) {
            const actualIdx = callStack.length - 1 - lastCallIdx;
            destId = callStack[actualIdx].caller;
            callStack.splice(actualIdx, 1);
          } else {
            destId = participants[0]?.id || srcId;
          }
        }

        if (label.startsWith('"') && label.endsWith('"')) {
          label = label.substring(1, label.length - 1);
        }

        if (!participants.find(p => p.id === srcId)) participants.push({ id: srcId, label: src });
        if (!participants.find(p => p.id === destId)) participants.push({ id: destId, label: destId.replace(/_/g, ' ') });

        messages.push({
          type: 'return',
          source: srcId,
          target: destId,
          label: label
        });
        return;
      }

      // Displays
      const displayMatch = trimmed.match(/^([A-Za-z0-9_\-\s]+)\s+displays\s+(.+?)\.?$/i);
      if (displayMatch) {
        const src = displayMatch[1].trim();
        const srcId = src.replace(/\s+/g, '_');
        let rawLabel = displayMatch[2].trim();

        let label = rawLabel;
        let destId = '';

        const toMatch = rawLabel.match(/(.+?)\s+to\s+([A-Za-z0-9_\-\s]+)$/i);
        if (toMatch) {
          label = toMatch[1].trim();
          destId = toMatch[2].trim().replace(/\s+/g, '_');
        } else {
          destId = participants[0]?.id || srcId;
        }

        if (label.startsWith('"') && label.endsWith('"')) {
          label = label.substring(1, label.length - 1);
        }

        if (!participants.find(p => p.id === srcId)) participants.push({ id: srcId, label: src });
        if (!participants.find(p => p.id === destId)) participants.push({ id: destId, label: destId.replace(/_/g, ' ') });

        messages.push({
          type: 'display',
          source: srcId,
          target: destId,
          label: label
        });
        return;
      }
    });

    return { title, participants, messages };
  }

  function parseGantt(text) {
    const sections = [];
    const tasks = [];
    let currentSection = 'SophiaPath';
    const lines = text.split('\n');

    const isCustomFormat = text.includes('TASK') || text.includes('PROJECT') || text.includes('START');

    if (isCustomFormat) {
      let currentTask = null;

      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('%%') || trimmed.startsWith('#')) return;

        const projMatch = trimmed.match(/^PROJECT\s+(.+)$/i);
        if (projMatch) {
          currentSection = projMatch[1].trim();
          if (!sections.includes(currentSection)) {
            sections.push(currentSection);
          }
          return;
        }

        const taskMatch = trimmed.match(/^TASK\s+(.+)$/i);
        if (taskMatch) {
          if (currentTask) {
            tasks.push(currentTask);
          }
          currentTask = {
            name: taskMatch[1].trim(),
            section: currentSection,
            status: '',
            startDateStr: '',
            endDateStr: '',
            duration: 5,
            dependencies: []
          };
          return;
        }

        const milestoneMatch = trimmed.match(/^MILESTONE\s+(.+)$/i);
        if (milestoneMatch) {
          if (currentTask) {
            tasks.push(currentTask);
          }
          currentTask = {
            name: milestoneMatch[1].trim(),
            section: currentSection,
            status: 'done',
            startDateStr: '',
            endDateStr: '',
            duration: 0,
            dependencies: []
          };
          return;
        }

        const startMatch = trimmed.match(/^START\s+(.+)$/i);
        if (startMatch && currentTask) {
          currentTask.startDateStr = startMatch[1].trim();
          return;
        }

        const endMatch = trimmed.match(/^END\s+(.+)$/i);
        if (endMatch && currentTask) {
          currentTask.endDateStr = endMatch[1].trim();
          return;
        }

        const dateMatch = trimmed.match(/^DATE\s+(.+)$/i);
        if (dateMatch && currentTask) {
          currentTask.startDateStr = dateMatch[1].trim();
          currentTask.endDateStr = dateMatch[1].trim();
          currentTask.duration = 0;
          return;
        }

        const depMatch = trimmed.match(/^DEPENDS ON\s+(.+)$/i);
        if (depMatch && currentTask) {
          currentTask.dependencies.push(depMatch[1].trim());
          currentTask.status = 'active';
          return;
        }
      });

      if (currentTask) {
        tasks.push(currentTask);
      }

      tasks.forEach(t => {
        if (t.startDateStr && t.endDateStr && t.duration !== 0) {
          const sDate = new Date(t.startDateStr);
          const eDate = new Date(t.endDateStr);
          if (!isNaN(sDate.getTime()) && !isNaN(eDate.getTime())) {
            t.duration = Math.max(1, Math.round((eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)));
          }
        }
      });

    } else {
      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('%%') || trimmed.startsWith('gantt') || trimmed.startsWith('title') || trimmed.startsWith('dateFormat') || trimmed.startsWith('axisFormat')) return;

        const secMatch = trimmed.match(/^section\s+(.+)$/);
        if (secMatch) {
          currentSection = secMatch[1];
          sections.push(currentSection);
          return;
        }

        const taskMatch = trimmed.match(/^([^:]+):\s*(.+)$/);
        if (taskMatch) {
          const name = taskMatch[1].trim();
          const parts = taskMatch[2].split(',').map(p => p.trim());
          let status = '';
          let start = '';
          let duration = 5;

          parts.forEach(part => {
            if (part === 'active' || part === 'done' || part === 'crit') {
              status = part;
            } else if (part.endsWith('d')) {
              duration = parseInt(part) || 5;
            } else {
              start = part;
            }
          });

          tasks.push({
            name,
            section: currentSection,
            status,
            duration
          });
        }
      });
    }

    if (sections.length === 0) sections.push(currentSection);
    return { sections, tasks };
  }

  // Finds the nearest empty point on the continuous perimeter of a rectangle [x, y, w, h] towards target (tx, ty)
  // so arrow tips do NOT snap to 4 fixed points, but instead find the nearest available empty spot
  const getNearestEmptyPerimeterPoint = (rect, target, allRelations = [], currentRelation = null, isSource = true) => {
    const { x, y, w, h } = rect;
    if (w <= 0 || h <= 0) return { x, y, side: 'center' };

    const cx = x + w / 2;
    const cy = y + h / 2;
    const dx = target.x - cx;
    const dy = target.y - cy;

    // 1. Ray-box continuous perimeter intersection (ideal continuous point)
    let idealX = cx;
    let idealY = cy;

    if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
      idealY = y;
    } else {
      const scaleX = dx !== 0 ? (dx > 0 ? (w / 2) / dx : (-w / 2) / dx) : Infinity;
      const scaleY = dy !== 0 ? (dy > 0 ? (h / 2) / dy : (-h / 2) / dy) : Infinity;
      const scale = Math.min(scaleX, scaleY);
      idealX = cx + dx * scale;
      idealY = cy + dy * scale;
    }

    // 2. Continuous Perimeter Parameter [0, L) where L = 2*(w + h)
    const L = 2 * (w + h);
    const toPerimeterT = (px, py) => {
      if (Math.abs(py - y) < 1.5) { // Top edge
        return Math.max(0, Math.min(w, px - x));
      } else if (Math.abs(px - (x + w)) < 1.5) { // Right edge
        return w + Math.max(0, Math.min(h, py - y));
      } else if (Math.abs(py - (y + h)) < 1.5) { // Bottom edge
        return w + h + Math.max(0, Math.min(w, x + w - px));
      } else { // Left edge
        return 2 * w + h + Math.max(0, Math.min(h, y + h - py));
      }
    };

    const fromPerimeterT = (t) => {
      let modT = ((t % L) + L) % L;
      if (modT <= w) {
        return { x: x + modT, y: y, side: 'top' };
      } else if (modT <= w + h) {
        return { x: x + w, y: y + (modT - w), side: 'right' };
      } else if (modT <= 2 * w + h) {
        return { x: x + w - (modT - (w + h)), y: y + h, side: 'bottom' };
      } else {
        return { x: x, y: y + h - (modT - (2 * w + h)), side: 'left' };
      }
    };

    const idealT = toPerimeterT(idealX, idealY);

    if (!allRelations || allRelations.length <= 1 || !currentRelation) {
      return fromPerimeterT(idealT);
    }

    // 3. Find other connections touching this same entity
    const entityName = isSource ? currentRelation.source : currentRelation.target;
    const otherConnections = allRelations.filter(r => {
      const isSelf = r.source === currentRelation.source && r.target === currentRelation.target;
      if (isSelf) return false;
      return r.source === entityName || r.target === entityName;
    });

    if (otherConnections.length === 0) {
      return fromPerimeterT(idealT);
    }

    // Find perimeter positions of already placed connections
    const occupiedTs = [];
    otherConnections.forEach(r => {
      const otherName = r.source === entityName ? r.target : r.source;
      const relKey = `${r.source}::rel::${r.target}`;
      const otherPos = nodePositions[relKey] || nodePositions[otherName];
      if (otherPos) {
        const ocx = otherPos.x;
        const ocy = otherPos.y;
        const odx = ocx - cx;
        const ody = ocy - cy;
        if (Math.abs(odx) > 0.001 || Math.abs(ody) > 0.001) {
          const oscX = odx !== 0 ? (odx > 0 ? (w / 2) / odx : (-w / 2) / odx) : Infinity;
          const oscY = ody !== 0 ? (ody > 0 ? (h / 2) / ody : (-h / 2) / ody) : Infinity;
          const osc = Math.min(oscX, oscY);
          const oix = cx + odx * osc;
          const oiy = cy + ody * osc;
          occupiedTs.push(toPerimeterT(oix, oiy));
        }
      }
    });

    // 4. Find nearest empty T with minimum gap minGap = 24px
    const minGap = 24;
    const isOccupied = (t) => {
      return occupiedTs.some(occ => {
        let diff = Math.abs(t - occ);
        if (diff > L / 2) diff = L - diff;
        return diff < minGap;
      });
    };

    // Avoid sharp corner vertices (within 8px of corner)
    const isCorner = (t) => {
      const corners = [0, w, w + h, 2 * w + h, L];
      return corners.some(c => {
        let diff = Math.abs(t - c);
        if (diff > L / 2) diff = L - diff;
        return diff < 8;
      });
    };

    if (!isOccupied(idealT) && !isCorner(idealT)) {
      return fromPerimeterT(idealT);
    }

    // Search outward (+dt, -dt) for the nearest available empty spot
    let bestT = idealT;
    for (let step = 1; step <= 60; step++) {
      const dt = step * 3;
      const tPlus = idealT + dt;
      const tMinus = idealT - dt;

      if (!isOccupied(tPlus) && !isCorner(tPlus)) {
        bestT = tPlus;
        break;
      }
      if (!isOccupied(tMinus) && !isCorner(tMinus)) {
        bestT = tMinus;
        break;
      }
    }

    return fromPerimeterT(bestT);
  };

  // Bezier routing math helpers matching Java UML playground
  const getBestConnectionPoints = (p1, p2, w1 = 250, h1 = 200, w2 = 250, h2 = 200, allRelations = [], currentRelation = null) => {
    if (activeTabKey === 'er') {
      const bestA = w1 > 0 && h1 > 0
        ? getNearestEmptyPerimeterPoint({ x: p1.x, y: p1.y, w: w1, h: h1 }, { x: p2.x + w2 / 2, y: p2.y + h2 / 2 }, allRelations, currentRelation, true)
        : { x: p1.x, y: p1.y, side: 'center' };

      const bestB = w2 > 0 && h2 > 0
        ? getNearestEmptyPerimeterPoint({ x: p2.x, y: p2.y, w: w2, h: h2 }, { x: p1.x + w1 / 2, y: p1.y + h1 / 2 }, allRelations, currentRelation, false)
        : { x: p2.x, y: p2.y, side: 'center' };

      return { start: bestA, end: bestB };
    }

    let anchorsA = [
      { x: p1.x + w1 / 2, y: p1.y, side: 'top' },
      { x: p1.x + w1 / 2, y: p1.y + h1, side: 'bottom' },
      { x: p1.x, y: p1.y + h1 / 2, side: 'left' },
      { x: p1.x + w1, y: p1.y + h1 / 2, side: 'right' }
    ];

    let anchorsB = [
      { x: p2.x + w2 / 2, y: p2.y, side: 'top' },
      { x: p2.x + w2 / 2, y: p2.y + h2, side: 'bottom' },
      { x: p2.x, y: p2.y + h2 / 2, side: 'left' },
      { x: p2.x + w2, y: p2.y + h2 / 2, side: 'right' }
    ];

    if (activeTabKey === 'usecase' && currentRelation) {
      if (currentRelation.label === 'INHERITS') {
        // In usecase inheritance, the inheriting child actor starts from the side facing its parent
        const childFacingSide = p1.x >= p2.x ? 'left' : 'right';
        anchorsA = [
          { x: p1.x + (childFacingSide === 'right' ? w1 : 0), y: p1.y + h1 / 2, side: childFacingSide }
        ];
      } else {
        const { actors, usecases } = parseUseCase(code);
        const isSrcActor = actors.some(a => a.id === currentRelation.source);
        const isTgtActor = actors.some(a => a.id === currentRelation.target);
        const isSrcUc = usecases.some(u => u.id === currentRelation.source);
        const isTgtUc = usecases.some(u => u.id === currentRelation.target);

        if (isSrcActor && isTgtUc) {
          // Actor -> UseCase
          const actorFacingSide = p1.x <= p2.x ? 'right' : 'left';
          const ucFacingSide = p1.x <= p2.x ? 'left' : 'right';
          anchorsA = [
            { x: p1.x + (actorFacingSide === 'right' ? w1 : 0), y: p1.y + h1 / 2, side: actorFacingSide }
          ];
          anchorsB = [
            { x: p2.x + (ucFacingSide === 'right' ? w2 : 0), y: p2.y + h2 / 2, side: ucFacingSide }
          ];
        } else if (isSrcUc && isTgtActor) {
          // UseCase -> Actor
          const ucFacingSide = p1.x <= p2.x ? 'right' : 'left';
          const actorFacingSide = p1.x <= p2.x ? 'left' : 'right';
          anchorsA = [
            { x: p1.x + (ucFacingSide === 'right' ? w1 : 0), y: p1.y + h1 / 2, side: ucFacingSide }
          ];
          anchorsB = [
            { x: p2.x + (actorFacingSide === 'right' ? w2 : 0), y: p2.y + h2 / 2, side: actorFacingSide }
          ];
        }
      }
    }

    let minDist = Infinity;
    let bestA = anchorsA[0];
    let bestB = anchorsB[0];

    for (const a of anchorsA) {
      for (const b of anchorsB) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = dx * dx + dy * dy;
        if (dist < minDist) {
          minDist = dist;
          bestA = a;
          bestB = b;
        }
      }
    }

    const currentRelId = currentRelation ? `${currentRelation.source}_${currentRelation.target}` : '';


    // Distribute connections if multiple share same target side (B)
    if (allRelations && allRelations.length > 0 && currentRelation) {
      const bRelations = allRelations.filter(r => r.source === currentRelation.target || r.target === currentRelation.target);
      const sameSideConnections = [];

      bRelations.forEach(r => {
        const srcPos = nodePositions[r.source];
        const tgtPos = nodePositions[r.target];
        if (srcPos && tgtPos) {
          let rw1 = 250, rh1 = 160, rw2 = 250, rh2 = 160;
          let isSrcActor = false, isTgtActor = false, isSrcUc = false, isTgtUc = false;
          if (activeTabKey === 'usecase') {
            const { actors, usecases } = parseUseCase(code);
            isSrcActor = actors.some(a => a.id === r.source);
            isTgtActor = actors.some(a => a.id === r.target);
            isSrcUc = usecases.some(u => u.id === r.source);
            isTgtUc = usecases.some(u => u.id === r.target);
            rw1 = isSrcActor ? 76 : 200; rh1 = isSrcActor ? 118 : 50;
            rw2 = isTgtActor ? 76 : 200; rh2 = isTgtActor ? 118 : 50;
          } else if (activeTabKey === 'er') {
            rw1 = 150; rh1 = 50;
            rw2 = 150; rh2 = 50;
          }

          let rAnchorsA = [
            { x: srcPos.x + rw1 / 2, y: srcPos.y, side: 'top' },
            { x: srcPos.x + rw1 / 2, y: srcPos.y + rh1, side: 'bottom' },
            { x: srcPos.x, y: srcPos.y + rh1 / 2, side: 'left' },
            { x: srcPos.x + rw1, y: srcPos.y + rh1 / 2, side: 'right' }
          ];
          let rAnchorsB = [
            { x: tgtPos.x + rw2 / 2, y: tgtPos.y, side: 'top' },
            { x: tgtPos.x + rw2 / 2, y: tgtPos.y + rh2, side: 'bottom' },
            { x: tgtPos.x, y: tgtPos.y + rh2 / 2, side: 'left' },
            { x: tgtPos.x + rw2, y: tgtPos.y + rh2 / 2, side: 'right' }
          ];

          if (activeTabKey === 'usecase') {
            if (r.label === 'INHERITS') {
              const childFacingSide = srcPos.x >= tgtPos.x ? 'left' : 'right';
              rAnchorsA = [{ x: srcPos.x + (childFacingSide === 'right' ? rw1 : 0), y: srcPos.y + rh1 / 2, side: childFacingSide }];
            } else if (isSrcActor && isTgtUc) {
              const actorFacingSide = srcPos.x <= tgtPos.x ? 'right' : 'left';
              const ucFacingSide = srcPos.x <= tgtPos.x ? 'left' : 'right';
              rAnchorsA = [{ x: srcPos.x + (actorFacingSide === 'right' ? rw1 : 0), y: srcPos.y + rh1 / 2, side: actorFacingSide }];
              rAnchorsB = [{ x: tgtPos.x + (ucFacingSide === 'right' ? rw2 : 0), y: tgtPos.y + rh2 / 2, side: ucFacingSide }];
            } else if (isSrcUc && isTgtActor) {
              const ucFacingSide = srcPos.x <= tgtPos.x ? 'right' : 'left';
              const actorFacingSide = srcPos.x <= tgtPos.x ? 'left' : 'right';
              rAnchorsA = [{ x: srcPos.x + (ucFacingSide === 'right' ? rw1 : 0), y: srcPos.y + rh1 / 2, side: ucFacingSide }];
              rAnchorsB = [{ x: tgtPos.x + (actorFacingSide === 'right' ? rw2 : 0), y: tgtPos.y + rh2 / 2, side: actorFacingSide }];
            }
          }

          let rMinDist = Infinity;
          let rBestA = rAnchorsA[0];
          let rBestB = rAnchorsB[0];
          for (const ra of rAnchorsA) {
            for (const rb of rAnchorsB) {
              const rdx = ra.x - rb.x;
              const rdy = ra.y - rb.y;
              const rdist = rdx * rdx + rdy * rdy;
              if (rdist < rMinDist) {
                rMinDist = rdist;
                rBestA = ra;
                rBestB = rb;
              }
            }
          }

          const isTarget = r.target === currentRelation.target;
          const attachedSide = isTarget ? rBestB.side : rBestA.side;

          if (attachedSide === bestB.side) {
            const neighborTitle = isTarget ? r.source : r.target;
            const posNeighbor = nodePositions[neighborTitle] || { x: 0, y: 0 };
            sameSideConnections.push({
              relId: `${r.source}_${r.target}`,
              centerX: posNeighbor.x,
              centerY: posNeighbor.y
            });
          }
        }
      });

      if (bestB.side === 'top' || bestB.side === 'bottom') {
        sameSideConnections.sort((a, b) => {
          if (Math.abs(a.centerX - b.centerX) > 5) {
            return a.centerX - b.centerX;
          }
          const isRightSide = a.centerX < p2.x;
          return isRightSide ? (a.centerY - b.centerY) : (b.centerY - a.centerY);
        });
      } else {
        sameSideConnections.sort((a, b) => a.centerY - b.centerY);
      }

      const connIdx = sameSideConnections.findIndex(item => item.relId === currentRelId);
      const totalCount = sameSideConnections.length;

      let isTargetActor = false;
      if (activeTabKey === 'usecase') {
        const { actors } = parseUseCase(code);
        isTargetActor = actors.some(a => a.id === currentRelation.target);
      }

      if (totalCount > 1 && connIdx !== -1 && w2 > 0 && h2 > 0) {
        const factor = (connIdx + 0.5) / totalCount;
        const padX = isTargetActor ? 14 : Math.min(20, w2 * 0.15);
        const padY = isTargetActor ? 20 : Math.min(14, h2 * 0.2);
        const availableW = Math.max(10, w2 - 2 * padX);
        const availableH = Math.max(10, h2 - 2 * padY);

        if (bestB.side === 'top' || bestB.side === 'bottom') {
          bestB = {
            ...bestB,
            x: p2.x + padX + availableW * factor
          };
        } else {
          bestB = {
            ...bestB,
            y: p2.y + padY + availableH * factor
          };
        }
      }
    }

    // Distribute connections if multiple share same source side (A)
    if (allRelations && allRelations.length > 0 && currentRelation && w1 > 0 && h1 > 0) {
      const aRelations = allRelations.filter(r => r.source === currentRelation.source || r.target === currentRelation.source);
      const sameSideConnectionsA = [];

      aRelations.forEach(r => {
        const srcPos = nodePositions[r.source];
        const tgtPos = nodePositions[r.target];
        if (srcPos && tgtPos) {
          let rw1 = 250, rh1 = 160, rw2 = 250, rh2 = 160;
          let isSrcActor = false, isTgtActor = false, isSrcUc = false, isTgtUc = false;
          if (activeTabKey === 'usecase') {
            const { actors, usecases } = parseUseCase(code);
            isSrcActor = actors.some(a => a.id === r.source);
            isTgtActor = actors.some(a => a.id === r.target);
            isSrcUc = usecases.some(u => u.id === r.source);
            isTgtUc = usecases.some(u => u.id === r.target);
            rw1 = isSrcActor ? 76 : 200; rh1 = isSrcActor ? 118 : 50;
            rw2 = isTgtActor ? 76 : 200; rh2 = isTgtActor ? 118 : 50;
          } else if (activeTabKey === 'er') {
            rw1 = 150; rh1 = 50;
            rw2 = 150; rh2 = 50;
          }

          let rAnchorsA = [
            { x: srcPos.x + rw1 / 2, y: srcPos.y, side: 'top' },
            { x: srcPos.x + rw1 / 2, y: srcPos.y + rh1, side: 'bottom' },
            { x: srcPos.x, y: srcPos.y + rh1 / 2, side: 'left' },
            { x: srcPos.x + rw1, y: srcPos.y + rh1 / 2, side: 'right' }
          ];
          let rAnchorsB = [
            { x: tgtPos.x + rw2 / 2, y: tgtPos.y, side: 'top' },
            { x: tgtPos.x + rw2 / 2, y: tgtPos.y + rh2, side: 'bottom' },
            { x: tgtPos.x, y: tgtPos.y + rh2 / 2, side: 'left' },
            { x: tgtPos.x + rw2, y: tgtPos.y + rh2 / 2, side: 'right' }
          ];

          if (activeTabKey === 'usecase') {
            if (r.label === 'INHERITS') {
              const childFacingSide = srcPos.x >= tgtPos.x ? 'left' : 'right';
              rAnchorsA = [{ x: srcPos.x + (childFacingSide === 'right' ? rw1 : 0), y: srcPos.y + rh1 / 2, side: childFacingSide }];
            } else if (isSrcActor && isTgtUc) {
              const actorFacingSide = srcPos.x <= tgtPos.x ? 'right' : 'left';
              const ucFacingSide = srcPos.x <= tgtPos.x ? 'left' : 'right';
              rAnchorsA = [{ x: srcPos.x + (actorFacingSide === 'right' ? rw1 : 0), y: srcPos.y + rh1 / 2, side: actorFacingSide }];
              rAnchorsB = [{ x: tgtPos.x + (ucFacingSide === 'right' ? rw2 : 0), y: tgtPos.y + rh2 / 2, side: ucFacingSide }];
            } else if (isSrcUc && isTgtActor) {
              const ucFacingSide = srcPos.x <= tgtPos.x ? 'right' : 'left';
              const actorFacingSide = srcPos.x <= tgtPos.x ? 'left' : 'right';
              rAnchorsA = [{ x: srcPos.x + (ucFacingSide === 'right' ? rw1 : 0), y: srcPos.y + rh1 / 2, side: ucFacingSide }];
              rAnchorsB = [{ x: tgtPos.x + (actorFacingSide === 'right' ? rw2 : 0), y: tgtPos.y + rh2 / 2, side: actorFacingSide }];
            }
          }

          let rMinDist = Infinity;
          let rBestA = rAnchorsA[0];
          let rBestB = rAnchorsB[0];
          for (const ra of rAnchorsA) {
            for (const rb of rAnchorsB) {
              const rdx = ra.x - rb.x;
              const rdy = ra.y - rb.y;
              const rdist = rdx * rdx + rdy * rdy;
              if (rdist < rMinDist) {
                rMinDist = rdist;
                rBestA = ra;
                rBestB = rb;
              }
            }
          }

          const isSource = r.source === currentRelation.source;
          const attachedSide = isSource ? rBestA.side : rBestB.side;

          if (attachedSide === bestA.side) {
            const neighborTitle = isSource ? r.target : r.source;
            const posNeighbor = nodePositions[neighborTitle] || { x: 0, y: 0 };
            sameSideConnectionsA.push({
              relId: `${r.source}_${r.target}`,
              centerX: posNeighbor.x,
              centerY: posNeighbor.y
            });
          }
        }
      });

      if (bestA.side === 'top' || bestA.side === 'bottom') {
        sameSideConnectionsA.sort((a, b) => a.centerX - b.centerX);
      } else {
        sameSideConnectionsA.sort((a, b) => a.centerY - b.centerY);
      }

      const connIdxA = sameSideConnectionsA.findIndex(item => item.relId === currentRelId);
      const totalCountA = sameSideConnectionsA.length;

      let isSourceActor = false;
      if (activeTabKey === 'usecase') {
        const { actors } = parseUseCase(code);
        isSourceActor = actors.some(a => a.id === currentRelation.source);
      }

      if (totalCountA > 1 && connIdxA !== -1 && !isSourceActor && w1 > 0 && h1 > 0) {
        const factor = (connIdxA + 0.5) / totalCountA;
        const padX = Math.min(20, w1 * 0.15);
        const padY = Math.min(14, h1 * 0.2);
        const availableW = Math.max(10, w1 - 2 * padX);
        const availableH = Math.max(10, h1 - 2 * padY);

        if (bestA.side === 'top' || bestA.side === 'bottom') {
          bestA = {
            ...bestA,
            x: p1.x + padX + availableW * factor
          };
        } else {
          bestA = {
            ...bestA,
            y: p1.y + padY + availableH * factor
          };
        }
      }
    }

    return { start: bestA, end: bestB };
  };

  const getBezierPath = (start, end) => {
    const dx = Math.abs(start.x - end.x);
    const dy = Math.abs(start.y - end.y);
    const offset = Math.min(100, Math.max(30, (dx + dy) * 0.2));

    let cp1 = { x: start.x, y: start.y };
    let cp2 = { x: end.x, y: end.y };

    if (start.side === 'right') cp1.x += offset;
    else if (start.side === 'left') cp1.x -= offset;
    else if (start.side === 'top') cp1.y -= offset;
    else if (start.side === 'bottom') cp1.y += offset;

    if (end.side === 'right') cp2.x += offset;
    else if (end.side === 'left') cp2.x -= offset;
    else if (end.side === 'top') cp2.y -= offset;
    else if (end.side === 'bottom') cp2.y += offset;

    return `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
  };

  // Context-aware relationship labels matching standard models
  const getRelationshipLabel = (source, target) => {
    const s = source.toLowerCase();
    const t = target.toLowerCase();
    if ((s === 'student' && t === 'enrollment') || (s === 'enrollment' && t === 'student')) return 'Enrolls';
    if ((s === 'course' && t === 'enrollment') || (s === 'enrollment' && t === 'course')) return 'Has';
    if ((s === 'instructor' && t === 'course') || (s === 'course' && t === 'instructor')) return 'Teaches';
    if ((s === 'user' && t === 'profile') || (s === 'profile' && t === 'user')) return 'Has';
    if ((s === 'customer' && t === 'order') || (s === 'order' && t === 'customer')) return 'Orders';
    if ((s === 'order' && t === 'item') || (s === 'item' && t === 'order')) return 'Contains';
    return 'Related';
  };

  // Render ER Diagram relationships & attributes in Chen Notation
  const renderERDiagram = () => {
    const { entities, relationships } = parseER(code);
    const entityW = 150;
    const entityH = 50;

    // Compute all node coordinates first
    const computedAttributes = [];
    entities.forEach((entity, entIdx) => {
      const ew = getEntityWidth(entity.name);
      const coord = nodePositions[entity.name] || { x: (entIdx % 3) * 450 + 200, y: Math.floor(entIdx / 3) * 360 + 200 };
      const cx = coord.x + ew / 2;
      const cy = coord.y + entityH / 2;
      const fields = entity.fields || [];
      const numFields = fields.length;
      
      // Calculate concentric default positions to prevent overlaps
      const Rx = Math.max(ew / 2 + 35, 105);
      const Ry = 62;

      fields.forEach((f, fIdx) => {
        const attrKey = `${entity.name}::attr::${f.name}`;
        const angle = -Math.PI / 2 + (2 * Math.PI * fIdx) / Math.max(1, numFields);
        const defPos = {
          x: Math.round(cx + Rx * Math.cos(angle)),
          y: Math.round(cy + Ry * Math.sin(angle))
        };
        const attrX = nodePositions[attrKey]?.x ?? defPos.x;
        const attrY = nodePositions[attrKey]?.y ?? defPos.y;

        computedAttributes.push({
          entityName: entity.name,
          fieldName: f.name,
          key: attrKey,
          cx,
          cy,
          attrX,
          attrY,
          isPK: f.key === 'PK',
          fIdx
        });
      });
    });

    const computedRelationships = [];
    relationships.forEach((rel, idx) => {
      const start = nodePositions[rel.source] || { x: 80, y: 80 };
      const end = nodePositions[rel.target] || { x: 320, y: 80 };

      const w1 = getEntityWidth(rel.source);
      const w2 = getEntityWidth(rel.target);
      const cx1 = start.x + w1 / 2;
      const cy1 = start.y + entityH / 2;
      const cx2 = end.x + w2 / 2;
      const cy2 = end.y + entityH / 2;

      const defaultMx = (cx1 + cx2) / 2;
      const defaultMy = (cy1 + cy2) / 2;

      const relKey = `${rel.source}::rel::${rel.target}`;
      const mx = nodePositions[relKey]?.x ?? defaultMx;
      const my = nodePositions[relKey]?.y ?? defaultMy;

      const pts1 = getBestConnectionPoints(start, { x: mx, y: my }, w1, entityH, 0, 0, relationships, rel);
      const pts2 = getBestConnectionPoints({ x: mx, y: my }, end, 0, 0, w2, entityH, relationships, rel);

      const markerStart = rel.sourceCard === 'MANY' ? 'url(#crow-foot-many)' : 'url(#crow-foot-one)';
      const markerEnd = rel.targetCard === 'MANY' ? 'url(#crow-foot-many)' : 'url(#crow-foot-one)';

      const label = rel.label || getRelationshipLabel(rel.source, rel.target);

      computedRelationships.push({
        source: rel.source,
        target: rel.target,
        key: relKey,
        mx,
        my,
        pts1,
        pts2,
        markerStart,
        markerEnd,
        label,
        idx
      });
    });

    return (
      <>
        {/* Pass 1: Draw ALL connector lines underneath */}
        <g id="er-connector-lines">
          {/* Attribute lines */}
          {computedAttributes.map((attr, idx) => (
            <line
              key={`attr-line-${idx}`}
              x1={attr.cx}
              y1={attr.cy}
              x2={attr.attrX}
              y2={attr.attrY}
              stroke="var(--text-disabled)"
              strokeWidth="1.5"
              strokeDasharray="3,3"
              style={{ pointerEvents: 'none' }}
            />
          ))}

          {/* Relationship lines */}
          {computedRelationships.map((rel, idx) => (
            <g key={`rel-lines-${idx}`}>
              <path
                d={`M ${rel.pts1.start.x} ${rel.pts1.start.y} L ${rel.mx} ${rel.my}`}
                stroke="var(--primary-main)"
                strokeWidth="2"
                fill="none"
                opacity="0.85"
                markerStart={rel.markerStart}
                style={{ pointerEvents: 'none' }}
              />
              <path
                d={`M ${rel.mx} ${rel.my} L ${rel.pts2.end.x} ${rel.pts2.end.y}`}
                stroke="var(--primary-main)"
                strokeWidth="2"
                fill="none"
                opacity="0.85"
                markerEnd={rel.markerEnd}
                style={{ pointerEvents: 'none' }}
              />
            </g>
          ))}
        </g>

        {/* Pass 2: Draw ALL shape components (ovals & diamonds) on top */}
        <g id="er-shape-components">
          {/* Attribute ovals */}
          {computedAttributes.map((attr, idx) => (
            <g
              key={`attr-shape-${idx}`}
              opacity="0.9"
              style={{ pointerEvents: 'auto', cursor: draggingNode === attr.key ? 'grabbing' : 'grab' }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setDraggingNode(attr.key);
                dragStartOffset.current = {
                  x: e.clientX / zoomScale - attr.attrX,
                  y: e.clientY / zoomScale - attr.attrY
                };
              }}
            >
              <ellipse
                cx={attr.attrX}
                cy={attr.attrY}
                rx="42"
                ry="18"
                fill="var(--background-paper)"
                stroke="var(--primary-main)"
                strokeWidth="1.5"
              />
              <text
                x={attr.attrX}
                y={attr.isPK ? attr.attrY - 1 : attr.attrY + 3}
                textAnchor="middle"
                fontSize="9.5"
                fill="var(--text-primary)"
                fontWeight={attr.isPK ? 'bold' : 'normal'}
                style={{ pointerEvents: 'none', fontFamily: 'Outfit, sans-serif' }}
              >
                {attr.fieldName}
              </text>
              {attr.isPK && (
                <line
                  x1={attr.attrX - 22}
                  y1={attr.attrY + 4}
                  x2={attr.attrX + 22}
                  y2={attr.attrY + 4}
                  stroke="var(--text-primary)"
                  strokeWidth="1"
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </g>
          ))}

          {/* Relationship diamonds */}
          {computedRelationships.map((rel, idx) => (
            <g
              key={`rel-shape-${idx}`}
              style={{ pointerEvents: 'auto', cursor: draggingNode === rel.key ? 'grabbing' : 'grab' }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setDraggingNode(rel.key);
                dragStartOffset.current = {
                  x: e.clientX / zoomScale - rel.mx,
                  y: e.clientY / zoomScale - rel.my
                };
              }}
            >
              <polygon
                points={`${rel.mx},${rel.my - 22} ${rel.mx + 40},${rel.my} ${rel.mx},${rel.my + 22} ${rel.mx - 40},${rel.my}`}
                fill="var(--background-paper)"
                stroke="var(--primary-dark)"
                strokeWidth="2"
              />
              <text
                x={rel.mx}
                y={rel.my + 3}
                fill="var(--primary-main)"
                fontSize="9"
                fontWeight="800"
                textAnchor="middle"
                style={{ pointerEvents: 'none', fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}
              >
                {rel.label}
              </text>
            </g>
          ))}
        </g>
      </>
    );
  };

  // Render Use Case Diagram relationships
  const renderUseCaseDiagram = () => {
    const { systemName, actors, usecases, links } = parseUseCase(code);
    const autoPos = computeUseCaseAutoLayout(actors, usecases, links, useCaseActorPlacement);

    let boxX = 260;
    let boxY = 30;
    let boxWidth = 360;
    let boxHeight = 540;

    if (usecases.length > 0) {
      let minUcX = Infinity;
      let maxUcX = -Infinity;
      let minUcY = Infinity;
      let maxUcY = -Infinity;

      usecases.forEach((uc, idx) => {
        const coord = nodePositions[uc.id] || autoPos[uc.id] || { x: 420, y: idx * 110 + 100 };
        if (coord.x < minUcX) minUcX = coord.x;
        if (coord.x + 200 > maxUcX) maxUcX = coord.x + 200;
        if (coord.y < minUcY) minUcY = coord.y;
        if (coord.y + 50 > maxUcY) maxUcY = coord.y + 50;
      });

      const paddingLeft = 60;
      const paddingRight = 60;
      const paddingTop = 75;
      const paddingBottom = 60;

      boxX = minUcX - paddingLeft;
      boxY = minUcY - paddingTop;
      boxWidth = (maxUcX + paddingRight) - boxX;
      boxHeight = (maxUcY + paddingBottom) - boxY;

      // Maintain minimum dimensions to keep the default neat look if usecases are clustered
      if (boxWidth < 360) {
        const diff = 360 - boxWidth;
        boxWidth = 360;
        boxX -= diff / 2;
      }
      if (boxHeight < 540) {
        const diff = 540 - boxHeight;
        boxHeight = 540;
        boxY -= diff / 2;
      }
    }

    return (
      <>
        {/* System Boundary Box */}
        <rect
          x={boxX}
          y={boxY}
          width={boxWidth}
          height={boxHeight}
          fill={activeTheme === 'dark' ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)"}
          stroke="var(--primary-main)"
          strokeWidth="1.5"
          rx="16"
        />
        <text 
          x={boxX + boxWidth / 2} 
          y={boxY + 25} 
          fill="var(--text-secondary)" 
          fontSize="13" 
          fontWeight="bold" 
          textAnchor="middle"
        >
          {systemName.toUpperCase()}
        </text>

        {/* Draw Connection Links */}
        {links.map((link, idx) => {
          const start = nodePositions[link.source];
          const end = nodePositions[link.target];
          if (!start || !end) return null;

          const isExtend = link.label === 'EXTEND';
          const isInclude = link.label === 'INCLUDE';
          const isInherits = link.label === 'INHERITS';
          const isExtendInclude = isExtend || isInclude;

          const isSourceActor = actors.some(a => a.id === link.source);
          const isTargetActor = actors.some(a => a.id === link.target);

          const w1 = isSourceActor ? 76 : 200;
          const h1 = isSourceActor ? 118 : 50;
          const w2 = isTargetActor ? 76 : 200;
          const h2 = isTargetActor ? 118 : 50;

          const pts = getBestConnectionPoints(start, end, w1, h1, w2, h2, links, link);
          const x1 = pts.start.x;
          const y1 = pts.start.y;
          const x2 = pts.end.x;
          const y2 = pts.end.y;

          const wpKey = `${link.source}_${link.target}`;
          const wp = usecaseWaypoints[wpKey];
          const cx = wp ? wp.x : (x1 + x2) / 2;
          const cy = wp ? wp.y : (y1 + y2) / 2;
          
          const pathD = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
          const handleKey = `${wpKey}::ctrl::usecase`;
          
          let strokeColor = 'var(--primary-main)';
          let strokeDasharray = '0';
          let markerEnd = 'none';
          
          if (isExtendInclude) {
            strokeColor = '#00FFCC';
            strokeDasharray = '5,5';
            markerEnd = 'url(#usecase-arrow)';
          } else if (isInherits) {
            markerEnd = 'url(#usecase-generalization-arrow)';
          }

          return (
            <g key={idx} className="gantt-dependency-group" style={{ pointerEvents: 'auto' }}>
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeDasharray={strokeDasharray}
                markerEnd={markerEnd}
              />
              <circle
                className={`gantt-waypoint-handle ${draggingWaypoint === handleKey ? 'active' : ''}`}
                cx={cx}
                cy={cy}
                r={5}
                fill={draggingWaypoint === handleKey ? '#fff' : 'var(--primary-main)'}
                stroke="#1e1e1e"
                strokeWidth="1.5"
                cursor="grab"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggingWaypoint(handleKey);
                }}
              />
              {isExtendInclude && (
                <g>
                  <rect
                    x={cx - 38}
                    y={cy - 14}
                    width="76"
                    height="18"
                    rx="4"
                    fill="var(--background-default)"
                    stroke="var(--divider)"
                    strokeWidth="1"
                  />
                  <text
                    x={cx}
                    y={cy - 1}
                    fill="#00FFCC"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {link.label === 'EXTEND' ? '<<extend>>' : '<<include>>'}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </>
    );
  };

  const handleCreateActivityNode = (nodeType, nodeId, label) => {
    if (!nodeId) return;
    const line = `\n${nodeType} ${nodeId} "${label}"`;
    setCode(prev => prev + line);
    setIsAddActivityNodeOpen(false);
  };

  const handleCreateActivityTransition = (source, target, guard) => {
    if (!source || !target) return;
    const guardStr = guard ? ` [${guard}]` : '';
    const line = `\n${source} -> ${target}${guardStr}`;
    setCode(prev => prev + line);
    setIsAddActivityTransitionOpen(false);
  };

  const handleStartSimulation = () => {
    const { nodes } = parseActivity(code);
    if (nodes.length === 0) return;
    const startNode = nodes.find(n => n.type === 'start') || nodes[0];
    setIsSimulating(true);
    setSimActiveNodeIds([startNode.id]);
    setSimVisitedEdges([]);
    setSimLog([`🚀 Flow started at [${startNode.label}]`]);
    setSimBranchChoices(null);
    setSimCompleted(false);
  };

  const handleStopSimulation = () => {
    setIsSimulating(false);
    setSimActiveNodeIds([]);
    setSimVisitedEdges([]);
    setSimLog([]);
    setSimBranchChoices(null);
    setSimCompleted(false);
  };

  const handleStepSimulation = (chosenTargetId = null) => {
    const { nodes, transitions } = parseActivity(code);
    if (simActiveNodeIds.length === 0) return;

    let nextActive = [];
    let newVisitedEdges = [...simVisitedEdges];
    let newLogs = [...simLog];
    let reachedEnd = false;

    for (const currId of simActiveNodeIds) {
      const currNode = nodes.find(n => n.id === currId);
      if (!currNode) continue;

      if (currNode.type === 'end') {
        newLogs.push(`🏁 Workflow successfully reached [${currNode.label}]`);
        reachedEnd = true;
        continue;
      }

      const outgoing = transitions.filter(t => t.source === currId);
      if (outgoing.length === 0) {
        newLogs.push(`⚠️ Flow stopped at [${currNode.label}] (no outgoing path)`);
        continue;
      }

      if (currNode.type === 'decision' && outgoing.length > 1 && !chosenTargetId) {
        const branchOptions = outgoing.map(t => ({
          targetId: t.target,
          guard: t.guard || 'default',
          edgeId: t.id,
          targetLabel: nodes.find(n => n.id === t.target)?.label || t.target
        }));
        setSimBranchChoices(branchOptions);
        return;
      }

      let selectedTransitions = outgoing;
      if (chosenTargetId) {
        selectedTransitions = outgoing.filter(t => t.target === chosenTargetId);
        if (selectedTransitions.length === 0) selectedTransitions = [outgoing[0]];
      } else if (currNode.type === 'decision') {
        selectedTransitions = [outgoing[0]];
      }

      selectedTransitions.forEach(t => {
        newVisitedEdges.push(t.id);
        const tgtNode = nodes.find(n => n.id === t.target);
        const guardTxt = t.guard ? ` via [${t.guard}]` : '';
        newLogs.push(`➡️ Flow moved to [${tgtNode?.label || t.target}]${guardTxt}`);
        if (!nextActive.includes(t.target)) {
          nextActive.push(t.target);
        }
        if (tgtNode?.type === 'end') {
          reachedEnd = true;
          newLogs.push(`🏁 Workflow reached [${tgtNode.label}]`);
        }
      });
    }

    setSimBranchChoices(null);
    setSimActiveNodeIds(nextActive);
    setSimVisitedEdges(newVisitedEdges);
    setSimLog(newLogs);
    if (reachedEnd && nextActive.every(id => nodes.find(n => n.id === id)?.type === 'end')) {
      setSimCompleted(true);
    }
  };

  // Render Activity Diagram connectors & lines
  const renderActivityDiagram = () => {
    const { nodes, transitions, partitions } = parseActivity(code);
    const hasPartitions = partitions && partitions.length > 0;

    const nodeDim = (type) => {
      if (type === 'start' || type === 'end') return { w: 36, h: 36 };
      if (type === 'decision') return { w: 140, h: 70 };
      if (type === 'fork' || type === 'join') return { w: 160, h: 12 };
      return { w: 196, h: 54 };
    };

    const autoPos = computeActivityAutoLayout(nodes, transitions, partitions);

    let maxY = 700;
    nodes.forEach(n => {
      const p = nodePositions[n.id] || autoPos[n.id];
      const dim = nodeDim(n.type);
      if (p && p.y + dim.h + 80 > maxY) maxY = p.y + dim.h + 80;
    });

    const partBounds = [];
    if (hasPartitions) {
      let currentX = 80;
      partitions.forEach((partName, pIdx) => {
        const partNodes = nodes.filter(n => (n.partition || partitions[0]) === partName);
        let maxNodeRight = currentX + 380;
        partNodes.forEach(n => {
          const p = nodePositions[n.id] || autoPos[n.id];
          const dim = nodeDim(n.type);
          if (p && p.x + dim.w + 50 > maxNodeRight) {
            maxNodeRight = p.x + dim.w + 50;
          }
        });

        const partW = Math.max(380, maxNodeRight - currentX);
        const xLeft = currentX;
        const xRight = currentX + partW;
        partBounds.push({ xLeft, xRight, width: partW, xCenter: xLeft + partW / 2, partName });
        currentX = xRight;
      });
    }

    return (
      <g id="activity-diagram-connectors">
        {/* Swimlane Partition Frames */}
        {hasPartitions && (
          <g id="activity-swimlanes">
            {partBounds.map((pb, pIdx) => {
              return (
                <g key={`swimlane-${pIdx}`}>
                  <rect
                    x={pb.xLeft + 10}
                    y={16}
                    width={pb.width - 20}
                    height={42}
                    fill="var(--background-paper)"
                    stroke="var(--primary-main)"
                    strokeWidth={2}
                    rx={10}
                  />
                  <text
                    x={pb.xCenter}
                    y={43}
                    textAnchor="middle"
                    fill="var(--primary-main)"
                    fontSize="16"
                    fontWeight="900"
                    fontFamily="Outfit, sans-serif"
                    letterSpacing="0.08em"
                  >
                    {pb.partName.toUpperCase()}
                  </text>
                  <line
                    x1={pb.xLeft}
                    y1={16}
                    x2={pb.xLeft}
                    y2={maxY}
                    stroke="var(--primary-main)"
                    strokeOpacity={0.4}
                    strokeWidth={2.5}
                    strokeDasharray={pIdx === 0 ? 'none' : '5,5'}
                  />
                  {pIdx === partBounds.length - 1 && (
                    <line
                      x1={pb.xRight}
                      y1={16}
                      x2={pb.xRight}
                      y2={maxY}
                      stroke="var(--primary-main)"
                      strokeOpacity={0.4}
                      strokeWidth={2.5}
                    />
                  )}
                </g>
              );
            })}
          </g>
        )}

        {transitions.map((t, idx) => {
          const srcNode = nodes.find(n => n.id === t.source);
          const tgtNode = nodes.find(n => n.id === t.target);
          if (!srcNode || !tgtNode) return null;

          const rawP1 = nodePositions[t.source] || autoPos[t.source];
          const rawP2 = nodePositions[t.target] || autoPos[t.target];
          const p1 = {
            x: rawP1 && Number.isFinite(rawP1.x) ? rawP1.x : 400,
            y: rawP1 && Number.isFinite(rawP1.y) ? rawP1.y : 100
          };
          const p2 = {
            x: rawP2 && Number.isFinite(rawP2.x) ? rawP2.x : 400,
            y: rawP2 && Number.isFinite(rawP2.y) ? rawP2.y : 220
          };

          const dim1 = nodeDim(srcNode.type);
          const dim2 = nodeDim(tgtNode.type);

          const srcCenter = { x: p1.x + dim1.w / 2, y: p1.y + dim1.h / 2 };
          const tgtCenter = { x: p2.x + dim2.w / 2, y: p2.y + dim2.h / 2 };
          const dx = tgtCenter.x - srcCenter.x;
          const dy = tgtCenter.y - srcCenter.y;
          const isLoopBack = (p2.y + dim2.h) < p1.y;

          let pathD = '';
          let midX = (srcCenter.x + tgtCenter.x) / 2;
          let midY = (srcCenter.y + tgtCenter.y) / 2;

          if (isLoopBack) {
            const startX = p1.x + dim1.w;
            const startY = srcCenter.y;
            const endX = p2.x + dim2.w;
            const endY = tgtCenter.y;
            const loopX = Math.max(p1.x + dim1.w, p2.x + dim2.w) + 60;
            const r = 12;
            pathD = `M ${startX} ${startY} H ${loopX - r} Q ${loopX} ${startY} ${loopX} ${startY - r} V ${endY + r} Q ${loopX} ${endY} ${loopX - r} ${endY} H ${endX}`;
            midX = loopX;
            midY = (startY + endY) / 2;
          } else if (Math.abs(dy) < 35 && Math.abs(dx) > 40) {
            // Horizontal side-by-side transition
            if (dx > 0) {
              const startX = p1.x + dim1.w;
              const startY = srcCenter.y;
              const endX = p2.x;
              const endY = tgtCenter.y;
              pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
              midX = (startX + endX) / 2;
              midY = startY;
            } else {
              const startX = p1.x;
              const startY = srcCenter.y;
              const endX = p2.x + dim2.w;
              const endY = tgtCenter.y;
              pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
              midX = (startX + endX) / 2;
              midY = startY;
            }
          } else if (srcNode.type === 'decision' && Math.abs(dx) > 60) {
            // Side branch from decision diamond
            const startX = dx > 0 ? p1.x + dim1.w : p1.x;
            const startY = srcCenter.y;
            const endX = tgtCenter.x;
            const endY = p2.y;
            const r = 12;
            const cornerX = endX;
            if (cornerX > startX) {
              pathD = `M ${startX} ${startY} H ${cornerX - r} Q ${cornerX} ${startY} ${cornerX} ${startY + r} V ${endY}`;
            } else {
              pathD = `M ${startX} ${startY} H ${cornerX + r} Q ${cornerX} ${startY} ${cornerX} ${startY + r} V ${endY}`;
            }
            midX = (startX + endX) / 2;
            midY = startY;
          } else {
            // Standard vertical or cross-lane flow with orthogonal rounded corners
            const startX = srcCenter.x;
            const startY = p1.y + dim1.h;
            const endX = tgtCenter.x;
            const endY = p2.y;

            if (Math.abs(startX - endX) < 8) {
              pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
              midX = startX;
              midY = (startY + endY) / 2;
            } else {
              const r = 12;
              const stepY = startY + Math.min(28, Math.max(16, (endY - startY) * 0.45));
              if (endX > startX) {
                pathD = `M ${startX} ${startY} V ${stepY - r} Q ${startX} ${stepY} ${startX + r} ${stepY} H ${endX - r} Q ${endX} ${stepY} ${endX} ${stepY + r} V ${endY}`;
              } else {
                pathD = `M ${startX} ${startY} V ${stepY - r} Q ${startX} ${stepY} ${startX - r} ${stepY} H ${endX + r} Q ${endX} ${stepY} ${endX} ${stepY + r} V ${endY}`;
              }
              midX = (startX + endX) / 2;
              midY = stepY;
            }
          }

          const isEdgeTraversed = simVisitedEdges.includes(t.id);
          const strokeColor = isEdgeTraversed ? '#00FFCC' : 'var(--primary-main)';
          const strokeWidth = isEdgeTraversed ? 2.5 : 2;

          return (
            <g key={`act-trans-${idx}`} className="activity-transition-group">
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                markerEnd="url(#activity-arrow)"
                opacity={isSimulating && !isEdgeTraversed ? 0.9 : 1}
                style={{ transition: 'stroke 0.3s ease, opacity 0.3s ease' }}
              />
              {t.guard && (
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x={-((t.guard.length * 7 + 16) / 2)}
                    y={-11}
                    width={t.guard.length * 7 + 16}
                    height={20}
                    rx={10}
                    fill="var(--background-paper)"
                    stroke={isEdgeTraversed ? '#00FFCC' : 'var(--divider)'}
                    strokeWidth={1}
                  />
                  <text
                    x={0}
                    y={3}
                    textAnchor="middle"
                    fill={isEdgeTraversed ? '#00FFCC' : 'var(--text-secondary)'}
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="Outfit, sans-serif"
                  >
                    [{t.guard}]
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </g>
    );
  };

  // Render Sequence Diagram
  const renderSequenceDiagram = () => {
    const { title, participants, messages } = parseSequence(code);
    const lifelines = {};

    participants.forEach((part, idx) => {
      lifelines[part.id] = idx * 260 + 160;
    });

    // Calculate canvas size bounds dynamically
    const diagWidth = Math.max(1200, participants.length * 260 + 200);
    const diagHeight = Math.max(800, messages.length * 52 + 180);

    return (
      <svg width={diagWidth} height={diagHeight} style={{ background: 'transparent' }}>
        {/* Title */}
        <text x="30" y="30" fill="var(--primary-main)" fontSize="16" fontWeight="bold">
          🎬 {title}
        </text>

        {/* Draw Vertical Lifelines */}
        {participants.map((part, idx) => {
          const x = lifelines[part.id];
          return (
            <g key={idx}>
              <line x1={x} y1="80" x2={x} y2={diagHeight - 60} stroke="var(--divider)" strokeWidth="2" strokeDasharray="6,6" />
              {/* Participant Box Top */}
              <rect x={x - 90} y="50" width="180" height="46" rx="8" fill="var(--background-paper)" stroke="var(--primary-main)" strokeWidth="2" />
              <text x={x} y="77" fill="var(--text-primary)" fontSize="15" fontWeight="bold" textAnchor="middle">{part.label}</text>
              {/* Participant Box Bottom */}
              <rect x={x - 90} y={diagHeight - 50} width="180" height="46" rx="8" fill="var(--background-paper)" stroke="var(--primary-main)" strokeWidth="2" />
              <text x={x} y={diagHeight - 23} fill="var(--text-primary)" fontSize="15" fontWeight="bold" textAnchor="middle">{part.label}</text>
            </g>
          );
        })}

        {/* Draw Messages and Control Blocks */}
        {messages.map((msg, idx) => {
          const y = idx * 52 + 120;

          if (msg.type === 'control') {
            const startX = 50;
            const endX = participants.length * 260 + 50;
            return (
              <g key={idx}>
                <line
                  x1={startX}
                  y1={y}
                  x2={endX}
                  y2={y}
                  stroke="var(--primary-main)"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                  opacity={0.6}
                />
                <rect
                  x={startX + 20}
                  y={y - 12}
                  width="270"
                  height="24"
                  rx="6"
                  fill="var(--background-paper)"
                  stroke="var(--primary-main)"
                  strokeWidth="1"
                />
                <text
                  x={startX + 32}
                  y={y + 5}
                  fill="var(--primary-main)"
                  fontSize="13"
                  fontWeight="bold"
                >
                  {msg.label}
                </text>
              </g>
            );
          }

          const x1 = lifelines[msg.source];
          const x2 = lifelines[msg.target];
          if (!x1 || !x2) return null;

          const isResponseOrDisplay = msg.type === 'return' || msg.type === 'display';

          return (
            <g key={idx}>
              <line
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                stroke={isResponseOrDisplay ? 'var(--primary-main)' : 'var(--text-primary)'}
                strokeWidth="1.5"
                strokeDasharray={isResponseOrDisplay ? '4,4' : '0'}
              />
              {x2 > x1 ? (
                <polygon points={`${x2},${y} ${x2 - 8},${y - 4} ${x2 - 8},${y + 4}`} fill={isResponseOrDisplay ? 'var(--primary-main)' : 'var(--text-primary)'} />
              ) : (
                <polygon points={`${x2},${y} ${x2 + 8},${y - 4} ${x2 + 8},${y + 4}`} fill={isResponseOrDisplay ? 'var(--primary-main)' : 'var(--text-primary)'} />
              )}
              <text
                x={(x1 + x2) / 2}
                y={y - 8}
                fill={isResponseOrDisplay ? 'var(--primary-main)' : 'var(--text-primary)'}
                fontSize="14"
                fontWeight="600"
                textAnchor="middle"
              >
                {msg.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // Render Gantt Chart
  const renderGanttChart = () => {
    const { sections, tasks } = parseGantt(code);
    const rowHeight = 48;

    const monthWidth = ganttViewScale === 'days' ? 930 : ganttViewScale === 'months' ? 160 : 480;
    const dayWidth = monthWidth / 31;
    const monthDividerX = 720;

    const getWeekLabel = (monthZeroIndexed, weekIdx) => {
      const dayOfStart = weekIdx * 7 + 1;
      return `${monthZeroIndexed + 1}/${dayOfStart}`;
    };

    // Calculate earliest start date and latest end date dynamically
    let earliestDate = new Date('2026-07-01'); // fallback
    let latestDate = new Date('2026-08-31'); // fallback
    let foundDate = false;

    tasks.forEach(task => {
      if (task.startDateStr) {
        const d = new Date(task.startDateStr);
        if (!isNaN(d.getTime())) {
          const endDate = new Date(d.getTime() + task.duration * 24 * 60 * 60 * 1000);
          if (!foundDate) {
            earliestDate = d;
            latestDate = endDate;
            foundDate = true;
          } else {
            if (d < earliestDate) earliestDate = d;
            if (endDate > latestDate) latestDate = endDate;
          }
        }
      }
    });

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const mStart = earliestDate.getMonth();
    const yStart = earliestDate.getFullYear();
    const mEnd = latestDate.getMonth();
    const yEnd = latestDate.getFullYear();

    let numMonths = (yEnd - yStart) * 12 + (mEnd - mStart) + 1;
    if (numMonths < 2 && !foundDate) numMonths = 2; // Default to 2 if empty
    if (numMonths < 1) numMonths = 1;

    const svgWidth = 240 + numMonths * monthWidth + 20; // 240 left pane + monthWidth per month + 20 padding

    // Precalculate positions
    sections.forEach((section, secIdx) => {
      const sectionTasks = tasks.filter(t => t.section === section);
      const sectionYStart = secIdx * 450 + 60; // Shifted up after removing header banner

      sectionTasks.forEach((task, taskIdx) => {
        task.y = sectionYStart + taskIdx * rowHeight;
        task.width = Math.max(12, task.duration * dayWidth);

        let x = 240;
        if (task.startDateStr) {
          const tDate = new Date(task.startDateStr);
          if (!isNaN(tDate.getTime())) {
            const m = tDate.getMonth();
            const y = tDate.getFullYear();
            const d = tDate.getDate();
            const monthDiff = (y - yStart) * 12 + (m - mStart);
            if (monthDiff >= 0 && monthDiff < numMonths) {
              x = 240 + monthDiff * monthWidth + (d - 1) * dayWidth;
            } else if (monthDiff < 0) {
              x = 240; // clamp to start
            } else {
              x = svgWidth - 20; // clamp to end
            }
          }
        }
        task.x = x;
      });
    });

    return (
      <svg width={svgWidth} height="800" style={{ background: 'transparent' }}>
        {/* Month Labels at the top */}
        {Array.from({ length: numMonths }).map((_, idx) => {
          const m = (mStart + idx) % 12;
          const y = yStart + Math.floor((mStart + idx) / 12);
          const x = 240 + idx * monthWidth + monthWidth / 2;
          return (
            <text key={`month_label_${idx}`} x={x} y="15" fill="var(--text-primary)" fontSize="13" fontWeight="bold" textAnchor="middle">
              {monthNames[m]} {y}
            </text>
          );
        })}

        {/* Dynamic Headers based on View Mode */}
        {ganttViewScale === 'weeks' && Array.from({ length: numMonths }).map((_, mIdx) => {
          const m = (mStart + mIdx) % 12;
          return Array.from({ length: 4 }).map((_, wIdx) => {
            const x = 240 + mIdx * monthWidth + wIdx * (monthWidth / 4) + (monthWidth / 8);
            return (
              <text key={`m_${mIdx}_w_${wIdx}`} x={x} y="35" textAnchor="middle" fontSize="11" fontWeight="bold">
                <tspan fill="var(--text-primary)">W{mIdx * 4 + wIdx + 1}</tspan>
                <tspan fill="var(--primary-main)" dx="4">({getWeekLabel(m, wIdx)})</tspan>
              </text>
            );
          });
        })}

        {ganttViewScale === 'days' && Array.from({ length: numMonths }).map((_, mIdx) => {
          return Array.from({ length: 31 }).map((_, dIdx) => {
            const x = 240 + mIdx * monthWidth + dIdx * dayWidth + dayWidth / 2;
            return (
              <text key={`m_${mIdx}_d_${dIdx}`} x={x} y="35" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="500">
                {dIdx + 1}
              </text>
            );
          });
        })}

        {/* Horizontal Divider separating calendar headers from diagram area */}
        <line x1="15" y1="45" x2={svgWidth - 15} y2="45" stroke="var(--divider)" strokeOpacity="0.8" strokeWidth="1.5" />

        {/* Vertical divider lines for start and end of months */}
        {Array.from({ length: numMonths + 1 }).map((_, idx) => {
          const x = 240 + idx * monthWidth;
          return (
            <line key={`v_divider_${idx}`} x1={x} y1="45" x2={x} y2="760" stroke="var(--divider)" strokeOpacity="0.6" strokeWidth="1.5" />
          );
        })}

        {/* Vertical dotted division guidelines */}
        {ganttViewScale === 'weeks' && Array.from({ length: numMonths }).map((_, mIdx) => {
          return [1, 2, 3].map(wIdx => {
            const x = 240 + mIdx * monthWidth + wIdx * (monthWidth / 4);
            return (
              <line key={`w_line_${mIdx}_${wIdx}`} x1={x} y1="45" x2={x} y2="760" stroke="var(--divider)" strokeOpacity="0.35" strokeDasharray="2,4" />
            );
          });
        })}

        {ganttViewScale === 'days' && Array.from({ length: numMonths }).map((_, mIdx) => {
          return Array.from({ length: 30 }).map((_, dIdx) => {
            const x = 240 + mIdx * monthWidth + (dIdx + 1) * dayWidth;
            return (
              <line key={`d_line_${mIdx}_${dIdx}`} x1={x} y1="45" x2={x} y2="760" stroke="var(--divider)" strokeOpacity="0.15" strokeDasharray="2,4" />
            );
          });
        })}

        {/* Horizontal guide dotted lines under each task row separator */}
        {tasks.map((task, idx) => (
          <line
            key={`guide_${idx}`}
            x1="15"
            y1={task.y + 36}
            x2={svgWidth - 15}
            y2={task.y + 36}
            stroke="var(--text-secondary)"
            strokeOpacity="0.55"
            strokeDasharray="3,3"
            strokeWidth="1.2"
          />
        ))}
        {/* Bottom Horizontal Divider to close the grid frame horizontally */}
        <line x1="15" y1="760" x2={svgWidth - 15} y2="760" stroke="var(--divider)" strokeOpacity="0.6" strokeWidth="1.5" />        {/* 4. Orthogonal Stepped Dependency Connectors (routed to never cross task bars) */}
        {tasks.map((task, idx) => {
          if (!task.dependencies || task.dependencies.length === 0) return null;
          return task.dependencies.map((depName, depIdx) => {
            const depTask = tasks.find(pt => pt.name === depName);
            if (!depTask || depTask.x === undefined || depTask.y === undefined) return null;

            const xStart = depTask.x + depTask.width;
            const yStart = depTask.y + 10;
            const xEnd = task.x;
            const yEnd = task.y + 10;

            const yGap = depTask.y + 26; // bottom gap of the 20px bar in 48px rowHeight
            const arrowTipX = xEnd;
            const arrowBaseX = xEnd - 8;

            const wpKey = `${depName}->${task.name}`;
            const wp = ganttWaypoints[wpKey];

            const generateRoundedPath = (x1, y1, x2, y2, gapY) => {
              const r = 6;
              const rightPad = 12;
              const leftPad = 12;

              if (y2 <= y1 + r) {
                return { d: `M ${x1} ${y1} H ${x1 + rightPad} V ${gapY} H ${x2 - leftPad} V ${y2} H ${x2}`, handles: [] };
              }

              if (x1 + rightPad + r * 2 <= x2 - leftPad) {
                // Forward route
                let xDrop = x1 + rightPad;
                if (wp && wp.xDrop !== undefined) xDrop = Math.max(x1 + r, Math.min(x2 - r, wp.xDrop));
                
                return {
                  d: `M ${x1} ${y1} L ${xDrop - r} ${y1} A ${r} ${r} 0 0 1 ${xDrop} ${y1 + r} L ${xDrop} ${y2 - r} A ${r} ${r} 0 0 0 ${xDrop + r} ${y2} L ${x2} ${y2}`,
                  handles: [
                    { id: 'xDrop', cx: xDrop, cy: (y1 + y2) / 2 }
                  ]
                };
              } else {
                // Backward route
                let xDrop1 = x1 + rightPad;
                if (wp && wp.xDrop1 !== undefined) xDrop1 = Math.max(x1 + r, wp.xDrop1);

                let customGapY = gapY;
                if (wp && wp.gapY !== undefined) customGapY = wp.gapY;

                let xDrop2 = x2 - leftPad;
                if (wp && wp.xDrop2 !== undefined) xDrop2 = Math.min(x2 - r, wp.xDrop2);

                return {
                  d: `M ${x1} ${y1} L ${xDrop1 - r} ${y1} A ${r} ${r} 0 0 1 ${xDrop1} ${y1 + r} L ${xDrop1} ${customGapY - r} A ${r} ${r} 0 0 1 ${xDrop1 - r} ${customGapY} L ${xDrop2 + r} ${customGapY} A ${r} ${r} 0 0 0 ${xDrop2} ${customGapY + r} L ${xDrop2} ${y2 - r} A ${r} ${r} 0 0 0 ${xDrop2 + r} ${y2} L ${x2} ${y2}`,
                  handles: [
                    { id: 'xDrop1', cx: xDrop1, cy: (y1 + customGapY) / 2 },
                    { id: 'gapY', cx: (xDrop1 + xDrop2) / 2, cy: customGapY },
                    { id: 'xDrop2', cx: xDrop2, cy: (customGapY + y2) / 2 }
                  ]
                };
              }
            };

            const pathInfo = generateRoundedPath(xStart, yStart, arrowBaseX, yEnd, yGap);

            return (
              <g key={`${idx}_${depIdx}`} className="gantt-dependency-group">
                {/* Canva-style Rounded Orthogonal Line */}
                <path
                  d={pathInfo.d}
                  fill="none"
                  stroke="var(--primary-main)"
                  strokeWidth="2.2"
                />
                {/* Manual Arrowhead pointing right */}
                <polygon
                  points={`${arrowTipX},${yEnd} ${arrowBaseX},${yEnd - 4.5} ${arrowBaseX},${yEnd + 4.5}`}
                  fill="var(--primary-main)"
                />
                {/* Draggable Control Handles */}
                {pathInfo.handles.map(handle => {
                  const handleKey = `${wpKey}::${handle.id}`;
                  return (
                    <circle
                      key={handle.id}
                      className={`gantt-waypoint-handle ${draggingWaypoint === handleKey ? 'active' : ''}`}
                      cx={handle.cx}
                      cy={handle.cy}
                      r={5}
                      fill={draggingWaypoint === handleKey ? '#fff' : 'var(--primary-main)'}
                      stroke="#1e1e1e"
                      strokeWidth="1.5"
                      cursor="grab"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggingWaypoint(handleKey);
                      }}
                    />
                  );
                })}
              </g>
            );
          });
        })}

        {/* 5. Render Sections and Tasks */}
        {sections.map((section, secIdx) => {
          const sectionTasks = tasks.filter(t => t.section === section);

          return (
            <g key={secIdx}>
              {sectionTasks.map((task, taskIdx) => {
                const y = task.y;
                const width = task.width;
                const x = task.x;

                // Alternate between solid blue and orange bars matching the reference image
                let barColor = taskIdx % 2 === 0 ? '#0D6EFD' : '#FFA726';
                let strokeColor = taskIdx % 2 === 0 ? '#0B5ED7' : '#FB8C00';

                if (task.duration === 0) {
                  // Milestone
                  barColor = 'rgba(239,83,80,0.2)';
                  strokeColor = '#EF5350';
                } else if (task.status === 'done') {
                  barColor = 'rgba(255,255,255,0.04)';
                  strokeColor = 'rgba(255,255,255,0.3)';
                }

                return (
                  <g key={taskIdx}>
                    {/* Task Name Label (Left sidebar area) */}
                    <text x="25" y={y + 14} fill="var(--text-primary)" fontSize="11" fontWeight="600">
                      {task.name}
                    </text>

                    {/* Gantt Bar */}
                    {task.duration === 0 ? (
                      // Milestone Diamond shape
                      <polygon
                        points={`${x},${y + 10} ${x + 10},${y} ${x + 20},${y + 10} ${x + 10},${y + 20}`}
                        fill={barColor}
                        stroke={strokeColor}
                        strokeWidth="1.5"
                      />
                    ) : (
                      // Task rectangular bar
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height="20"
                        rx="6"
                        fill={barColor}
                        stroke={strokeColor}
                        strokeWidth="1.5"
                      />
                    )}

                    {/* Duration Text */}
                    <text x={x + (task.duration === 0 ? 32 : width + 22)} y={y + 13} fill="var(--text-secondary)" fontSize="10" fontWeight="bold">
                      {task.duration === 0 ? 'Milestone' : `${task.duration}d`}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    );
  };

  const renderContent = () => {
    return (
      <Box id="se-split-container" style={{ display: 'flex', flexDirection: 'row', flexGrow: 1, width: '100%', alignItems: 'stretch', position: 'relative', minHeight: 0 }}>

        {/* Left Pane: Code Editor */}
        <Box style={{
          width: isFullscreen ? '0%' : `${splitPercent}%`,
          opacity: isFullscreen ? 0 : 1,
          pointerEvents: isFullscreen ? 'none' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <Paper
            elevation={0}
            style={{
              padding: '16px 24px',
              borderRadius: 0,
              borderBottomLeftRadius: '24px',
              background: activeTabKey === 'gantt' ? 'transparent' : (isDarkMode ? 'rgba(0, 0, 0, 0.25)' : 'var(--background-paper)'),
              borderRight: '1px solid var(--divider)',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden',
              boxSizing: 'border-box'
            }}
          >
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                SOURCE CODE ({activeTabTitle})
              </Typography>
              <Tooltip title="Generate diagram DSL code with ChatGPT AI">
                <Button
                  size="small"
                  startIcon={<AutoAwesomeIcon style={{ fontSize: '0.9rem', color: '#10a37f' }} />}
                  onClick={() => setIsAiModalOpen(true)}
                  style={{
                    textTransform: 'none',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#10a37f',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'rgba(16, 163, 127, 0.08)',
                    border: '1px solid rgba(16, 163, 127, 0.25)'
                  }}
                >
                  Prompt ChatGPT
                </Button>
              </Tooltip>
            </Box>
            <Box style={{
              flexGrow: 1,
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid var(--divider)',
              background: activeTabKey === 'gantt' ? 'transparent' : (isDarkMode ? '#1e1e1e' : '#ffffff'),
              height: 'calc(100% - 30px)',
              position: 'relative'
            }}>
              {activeTabKey === 'gantt' && (
                <style>{`
                  .monaco-editor, 
                  .monaco-editor .margin, 
                  .monaco-editor-background, 
                  .monaco-editor .inputarea.ime-input {
                    background-color: transparent !important;
                  }
                `}</style>
              )}
              <Editor
                height="100%"
                language="markdown"
                theme={isDarkMode ? "vs-dark" : "vs"}
                value={editorCode}
                onChange={(val) => setCode(val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  wordWrap: 'on',
                  lineHeight: 19,
                  scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 }
                }}
              />
            </Box>
          </Paper>
        </Box>

        {/* Dynamic Split Divider Bar */}
        <Box
          onMouseDown={(e) => {
            e.preventDefault();
            isDraggingSplitRef.current = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
          }}
          style={{
            width: isFullscreen ? '0px' : '8px',
            cursor: isFullscreen ? 'default' : 'col-resize',
            backgroundColor: 'transparent',
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            marginLeft: isFullscreen ? '0px' : '-4px',
            marginRight: isFullscreen ? '0px' : '-4px'
          }}
          sx={{
            '&:hover, &:active': {
              backgroundColor: 'var(--primary-main)'
            },
            '&::after': {
              content: '""',
              width: isFullscreen ? '0px' : '2px',
              height: '40px',
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
              borderRadius: '1px'
            }
          }}
        />

        {/* Right Pane: Visualizer Canvas */}
        <Box style={{
          width: isFullscreen ? '100%' : `${100 - splitPercent}%`,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <Paper
            elevation={0}
            style={{
              padding: '16px 24px',
              borderRadius: 0,
              borderBottomRightRadius: '24px',
              background: activeTabKey === 'gantt' ? 'transparent' : (isDarkMode ? 'rgba(10, 10, 20, 0.2)' : 'var(--background-paper)'),
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden',
              position: 'relative',
              boxSizing: 'border-box'
            }}
          >
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                VISUAL DIAGRAM PREVIEW
              </Typography>

              <Box style={{ display: 'flex', gap: '4px', background: 'var(--background-paper)', borderRadius: '8px', padding: '2px', border: '1px solid var(--divider)', zIndex: 5, alignItems: 'center' }}>
                {activeTabKey === 'er' && (
                  <>
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      startIcon={<AddIcon style={{ fontSize: '0.9rem' }} />}
                      onClick={() => setIsAddEntityOpen(true)}
                      style={{
                        marginRight: '8px',
                        marginLeft: '4px',
                        borderRadius: '6px',
                        textTransform: 'none',
                        height: '28px',
                        fontSize: '0.72rem',
                        background: 'var(--primary-main)',
                        fontWeight: 800}}
                    >
                      Add Entity
                    </Button>
                    <Tooltip title="Auto-arrange all entities into a clean grid layout">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AutoFixHighIcon style={{ fontSize: '0.9rem' }} />}
                        onClick={handleAutoLayout}
                        style={{
                          marginRight: '8px',
                          borderRadius: '6px',
                          textTransform: 'none',
                          height: '28px',
                          fontSize: '0.72rem',
                          borderColor: 'var(--divider)',
                          color: 'var(--text-primary)',
                          fontWeight: 700
                        }}
                      >
                        Auto-Layout
                      </Button>
                    </Tooltip>
                  </>
                )}
                {activeTabKey === 'usecase' && (
                  <>
                    <Button variant="contained" size="small" color="primary" startIcon={<AddIcon style={{ fontSize: '0.9rem' }} />} onClick={() => setIsAddActorOpen(true)} style={{ marginRight: '4px', marginLeft: '4px', borderRadius: '6px', textTransform: 'none', height: '28px', fontSize: '0.72rem', background: 'var(--primary-main)', fontWeight: 800 }}>
                      Actor
                    </Button>
                    <Button variant="contained" size="small" color="primary" startIcon={<AddIcon style={{ fontSize: '0.9rem' }} />} onClick={() => setIsAddUseCaseOpen(true)} style={{ marginRight: '8px', borderRadius: '6px', textTransform: 'none', height: '28px', fontSize: '0.72rem', background: 'var(--primary-main)', fontWeight: 800 }}>
                      Use Case
                    </Button>
                    <Tooltip title="Choose actor placement relative to the system block: Both sides, Left only, or Right only">
                      <Box style={{ display: 'inline-flex', alignItems: 'center', marginRight: '8px', background: 'var(--bg-paper, rgba(255,255,255,0.05))', borderRadius: '6px', border: '1px solid var(--divider)', padding: '1px 3px', height: '28px' }}>
                        <Typography style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '3px', marginLeft: '3px', whiteSpace: 'nowrap' }}>
                          Actors:
                        </Typography>
                        <ToggleButtonGroup
                          value={useCaseActorPlacement}
                          exclusive
                          onChange={(e, newPlacement) => {
                            if (newPlacement) handleActorPlacementChange(newPlacement);
                          }}
                          size="small"
                          style={{ height: '22px' }}
                        >
                          <ToggleButton value="both" style={{ textTransform: 'none', fontSize: '0.66rem', padding: '1px 6px', fontWeight: useCaseActorPlacement === 'both' ? 800 : 500, borderRadius: '4px' }}>
                            Both
                          </ToggleButton>
                          <ToggleButton value="left" style={{ textTransform: 'none', fontSize: '0.66rem', padding: '1px 6px', fontWeight: useCaseActorPlacement === 'left' ? 800 : 500, borderRadius: '4px' }}>
                            Left
                          </ToggleButton>
                          <ToggleButton value="right" style={{ textTransform: 'none', fontSize: '0.66rem', padding: '1px 6px', fontWeight: useCaseActorPlacement === 'right' ? 800 : 500, borderRadius: '4px' }}>
                            Right
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </Box>
                    </Tooltip>
                    <Tooltip title="Auto-arrange actors & use cases into an aligned layout">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AutoFixHighIcon style={{ fontSize: '0.9rem' }} />}
                        onClick={handleAutoLayout}
                        style={{
                          marginRight: '8px',
                          borderRadius: '6px',
                          textTransform: 'none',
                          height: '28px',
                          fontSize: '0.72rem',
                          borderColor: 'var(--divider)',
                          color: 'var(--text-primary)',
                          fontWeight: 700
                        }}
                      >
                        Auto-Layout
                      </Button>
                    </Tooltip>
                  </>
                )}
                {activeTabKey === 'activity' && (
                  <>
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      startIcon={<AddIcon style={{ fontSize: '0.9rem' }} />}
                      onClick={() => setIsAddActivityNodeOpen(true)}
                      style={{ marginRight: '4px', marginLeft: '4px', borderRadius: '6px', textTransform: 'none', height: '28px', fontSize: '0.72rem', background: 'var(--primary-main)', fontWeight: 800 }}
                    >
                      Add Node
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      startIcon={<AddIcon style={{ fontSize: '0.9rem' }} />}
                      onClick={() => setIsAddActivityTransitionOpen(true)}
                      style={{ marginRight: '8px', borderRadius: '6px', textTransform: 'none', height: '28px', fontSize: '0.72rem', background: 'var(--primary-main)', fontWeight: 800 }}
                    >
                      Add Transition
                    </Button>
                    <Tooltip title="Auto-arrange activity nodes into hierarchical swimlanes">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AutoFixHighIcon style={{ fontSize: '0.9rem' }} />}
                        onClick={handleAutoLayout}
                        style={{
                          marginRight: '8px',
                          borderRadius: '6px',
                          textTransform: 'none',
                          height: '28px',
                          fontSize: '0.72rem',
                          borderColor: 'var(--divider)',
                          color: 'var(--text-primary)',
                          fontWeight: 700
                        }}
                      >
                        Auto-Layout
                      </Button>
                    </Tooltip>
                    <Tooltip title={isSimulating ? "Stop Simulation" : "Simulate and Step through Workflow Execution"}>
                      <IconButton
                        size="small"
                        onClick={isSimulating ? handleStopSimulation : handleStartSimulation}
                        style={{
                          marginRight: '8px',
                          borderRadius: '6px',
                          height: '28px',
                          width: '28px',
                          background: isSimulating ? '#EF4444' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          color: '#fff'
                        }}
                      >
                        {isSimulating ? <StopIcon style={{ fontSize: '1rem' }} /> : <PlayIcon style={{ fontSize: '1rem' }} />}
                      </IconButton>
                    </Tooltip>
                  </>
                )}
                {activeTabKey === 'sequence' && (
                  <>
                    <Button variant="contained" size="small" color="primary" startIcon={<AddIcon style={{ fontSize: '0.9rem' }} />} onClick={() => setIsAddParticipantOpen(true)} style={{ marginRight: '4px', marginLeft: '4px', borderRadius: '6px', textTransform: 'none', height: '28px', fontSize: '0.72rem', background: 'var(--primary-main)', fontWeight: 800 }}>
                      Add Participant
                    </Button>
                    <Button variant="contained" size="small" color="primary" startIcon={<AddIcon style={{ fontSize: '0.9rem' }} />} onClick={() => setIsAddSequenceMessageOpen(true)} style={{ marginRight: '8px', borderRadius: '6px', textTransform: 'none', height: '28px', fontSize: '0.72rem', background: 'var(--primary-main)', fontWeight: 800 }}>
                      Add Message
                    </Button>
                  </>
                )}
                {activeTabKey === 'gantt' && (
                  <>
                    <Select
                      size="small"
                      value={ganttViewScale}
                      onChange={(e) => setGanttViewScale(e.target.value)}
                      style={{ height: '28px', color: 'var(--text-primary)', fontSize: '0.75rem', marginRight: '8px', background: 'var(--background-paper)', border: '1px solid var(--divider)', borderRadius: '6px' }}
                      MenuProps={{ PaperProps: { style: { backgroundColor: 'var(--background-paper)', color: 'var(--text-primary)' } } }}
                    >
                      <MenuItem value="days">Days</MenuItem>
                      <MenuItem value="weeks">Weeks</MenuItem>
                      <MenuItem value="months">Months</MenuItem>
                    </Select>
                    <Button variant="contained" size="small" color="primary" startIcon={<AddIcon style={{ fontSize: '0.9rem' }} />} onClick={() => setIsAddTaskOpen(true)} style={{ marginRight: '8px', marginLeft: '4px', borderRadius: '6px', textTransform: 'none', height: '28px', fontSize: '0.72rem', background: 'var(--primary-main)', fontWeight: 800 }}>
                      Add Task
                    </Button>
                  </>
                )}
                <Tooltip title="Fullscreen Visual Preview">
                  <IconButton size="small" onClick={() => setIsPreviewOpen(true)} style={{ color: 'var(--primary-main)' }}>
                    <PreviewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Zoom In">
                  <IconButton size="small" onClick={() => setZoomScale(prev => Math.min(2.0, prev + 0.1))} style={{ color: 'var(--text-primary)' }}>
                    <ZoomInIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Zoom Out">
                  <IconButton size="small" onClick={() => setZoomScale(prev => Math.max(0.2, prev - 0.1))} style={{ color: 'var(--text-primary)' }}>
                    <ZoomOutIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reset View">
                  <IconButton size="small" onClick={() => { setZoomScale(0.8); if (canvasContainerRef.current) { canvasContainerRef.current.scrollLeft = 0; canvasContainerRef.current.scrollTop = 0; } }} style={{ color: 'var(--text-primary)' }}>
                    <ResetIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Canvas'}>
                  <IconButton size="small" onClick={() => setIsFullscreen(!isFullscreen)} style={{ color: 'var(--text-primary)' }}>
                    {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Scrollable Container Box */}
            <Box
              ref={setCanvasContainer}
              id="canvas-interactive-area"
              onMouseDown={handleCanvasMouseDown}
              data-theme={activeTheme}
              style={{
                flexGrow: 1,
                background: 'var(--background-default)',
                borderRadius: '12px',
                border: '1.5px solid var(--divider)',
                position: 'relative',
                overflow: 'auto',
                height: 'calc(100% - 30px)',
                cursor: isPanningRef.current ? 'grabbing' : 'grab',
                userSelect: 'none'}}
            >
              {/* Virtual Scroll Boundaries Wrapper */}
              <Box
                id="se-main-capture-content"
                style={{
                  width: `${(canvasDim.width + 200) * zoomScale}px`,
                  height: `${(canvasDim.height + 300) * zoomScale}px`,
                  position: 'relative',
                  overflow: 'hidden',
                  pointerEvents: 'none'
                }}
              >
                {/* Virtual Canvas scaled as a single unit */}
                <Box
                  id="se-main-canvas-inner"
                  style={{
                    width: `${canvasDim.width}px`,
                    height: `${canvasDim.height}px`,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transform: `scale(${zoomScale})`,
                    transformOrigin: 'top left',
                    backgroundImage: 'none',
                    backgroundColor: 'var(--background-default)',
                    pointerEvents: 'auto'
                  }}
                >
                  <div
                    id="mermaid-preview-target"
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'relative'
                    }}
                  >
                    {/* SVG Connector Lines Overlay */}
                    <svg width="4000" height="4000" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 2, overflow: 'visible' }}>
                      <defs>
                        {/* ER Crow-foot connection marker ends */}
                        <marker id="crow-foot-many" viewBox="0 0 20 20" refX="20" refY="10" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
                          <path d="M 0 4 L 20 10 L 0 16 M 10 0 L 10 20" fill="none" stroke="var(--primary-main)" strokeWidth="2" />
                        </marker>
                        <marker id="crow-foot-one" viewBox="0 0 20 20" refX="20" refY="10" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
                          <line x1="8" y1="2" x2="8" y2="18" stroke="var(--primary-main)" strokeWidth="2" />
                          <line x1="14" y1="2" x2="14" y2="18" stroke="var(--primary-main)" strokeWidth="2" />
                        </marker>
                        <marker id="usecase-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1 L 10 5 L 0 9" fill="none" stroke="var(--primary-main)" strokeWidth="1.5" />
                        </marker>
                        <marker id="usecase-generalization-arrow" viewBox="0 0 12 12" refX="12" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                          <path d="M 0 2 L 12 6 L 0 10 Z" fill="var(--background-default)" stroke="var(--primary-main)" strokeWidth="1.5" />
                        </marker>
                        <marker id="activity-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                          <path d="M 0 1.5 L 9 5 L 0 8.5 Z" fill="var(--primary-main)" stroke="var(--primary-main)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </marker>
                      </defs>

                      {activeTabKey === 'er' && renderERDiagram()}
                      {activeTabKey === 'usecase' && renderUseCaseDiagram()}
                      {activeTabKey === 'activity' && renderActivityDiagram()}
                    </svg>

                    {/* Sequence and Gantt have internal SVG wrapper structures */}
                    {activeTabKey === 'sequence' && renderSequenceDiagram()}
                    {activeTabKey === 'gantt' && renderGanttChart()}

                    {/* DRAGGABLE NODE CARDS OVERLAY (HTML siblings for ER, Use Case, and Activity) */}
                    {activeTabKey === 'er' && parseER(code).entities.map((entity, idx) => {
                      const coord = nodePositions[entity.name] || { x: (idx % 3) * 320 + 120, y: Math.floor(idx / 3) * 220 + 100 };
                      const isPendingSource = pendingRelationSource === entity.name;
                      const isCandidateTarget = pendingRelationSource && pendingRelationSource !== entity.name;
                      return (
                        <div
                          key={idx}
                          className="se-node-card er-entity-card"
                          onClick={() => {
                            if (isCandidateTarget) {
                              setRelationTarget(entity.name);
                              setIsRelationDialogOpen(true);
                            }
                          }}
                          style={{
                            position: 'absolute',
                            left: `${coord.x}px`,
                            top: `${coord.y}px`,
                            width: `${getEntityWidth(entity.name)}px`,
                            minWidth: '140px',
                            height: '50px',
                            background: 'var(--background-paper)',
                            border: isPendingSource ? '2px solid #00FFCC' : '2px solid var(--primary-main)',
                            borderRadius: '12px',
                            color: 'var(--text-primary)',
                            fontFamily: 'Outfit, sans-serif',
                            zIndex: draggingNode === entity.name ? 10 : 3,
                            cursor: isCandidateTarget ? 'pointer' : 'default',
                            transition: 'border 0.2s ease'
                          }}
                        >
                          <div
                            onMouseDown={(e) => {
                              if (e.target.closest('button') || e.target.closest('.relation-dot')) return;
                              setDraggingNode(entity.name);
                              dragStartOffset.current = {
                                x: e.clientX / zoomScale - coord.x,
                                y: e.clientY / zoomScale - coord.y
                              };
                            }}
                            style={{
                              background: 'var(--primary-main)',
                              padding: '12px 8px',
                              fontWeight: '800',
                              fontSize: '0.95rem',
                              letterSpacing: '0.5px',
                              color: '#fff',
                              cursor: draggingNode === entity.name ? 'grabbing' : 'grab',
                              borderRadius: '10px',
                              userSelect: 'none',
                              textAlign: 'center',
                              height: '100%',
                              boxSizing: 'border-box',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {entity.name}
                          </div>
                        </div>
                      );
                    })}

                    {activeTabKey === 'usecase' && parseUseCase(code).actors.map((actor, idx) => {
                      const coord = nodePositions[actor.id] || { x: 100, y: idx * 180 + 150 };
                      return (
                        <div
                          key={idx}
                          className="se-node-card usecase-actor-card"
                          onMouseDown={(e) => {
                            if (e.target.closest('button')) return;
                            setDraggingNode(actor.id);
                            dragStartOffset.current = {
                              x: e.clientX / zoomScale - coord.x,
                              y: e.clientY / zoomScale - coord.y
                            };
                          }}
                          style={{
                            position: 'absolute',
                            left: `${coord.x}px`,
                            top: `${coord.y}px`,
                            width: '76px',
                            height: '118px',
                            boxSizing: 'border-box',
                            padding: '2px',
                            border: '1px solid transparent',
                            borderRadius: '6px',
                            cursor: draggingNode === actor.id ? 'grabbing' : 'grab',
                            zIndex: draggingNode === actor.id ? 10 : 3,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            userSelect: 'none'
                          }}
                        >
                          <svg width="60" height="84" viewBox="-30 -44 60 88" style={{ overflow: 'visible', flexShrink: 0 }}>
                            <circle cx="0" cy="-30" r="12" fill="var(--background-paper)" stroke="var(--primary-main)" strokeWidth="3" />
                            <line x1="0" y1="-18" x2="0" y2="15" stroke="var(--primary-main)" strokeWidth="3" />
                            <line x1="-20" y1="-8" x2="20" y2="-8" stroke="var(--primary-main)" strokeWidth="3" />
                            <line x1="0" y1="15" x2="-15" y2="40" stroke="var(--primary-main)" strokeWidth="3" />
                            <line x1="0" y1="15" x2="15" y2="40" stroke="var(--primary-main)" strokeWidth="3" />
                          </svg>
                          <Typography
                            variant="caption"
                            style={{
                              fontWeight: 'bold',
                              color: 'var(--text-primary)',
                              marginTop: '4px',
                              textAlign: 'center',
                              wordBreak: 'break-word',
                              maxWidth: '74px',
                              fontSize: '0.74rem',
                              lineHeight: '1.2',
                              fontFamily: '"Outfit", sans-serif',
                              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                          >
                            {actor.label}
                          </Typography>
                        </div>
                      );
                    })}

                    {activeTabKey === 'usecase' && parseUseCase(code).usecases.map((uc, idx) => {
                      const coord = nodePositions[uc.id] || { x: 420, y: idx * 110 + 100 };
                      return (
                        <div
                          key={idx}
                          className="se-node-card usecase-bubble-card"
                          onMouseDown={(e) => {
                            if (e.target.closest('button')) return;
                            setDraggingNode(uc.id);
                            dragStartOffset.current = {
                              x: e.clientX / zoomScale - coord.x,
                              y: e.clientY / zoomScale - coord.y
                            };
                          }}
                          style={{
                            position: 'absolute',
                            left: `${coord.x}px`,
                            top: `${coord.y}px`,
                            width: '200px',
                            height: '50px',
                            borderRadius: '25px',
                            border: '2px solid var(--primary-main)',
                            background: 'var(--background-paper)',
                            color: 'var(--text-primary)',
                            zIndex: draggingNode === uc.id ? 10 : 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: draggingNode === uc.id ? 'grabbing' : 'grab',
                            padding: '0 10px',
                            textAlign: 'center',
                            userSelect: 'none'
                          }}
                        >
                          <span style={{ fontWeight: 'bold', fontSize: '0.85rem', margin: 0, padding: 0, lineHeight: 1.2, textAlign: 'center' }}>
                            {uc.label}
                          </span>
                        </div>
                      );
                    })}

                    {activeTabKey === 'activity' && parsedActivity.nodes.map((node, idx) => {
                      const coord = nodePositions[node.id] || activityAutoPositions[node.id] || { x: 400, y: idx * 110 + 80 };
                      const isActiveInSim = isSimulating && simActiveNodeIds.includes(node.id);

                      if (node.type === 'start') {
                        return (
                          <div
                            key={idx}
                            className="se-node-card activity-start-node"
                            onMouseDown={(e) => {
                              if (e.target.closest('button')) return;
                              setDraggingNode(node.id);
                              dragStartOffset.current = {
                                x: e.clientX / zoomScale - coord.x,
                                y: e.clientY / zoomScale - coord.y
                              };
                            }}
                            style={{
                              position: 'absolute',
                              left: `${coord.x}px`,
                              top: `${coord.y}px`,
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                              border: isActiveInSim ? '3px solid #00FFCC' : '2px solid #34D399',
                              boxShadow: isActiveInSim ? '0 0 20px #00FFCC, 0 0 10px #10B981' : '0 4px 12px rgba(16, 185, 129, 0.4)',
                              cursor: draggingNode === node.id ? 'grabbing' : 'grab',
                              zIndex: draggingNode === node.id ? 10 : 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              userSelect: 'none',
                              transition: 'box-shadow 0.3s ease, border 0.3s ease'
                            }}
                            title={`Start: ${node.label}`}
                          >
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fff' }} />
                          </div>
                        );
                      }

                      if (node.type === 'end') {
                        return (
                          <div
                            key={idx}
                            className="se-node-card activity-end-node"
                            onMouseDown={(e) => {
                              if (e.target.closest('button')) return;
                              setDraggingNode(node.id);
                              dragStartOffset.current = {
                                x: e.clientX / zoomScale - coord.x,
                                y: e.clientY / zoomScale - coord.y
                              };
                            }}
                            style={{
                              position: 'absolute',
                              left: `${coord.x}px`,
                              top: `${coord.y}px`,
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: 'var(--background-paper)',
                              border: isActiveInSim ? '3px solid #00FFCC' : '2px solid #EF4444',
                              boxShadow: isActiveInSim ? '0 0 20px #00FFCC' : '0 4px 12px rgba(239, 68, 68, 0.3)',
                              cursor: draggingNode === node.id ? 'grabbing' : 'grab',
                              zIndex: draggingNode === node.id ? 10 : 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              userSelect: 'none',
                              transition: 'box-shadow 0.3s ease, border 0.3s ease'
                            }}
                            title={`End / Final: ${node.label}`}
                          >
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#EF4444' }} />
                          </div>
                        );
                      }

                      if (node.type === 'fork' || node.type === 'join') {
                        const isFork = node.type === 'fork';
                        return (
                          <div
                            key={idx}
                            className="se-node-card activity-bar-node"
                            onMouseDown={(e) => {
                              if (e.target.closest('button')) return;
                              setDraggingNode(node.id);
                              dragStartOffset.current = {
                                x: e.clientX / zoomScale - coord.x,
                                y: e.clientY / zoomScale - coord.y
                              };
                            }}
                            style={{
                              position: 'absolute',
                              left: `${coord.x}px`,
                              top: `${coord.y}px`,
                              width: '160px',
                              height: '12px',
                              borderRadius: '6px',
                              background: isActiveInSim ? '#00FFCC' : 'var(--primary-main)',
                              boxShadow: isActiveInSim ? '0 0 20px #00FFCC' : '0 2px 8px rgba(0,0,0,0.3)',
                              cursor: draggingNode === node.id ? 'grabbing' : 'grab',
                              zIndex: draggingNode === node.id ? 10 : 4,
                              userSelect: 'none',
                              transition: 'background 0.3s ease, box-shadow 0.3s ease'
                            }}
                            title={`${isFork ? 'Fork (Split)' : 'Join (Merge)'}: ${node.label || node.id}`}
                          />
                        );
                      }

                      if (node.type === 'decision') {
                        return (
                          <div
                            key={idx}
                            className="se-node-card activity-decision-node"
                            onMouseDown={(e) => {
                              if (e.target.closest('button')) return;
                              setDraggingNode(node.id);
                              dragStartOffset.current = {
                                x: e.clientX / zoomScale - coord.x,
                                y: e.clientY / zoomScale - coord.y
                              };
                            }}
                            style={{
                              position: 'absolute',
                              left: `${coord.x}px`,
                              top: `${coord.y}px`,
                              width: '140px',
                              height: '70px',
                              cursor: draggingNode === node.id ? 'grabbing' : 'grab',
                              zIndex: draggingNode === node.id ? 10 : 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textAlign: 'center',
                              userSelect: 'none',
                              boxSizing: 'border-box'
                            }}
                          >
                            <svg width="140" height="70" style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}>
                              <polygon
                                points="70,2 138,35 70,68 2,35"
                                fill="var(--background-paper)"
                                stroke={isActiveInSim ? '#00FFCC' : 'var(--primary-main)'}
                                strokeWidth={isActiveInSim ? 3 : 2}
                                style={{ filter: isActiveInSim ? 'drop-shadow(0 0 10px #00FFCC)' : 'none', transition: 'stroke 0.3s ease' }}
                              />
                            </svg>
                            <span style={{ position: 'relative', zIndex: 2, fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center', width: '100%', padding: '0 14px', lineHeight: 1.15, display: 'block', wordBreak: 'break-word', boxSizing: 'border-box' }}>
                              {node.label}
                            </span>
                          </div>
                        );
                      }

                      // Default: Action node
                      return (
                        <div
                          key={idx}
                          className="se-node-card activity-action-card"
                          onMouseDown={(e) => {
                            if (e.target.closest('button')) return;
                            setDraggingNode(node.id);
                            dragStartOffset.current = {
                              x: e.clientX / zoomScale - coord.x,
                              y: e.clientY / zoomScale - coord.y
                            };
                          }}
                          style={{
                            position: 'absolute',
                            left: `${coord.x}px`,
                            top: `${coord.y}px`,
                            width: '196px',
                            minHeight: '54px',
                            borderRadius: '16px',
                            background: 'var(--background-paper)',
                            border: isActiveInSim ? '2px solid #00FFCC' : '1.5px solid var(--primary-main)',
                            boxShadow: isActiveInSim ? '0 0 20px rgba(0, 255, 204, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
                            color: 'var(--text-primary)',
                            zIndex: draggingNode === node.id ? 10 : 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '10px 18px',
                            cursor: draggingNode === node.id ? 'grabbing' : 'grab',
                            boxSizing: 'border-box',
                            userSelect: 'none',
                            textAlign: 'center',
                            transition: 'border 0.3s ease, box-shadow 0.3s ease'
                          }}
                        >
                          <span style={{ fontWeight: 700, fontSize: '0.84rem', lineHeight: 1.25, color: 'var(--text-primary)', width: '100%', textAlign: 'center', margin: 0, padding: 0, display: 'block', wordBreak: 'break-word' }}>
                            {node.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Box>
              </Box>

              {/* Activity Diagram Flow Simulation Status Floating Banner */}
              {activeTabKey === 'activity' && isSimulating && (
                <Box
                  style={{
                    position: 'fixed',
                    bottom: '24px',
                    left: isFullscreen ? '50%' : `${splitPercent + (100 - splitPercent) / 2}%`,
                    transform: 'translateX(-50%)',
                    backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)',
                    border: '1.5px solid var(--primary-main)',
                    boxShadow: isDarkMode ? '0 12px 40px -10px rgba(0, 255, 204, 0.35), 0 0 25px rgba(0, 0, 0, 0.6)' : '0 12px 40px -10px rgba(0, 0, 0, 0.22), 0 0 15px rgba(0, 0, 0, 0.08)',
                    borderRadius: '20px',
                    padding: '10px 22px',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    zIndex: 9999,
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    maxWidth: isFullscreen ? '90vw' : `calc(${100 - splitPercent}vw - 60px)`,
                    pointerEvents: 'auto',
                    transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1), maxWidth 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Box style={{ width: '10px', height: '10px', borderRadius: '50%', background: simCompleted ? '#10B981' : 'var(--primary-main)' }} />
                    <Typography variant="caption" style={{ fontWeight: 800, color: 'var(--primary-main)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {simCompleted ? 'SIMULATION FINISHED' : 'SIMULATING FLOW'}
                    </Typography>
                  </Box>

                  <Typography variant="body2" style={{ color: 'var(--text-primary)', fontSize: '0.8rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {simLog[simLog.length - 1] || 'Flow started'}
                  </Typography>

                  {simBranchChoices && simBranchChoices.length > 0 ? (
                    <Box style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <Typography variant="caption" style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.72rem' }}>
                        Branch:
                      </Typography>
                      {simBranchChoices.map((choice, cIdx) => (
                        <Button
                          key={cIdx}
                          variant="contained"
                          size="small"
                          onClick={() => handleStepSimulation(choice.targetId)}
                          style={{
                            background: 'var(--primary-main)',
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            height: '28px',
                            padding: '0 10px',
                            textTransform: 'none',
                            borderRadius: '8px'
                          }}
                        >
                          {choice.guard ? `[${choice.guard}]` : choice.targetLabel}
                        </Button>
                      ))}
                    </Box>
                  ) : (
                    !simCompleted && (
                      <Tooltip title="Next Step">
                        <IconButton
                          size="small"
                          onClick={() => handleStepSimulation()}
                          style={{
                            background: 'var(--primary-main)',
                            color: '#fff',
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px'
                          }}
                        >
                          <NextIcon style={{ fontSize: '1rem' }} />
                        </IconButton>
                      </Tooltip>
                    )
                  )}

                  <Tooltip title="Restart Simulation">
                    <IconButton
                      size="small"
                      onClick={handleStartSimulation}
                      style={{
                        color: 'var(--text-primary)',
                        background: 'var(--background-default)',
                        border: '1px solid var(--divider)',
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px'
                      }}
                    >
                      <ResetIcon style={{ fontSize: '0.95rem' }} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Exit Simulation">
                    <IconButton
                      size="small"
                      onClick={handleStopSimulation}
                      style={{
                        color: '#ff647c',
                        background: 'rgba(255, 100, 124, 0.12)',
                        border: '1px solid rgba(255, 100, 124, 0.35)',
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px'
                      }}
                    >
                      <StopIcon style={{ fontSize: '0.95rem' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              {error && (
                <Alert
                  severity="error"
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    right: '16px',
                    borderRadius: '12px',
                    background: 'rgba(211, 47, 47, 0.9)',
                    color: '#fff',
                    backdropFilter: 'blur(5px)',
                    zIndex: 20
                  }}
                >
                  {error}
                </Alert>
              )}
            </Box>

            {pendingRelationSource && (
              <Box
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(30, 30, 56, 0.95)',
                  border: '1.5px solid var(--primary-main)',
                  borderRadius: '12px',
                  padding: '8px 16px',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  zIndex: 100,
                  
                  backdropFilter: 'blur(5px)'}}
              >
                <Typography variant="body2" style={{ fontWeight: 600 }}>
                  Connecting <strong>{pendingRelationSource}</strong>: click a target entity to establish relationship...
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setPendingRelationSource(null);
                    setRelationTarget(null);
                  }}
                  style={{
                    color: '#ff647c',
                    borderColor: '#ff647c',
                    textTransform: 'none',
                    borderRadius: '6px',
                    padding: '2px 8px'}}
                >
                  Cancel
                </Button>
              </Box>
            )}

            <AddEntityDialog
              open={isAddEntityOpen}
              onClose={() => setIsAddEntityOpen(false)}
              onSubmit={handleCreateEntity}
              existingEntityNames={parseER(code).entities.map(e => e.name)}
            />

            <AddActorDialog
              open={isAddActorOpen}
              onClose={() => setIsAddActorOpen(false)}
              onSubmit={handleCreateActor}
              existingNames={parseUseCase(code).actors.map(a => a.id)}
            />

            <AddUseCaseDialog
              open={isAddUseCaseOpen}
              onClose={() => setIsAddUseCaseOpen(false)}
              onSubmit={handleCreateUseCase}
              existingNames={parseUseCase(code).usecases.map(u => u.id)}
            />

            <AddParticipantDialog
              open={isAddParticipantOpen}
              onClose={() => setIsAddParticipantOpen(false)}
              onSubmit={handleCreateParticipant}
              existingNames={parseSequence(code).participants.map(p => p.id)}
            />

            <AddSequenceMessageDialog
              open={isAddSequenceMessageOpen}
              onClose={() => setIsAddSequenceMessageOpen(false)}
              onSubmit={handleCreateSequenceMessage}
              participants={parseSequence(code).participants.map(p => p.id)}
            />

            <AddTaskDialog
              open={isAddTaskOpen}
              onClose={() => setIsAddTaskOpen(false)}
              onSubmit={handleCreateGanttTask}
              existingTasks={parseGantt(code).tasks.map(t => t.id)}
            />

            <AddActivityNodeDialog
              open={isAddActivityNodeOpen}
              onClose={() => setIsAddActivityNodeOpen(false)}
              onSubmit={handleCreateActivityNode}
              existingNodeIds={parsedActivity.nodes.map(n => n.id)}
            />

            <AddActivityTransitionDialog
              open={isAddActivityTransitionOpen}
              onClose={() => setIsAddActivityTransitionOpen(false)}
              onSubmit={handleCreateActivityTransition}
              nodes={parsedActivity.nodes}
            />

            <CreateRelationDialog
              open={isRelationDialogOpen}
              onClose={() => {
                setIsRelationDialogOpen(false);
                setPendingRelationSource(null);
                setRelationTarget(null);
              }}
              source={pendingRelationSource}
              target={relationTarget}
              onSubmit={handleCreateRelationship}
            />
          </Paper>
        </Box>
      </Box>
    );
  };

  if (onClose) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        fullScreen={isMobile}
        disableEnforceFocus
        disableRestoreFocus
        PaperProps={{
          elevation: 0,
          style: {
            borderRadius: isMobile ? 0 : '24px',
            background: 'var(--background-paper)',
            backdropFilter: 'blur(20px)',
            border: isMobile ? 'none' : '1px solid var(--divider)',
            
            height: isMobile ? '100dvh' : '92vh',
            maxHeight: isMobile ? '100dvh' : '92vh',
            width: isMobile ? '100vw' : '95vw',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        {isMobile ? (
          <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 24, padding: '32px 24px', textAlign: 'center', background: 'var(--background-default)' }}>
            <Box style={{ fontSize: 64 }}>⚙️</Box>
            <Typography variant="h6" style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: '"Outfit", sans-serif' }}>Bigger Screen Required</Typography>
            <Typography variant="body2" style={{ color: 'var(--text-secondary)', maxWidth: 280, lineHeight: 1.7 }}>The Software Engineering Lab is designed for desktop use. Please open it on a larger screen for the full experience.</Typography>
            <Button onClick={onClose} variant="outlined" style={{ borderRadius: 14, borderColor: 'var(--divider)', color: 'var(--text-primary)', textTransform: 'none', fontWeight: 700, marginTop: 8 }}>Close</Button>
          </Box>
        ) : (
          <>
            <DialogTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', gap: '12px' }}>
          <Box>
            <Typography variant="h6" style={{ fontWeight: 900, fontFamily: '"Outfit", sans-serif', color: 'var(--primary-main)' }}>
              {hideDiagramSelector ? activeTabTitle : 'Software Engineering Lab'}
            </Typography>
            <Typography variant="caption" style={{ color: 'var(--text-secondary)' }}>
            </Typography>
          </Box>

          {!hideDiagramSelector && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Typography variant="subtitle2" style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Diagram Type:
              </Typography>
              <FormControl size="small" style={{ minWidth: '200px' }}>
                <Select
                  value={activeTab}
                  onChange={handleTabChange}
                  sx={{
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--background-paper)',
                    borderRadius: '10px',
                    height: '34px',
                    fontSize: '0.85rem',
                    fieldset: { borderColor: 'var(--divider)' },
                    '&:hover fieldset': { borderColor: 'var(--primary-main) !important' },
                    '&.Mui-focused fieldset': { borderColor: 'var(--primary-main) !important' },
                    '& .MuiSelect-select': { padding: '6px 12px' }
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        background: 'var(--background-paper)',
                        border: '1px solid var(--divider)',
                        color: 'var(--text-primary)'
                      }
                    }
                  }}
                >
                  {tabsMeta.map((tab, idx) => (
                    <MenuItem key={tab.key} value={idx} style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      {tab.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          <Box style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AutoAwesomeIcon style={{ color: '#10a37f' }} />}
              onClick={() => setIsAiModalOpen(true)}
              style={{
                borderColor: 'rgba(16, 163, 127, 0.4)',
                color: '#10a37f',
                background: 'rgba(16, 163, 127, 0.08)',
                borderRadius: '8px',
                textTransform: 'none',
                height: '34px',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              Prompt ChatGPT
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<CopyIcon />}
              onClick={handleCopyCode}
              style={{
                borderColor: 'var(--divider)',
                color: 'var(--text-primary)',
                borderRadius: '8px',
                textTransform: 'none',
                height: '34px',
                fontSize: '0.8rem'
              }}
            >
              {isCopied ? 'Copied!' : 'Copy Code'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadSvg}
              disabled={!!error}
              style={{
                borderColor: 'var(--divider)',
                color: 'var(--text-primary)',
                borderRadius: '8px',
                textTransform: 'none',
                height: '34px',
                fontSize: '0.8rem',
                marginRight: '6px'
              }}
            >
              Download SVG
            </Button>
            <Button
              variant="contained"
              size="small"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadPng}
              disabled={!!error}
              style={{
                borderRadius: '8px',
                textTransform: 'none',
                height: '34px',
                fontSize: '0.8rem'
              }}
            >
              Download PNG
            </Button>
            <IconButton onClick={onClose} style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent style={{ padding: '0px', overflow: 'hidden', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          {renderContent()}
        </DialogContent>

        {/* Fullscreen Visual Preview Dialog matching UML playground */}
        <Dialog
          open={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          fullScreen
          PaperProps={{
            elevation: 0,
            'data-theme': activeTheme,
            style: {
              background: 'var(--background-default)',
              display: 'flex',
              flexDirection: 'column'
            }
          }}
        >
          <DialogTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--divider)', flexWrap: 'wrap', gap: '12px' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PreviewIcon style={{ color: 'var(--primary-main)' }} />
              <Typography variant="h6" style={{ fontWeight: 900, fontFamily: '"Outfit", sans-serif', color: 'var(--text-primary)' }}>
                Visual Diagram Preview
              </Typography>
            </Box>
            <Box style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>
                Choose Theme:
              </Typography>
              <Select
                value={activeTheme}
                onChange={(e) => setActiveTheme(e.target.value)}
                variant="outlined"
                size="small"
                style={{
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)',
                  background: 'var(--background-paper)',
                  minWidth: '160px',
                  height: '40px',
                  border: '1px solid var(--divider)'
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      background: 'var(--background-paper)',
                      border: '1px solid var(--divider)',
                      color: 'var(--text-primary)'
                    }
                  }
                }}
              >
                <MenuItem value="light">Default Light</MenuItem>
                <MenuItem value="dark">Default Dark</MenuItem>
                <MenuItem value="sepia">Warm Sepia</MenuItem>
                <MenuItem value="lava">Volcanic Lava</MenuItem>
                <MenuItem value="ocean">Deep Ocean</MenuItem>
                <MenuItem value="forest">Emerald Forest</MenuItem>
                <MenuItem value="amber">Solarized Amber</MenuItem>
                <MenuItem value="dracula">Dracula Vampire</MenuItem>
                <MenuItem value="amethyst">Royal Amethyst</MenuItem>
                <MenuItem value="nordic">Nordic Ice</MenuItem>
                <MenuItem value="mint">Frosted Mint</MenuItem>
                <MenuItem value="lavender">Soft Lavender</MenuItem>
                <MenuItem value="peach">Peach Cream</MenuItem>
                <MenuItem value="rose">Rose Gold</MenuItem>
                <MenuItem value="clay">Clay Slate</MenuItem>
                <MenuItem value="kitty">Hello Kitty</MenuItem>
                <MenuItem value="midnight">Midnight Shimmer</MenuItem>
              </Select>

              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadPreviewSvg} style={{ borderRadius: '12px', fontWeight: 800, height: '40px', textTransform: 'none' }}>
                Download SVG
              </Button>
              <Button variant="contained" color="primary" startIcon={<DownloadIcon />} onClick={handleDownloadPreviewPng} style={{ borderRadius: '12px', fontWeight: 800, height: '40px', textTransform: 'none' }}>
                Download PNG
              </Button>
              <Button variant="outlined" onClick={() => setIsPreviewOpen(false)} style={{ borderRadius: '12px', fontWeight: 800, height: '40px', textTransform: 'none', borderColor: 'var(--divider)', color: 'var(--text-secondary)' }}>
                Close Preview
              </Button>
            </Box>
          </DialogTitle>

          <DialogContent style={{ padding: 0, overflow: 'hidden', position: 'relative', height: '100%', width: '100%' }}>
            {/* Scrollable Preview Canvas Container */}
            <Box
              ref={setPreviewCanvasContainer}
              id="uml-preview-canvas-container"
              onMouseDown={handlePreviewCanvasMouseDown}
              style={{
                background: 'var(--background-default)',
                height: '100%',
                width: '100%',
                position: 'relative',
                overflow: 'auto',
                cursor: isPanningPreviewRef.current ? 'grabbing' : 'grab'
              }}
            >
              {/* Virtual Scroll Boundaries Wrapper for capturing PNG */}
              <Box
                id="se-preview-capture-content"
                style={{
                  width: `${(canvasDim.width + 200) * previewZoomScale}px`,
                  height: `${(canvasDim.height + 300) * previewZoomScale}px`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Virtual Canvas scaled as a single unit */}
                <Box
                  id="se-preview-canvas-inner"
                  style={{
                    width: `${canvasDim.width}px`,
                    height: `${canvasDim.height}px`,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transform: `scale(${previewZoomScale})`,
                    transformOrigin: 'top left',
                    backgroundImage: 'none',
                    backgroundColor: 'var(--background-default)'
                  }}
                >
                  <div
                    id="mermaid-preview-target"
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'relative'
                    }}
                  >
                    {/* SVG Connector Lines Overlay */}
                    <svg width="4000" height="4000" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 2, overflow: 'visible' }}>
                      <defs>
                        {/* ER Crow-foot connection marker ends */}
                        <marker id="crow-foot-many" viewBox="0 0 20 20" refX="20" refY="10" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
                          <path d="M 0 4 L 20 10 L 0 16 M 10 0 L 10 20" fill="none" stroke="var(--primary-main)" strokeWidth="2" />
                        </marker>
                        <marker id="crow-foot-one" viewBox="0 0 20 20" refX="20" refY="10" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
                          <line x1="8" y1="2" x2="8" y2="18" stroke="var(--primary-main)" strokeWidth="2" />
                          <line x1="14" y1="2" x2="14" y2="18" stroke="var(--primary-main)" strokeWidth="2" />
                        </marker>
                        <marker id="usecase-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1 L 10 5 L 0 9" fill="none" stroke="var(--primary-main)" strokeWidth="1.5" />
                        </marker>
                        <marker id="usecase-generalization-arrow" viewBox="0 0 12 12" refX="12" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                          <path d="M 0 2 L 12 6 L 0 10 Z" fill="var(--background-default)" stroke="var(--primary-main)" strokeWidth="1.5" />
                        </marker>
                        <marker id="activity-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                          <path d="M 0 1.5 L 9 5 L 0 8.5 Z" fill="var(--primary-main)" stroke="var(--primary-main)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </marker>
                      </defs>

                      {activeTabKey === 'er' && renderERDiagram()}
                      {activeTabKey === 'usecase' && renderUseCaseDiagram()}
                      {activeTabKey === 'activity' && renderActivityDiagram()}
                    </svg>

                    {/* Sequence and Gantt have internal SVG wrapper structures */}
                    {activeTabKey === 'sequence' && renderSequenceDiagram()}
                    {activeTabKey === 'gantt' && renderGanttChart()}

                    {/* DRAGGABLE NODE CARDS OVERLAY (HTML siblings for ER, Use Case, and Activity) */}
                    {activeTabKey === 'er' && parseER(code).entities.map((entity, idx) => {
                      const coord = nodePositions[entity.name] || { x: (idx % 3) * 320 + 120, y: Math.floor(idx / 3) * 220 + 100 };
                      return (
                        <div
                          key={idx}
                          className="se-node-card er-entity-card"
                          style={{
                            position: 'absolute',
                            left: `${coord.x}px`,
                            top: `${coord.y}px`,
                            width: `${getEntityWidth(entity.name)}px`,
                            minWidth: '140px',
                            height: '50px',
                            background: 'var(--background-paper)',
                            border: '2px solid var(--primary-main)',
                            borderRadius: '12px',
                            color: 'var(--text-primary)',
                            fontFamily: 'Outfit, sans-serif',
                            zIndex: 3}}
                        >
                          <div
                            style={{
                              background: 'var(--primary-main)',
                              padding: '12px 8px',
                              fontWeight: '800',
                              fontSize: '0.95rem',
                              letterSpacing: '0.5px',
                              color: '#fff',
                              borderRadius: '10px',
                              userSelect: 'none',
                              textAlign: 'center',
                              height: '100%',
                              boxSizing: 'border-box',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {entity.name}
                          </div>
                        </div>
                      );
                    })}

                    {activeTabKey === 'usecase' && parseUseCase(code).actors.map((actor, idx) => {
                      const coord = nodePositions[actor.id] || { x: 100, y: idx * 180 + 150 };
                      return (
                        <div
                          key={idx}
                          className="se-node-card usecase-actor-card"
                          style={{
                            position: 'absolute',
                            left: `${coord.x}px`,
                            top: `${coord.y}px`,
                            width: '76px',
                            height: '118px',
                            boxSizing: 'border-box',
                            padding: '2px',
                            border: '1px solid transparent',
                            borderRadius: '6px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            userSelect: 'none',
                            zIndex: 3
                          }}
                        >
                          <svg width="60" height="84" viewBox="-30 -44 60 88" style={{ overflow: 'visible', flexShrink: 0 }}>
                            <circle cx="0" cy="-30" r="12" fill="var(--background-paper)" stroke="var(--primary-main)" strokeWidth="3" />
                            <line x1="0" y1="-18" x2="0" y2="15" stroke="var(--primary-main)" strokeWidth="3" />
                            <line x1="-20" y1="-8" x2="20" y2="-8" stroke="var(--primary-main)" strokeWidth="3" />
                            <line x1="0" y1="15" x2="-15" y2="40" stroke="var(--primary-main)" strokeWidth="3" />
                            <line x1="0" y1="15" x2="15" y2="40" stroke="var(--primary-main)" strokeWidth="3" />
                          </svg>
                          <Typography
                            variant="caption"
                            style={{
                              fontWeight: 'bold',
                              color: 'var(--text-primary)',
                              marginTop: '4px',
                              textAlign: 'center',
                              wordBreak: 'break-word',
                              maxWidth: '74px',
                              fontSize: '0.74rem',
                              lineHeight: '1.2',
                              fontFamily: '"Outfit", sans-serif',
                              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                          >
                            {actor.label}
                          </Typography>
                        </div>
                      );
                    })}

                    {activeTabKey === 'usecase' && parseUseCase(code).usecases.map((uc, idx) => {
                      const coord = nodePositions[uc.id] || { x: 420, y: idx * 110 + 100 };
                      return (
                        <div
                          key={idx}
                          className="se-node-card usecase-bubble-card"
                          style={{
                            position: 'absolute',
                            left: `${coord.x}px`,
                            top: `${coord.y}px`,
                            width: '200px',
                            height: '50px',
                            borderRadius: '25px',
                            border: '2px solid var(--primary-main)',
                            background: 'var(--background-paper)',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 10px',
                            textAlign: 'center',
                            userSelect: 'none',
                            zIndex: 3
                          }}
                        >
                          <span style={{ fontWeight: 'bold', fontSize: '0.85rem', margin: 0, padding: 0, lineHeight: 1.2, textAlign: 'center' }}>
                            {uc.label}
                          </span>
                        </div>
                      );
                    })}

                    {activeTabKey === 'activity' && parsedActivity.nodes.map((node, idx) => {
                      const coord = nodePositions[node.id] || activityAutoPositions[node.id] || { x: 400, y: idx * 110 + 80 };

                      if (node.type === 'start') {
                        return (
                          <div
                            key={idx}
                            className="se-node-card activity-start-node"
                            style={{
                              position: 'absolute',
                              left: `${coord.x}px`,
                              top: `${coord.y}px`,
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                              border: '2px solid #34D399',
                              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                              zIndex: 3,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              userSelect: 'none'
                            }}
                          >
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fff' }} />
                          </div>
                        );
                      }

                      if (node.type === 'end') {
                        return (
                          <div
                            key={idx}
                            className="se-node-card activity-end-node"
                            style={{
                              position: 'absolute',
                              left: `${coord.x}px`,
                              top: `${coord.y}px`,
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: 'var(--background-paper)',
                              border: '2px solid #EF4444',
                              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                              zIndex: 3,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              userSelect: 'none'
                            }}
                          >
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#EF4444' }} />
                          </div>
                        );
                      }

                      if (node.type === 'fork' || node.type === 'join') {
                        const isFork = node.type === 'fork';
                        return (
                          <div
                            key={idx}
                            className="se-node-card activity-bar-node"
                            style={{
                              position: 'absolute',
                              left: `${coord.x}px`,
                              top: `${coord.y}px`,
                              width: '160px',
                              height: '12px',
                              borderRadius: '6px',
                              background: 'var(--primary-main)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                              zIndex: 3,
                              userSelect: 'none'
                            }}
                            title={`${isFork ? 'Fork (Split)' : 'Join (Merge)'}: ${node.label || node.id}`}
                          />
                        );
                      }

                      if (node.type === 'decision') {
                        return (
                          <div
                            key={idx}
                            className="se-node-card activity-decision-node"
                            style={{
                              position: 'absolute',
                              left: `${coord.x}px`,
                              top: `${coord.y}px`,
                              width: '140px',
                              height: '70px',
                              zIndex: 3,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textAlign: 'center',
                              userSelect: 'none',
                              boxSizing: 'border-box'
                            }}
                          >
                            <svg width="140" height="70" style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}>
                              <polygon
                                points="70,2 138,35 70,68 2,35"
                                fill="var(--background-paper)"
                                stroke="var(--primary-main)"
                                strokeWidth={2}
                              />
                            </svg>
                            <span style={{ position: 'relative', zIndex: 2, fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center', width: '100%', padding: '0 14px', lineHeight: 1.15, display: 'block', wordBreak: 'break-word', boxSizing: 'border-box' }}>
                              {node.label}
                            </span>
                          </div>
                        );
                      }

                      // Default: Action node
                      return (
                        <div
                          key={idx}
                          className="se-node-card activity-action-card"
                          style={{
                            position: 'absolute',
                            left: `${coord.x}px`,
                            top: `${coord.y}px`,
                            width: '196px',
                            minHeight: '54px',
                            borderRadius: '16px',
                            background: 'var(--background-paper)',
                            border: '1.5px solid var(--primary-main)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            color: 'var(--text-primary)',
                            zIndex: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '10px 18px',
                            boxSizing: 'border-box',
                            userSelect: 'none',
                            textAlign: 'center'
                          }}
                        >
                          <span style={{ fontWeight: 700, fontSize: '0.84rem', lineHeight: 1.25, color: 'var(--text-primary)', width: '100%', textAlign: 'center', margin: 0, padding: 0, display: 'block', wordBreak: 'break-word' }}>
                            {node.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Box>
              </Box>
            </Box>
            {/* Viewport Watermark (Always visible on the screen preview dialog) */}
            <Box
              style={{
                position: 'absolute',
                bottom: '24px',
                right: '24px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '0.75rem',
                opacity: 0.5,
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 10
              }}
            >
              <div
                className="nav-brand-logo-container"
                style={{
                  width: '2rem',
                  height: '2rem',
                  WebkitMaskImage: `url(${logoImg})`,
                  maskImage: `url(${logoImg})`,
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain'
                }}
              >
                <div className="nav-logo-left-half" />
                <div className="nav-logo-right-half" />
              </div>
              <Typography
                className="nav-brand-title"
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 900,
                  fontFamily: '"Outfit", sans-serif',
                  letterSpacing: '0.05em'
                }}
              >
                <span style={{ color: 'var(--primary-main)' }}>Sophia</span>
                <span style={{ color: 'var(--primary-dark)' }}>Path</span>
              </Typography>
            </Box>
          </DialogContent>
        </Dialog>

        {isAiModalOpen && (
          <AiPromptModal
            open={isAiModalOpen}
            onClose={() => setIsAiModalOpen(false)}
            diagramKey={activeTabKey}
            diagramTitle={activeTabTitle}
            templateCode={TEMPLATES[activeTabKey]}
          />
        )}
        </>
      )}
      </Dialog>
    );
  }

  return (
    <Box style={{ width: '100%', height: '100vh', background: 'var(--background-default)', boxSizing: 'border-box' }}>
      <Box style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', alignItems: 'stretch' }}>
        <Paper square elevation={0} style={{ padding: '16px 24px', background: 'var(--background-paper)', borderBottom: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" style={{ fontWeight: 900, color: 'var(--primary-main)' }}>
            Software Engineering Lab (Standalone View)
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AutoAwesomeIcon style={{ color: '#10a37f' }} />}
            onClick={() => setIsAiModalOpen(true)}
            style={{
              borderColor: 'rgba(16, 163, 127, 0.4)',
              color: '#10a37f',
              background: 'rgba(16, 163, 127, 0.08)',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700
            }}
          >
            Prompt ChatGPT
          </Button>
        </Paper>
        <Box style={{ flexGrow: 1, position: 'relative' }}>
          {renderContent()}
        </Box>
      </Box>

      {isAiModalOpen && (
        <AiPromptModal
          open={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          diagramKey={activeTabKey}
          diagramTitle={activeTabTitle}
          templateCode={TEMPLATES[activeTabKey]}
        />
      )}
    </Box>
  );
};

export default SoftwareEngineeringLab;
