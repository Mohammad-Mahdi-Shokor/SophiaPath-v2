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

  usecase: `// ========================================================
// SOPHIAPATH USE CASE DIAGRAM SPECIFICATION (DSL)
// ========================================================
// Keywords:
// - SYSTEM <title> : Declares the system boundary title
// - ACTOR <name> : Declares an actor (👤)
// - USE CASE <name> : Declares a use case (⭕)
// - <Actor> INHERITS <ParentActor> : Actor generalization / inheritance
// - <Actor> -> <UseCase> : Direct association link
// - <UseCase1> INCLUDES <UseCase2> : Mandatory sub-flow (<<include>>)
// - <UseCase1> EXTENDS <UseCase2> : Optional extension (<<extend>>)
// - <UseCase1> INHERITS <UseCase2> : Use case generalization

SYSTEM University Application System

ACTOR Guest
ACTOR Student
ACTOR Instructor
ACTOR Admin

// ── Actor Inheritance ──
Student INHERITS Guest
Instructor INHERITS Guest
Admin INHERITS Guest

// ── Use Cases ──
USE CASE Sign Up
USE CASE Login
USE CASE Edit Profile
USE CASE Register Courses
USE CASE View Grades
USE CASE Apply for Certificate
USE CASE Verify Prerequisites
USE CASE Pay Tuition Fees
USE CASE Set Student Grades
USE CASE Review Certificate Applications
USE CASE Monitor System

// ── Actor to Use Case Associations ──
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

// ── Use Case to Use Case Relationships ──
Register Courses INCLUDES Verify Prerequisites
Register Courses EXTENDS Pay Tuition Fees
Apply for Certificate INCLUDES Verify Prerequisites`,

  sequence: `// ========================================================
// SOPHIAPATH SEQUENCE DIAGRAM SPECIFICATION (DSL)
// ========================================================
// Keywords:
// - SEQUENCE <title> : Declares diagram title
// - PARTICIPANT <name> : Declares participant lifeline
// - <Src> sends "<msg>" to <Dest>. : Synchronous message call
// - <Src> requests "<msg>" from <Dest>. : Request message call
// - <Src> returns "<msg>" to <Dest>. : Return/reply message
// - <Src> displays "<msg>" to <Dest>. : UI render/display message
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
// SOPHIAPATH GANTT ROADMAP SPECIFICATION (DSL)
// ========================================================
// Keywords:
// - GANTT <title> : Declares diagram title
// - PROJECT <phase_name> : Defines a project phase / section group
// - TASK <task_name> : Declares a project task
// - START <YYYY-MM-DD> : Task start date
// - END <YYYY-MM-DD> : Task completion date
// - DEPENDS ON <PredecessorTaskName> : Task dependency constraint
// - MILESTONE <name> : Declares a key milestone date
// - DATE <YYYY-MM-DD> : Milestone target date

GANTT Software Development Project

PROJECT Requirements & Design
TASK Requirements Analysis
START 2026-09-01
END 2026-09-28

TASK System Architecture Design
START 2026-09-29
END 2026-10-26
DEPENDS ON Requirements Analysis

MILESTONE Design Signoff
DATE 2026-10-26

PROJECT Core Development
TASK Database Modeling & Setup
START 2026-10-27
END 2026-11-23
DEPENDS ON System Architecture Design

TASK Backend API Development
START 2026-11-24
END 2026-12-21
DEPENDS ON Database Modeling & Setup

TASK Frontend UI Implementation
START 2026-12-22
END 2027-01-25
DEPENDS ON Backend API Development

PROJECT QA & Launch
TASK Integration & Security Testing
START 2027-01-26
END 2027-02-15
DEPENDS ON Frontend UI Implementation

TASK Production Deployment
START 2027-02-16
END 2027-02-22
DEPENDS ON Integration & Security Testing

MILESTONE System Go-Live
DATE 2027-02-22`
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
          padding: '16px',
          maxWidth: '500px',
          width: '100%'}
      }}
    >
      <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--divider)', paddingBottom: '14px', color: 'var(--text-primary)' }}>
        🔗 Create Relationship
      </DialogTitle>
      <DialogContent style={{ marginTop: '8px', paddingTop: '16px', paddingBottom: '16px', overflow: 'visible' }}>
        <Typography variant="body2" style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Define the cardinality constraint and the relationship label name:
        </Typography>

        <Box style={{ marginBottom: '20px' }}>
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

        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '8px' }}>
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
      <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
        <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none', whiteSpace: 'nowrap', fontWeight: 600 }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" style={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', padding: '6px 18px' }}>
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
    <Dialog open={open} onClose={onClose} PaperProps={{ style: { background: 'var(--background-paper)', border: '1px solid var(--divider)', color: 'var(--text-primary)', borderRadius: '16px', padding: '16px', maxWidth: '440px', width: '100%' } }}>
      <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--divider)', paddingBottom: '14px', color: 'var(--text-primary)' }}>
        👤 Add Actor
      </DialogTitle>
      <DialogContent style={{ marginTop: '8px', paddingTop: '16px', paddingBottom: '16px', overflow: 'visible' }}>
        {error && <Alert severity="error" style={{ marginBottom: '16px', borderRadius: '8px' }}>{error}</Alert>}
        <TextField fullWidth label="Actor Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. User" variant="outlined" size="small" InputLabelProps={{ style: { color: 'var(--text-secondary)' } }} inputProps={{ style: { color: 'var(--text-primary)' } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'var(--divider)' }, '&:hover fieldset': { borderColor: 'var(--primary-main)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' } } }} />
      </DialogContent>
      <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
        <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none', whiteSpace: 'nowrap', fontWeight: 600 }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" style={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', padding: '6px 18px' }}>Create Actor</Button>
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
    <Dialog open={open} onClose={onClose} PaperProps={{ style: { background: 'var(--background-paper)', border: '1px solid var(--divider)', color: 'var(--text-primary)', borderRadius: '16px', padding: '16px', maxWidth: '440px', width: '100%' } }}>
      <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--divider)', paddingBottom: '14px', color: 'var(--text-primary)' }}>
        🎯 Add Use Case
      </DialogTitle>
      <DialogContent style={{ marginTop: '8px', paddingTop: '16px', paddingBottom: '16px', overflow: 'visible' }}>
        {error && <Alert severity="error" style={{ marginBottom: '16px', borderRadius: '8px' }}>{error}</Alert>}
        <TextField fullWidth label="Use Case Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Login to System" variant="outlined" size="small" InputLabelProps={{ style: { color: 'var(--text-secondary)' } }} inputProps={{ style: { color: 'var(--text-primary)' } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'var(--divider)' }, '&:hover fieldset': { borderColor: 'var(--primary-main)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' } } }} />
      </DialogContent>
      <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
        <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none', whiteSpace: 'nowrap', fontWeight: 600 }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" style={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', padding: '6px 18px' }}>Create Use Case</Button>
      </DialogActions>
    </Dialog>
  );
};

const UseCaseRelationDialog = ({ open, onClose, sourceLabel, targetLabel, onSubmit }) => {
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
          padding: '16px',
          maxWidth: '460px',
          width: '100%'
        }
      }}
    >
      <DialogTitle style={{ fontWeight: 800, fontSize: '1.2rem', borderBottom: '1px solid var(--divider)', paddingBottom: '14px', color: 'var(--text-primary)' }}>
        🔗 Connect Use Cases
      </DialogTitle>
      <DialogContent style={{ marginTop: '8px', paddingTop: '16px', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'visible' }}>
        <Typography variant="body2" style={{ color: 'var(--text-secondary)' }}>
          Choose the relationship type between <strong style={{ color: 'var(--text-primary)' }}>{sourceLabel}</strong> and <strong style={{ color: 'var(--text-primary)' }}>{targetLabel}</strong>:
        </Typography>

        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '6px' }}>
          <Button
            variant="outlined"
            onClick={() => onSubmit('INCLUDE')}
            style={{
              borderColor: '#00FFCC',
              color: '#00FFCC',
              borderRadius: '10px',
              padding: '12px 6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              textTransform: 'none'
            }}
          >
            <span style={{ fontWeight: 900, fontSize: '0.9rem' }}>&lt;&lt;include&gt;&gt;</span>
            <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>Mandatory sub-flow</span>
          </Button>

          <Button
            variant="outlined"
            onClick={() => onSubmit('EXTEND')}
            style={{
              borderColor: 'var(--primary-main)',
              color: 'var(--primary-main)',
              borderRadius: '10px',
              padding: '12px 6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              textTransform: 'none'
            }}
          >
            <span style={{ fontWeight: 900, fontSize: '0.9rem' }}>&lt;&lt;extend&gt;&gt;</span>
            <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>Optional extension</span>
          </Button>

          <Button
            variant="outlined"
            onClick={() => onSubmit('INHERITS')}
            style={{
              borderColor: '#a855f7',
              color: '#a855f7',
              borderRadius: '10px',
              padding: '12px 6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              textTransform: 'none'
            }}
          >
            <span style={{ fontWeight: 900, fontSize: '0.9rem' }}>INHERITS</span>
            <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>Generalization</span>
          </Button>
        </Box>
      </DialogContent>
      <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none', whiteSpace: 'nowrap', fontWeight: 600 }}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

const ActivityTransitionDialog = ({ open, onClose, sourceLabel, targetLabel, onSubmit }) => {
  const [guard, setGuard] = useState('');

  useEffect(() => {
    if (open) setGuard('');
  }, [open]);

  const handleCreate = (e) => {
    if (e) e.preventDefault();
    onSubmit(guard.trim());
    onClose();
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
          padding: '16px',
          maxWidth: '460px',
          width: '100%'
        }
      }}
    >
      <form onSubmit={handleCreate}>
        <DialogTitle style={{ fontWeight: 800, fontSize: '1.2rem', borderBottom: '1px solid var(--divider)', paddingBottom: '14px', color: 'var(--text-primary)' }}>
          ⚡ Connect Activity Flow
        </DialogTitle>
        <DialogContent style={{ marginTop: '8px', paddingTop: '16px', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'visible' }}>
          <Typography variant="body2" style={{ color: 'var(--text-secondary)' }}>
            Creating transition from <strong style={{ color: 'var(--text-primary)' }}>{sourceLabel}</strong> to <strong style={{ color: 'var(--text-primary)' }}>{targetLabel}</strong>:
          </Typography>

          <Box>
            <Typography variant="caption" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Condition / Guard (optional, e.g. Yes, No, Approved):
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. Yes / valid credentials"
              value={guard}
              onChange={(e) => setGuard(e.target.value)}
              autoFocus
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'var(--text-primary)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  '& fieldset': { borderColor: 'var(--divider)' },
                  '&:hover fieldset': { borderColor: 'var(--primary-main)' },
                  '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' }
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
          <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none', whiteSpace: 'nowrap', fontWeight: 600 }}>Cancel</Button>
          <Button type="submit" variant="contained" style={{ background: 'var(--primary-main)', color: '#000', fontWeight: 700, textTransform: 'none', borderRadius: '8px', whiteSpace: 'nowrap', padding: '6px 18px' }}>
            Connect
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// ========================================================
// EDIT CONNECTION / ARROW DIALOGS ACROSS ALL DIAGRAMS
// ========================================================
const EditERRelationDialog = ({ open, onClose, relation, entities = [], onSubmit, onDelete }) => {
  const [source, setSource] = useState('');
  const [sourceCard, setSourceCard] = useState('ONE');
  const [target, setTarget] = useState('');
  const [targetCard, setTargetCard] = useState('MANY');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (relation) {
      setSource(relation.source || '');
      setSourceCard(relation.sourceCard || 'ONE');
      setTarget(relation.target || '');
      setTargetCard(relation.targetCard || 'MANY');
      setLabel(relation.label || '');
      setError('');
    }
  }, [relation, open]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!source || !target) {
      setError('Please select both entities.');
      return;
    }
    onSubmit(relation, source, sourceCard, target, targetCard, label);
  };

  const entityList = (entities || []).map(e => (typeof e === 'string' ? e : e?.name)).filter(Boolean);

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
          padding: '16px',
          maxWidth: '520px',
          width: '100%'
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--divider)', paddingBottom: '14px', color: 'var(--text-primary)' }}>
          🔗 Edit ER Relationship
        </DialogTitle>
        <DialogContent style={{ marginTop: '8px', paddingTop: '16px', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '18px', overflow: 'visible' }}>
          {error && <Alert severity="error" style={{ borderRadius: '8px' }}>{error}</Alert>}

          <Box style={{ display: 'flex', gap: '12px' }}>
            <FormControl fullWidth size="small">
              <InputLabel style={{ color: 'var(--text-secondary)' }}>Entity 1</InputLabel>
              <Select
                value={source}
                label="Entity 1"
                onChange={(e) => setSource(e.target.value)}
                style={{ color: 'var(--text-primary)' }}
              >
                {entityList.map(name => (
                  <MenuItem key={name} value={name}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" style={{ width: '140px', flexShrink: 0 }}>
              <InputLabel style={{ color: 'var(--text-secondary)' }}>Card 1</InputLabel>
              <Select
                value={sourceCard}
                label="Card 1"
                onChange={(e) => setSourceCard(e.target.value)}
                style={{ color: 'var(--text-primary)' }}
              >
                <MenuItem value="ONE">ONE (1)</MenuItem>
                <MenuItem value="MANY">MANY (N)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box style={{ display: 'flex', gap: '12px' }}>
            <FormControl fullWidth size="small">
              <InputLabel style={{ color: 'var(--text-secondary)' }}>Entity 2</InputLabel>
              <Select
                value={target}
                label="Entity 2"
                onChange={(e) => setTarget(e.target.value)}
                style={{ color: 'var(--text-primary)' }}
              >
                {entityList.map(name => (
                  <MenuItem key={name} value={name}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" style={{ width: '140px', flexShrink: 0 }}>
              <InputLabel style={{ color: 'var(--text-secondary)' }}>Card 2</InputLabel>
              <Select
                value={targetCard}
                label="Card 2"
                onChange={(e) => setTargetCard(e.target.value)}
                style={{ color: 'var(--text-primary)' }}
              >
                <MenuItem value="ONE">ONE (1)</MenuItem>
                <MenuItem value="MANY">MANY (N)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField
            fullWidth
            size="small"
            label="Relationship Verb / Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. PLACES, HAS, TO"
            InputLabelProps={{ style: { color: 'var(--text-secondary)' } }}
            inputProps={{ style: { color: 'var(--text-primary)' } }}
          />
        </DialogContent>
        <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'nowrap' }}>
          <Button
            onClick={() => onDelete(relation)}
            color="error"
            variant="outlined"
            style={{ textTransform: 'none', borderRadius: '8px', whiteSpace: 'nowrap', fontWeight: 600, flexShrink: 0 }}
          >
            Delete Relationship
          </Button>
          <Box style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
            <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none', whiteSpace: 'nowrap', fontWeight: 600 }}>Cancel</Button>
            <Button type="submit" variant="contained" style={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', padding: '6px 18px' }}>
              Save Changes
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const EditUseCaseLinkDialog = ({ open, onClose, link, actors = [], usecases = [], onSubmit, onDelete }) => {
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [relType, setRelType] = useState('ASSOCIATION');
  const [error, setError] = useState('');

  const actorList = (actors || []).map(a => (typeof a === 'string' ? a : a?.id || a?.name)).filter(Boolean);
  const ucList = (usecases || []).map(u => (typeof u === 'string' ? u : u?.id || u?.name)).filter(Boolean);
  const allNodes = Array.from(new Set([...actorList, ...ucList]));

  const isActor = (name) => actorList.some(a => a.toLowerCase() === (name || '').toLowerCase());
  const isUseCase = (name) => ucList.some(u => u.toLowerCase() === (name || '').toLowerCase());

  const isActorToActor = isActor(source) && isActor(target);
  const isActorToUC = (isActor(source) && isUseCase(target)) || (isUseCase(source) && isActor(target));
  const isUCToUC = isUseCase(source) && isUseCase(target);

  const getEffectiveRelType = (src, tgt, currentRelType) => {
    const srcIsAct = isActor(src);
    const tgtIsAct = isActor(tgt);
    const srcIsUC = isUseCase(src);
    const tgtIsUC = isUseCase(tgt);

    if (srcIsAct && tgtIsAct) {
      return 'INHERITS';
    }
    if ((srcIsAct && tgtIsUC) || (srcIsUC && tgtIsAct)) {
      return 'ASSOCIATION';
    }
    if (srcIsUC && tgtIsUC) {
      if (currentRelType === 'ASSOCIATION') {
        return 'INCLUDE';
      }
      return currentRelType || 'INCLUDE';
    }
    return currentRelType || 'ASSOCIATION';
  };

  useEffect(() => {
    if (link) {
      const src = link.source || '';
      const tgt = link.target || '';
      const initialType = link.relType || link.type || 'ASSOCIATION';
      setSource(src);
      setTarget(tgt);
      setRelType(getEffectiveRelType(src, tgt, initialType));
      setError('');
    }
  }, [link, open]);

  const handleSourceChange = (newSrc) => {
    setSource(newSrc);
    setRelType(prev => getEffectiveRelType(newSrc, target, prev));
  };

  const handleTargetChange = (newTgt) => {
    setTarget(newTgt);
    setRelType(prev => getEffectiveRelType(source, newTgt, prev));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!source || !target) {
      setError('Please select both source and target.');
      return;
    }
    if (source.toLowerCase() === target.toLowerCase()) {
      setError('Source and target cannot be the same element.');
      return;
    }
    const finalRelType = getEffectiveRelType(source, target, relType);
    onSubmit(link, source, target, finalRelType);
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
          padding: '16px',
          maxWidth: '520px',
          width: '100%'
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--divider)', paddingBottom: '14px', color: 'var(--text-primary)' }}>
          🔗 Edit Use Case Connection
        </DialogTitle>
        <DialogContent style={{ marginTop: '8px', paddingTop: '16px', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '18px', overflow: 'visible' }}>
          {error && <Alert severity="error" style={{ borderRadius: '8px' }}>{error}</Alert>}

          <FormControl fullWidth size="small">
            <InputLabel style={{ color: 'var(--text-secondary)' }}>From (Source)</InputLabel>
            <Select
              value={source}
              label="From (Source)"
              onChange={(e) => handleSourceChange(e.target.value)}
              style={{ color: 'var(--text-primary)' }}
            >
              {allNodes.map(name => (
                <MenuItem key={name} value={name}>
                  {isActor(name) ? `👤 ${name} (Actor)` : `⭕ ${name} (Use Case)`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel style={{ color: 'var(--text-secondary)' }}>To (Target)</InputLabel>
            <Select
              value={target}
              label="To (Target)"
              onChange={(e) => handleTargetChange(e.target.value)}
              style={{ color: 'var(--text-primary)' }}
            >
              {allNodes.map(name => (
                <MenuItem key={name} value={name}>
                  {isActor(name) ? `👤 ${name} (Actor)` : `⭕ ${name} (Use Case)`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" disabled={!isUCToUC}>
            <InputLabel style={{ color: 'var(--text-secondary)' }}>Connection Type</InputLabel>
            <Select
              value={isActorToActor ? 'INHERITS' : (isActorToUC ? 'ASSOCIATION' : relType)}
              label="Connection Type"
              onChange={(e) => setRelType(e.target.value)}
              style={{ color: 'var(--text-primary)' }}
            >
              {isActorToActor && (
                <MenuItem value="INHERITS">Generalization / Inheritance ( INHERITS )</MenuItem>
              )}
              {isActorToUC && (
                <MenuItem value="ASSOCIATION">Association ( -{'>'} )</MenuItem>
              )}
              {isUCToUC && (
                <>
                  <MenuItem value="INCLUDE">&lt;&lt;include&gt;&gt; ( INCLUDES )</MenuItem>
                  <MenuItem value="EXTEND">&lt;&lt;extend&gt;&gt; ( EXTENDS )</MenuItem>
                  <MenuItem value="INHERITS">Generalization ( INHERITS )</MenuItem>
                  <MenuItem value="ASSOCIATION">Association ( -{'>'} )</MenuItem>
                </>
              )}
              {!isActorToActor && !isActorToUC && !isUCToUC && (
                <>
                  <MenuItem value="ASSOCIATION">Association ( -{'>'} )</MenuItem>
                  <MenuItem value="INCLUDE">&lt;&lt;include&gt;&gt; ( INCLUDES )</MenuItem>
                  <MenuItem value="EXTEND">&lt;&lt;extend&gt;&gt; ( EXTENDS )</MenuItem>
                  <MenuItem value="INHERITS">Generalization ( INHERITS )</MenuItem>
                </>
              )}
            </Select>
            {isActorToActor && (
              <Typography variant="caption" style={{ color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                🔒 Fixed: Actor-to-Actor connections can only be Generalization (INHERITS).
              </Typography>
            )}
            {isActorToUC && (
              <Typography variant="caption" style={{ color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                🔒 Fixed: Actor-to-UseCase connections are always direct Associations ( -{'>'} ).
              </Typography>
            )}
            {isUCToUC && (
              <Typography variant="caption" style={{ color: 'var(--primary-main)', marginTop: '4px', display: 'block' }}>
                ✨ Choose relationship type between Use Cases (&lt;&lt;include&gt;&gt;, &lt;&lt;extend&gt;&gt;, or Generalization).
              </Typography>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'nowrap' }}>
          <Button
            onClick={() => onDelete(link)}
            color="error"
            variant="outlined"
            style={{ textTransform: 'none', borderRadius: '8px', whiteSpace: 'nowrap', fontWeight: 600, flexShrink: 0 }}
          >
            Delete Connection
          </Button>
          <Box style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
            <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none', whiteSpace: 'nowrap', fontWeight: 600 }}>Cancel</Button>
            <Button type="submit" variant="contained" style={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', padding: '6px 18px' }}>
              Save Changes
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const EditActivityTransitionDialog = ({ open, onClose, transition, nodes = [], onSubmit, onDelete }) => {
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [guard, setGuard] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (transition) {
      setSource(transition.source || '');
      setTarget(transition.target || '');
      setGuard(transition.guard || transition.label || '');
      setError('');
    }
  }, [transition, open]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!source || !target) {
      setError('Please select both source and target nodes.');
      return;
    }
    onSubmit(transition, source, target, guard);
  };

  const nodeList = (nodes || []).map(n => ({
    id: typeof n === 'string' ? n : n?.id,
    label: typeof n === 'string' ? n : n?.label || n?.id
  })).filter(n => Boolean(n.id));

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
          padding: '16px',
          maxWidth: '520px',
          width: '100%'
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--divider)', paddingBottom: '14px', color: 'var(--text-primary)' }}>
          ➡️ Edit Activity Transition
        </DialogTitle>
        <DialogContent style={{ marginTop: '8px', paddingTop: '16px', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '18px', overflow: 'visible' }}>
          {error && <Alert severity="error" style={{ borderRadius: '8px' }}>{error}</Alert>}

          <FormControl fullWidth size="small">
            <InputLabel style={{ color: 'var(--text-secondary)' }}>From (Source Node)</InputLabel>
            <Select
              value={source}
              label="From (Source Node)"
              onChange={(e) => setSource(e.target.value)}
              style={{ color: 'var(--text-primary)' }}
            >
              {nodeList.map(n => (
                <MenuItem key={n.id} value={n.id}>{n.label || n.id}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel style={{ color: 'var(--text-secondary)' }}>To (Target Node)</InputLabel>
            <Select
              value={target}
              label="To (Target Node)"
              onChange={(e) => setTarget(e.target.value)}
              style={{ color: 'var(--text-primary)' }}
            >
              {nodeList.map(n => (
                <MenuItem key={n.id} value={n.id}>{n.label || n.id}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            size="small"
            label="Condition / Guard (Optional)"
            value={guard}
            onChange={(e) => setGuard(e.target.value)}
            placeholder="e.g. Yes / Validated / Error"
            InputLabelProps={{ style: { color: 'var(--text-secondary)' } }}
            inputProps={{ style: { color: 'var(--text-primary)' } }}
          />
        </DialogContent>
        <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'nowrap' }}>
          <Button
            onClick={() => onDelete(transition)}
            color="error"
            variant="outlined"
            style={{ textTransform: 'none', borderRadius: '8px', whiteSpace: 'nowrap', fontWeight: 600, flexShrink: 0 }}
          >
            Delete Transition
          </Button>
          <Box style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
            <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none', whiteSpace: 'nowrap', fontWeight: 600 }}>Cancel</Button>
            <Button type="submit" variant="contained" style={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', padding: '6px 18px' }}>
              Save Changes
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const EditSequenceMessageDialog = ({ open, onClose, messageData, participants = [], onSubmit, onDelete }) => {
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [message, setMessage] = useState('');
  const [actionType, setActionType] = useState('sends');
  const [error, setError] = useState('');

  useEffect(() => {
    if (messageData) {
      setSource(messageData.from || messageData.source || '');
      setTarget(messageData.to || messageData.target || '');
      setMessage(messageData.message || messageData.label || '');
      setActionType(messageData.actionType || 'sends');
      setError('');
    }
  }, [messageData, open]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!source || !target) {
      setError('Please select both source and target participants.');
      return;
    }
    if (!message.trim()) {
      setError('Message cannot be empty.');
      return;
    }
    onSubmit(messageData.messageIndex, source, target, actionType, message.trim());
  };

  const pList = (participants || []).map(p => (typeof p === 'string' ? p : p?.name || p?.id)).filter(Boolean);

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
          padding: '16px',
          maxWidth: '520px',
          width: '100%'
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--divider)', paddingBottom: '14px', color: 'var(--text-primary)' }}>
          ✉️ Edit Sequence Message
        </DialogTitle>
        <DialogContent style={{ marginTop: '8px', paddingTop: '16px', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '18px', overflow: 'visible' }}>
          {error && <Alert severity="error" style={{ borderRadius: '8px' }}>{error}</Alert>}

          <FormControl fullWidth size="small">
            <InputLabel style={{ color: 'var(--text-secondary)' }}>From (Caller)</InputLabel>
            <Select
              value={source}
              label="From (Caller)"
              onChange={(e) => setSource(e.target.value)}
              style={{ color: 'var(--text-primary)' }}
            >
              {pList.map(p => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel style={{ color: 'var(--text-secondary)' }}>To (Receiver)</InputLabel>
            <Select
              value={target}
              label="To (Receiver)"
              onChange={(e) => setTarget(e.target.value)}
              style={{ color: 'var(--text-primary)' }}
            >
              {pList.map(p => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel style={{ color: 'var(--text-secondary)' }}>Message Type / Action</InputLabel>
            <Select
              value={actionType}
              label="Message Type / Action"
              onChange={(e) => setActionType(e.target.value)}
              style={{ color: 'var(--text-primary)' }}
            >
              <MenuItem value="sends">Sends (Solid Arrow)</MenuItem>
              <MenuItem value="requests">Requests (Solid Arrow)</MenuItem>
              <MenuItem value="returns">Returns (Dashed Arrow)</MenuItem>
              <MenuItem value="displays">Displays (Solid Arrow)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            size="small"
            label="Message Text / Method Call"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. login(username, password)"
            InputLabelProps={{ style: { color: 'var(--text-secondary)' } }}
            inputProps={{ style: { color: 'var(--text-primary)' } }}
          />
        </DialogContent>
        <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'nowrap' }}>
          <Button
            onClick={() => onDelete(messageData.messageIndex)}
            color="error"
            variant="outlined"
            style={{ textTransform: 'none', borderRadius: '8px', whiteSpace: 'nowrap', fontWeight: 600, flexShrink: 0 }}
          >
            Delete Message
          </Button>
          <Box style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
            <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none', whiteSpace: 'nowrap', fontWeight: 600 }}>Cancel</Button>
            <Button type="submit" variant="contained" style={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', padding: '6px 18px' }}>
              Save Changes
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const EditGanttDependencyDialog = ({ open, onClose, dependency, tasks = [], onSubmit, onDelete }) => {
  const [fromTask, setFromTask] = useState('');
  const [toTask, setToTask] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (dependency) {
      setFromTask(dependency.fromTask || '');
      setToTask(dependency.toTask || '');
      setError('');
    }
  }, [dependency, open]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!fromTask || !toTask) {
      setError('Please select both tasks.');
      return;
    }
    if (fromTask === toTask) {
      setError('A task cannot depend on itself.');
      return;
    }
    onSubmit(dependency.fromTask, dependency.toTask, fromTask, toTask);
  };

  const taskList = (tasks || []).map(t => (typeof t === 'string' ? t : t?.name || t?.id)).filter(Boolean);

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
          padding: '16px',
          maxWidth: '520px',
          width: '100%'
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--divider)', paddingBottom: '14px', color: 'var(--text-primary)' }}>
          📊 Edit Gantt Task Dependency
        </DialogTitle>
        <DialogContent style={{ marginTop: '8px', paddingTop: '16px', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '18px', overflow: 'visible' }}>
          {error && <Alert severity="error" style={{ borderRadius: '8px' }}>{error}</Alert>}

          <FormControl fullWidth size="small">
            <InputLabel style={{ color: 'var(--text-secondary)' }}>Predecessor Task (After / depends on)</InputLabel>
            <Select
              value={fromTask}
              label="Predecessor Task (After / depends on)"
              onChange={(e) => setFromTask(e.target.value)}
              style={{ color: 'var(--text-primary)' }}
            >
              {taskList.map(t => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel style={{ color: 'var(--text-secondary)' }}>Successor Task (Target)</InputLabel>
            <Select
              value={toTask}
              label="Successor Task (Target)"
              onChange={(e) => setToTask(e.target.value)}
              style={{ color: 'var(--text-primary)' }}
            >
              {taskList.map(t => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'nowrap' }}>
          <Button
            onClick={() => onDelete(dependency.fromTask, dependency.toTask)}
            color="error"
            variant="outlined"
            style={{ textTransform: 'none', borderRadius: '8px', whiteSpace: 'nowrap', fontWeight: 600, flexShrink: 0 }}
          >
            Delete Dependency
          </Button>
          <Box style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
            <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none', whiteSpace: 'nowrap', fontWeight: 600 }}>Cancel</Button>
            <Button type="submit" variant="contained" style={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', padding: '6px 18px' }}>
              Save Changes
            </Button>
          </Box>
        </DialogActions>
      </form>
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
    <Dialog open={open} onClose={onClose} PaperProps={{ style: { background: 'var(--background-paper)', border: '1px solid var(--divider)', color: 'var(--text-primary)', borderRadius: '16px', padding: '16px', maxWidth: '440px', width: '100%' } }}>
      <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--divider)', paddingBottom: '14px', color: 'var(--text-primary)' }}>
        ⏹ Add Participant
      </DialogTitle>
      <DialogContent style={{ marginTop: '8px', paddingTop: '16px', paddingBottom: '16px', overflow: 'visible' }}>
        {error && <Alert severity="error" style={{ marginBottom: '16px', borderRadius: '8px' }}>{error}</Alert>}
        <TextField fullWidth label="Participant Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Database" variant="outlined" size="small" InputLabelProps={{ style: { color: 'var(--text-secondary)' } }} inputProps={{ style: { color: 'var(--text-primary)' } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'var(--divider)' }, '&:hover fieldset': { borderColor: 'var(--primary-main)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' } } }} />
      </DialogContent>
      <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
        <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none', whiteSpace: 'nowrap', fontWeight: 600 }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" style={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', padding: '6px 18px' }}>Create Participant</Button>
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
    <Dialog open={open} onClose={onClose} PaperProps={{ style: { background: 'var(--background-paper)', border: '1px solid var(--divider)', color: 'var(--text-primary)', borderRadius: '16px', padding: '16px', maxWidth: '480px', width: '100%' } }}>
      <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--divider)', paddingBottom: '14px', color: 'var(--text-primary)' }}>
        ✉️ Add Message
      </DialogTitle>
      <DialogContent style={{ marginTop: '8px', paddingTop: '16px', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '18px', overflow: 'visible' }}>
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
      <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
        <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none', whiteSpace: 'nowrap', fontWeight: 600 }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" style={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', padding: '6px 18px' }}>Create Message</Button>
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
    <Dialog open={open} onClose={onClose} PaperProps={{ style: { background: 'var(--background-paper)', border: '1px solid var(--divider)', color: 'var(--text-primary)', borderRadius: '16px', padding: '16px', maxWidth: '460px', width: '100%' } }}>
      <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--divider)', paddingBottom: '14px', color: 'var(--text-primary)' }}>
        📅 Add Task
      </DialogTitle>
      <DialogContent style={{ marginTop: '8px', paddingTop: '16px', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '18px', overflow: 'visible' }}>
        {error && <Alert severity="error" style={{ borderRadius: '8px' }}>{error}</Alert>}

        <TextField fullWidth label="Task Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Design UI" variant="outlined" size="small" InputLabelProps={{ style: { color: 'var(--text-secondary)' } }} inputProps={{ style: { color: 'var(--text-primary)' } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'var(--divider)' }, '&:hover fieldset': { borderColor: 'var(--primary-main)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' } } }} />

        <FormControl component="fieldset" style={{ marginTop: '4px' }}>
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
      <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
        <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none', whiteSpace: 'nowrap', fontWeight: 600 }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" style={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', padding: '6px 18px' }}>Create Task</Button>
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
          padding: '16px',
          maxWidth: '480px',
          width: '100%'
        }
      }}
    >
      <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--divider)', paddingBottom: '14px', color: 'var(--text-primary)' }}>
        ⚡ Add Activity Node
      </DialogTitle>
      <DialogContent style={{ marginTop: '8px', paddingTop: '16px', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '18px', overflow: 'visible' }}>
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
      <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
        <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none', whiteSpace: 'nowrap', fontWeight: 600 }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" style={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', padding: '6px 18px' }}>Create Node</Button>
      </DialogActions>
    </Dialog>
  );
};

const EditActivityNodeDialog = ({ open, onClose, node, partitions = [], onSubmit, onDelete }) => {
  const [label, setLabel] = useState('');
  const [nodeType, setNodeType] = useState('ACTION');
  const [partition, setPartition] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (node) {
      setLabel(node.label || node.id || '');
      setNodeType((node.type || 'action').toUpperCase());
      setPartition(node.partition || '');
      setError('');
    }
  }, [node, open]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!label.trim()) {
      setError('Node label cannot be empty.');
      return;
    }
    onSubmit(node, { label: label.trim(), type: nodeType, partition: partition.trim() });
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
          padding: '16px',
          maxWidth: '520px',
          width: '100%'
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--divider)', paddingBottom: '14px', color: 'var(--text-primary)' }}>
          ⚡ Edit Activity Node
        </DialogTitle>
        <DialogContent style={{ marginTop: '8px', paddingTop: '16px', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '18px', overflow: 'visible' }}>
          {error && <Alert severity="error" style={{ borderRadius: '8px' }}>{error}</Alert>}

          <TextField
            fullWidth
            size="small"
            label="Node ID (Unique)"
            value={node?.id || ''}
            disabled
            InputLabelProps={{ style: { color: 'var(--text-secondary)' } }}
            inputProps={{ style: { color: 'var(--text-secondary)', fontFamily: 'monospace' } }}
          />

          <TextField
            fullWidth
            size="small"
            label="Display Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Validate Input Data"
            InputLabelProps={{ style: { color: 'var(--text-secondary)' } }}
            inputProps={{ style: { color: 'var(--text-primary)' } }}
          />

          <FormControl fullWidth size="small">
            <InputLabel style={{ color: 'var(--text-secondary)' }}>Node Type</InputLabel>
            <Select
              value={nodeType}
              label="Node Type"
              onChange={(e) => setNodeType(e.target.value)}
              style={{ color: 'var(--text-primary)' }}
            >
              <MenuItem value="ACTION">Action / Step (Rounded Card 🟦)</MenuItem>
              <MenuItem value="DECISION">Decision / Condition (Diamond 🔶)</MenuItem>
              <MenuItem value="FORK">Fork Bar (Split Parallel Flows ══)</MenuItem>
              <MenuItem value="JOIN">Join Bar (Merge Parallel Flows ══)</MenuItem>
              <MenuItem value="START">Initial / Start Node (🟢)</MenuItem>
              <MenuItem value="END">Activity Final / End Node (🎯)</MenuItem>
            </Select>
          </FormControl>

          {partitions && partitions.length > 0 && (
            <FormControl fullWidth size="small">
              <InputLabel style={{ color: 'var(--text-secondary)' }}>Swimlane / Partition</InputLabel>
              <Select
                value={partition}
                label="Swimlane / Partition"
                onChange={(e) => setPartition(e.target.value)}
                style={{ color: 'var(--text-primary)' }}
              >
                <MenuItem value=""><em>None (Global)</em></MenuItem>
                {partitions.map(p => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'nowrap' }}>
          <Button
            onClick={() => onDelete(node)}
            color="error"
            variant="outlined"
            style={{ textTransform: 'none', borderRadius: '8px', whiteSpace: 'nowrap', fontWeight: 600, flexShrink: 0 }}
          >
            Delete Node
          </Button>
          <Box style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
            <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none', whiteSpace: 'nowrap', fontWeight: 600 }}>Cancel</Button>
            <Button type="submit" variant="contained" style={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', padding: '6px 18px' }}>
              Save Changes
            </Button>
          </Box>
        </DialogActions>
      </form>
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
          padding: '16px',
          maxWidth: '480px',
          width: '100%'
        }
      }}
    >
      <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--divider)', paddingBottom: '14px', color: 'var(--text-primary)' }}>
        ➡️ Add Transition
      </DialogTitle>
      <DialogContent style={{ marginTop: '8px', paddingTop: '16px', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '18px', overflow: 'visible' }}>
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
      <DialogActions style={{ borderTop: '1px solid var(--divider)', padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
        <Button onClick={onClose} style={{ color: 'var(--text-secondary)', textTransform: 'none', whiteSpace: 'nowrap', fontWeight: 600 }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" style={{ background: 'var(--primary-main)', textTransform: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', padding: '6px 18px' }}>Add Transition</Button>
      </DialogActions>
    </Dialog>
  );
};

const getDiagramPlaceholder = (key) => {
  switch (key) {
    case 'er':
      return 'e.g. Healthcare management database with Patients, Doctors, Appointments, Medical Records, Prescriptions, and Billing Invoices...';
    case 'usecase':
      return 'e.g. Online Banking System with Customers, Tellers, Branch Managers, and Fraud Detection System...';
    case 'activity':
      return 'e.g. Order fulfillment workflow from Customer checkout, Inventory verification, Payment processing, Packaging, to Delivery dispatch...';
    case 'sequence':
      return 'e.g. User Authentication and Two-Factor Verification (2FA) flow between Mobile App, API Gateway, Auth Service, SMS Provider, and Database...';
    case 'gantt':
      return 'e.g. 6-month Mobile App Development project covering Discovery, UI/UX Design, Frontend/Backend Sprints, QA Testing, App Store Submission, and Launch...';
    default:
      return 'e.g. Describe your system requirements, entities, or workflow goals...';
  }
};

const getDiagramSpecificRules = (key) => {
  switch (key) {
    case 'er':
      return `DIAGRAM-SPECIFIC ER RULES:
- Declare every table using 'ENTITY <EntityName>' followed by 'ATTRIBUTES' on the next line.
- Indent fields and use format: '<field_name> : <type> PRIMARY KEY', '<field_name> : <type> FOREIGN KEY', or '<field_name> : <type>'.
- Declare relationships using: 'RELATIONSHIP <EntityA> <ONE|MANY> <Verb> <EntityB> <ONE|MANY>'.
- Cardinalities must be strictly 'ONE' or 'MANY'.
- Do NOT output SQL 'CREATE TABLE', Mermaid, JSON, or curly braces.`;
    case 'usecase':
      return `DIAGRAM-SPECIFIC USE CASE RULES:
- Declare the boundary using 'SYSTEM <System Name>'.
- Declare actors using 'ACTOR <ActorName>'.
- Declare use cases using 'USE CASE <UseCaseName>'.
- Connect actor to use case using: '<ActorName> -> <UseCaseName>'.
- Connect use case to use case using: '<UseCase1> INCLUDES <UseCase2>' for mandatory inclusion, '<UseCase1> EXTENDS <UseCase2>' for optional extension, or '<UseCase1> INHERITS <UseCase2>' for generalization.
- Connect actor to actor using: '<ChildActor> INHERITS <ParentActor>'.
- Do NOT use '->' between two use cases or between two actors.`;
    case 'activity':
      return `DIAGRAM-SPECIFIC ACTIVITY RULES:
- Start with 'ACTIVITY <Workflow Title>'.
- Group steps into lanes using 'SWIMLANE <LaneName>' or 'PARTITION <LaneName>'.
- Use unique snake_case IDs for all nodes: 'START <id> ["Label"]', 'ACTION <id> ["Label"]', 'DECISION <id> ["Label"]', 'FORK <id> ["Label"]', 'JOIN <id> ["Label"]', 'END <id> ["Label"]'.
- Connect flows using: '<source_id> -> <target_id>' or '<source_id> -> <target_id> [GuardCondition]'.
- Always provide conditional guards (e.g. '[Yes]', '[No]', '[Valid]') on transitions originating from a DECISION node.
- Every workflow path must terminate at an END node.`;
    case 'sequence':
      return `DIAGRAM-SPECIFIC SEQUENCE RULES:
- Start with 'SEQUENCE <Title>'.
- Declare all lifelines from left to right using 'PARTICIPANT <Name>'.
- Message statements must follow the strict natural grammar and end with a period:
  * '<Caller> sends "<Message>" to <Receiver>.' (Synchronous call)
  * '<Caller> requests "<Data>" from <Receiver>.' (Data query/request)
  * '<Sender> returns "<Result>" to <Receiver>.' (Return reply)
  * '<Caller> displays "<UI View>" to <User>.' (UI display)
- Conditional branching can use: 'IF <condition> THEN ... ELSE ... END'.
- Every message string MUST be enclosed in double quotes and end with a period (.).`;
    case 'gantt':
      return `DIAGRAM-SPECIFIC GANTT RULES:
- Start with 'GANTT <Roadmap Title>'.
- Organize phases using 'PROJECT <PhaseName>'.
- Define tasks with:
  TASK <Task Name>
  START <YYYY-MM-DD>
  END <YYYY-MM-DD>
  DEPENDS ON <PredecessorTaskName> (optional)
- Define milestones with:
  MILESTONE <Milestone Name>
  DATE <YYYY-MM-DD>
- All dates MUST be in ISO format (YYYY-MM-DD).
- Ensure chronological consistency: dependent tasks should start on or after their predecessor's end date.`;
    default:
      return '';
  }
};

const AiPromptModal = ({ open, onClose, diagramKey, diagramTitle, templateCode }) => {
  const [userTarget, setUserTarget] = useState('');
  const [copied, setCopied] = useState(false);

  const getFullPrompt = () => {
    const specificRules = getDiagramSpecificRules(diagramKey);
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
${specificRules ? specificRules + '\n\n==================================================\n' : ''}AI RESPONSE RULES:
==================================================
1. Output ONLY valid SophiaPath DSL code adhering strictly to the keywords and syntax rules above.
2. Enclose the generated DSL code in a single markdown code block (\`\`\`).
3. Make sure all entities, attributes, relationships, actors, use cases, states, transitions, or lifelines accurately reflect my requirements.
4. Do not wrap the code with conversational filler or markdown headers so I can copy-paste it directly into SophiaPath.`;
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
          placeholder={getDiagramPlaceholder(diagramKey)}
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
            startIcon={<AutoAwesomeIcon />}
            style={{
              borderRadius: '10px',
              textTransform: 'none',
              background: '#10a37f',
              color: '#fff',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(16, 163, 127, 0.35)'
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

// ========================================================
// GANTT DATE & DSL INTERACTION HELPERS
// ========================================================
export const parseGanttDate = (str) => {
  if (!str) return null;
  const parts = str.trim().split('-');
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const date = new Date(y, m, d);
  return isNaN(date.getTime()) ? null : date;
};

export const formatGanttDate = (date) => {
  if (!date || isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const addDaysToGanttDate = (dateStr, numDays) => {
  const d = parseGanttDate(dateStr);
  if (!d) return dateStr;
  d.setDate(d.getDate() + numDays);
  return formatGanttDate(d);
};

export const getDaysBetweenGanttDates = (startStr, endStr) => {
  const s = parseGanttDate(startStr);
  const e = parseGanttDate(endStr);
  if (!s || !e) return 1;
  const diffTime = e.getTime() - s.getTime();
  return Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
};

export const getWeekLabel = (monthZeroIndexed, weekIdx) => {
  const dayOfStart = weekIdx * 7 + 1;
  return `${monthZeroIndexed + 1}/${dayOfStart}`;
};

export const getGanttLeftPaneWidth = (chartTitle = '', tasks = []) => {
  const titleText = chartTitle || 'GANTT SCHEDULE';
  const titleWidth = titleText.length * 8.5;
  let maxTaskWidth = 0;
  tasks.forEach(t => {
    if (t.name) {
      const len = t.name.length;
      if (len * 8 > maxTaskWidth) maxTaskWidth = len * 8;
    }
  });
  const neededForTitle = 24 + titleWidth + 85;
  const neededForTasks = 48 + maxTaskWidth + 85;
  return Math.max(260, Math.ceil(Math.max(neededForTitle, neededForTasks)));
};

export const GANTT_PALETTE = [
  { label: 'Blue', color: '#0D6EFD', border: '#0B5ED7' },
  { label: 'Purple', color: '#8B5CF6', border: '#7C3AED' },
  { label: 'Emerald', color: '#10B981', border: '#059669' },
  { label: 'Amber', color: '#F59E0B', border: '#D97706' },
  { label: 'Rose', color: '#EF4444', border: '#DC2626' },
  { label: 'Cyan', color: '#06B6D4', border: '#0891B2' },
  { label: 'Indigo', color: '#6366F1', border: '#4F46E5' },
  { label: 'Slate', color: '#64748B', border: '#475569' }
];

export const computeGanttDependencyPath = (
  depTask,
  depLayout,
  targetTask,
  targetLayout,
  allTasks = [],
  taskLayoutMap = {},
  leftPaneWidth = 260,
  ganttWaypoints = {}
) => {
  const r = 6;
  const isUp = targetLayout.y < depLayout.y;
  const isDown = targetLayout.y > depLayout.y;

  // Start on top edge if target is on top (above), bottom edge if target is below, or right edge if same row
  let xStart = depLayout.x + (depTask.isMilestone ? 11 : Math.max(8, depLayout.width - 12));
  let yStart = depLayout.y + 12;

  if (isUp) {
    yStart = depLayout.y; // Top horizontal edge
  } else if (isDown) {
    yStart = depLayout.y + 24; // Bottom horizontal edge
  } else {
    xStart = depLayout.x + (depTask.isMilestone ? 22 : depLayout.width) + 2;
    yStart = depLayout.y + 12;
  }

  const xEnd = targetLayout.x;
  const yEnd = targetLayout.y + 12;
  const arrowTipX = xEnd;
  const arrowBaseX = xEnd - 7;

  const wpKey = `${depTask.name}->${targetTask.name}`;
  const wp = ganttWaypoints ? ganttWaypoints[wpKey] : null;

  let points = [];
  let handles = [];

  if (arrowBaseX >= xStart + 6) {
    // Direct L-shape / S-shape: vertical out from edge, then 90° right into target left side
    let xDrop = xStart;
    if (wp && wp.xDrop !== undefined) xDrop = wp.xDrop;

    points = [
      { x: xStart, y: yStart },
      { x: xDrop, y: yEnd },
      { x: arrowBaseX, y: yEnd }
    ];
    handles = [{ id: 'xDrop', cx: xDrop, cy: (yStart + yEnd) / 2 }];
  } else {
    // Multi-segment gutter routing for overlapping / backward targets
    let gapY = isUp ? (depLayout.y - 14) : (depLayout.y + 38);
    if (wp && wp.gapY !== undefined) gapY = wp.gapY;

    // Identify intermediate tasks between gapY and yEnd
    const minY = Math.min(gapY, yEnd);
    const maxY = Math.max(gapY, yEnd);
    const intermediateTasks = allTasks.filter(t => {
      if (t.name === depTask.name || t.name === targetTask.name) return false;
      const l = taskLayoutMap[t.name];
      if (!l) return false;
      return (l.y + 2 >= minY && l.y + 22 <= maxY);
    });

    let minIntermediateX = arrowBaseX - 16;
    intermediateTasks.forEach(t => {
      const l = taskLayoutMap[t.name];
      if (l && l.x - 16 < minIntermediateX) {
        minIntermediateX = l.x - 16;
      }
    });

    let xEntry = Math.min(arrowBaseX - 16, minIntermediateX);
    xEntry = Math.max(leftPaneWidth + 14, xEntry);
    if (wp && wp.xEntry !== undefined) xEntry = wp.xEntry;
    if (wp && wp.xDrop2 !== undefined) xEntry = wp.xDrop2;

    points = [
      { x: xStart, y: yStart },
      { x: xStart, y: gapY },
      { x: xEntry, y: gapY },
      { x: xEntry, y: yEnd },
      { x: arrowBaseX, y: yEnd }
    ];

    handles = [
      { id: 'gapY', cx: (xStart + xEntry) / 2, cy: gapY },
      { id: 'xEntry', cx: xEntry, cy: (gapY + yEnd) / 2 }
    ];
  }

  // Deduplicate adjacent identical points
  const cleanPoints = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const prev = cleanPoints[cleanPoints.length - 1];
    const curr = points[i];
    if (Math.abs(prev.x - curr.x) < 0.5 && Math.abs(prev.y - curr.y) < 0.5) continue;
    cleanPoints.push(curr);
  }

  // Construct rounded SVG path
  let d = `M ${cleanPoints[0].x} ${cleanPoints[0].y}`;
  for (let i = 1; i < cleanPoints.length - 1; i++) {
    const pPrev = cleanPoints[i - 1];
    const pCurr = cleanPoints[i];
    const pNext = cleanPoints[i + 1];

    const dx1 = pCurr.x - pPrev.x;
    const dy1 = pCurr.y - pPrev.y;
    const dx2 = pNext.x - pCurr.x;
    const dy2 = pNext.y - pCurr.y;

    const len1 = Math.hypot(dx1, dy1);
    const len2 = Math.hypot(dx2, dy2);

    if (len1 < 1 || len2 < 1) continue;

    const cornerR = Math.min(r, len1 / 2, len2 / 2);

    const startX = pCurr.x - (dx1 / len1) * cornerR;
    const startY = pCurr.y - (dy1 / len1) * cornerR;
    const endX = pCurr.x + (dx2 / len2) * cornerR;
    const endY = pCurr.y + (dy2 / len2) * cornerR;

    d += ` L ${startX} ${startY} Q ${pCurr.x} ${pCurr.y} ${endX} ${endY}`;
  }
  d += ` L ${cleanPoints[cleanPoints.length - 1].x} ${cleanPoints[cleanPoints.length - 1].y}`;

  return {
    d,
    arrowTipX,
    arrowBaseX,
    yEnd,
    handles
  };
};

export const parseGantt = (text) => {
  let title = 'SophiaPath Roadmap';
  const titleMatch = text ? text.match(/^(?:GANTT|title)\s+(.+)$/im) : null;
  if (titleMatch) title = titleMatch[1].trim();

  const sections = [];
  const tasks = [];
  let currentSection = 'SophiaPath';
  const lines = (text || '').split('\n');

  const isCustomFormat = (text || '').includes('TASK') || (text || '').includes('PROJECT') || (text || '').includes('START') || (text || '').includes('MILESTONE');

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
        if (currentTask) tasks.push(currentTask);
        currentTask = {
          name: taskMatch[1].trim(),
          section: currentSection,
          status: '',
          startDateStr: '',
          endDateStr: '',
          duration: 5,
          dependencies: [],
          color: '',
          isMilestone: false
        };
        return;
      }

      const milestoneMatch = trimmed.match(/^MILESTONE\s+(.+)$/i);
      if (milestoneMatch) {
        if (currentTask) tasks.push(currentTask);
        currentTask = {
          name: milestoneMatch[1].trim(),
          section: currentSection,
          status: 'done',
          startDateStr: '',
          endDateStr: '',
          duration: 0,
          dependencies: [],
          color: '',
          isMilestone: true
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
        currentTask.isMilestone = true;
        return;
      }

      const depMatch = trimmed.match(/^DEPENDS ON\s+(.+)$/i);
      if (depMatch && currentTask) {
        currentTask.dependencies.push(depMatch[1].trim());
        currentTask.status = 'active';
        return;
      }

      const colorMatch = trimmed.match(/^COLOR\s+(.+)$/i);
      if (colorMatch && currentTask) {
        currentTask.color = colorMatch[1].trim();
        return;
      }

      const statusMatch = trimmed.match(/^STATUS\s+(.+)$/i);
      if (statusMatch && currentTask) {
        currentTask.status = statusMatch[1].trim();
        return;
      }
    });

    if (currentTask) {
      tasks.push(currentTask);
    }

    tasks.forEach(t => {
      if (t.startDateStr && t.endDateStr && !t.isMilestone) {
        t.duration = getDaysBetweenGanttDates(t.startDateStr, t.endDateStr);
      }
    });

  } else {
    // Mermaid fallback
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
          duration,
          dependencies: [],
          color: '',
          isMilestone: false
        });
      }
    });
  }

  if (sections.length === 0) sections.push(currentSection);
  return { title, sections, tasks };
};

export const serializeGantt = (title, sections, tasks) => {
  let out = `GANTT ${title || 'SophiaPath Development'}\n\n`;

  sections.forEach(sec => {
    out += `PROJECT ${sec}\n\n`;
    const secTasks = tasks.filter(t => t.section === sec);
    secTasks.forEach(t => {
      if (t.isMilestone || t.duration === 0) {
        out += `MILESTONE ${t.name}\n`;
        out += `DATE ${t.startDateStr || t.endDateStr || '2026-08-01'}\n`;
      } else {
        out += `TASK ${t.name}\n`;
        out += `START ${t.startDateStr || '2026-07-01'}\n`;
        out += `END ${t.endDateStr || '2026-07-05'}\n`;
        if (t.dependencies && t.dependencies.length > 0) {
          t.dependencies.forEach(dep => {
            out += `DEPENDS ON ${dep}\n`;
          });
        }
      }
      if (t.color) {
        out += `COLOR ${t.color}\n`;
      }
      if (t.status && t.status !== 'active' && t.status !== 'done') {
        out += `STATUS ${t.status}\n`;
      }
      out += '\n';
    });
  });

  return out.trim();
};

export const updateGanttTaskInCode = (prevCode, oldName, newProps) => {
  const { title, sections, tasks } = parseGantt(prevCode);
  const target = tasks.find(t => t.name === oldName);
  if (!target) return prevCode;

  if (newProps.name && newProps.name !== oldName) {
    tasks.forEach(t => {
      if (t.dependencies) {
        t.dependencies = t.dependencies.map(d => d === oldName ? newProps.name : d);
      }
    });
    target.name = newProps.name;
  }

  Object.assign(target, newProps);
  if (target.startDateStr && target.endDateStr && !target.isMilestone) {
    target.duration = getDaysBetweenGanttDates(target.startDateStr, target.endDateStr);
  }

  return serializeGantt(title, sections, tasks);
};

export const addGanttDependencyInCode = (prevCode, targetTaskName, sourceTaskName) => {
  if (targetTaskName === sourceTaskName) return prevCode;
  const { title, sections, tasks } = parseGantt(prevCode);
  const target = tasks.find(t => t.name === targetTaskName);
  if (!target) return prevCode;
  if (!target.dependencies) target.dependencies = [];
  if (!target.dependencies.includes(sourceTaskName)) {
    target.dependencies.push(sourceTaskName);
  }
  return serializeGantt(title, sections, tasks);
};

export const removeGanttDependencyInCode = (prevCode, taskName, depName) => {
  const { title, sections, tasks } = parseGantt(prevCode);
  const target = tasks.find(t => t.name === taskName);
  if (!target) return prevCode;
  if (target.dependencies) {
    target.dependencies = target.dependencies.filter(d => d !== depName);
  }
  return serializeGantt(title, sections, tasks);
};

export const deleteGanttTaskInCode = (prevCode, taskName) => {
  const { title, sections, tasks } = parseGantt(prevCode);
  const filteredTasks = tasks.filter(t => t.name !== taskName);
  filteredTasks.forEach(t => {
    if (t.dependencies) {
      t.dependencies = t.dependencies.filter(d => d !== taskName);
    }
  });
  return serializeGantt(title, sections, filteredTasks);
};

export const reorderGanttTasksInCode = (prevCode, sourceIdx, targetIdx) => {
  const { title, sections, tasks } = parseGantt(prevCode);
  if (sourceIdx < 0 || sourceIdx >= tasks.length || targetIdx < 0 || targetIdx >= tasks.length) return prevCode;
  const [moved] = tasks.splice(sourceIdx, 1);
  tasks.splice(targetIdx, 0, moved);
  return serializeGantt(title, sections, tasks);
};

export const insertGanttTaskAfterInCode = (prevCode, afterTaskName) => {
  const { title, sections, tasks } = parseGantt(prevCode);
  const idx = tasks.findIndex(t => t.name === afterTaskName);
  let afterTask = idx !== -1 ? tasks[idx] : (tasks[tasks.length - 1] || null);

  let newStart = '2026-08-01';
  let newEnd = '2026-08-07';
  let section = 'SophiaPath';
  if (afterTask) {
    section = afterTask.section;
    newStart = afterTask.endDateStr || afterTask.startDateStr || '2026-08-01';
    newEnd = addDaysToGanttDate(newStart, 5);
  }

  let baseName = 'New Task';
  let count = 1;
  let newName = baseName;
  while (tasks.some(t => t.name.toLowerCase() === newName.toLowerCase())) {
    count++;
    newName = `${baseName} ${count}`;
  }

  const nextColor = GANTT_PALETTE[tasks.length % GANTT_PALETTE.length].color;
  const newTask = {
    name: newName,
    section: section,
    status: '',
    startDateStr: newStart,
    endDateStr: newEnd,
    duration: 5,
    dependencies: afterTask && !afterTask.isMilestone ? [afterTask.name] : [],
    color: nextColor,
    isMilestone: false
  };

  if (idx !== -1) {
    tasks.splice(idx + 1, 0, newTask);
  } else {
    tasks.push(newTask);
  }

  return serializeGantt(title, sections, tasks);
};

export const insertGanttTaskInSectionInCode = (prevCode, sectionName) => {
  const { title, sections, tasks } = parseGantt(prevCode);
  const secTasks = tasks.filter(t => t.section === sectionName);
  const lastTask = secTasks.length > 0 ? secTasks[secTasks.length - 1] : null;
  return insertGanttTaskAfterInCode(prevCode, lastTask ? lastTask.name : (tasks[tasks.length - 1] ? tasks[tasks.length - 1].name : null));
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
      setZoomScale(key === 'activity' ? 0.9 : 1.0);
      setPreviewZoomScale(key === 'activity' ? 0.9 : 1.0);
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
  const [ganttViewScale, setGanttViewScale] = useState('months'); // 'days', 'weeks', 'months'

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

  // Zooming and Panning states (defaults to 0.9 for activity and 1.0 for others)
  const [zoomScale, setZoomScale] = useState(() => (initialTab === 'activity' ? 0.9 : 1.0));
  const [draggingNode, setDraggingNode] = useState(null);
  const [ganttWaypoints, setGanttWaypoints] = useState({});
  const [usecaseWaypoints, setUsecaseWaypoints] = useState({});
  const [draggingWaypoint, setDraggingWaypoint] = useState(null);

  // Use Case Interactive Drag-Connecting states
  const [usecaseConnecting, setUsecaseConnecting] = useState(null);
  const [isUseCaseRelDialogOpen, setIsUseCaseRelDialogOpen] = useState(false);
  const [pendingUseCaseRel, setPendingUseCaseRel] = useState({ sourceLabel: '', targetLabel: '', type: 'INCLUDE' });

  // Activity Diagram Interactive Drag-Connecting states
  const [activityConnecting, setActivityConnecting] = useState(null);
  const [isActTransitionDialogOpen, setIsActTransitionDialogOpen] = useState(false);
  const [pendingActTransition, setPendingActTransition] = useState({ sourceId: '', targetId: '', sourceLabel: '', targetLabel: '' });

  // Interactive Arrow / Connection Edit & Delete States (All Diagrams)
  const [editingERRel, setEditingERRel] = useState(null);
  const [editingUCLink, setEditingUCLink] = useState(null);
  const [editingActTrans, setEditingActTrans] = useState(null);
  const [editingActNode, setEditingActNode] = useState(null);
  const [editingSeqMsg, setEditingSeqMsg] = useState(null);
  const [editingGanttDep, setEditingGanttDep] = useState(null);

  // Gantt Chart Canva-Style Interactive States
  const [selectedGanttTask, setSelectedGanttTask] = useState(null);
  const [ganttDragState, setGanttDragState] = useState(null);
  const [ganttHoveredTask, setGanttHoveredTask] = useState(null);
  const [ganttInlineEditingTask, setGanttInlineEditingTask] = useState(null);
  const [ganttInlineEditingText, setGanttInlineEditingText] = useState('');

  // Preview Dialog states matching Java UML playground
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(themeMode || 'dark');
  const [previewZoomScale, setPreviewZoomScale] = useState(() => (initialTab === 'activity' ? 0.9 : 1.0));

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
  const hasDraggedNodeRef = useRef(false);
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
    setZoomScale(nextKey === 'activity' ? 0.9 : 1.0);
    setPreviewZoomScale(nextKey === 'activity' ? 0.9 : 1.0);
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

  // 5. Throttled Node card, waypoint, and Gantt dragging using requestAnimationFrame
  useEffect(() => {
    if (!draggingNode && !draggingWaypoint && !ganttDragState) return;

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
        } else if (ganttDragState) {
          const rect = canvasContainerRef.current?.getBoundingClientRect();
          const currentCanvasX = rect ? (canvasContainerRef.current.scrollLeft + (e.clientX - rect.left)) / zoomScale : e.clientX;
          const currentCanvasY = rect ? (canvasContainerRef.current.scrollTop + (e.clientY - rect.top)) / zoomScale : e.clientY;

          setGanttDragState(prev => {
            if (!prev) return null;
            return {
              ...prev,
              currentClientX: e.clientX,
              currentClientY: e.clientY,
              currentCanvasX,
              currentCanvasY
            };
          });
        }
      });
    };

    const handleMouseUp = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      setDraggingNode(null);
      setDraggingWaypoint(null);

      if (ganttDragState) {
        const { type, taskName, startClientX, currentClientX, origDuration, dayWidth, targetTaskName, sourceIndex, targetIndex } = ganttDragState;
        const curX = currentClientX !== undefined ? currentClientX : startClientX;
        const deltaX = curX - startClientX;
        const daysShift = Math.round(deltaX / (dayWidth * zoomScale));

        if (type === 'move' && daysShift !== 0) {
          const { tasks } = parseGantt(editorCode);
          const task = tasks.find(t => t.name === taskName);
          if (task) {
            if (task.isMilestone || task.duration === 0) {
              const newDate = addDaysToGanttDate(task.startDateStr, daysShift);
              setCode(prev => updateGanttTaskInCode(prev, taskName, { startDateStr: newDate, endDateStr: newDate }));
            } else {
              const newStart = addDaysToGanttDate(task.startDateStr, daysShift);
              const newEnd = addDaysToGanttDate(task.endDateStr, daysShift);
              setCode(prev => updateGanttTaskInCode(prev, taskName, { startDateStr: newStart, endDateStr: newEnd }));
            }
          }
        } else if (type === 'resize-right' && daysShift !== 0) {
          const { tasks } = parseGantt(editorCode);
          const task = tasks.find(t => t.name === taskName);
          if (task) {
            let newEnd = addDaysToGanttDate(task.endDateStr, daysShift);
            if (newEnd <= task.startDateStr) {
              newEnd = addDaysToGanttDate(task.startDateStr, 1);
            }
            const newDuration = getDaysBetweenGanttDates(task.startDateStr, newEnd);
            setCode(prev => updateGanttTaskInCode(prev, taskName, { endDateStr: newEnd, duration: newDuration }));
          }
        } else if (type === 'resize-left' && daysShift !== 0) {
          const { tasks } = parseGantt(editorCode);
          const task = tasks.find(t => t.name === taskName);
          if (task) {
            let newStart = addDaysToGanttDate(task.startDateStr, daysShift);
            if (newStart >= task.endDateStr) {
              newStart = addDaysToGanttDate(task.endDateStr, -1);
            }
            const newDuration = getDaysBetweenGanttDates(newStart, task.endDateStr);
            setCode(prev => updateGanttTaskInCode(prev, taskName, { startDateStr: newStart, duration: newDuration }));
          }
        } else if (type === 'connect') {
          if (targetTaskName && targetTaskName !== taskName) {
            setCode(prev => addGanttDependencyInCode(prev, targetTaskName, taskName));
          }
        } else if (type === 'reorder') {
          if (sourceIndex !== undefined && targetIndex !== undefined && sourceIndex !== targetIndex) {
            setCode(prev => reorderGanttTasksInCode(prev, sourceIndex, targetIndex));
          }
        }
        setGanttDragState(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [draggingNode, draggingWaypoint, ganttDragState, zoomScale, activeTabKey, editorCode]);

  // Escape key to exit fullscreen mode or cancel relationship selection
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (activityConnecting) {
          setActivityConnecting(null);
        } else if (usecaseConnecting) {
          setUsecaseConnecting(null);
        } else if (pendingRelationSource) {
          setPendingRelationSource(null);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, pendingRelationSource, usecaseConnecting, activityConnecting]);

  const addUseCaseRelationInCode = (srcLabel, tgtLabel, relType = 'assoc') => {
    const s = srcLabel ? srcLabel.trim() : '';
    const t = tgtLabel ? tgtLabel.trim() : '';
    if (!s || !t || s.toLowerCase() === t.toLowerCase()) return;

    let newLine = '';
    if (relType === 'INHERITS') {
      newLine = `${s} INHERITS ${t}`;
    } else if (relType === 'EXTEND' || relType === 'EXTENDS') {
      newLine = `${s} EXTENDS ${t}`;
    } else if (relType === 'INCLUDE' || relType === 'INCLUDES') {
      newLine = `${s} INCLUDES ${t}`;
    } else {
      newLine = `${s} -> ${t}`;
    }

    const sId = s.toLowerCase().replace(/\s+/g, '_');
    const tId = t.toLowerCase().replace(/\s+/g, '_');

    setCode(prev => {
      const lines = prev.split('\n');
      let replaced = false;

      const updated = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('%%') || trimmed.startsWith('#')) return line;

        // Check if this line is an association between s and t (in either direction)
        const assocMatch = trimmed.match(/^([A-Za-z0-9_\-\s]+)\s*->\s*([A-Za-z0-9_\-\s]+)$/i);
        if (assocMatch) {
          const lSrc = assocMatch[1].trim().toLowerCase().replace(/\s+/g, '_');
          const lTgt = assocMatch[2].trim().toLowerCase().replace(/\s+/g, '_');
          if ((lSrc === sId && lTgt === tId) || (lSrc === tId && lTgt === sId)) {
            if (!replaced) {
              replaced = true;
              return newLine;
            }
            return null; // Remove any extra duplicate lines
          }
        }

        // Check if this line is a keyword relationship between s and t (in either direction)
        const keyMatch = trimmed.match(/^([A-Za-z0-9_\-\s]+)\s+(EXTENDS|INCLUDES|EXTEND|INCLUDE|INHERITS)\s+([A-Za-z0-9_\-\s]+)$/i);
        if (keyMatch) {
          const lSrc = keyMatch[1].trim().toLowerCase().replace(/\s+/g, '_');
          const lTgt = keyMatch[3].trim().toLowerCase().replace(/\s+/g, '_');
          if ((lSrc === sId && lTgt === tId) || (lSrc === tId && lTgt === sId)) {
            if (!replaced) {
              replaced = true;
              return newLine;
            }
            return null; // Remove any extra duplicate lines
          }
        }

        return line;
      }).filter(line => line !== null);

      if (replaced) {
        return updated.join('\n');
      }

      return prev.trimEnd() + `\n${newLine}`;
    });
  };

  const handleStartUseCaseConnect = (e, nodeId, nodeLabel, nodeType, nodePos, offset) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = nodePos.x + offset.x;
    const startY = nodePos.y + offset.y;
    setUsecaseConnecting({
      sourceId: nodeId,
      sourceLabel: nodeLabel,
      sourceType: nodeType,
      startX: startX,
      startY: startY,
      currentX: startX,
      currentY: startY
    });
  };

  // Window listeners for live Use Case drag-connecting
  useEffect(() => {
    if (!usecaseConnecting) return;

    const handleMouseMove = (e) => {
      const canvasEl = document.getElementById('canvas-interactive-area');
      if (canvasEl) {
        const rect = canvasEl.getBoundingClientRect();
        setUsecaseConnecting(prev => prev ? ({
          ...prev,
          currentX: (e.clientX - rect.left + canvasEl.scrollLeft) / zoomScale,
          currentY: (e.clientY - rect.top + canvasEl.scrollTop) / zoomScale
        }) : null);
      }
    };

    const handleMouseUp = (e) => {
      const clientX = e.clientX;
      const clientY = e.clientY;

      let targetId = null;
      let targetType = null;
      let targetLabel = null;

      // Check Actor cards
      const actorCards = document.querySelectorAll('.usecase-actor-card');
      for (const card of actorCards) {
        const rect = card.getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
          const id = card.getAttribute('data-node-id');
          const label = card.getAttribute('data-node-label');
          if (id && id !== usecaseConnecting.sourceId) {
            targetId = id;
            targetType = 'actor';
            targetLabel = label || id;
            break;
          }
        }
      }

      // Check UseCase cards
      if (!targetId) {
        const ucCards = document.querySelectorAll('.usecase-bubble-card');
        for (const card of ucCards) {
          const rect = card.getBoundingClientRect();
          if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
            const id = card.getAttribute('data-node-id');
            const label = card.getAttribute('data-node-label');
            if (id && id !== usecaseConnecting.sourceId) {
              targetId = id;
              targetType = 'usecase';
              targetLabel = label || id;
              break;
            }
          }
        }
      }

      if (targetId && targetLabel) {
        const srcId = usecaseConnecting.sourceId;
        const srcType = usecaseConnecting.sourceType;
        const srcLabel = usecaseConnecting.sourceLabel || srcId;

        if (srcType === 'actor' && targetType === 'usecase') {
          // Actor -> UseCase
          addUseCaseRelationInCode(srcLabel, targetLabel, 'assoc');
        } else if (srcType === 'usecase' && targetType === 'actor') {
          // UseCase -> Actor (also Actor -> UseCase)
          addUseCaseRelationInCode(targetLabel, srcLabel, 'assoc');
        } else if (srcType === 'actor' && targetType === 'actor') {
          // Actor -> Actor: INHERITANCE (Generalization)
          addUseCaseRelationInCode(srcLabel, targetLabel, 'INHERITS');
        } else if (srcType === 'usecase' && targetType === 'usecase') {
          // UseCase -> UseCase: Open include vs extend dialog
          setPendingUseCaseRel({ sourceLabel: srcLabel, targetLabel: targetLabel, type: 'INCLUDE' });
          setIsUseCaseRelDialogOpen(true);
        }
      }

      setUsecaseConnecting(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [usecaseConnecting, zoomScale]);

  const addActivityTransitionInCode = (srcId, tgtId, guard = '') => {
    const s = srcId ? srcId.trim() : '';
    const t = tgtId ? tgtId.trim() : '';
    if (!s || !t || s === t) return;

    const guardStr = guard && guard.trim() ? ` [${guard.trim()}]` : '';
    const newLine = `${s} -> ${t}${guardStr}`;

    setCode(prev => {
      const lines = prev.split('\n');
      const alreadyExists = lines.some(l => {
        const trimmed = l.trim();
        return trimmed.toLowerCase().startsWith(`${s} -> ${t}`.toLowerCase());
      });
      if (alreadyExists) return prev;
      return prev.trimEnd() + `\n${newLine}`;
    });
  };

  const handleStartActivityConnect = (e, nodeId, nodeLabel, nodeType, nodePos, offset) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = nodePos.x + offset.x;
    const startY = nodePos.y + offset.y;
    setActivityConnecting({
      sourceId: nodeId,
      sourceLabel: nodeLabel || nodeId,
      sourceType: nodeType,
      startX: startX,
      startY: startY,
      currentX: startX,
      currentY: startY
    });
  };

  // Window listeners for live Activity Diagram drag-connecting
  useEffect(() => {
    if (!activityConnecting) return;

    const handleMouseMove = (e) => {
      const canvasEl = document.getElementById('canvas-interactive-area');
      if (canvasEl) {
        const rect = canvasEl.getBoundingClientRect();
        setActivityConnecting(prev => prev ? ({
          ...prev,
          currentX: (e.clientX - rect.left + canvasEl.scrollLeft) / zoomScale,
          currentY: (e.clientY - rect.top + canvasEl.scrollTop) / zoomScale
        }) : null);
      }
    };

    const handleMouseUp = (e) => {
      const clientX = e.clientX;
      const clientY = e.clientY;

      let targetId = null;
      let targetLabel = null;
      let targetType = null;

      const actCards = document.querySelectorAll('.activity-node-card');
      for (const card of actCards) {
        const rect = card.getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
          const id = card.getAttribute('data-act-node-id');
          const label = card.getAttribute('data-act-node-label');
          const type = card.getAttribute('data-act-node-type');
          if (id && id !== activityConnecting.sourceId) {
            targetId = id;
            targetLabel = label || id;
            targetType = type;
            break;
          }
        }
      }

      if (targetId && targetId !== activityConnecting.sourceId) {
        const srcId = activityConnecting.sourceId;
        const srcType = activityConnecting.sourceType;
        const srcLabel = activityConnecting.sourceLabel;

        if (srcType === 'decision') {
          setPendingActTransition({
            sourceId: srcId,
            targetId: targetId,
            sourceLabel: srcLabel,
            targetLabel: targetLabel
          });
          setIsActTransitionDialogOpen(true);
        } else {
          addActivityTransitionInCode(srcId, targetId);
        }
      }

      setActivityConnecting(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activityConnecting, zoomScale]);

  // 1. ER Relationship update & delete helpers
  const handleUpdateERRelationship = (oldRel, newSource, newSourceCard, newTarget, newTargetCard, newLabel) => {
    const relName = (newLabel && newLabel.trim()) ? newLabel.trim() : 'TO';
    const newLine = `RELATIONSHIP ${newSource} ${newSourceCard} ${relName} ${newTarget} ${newTargetCard}`;

    setCode(prev => {
      const lines = prev.split('\n');
      let replaced = false;
      const updated = lines.map(line => {
        const trimmed = line.trim();
        if (!replaced) {
          const match = trimmed.match(/^RELATIONSHIP\s+([A-Za-z0-9_-]+)\s+(ONE|MANY)\s+([A-Za-z0-9_-]+)\s+([A-Za-z0-9_-]+)\s+(ONE|MANY)/i);
          if (match) {
            const s = match[1];
            const t = match[4];
            if ((s.toLowerCase() === oldRel.source.toLowerCase() && t.toLowerCase() === oldRel.target.toLowerCase()) ||
                (s.toLowerCase() === oldRel.target.toLowerCase() && t.toLowerCase() === oldRel.source.toLowerCase())) {
              replaced = true;
              return newLine;
            }
          }
        }
        return line;
      });
      return updated.join('\n');
    });
  };

  const handleDeleteERRelationship = (rel) => {
    setCode(prev => {
      const lines = prev.split('\n');
      let deleted = false;
      const filtered = lines.filter(line => {
        const trimmed = line.trim();
        if (!deleted) {
          const match = trimmed.match(/^RELATIONSHIP\s+([A-Za-z0-9_-]+)\s+(ONE|MANY)\s+([A-Za-z0-9_-]+)\s+([A-Za-z0-9_-]+)\s+(ONE|MANY)/i);
          if (match) {
            const s = match[1];
            const t = match[4];
            if ((s.toLowerCase() === rel.source.toLowerCase() && t.toLowerCase() === rel.target.toLowerCase()) ||
                (s.toLowerCase() === rel.target.toLowerCase() && t.toLowerCase() === rel.source.toLowerCase())) {
              deleted = true;
              return false;
            }
          }
        }
        return true;
      });
      return filtered.join('\n');
    });
  };

  // 2. Use Case Link update & delete helpers
  const handleUpdateUseCaseLink = (oldLink, newSource, newTarget, newRelType) => {
    let newLine = '';
    if (newRelType === 'INHERITS') {
      newLine = `${newSource} INHERITS ${newTarget}`;
    } else if (newRelType === 'EXTEND' || newRelType === 'EXTENDS') {
      newLine = `${newSource} EXTENDS ${newTarget}`;
    } else if (newRelType === 'INCLUDE' || newRelType === 'INCLUDES') {
      newLine = `${newSource} INCLUDES ${newTarget}`;
    } else {
      newLine = `${newSource} -> ${newTarget}`;
    }

    const oldS = oldLink.source.toLowerCase().replace(/\s+/g, '_');
    const oldT = oldLink.target.toLowerCase().replace(/\s+/g, '_');
    const newS = newSource.toLowerCase().replace(/\s+/g, '_');
    const newT = newTarget.toLowerCase().replace(/\s+/g, '_');

    setCode(prev => {
      const lines = prev.split('\n');
      let replaced = false;

      const updated = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('%%') || trimmed.startsWith('#')) return line;

        const assocMatch = trimmed.match(/^([A-Za-z0-9_\-\s]+)\s*->\s*([A-Za-z0-9_\-\s]+)$/i);
        if (assocMatch) {
          const s = assocMatch[1].trim().toLowerCase().replace(/\s+/g, '_');
          const t = assocMatch[2].trim().toLowerCase().replace(/\s+/g, '_');
          const isOld = (s === oldS && t === oldT) || (s === oldT && t === oldS);
          const isNew = (s === newS && t === newT) || (s === newT && t === newS);
          if (isOld || isNew) {
            if (!replaced) {
              replaced = true;
              return newLine;
            }
            return null; // Strip duplicates
          }
        }

        const keywordMatch = trimmed.match(/^([A-Za-z0-9_\-\s]+)\s+(EXTENDS|INCLUDES|EXTEND|INCLUDE|INHERITS)\s+([A-Za-z0-9_\-\s]+)$/i);
        if (keywordMatch) {
          const s = keywordMatch[1].trim().toLowerCase().replace(/\s+/g, '_');
          const t = keywordMatch[3].trim().toLowerCase().replace(/\s+/g, '_');
          const isOld = (s === oldS && t === oldT) || (s === oldT && t === oldS);
          const isNew = (s === newS && t === newT) || (s === newT && t === newS);
          if (isOld || isNew) {
            if (!replaced) {
              replaced = true;
              return newLine;
            }
            return null; // Strip duplicates
          }
        }

        return line;
      }).filter(line => line !== null);

      if (replaced) {
        return updated.join('\n');
      }
      return prev.trimEnd() + `\n${newLine}`;
    });
  };

  const handleDeleteUseCaseLink = (oldLink) => {
    setCode(prev => {
      const lines = prev.split('\n');
      let deleted = false;
      const filtered = lines.filter(line => {
        const trimmed = line.trim();
        if (!deleted) {
          const assocMatch = trimmed.match(/^([A-Za-z0-9_\-\s]+)\s*->\s*([A-Za-z0-9_\-\s]+)$/i);
          if (assocMatch) {
            const s = assocMatch[1].trim().replace(/\s+/g, '_');
            const t = assocMatch[2].trim().replace(/\s+/g, '_');
            if ((s.toLowerCase() === oldLink.source.toLowerCase() && t.toLowerCase() === oldLink.target.toLowerCase()) ||
                (s.toLowerCase() === oldLink.target.toLowerCase() && t.toLowerCase() === oldLink.source.toLowerCase())) {
              deleted = true;
              return false;
            }
          }
          const keywordMatch = trimmed.match(/^([A-Za-z0-9_\-\s]+)\s+(EXTENDS|INCLUDES|EXTEND|INCLUDE|INHERITS)\s+([A-Za-z0-9_\-\s]+)$/i);
          if (keywordMatch) {
            const s = keywordMatch[1].trim().replace(/\s+/g, '_');
            const t = keywordMatch[3].trim().replace(/\s+/g, '_');
            if ((s.toLowerCase() === oldLink.source.toLowerCase() && t.toLowerCase() === oldLink.target.toLowerCase()) ||
                (s.toLowerCase() === oldLink.target.toLowerCase() && t.toLowerCase() === oldLink.source.toLowerCase())) {
              deleted = true;
              return false;
            }
          }
        }
        return true;
      });
      return filtered.join('\n');
    });
  };

  // 3. Activity Transition update & delete helpers
  const handleUpdateActivityTransition = (oldTrans, newSource, newTarget, newGuard) => {
    const guardStr = (newGuard && newGuard.trim()) ? ` [${newGuard.trim()}]` : '';
    const newLine = `${newSource} -> ${newTarget}${guardStr}`;

    setCode(prev => {
      const lines = prev.split('\n');
      let replaced = false;
      const updated = lines.map(line => {
        const trimmed = line.trim();
        if (!replaced) {
          const match = trimmed.match(/^([A-Za-z0-9_\-]+)\s*->\s*([A-Za-z0-9_\-]+)(?:\s*(?:\[([^\]]+)\]|:\s*(.+)))?$/i);
          if (match) {
            const s = match[1].trim();
            const t = match[2].trim();
            if (s.toLowerCase() === oldTrans.source.toLowerCase() && t.toLowerCase() === oldTrans.target.toLowerCase()) {
              replaced = true;
              return newLine;
            }
          }
        }
        return line;
      });
      return updated.join('\n');
    });
  };

  const handleDeleteActivityTransition = (oldTrans) => {
    setCode(prev => {
      const lines = prev.split('\n');
      let deleted = false;
      const filtered = lines.filter(line => {
        const trimmed = line.trim();
        if (!deleted) {
          const match = trimmed.match(/^([A-Za-z0-9_\-]+)\s*->\s*([A-Za-z0-9_\-]+)(?:\s*(?:\[([^\]]+)\]|:\s*(.+)))?$/i);
          if (match) {
            const s = match[1].trim();
            const t = match[2].trim();
            if (s.toLowerCase() === oldTrans.source.toLowerCase() && t.toLowerCase() === oldTrans.target.toLowerCase()) {
              deleted = true;
              return false;
            }
          }
        }
        return true;
      });
      return filtered.join('\n');
    });
  };

  const handleUpdateActivityNode = (oldNode, newProps) => {
    if (!oldNode) return;
    const oldId = oldNode.id;
    const newLabel = (newProps.label || oldNode.label || oldId).trim();
    const newType = (newProps.type || oldNode.type || 'ACTION').toUpperCase();
    const newPartition = newProps.partition !== undefined ? newProps.partition : oldNode.partition;

    setCode(prevCode => {
      const lines = prevCode.split('\n');
      let targetLineIdx = -1;

      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        const declMatch = trimmed.match(/^(START|END|FINAL|STOP|DECISION|CONDITION|MERGE|FORK|JOIN|ACTION|STEP)\s+([A-Za-z0-9_\-]+)(?:\s+(.+))?$/i);
        if (declMatch && declMatch[2].toLowerCase() === oldId.toLowerCase()) {
          targetLineIdx = i;
          break;
        }
      }

      const newLine = `${newType} ${oldId} "${newLabel}"`;

      if (targetLineIdx !== -1) {
        if (newPartition === oldNode.partition) {
          lines[targetLineIdx] = newLine;
          return lines.join('\n');
        } else {
          lines.splice(targetLineIdx, 1);
          if (newPartition) {
            let partIdx = -1;
            for (let i = 0; i < lines.length; i++) {
              const trimmed = lines[i].trim();
              const pMatch = trimmed.match(/^(?:SWIMLANE|PARTITION|ACTOR|LANE)\s+(.+)$/i);
              if (pMatch && pMatch[1].trim().toLowerCase() === newPartition.toLowerCase()) {
                partIdx = i;
                break;
              }
            }
            if (partIdx !== -1) {
              lines.splice(partIdx + 1, 0, newLine);
            } else {
              lines.push(`\nSWIMLANE ${newPartition}`);
              lines.push(newLine);
            }
          } else {
            lines.push(newLine);
          }
          return lines.join('\n');
        }
      } else {
        lines.push(newLine);
        return lines.join('\n');
      }
    });
    setEditingActNode(null);
  };

  const handleDeleteActivityNode = (nodeToDelete) => {
    if (!nodeToDelete) return;
    const delId = nodeToDelete.id;

    setCode(prevCode => {
      const lines = prevCode.split('\n');
      const filtered = lines.filter(line => {
        const trimmed = line.trim();
        if (!trimmed) return true;
        const declMatch = trimmed.match(/^(START|END|FINAL|STOP|DECISION|CONDITION|MERGE|FORK|JOIN|ACTION|STEP)\s+([A-Za-z0-9_\-]+)/i);
        if (declMatch && declMatch[2].toLowerCase() === delId.toLowerCase()) {
          return false;
        }
        const transMatch = trimmed.match(/^([A-Za-z0-9_\-]+)\s*->\s*([A-Za-z0-9_\-]+)/i);
        if (transMatch) {
          const s = transMatch[1].trim().toLowerCase();
          const t = transMatch[2].trim().toLowerCase();
          if (s === delId.toLowerCase() || t === delId.toLowerCase()) {
            return false;
          }
        }
        return true;
      });
      return filtered.join('\n');
    });

    setNodePositions(prev => {
      const next = { ...prev };
      delete next[delId];
      return next;
    });

    setEditingActNode(null);
  };

  // 4. Sequence Message update & delete helpers
  const handleUpdateSequenceMessage = (msgIndex, newSource, newTarget, newActionType, newLabel) => {
    const lbl = (newLabel && newLabel.trim()) ? newLabel.trim() : 'Message';
    let newLine = '';
    if (newActionType === 'requests') {
      newLine = `${newSource} requests "${lbl}" from ${newTarget}`;
    } else if (newActionType === 'returns') {
      newLine = `${newSource} returns "${lbl}" to ${newTarget}`;
    } else if (newActionType === 'displays') {
      newLine = `${newSource} displays "${lbl}" to ${newTarget}`;
    } else {
      newLine = `${newSource} sends "${lbl}" to ${newTarget}`;
    }

    setCode(prev => {
      const lines = prev.split('\n');
      let msgCounter = 0;
      const updated = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('%%') || trimmed.startsWith('#')) return line;
        if (trimmed.match(/^SEQUENCE\s+/i) || trimmed.match(/^PARTICIPANT\s+/i)) return line;

        if (msgCounter === msgIndex) {
          msgCounter++;
          return newLine;
        }
        msgCounter++;
        return line;
      });
      return updated.join('\n');
    });
  };

  const handleDeleteSequenceMessage = (msgIndex) => {
    setCode(prev => {
      const lines = prev.split('\n');
      let msgCounter = 0;
      const filtered = lines.filter(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('%%') || trimmed.startsWith('#')) return true;
        if (trimmed.match(/^SEQUENCE\s+/i) || trimmed.match(/^PARTICIPANT\s+/i)) return true;

        if (msgCounter === msgIndex) {
          msgCounter++;
          return false;
        }
        msgCounter++;
        return true;
      });
      return filtered.join('\n');
    });
  };

  // 5. Gantt Dependency update & delete helpers
  const handleUpdateGanttDependency = (oldFrom, oldTo, newFrom, newTo) => {
    setCode(prev => {
      let nextCode = removeGanttDependencyInCode(prev, oldTo, oldFrom);
      nextCode = addGanttDependencyInCode(nextCode, newTo, newFrom);
      return nextCode;
    });
  };

  const handleDeleteGanttDependency = (fromTask, toTask) => {
    setCode(prev => {
      return removeGanttDependencyInCode(prev, toTask, fromTask);
    });
  };

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
      const { nodes, transitions, partitions } = parseActivity(code);
      const autoPos = computeActivityAutoLayout(nodes, transitions, partitions);
      nodes.forEach(n => {
        const pos = nodePositions[n.id] || autoPos[n.id];
        if (pos) {
          if (pos.x + 200 + 100 > maxX) maxX = pos.x + 200 + 100;
          if (pos.y + 100 + 100 > maxY) maxY = pos.y + 100 + 100;
        }
      });
      if (partitions && partitions.length > 0) {
        let currentX = 40;
        partitions.forEach((partName) => {
          const partNodes = nodes.filter(n => (n.partition || partitions[0]) === partName);
          let maxNodeRight = currentX + 240;
          partNodes.forEach(n => {
            const p = nodePositions[n.id] || autoPos[n.id];
            if (p && p.x + 180 + 30 > maxNodeRight) {
              maxNodeRight = p.x + 180 + 30;
            }
          });
          currentX = Math.max(currentX + 240, maxNodeRight);
        });
        if (currentX + 100 > maxX) maxX = currentX + 100;
      }
    } else if (activeTabKey === 'sequence') {
      const { participants, messages } = parseSequence(code);
      maxX = Math.max(1200, participants.length * 220 + 200);
      maxY = Math.max(800, messages.length * 52 + 180);
    } else if (activeTabKey === 'gantt') {
      const { title: chartTitle, sections, tasks } = parseGantt(code);
      let earliestDate = new Date('2026-07-01');
      let latestDate = new Date('2026-08-31');
      let foundDate = false;
      
      tasks.forEach(task => {
        if (task.startDateStr) {
          const d = parseGanttDate(task.startDateStr);
          if (d && !isNaN(d.getTime())) {
            const endDate = new Date(d.getTime() + (task.duration || 1) * 24 * 60 * 60 * 1000);
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
      let numMonths = foundDate ? ((yEnd - yStart) * 12 + (mEnd - mStart) + 1) : 1;
      if (numMonths < 1) numMonths = 1;
      
      const monthWidth = ganttViewScale === 'days' ? 930 : ganttViewScale === 'months' ? 160 : 480;
      const leftPaneWidth = getGanttLeftPaneWidth(chartTitle, tasks);
      const rowHeight = 52;
      const showSectionHeader = (sec) => {
        if (sections.length > 1) {
          return sec && sec.trim().toLowerCase() !== (chartTitle || '').trim().toLowerCase();
        }
        return false;
      };

      let currentY = 70;
      sections.forEach((section) => {
        const sectionTasks = tasks.filter(t => t.section === section);
        if (showSectionHeader(section)) currentY += 24;
        currentY += sectionTasks.length * rowHeight;
        if (showSectionHeader(section)) currentY += 20;
      });

      maxX = leftPaneWidth + numMonths * monthWidth;
      maxY = Math.max(160, currentY + 30);
    }

    return { width: maxX, height: maxY };
  };

  const canvasDim = getCanvasDimensions();

  // Canvas background drag panning triggers
  const handleCanvasMouseDown = (e) => {
    if (
      e.target.closest('.se-node-card') ||
      e.target.closest('button') ||
      e.target.closest('.MuiSelect-select') ||
      e.target.closest('.gantt-top-selected-ribbon') ||
      e.target.closest('.gantt-dependency-group') ||
      e.target.closest('.gantt-bar-group') ||
      e.target.closest('.gantt-side-row') ||
      e.target.closest('.gantt-interactive-element') ||
      e.target.closest('.gantt-waypoint-handle') ||
      e.target.closest('input')
    ) {
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
      const hw = entityW / 2;
      const hh = entityH / 2;
      const rx = 42;
      const ry = 18;
      const gap = 14;

      validFields.forEach((f, idx) => {
        const attrKey = `${entityName}::attr::${f.name}`;
        const angle = -Math.PI / 2 + (2 * Math.PI * idx) / Math.max(1, numFields);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const absCos = Math.abs(cos) + 1e-6;
        const absSin = Math.abs(sin) + 1e-6;
        const dRect = Math.min(hw / absCos, hh / absSin);
        const rAttr = (rx * ry) / Math.sqrt((ry * cos) ** 2 + (rx * sin) ** 2);
        const dist = dRect + rAttr + gap;

        next[attrKey] = {
          x: Math.round(cx + dist * cos),
          y: Math.round(cy + dist * sin)
        };
      });

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
    const { tasks } = parseGantt(code);
    const color = GANTT_PALETTE[tasks.length % GANTT_PALETTE.length].color;
    let taskStr = `\n\nTASK ${name}\nSTART ${start}\nEND ${end}\nCOLOR ${color}`;
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
      const { systemName, actors, usecases, links } = parseUseCase(diagramCode);
      const autoPositions = computeUseCaseAutoLayout(actors, usecases, links, useCaseActorPlacement);
      let xs = [];
      let ys = [];

      actors.forEach((act, idx) => {
        const pos = nodePositions[act.id] || autoPositions[act.id] || { x: 100, y: idx * 180 + 150 };
        xs.push(pos.x);
        xs.push(pos.x + 76);
        ys.push(pos.y);
        ys.push(pos.y + 118);
      });

      let minUcX = Infinity;
      let maxUcX = -Infinity;
      let minUcY = Infinity;
      let maxUcY = -Infinity;

      usecases.forEach((uc, idx) => {
        const pos = nodePositions[uc.id] || autoPositions[uc.id] || { x: 420, y: idx * 110 + 100 };
        xs.push(pos.x);
        xs.push(pos.x + 200);
        ys.push(pos.y);
        ys.push(pos.y + 50);

        if (pos.x < minUcX) minUcX = pos.x;
        if (pos.x + 200 > maxUcX) maxUcX = pos.x + 200;
        if (pos.y < minUcY) minUcY = pos.y;
        if (pos.y + 50 > maxUcY) maxUcY = pos.y + 50;
      });

      if (usecases.length > 0) {
        const paddingLeft = 60;
        const paddingRight = 60;
        const paddingTop = 75;
        const paddingBottom = 60;

        let boxX = minUcX - paddingLeft;
        let boxY = minUcY - paddingTop;
        let boxWidth = (maxUcX + paddingRight) - boxX;
        let boxHeight = (maxUcY + paddingBottom) - boxY;

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

        xs.push(boxX, boxX + boxWidth);
        ys.push(boxY, boxY + boxHeight);
      }

      Object.values(usecaseWaypoints || {}).forEach(wp => {
        if (wp && typeof wp.x === 'number' && typeof wp.y === 'number') {
          xs.push(wp.x);
          ys.push(wp.y);
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
    else if (tabKey === 'activity') {
      const { nodes, transitions, partitions } = parseActivity(diagramCode);
      const autoPositions = computeActivityAutoLayout(nodes, transitions, partitions);
      let xs = [];
      let ys = [12];

      const nodeDim = (type) => {
        if (type === 'start' || type === 'end') return { w: 32, h: 32 };
        if (type === 'decision') return { w: 120, h: 56 };
        if (type === 'fork' || type === 'join') return { w: 140, h: 10 };
        return { w: 180, h: 48 };
      };

      if (partitions && partitions.length > 0) {
        let currentX = 30;
        xs.push(30);
        partitions.forEach((partName) => {
          const partNodes = nodes.filter(n => (n.partition || partitions[0]) === partName);
          let minX = Infinity;
          let maxX = -Infinity;
          partNodes.forEach(n => {
            const p = nodePositions[n.id] || autoPositions[n.id];
            const dim = nodeDim(n.type);
            if (p) {
              if (p.x < minX) minX = p.x;
              if (p.x + dim.w > maxX) maxX = p.x + dim.w;
            }
          });
          const xLeft = minX !== Infinity ? Math.min(currentX, minX - 35) : currentX;
          const partW = minX !== Infinity ? Math.max(260, (maxX - xLeft) + 35) : 260;
          const xRight = xLeft + partW;
          xs.push(xLeft);
          xs.push(xRight);
          currentX = xRight;
        });
      }

      nodes.forEach((n) => {
        const pos = nodePositions[n.id] || autoPositions[n.id] || { x: 300, y: 100 };
        const dim = nodeDim(n.type);
        xs.push(pos.x);
        xs.push(pos.x + dim.w);
        ys.push(pos.y);
        ys.push(pos.y + dim.h + 60);
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
      const diagWidth = Math.max(800, participants.length * 260 + 200);
      const diagHeight = Math.max(500, messages.length * 52 + 180);
      return {
        x: 0,
        y: 0,
        width: diagWidth,
        height: diagHeight
      };
    }
    else if (tabKey === 'gantt') {
      const { title: chartTitle, sections, tasks } = parseGantt(diagramCode);
      const monthWidth = ganttViewScale === 'days' ? 930 : ganttViewScale === 'months' ? 160 : 480;
      const leftPaneWidth = getGanttLeftPaneWidth(chartTitle, tasks);
      const rowHeight = 52;

      let earliestDate = new Date('2026-07-01');
      let latestDate = new Date('2026-08-31');
      let foundDate = false;

      tasks.forEach(task => {
        if (task.startDateStr) {
          const d = parseGanttDate(task.startDateStr);
          if (d && !isNaN(d.getTime())) {
            const endDate = new Date(d.getTime() + (task.duration || 1) * 24 * 60 * 60 * 1000);
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
      let numMonths = foundDate ? ((yEnd - yStart) * 12 + (mEnd - mStart) + 1) : 1;
      if (numMonths < 1) numMonths = 1;

      const svgWidth = leftPaneWidth + numMonths * monthWidth;

      const showSectionHeader = (sec) => {
        if (sections.length > 1) {
          return sec && sec.trim().toLowerCase() !== (chartTitle || '').trim().toLowerCase();
        }
        return false;
      };

      let currentY = 70;
      sections.forEach((section) => {
        const sectionTasks = tasks.filter(t => t.section === section);
        if (showSectionHeader(section)) currentY += 24;
        currentY += sectionTasks.length * rowHeight;
        if (showSectionHeader(section)) currentY += 20;
      });

      const totalHeight = Math.max(160, currentY + 30);

      return {
        x: 0,
        y: 0,
        width: svgWidth,
        height: totalHeight
      };
    }

    if (hasCoords) {
      const padding = 30;
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
    const isFullSvgDoc = tabKey === 'gantt' || tabKey === 'sequence';
    const padding = isFullSvgDoc ? 0 : 40;
    const x = isFullSvgDoc ? 0 : Math.max(0, bounds.x - padding);
    const y = isFullSvgDoc ? 0 : Math.max(0, bounds.y - padding);
    const width = isFullSvgDoc ? bounds.width : bounds.width + padding * 2;
    const height = isFullSvgDoc ? bounds.height : bounds.height + padding * 2;

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
        if (type === 'start' || type === 'end') return { w: 32, h: 32 };
        if (type === 'decision') return { w: 120, h: 56 };
        if (type === 'fork' || type === 'join') return { w: 140, h: 10 };
        return { w: 180, h: 46 };
      };

      let maxY = 450;
      nodes.forEach(n => {
        const p = activePositions[n.id] || autoPos[n.id] || { x: 300, y: 70 };
        const dim = nodeDim(n.type);
        if (p && p.y + dim.h + 60 > maxY) maxY = p.y + dim.h + 60;
      });

      const partBounds = [];
      if (hasPartitions) {
        let currentX = 30;
        partitions.forEach((partName, pIdx) => {
          const partNodes = nodes.filter(n => (n.partition || partitions[0]) === partName);
          let minX = Infinity;
          let maxX = -Infinity;
          partNodes.forEach(n => {
            const p = activePositions[n.id] || autoPos[n.id];
            const dim = nodeDim(n.type);
            if (p) {
              if (p.x < minX) minX = p.x;
              if (p.x + dim.w > maxX) maxX = p.x + dim.w;
            }
          });
          const xLeft = minX !== Infinity ? Math.min(currentX, minX - 35) : currentX;
          const partW = minX !== Infinity ? Math.max(260, (maxX - xLeft) + 35) : 260;
          const xRight = xLeft + partW;
          partBounds.push({ xLeft, xRight, width: partW, xCenter: xLeft + partW / 2, partName });
          currentX = xRight;
        });
      }

      // 1. Swimlane headers and dividers
      let swimlanesSvg = '';
      if (hasPartitions) {
        swimlanesSvg = `<g id="export-activity-swimlanes">` + partBounds.map((pb, pIdx) => `
          <rect x="${pb.xLeft + 6}" y="12" width="${pb.width - 12}" height="36" rx="8" fill="${bgPaper}" stroke="${primaryMain}" stroke-width="1.5" />
          <text x="${pb.xCenter}" y="30" text-anchor="middle" dominant-baseline="central" fill="${primaryMain}" font-size="13" font-weight="800" font-family="'Outfit', sans-serif" letter-spacing="0.06em">${escapeXml(pb.partName.toUpperCase())}</text>
          <line x1="${pb.xLeft}" y1="12" x2="${pb.xLeft}" y2="${maxY}" stroke="${primaryMain}" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="${pIdx === 0 ? 'none' : '4,4'}" />
          ${pIdx === partBounds.length - 1 ? `<line x1="${pb.xRight}" y1="12" x2="${pb.xRight}" y2="${maxY}" stroke="${primaryMain}" stroke-opacity="0.35" stroke-width="2" />` : ''}
        `).join('') + `</g>`;
      }

      // 2. Transitions
      const transitionsSvg = `<g id="export-activity-transitions">` + (transitions || []).map((t, idx) => {
        const srcNode = nodes.find(n => n.id === t.source);
        const tgtNode = nodes.find(n => n.id === t.target);
        if (!srcNode || !tgtNode) return '';

        const rawP1 = activePositions[t.source] || autoPos[t.source];
        const rawP2 = activePositions[t.target] || autoPos[t.target];
        const p1 = { x: rawP1 && Number.isFinite(rawP1.x) ? rawP1.x : 300, y: rawP1 && Number.isFinite(rawP1.y) ? rawP1.y : 80 };
        const p2 = { x: rawP2 && Number.isFinite(rawP2.x) ? rawP2.x : 300, y: rawP2 && Number.isFinite(rawP2.y) ? rawP2.y : 180 };

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
          const loopX = Math.max(p1.x + dim1.w, p2.x + dim2.w) + 45;
          const r = 10;
          pathD = `M ${startX} ${startY} H ${loopX - r} Q ${loopX} ${startY} ${loopX} ${startY - r} V ${endY + r} Q ${loopX} ${endY} ${loopX - r} ${endY} H ${endX}`;
          midX = loopX;
          midY = (startY + endY) / 2;
        } else if (Math.abs(dy) < 30 && Math.abs(dx) > 30) {
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
        } else if (srcNode.type === 'decision' && Math.abs(dx) > 50) {
          const startX = dx > 0 ? p1.x + dim1.w : p1.x;
          const startY = srcCenter.y;
          const endX = tgtCenter.x;
          const endY = p2.y;
          const r = 10;
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

          if (Math.abs(startX - endX) < 6) {
            pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
            midX = startX;
            midY = (startY + endY) / 2;
          } else {
            const r = 10;
            const stepY = startY + Math.min(22, Math.max(12, (endY - startY) * 0.42));
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
            <path d="${pathD}" fill="none" stroke="${primaryMain}" stroke-width="1.75" marker-end="url(#activity-arrow)" />
            ${t.guard ? `
              <g transform="translate(${midX}, ${midY})">
                <rect x="${-((t.guard.length * 6.5 + 14) / 2)}" y="-9" width="${t.guard.length * 6.5 + 14}" height="18" rx="9" fill="${bgPaper}" stroke="${divider}" stroke-width="1" />
                <text x="0" y="0" text-anchor="middle" dominant-baseline="central" fill="${textSecondary}" font-size="9" font-weight="700" font-family="'Outfit', sans-serif">[${escapeXml(t.guard)}]</text>
              </g>
            ` : ''}
          </g>
        `;
      }).join('') + `</g>`;

      // 3. Nodes
      const nodesSvg = `<g id="export-activity-nodes">` + nodes.map((node, idx) => {
        const p = activePositions[node.id] || autoPos[node.id] || { x: 300, y: idx * 80 + 70 };

        if (node.type === 'start') {
          const cx = p.x + 16;
          const cy = p.y + 16;
          return `
            <circle cx="${cx}" cy="${cy}" r="14" fill="#10B981" />
            <circle cx="${cx}" cy="${cy}" r="5" fill="${bgDefault}" />
          `;
        }
        if (node.type === 'end') {
          const cx = p.x + 16;
          const cy = p.y + 16;
          return `
            <circle cx="${cx}" cy="${cy}" r="14" fill="${bgPaper}" stroke="#EF4444" stroke-width="2" />
            <circle cx="${cx}" cy="${cy}" r="8" fill="#EF4444" />
          `;
        }
        if (node.type === 'fork' || node.type === 'join') {
          return `<rect x="${p.x}" y="${p.y}" width="140" height="10" rx="5" fill="${primaryMain}" />`;
        }
        if (node.type === 'decision') {
          const cx = p.x + 60;
          const cy = p.y + 28;
          const textSvg = renderCenteredTextLines(node.label, cx, cy, 95, { fontSize: 10, lineHeight: 12, fontWeight: 800 });
          return `
            <g id="decision-${node.id}">
              <polygon points="${cx},${p.y} ${p.x + 120},${cy} ${cx},${p.y + 56} ${p.x},${cy}" fill="${bgPaper}" stroke="${primaryMain}" stroke-width="1.5" />
              ${textSvg}
            </g>
          `;
        }
        // Action card
        const cx = p.x + 90;
        const cy = p.y + 23;
        const textSvg = renderCenteredTextLines(node.label, cx, cy, 160, { fontSize: 12, lineHeight: 15, fontWeight: 700 });
        return `
          <g id="action-${node.id}">
            <rect x="${p.x}" y="${p.y}" width="180" height="46" rx="12" fill="${bgPaper}" stroke="${primaryMain}" stroke-width="1.5" />
            ${textSvg}
          </g>
        `;
      }).join('') + `</g>`;

      innerSvgContent = swimlanesSvg + transitionsSvg + nodesSvg;
    } else if (tabKey === 'usecase') {
      const { systemName, actors, usecases, links } = parseUseCase(diagramCode);
      const autoPos = computeUseCaseAutoLayout(actors, usecases, links, useCaseActorPlacement);

      // 1. Calculate dynamic system boundary box
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
          const coord = activePositions[uc.id] || autoPos[uc.id] || { x: 420, y: idx * 110 + 100 };
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

      const systemBoundarySvg = `
        <rect x="${boxX}" y="${boxY}" width="${boxWidth}" height="${boxHeight}" rx="16" fill="${bgPaper}" fill-opacity="${activeTheme === 'dark' ? '0.04' : '0.02'}" stroke="${primaryMain}" stroke-width="1.5" />
        <text x="${boxX + boxWidth / 2}" y="${boxY + 25}" text-anchor="middle" dominant-baseline="central" fill="${textSecondary}" font-size="13" font-weight="bold" font-family="'Outfit', sans-serif" letter-spacing="0.05em">${escapeXml(systemName ? systemName.toUpperCase() : 'SYSTEM BOUNDARY')}</text>
      `;

      // 2. Render all links using precise connection anchor routing matching the live canvas
      const linksSvg = `<g id="export-usecase-links">` + (links || []).map(link => {
        const start = activePositions[link.source] || autoPos[link.source];
        const end = activePositions[link.target] || autoPos[link.target];
        if (!start || !end) return '';

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
        const wp = usecaseWaypoints ? usecaseWaypoints[wpKey] : null;
        const cx = wp ? wp.x : (x1 + x2) / 2;
        const cy = wp ? wp.y : (y1 + y2) / 2;

        const pathD = wp ? `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}` : `M ${x1} ${y1} L ${x2} ${y2}`;

        let strokeColor = primaryMain;
        let strokeDasharray = 'none';
        let markerEnd = 'none';

        if (isExtendInclude) {
          strokeColor = '#00FFCC';
          strokeDasharray = '5,5';
          markerEnd = 'url(#usecase-arrow)';
        } else if (isInherits) {
          markerEnd = 'url(#usecase-generalization-arrow)';
        }

        let labelSvg = '';
        if (isExtendInclude) {
          labelSvg = `
            <g>
              <rect x="${cx - 38}" y="${cy - 9}" width="76" height="18" rx="4" fill="${bgDefault}" stroke="${divider || 'rgba(255,255,255,0.15)'}" stroke-width="1" />
              <text x="${cx}" y="${cy}" fill="#00FFCC" font-size="9" font-weight="bold" font-family="'Outfit', sans-serif" text-anchor="middle" dominant-baseline="central">${link.label === 'EXTEND' ? '&lt;&lt;extend&gt;&gt;' : '&lt;&lt;include&gt;&gt;'}</text>
            </g>
          `;
        }

        return `
          <g>
            <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="1.5" stroke-dasharray="${strokeDasharray}" marker-end="${markerEnd}" />
            ${labelSvg}
          </g>
        `;
      }).join('') + `</g>`;

      // 3. Render Use Case Bubbles (rounded pills matching on-screen)
      const usecasesSvg = `<g id="export-usecases">` + usecases.map((uc, idx) => {
        const p = activePositions[uc.id] || autoPos[uc.id] || { x: 420, y: idx * 110 + 100 };
        const cx = p.x + 100;
        const cy = p.y + 25;
        const textSvg = renderCenteredTextLines(uc.label || uc.name, cx, cy, 180, { fontSize: 12, lineHeight: 15, fontWeight: 700 });
        return `
          <g id="uc-${uc.id}">
            <rect x="${p.x}" y="${p.y}" width="200" height="50" rx="25" fill="${bgPaper}" stroke="${primaryMain}" stroke-width="2" />
            ${textSvg}
          </g>
        `;
      }).join('') + `</g>`;

      // 4. Render Actors (stick figures matching on-screen exact geometry)
      const actorsSvg = `<g id="export-actors">` + actors.map((act, idx) => {
        const p = activePositions[act.id] || autoPos[act.id] || { x: 100, y: idx * 180 + 150 };
        const cx = p.x + 38;
        const headCy = p.y + 15;
        const textSvg = renderCenteredTextLines(act.label || act.name, cx, p.y + 98, 74, { fontSize: 11, lineHeight: 13, fontWeight: 700 });
        return `
          <g id="act-${act.id}">
            <circle cx="${cx}" cy="${headCy}" r="12" fill="${bgPaper}" stroke="${primaryMain}" stroke-width="3" />
            <line x1="${cx}" y1="${headCy + 12}" x2="${cx}" y2="${headCy + 43}" stroke="${primaryMain}" stroke-width="3" />
            <line x1="${cx - 20}" y1="${headCy + 21}" x2="${cx + 20}" y2="${headCy + 21}" stroke="${primaryMain}" stroke-width="3" />
            <line x1="${cx}" y1="${headCy + 43}" x2="${cx - 15}" y2="${headCy + 68}" stroke="${primaryMain}" stroke-width="3" />
            <line x1="${cx}" y1="${headCy + 43}" x2="${cx + 15}" y2="${headCy + 68}" stroke="${primaryMain}" stroke-width="3" />
            ${textSvg}
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

      let erLinesSvg = `<g id="export-er-lines">`;
      entities.forEach(entity => {
        const entW = getEntityWidth(entity.name);
        const p = activePositions[entity.name] || autoPos[entity.name] || { x: 120, y: 100 };
        const cx = p.x + entW / 2;
        const cy = p.y + 25;
        (entity.fields || []).forEach(f => {
          const attrKey = `${entity.name}::attr::${f.name}`;
          const attrPos = activePositions[attrKey] || autoPos[attrKey];
          if (attrPos) {
            erLinesSvg += `<line x1="${cx}" y1="${cy}" x2="${attrPos.x}" y2="${attrPos.y}" stroke="${divider}" stroke-width="1.5" />`;
          }
        });
      });

      relationships.forEach(rel => {
        const start = activePositions[rel.source] || autoPos[rel.source] || { x: 80, y: 80 };
        const end = activePositions[rel.target] || autoPos[rel.target] || { x: 320, y: 80 };
        const w1 = getEntityWidth(rel.source);
        const w2 = getEntityWidth(rel.target);
        const relKey = `${rel.source}::rel::${rel.target}`;
        const relPos = activePositions[relKey] || autoPos[relKey];
        if (relPos) {
          const mx = relPos.x;
          const my = relPos.y;
          const markerStart = rel.sourceCard === 'MANY' ? 'url(#crow-foot-many)' : 'url(#crow-foot-one)';
          const markerEnd = rel.targetCard === 'MANY' ? 'url(#crow-foot-many)' : 'url(#crow-foot-one)';
          erLinesSvg += `
            <line x1="${start.x + w1 / 2}" y1="${start.y + 25}" x2="${mx}" y2="${my}" stroke="${primaryMain}" stroke-width="1.8" marker-start="${markerStart}" />
            <line x1="${mx}" y1="${my}" x2="${end.x + w2 / 2}" y2="${end.y + 25}" stroke="${primaryMain}" stroke-width="1.8" marker-end="${markerEnd}" />
          `;
        }
      });
      erLinesSvg += `</g>`;

      innerSvgContent = erLinesSvg + entitiesSvg + attributesSvg + relsSvg;
    } else if (tabKey === 'sequence') {
      const { title: seqTitle, participants, messages } = parseSequence(diagramCode);
      const lifelines = {};
      participants.forEach((part, idx) => {
        lifelines[part.id] = idx * 260 + 160;
      });

      const diagWidth = bounds.width || Math.max(800, participants.length * 260 + 200);
      const diagHeight = bounds.height || Math.max(500, messages.length * 52 + 180);

      const lifelinesSvg = participants.map((part, idx) => {
        const lx = lifelines[part.id];
        return `
          <g>
            <line x1="${lx}" y1="80" x2="${lx}" y2="${diagHeight - 60}" stroke="${divider}" stroke-width="2" stroke-dasharray="6,6" />
            <rect x="${lx - 90}" y="50" width="180" height="46" rx="8" fill="${bgPaper}" stroke="${primaryMain}" stroke-width="2" />
            <text x="${lx}" y="77" fill="${textPrimary}" font-size="15" font-weight="bold" font-family="'Outfit', sans-serif" text-anchor="middle">${escapeXml(part.label)}</text>
            <rect x="${lx - 90}" y="${diagHeight - 50}" width="180" height="46" rx="8" fill="${bgPaper}" stroke="${primaryMain}" stroke-width="2" />
            <text x="${lx}" y="${diagHeight - 23}" fill="${textPrimary}" font-size="15" font-weight="bold" font-family="'Outfit', sans-serif" text-anchor="middle">${escapeXml(part.label)}</text>
          </g>
        `;
      }).join('\n');

      const messagesSvg = messages.map((msg, idx) => {
        const my = idx * 52 + 120;
        if (msg.type === 'control') {
          const startX = 50;
          const endX = participants.length * 260 + 50;
          return `
            <g>
              <line x1="${startX}" y1="${my}" x2="${endX}" y2="${my}" stroke="${primaryMain}" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.6" />
              <rect x="${startX + 20}" y="${my - 12}" width="270" height="24" rx="6" fill="${bgPaper}" stroke="${primaryMain}" stroke-width="1" />
              <text x="${startX + 32}" y="${my + 5}" fill="${primaryMain}" font-size="13" font-weight="bold" font-family="'Outfit', sans-serif">${escapeXml(msg.label)}</text>
            </g>
          `;
        }

        const x1 = lifelines[msg.source];
        const x2 = lifelines[msg.target];
        if (!x1 || !x2) return '';
        const isResponseOrDisplay = msg.type === 'return' || msg.type === 'display';

        const arrowPoints = x2 > x1 ? `${x2},${my} ${x2 - 8},${my - 4} ${x2 - 8},${my + 4}` : `${x2},${my} ${x2 + 8},${my - 4} ${x2 + 8},${my + 4}`;
        const arrowColor = isResponseOrDisplay ? primaryMain : textPrimary;

        return `
          <g>
            <line x1="${x1}" y1="${my}" x2="${x2}" y2="${my}" stroke="${arrowColor}" stroke-width="1.5" stroke-dasharray="${isResponseOrDisplay ? '4,4' : 'none'}" />
            <polygon points="${arrowPoints}" fill="${arrowColor}" />
            <text x="${(x1 + x2) / 2}" y="${my - 8}" fill="${arrowColor}" font-size="14" font-weight="600" font-family="'Outfit', sans-serif" text-anchor="middle">${escapeXml(msg.label)}</text>
          </g>
        `;
      }).join('\n');

      innerSvgContent = `
        <text x="30" y="30" fill="${primaryMain}" font-size="16" font-weight="bold" font-family="'Outfit', sans-serif">🎬 ${escapeXml(seqTitle || 'Sequence Diagram')}</text>
        ${lifelinesSvg}
        ${messagesSvg}
      `;
    } else if (tabKey === 'gantt') {
      const { title: chartTitle, sections, tasks } = parseGantt(diagramCode);
      const monthWidth = ganttViewScale === 'days' ? 930 : ganttViewScale === 'months' ? 160 : 480;
      const dayWidth = monthWidth / 31;
      const rowHeight = 52;
      const leftPaneWidth = getGanttLeftPaneWidth(chartTitle, tasks);

      let earliestDate = new Date('2026-07-01');
      let latestDate = new Date('2026-08-31');
      let foundDate = false;

      tasks.forEach(task => {
        if (task.startDateStr) {
          const d = parseGanttDate(task.startDateStr);
          if (d && !isNaN(d.getTime())) {
            const endDate = new Date(d.getTime() + (task.duration || 1) * 24 * 60 * 60 * 1000);
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
      let numMonths = foundDate ? ((yEnd - yStart) * 12 + (mEnd - mStart) + 1) : 1;
      if (numMonths < 1) numMonths = 1;

      const svgWidth = leftPaneWidth + numMonths * monthWidth;

      const showSectionHeader = (sec) => {
        if (sections.length > 1) {
          return sec && sec.trim().toLowerCase() !== (chartTitle || '').trim().toLowerCase();
        }
        return false;
      };

      let globalTaskIndex = 0;
      let currentY = 70;
      const taskLayoutMap = {};

      sections.forEach((section, secIdx) => {
        const sectionTasks = tasks.filter(t => t.section === section);
        if (showSectionHeader(section)) {
          currentY += 24;
        }

        sectionTasks.forEach((task, taskIdx) => {
          const taskY = currentY;
          let taskWidth = Math.max(16, (task.duration || 1) * dayWidth);
          let taskX = leftPaneWidth;

          if (task.startDateStr) {
            const tDate = parseGanttDate(task.startDateStr);
            if (tDate && !isNaN(tDate.getTime())) {
              const m = tDate.getMonth();
              const yr = tDate.getFullYear();
              const d = tDate.getDate();
              const monthDiff = (yr - yStart) * 12 + (m - mStart);
              if (monthDiff >= 0 && monthDiff < numMonths) {
                taskX = leftPaneWidth + monthDiff * monthWidth + (d - 1) * dayWidth;
              } else if (monthDiff < 0) {
                taskX = leftPaneWidth;
              } else {
                taskX = svgWidth - 40;
              }
            }
          }

          taskLayoutMap[task.name] = {
            x: taskX,
            y: taskY,
            width: taskWidth,
            globalIndex: globalTaskIndex,
            sectionIndex: secIdx,
            taskIndex: taskIdx
          };

          globalTaskIndex++;
          currentY += rowHeight;
        });
        if (showSectionHeader(section)) {
          currentY += 20;
        }
      });

      const totalHeight = Math.max(160, currentY + 30);

      const monthLabelsSvg = Array.from({ length: numMonths }).map((_, idx) => {
        const m = (mStart + idx) % 12;
        const yr = yStart + Math.floor((mStart + idx) / 12);
        const mx = leftPaneWidth + idx * monthWidth + monthWidth / 2;
        const my = ganttViewScale === 'months' ? 31 : 20;
        return `<text x="${mx}" y="${my}" fill="${textPrimary}" font-size="${ganttViewScale === 'months' ? 13 : 12}" font-weight="bold" font-family="'Outfit', sans-serif" text-anchor="middle">${monthNames[m]} ${yr}</text>`;
      }).join('\n');

      let subHeadersSvg = '';
      if (ganttViewScale === 'weeks') {
        subHeadersSvg = Array.from({ length: numMonths }).map((_, mIdx) => {
          const m = (mStart + mIdx) % 12;
          return Array.from({ length: 4 }).map((_, wIdx) => {
            const wx = leftPaneWidth + mIdx * monthWidth + wIdx * (monthWidth / 4) + (monthWidth / 8);
            const wLabel = getWeekLabel(m, wIdx);
            return `<text x="${wx}" y="40" text-anchor="middle" font-size="11" font-weight="bold" font-family="'Outfit', sans-serif"><tspan fill="${textPrimary}">W${mIdx * 4 + wIdx + 1}</tspan><tspan fill="${primaryMain}" dx="4">(${wLabel})</tspan></text>`;
          }).join('\n');
        }).join('\n');
      } else if (ganttViewScale === 'days') {
        subHeadersSvg = Array.from({ length: numMonths }).map((_, mIdx) => {
          return Array.from({ length: 31 }).map((_, dIdx) => {
            const dx = leftPaneWidth + mIdx * monthWidth + dIdx * dayWidth + dayWidth / 2;
            return `<text x="${dx}" y="40" text-anchor="middle" fill="${textPrimary}" font-size="9" font-weight="600" font-family="'Outfit', sans-serif">${dIdx + 1}</text>`;
          }).join('\n');
        }).join('\n');
      }

      const vDividersSvg = Array.from({ length: numMonths + 1 }).map((_, idx) => {
        const vx = leftPaneWidth + idx * monthWidth;
        return `<line x1="${vx}" y1="52" x2="${vx}" y2="${totalHeight - 30}" stroke="${divider}" stroke-opacity="0.6" stroke-width="1.5" />`;
      }).join('\n');

      let gridLinesSvg = '';
      if (ganttViewScale === 'weeks') {
        gridLinesSvg = Array.from({ length: numMonths }).map((_, mIdx) => {
          return [1, 2, 3].map(wIdx => {
            const gx = leftPaneWidth + mIdx * monthWidth + wIdx * (monthWidth / 4);
            return `<line x1="${gx}" y1="52" x2="${gx}" y2="${totalHeight - 30}" stroke="${divider}" stroke-opacity="0.3" stroke-dasharray="2,4" />`;
          }).join('\n');
        }).join('\n');
      } else if (ganttViewScale === 'days') {
        gridLinesSvg = Array.from({ length: numMonths }).map((_, mIdx) => {
          return Array.from({ length: 30 }).map((_, dIdx) => {
            const gx = leftPaneWidth + mIdx * monthWidth + (dIdx + 1) * dayWidth;
            return `<line x1="${gx}" y1="52" x2="${gx}" y2="${totalHeight - 30}" stroke="${divider}" stroke-opacity="0.15" stroke-dasharray="2,4" />`;
          }).join('\n');
        }).join('\n');
      }

      const dependenciesSvg = tasks.map((task) => {
        if (!task.dependencies || task.dependencies.length === 0) return '';
        const layout = taskLayoutMap[task.name];
        if (!layout) return '';

        return task.dependencies.map((depName) => {
          const depTask = tasks.find(pt => pt.name === depName);
          const depLayout = taskLayoutMap[depName];
          if (!depTask || !depLayout) return '';

          const pathInfo = computeGanttDependencyPath(
            depTask,
            depLayout,
            task,
            layout,
            tasks,
            taskLayoutMap,
            leftPaneWidth,
            ganttWaypoints
          );

          return `
            <g class="gantt-dep">
              <path d="${pathInfo.d}" fill="none" stroke="${primaryMain}" stroke-width="2.2" stroke-linecap="round" />
              <polygon points="${pathInfo.arrowTipX},${pathInfo.yEnd} ${pathInfo.arrowBaseX},${pathInfo.yEnd - 4.5} ${pathInfo.arrowBaseX},${pathInfo.yEnd + 4.5}" fill="${primaryMain}" />
            </g>
          `;
        }).join('');
      }).join('');

      const sectionsAndTasksSvg = sections.map((section) => {
        const sectionTasks = tasks.filter(t => t.section === section);
        const firstTaskLayout = sectionTasks.length > 0 ? taskLayoutMap[sectionTasks[0].name] : null;
        const sectionHeaderY = firstTaskLayout ? firstTaskLayout.y - 20 : 70;
        const isSecVisible = showSectionHeader(section);

        const secHeaderSvg = isSecVisible ? `
          <text x="24" y="${sectionHeaderY}" fill="${primaryMain}" font-size="12" font-weight="800" font-family="'Outfit', sans-serif" letter-spacing="0.08em" text-transform="uppercase">📂 ${escapeXml(section)}</text>
        ` : '';

        const tasksSvg = sectionTasks.map((task, taskIdx) => {
          const layout = taskLayoutMap[task.name];
          if (!layout) return '';

          const y = layout.y;
          const width = layout.width;
          const x = layout.x;

          const paletteEntry = GANTT_PALETTE[layout.globalIndex % GANTT_PALETTE.length];
          let barColor = task.color || paletteEntry.color;
          let strokeColor = task.color ? (GANTT_PALETTE.find(p => p.color === task.color)?.border || task.color) : paletteEntry.border;

          if (task.isMilestone || task.duration === 0) {
            barColor = task.color || '#EF4444';
            strokeColor = '#DC2626';
          }

          const rowGuide = `<line x1="15" y1="${y + 36}" x2="${svgWidth - 15}" y2="${y + 36}" stroke="${textSecondary}" stroke-opacity="0.25" stroke-dasharray="3,3" stroke-width="1" />`;
          const leftRow = `
            <circle cx="38" cy="${y + 11}" r="4" fill="${barColor}" />
            <text x="48" y="${y + 15}" fill="${textPrimary}" font-size="12" font-weight="600" font-family="'Outfit', sans-serif">${escapeXml(task.name)}</text>
          `;

          let barSvg = '';
          if (task.isMilestone || task.duration === 0) {
            barSvg = `
              <polygon points="${x},${y + 12} ${x + 11},${y} ${x + 22},${y + 12} ${x + 11},${y + 24}" fill="${barColor}" stroke="${strokeColor}" stroke-width="1.5" />
              <text x="${x + 30}" y="${y + 16}" fill="${textSecondary}" font-size="11" font-weight="700" font-family="'Outfit', sans-serif">🚩 Milestone (${task.startDateStr || '2026-08-01'})</text>
            `;
          } else {
            const innerText = width > 60 ? `
              <text x="${x + 14}" y="${y + 16}" fill="#ffffff" font-size="11" font-weight="700" font-family="'Outfit', sans-serif">${escapeXml(task.name.length > Math.floor(width / 9) ? task.name.substring(0, Math.floor(width / 9) - 2) + '..' : task.name)}</text>
            ` : '';
            barSvg = `
              <rect x="${x}" y="${y}" width="${width}" height="24" rx="8" fill="${barColor}" stroke="${strokeColor}" stroke-width="1" />
              ${innerText}
              <text x="${x + width + 14}" y="${y + 16}" fill="${textSecondary}" font-size="10" font-weight="700" font-family="'Outfit', sans-serif">${task.duration}d</text>
            `;
          }

          return `<g>${rowGuide}${leftRow}${barSvg}</g>`;
        }).join('\n');

        return `<g>${secHeaderSvg}${tasksSvg}</g>`;
      }).join('\n');

      innerSvgContent = `
        <rect x="0" y="0" width="${svgWidth}" height="52" fill="${bgPaper}" fill-opacity="0.9" />
        ${monthLabelsSvg}
        ${subHeadersSvg}
        <text x="24" y="32" fill="${textPrimary}" font-size="12" font-weight="800" font-family="'Outfit', sans-serif" letter-spacing="0.06em" text-transform="uppercase">${escapeXml(chartTitle || 'GANTT SCHEDULE')}</text>
        <line x1="15" y1="52" x2="${svgWidth - 15}" y2="52" stroke="${divider}" stroke-opacity="0.9" stroke-width="1.5" />
        <line x1="${leftPaneWidth}" y1="0" x2="${leftPaneWidth}" y2="${totalHeight}" stroke="${divider}" stroke-opacity="0.7" stroke-width="1.5" />
        ${vDividersSvg}
        ${gridLinesSvg}
        ${dependenciesSvg}
        ${sectionsAndTasksSvg}
      `;
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
      <path d="M 0 1 L 10 5 L 0 9" fill="none" stroke="#00FFCC" stroke-width="1.5" />
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
      const isFullDoc = activeTabKey === 'gantt' || activeTabKey === 'sequence';
      const exportW = isFullDoc ? bounds.width : bounds.width + 80;
      const exportH = isFullDoc ? bounds.height : bounds.height + 80;
      const svgDoc = generatePureDiagramSvg(activeTabKey, code, bounds, themeColors, { ...nodePositions, _isPreview: true });
      const pngBlob = await renderSvgToPngBlob(svgDoc, exportW, exportH, themeColors);
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
      const isFullDoc = activeTabKey === 'gantt' || activeTabKey === 'sequence';
      const exportW = isFullDoc ? bounds.width : bounds.width + 80;
      const exportH = isFullDoc ? bounds.height : bounds.height + 80;
      const svgDoc = generatePureDiagramSvg(activeTabKey, code, bounds, themeColors, nodePositions);
      const pngBlob = await renderSvgToPngBlob(svgDoc, exportW, exportH, themeColors);
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

        const existingIdx = links.findIndex(l =>
          (l.source.toLowerCase() === srcId.toLowerCase() && l.target.toLowerCase() === tgtId.toLowerCase()) ||
          (l.source.toLowerCase() === tgtId.toLowerCase() && l.target.toLowerCase() === srcId.toLowerCase())
        );
        if (existingIdx >= 0) {
          links[existingIdx] = { source: srcId, target: tgtId, label: '' };
        } else {
          links.push({ source: srcId, target: tgtId, label: '' });
        }
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
        
        const existingIdx = links.findIndex(l =>
          (l.source.toLowerCase() === srcId.toLowerCase() && l.target.toLowerCase() === tgtId.toLowerCase()) ||
          (l.source.toLowerCase() === tgtId.toLowerCase() && l.target.toLowerCase() === srcId.toLowerCase())
        );
        if (existingIdx >= 0) {
          links[existingIdx] = { source: srcId, target: tgtId, label: type };
        } else {
          links.push({ source: srcId, target: tgtId, label: type });
        }
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

      // Attribute layout with exact boundary clearance and small padding
      const gap = 14;
      const hw = ew / 2;
      const hh = entityH / 2; // 25
      const rx = 42;
      const ry = 18;

      fields.forEach((f, idx) => {
        const attrKey = `${entity.name}::attr::${f.name}`;
        const angle = chosenAngles[idx];
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const absCos = Math.abs(cos) + 1e-6;
        const absSin = Math.abs(sin) + 1e-6;

        // Exact distance along ray from center (cx, cy) to entity rectangle edge
        const dRect = Math.min(hw / absCos, hh / absSin);
        // Exact radius of attribute ellipse along ray
        const rAttr = (rx * ry) / Math.sqrt((ry * cos) ** 2 + (rx * sin) ** 2);

        const dist = dRect + rAttr + gap;
        positions[attrKey] = {
          x: Math.round(cx + dist * cos),
          y: Math.round(cy + dist * sin)
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
      const ew = getEntityWidth(e.name);
      const ePos = positions[e.name];
      const eCx = ePos ? ePos.x + ew / 2 : 0;
      const eCy = ePos ? ePos.y + entityH / 2 : 0;

      (e.fields || []).forEach(f => {
        const attrKey = `${e.name}::attr::${f.name}`;
        if (positions[attrKey]) {
          nodeBoxes.push({
            id: attrKey,
            entityName: e.name,
            eCx,
            eCy,
            ew,
            hw: 42 + 6,
            hh: 18 + 6,
            cx: positions[attrKey].x,
            cy: positions[attrKey].y
          });
        }
      });
    });

    for (let iter = 0; iter < 30; iter++) {
      let moved = false;
      // 6a. Relax overlapping attribute siblings
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

      // 6b. Enforce strict non-collision clearance against entity card
      nodeBoxes.forEach(box => {
        if (!box.eCx) return;
        const dx = box.cx - box.eCx;
        const dy = box.cy - box.eCy;
        const angle = Math.atan2(dy, dx);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const absCos = Math.abs(cos) + 1e-6;
        const absSin = Math.abs(sin) + 1e-6;
        const dRect = Math.min((box.ew / 2) / absCos, 25 / absSin);
        const rAttr = (42 * 18) / Math.sqrt((18 * cos) ** 2 + (42 * sin) ** 2);
        const minDist = dRect + rAttr + 14;
        const currDist = Math.hypot(dx, dy);

        if (currDist < minDist) {
          moved = true;
          box.cx = box.eCx + minDist * cos;
          box.cy = box.eCy + minDist * sin;
        }
      });

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

    // ── Step 6b: Enforce minimum distance between connected use cases ──────
    const MIN_CONNECTED_UC_GAP_Y = 70;
    for (let iter = 0; iter < 10; iter++) {
      let adjusted = false;
      ucUcLinks.forEach(link => {
        const posA = positions[link.source];
        const posB = positions[link.target];
        if (!posA || !posB) return;
        const cxA = posA.x + UC_W / 2;
        const cyA = posA.y + UC_H / 2;
        const cxB = posB.x + UC_W / 2;
        const cyB = posB.y + UC_H / 2;
        const absDx = Math.abs(cxB - cxA);
        const absDy = Math.abs(cyB - cyA);

        if (absDx < UC_W * 0.75) {
          const currentGapY = absDy - UC_H;
          if (currentGapY < MIN_CONNECTED_UC_GAP_Y) {
            adjusted = true;
            const shiftNeeded = MIN_CONNECTED_UC_GAP_Y - currentGapY;
            if (cyB >= cyA) {
              usecases.forEach(u => {
                if (positions[u.id] && positions[u.id].y >= posB.y && u.id !== link.source) {
                  positions[u.id].y += shiftNeeded;
                  if (primaryYCenter[u.id] !== undefined) primaryYCenter[u.id] += shiftNeeded;
                }
              });
            } else {
              usecases.forEach(u => {
                if (positions[u.id] && positions[u.id].y >= posA.y && u.id !== link.target) {
                  positions[u.id].y += shiftNeeded;
                  if (primaryYCenter[u.id] !== undefined) primaryYCenter[u.id] += shiftNeeded;
                }
              });
            }
          }
        }
      });
      if (!adjusted) break;
    }

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

      // SWIMLANE / PARTITION / ACTOR / LANE <Name>
      const partMatch = trimmed.match(/^(?:SWIMLANE|PARTITION|ACTOR|LANE)\s+(.+)$/i);
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

    // Automatically sort partitions / actors based on execution flow invocation order
    if (partitions.length > 1) {
      const inDeg = {};
      const adj = {};
      nodes.forEach(n => {
        inDeg[n.id] = 0;
        adj[n.id] = [];
      });
      transitions.forEach(t => {
        if (adj[t.source] && inDeg[t.target] !== undefined) {
          adj[t.source].push(t.target);
          inDeg[t.target] = (inDeg[t.target] || 0) + 1;
        }
      });

      // BFS to determine execution / invocation step of each node
      const flowStep = {};
      const queue = [];
      
      // Start nodes get step 0
      nodes.filter(n => n.type === 'start').forEach(n => {
        flowStep[n.id] = 0;
        queue.push(n.id);
      });

      // If no explicit start node, use nodes with inDegree 0
      if (queue.length === 0) {
        nodes.filter(n => inDeg[n.id] === 0).forEach(n => {
          flowStep[n.id] = 0;
          queue.push(n.id);
        });
      }

      // If still empty, use first transition source or first node
      if (queue.length === 0 && nodes.length > 0) {
        flowStep[nodes[0].id] = 0;
        queue.push(nodes[0].id);
      }

      while (queue.length > 0) {
        const curr = queue.shift();
        const curStep = flowStep[curr] ?? 0;
        (adj[curr] || []).forEach(nxt => {
          if (flowStep[nxt] === undefined || flowStep[nxt] > curStep + 1) {
            flowStep[nxt] = curStep + 1;
            queue.push(nxt);
          }
        });
      }

      // Any remaining nodes get fallback step based on their order in code
      nodes.forEach((n, idx) => {
        if (flowStep[n.id] === undefined) {
          flowStep[n.id] = 100 + idx;
        }
      });

      // Calculate the minimum invocation step for each partition
      const partMinStep = {};
      const partOriginalIndex = {};
      partitions.forEach((p, idx) => {
        partOriginalIndex[p] = idx;
        const pNodes = nodes.filter(n => (n.partition || partitions[0]) === p);
        if (pNodes.length === 0) {
          partMinStep[p] = 9999;
        } else {
          // If partition has a start node, it gets highest priority (-1) to be leftmost
          const hasStart = pNodes.some(n => n.type === 'start');
          if (hasStart) {
            partMinStep[p] = -1;
          } else {
            partMinStep[p] = Math.min(...pNodes.map(n => flowStep[n.id] ?? 999));
          }
        }
      });

      partitions.sort((a, b) => {
        const stepA = partMinStep[a] ?? 9999;
        const stepB = partMinStep[b] ?? 9999;
        if (stepA !== stepB) return stepA - stepB;
        return (partOriginalIndex[a] || 0) - (partOriginalIndex[b] || 0);
      });
    }

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

    // Tight, crisp, modern node dimensions
    const getNodeDim = (type) => {
      if (type === 'start' || type === 'end') return { w: 32, h: 32 };
      if (type === 'decision') return { w: 120, h: 56 };
      if (type === 'fork' || type === 'join') return { w: 140, h: 10 };
      return { w: 180, h: 48 };
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

    // 3. Flow-based Partition Sorting: Ensure actors are placed left-to-right in invocation order
    let effectivePartitions = partitions ? [...partitions] : [];
    if (effectivePartitions.length > 1) {
      const partMinStep = {};
      const partOriginalIndex = {};
      effectivePartitions.forEach((p, idx) => {
        partOriginalIndex[p] = idx;
        const pNodes = nodes.filter(n => (n.partition || effectivePartitions[0]) === p);
        if (pNodes.length === 0) {
          partMinStep[p] = 9999;
        } else {
          const hasStart = pNodes.some(n => n.type === 'start');
          if (hasStart) {
            partMinStep[p] = -1;
          } else {
            partMinStep[p] = Math.min(...pNodes.map(n => layers[n.id] ?? 999));
          }
        }
      });

      effectivePartitions.sort((a, b) => {
        const stepA = partMinStep[a] ?? 9999;
        const stepB = partMinStep[b] ?? 9999;
        if (stepA !== stepB) return stepA - stepB;
        return (partOriginalIndex[a] || 0) - (partOriginalIndex[b] || 0);
      });
    }

    const hasPartitions = effectivePartitions && effectivePartitions.length > 0;
    const LAYER_GAP_Y = 110;
    const START_Y = 88;
    const NODE_SPACING_X = 210;

    if (hasPartitions) {
      let currentPartX = 40;

      effectivePartitions.forEach(partName => {
        const partNodes = nodes.filter(n => (n.partition || effectivePartitions[0]) === partName);
        if (partNodes.length === 0) {
          currentPartX += 280;
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
        const nodeTargetCenter = {};

        // Top-down hierarchical barycenter and branch assignment
        sortedLayerKeys.forEach(l => {
          const layerNodes = partLayerGroups[l];
          const y = START_Y + l * LAYER_GAP_Y;

          layerNodes.forEach(node => {
            const pred = (parents[node.id] || []).filter(pid => partNodes.some(pn => pn.id === pid));
            if (pred.length === 1) {
              const pId = pred[0];
              const pPos = positions[pId];
              const pDim = getNodeDim(nodeMap[pId]?.type);
              const pCenter = pPos ? (pPos.x + pDim.w / 2) : (currentPartX + 260 / 2);
              const siblings = (adj[pId] || []).filter(cid => partNodes.some(pn => pn.id === cid) && layers[cid] === l);

              if (siblings.length > 1) {
                const sIdx = siblings.indexOf(node.id);
                if (nodeMap[pId]?.type === 'decision') {
                  const trans = transitions.find(t => t.source === pId && t.target === node.id);
                  const isRejectOrNo = trans && (trans.guard?.toLowerCase() === 'no' || trans.guard?.toLowerCase() === 'false' || trans.guard?.toLowerCase() === 'reject');
                  if (isRejectOrNo) {
                    nodeTargetCenter[node.id] = pCenter - 200;
                  } else {
                    nodeTargetCenter[node.id] = pCenter + 160;
                  }
                } else {
                  nodeTargetCenter[node.id] = pCenter + (sIdx - (siblings.length - 1) / 2) * NODE_SPACING_X;
                }
              } else {
                nodeTargetCenter[node.id] = pCenter;
              }
            } else if (pred.length > 1) {
              const pCenters = pred.map(pid => {
                const pPos = positions[pid];
                const pDim = getNodeDim(nodeMap[pid]?.type);
                return pPos ? (pPos.x + pDim.w / 2) : (currentPartX + 260 / 2);
              });
              nodeTargetCenter[node.id] = pCenters.reduce((a, b) => a + b, 0) / pCenters.length;
            } else {
              nodeTargetCenter[node.id] = currentPartX + 260 / 2;
            }
          });

          // Sort layer nodes by target center
          layerNodes.sort((a, b) => (nodeTargetCenter[a.id] || 0) - (nodeTargetCenter[b.id] || 0));

          // Resolve horizontal overlaps among nodes in the same layer
          const assignedCenters = {};
          layerNodes.forEach((node, idx) => {
            let cx = nodeTargetCenter[node.id];
            if (idx > 0) {
              const prevId = layerNodes[idx - 1].id;
              const prevCx = assignedCenters[prevId];
              const minAllowed = prevCx + NODE_SPACING_X;
              if (cx < minAllowed) {
                cx = minAllowed;
              }
            }
            assignedCenters[node.id] = cx;
          });

          layerNodes.forEach(node => {
            const dim = getNodeDim(node.type);
            const cx = assignedCenters[node.id];
            positions[node.id] = {
              x: cx - dim.w / 2,
              y: y + (getNodeDim('action').h - dim.h) / 2
            };
          });
        });

        // Bottom-up pass: center Fork and Join bars over their children / predecessors
        sortedLayerKeys.slice().reverse().forEach(l => {
          const layerNodes = partLayerGroups[l];
          layerNodes.forEach(node => {
            if (node.type === 'fork' || node.type === 'join') {
              const connected = node.type === 'fork'
                ? (adj[node.id] || []).filter(cid => positions[cid] !== undefined && partNodes.some(pn => pn.id === cid))
                : (parents[node.id] || []).filter(pid => positions[pid] !== undefined && partNodes.some(pn => pn.id === pid));
              if (connected.length > 1) {
                const centers = connected.map(id => positions[id].x + getNodeDim(nodeMap[id].type).w / 2);
                const meanCenter = centers.reduce((a, b) => a + b, 0) / centers.length;
                positions[node.id].x = meanCenter - getNodeDim(node.type).w / 2;
              }
            }
          });
        });

        // Shift nodes so min left is at least currentPartX + 40
        const minPartX = Math.min(...partNodes.map(n => positions[n.id].x));
        const requiredLeft = currentPartX + 40;
        const shiftX = requiredLeft - minPartX;
        partNodes.forEach(n => {
          positions[n.id].x += shiftX;
        });

        const maxPartX = Math.max(...partNodes.map(n => positions[n.id].x + getNodeDim(n.type).w));
        const laneWidth = Math.max(280, (maxPartX - currentPartX) + 40);
        currentPartX += laneWidth;
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
      const BASE_CENTER_X = 340;

      sortedLayerKeys.forEach(l => {
        const layerNodes = layerGroups[l];
        const y = START_Y + l * LAYER_GAP_Y;

        if (layerNodes.length === 1) {
          const node = layerNodes[0];
          const dim = getNodeDim(node.type);
          positions[node.id] = {
            x: BASE_CENTER_X - dim.w / 2,
            y: y + (getNodeDim('action').h - dim.h) / 2
          };
        } else {
          const totalWidth = (layerNodes.length - 1) * NODE_SPACING_X;
          const startX = BASE_CENTER_X - totalWidth / 2;
          layerNodes.forEach((node, idx) => {
            const dim = getNodeDim(node.type);
            positions[node.id] = {
              x: startX + idx * NODE_SPACING_X - dim.w / 2,
              y: y + (getNodeDim('action').h - dim.h) / 2
            };
          });
        }
      });
    }

    nodes.forEach((n, idx) => {
      if (!positions[n.id] || !Number.isFinite(positions[n.id].x) || !Number.isFinite(positions[n.id].y)) {
        positions[n.id] = { x: 300, y: idx * 80 + 70 };
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
      
      fields.forEach((f, fIdx) => {
        const attrKey = `${entity.name}::attr::${f.name}`;
        let attrX = nodePositions[attrKey]?.x;
        let attrY = nodePositions[attrKey]?.y;

        if (attrX === undefined || attrY === undefined) {
          const angle = -Math.PI / 2 + (2 * Math.PI * fIdx) / Math.max(1, numFields);
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const absCos = Math.abs(cos) + 1e-6;
          const absSin = Math.abs(sin) + 1e-6;
          const dRect = Math.min((ew / 2) / absCos, 25 / absSin);
          const rAttr = (42 * 18) / Math.sqrt((18 * cos) ** 2 + (42 * sin) ** 2);
          const dist = dRect + rAttr + 14;
          attrX = Math.round(cx + dist * cos);
          attrY = Math.round(cy + dist * sin);
        }

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
            <g
              key={`rel-lines-${idx}`}
              className="er-rel-group"
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                setEditingERRel(rel);
              }}
            >
              {/* Invisible fat hit-area for easy clicking */}
              <path
                className="diagram-hit-area"
                d={`M ${rel.pts1.start.x} ${rel.pts1.start.y} L ${rel.mx} ${rel.my} L ${rel.pts2.end.x} ${rel.pts2.end.y}`}
                stroke="transparent"
                strokeWidth="20"
                fill="none"
              >
                <title>Click to edit or delete relationship</title>
              </path>
              <path
                d={`M ${rel.pts1.start.x} ${rel.pts1.start.y} L ${rel.mx} ${rel.my}`}
                stroke={isDarkMode ? "var(--primary-main)" : "#334155"}
                strokeWidth="2"
                fill="none"
                opacity={isDarkMode ? 0.85 : 0.95}
                markerStart={rel.markerStart}
              />
              <path
                d={`M ${rel.mx} ${rel.my} L ${rel.pts2.end.x} ${rel.pts2.end.y}`}
                stroke={isDarkMode ? "var(--primary-main)" : "#334155"}
                strokeWidth="2"
                fill="none"
                opacity={isDarkMode ? 0.85 : 0.95}
                markerEnd={rel.markerEnd}
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
                stroke={isDarkMode ? "var(--primary-main)" : "#0284c7"}
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
              className="er-rel-group"
              style={{ pointerEvents: 'auto', cursor: draggingNode === rel.key ? 'grabbing' : 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                setEditingERRel(rel);
              }}
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
                stroke={isDarkMode ? "var(--primary-dark)" : "#0284c7"}
                strokeWidth="2"
              >
                <title>Click to edit or delete relationship</title>
              </polygon>
              <text
                x={rel.mx}
                y={rel.my + 3}
                fill={isDarkMode ? "var(--primary-main)" : "#0f172a"}
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
          const start = nodePositions[link.source] || autoPos[link.source];
          const end = nodePositions[link.target] || autoPos[link.target];
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

          const isBothUC = !isSourceActor && !isTargetActor;
          const defaultCx = (isBothUC && Math.abs(x1 - x2) < 40)
            ? (x1 + x2) / 2 + 35
            : (x1 + x2) / 2;
          const cx = wp ? wp.x : defaultCx;
          const cy = wp ? wp.y : (y1 + y2) / 2;
          
          const pathD = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
          const handleKey = `${wpKey}::ctrl::usecase`;
          
          let strokeColor = isDarkMode ? 'var(--primary-main)' : '#475569';
          let strokeDasharray = '0';
          let markerEnd = 'none';
          
          if (isExtendInclude) {
            strokeColor = isDarkMode ? '#00FFCC' : '#0284c7';
            strokeDasharray = '5,5';
            markerEnd = 'url(#usecase-arrow)';
          } else if (isInherits) {
            strokeColor = isDarkMode ? '#c084fc' : '#7e22ce';
            markerEnd = 'url(#usecase-generalization-arrow)';
          }

          return (
            <g
              key={idx}
              className="usecase-link-group"
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                setEditingUCLink(link);
              }}
            >
              {/* Invisible fat hit-area for easy clicking */}
              <path
                className="diagram-hit-area"
                d={pathD}
                fill="none"
                stroke="transparent"
                strokeWidth="18"
              >
                <title>Click to edit or delete connection</title>
              </path>
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.75"
                strokeDasharray={strokeDasharray}
                markerEnd={markerEnd}
              />
              <circle
                className={`gantt-waypoint-handle ${draggingWaypoint === handleKey ? 'active' : ''}`}
                cx={cx}
                cy={cy}
                r={5}
                fill={draggingWaypoint === handleKey ? '#fff' : (isDarkMode ? 'var(--primary-main)' : '#0284c7')}
                stroke={isDarkMode ? "#1e1e1e" : "#ffffff"}
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
                    fill="var(--background-paper)"
                    stroke={isDarkMode ? "var(--divider)" : "rgba(2, 132, 199, 0.35)"}
                    strokeWidth="1"
                  />
                  <text
                    x={cx}
                    y={cy - 1}
                    fill={isDarkMode ? "#00FFCC" : "#0284c7"}
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
      if (type === 'start' || type === 'end') return { w: 32, h: 32 };
      if (type === 'decision') return { w: 120, h: 56 };
      if (type === 'fork' || type === 'join') return { w: 140, h: 10 };
      return { w: 180, h: 46 };
    };

    const autoPos = computeActivityAutoLayout(nodes, transitions, partitions);

    let maxY = 450;
    nodes.forEach(n => {
      const p = nodePositions[n.id] || autoPos[n.id];
      const dim = nodeDim(n.type);
      if (p && p.y + dim.h + 60 > maxY) maxY = p.y + dim.h + 60;
    });

    const partBounds = [];
    if (hasPartitions) {
      let currentX = 30;
      partitions.forEach((partName, pIdx) => {
        const partNodes = nodes.filter(n => (n.partition || partitions[0]) === partName);
        let minX = Infinity;
        let maxX = -Infinity;
        partNodes.forEach(n => {
          const p = nodePositions[n.id] || autoPos[n.id];
          const dim = nodeDim(n.type);
          if (p) {
            if (p.x < minX) minX = p.x;
            if (p.x + dim.w > maxX) maxX = p.x + dim.w;
          }
        });

        const xLeft = minX !== Infinity ? Math.min(currentX, minX - 35) : currentX;
        const partW = minX !== Infinity ? Math.max(260, (maxX - xLeft) + 35) : 260;
        const xRight = xLeft + partW;
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
                    x={pb.xLeft + 6}
                    y={12}
                    width={pb.width - 12}
                    height={36}
                    fill="var(--background-paper)"
                    stroke="var(--primary-main)"
                    strokeWidth={1.5}
                    rx={8}
                  />
                  <text
                    x={pb.xCenter}
                    y={34}
                    textAnchor="middle"
                    fill="var(--primary-main)"
                    fontSize="13"
                    fontWeight="800"
                    fontFamily="Outfit, sans-serif"
                    letterSpacing="0.06em"
                  >
                    {pb.partName.toUpperCase()}
                  </text>
                  <line
                    x1={pb.xLeft}
                    y1={12}
                    x2={pb.xLeft}
                    y2={maxY}
                    stroke="var(--primary-main)"
                    strokeOpacity={0.35}
                    strokeWidth={2}
                    strokeDasharray={pIdx === 0 ? 'none' : '4,4'}
                  />
                  {pIdx === partBounds.length - 1 && (
                    <line
                      x1={pb.xRight}
                      y1={12}
                      x2={pb.xRight}
                      y2={maxY}
                      stroke="var(--primary-main)"
                      strokeOpacity={0.35}
                      strokeWidth={2}
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
            x: rawP1 && Number.isFinite(rawP1.x) ? rawP1.x : 300,
            y: rawP1 && Number.isFinite(rawP1.y) ? rawP1.y : 80
          };
          const p2 = {
            x: rawP2 && Number.isFinite(rawP2.x) ? rawP2.x : 300,
            y: rawP2 && Number.isFinite(rawP2.y) ? rawP2.y : 180
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
            const loopX = Math.max(p1.x + dim1.w, p2.x + dim2.w) + 45;
            const r = 10;
            pathD = `M ${startX} ${startY} H ${loopX - r} Q ${loopX} ${startY} ${loopX} ${startY - r} V ${endY + r} Q ${loopX} ${endY} ${loopX - r} ${endY} H ${endX}`;
            midX = loopX;
            midY = (startY + endY) / 2;
          } else if (Math.abs(dy) < 30 && Math.abs(dx) > 30) {
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
          } else if (srcNode.type === 'decision' && Math.abs(dx) > 50) {
            // Side branch from decision diamond
            const startX = dx > 0 ? p1.x + dim1.w : p1.x;
            const startY = srcCenter.y;
            const endX = tgtCenter.x;
            const endY = p2.y;
            const r = 10;
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

            if (Math.abs(startX - endX) < 6) {
              pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
              midX = startX;
              midY = (startY + endY) / 2;
            } else {
              const r = 10;
              const stepY = startY + Math.min(22, Math.max(12, (endY - startY) * 0.42));
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
          const strokeColor = isEdgeTraversed ? (isDarkMode ? '#00FFCC' : '#059669') : (isDarkMode ? 'var(--primary-main)' : '#475569');
          const strokeWidth = isEdgeTraversed ? 2.5 : 1.75;

          return (
            <g
              key={`act-trans-${idx}`}
              className="activity-transition-group"
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                setEditingActTrans(t);
              }}
            >
              {/* Invisible fat hit-area for easy clicking */}
              <path
                className="diagram-hit-area"
                d={pathD}
                fill="none"
                stroke="transparent"
                strokeWidth="18"
              >
                <title>Click to edit or delete transition</title>
              </path>
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                markerEnd={isEdgeTraversed ? "url(#activity-arrow-active)" : "url(#activity-arrow)"}
                opacity={isSimulating && !isEdgeTraversed ? 0.9 : 1}
                style={{ transition: 'stroke 0.3s ease, opacity 0.3s ease' }}
              />
              {t.guard && (
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x={-((t.guard.length * 6.5 + 14) / 2)}
                    y={-9}
                    width={t.guard.length * 6.5 + 14}
                    height={18}
                    rx={9}
                    fill="var(--background-paper)"
                    stroke={isEdgeTraversed ? (isDarkMode ? '#00FFCC' : '#059669') : 'var(--divider)'}
                    strokeWidth={1}
                  />
                  <text
                    x={0}
                    y={3}
                    textAnchor="middle"
                    fill={isEdgeTraversed ? (isDarkMode ? '#00FFCC' : '#059669') : 'var(--text-primary)'}
                    fontSize="9"
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
            <g
              key={idx}
              className="sequence-message-group"
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                setEditingSeqMsg({ messageIndex: idx, ...msg });
              }}
            >
              {/* Invisible fat hit-area for easy clicking */}
              <line
                className="diagram-hit-area"
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                stroke="transparent"
                strokeWidth="20"
              >
                <title>Click to edit or delete message</title>
              </line>
              <line
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                stroke={isResponseOrDisplay ? (isDarkMode ? 'var(--primary-main)' : '#0284c7') : (isDarkMode ? 'var(--text-primary)' : '#1e293b')}
                strokeWidth="1.75"
                strokeDasharray={isResponseOrDisplay ? '4,4' : '0'}
              />
              {x2 > x1 ? (
                <polygon points={`${x2},${y} ${x2 - 8},${y - 4} ${x2 - 8},${y + 4}`} fill={isResponseOrDisplay ? (isDarkMode ? 'var(--primary-main)' : '#0284c7') : (isDarkMode ? 'var(--text-primary)' : '#1e293b')} />
              ) : (
                <polygon points={`${x2},${y} ${x2 + 8},${y - 4} ${x2 + 8},${y + 4}`} fill={isResponseOrDisplay ? (isDarkMode ? 'var(--primary-main)' : '#0284c7') : (isDarkMode ? 'var(--text-primary)' : '#1e293b')} />
              )}
              <text
                x={(x1 + x2) / 2}
                y={y - 8}
                fill={isResponseOrDisplay ? (isDarkMode ? 'var(--primary-main)' : '#0284c7') : (isDarkMode ? 'var(--text-primary)' : '#0f172a')}
                fontSize="13"
                fontWeight="700"
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

  // Render Gantt Chart (Canva-style interactive drag, drop, and customizer)
  const renderGanttChart = (isPreview = false) => {
    const { title: chartTitle, sections, tasks } = parseGantt(editorCode);
    const rowHeight = 52;

    const monthWidth = ganttViewScale === 'days' ? 930 : ganttViewScale === 'months' ? 160 : 480;
    const dayWidth = monthWidth / 31;

    const getWeekLabel = (monthZeroIndexed, weekIdx) => {
      const dayOfStart = weekIdx * 7 + 1;
      return `${monthZeroIndexed + 1}/${dayOfStart}`;
    };

    // Calculate earliest start date and latest end date dynamically
    let earliestDate = new Date('2026-07-01');
    let latestDate = new Date('2026-08-31');
    let foundDate = false;

    tasks.forEach(task => {
      if (task.startDateStr) {
        const d = parseGanttDate(task.startDateStr);
        if (d && !isNaN(d.getTime())) {
          const endDate = new Date(d.getTime() + (task.duration || 1) * 24 * 60 * 60 * 1000);
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

    let numMonths = foundDate ? ((yEnd - yStart) * 12 + (mEnd - mStart) + 1) : 1;
    if (numMonths < 1) numMonths = 1;

    const leftPaneWidth = getGanttLeftPaneWidth(chartTitle, tasks);
    const svgWidth = leftPaneWidth + numMonths * monthWidth;

    // Calculate dynamic coordinates
    const showSectionHeader = (sec) => {
      if (sections.length > 1) {
        return sec && sec.trim().toLowerCase() !== (chartTitle || '').trim().toLowerCase();
      }
      return false;
    };

    let globalTaskIndex = 0;
    let currentY = 70;
    const taskLayoutMap = {};

    sections.forEach((section, secIdx) => {
      const sectionTasks = tasks.filter(t => t.section === section);
      if (showSectionHeader(section)) {
        currentY += 24; // section header spacing
      }

      sectionTasks.forEach((task, taskIdx) => {
        const taskY = currentY;
        let taskWidth = Math.max(16, (task.duration || 1) * dayWidth);
        let taskX = leftPaneWidth;

        if (task.startDateStr) {
          const tDate = parseGanttDate(task.startDateStr);
          if (tDate && !isNaN(tDate.getTime())) {
            const m = tDate.getMonth();
            const y = tDate.getFullYear();
            const d = tDate.getDate();
            const monthDiff = (y - yStart) * 12 + (m - mStart);
            if (monthDiff >= 0 && monthDiff < numMonths) {
              taskX = leftPaneWidth + monthDiff * monthWidth + (d - 1) * dayWidth;
            } else if (monthDiff < 0) {
              taskX = leftPaneWidth;
            } else {
              taskX = svgWidth - 40;
            }
          }
        }

        taskLayoutMap[task.name] = {
          x: taskX,
          y: taskY,
          width: taskWidth,
          globalIndex: globalTaskIndex,
          sectionIndex: secIdx,
          taskIndex: taskIdx
        };

        globalTaskIndex++;
        currentY += rowHeight;
      });
      if (showSectionHeader(section)) {
        currentY += 20;
      }
    });

    const totalHeight = Math.max(160, currentY + 30);

    // Get active task being dragged or selected
    const selectedTask = tasks.find(t => t.name === selectedGanttTask);
    const selectedLayout = selectedTask ? taskLayoutMap[selectedTask.name] : null;

    // Calculate dynamic guideline coordinates for dragging/resizing or selected task
    let activeGuideline = null;
    if (!isPreview) {
      const activeTaskName = (ganttDragState && ['move', 'resize-left', 'resize-right'].includes(ganttDragState.type))
        ? ganttDragState.taskName
        : selectedGanttTask;

      if (activeTaskName) {
        const activeTask = tasks.find(t => t.name === activeTaskName);
        const layout = activeTask ? taskLayoutMap[activeTask.name] : null;
        if (activeTask && layout) {
          let gx = layout.x;
          let gwidth = layout.width;
          let gStartDate = activeTask.startDateStr;
          let gEndDate = activeTask.endDateStr;

          if (ganttDragState && ganttDragState.taskName === activeTask.name) {
            const deltaX = (ganttDragState.currentClientX || ganttDragState.startClientX) - ganttDragState.startClientX;
            const daysShift = Math.round(deltaX / (dayWidth * zoomScale));

            if (ganttDragState.type === 'move') {
              gx = gx + daysShift * dayWidth;
              gStartDate = addDaysToGanttDate(activeTask.startDateStr, daysShift);
              gEndDate = addDaysToGanttDate(activeTask.endDateStr, daysShift);
            } else if (ganttDragState.type === 'resize-right') {
              let newEndDate = addDaysToGanttDate(activeTask.endDateStr, daysShift);
              if (newEndDate <= activeTask.startDateStr) {
                newEndDate = addDaysToGanttDate(activeTask.startDateStr, 1);
              }
              gEndDate = newEndDate;
              const dur = getDaysBetweenGanttDates(activeTask.startDateStr, gEndDate);
              gwidth = Math.max(dayWidth, dur * dayWidth);
            } else if (ganttDragState.type === 'resize-left') {
              let newStartDate = addDaysToGanttDate(activeTask.startDateStr, daysShift);
              if (newStartDate >= activeTask.endDateStr) {
                newStartDate = addDaysToGanttDate(activeTask.endDateStr, -1);
              }
              gStartDate = newStartDate;
              const dur = getDaysBetweenGanttDates(gStartDate, activeTask.endDateStr);
              const sDate = parseGanttDate(gStartDate);
              if (sDate) {
                const m = sDate.getMonth();
                const y = sDate.getFullYear();
                const d = sDate.getDate();
                const monthDiff = (y - yStart) * 12 + (m - mStart);
                gx = leftPaneWidth + monthDiff * monthWidth + (d - 1) * dayWidth;
              }
              gwidth = Math.max(dayWidth, dur * dayWidth);
            }
          }

          activeGuideline = {
            startX: gx,
            endX: gx + (activeTask.isMilestone || activeTask.duration === 0 ? 22 : gwidth),
            startDate: gStartDate,
            endDate: gEndDate,
            isMilestone: activeTask.isMilestone || activeTask.duration === 0,
            taskY: layout.y
          };
        }
      }
    }

    return (
      <div style={{ position: 'relative', width: `${svgWidth}px`, height: `${totalHeight}px`, userSelect: 'none' }}>
        <svg
          width={svgWidth}
          height={totalHeight}
          style={{ background: 'transparent', display: 'block' }}
          onClick={(e) => {
            if (e.target.tagName === 'svg' || e.target.classList.contains('gantt-bg-click')) {
              setSelectedGanttTask(null);
              setGanttInlineEditingTask(null);
            }
          }}
        >
          <rect className="gantt-bg-click" x="0" y="0" width={svgWidth} height={totalHeight} fill="transparent" />

          {/* 1. Header Background */}
          <rect x="0" y="0" width={svgWidth} height="52" fill="var(--background-paper)" fillOpacity="0.8" />

          {/* 2. Month Labels */}
          {Array.from({ length: numMonths }).map((_, idx) => {
            const m = (mStart + idx) % 12;
            const y = yStart + Math.floor((mStart + idx) / 12);
            const x = leftPaneWidth + idx * monthWidth + monthWidth / 2;
            return (
              <text
                key={`month_label_${idx}`}
                x={x}
                y={ganttViewScale === 'months' ? 31 : 20}
                fill="var(--text-primary)"
                fontSize={ganttViewScale === 'months' ? '13' : '12'}
                fontWeight="bold"
                textAnchor="middle"
              >
                {monthNames[m]} {y}
              </text>
            );
          })}

          {/* 3. Dynamic Headers based on View Mode */}
          {ganttViewScale === 'weeks' && Array.from({ length: numMonths }).map((_, mIdx) => {
            const m = (mStart + mIdx) % 12;
            return Array.from({ length: 4 }).map((_, wIdx) => {
              const x = leftPaneWidth + mIdx * monthWidth + wIdx * (monthWidth / 4) + (monthWidth / 8);
              return (
                <text key={`m_${mIdx}_w_${wIdx}`} x={x} y="40" textAnchor="middle" fontSize="11" fontWeight="bold">
                  <tspan fill="var(--text-primary)">W{mIdx * 4 + wIdx + 1}</tspan>
                  <tspan fill="var(--primary-main)" dx="4">({getWeekLabel(m, wIdx)})</tspan>
                </text>
              );
            });
          })}

          {ganttViewScale === 'days' && Array.from({ length: numMonths }).map((_, mIdx) => {
            return Array.from({ length: 31 }).map((_, dIdx) => {
              const x = leftPaneWidth + mIdx * monthWidth + dIdx * dayWidth + dayWidth / 2;
              return (
                <text key={`m_${mIdx}_d_${dIdx}`} x={x} y="40" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="600">
                  {dIdx + 1}
                </text>
              );
            });
          })}

          {/* Left Pane Header - Diagram Name */}
          <text
            x="24"
            y="32"
            fill="var(--text-primary)"
            fontSize="12"
            fontWeight="800"
            letterSpacing="0.06em"
            textTransform="uppercase"
          >
            {chartTitle || 'GANTT SCHEDULE'}
          </text>
          {!isPreview && (
            <g
              cursor="pointer"
              onClick={(e) => {
                e.stopPropagation();
                setCode(prev => insertGanttTaskInSectionInCode(prev, sections[0] || 'SophiaPath'));
              }}
            >
              <rect
                x={leftPaneWidth - 68}
                y="19"
                width="50"
                height="18"
                rx="4"
                fill="var(--primary-main)"
                fillOpacity="0.12"
                stroke="var(--primary-main)"
                strokeWidth="1"
              />
              <text
                x={leftPaneWidth - 43}
                y="31"
                textAnchor="middle"
                fill="var(--primary-main)"
                fontSize="10"
                fontWeight="700"
              >
                + Task
              </text>
              <title>Add New Task</title>
            </g>
          )}

          {/* Horizontal Divider */}
          <line x1="15" y1="52" x2={svgWidth - 15} y2="52" stroke="var(--divider)" strokeOpacity="0.9" strokeWidth="1.5" />
          <line x1={leftPaneWidth} y1="0" x2={leftPaneWidth} y2={totalHeight} stroke="var(--divider)" strokeOpacity="0.7" strokeWidth="1.5" />

          {/* Vertical divider lines for start and end of months */}
          {Array.from({ length: numMonths + 1 }).map((_, idx) => {
            const x = leftPaneWidth + idx * monthWidth;
            return (
              <line key={`v_divider_${idx}`} x1={x} y1="52" x2={x} y2={totalHeight - 30} stroke="var(--divider)" strokeOpacity="0.6" strokeWidth="1.5" />
            );
          })}

          {/* Vertical dotted division guidelines */}
          {ganttViewScale === 'weeks' && Array.from({ length: numMonths }).map((_, mIdx) => {
            return [1, 2, 3].map(wIdx => {
              const x = leftPaneWidth + mIdx * monthWidth + wIdx * (monthWidth / 4);
              return (
                <line key={`w_line_${mIdx}_${wIdx}`} x1={x} y1="52" x2={x} y2={totalHeight - 30} stroke="var(--divider)" strokeOpacity="0.3" strokeDasharray="2,4" />
              );
            });
          })}

          {ganttViewScale === 'days' && Array.from({ length: numMonths }).map((_, mIdx) => {
            return Array.from({ length: 30 }).map((_, dIdx) => {
              const x = leftPaneWidth + mIdx * monthWidth + (dIdx + 1) * dayWidth;
              return (
                <line key={`d_line_${mIdx}_${dIdx}`} x1={x} y1="52" x2={x} y2={totalHeight - 30} stroke="var(--divider)" strokeOpacity="0.15" strokeDasharray="2,4" />
              );
            });
          })}

          {/* 4. Orthogonal Stepped Dependency Connectors */}
          {tasks.map((task, idx) => {
            if (!task.dependencies || task.dependencies.length === 0) return null;
            const layout = taskLayoutMap[task.name];
            if (!layout) return null;

            return task.dependencies.map((depName, depIdx) => {
              const depTask = tasks.find(pt => pt.name === depName);
              const depLayout = taskLayoutMap[depName];
              if (!depTask || !depLayout) return null;

              const wpKey = `${depName}->${task.name}`;

              const pathInfo = computeGanttDependencyPath(
                depTask,
                depLayout,
                task,
                layout,
                tasks,
                taskLayoutMap,
                leftPaneWidth,
                ganttWaypoints
              );

              return (
                <g
                  key={`${idx}_${depIdx}`}
                  className="gantt-dependency-group"
                  style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingGanttDep({ fromTask: depName, toTask: task.name });
                  }}
                >
                  {/* Invisible fat hit-area for easy clicking */}
                  <path
                    className="diagram-hit-area"
                    d={pathInfo.d}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="16"
                  >
                    <title>Click to edit or delete dependency</title>
                  </path>
                  <path
                    d={pathInfo.d}
                    fill="none"
                    stroke={isDarkMode ? "var(--primary-main)" : "#0284c7"}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <polygon
                    points={`${pathInfo.arrowTipX},${pathInfo.yEnd} ${pathInfo.arrowBaseX},${pathInfo.yEnd - 4.5} ${pathInfo.arrowBaseX},${pathInfo.yEnd + 4.5}`}
                    fill={isDarkMode ? "var(--primary-main)" : "#0284c7"}
                  />
                  {!isPreview && pathInfo.handles.map(handle => {
                    const handleKey = `${wpKey}::${handle.id}`;
                    return (
                      <circle
                        key={handle.id}
                        className={`gantt-waypoint-handle ${draggingWaypoint === handleKey ? 'active' : ''}`}
                        cx={handle.cx}
                        cy={handle.cy}
                        r={5}
                        fill={draggingWaypoint === handleKey ? '#fff' : (isDarkMode ? 'var(--primary-main)' : '#0284c7')}
                        stroke={isDarkMode ? "#1e1e1e" : "#ffffff"}
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

          {/* Active Connecting Line while dragging from connector */}
          {ganttDragState && ganttDragState.type === 'connect' && (
            <g>
              <path
                d={`M ${ganttDragState.startCanvasX} ${ganttDragState.startCanvasY} C ${ganttDragState.startCanvasX + 40} ${ganttDragState.startCanvasY}, ${ganttDragState.currentCanvasX - 40} ${ganttDragState.currentCanvasY}, ${ganttDragState.currentCanvasX} ${ganttDragState.currentCanvasY}`}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeDasharray="5,5"
              />
              <circle cx={ganttDragState.currentCanvasX} cy={ganttDragState.currentCanvasY} r="6" fill="#10b981" />
            </g>
          )}

          {/* 5. Render Sections and Tasks */}
          {sections.map((section, secIdx) => {
            const sectionTasks = tasks.filter(t => t.section === section);
            const firstTaskLayout = sectionTasks.length > 0 ? taskLayoutMap[sectionTasks[0].name] : null;
            const sectionHeaderY = firstTaskLayout ? firstTaskLayout.y - 20 : 70;

            const isSecVisible = showSectionHeader(section);

            return (
              <g key={secIdx}>
                {/* Section Header */}
                {isSecVisible && (
                  <g>
                    <text x="24" y={sectionHeaderY} fill="var(--primary-main)" fontSize="12" fontWeight="800" letterSpacing="0.08em" textTransform="uppercase">
                      📂 {section}
                    </text>
                    {!isPreview && (
                      <g
                        cursor="pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCode(prev => insertGanttTaskInSectionInCode(prev, section));
                        }}
                      >
                        <rect
                          x={leftPaneWidth - 68}
                          y={sectionHeaderY - 13}
                          width="50"
                          height="18"
                          rx="4"
                          fill="var(--primary-main)"
                          fillOpacity="0.12"
                          stroke="var(--primary-main)"
                          strokeWidth="1"
                        />
                        <text
                          x={leftPaneWidth - 43}
                          y={sectionHeaderY - 1}
                          textAnchor="middle"
                          fill="var(--primary-main)"
                          fontSize="10"
                          fontWeight="700"
                        >
                          + Task
                        </text>
                        <title>Add Task to {section}</title>
                      </g>
                    )}
                  </g>
                )}

                {sectionTasks.map((task, taskIdx) => {
                  const layout = taskLayoutMap[task.name];
                  if (!layout) return null;

                  const y = layout.y;
                  let width = layout.width;
                  let x = layout.x;

                  const isBeingMoved = ganttDragState && ganttDragState.taskName === task.name && ganttDragState.type === 'move';
                  const isBeingResizedRight = ganttDragState && ganttDragState.taskName === task.name && ganttDragState.type === 'resize-right';
                  const isBeingResizedLeft = ganttDragState && ganttDragState.taskName === task.name && ganttDragState.type === 'resize-left';

                  let displayStartDate = task.startDateStr;
                  let displayEndDate = task.endDateStr;
                  let displayDuration = task.duration;

                  if (isBeingMoved) {
                    const deltaX = (ganttDragState.currentClientX || ganttDragState.startClientX) - ganttDragState.startClientX;
                    const daysShift = Math.round(deltaX / (dayWidth * zoomScale));
                    x = x + daysShift * dayWidth;
                    displayStartDate = addDaysToGanttDate(task.startDateStr, daysShift);
                    displayEndDate = addDaysToGanttDate(task.endDateStr, daysShift);
                  } else if (isBeingResizedRight) {
                    const deltaX = (ganttDragState.currentClientX || ganttDragState.startClientX) - ganttDragState.startClientX;
                    const daysShift = Math.round(deltaX / (dayWidth * zoomScale));
                    let newEndDate = addDaysToGanttDate(task.endDateStr, daysShift);
                    if (newEndDate <= task.startDateStr) {
                      newEndDate = addDaysToGanttDate(task.startDateStr, 1);
                    }
                    displayEndDate = newEndDate;
                    displayDuration = getDaysBetweenGanttDates(task.startDateStr, displayEndDate);
                    width = Math.max(dayWidth, displayDuration * dayWidth);
                  } else if (isBeingResizedLeft) {
                    const deltaX = (ganttDragState.currentClientX || ganttDragState.startClientX) - ganttDragState.startClientX;
                    const daysShift = Math.round(deltaX / (dayWidth * zoomScale));
                    let newStartDate = addDaysToGanttDate(task.startDateStr, daysShift);
                    if (newStartDate >= task.endDateStr) {
                      newStartDate = addDaysToGanttDate(task.endDateStr, -1);
                    }
                    displayStartDate = newStartDate;
                    displayDuration = getDaysBetweenGanttDates(displayStartDate, task.endDateStr);
                    const sDate = parseGanttDate(displayStartDate);
                    if (sDate) {
                      const m = sDate.getMonth();
                      const y = sDate.getFullYear();
                      const d = sDate.getDate();
                      const monthDiff = (y - yStart) * 12 + (m - mStart);
                      x = leftPaneWidth + monthDiff * monthWidth + (d - 1) * dayWidth;
                    }
                    width = Math.max(dayWidth, displayDuration * dayWidth);
                  }

                  const isSelected = selectedGanttTask === task.name;
                  const isHovered = ganttHoveredTask === task.name;
                  const isConnectTarget = ganttDragState && ganttDragState.type === 'connect' && ganttDragState.taskName !== task.name && isHovered;

                  const paletteEntry = GANTT_PALETTE[(layout ? layout.globalIndex : taskIdx) % GANTT_PALETTE.length];
                  let barColor = task.color || paletteEntry.color;
                  let strokeColor = task.color ? (GANTT_PALETTE.find(p => p.color === task.color)?.border || task.color) : paletteEntry.border;

                  if (task.isMilestone || task.duration === 0) {
                    barColor = task.color || '#EF4444';
                    strokeColor = '#DC2626';
                  }

                  return (
                    <g
                      key={task.name}
                      onMouseEnter={() => {
                        setGanttHoveredTask(task.name);
                        if (ganttDragState && ganttDragState.type === 'connect' && ganttDragState.taskName !== task.name) {
                          setGanttDragState(prev => prev ? ({ ...prev, targetTaskName: task.name }) : null);
                        }
                      }}
                      onMouseLeave={() => {
                        if (ganttHoveredTask === task.name) setGanttHoveredTask(null);
                        if (ganttDragState && ganttDragState.type === 'connect' && ganttDragState.targetTaskName === task.name) {
                          setGanttDragState(prev => prev ? ({ ...prev, targetTaskName: null }) : null);
                        }
                      }}
                    >
                      {/* Row Guide Line */}
                      <line
                        x1="15"
                        y1={y + 36}
                        x2={svgWidth - 15}
                        y2={y + 36}
                        stroke="var(--text-secondary)"
                        strokeOpacity="0.25"
                        strokeDasharray="3,3"
                        strokeWidth="1"
                      />

                      {/* Left Task Row Info */}
                      <g
                        className="gantt-side-row gantt-interactive-element"
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGanttTask(task.name);
                        }}
                        onMouseDown={(e) => {
                          if (e.target.closest('button') || e.target.closest('[cursor="pointer"]')) return;
                          e.stopPropagation();
                          setSelectedGanttTask(task.name);
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setGanttInlineEditingTask(task.name);
                          setGanttInlineEditingText(task.name);
                        }}
                      >
                        {/* Hover / Selected highlight background */}
                        {(isSelected || isHovered) && (
                          <rect
                            x="16"
                            y={y - 2}
                            width={leftPaneWidth - 28}
                            height="28"
                            rx="6"
                            fill={isSelected ? 'var(--primary-main)' : 'var(--text-secondary)'}
                            fillOpacity={isSelected ? 0.15 : 0.08}
                          />
                        )}

                        {/* Drag Reorder Handle */}
                        {!isPreview && (
                          <text
                            x="20"
                            y={y + 16}
                            fill="var(--text-secondary)"
                            fontSize="13"
                            cursor="grab"
                            opacity={isHovered || isSelected ? 1 : 0.6}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setGanttDragState({
                                type: 'reorder',
                                taskName: task.name,
                                sourceIndex: layout.globalIndex,
                                targetIndex: layout.globalIndex
                              });
                            }}
                          >
                            ⋮⋮
                          </text>
                        )}

                        {/* Color Dot */}
                        <circle cx="38" cy={y + 11} r="4" fill={barColor} />

                        {/* Task Name */}
                        <text
                          x="48"
                          y={y + 15}
                          fill="var(--text-primary)"
                          fontSize="12"
                          fontWeight={isSelected ? '700' : '600'}
                        >
                          {task.name}
                        </text>

                        {/* Side Controls: Rename (Pen) and Delete (Trashcan) */}
                        {!isPreview && (
                          <g opacity={isHovered || isSelected ? 1 : 0} style={{ transition: 'opacity 0.15s ease' }}>
                            {/* Edit / Rename Button */}
                            <g
                              cursor="pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setGanttInlineEditingTask(task.name);
                                setGanttInlineEditingText(task.name);
                              }}
                            >
                              <rect
                                x={leftPaneWidth - 58}
                                y={y + 1}
                                width="20"
                                height="20"
                                rx="4"
                                fill="var(--background-paper)"
                                stroke="var(--divider)"
                                strokeWidth="1"
                              />
                              <g transform={`translate(${leftPaneWidth - 58 + 4}, ${y + 1 + 4}) scale(0.5)`}>
                                <path
                                  d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
                                  fill="none"
                                  stroke="var(--text-secondary)"
                                  strokeWidth="2.2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </g>
                              <title>Rename Task</title>
                            </g>

                            {/* Delete Button */}
                            <g
                              cursor="pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCode(prev => deleteGanttTaskInCode(prev, task.name));
                                if (selectedGanttTask === task.name) {
                                  setSelectedGanttTask(null);
                                }
                              }}
                            >
                              <rect
                                x={leftPaneWidth - 34}
                                y={y + 1}
                                width="20"
                                height="20"
                                rx="4"
                                fill="rgba(239, 68, 68, 0.15)"
                                stroke="#ef4444"
                                strokeWidth="0.8"
                              />
                              <g transform={`translate(${leftPaneWidth - 34 + 4}, ${y + 1 + 4}) scale(0.5)`}>
                                <path
                                  d="M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M10 11v6 M14 11v6"
                                  fill="none"
                                  stroke="#ef4444"
                                  strokeWidth="2.2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </g>
                              <title>Delete Task</title>
                            </g>
                          </g>
                        )}
                      </g>

                      {/* Gantt Bar / Milestone */}
                      {task.isMilestone || task.duration === 0 ? (
                        // Milestone Diamond
                        <g
                          className="gantt-bar-group gantt-interactive-element"
                          style={{ cursor: isBeingMoved ? 'grabbing' : 'grab' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGanttTask(task.name);
                          }}
                          onMouseDown={(e) => {
                            if (isPreview) return;
                            e.stopPropagation();
                            setSelectedGanttTask(task.name);
                            setGanttDragState({
                              type: 'move',
                              taskName: task.name,
                              startClientX: e.clientX,
                              startClientY: e.clientY,
                              dayWidth,
                              origStartDate: task.startDateStr,
                              origEndDate: task.endDateStr,
                              origDuration: 0
                            });
                          }}
                        >
                          <polygon
                            points={`${x},${y + 12} ${x + 11},${y} ${x + 22},${y + 12} ${x + 11},${y + 24}`}
                            fill={barColor}
                            stroke={isSelected ? '#ffffff' : strokeColor}
                            strokeWidth={isSelected ? 2.5 : 1.5}
                            style={{ filter: isSelected ? 'drop-shadow(0 0 8px rgba(239, 83, 80, 0.6))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                          />
                          <text x={x + 30} y={y + 16} fill="var(--text-secondary)" fontSize="11" fontWeight="700">
                            🚩 Milestone ({displayStartDate})
                          </text>
                        </g>
                      ) : (
                        // Regular Task Bar Group
                        <g
                          className="gantt-bar-group gantt-interactive-element"
                          style={{ cursor: isBeingMoved ? 'grabbing' : 'grab' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGanttTask(task.name);
                          }}
                          onMouseDown={(e) => {
                            if (isPreview) return;
                            if (e.target.closest('.gantt-resize-handle') || e.target.closest('.gantt-connect-port')) return;
                            e.stopPropagation();
                            setSelectedGanttTask(task.name);
                            setGanttDragState({
                              type: 'move',
                              taskName: task.name,
                              startClientX: e.clientX,
                              startClientY: e.clientY,
                              dayWidth,
                              origStartDate: task.startDateStr,
                              origEndDate: task.endDateStr,
                              origDuration: task.duration
                            });
                          }}
                        >
                          {/* Canva Selection Accent Border */}
                          {isSelected && !isPreview && (
                            <rect
                              x={x - 4}
                              y={y - 3}
                              width={width + 8}
                              height="30"
                              rx="10"
                              fill="none"
                              stroke="var(--primary-main)"
                              strokeWidth="2"
                              strokeDasharray="4 2"
                              style={{ pointerEvents: 'none' }}
                            />
                          )}

                          {/* Connect Target Highlight */}
                          {isConnectTarget && (
                            <rect
                              x={x - 5}
                              y={y - 4}
                              width={width + 10}
                              height="32"
                              rx="11"
                              fill="rgba(16, 185, 129, 0.2)"
                              stroke="#10b981"
                              strokeWidth="2.5"
                              style={{ pointerEvents: 'none' }}
                            />
                          )}

                          {/* Main Task Bar Rect */}
                          <rect
                            x={x}
                            y={y}
                            width={width}
                            height="24"
                            rx="8"
                            fill={barColor}
                            stroke={isSelected ? '#ffffff' : strokeColor}
                            strokeWidth={isSelected ? '2' : '1'}
                            style={{
                              filter: isSelected ? 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))' : 'drop-shadow(0 2px 5px rgba(0,0,0,0.18))',
                              transition: isBeingMoved || isBeingResizedRight || isBeingResizedLeft ? 'none' : 'fill 0.2s ease, stroke 0.2s ease',
                              cursor: isBeingMoved ? 'grabbing' : 'grab'
                            }}
                          />

                          {/* Inside Bar Text */}
                          {width > 60 && (
                            <text
                              x={x + 14}
                              y={y + 16}
                              fill="#ffffff"
                              fontSize="11"
                              fontWeight="700"
                              style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
                            >
                              {task.name.length > Math.floor(width / 9) ? task.name.substring(0, Math.floor(width / 9) - 2) + '..' : task.name}
                            </text>
                          )}

                          {/* Duration Badge on the Right */}
                          <text x={x + width + 14} y={y + 16} fill="var(--text-secondary)" fontSize="10" fontWeight="700" style={{ pointerEvents: 'none' }}>
                            {displayDuration}d
                          </text>

                          {/* Left Resize Handle Zone (Expand / Contract Start Date) */}
                          {!isPreview && (
                            <g
                              className="gantt-resize-handle"
                              cursor="ew-resize"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedGanttTask(task.name);
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setSelectedGanttTask(task.name);
                                setGanttDragState({
                                  type: 'resize-left',
                                  taskName: task.name,
                                  startClientX: e.clientX,
                                  startClientY: e.clientY,
                                  dayWidth,
                                  origStartDate: task.startDateStr,
                                  origEndDate: task.endDateStr,
                                  origDuration: task.duration
                                });
                              }}
                            >
                              {/* Invisible Generous Touch Target */}
                              <rect
                                x={x - 6}
                                y={y - 2}
                                width="18"
                                height="28"
                                fill="transparent"
                              />
                              {/* Visible Grip Bar */}
                              {(isSelected || isHovered || isBeingResizedLeft) && (
                                <g>
                                  <rect
                                    x={x - 3}
                                    y={y + 3}
                                    width="6"
                                    height="18"
                                    rx="3"
                                    fill="#ffffff"
                                    stroke="var(--primary-main)"
                                    strokeWidth="1.5"
                                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                                  />
                                </g>
                              )}
                            </g>
                          )}

                          {/* Right Resize Handle Zone (Expand / Contract End Date) */}
                          {!isPreview && (
                            <g
                              className="gantt-resize-handle"
                              cursor="ew-resize"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedGanttTask(task.name);
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setSelectedGanttTask(task.name);
                                setGanttDragState({
                                  type: 'resize-right',
                                  taskName: task.name,
                                  startClientX: e.clientX,
                                  startClientY: e.clientY,
                                  dayWidth,
                                  origStartDate: task.startDateStr,
                                  origEndDate: task.endDateStr,
                                  origDuration: task.duration
                                });
                              }}
                            >
                              {/* Invisible Generous Touch Target */}
                              <rect
                                x={x + width - 12}
                                y={y - 2}
                                width="18"
                                height="28"
                                fill="transparent"
                              />
                              {/* Visible Grip Bar */}
                              {(isSelected || isHovered || isBeingResizedRight) && (
                                <g>
                                  <rect
                                    x={x + width - 3}
                                    y={y + 3}
                                    width="6"
                                    height="18"
                                    rx="3"
                                    fill="#ffffff"
                                    stroke="var(--primary-main)"
                                    strokeWidth="1.5"
                                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                                  />
                                </g>
                              )}
                            </g>
                          )}

                          {/* Dependency Connector Port (Right Edge) */}
                          {!isPreview && (isSelected || isHovered) && (
                            <circle
                              className="gantt-connect-port"
                              cx={x + width + 8}
                              cy={y + 12}
                              r="5.5"
                              fill="var(--primary-main)"
                              stroke="#ffffff"
                              strokeWidth="1.5"
                              cursor="crosshair"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setSelectedGanttTask(task.name);
                                const rect = canvasContainerRef.current?.getBoundingClientRect();
                                const cX = rect ? (canvasContainerRef.current.scrollLeft + (e.clientX - rect.left)) / zoomScale : e.clientX;
                                const cY = rect ? (canvasContainerRef.current.scrollTop + (e.clientY - rect.top)) / zoomScale : e.clientY;
                                setGanttDragState({
                                  type: 'connect',
                                  taskName: task.name,
                                  startCanvasX: x + width + 8,
                                  startCanvasY: y + 12,
                                  currentCanvasX: cX,
                                  currentCanvasY: cY
                                });
                              }}
                            />
                          )}
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
          {/* 6. Dynamic Date Guidelines while Dragging, Resizing, or Selecting */}
          {activeGuideline && !isPreview && (
            <g className="gantt-active-guidelines" pointerEvents="none">
              {/* Highlight Column Band */}
              {!activeGuideline.isMilestone && (
                <rect
                  x={activeGuideline.startX}
                  y="52"
                  width={Math.max(1, activeGuideline.endX - activeGuideline.startX)}
                  height={totalHeight - 52}
                  fill="var(--primary-main)"
                  fillOpacity="0.07"
                />
              )}

              {/* Start Date Guideline Line */}
              <line
                x1={activeGuideline.startX}
                y1="0"
                x2={activeGuideline.startX}
                y2={totalHeight}
                stroke="var(--primary-main)"
                strokeWidth="1.8"
                strokeDasharray="4,3"
                strokeOpacity="0.95"
              />

              {/* End Date Guideline Line (if regular task) */}
              {!activeGuideline.isMilestone && (
                <line
                  x1={activeGuideline.endX}
                  y1="0"
                  x2={activeGuideline.endX}
                  y2={totalHeight}
                  stroke="var(--primary-main)"
                  strokeWidth="1.8"
                  strokeDasharray="4,3"
                  strokeOpacity="0.95"
                />
              )}

              {/* Top Floating Date Badges */}
              {activeGuideline.isMilestone ? (
                <g transform={`translate(${activeGuideline.startX + 11}, 24)`}>
                  <rect
                    x="-52"
                    y="-11"
                    width="104"
                    height="22"
                    rx="6"
                    fill="#dc2626"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.35))' }}
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="800"
                    fontFamily="'Outfit', sans-serif"
                  >
                    🚩 {activeGuideline.startDate}
                  </text>
                </g>
              ) : (
                <>
                  {/* Start Date Badge */}
                  <g transform={`translate(${activeGuideline.startX}, 24)`}>
                    <rect
                      x="-44"
                      y="-11"
                      width="88"
                      height="22"
                      rx="6"
                      fill="var(--primary-main)"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.35))' }}
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="800"
                      fontFamily="'Outfit', sans-serif"
                    >
                      {activeGuideline.startDate}
                    </text>
                  </g>

                  {/* End Date Badge */}
                  <g transform={`translate(${activeGuideline.endX}, 24)`}>
                    <rect
                      x="-44"
                      y="-11"
                      width="88"
                      height="22"
                      rx="6"
                      fill="var(--primary-main)"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.35))' }}
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="800"
                      fontFamily="'Outfit', sans-serif"
                    >
                      {activeGuideline.endDate}
                    </text>
                  </g>
                </>
              )}
            </g>
          )}
        </svg>

        {/* 6. Inline Renaming Modal/Input when Double-Clicked */}
        {ganttInlineEditingTask && (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
              background: 'var(--background-paper)',
              padding: '20px 24px',
              borderRadius: '16px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              border: '1px solid var(--divider)',
              minWidth: '320px'
            }}
          >
            <Typography variant="subtitle2" style={{ fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
              Rename Task
            </Typography>
            <TextField
              autoFocus
              fullWidth
              size="small"
              value={ganttInlineEditingText}
              onChange={(e) => setGanttInlineEditingText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (ganttInlineEditingText.trim()) {
                    setCode(prev => updateGanttTaskInCode(prev, ganttInlineEditingTask, { name: ganttInlineEditingText.trim() }));
                    if (selectedGanttTask === ganttInlineEditingTask) {
                      setSelectedGanttTask(ganttInlineEditingText.trim());
                    }
                  }
                  setGanttInlineEditingTask(null);
                } else if (e.key === 'Escape') {
                  setGanttInlineEditingTask(null);
                }
              }}
              style={{ marginBottom: '16px' }}
            />
            <Box style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button size="small" onClick={() => setGanttInlineEditingTask(null)} style={{ textTransform: 'none' }}>
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => {
                  if (ganttInlineEditingText.trim()) {
                    setCode(prev => updateGanttTaskInCode(prev, ganttInlineEditingTask, { name: ganttInlineEditingText.trim() }));
                    if (selectedGanttTask === ganttInlineEditingTask) {
                      setSelectedGanttTask(ganttInlineEditingText.trim());
                    }
                  }
                  setGanttInlineEditingTask(null);
                }}
                style={{ textTransform: 'none', fontWeight: 700 }}
              >
                Save
              </Button>
            </Box>
          </div>
        )}
      </div>
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
                SOURCE CODE
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
            <style>{`
              .er-rel-group,
              .usecase-link-group,
              .activity-transition-group,
              .sequence-message-group,
              .gantt-dependency-group {
                cursor: pointer !important;
              }
              .diagram-hit-area {
                stroke: transparent !important;
                fill: none !important;
                opacity: 0 !important;
                filter: none !important;
                pointer-events: auto !important;
              }
              .er-rel-group:hover path:not(.diagram-hit-area),
              .er-rel-group:hover polygon:not(.diagram-hit-area),
              .usecase-link-group:hover path:not(.diagram-hit-area),
              .activity-transition-group:hover path:not(.diagram-hit-area),
              .sequence-message-group:hover line:not(.diagram-hit-area),
              .sequence-message-group:hover polygon:not(.diagram-hit-area),
              .gantt-dependency-group:hover path:not(.diagram-hit-area),
              .gantt-dependency-group:hover polygon:not(.diagram-hit-area) {
                stroke: #ef4444 !important;
                opacity: 0.8 !important;
                filter: drop-shadow(0 0 2px rgba(239, 68, 68, 0.45)) !important;
                transition: stroke 0.15s ease, opacity 0.15s ease, filter 0.15s ease;
              }
              .sequence-message-group:hover polygon:not(.diagram-hit-area),
              .gantt-dependency-group:hover polygon:not(.diagram-hit-area) {
                fill: #ef4444 !important;
              }
              .er-rel-group:hover text,
              .sequence-message-group:hover text,
              .usecase-link-group:hover text,
              .activity-transition-group:hover text {
                fill: #ef4444 !important;
                opacity: 0.85 !important;
                transition: fill 0.15s ease, opacity 0.15s ease;
              }
            `}</style>
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
                {activeTabKey === 'gantt' && (() => {
                  const ganttTasks = parseGantt(editorCode).tasks;
                  const activeSelectedGanttTask = selectedGanttTask ? ganttTasks.find(t => t.name === selectedGanttTask) : null;
                  const activeTaskIndex = activeSelectedGanttTask ? ganttTasks.findIndex(t => t.name === activeSelectedGanttTask.name) : 0;
                  const activeEffectiveColor = activeSelectedGanttTask ? (activeSelectedGanttTask.color || GANTT_PALETTE[Math.max(0, activeTaskIndex) % GANTT_PALETTE.length].color) : '#0D6EFD';

                  return (
                    <>
                      {/* Word-style Contextual Toolbar for Selected Task */}
                      {activeSelectedGanttTask && (
                        <Box
                          className="gantt-top-selected-ribbon"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(241, 245, 249, 0.95)',
                            border: '1.5px solid var(--primary-main)',
                            borderRadius: '8px',
                            padding: '2px 8px',
                            marginRight: '8px',
                            animation: 'fadeIn 0.15s ease-out'
                          }}
                        >
                          {/* Color Swatches */}
                          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                            {GANTT_PALETTE.map((p) => (
                              <button
                                key={p.label}
                                title={`Set Color: ${p.label}`}
                                onClick={() => setCode(prev => updateGanttTaskInCode(prev, activeSelectedGanttTask.name, { color: p.color }))}
                                style={{
                                  width: '14px',
                                  height: '14px',
                                  borderRadius: '50%',
                                  background: p.color,
                                  border: (activeEffectiveColor === p.color) ? '2px solid var(--text-primary)' : `1px solid ${p.border}`,
                                  cursor: 'pointer',
                                  padding: 0,
                                  outline: 'none',
                                  transform: (activeEffectiveColor === p.color) ? 'scale(1.25)' : 'scale(1)',
                                  transition: 'transform 0.1s ease'
                                }}
                              />
                            ))}
                          </div>

                          <div style={{ width: '1px', height: '16px', background: 'var(--divider)' }} />

                          {/* Milestone Toggle */}
                          <button
                            title={activeSelectedGanttTask.isMilestone ? "Convert to Regular Task" : "Convert to Milestone"}
                            onClick={() => {
                              if (activeSelectedGanttTask.isMilestone) {
                                setCode(prev => updateGanttTaskInCode(prev, activeSelectedGanttTask.name, { isMilestone: false, duration: 5, endDateStr: addDaysToGanttDate(activeSelectedGanttTask.startDateStr, 5) }));
                              } else {
                                setCode(prev => updateGanttTaskInCode(prev, activeSelectedGanttTask.name, { isMilestone: true, duration: 0 }));
                              }
                            }}
                            style={{
                              background: activeSelectedGanttTask.isMilestone ? '#ef4444' : 'var(--background-paper)',
                              border: '1px solid var(--divider)',
                              color: activeSelectedGanttTask.isMilestone ? '#fff' : 'var(--text-primary)',
                              borderRadius: '4px',
                              padding: '1px 6px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            🚩
                          </button>

                          {/* Dependencies Badges */}
                          {activeSelectedGanttTask.dependencies && activeSelectedGanttTask.dependencies.length > 0 && (
                            <div style={{ display: 'flex', gap: '3px' }}>
                              {activeSelectedGanttTask.dependencies.map(dep => (
                                <span
                                  key={dep}
                                  title={`Linked to: ${dep}. Click to remove dependency.`}
                                  onClick={() => setCode(prev => removeGanttDependencyInCode(prev, activeSelectedGanttTask.name, dep))}
                                  style={{
                                    background: 'rgba(59, 130, 246, 0.15)',
                                    border: '1px solid rgba(59, 130, 246, 0.4)',
                                    color: 'var(--primary-main)',
                                    borderRadius: '10px',
                                    padding: '1px 5px',
                                    fontSize: '0.66rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2px'
                                  }}
                                >
                                  🔗 {dep} ×
                                </span>
                              ))}
                            </div>
                          )}



                          {/* Delete Task */}
                          <button
                            title="Delete Selected Task"
                            onClick={() => {
                              setCode(prev => deleteGanttTaskInCode(prev, activeSelectedGanttTask.name));
                              setSelectedGanttTask(null);
                            }}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              color: '#ef4444',
                              borderRadius: '4px',
                              padding: '2px 5px',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 13 }} />
                          </button>

                          {/* Deselect / Close button */}
                          <button
                            title="Close (Deselect)"
                            onClick={() => setSelectedGanttTask(null)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              borderRadius: '4px',
                              padding: '0 4px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            ✕
                          </button>
                        </Box>
                      )}

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
                  );
                })()}
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
                  <IconButton size="small" onClick={() => { setZoomScale(activeTabKey === 'activity' ? 0.9 : 1.0); if (canvasContainerRef.current) { canvasContainerRef.current.scrollLeft = 0; canvasContainerRef.current.scrollTop = 0; } }} style={{ color: 'var(--text-primary)' }}>
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
                  width: activeTabKey === 'gantt' ? `${canvasDim.width * zoomScale}px` : `${(canvasDim.width + 100) * zoomScale}px`,
                  height: activeTabKey === 'gantt' ? `${canvasDim.height * zoomScale}px` : `${(canvasDim.height + 100) * zoomScale}px`,
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
                          <path d="M 0 4 L 20 10 L 0 16 M 10 0 L 10 20" fill="none" stroke={isDarkMode ? "var(--primary-main)" : "#334155"} strokeWidth="2" />
                        </marker>
                        <marker id="crow-foot-one" viewBox="0 0 20 20" refX="20" refY="10" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
                          <line x1="8" y1="2" x2="8" y2="18" stroke={isDarkMode ? "var(--primary-main)" : "#334155"} strokeWidth="2" />
                          <line x1="14" y1="2" x2="14" y2="18" stroke={isDarkMode ? "var(--primary-main)" : "#334155"} strokeWidth="2" />
                        </marker>
                        <marker id="usecase-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1 L 10 5 L 0 9" fill="none" stroke={isDarkMode ? "#00FFCC" : "#0284c7"} strokeWidth="1.75" />
                        </marker>
                        <marker id="usecase-generalization-arrow" viewBox="0 0 12 12" refX="12" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                          <path d="M 0 2 L 12 6 L 0 10 Z" fill="var(--background-paper)" stroke={isDarkMode ? "#c084fc" : "#7e22ce"} strokeWidth="1.5" />
                        </marker>
                        <marker id="activity-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                          <path d="M 0 1.5 L 9 5 L 0 8.5 Z" fill={isDarkMode ? "var(--primary-main)" : "#334155"} stroke={isDarkMode ? "var(--primary-main)" : "#334155"} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </marker>
                        <marker id="activity-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                          <path d="M 0 1.5 L 9 5 L 0 8.5 Z" fill={isDarkMode ? "#00FFCC" : "#059669"} stroke={isDarkMode ? "#00FFCC" : "#059669"} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </marker>
                      </defs>

                      {activeTabKey === 'er' && renderERDiagram()}
                      {activeTabKey === 'usecase' && renderUseCaseDiagram()}
                      {activeTabKey === 'activity' && renderActivityDiagram()}

                      {activeTabKey === 'usecase' && usecaseConnecting && (
                        <g style={{ pointerEvents: 'none' }}>
                          <path
                            d={`M ${usecaseConnecting.startX} ${usecaseConnecting.startY} Q ${(usecaseConnecting.startX + usecaseConnecting.currentX) / 2} ${(usecaseConnecting.startY + usecaseConnecting.currentY) / 2 - 20} ${usecaseConnecting.currentX} ${usecaseConnecting.currentY}`}
                            fill="none"
                            stroke={isDarkMode ? "#00FFCC" : "var(--primary-main)"}
                            strokeWidth="2.5"
                            strokeDasharray="5,5"
                            markerEnd="url(#usecase-arrow)"
                          />
                          <circle cx={usecaseConnecting.currentX} cy={usecaseConnecting.currentY} r="6" fill={isDarkMode ? "#00FFCC" : "var(--primary-main)"} />
                        </g>
                      )}

                      {activeTabKey === 'activity' && activityConnecting && (
                        <g style={{ pointerEvents: 'none' }}>
                          <path
                            d={`M ${activityConnecting.startX} ${activityConnecting.startY} Q ${(activityConnecting.startX + activityConnecting.currentX) / 2} ${(activityConnecting.startY + activityConnecting.currentY) / 2 - 20} ${activityConnecting.currentX} ${activityConnecting.currentY}`}
                            fill="none"
                            stroke={isDarkMode ? "#00FFCC" : "var(--primary-main)"}
                            strokeWidth="2.5"
                            strokeDasharray="5,5"
                            markerEnd="url(#activity-arrow)"
                          />
                          <circle cx={activityConnecting.currentX} cy={activityConnecting.currentY} r="6" fill={isDarkMode ? "#00FFCC" : "var(--primary-main)"} />
                        </g>
                      )}
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
                          data-node-id={actor.id}
                          data-node-label={actor.label}
                          className="se-node-card usecase-actor-card"
                          onMouseDown={(e) => {
                            if (e.target.closest('button') || e.target.closest('.usecase-connect-handle')) return;
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
                          <div
                            className="usecase-connect-handle port-left"
                            title="Drag to connect"
                            onMouseDown={(e) => handleStartUseCaseConnect(e, actor.id, actor.label, 'actor', coord, { x: 0, y: 59 })}
                          />
                          <div
                            className="usecase-connect-handle port-right"
                            title="Drag to connect"
                            onMouseDown={(e) => handleStartUseCaseConnect(e, actor.id, actor.label, 'actor', coord, { x: 76, y: 59 })}
                          />
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
                          data-node-id={uc.id}
                          data-node-label={uc.label}
                          className="se-node-card usecase-bubble-card"
                          onMouseDown={(e) => {
                            if (e.target.closest('button') || e.target.closest('.usecase-connect-handle')) return;
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
                          <div
                            className="usecase-connect-handle port-left"
                            title="Drag to connect"
                            onMouseDown={(e) => handleStartUseCaseConnect(e, uc.id, uc.label, 'usecase', coord, { x: 0, y: 25 })}
                          />
                          <div
                            className="usecase-connect-handle port-right"
                            title="Drag to connect"
                            onMouseDown={(e) => handleStartUseCaseConnect(e, uc.id, uc.label, 'usecase', coord, { x: 200, y: 25 })}
                          />
                          <span style={{ fontWeight: 'bold', fontSize: '0.85rem', margin: 0, padding: 0, lineHeight: 1.2, textAlign: 'center' }}>
                            {uc.label}
                          </span>
                        </div>
                      );
                    })}

                    {activeTabKey === 'activity' && parsedActivity.nodes.map((node, idx) => {
                      const coord = nodePositions[node.id] || activityAutoPositions[node.id] || { x: 300, y: idx * 80 + 70 };
                      const isActiveInSim = isSimulating && simActiveNodeIds.includes(node.id);

                      if (node.type === 'start') {
                        return (
                          <div
                            key={idx}
                            data-act-node-id={node.id}
                            data-act-node-label={node.label || node.id}
                            data-act-node-type={node.type}
                            className="se-node-card activity-node-card activity-start-node"
                            onMouseDown={(e) => {
                              if (e.target.closest('button') || e.target.closest('.activity-connect-handle')) return;
                              hasDraggedNodeRef.current = false;
                              setDraggingNode(node.id);
                              dragStartOffset.current = {
                                x: e.clientX / zoomScale - coord.x,
                                y: e.clientY / zoomScale - coord.y
                              };
                            }}
                            onClick={(e) => {
                              if (hasDraggedNodeRef.current) return;
                              e.stopPropagation();
                              setEditingActNode(node);
                            }}
                            style={{
                              position: 'absolute',
                              left: `${coord.x}px`,
                              top: `${coord.y}px`,
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                              border: isActiveInSim ? '2.5px solid #00FFCC' : '2px solid #34D399',
                              boxShadow: isActiveInSim ? '0 0 16px #00FFCC, 0 0 8px #10B981' : '0 3px 10px rgba(16, 185, 129, 0.35)',
                              cursor: draggingNode === node.id ? 'grabbing' : 'grab',
                              zIndex: draggingNode === node.id ? 10 : 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              userSelect: 'none',
                              transition: 'box-shadow 0.3s ease, border 0.3s ease'
                            }}
                            title={`Start: ${node.label} (Click to edit)`}
                          >
                            <div
                              className="activity-connect-handle port-bottom"
                              title="Drag to connect"
                              onMouseDown={(e) => handleStartActivityConnect(e, node.id, node.label, 'start', coord, { x: 16, y: 32 })}
                            />
                            <div
                              className="activity-connect-handle port-right"
                              title="Drag to connect"
                              onMouseDown={(e) => handleStartActivityConnect(e, node.id, node.label, 'start', coord, { x: 32, y: 16 })}
                            />
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff' }} />
                          </div>
                        );
                      }

                      if (node.type === 'end') {
                        return (
                          <div
                            key={idx}
                            data-act-node-id={node.id}
                            data-act-node-label={node.label || node.id}
                            data-act-node-type={node.type}
                            className="se-node-card activity-node-card activity-end-node"
                            onMouseDown={(e) => {
                              if (e.target.closest('button') || e.target.closest('.activity-connect-handle')) return;
                              hasDraggedNodeRef.current = false;
                              setDraggingNode(node.id);
                              dragStartOffset.current = {
                                x: e.clientX / zoomScale - coord.x,
                                y: e.clientY / zoomScale - coord.y
                              };
                            }}
                            onClick={(e) => {
                              if (hasDraggedNodeRef.current) return;
                              e.stopPropagation();
                              setEditingActNode(node);
                            }}
                            style={{
                              position: 'absolute',
                              left: `${coord.x}px`,
                              top: `${coord.y}px`,
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'var(--background-paper)',
                              border: isActiveInSim ? '2.5px solid #00FFCC' : '2px solid #EF4444',
                              boxShadow: isActiveInSim ? '0 0 16px #00FFCC' : '0 3px 10px rgba(239, 68, 68, 0.25)',
                              cursor: draggingNode === node.id ? 'grabbing' : 'grab',
                              zIndex: draggingNode === node.id ? 10 : 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              userSelect: 'none',
                              transition: 'box-shadow 0.3s ease, border 0.3s ease'
                            }}
                            title={`End / Final: ${node.label} (Click to edit)`}
                          >
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#EF4444' }} />
                          </div>
                        );
                      }

                      if (node.type === 'fork' || node.type === 'join') {
                        const isFork = node.type === 'fork';
                        return (
                          <div
                            key={idx}
                            data-act-node-id={node.id}
                            data-act-node-label={node.label || node.id}
                            data-act-node-type={node.type}
                            className="se-node-card activity-node-card activity-bar-node"
                            onMouseDown={(e) => {
                              if (e.target.closest('button') || e.target.closest('.activity-connect-handle')) return;
                              hasDraggedNodeRef.current = false;
                              setDraggingNode(node.id);
                              dragStartOffset.current = {
                                x: e.clientX / zoomScale - coord.x,
                                y: e.clientY / zoomScale - coord.y
                              };
                            }}
                            onClick={(e) => {
                              if (hasDraggedNodeRef.current) return;
                              e.stopPropagation();
                              setEditingActNode(node);
                            }}
                            style={{
                              position: 'absolute',
                              left: `${coord.x}px`,
                              top: `${coord.y}px`,
                              width: '140px',
                              height: '10px',
                              borderRadius: '5px',
                              background: isActiveInSim ? '#00FFCC' : 'var(--primary-main)',
                              boxShadow: isActiveInSim ? '0 0 16px #00FFCC' : '0 2px 6px rgba(0,0,0,0.25)',
                              cursor: draggingNode === node.id ? 'grabbing' : 'grab',
                              zIndex: draggingNode === node.id ? 10 : 4,
                              userSelect: 'none',
                              transition: 'background 0.3s ease, box-shadow 0.3s ease'
                            }}
                            title={`${isFork ? 'Fork (Split)' : 'Join (Merge)'}: ${node.label || node.id} (Click to edit)`}
                          >
                            <div
                              className="activity-connect-handle port-top"
                              title="Drag to connect"
                              onMouseDown={(e) => handleStartActivityConnect(e, node.id, node.label || node.id, node.type, coord, { x: 70, y: 0 })}
                            />
                            <div
                              className="activity-connect-handle port-bottom"
                              title="Drag to connect"
                              onMouseDown={(e) => handleStartActivityConnect(e, node.id, node.label || node.id, node.type, coord, { x: 70, y: 10 })}
                            />
                          </div>
                        );
                      }

                      if (node.type === 'decision') {
                        return (
                          <div
                            key={idx}
                            data-act-node-id={node.id}
                            data-act-node-label={node.label || node.id}
                            data-act-node-type={node.type}
                            className="se-node-card activity-node-card activity-decision-node"
                            onMouseDown={(e) => {
                              if (e.target.closest('button') || e.target.closest('.activity-connect-handle')) return;
                              hasDraggedNodeRef.current = false;
                              setDraggingNode(node.id);
                              dragStartOffset.current = {
                                x: e.clientX / zoomScale - coord.x,
                                y: e.clientY / zoomScale - coord.y
                              };
                            }}
                            onClick={(e) => {
                              if (hasDraggedNodeRef.current) return;
                              e.stopPropagation();
                              setEditingActNode(node);
                            }}
                            style={{
                              position: 'absolute',
                              left: `${coord.x}px`,
                              top: `${coord.y}px`,
                              width: '120px',
                              height: '56px',
                              cursor: draggingNode === node.id ? 'grabbing' : 'grab',
                              zIndex: draggingNode === node.id ? 10 : 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textAlign: 'center',
                              userSelect: 'none',
                              boxSizing: 'border-box'
                            }}
                            title={`Decision: ${node.label} (Click to edit)`}
                          >
                            <div
                              className="activity-connect-handle port-top"
                              title="Drag to connect"
                              onMouseDown={(e) => handleStartActivityConnect(e, node.id, node.label || node.id, 'decision', coord, { x: 60, y: 0 })}
                            />
                            <div
                              className="activity-connect-handle port-bottom"
                              title="Drag to connect"
                              onMouseDown={(e) => handleStartActivityConnect(e, node.id, node.label || node.id, 'decision', coord, { x: 60, y: 56 })}
                            />
                            <div
                              className="activity-connect-handle port-left"
                              title="Drag to connect"
                              onMouseDown={(e) => handleStartActivityConnect(e, node.id, node.label || node.id, 'decision', coord, { x: 0, y: 28 })}
                            />
                            <div
                              className="activity-connect-handle port-right"
                              title="Drag to connect"
                              onMouseDown={(e) => handleStartActivityConnect(e, node.id, node.label || node.id, 'decision', coord, { x: 120, y: 28 })}
                            />
                            <svg width="120" height="56" style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}>
                              <polygon
                                points="60,2 118,28 60,54 2,28"
                                fill="var(--background-paper)"
                                stroke={isActiveInSim ? '#00FFCC' : 'var(--primary-main)'}
                                strokeWidth={isActiveInSim ? 2.5 : 1.5}
                                style={{ filter: isActiveInSim ? 'drop-shadow(0 0 8px #00FFCC)' : 'none', transition: 'stroke 0.3s ease' }}
                              />
                            </svg>
                            <span style={{ position: 'relative', zIndex: 2, fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center', width: '100%', padding: '0 10px', lineHeight: 1.15, display: 'block', wordBreak: 'break-word', boxSizing: 'border-box' }}>
                              {node.label}
                            </span>
                          </div>
                        );
                      }

                      // Default: Action node
                      return (
                        <div
                          key={idx}
                          data-act-node-id={node.id}
                          data-act-node-label={node.label || node.id}
                          data-act-node-type={node.type}
                          className="se-node-card activity-node-card activity-action-card"
                          onMouseDown={(e) => {
                            if (e.target.closest('button') || e.target.closest('.activity-connect-handle')) return;
                            hasDraggedNodeRef.current = false;
                            setDraggingNode(node.id);
                            dragStartOffset.current = {
                              x: e.clientX / zoomScale - coord.x,
                              y: e.clientY / zoomScale - coord.y
                            };
                          }}
                          onClick={(e) => {
                            if (hasDraggedNodeRef.current) return;
                            e.stopPropagation();
                            setEditingActNode(node);
                          }}
                          style={{
                            position: 'absolute',
                            left: `${coord.x}px`,
                            top: `${coord.y}px`,
                            width: '180px',
                            minHeight: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'var(--background-paper)',
                            border: isActiveInSim ? '2px solid #00FFCC' : '1.5px solid var(--primary-main)',
                            boxShadow: isActiveInSim ? '0 0 16px rgba(0, 255, 204, 0.4)' : '0 3px 8px rgba(0, 0, 0, 0.08)',
                            color: 'var(--text-primary)',
                            zIndex: draggingNode === node.id ? 10 : 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '6px 12px',
                            cursor: draggingNode === node.id ? 'grabbing' : 'grab',
                            boxSizing: 'border-box',
                            userSelect: 'none',
                            textAlign: 'center',
                            transition: 'border 0.3s ease, box-shadow 0.3s ease'
                          }}
                          title={`Action: ${node.label} (Click to edit)`}
                        >
                          <div
                            className="activity-connect-handle port-top"
                            title="Drag to connect"
                            onMouseDown={(e) => handleStartActivityConnect(e, node.id, node.label, 'action', coord, { x: 90, y: 0 })}
                          />
                          <div
                            className="activity-connect-handle port-bottom"
                            title="Drag to connect"
                            onMouseDown={(e) => handleStartActivityConnect(e, node.id, node.label, 'action', coord, { x: 90, y: 48 })}
                          />
                          <div
                            className="activity-connect-handle port-left"
                            title="Drag to connect"
                            onMouseDown={(e) => handleStartActivityConnect(e, node.id, node.label, 'action', coord, { x: 0, y: 24 })}
                          />
                          <div
                            className="activity-connect-handle port-right"
                            title="Drag to connect"
                            onMouseDown={(e) => handleStartActivityConnect(e, node.id, node.label, 'action', coord, { x: 180, y: 24 })}
                          />
                          <span style={{ fontWeight: 700, fontSize: '0.8rem', lineHeight: 1.2, color: 'var(--text-primary)', width: '100%', textAlign: 'center', margin: 0, padding: 0, display: 'block', wordBreak: 'break-word' }}>
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

            <UseCaseRelationDialog
              open={isUseCaseRelDialogOpen}
              onClose={() => setIsUseCaseRelDialogOpen(false)}
              sourceLabel={pendingUseCaseRel.sourceLabel}
              targetLabel={pendingUseCaseRel.targetLabel}
              onSubmit={(relType) => {
                addUseCaseRelationInCode(pendingUseCaseRel.sourceLabel, pendingUseCaseRel.targetLabel, relType);
                setIsUseCaseRelDialogOpen(false);
              }}
            />

            <ActivityTransitionDialog
              open={isActTransitionDialogOpen}
              onClose={() => setIsActTransitionDialogOpen(false)}
              sourceLabel={pendingActTransition.sourceLabel}
              targetLabel={pendingActTransition.targetLabel}
              onSubmit={(guard) => {
                addActivityTransitionInCode(pendingActTransition.sourceId, pendingActTransition.targetId, guard);
                setIsActTransitionDialogOpen(false);
              }}
            />

            {/* EDIT & DELETE CONNECTION DIALOGS ACROSS ALL DIAGRAMS */}
            {activeTabKey === 'er' && editingERRel && (
              <EditERRelationDialog
                open={!!editingERRel}
                onClose={() => setEditingERRel(null)}
                relation={editingERRel}
                entities={parseER(code)?.entities || []}
                onSubmit={(...args) => {
                  handleUpdateERRelationship(...args);
                  setEditingERRel(null);
                }}
                onDelete={(rel) => {
                  handleDeleteERRelationship(rel);
                  setEditingERRel(null);
                }}
              />
            )}

            {activeTabKey === 'usecase' && editingUCLink && (
              <EditUseCaseLinkDialog
                open={!!editingUCLink}
                onClose={() => setEditingUCLink(null)}
                link={editingUCLink}
                actors={parseUseCase(code)?.actors || []}
                usecases={parseUseCase(code)?.usecases || []}
                onSubmit={(...args) => {
                  handleUpdateUseCaseLink(...args);
                  setEditingUCLink(null);
                }}
                onDelete={(link) => {
                  handleDeleteUseCaseLink(link);
                  setEditingUCLink(null);
                }}
              />
            )}

            {activeTabKey === 'activity' && editingActTrans && (
              <EditActivityTransitionDialog
                open={!!editingActTrans}
                onClose={() => setEditingActTrans(null)}
                transition={editingActTrans}
                nodes={parsedActivity?.nodes || []}
                onSubmit={(...args) => {
                  handleUpdateActivityTransition(...args);
                  setEditingActTrans(null);
                }}
                onDelete={(trans) => {
                  handleDeleteActivityTransition(trans);
                  setEditingActTrans(null);
                }}
              />
            )}

            {activeTabKey === 'activity' && editingActNode && (
              <EditActivityNodeDialog
                open={!!editingActNode}
                onClose={() => setEditingActNode(null)}
                node={editingActNode}
                partitions={parsedActivity?.partitions || []}
                onSubmit={(...args) => {
                  handleUpdateActivityNode(...args);
                  setEditingActNode(null);
                }}
                onDelete={(node) => {
                  handleDeleteActivityNode(node);
                  setEditingActNode(null);
                }}
              />
            )}

            {activeTabKey === 'sequence' && editingSeqMsg && (
              <EditSequenceMessageDialog
                open={!!editingSeqMsg}
                onClose={() => setEditingSeqMsg(null)}
                messageData={editingSeqMsg}
                participants={parseSequence(code)?.participants || []}
                onSubmit={(...args) => {
                  handleUpdateSequenceMessage(...args);
                  setEditingSeqMsg(null);
                }}
                onDelete={(msgIdx) => {
                  handleDeleteSequenceMessage(msgIdx);
                  setEditingSeqMsg(null);
                }}
              />
            )}

            {activeTabKey === 'gantt' && editingGanttDep && (
              <EditGanttDependencyDialog
                open={!!editingGanttDep}
                onClose={() => setEditingGanttDep(null)}
                dependency={editingGanttDep}
                tasks={parseGantt(editorCode)?.tasks || []}
                onSubmit={(...args) => {
                  handleUpdateGanttDependency(...args);
                  setEditingGanttDep(null);
                }}
                onDelete={(from, to) => {
                  handleDeleteGanttDependency(from, to);
                  setEditingGanttDep(null);
                }}
              />
            )}
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
                    {activeTabKey === 'gantt' && renderGanttChart(true)}

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
                      const coord = nodePositions[node.id] || activityAutoPositions[node.id] || { x: 300, y: idx * 80 + 70 };

                      if (node.type === 'start') {
                        return (
                          <div
                            key={idx}
                            className="se-node-card activity-start-node"
                            style={{
                              position: 'absolute',
                              left: `${coord.x}px`,
                              top: `${coord.y}px`,
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                              border: '2px solid #34D399',
                              boxShadow: '0 3px 10px rgba(16, 185, 129, 0.35)',
                              zIndex: 3,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              userSelect: 'none'
                            }}
                          >
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff' }} />
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
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'var(--background-paper)',
                              border: '2px solid #EF4444',
                              boxShadow: '0 3px 10px rgba(239, 68, 68, 0.25)',
                              zIndex: 3,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              userSelect: 'none'
                            }}
                          >
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#EF4444' }} />
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
                              width: '140px',
                              height: '10px',
                              borderRadius: '5px',
                              background: 'var(--primary-main)',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
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
                              width: '120px',
                              height: '56px',
                              zIndex: 3,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textAlign: 'center',
                              userSelect: 'none',
                              boxSizing: 'border-box'
                            }}
                          >
                            <svg width="120" height="56" style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}>
                              <polygon
                                points="60,2 118,28 60,54 2,28"
                                fill="var(--background-paper)"
                                stroke="var(--primary-main)"
                                strokeWidth={1.5}
                              />
                            </svg>
                            <span style={{ position: 'relative', zIndex: 2, fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center', width: '100%', padding: '0 10px', lineHeight: 1.15, display: 'block', wordBreak: 'break-word', boxSizing: 'border-box' }}>
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
                            width: '180px',
                            minHeight: '46px',
                            height: '46px',
                            borderRadius: '12px',
                            background: 'var(--background-paper)',
                            border: '1.5px solid var(--primary-main)',
                            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.08)',
                            color: 'var(--text-primary)',
                            zIndex: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '6px 12px',
                            boxSizing: 'border-box',
                            userSelect: 'none',
                            textAlign: 'center'
                          }}
                        >
                          <span style={{ fontWeight: 700, fontSize: '0.8rem', lineHeight: 1.2, color: 'var(--text-primary)', width: '100%', textAlign: 'center', margin: 0, padding: 0, display: 'block', wordBreak: 'break-word' }}>
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
