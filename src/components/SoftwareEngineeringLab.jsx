import React, { useState, useEffect, useRef, useContext, useCallback, useDeferredValue } from 'react';
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
  useMediaQuery
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
  Delete as DeleteIcon
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import html2canvas from 'html2canvas';
import logoImg from '../assets/sp-logo.png';

// Default Templates for the Diagrams
const TEMPLATES = {
  er: `ENTITY Student
ATTRIBUTES
student_id : int PRIMARY KEY
name : string
email : string

ENTITY Course
ATTRIBUTES
course_id : int PRIMARY KEY
title : string
credits : int

ENTITY Instructor
ATTRIBUTES
instructor_id : int PRIMARY KEY
name : string
department : string

ENTITY Enrollment
ATTRIBUTES
student_id : int FOREIGN KEY
course_id : int FOREIGN KEY
semester : string
grade : string

RELATIONSHIP Student MANY Enrolls Enrollment ONE
RELATIONSHIP Course MANY Has Enrollment ONE

RELATIONSHIP Instructor ONE Teaches Course MANY`,
  usecase: `SYSTEM SophiaPath

ACTOR Guest
ACTOR Student
ACTOR Instructor
ACTOR Admin

USE CASE Register
USE CASE Login
USE CASE View Courses
USE CASE Enroll in Course
USE CASE Complete Lesson
USE CASE Manage Users

Student -> Register
Student -> Login
Student -> View Courses
Student -> Enroll in Course
Student -> Complete Lesson

Guest -> Register
Guest -> View Courses

Instructor -> Manage Courses

Admin -> Manage Users

Complete Lesson EXTENDS View Courses
Enroll in Course INCLUDES Login`,
  sequence: `SEQUENCE User Login and Course Enrollment

PARTICIPANT Student
PARTICIPANT Web App
PARTICIPANT Authentication Service
PARTICIPANT Database
PARTICIPANT Notification Service

Student sends "Open Login Page" to Web App.

Web App displays Login Form to Student.

Student sends "Email & Password" to Web App.

Web App sends "Validate Credentials" to Authentication Service.

Authentication Service requests User Record from Database.

Database returns User Record.

IF credentials are valid THEN

    Authentication Service generates Access Token.

    Authentication Service returns Success to Web App.

    Web App stores Session.

    Web App displays Dashboard to Student.

    Student sends "Enroll in Cybersecurity Course" to Web App.

    Web App requests Course Details from Database.

    Database returns Course Information.

    IF seats are available THEN

        Web App requests Enrollment from Database.

        Database creates Enrollment.

        Database returns Enrollment Success.

        Web App sends Confirmation to Notification Service.

        Notification Service sends Email Confirmation to Student.

        Web App displays "Enrollment Successful".

    ELSE

        Web App displays "Course is Full".

    END

ELSE

    Authentication Service returns Authentication Failed.

    Web App displays Invalid Credentials.

END`,
  gantt: `GANTT SophiaPath Development

PROJECT SophiaPath

TASK Project Planning
START 2026-07-01
END 2026-07-05

TASK UI Design
START 2026-07-03
END 2026-07-12
DEPENDS ON Project Planning

TASK Backend Development
START 2026-07-06
END 2026-07-25
DEPENDS ON Project Planning

TASK Frontend Development
START 2026-07-08
END 2026-07-28
DEPENDS ON UI Design

TASK Database Design
START 2026-07-06
END 2026-07-10

TASK Authentication
START 2026-07-12
END 2026-07-18
DEPENDS ON Backend Development
DEPENDS ON Database Design

TASK ER Diagram Generator
START 2026-07-15
END 2026-07-22
DEPENDS ON Frontend Development
DEPENDS ON Backend Development

TASK Testing
START 2026-07-26
END 2026-08-03
DEPENDS ON Authentication
DEPENDS ON ER Diagram Generator

TASK Deployment
START 2026-08-04
END 2026-08-05
DEPENDS ON Testing

MILESTONE Version 1.0
DATE 2026-08-05`
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
          background: 'rgba(30, 30, 56, 0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '12px',
          maxWidth: '450px',
          width: '100%'}
      }}
    >
      <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
        🔗 Create Relationship
      </DialogTitle>
      <DialogContent style={{ marginTop: '16px' }}>
        <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '16px' }}>
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
            InputLabelProps={{ style: { color: 'rgba(255,255,255,0.6)' } }}
            inputProps={{ style: { color: '#ffffff' } }}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.15)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' }
            }}
          />
        </Box>

        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
          <Box style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', textAlign: 'center' }}>
            <Typography variant="subtitle2" style={{ fontWeight: 'bold', color: 'var(--primary-main)', marginBottom: '12px' }}>
              {source}
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>Cardinality</InputLabel>
              <Select
                value={sourceCard}
                label="Cardinality"
                onChange={(e) => setSourceCard(e.target.value)}
                style={{ color: '#fff', fontSize: '0.85rem' }}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' }}}
              >
                <MenuItem value="ONE">ONE (1)</MenuItem>
                <MenuItem value="MANY">MANY (M)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Typography variant="body1" style={{ fontWeight: 'bold', color: 'rgba(255,255,255,0.4)' }}>
            TO
          </Typography>

          <Box style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', textAlign: 'center' }}>
            <Typography variant="subtitle2" style={{ fontWeight: 'bold', color: 'var(--primary-main)', marginBottom: '12px' }}>
              {target}
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>Cardinality</InputLabel>
              <Select
                value={targetCard}
                label="Cardinality"
                onChange={(e) => setTargetCard(e.target.value)}
                style={{ color: '#fff', fontSize: '0.85rem' }}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.15)' },
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
      <DialogActions style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px', gap: '8px' }}>
        <Button onClick={onClose} style={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none' }}>
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
    <Dialog open={open} onClose={onClose} PaperProps={{ style: { background: 'rgba(30, 30, 56, 0.95)', border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff', borderRadius: '16px', padding: '12px', maxWidth: '400px', width: '100%' } }}>
      <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
        👤 Add Actor
      </DialogTitle>
      <DialogContent style={{ marginTop: '16px' }}>
        {error && <Alert severity="error" style={{ marginBottom: '16px', borderRadius: '8px' }}>{error}</Alert>}
        <TextField fullWidth label="Actor Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. User" variant="outlined" size="small" InputLabelProps={{ style: { color: 'rgba(255,255,255,0.7)' } }} inputProps={{ style: { color: '#fff' } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }, '&:hover fieldset': { borderColor: 'var(--primary-main)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' } } }} />
      </DialogContent>
      <DialogActions style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px', gap: '8px' }}>
        <Button onClick={onClose} style={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none' }}>Cancel</Button>
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
    <Dialog open={open} onClose={onClose} PaperProps={{ style: { background: 'rgba(30, 30, 56, 0.95)', border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff', borderRadius: '16px', padding: '12px', maxWidth: '400px', width: '100%' } }}>
      <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
        🎯 Add Use Case
      </DialogTitle>
      <DialogContent style={{ marginTop: '16px' }}>
        {error && <Alert severity="error" style={{ marginBottom: '16px', borderRadius: '8px' }}>{error}</Alert>}
        <TextField fullWidth label="Use Case Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Login to System" variant="outlined" size="small" InputLabelProps={{ style: { color: 'rgba(255,255,255,0.7)' } }} inputProps={{ style: { color: '#fff' } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }, '&:hover fieldset': { borderColor: 'var(--primary-main)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' } } }} />
      </DialogContent>
      <DialogActions style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px', gap: '8px' }}>
        <Button onClick={onClose} style={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none' }}>Cancel</Button>
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
    <Dialog open={open} onClose={onClose} PaperProps={{ style: { background: 'rgba(30, 30, 56, 0.95)', border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff', borderRadius: '16px', padding: '12px', maxWidth: '400px', width: '100%' } }}>
      <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
        ⏹ Add Participant
      </DialogTitle>
      <DialogContent style={{ marginTop: '16px' }}>
        {error && <Alert severity="error" style={{ marginBottom: '16px', borderRadius: '8px' }}>{error}</Alert>}
        <TextField fullWidth label="Participant Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Database" variant="outlined" size="small" InputLabelProps={{ style: { color: 'rgba(255,255,255,0.7)' } }} inputProps={{ style: { color: '#fff' } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }, '&:hover fieldset': { borderColor: 'var(--primary-main)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' } } }} />
      </DialogContent>
      <DialogActions style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px', gap: '8px' }}>
        <Button onClick={onClose} style={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none' }}>Cancel</Button>
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
    <Dialog open={open} onClose={onClose} PaperProps={{ style: { background: 'rgba(30, 30, 56, 0.95)', border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff', borderRadius: '16px', padding: '12px', maxWidth: '450px', width: '100%' } }}>
      <DialogTitle style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
        ✉️ Add Message
      </DialogTitle>
      <DialogContent style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && <Alert severity="error" style={{ borderRadius: '8px' }}>{error}</Alert>}

        <Box style={{ display: 'flex', gap: '16px' }}>
          <FormControl fullWidth size="small">
            <InputLabel style={{ color: 'rgba(255,255,255,0.7)' }}>From</InputLabel>
            <Select value={source} label="From" onChange={(e) => setSource(e.target.value)} style={{ color: '#fff' }} sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.15)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' } }}>
              {participants.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel style={{ color: 'rgba(255,255,255,0.7)' }}>To</InputLabel>
            <Select value={target} label="To" onChange={(e) => setTarget(e.target.value)} style={{ color: '#fff' }} sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.15)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' } }}>
              {participants.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <TextField fullWidth label="Message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. Request Data" variant="outlined" size="small" InputLabelProps={{ style: { color: 'rgba(255,255,255,0.7)' } }} inputProps={{ style: { color: '#fff' } }} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }, '&:hover fieldset': { borderColor: 'var(--primary-main)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' } } }} />
      </DialogContent>
      <DialogActions style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px', gap: '8px' }}>
        <Button onClick={onClose} style={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none' }}>Cancel</Button>
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

export const SoftwareEngineeringLab = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDarkMode = theme.palette.mode === 'dark';
  const { themeMode } = useContext(ThemeContext);

  // Core Editor & Panel states
  const [activeTab, setActiveTab] = useState(0);
  const [editorCode, setCode] = useState(TEMPLATES.er);
  const code = useDeferredValue(editorCode);
  const [error, setError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  // States for visual entity and relationship builder
  const [isAddEntityOpen, setIsAddEntityOpen] = useState(false);
  const [isAddActorOpen, setIsAddActorOpen] = useState(false);
  const [isAddUseCaseOpen, setIsAddUseCaseOpen] = useState(false);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isAddSequenceMessageOpen, setIsAddSequenceMessageOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [ganttViewScale, setGanttViewScale] = useState('weeks'); // 'days', 'weeks', 'months'

  const [isRelationDialogOpen, setIsRelationDialogOpen] = useState(false);
  const [pendingRelationSource, setPendingRelationSource] = useState(null);
  const [relationTarget, setRelationTarget] = useState(null);

  // Split-pane slider state
  const [splitPercent, setSplitPercent] = useState(35);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Zooming and Panning states
  const [zoomScale, setZoomScale] = useState(1.0);
  const [draggingNode, setDraggingNode] = useState(null);
  const [ganttWaypoints, setGanttWaypoints] = useState({});
  const [usecaseWaypoints, setUsecaseWaypoints] = useState({});
  const [draggingWaypoint, setDraggingWaypoint] = useState(null);

  // Preview Dialog states matching Java UML playground
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(themeMode || 'dark');
  const [previewZoomScale, setPreviewZoomScale] = useState(1.0);

  useEffect(() => {
    if (themeMode) {
      setActiveTheme(themeMode);
    }
  }, [themeMode]);

  // Separate layout states per diagram type to prevent overlap/loss
  const [allNodePositions, setAllNodePositions] = useState({
    er: {},
    usecase: {}
  });

  const tabsMeta = [
    { key: 'er', label: 'ER Diagram', title: 'Entity-Relationship Editor' },
    { key: 'usecase', label: 'Use Case Diagram', title: 'Use Case Modeler' },
    { key: 'sequence', label: 'Sequence Diagram', title: 'Sequence Flow Modeler' },
    { key: 'gantt', label: 'Gantt Chart', title: 'Scrum Gantt Scheduler' }
  ];

  const activeTabKey = tabsMeta[activeTab].key;
  const activeTabTitle = tabsMeta[activeTab].title;

  useEffect(() => {
    setPendingRelationSource(null);
    setRelationTarget(null);
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

  const handleTabChange = (event) => {
    const newValue = event.target.value;
    setActiveTab(newValue);
    const nextKey = tabsMeta[newValue].key;
    setCode(TEMPLATES[nextKey]);
    setZoomScale(1.0);
    setError(null);
    if (canvasContainerRef.current) {
      canvasContainerRef.current.scrollLeft = 0;
      canvasContainerRef.current.scrollTop = 0;
    }
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
          // Use the smart graph-aware auto-layout for ALL nodes
          // (existing positions are preserved by only setting new ones)
          const autoPositions = computeUseCaseAutoLayout(actors, usecases, links);
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
      const { actors, usecases } = parseUseCase(code);
      actors.forEach(act => {
        const pos = nodePositions[act.id];
        if (pos) {
          if (pos.x + 200 + 200 > maxX) maxX = pos.x + 200 + 200;
          if (pos.y + 150 + 200 > maxY) maxY = pos.y + 150 + 200;
        }
      });
      usecases.forEach(uc => {
        const pos = nodePositions[uc.id];
        if (pos) {
          if (pos.x + 250 + 200 > maxX) maxX = pos.x + 250 + 200;
          if (pos.y + 150 + 200 > maxY) maxY = pos.y + 150 + 200;
        }
      });
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
      let xs = [];
      let ys = [];

      entities.forEach((entity) => {
        // Entity card bounds (150x50)
        const entPos = nodePositions[entity.name];
        if (entPos) {
          xs.push(entPos.x);
          xs.push(entPos.x + 150);
          ys.push(entPos.y);
          ys.push(entPos.y + 50);
        }

        // Attributes bounds (radius 42x18)
        const fields = entity.fields || [];
        fields.forEach(f => {
          const attrKey = `${entity.name}::attr::${f.name}`;
          const attrPos = nodePositions[attrKey];
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
        const relPos = nodePositions[relKey];
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
      const autoPositions = computeUseCaseAutoLayout(actors, usecases, links);
      let xs = [];
      let ys = [];

      actors.forEach((act, idx) => {
        const pos = nodePositions[act.id] || autoPositions[act.id] || { x: 100, y: idx * 180 + 150 };
        xs.push(pos.x);
        xs.push(pos.x + 120);
        ys.push(pos.y);
        ys.push(pos.y + 120);
      });

      usecases.forEach((uc, idx) => {
        const pos = nodePositions[uc.id] || autoPositions[uc.id] || { x: 420, y: idx * 110 + 100 };
        xs.push(pos.x);
        xs.push(pos.x + 180); // Width of usecase is max ~180-200. We can use 250 to be safe, or just stick to 180 as before.
        ys.push(pos.y);
        ys.push(pos.y + 80);
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
        width: (maxX - minX) + padding + padRight,
        height: (maxY - minY) + padding + padBottom
      };
    }

    return { x: 0, y: 0, width: 1200, height: 800 };
  };

  const handleDownloadPreviewPng = async () => {
    try {
      const element = document.getElementById('se-preview-capture-content');
      if (!element) return;

      // Temporarily reset scroll position of the preview canvas container to avoid html2canvas cutoff bugs
      const scrollLeft = previewCanvasContainerRef.current ? previewCanvasContainerRef.current.scrollLeft : 0;
      const scrollTop = previewCanvasContainerRef.current ? previewCanvasContainerRef.current.scrollTop : 0;
      if (previewCanvasContainerRef.current) {
        previewCanvasContainerRef.current.scrollLeft = 0;
        previewCanvasContainerRef.current.scrollTop = 0;
      }

      await new Promise(r => setTimeout(r, 60));

      const bounds = getDiagramBounds(activeTabKey, code);

      const fullCanvas = await html2canvas(element, {
        backgroundColor: activeTheme === 'dark' ? '#121212' : '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const wrapper = clonedDoc.getElementById('se-preview-capture-content');
          const inner = clonedDoc.getElementById('se-preview-canvas-inner');
          if (wrapper && inner) {
            inner.style.transform = 'none';
            const reqW = (bounds.width + bounds.x + 100) + 'px';
            const reqH = (bounds.height + bounds.y + 100) + 'px';
            wrapper.style.width = reqW;
            wrapper.style.height = reqH;
            inner.style.width = reqW;
            inner.style.height = reqH;

            let parent = wrapper.parentElement;
            while (parent && parent.tagName !== 'BODY') {
              parent.style.overflow = 'visible';
              parent.style.maxHeight = 'none';
              parent.style.maxWidth = 'none';
              parent.style.height = 'auto';
              parent.style.width = 'auto';
              parent = parent.parentElement;
            }
          }
        }
      });

      // Restore scroll positions
      if (previewCanvasContainerRef.current) {
        previewCanvasContainerRef.current.scrollLeft = scrollLeft;
        previewCanvasContainerRef.current.scrollTop = scrollTop;
      }

      // Perform dynamic in-memory canvas cropping to avoid DOM offset bugs
      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = bounds.width * 2;
      cropCanvas.height = bounds.height * 2;
      const ctx = cropCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          fullCanvas,
          bounds.x * 2,
          bounds.y * 2,
          bounds.width * 2,
          bounds.height * 2,
          0,
          0,
          bounds.width * 2,
          bounds.height * 2
        );

        // Draw watermark directly onto the cropped canvas in the bottom-right corner
        // This approach is 100% reliable regardless of DOM structure or zoom level
        const W = cropCanvas.width;
        const H = cropCanvas.height;
        const pad = 20 * 2; // 20px logical, x2 for scale
        const logoSize = 32 * 2;
        const fontSize = 22 * 2;
        const gap = 10 * 2;
        const sophiaText = 'Sophia';
        const pathText = 'Path';

        // Resolve the exact live theme colors from CSS variables — matches navbar exactly
        const rootStyle = getComputedStyle(document.documentElement);
        const colorMain = rootStyle.getPropertyValue('--primary-main').trim();
        const colorDark = rootStyle.getPropertyValue('--primary-dark').trim();

        // Load logo first so we can read its true natural dimensions
        const logoImage = new Image();
        logoImage.src = logoImg;
        await new Promise((resolve) => {
          logoImage.onload = resolve;
          logoImage.onerror = resolve;
        });

        // Compute logo width that preserves aspect ratio at the target height
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

        // Replicate the exact navbar split-color logo using an offscreen canvas:
        // 1. Draw left half in --primary-main, right half in --primary-dark
        // 2. Use the logo PNG as a mask (destination-in) to cut it to the logo shape
        if (logoImage.complete && logoImage.naturalWidth > 0) {
          const offscreen = document.createElement('canvas');
          // Size the offscreen canvas to the logo's true aspect-ratio dimensions
          offscreen.width = logoW;
          offscreen.height = logoH;
          const offCtx = offscreen.getContext('2d');

          // Left half: --primary-main
          offCtx.fillStyle = colorMain;
          offCtx.fillRect(0, 0, logoW / 2, logoH);

          // Right half: --primary-dark
          offCtx.fillStyle = colorDark;
          offCtx.fillRect(logoW / 2, 0, logoW / 2, logoH);

          // Clip to logo shape using the PNG as a mask (no stretching)
          offCtx.globalCompositeOperation = 'destination-in';
          offCtx.drawImage(logoImage, 0, 0, logoW, logoH);

          // Paint the split-colored logo onto the main canvas
          ctx.globalAlpha = 0.5;
          ctx.drawImage(offscreen, startX, logoY, logoW, logoH);
        }

        // Draw "Sophia" in --primary-main (exact navbar color)
        ctx.globalAlpha = 0.5;
        ctx.font = `900 ${fontSize}px "Outfit", sans-serif`;
        ctx.fillStyle = colorMain;
        ctx.fillText(sophiaText, startX + logoW + gap, textBaselineY);

        // Draw "Path" in --primary-dark (exact navbar color)
        ctx.fillStyle = colorDark;
        ctx.fillText(pathText, startX + logoW + gap + sophiaWidth, textBaselineY);

        ctx.restore();
      }

      const link = document.createElement('a');
      link.download = `${activeTabKey}_diagram.png`;
      link.href = cropCanvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to capture PNG:', err);
    }
  };

  const handleDownloadPng = async () => {
    try {
      const element = document.getElementById('se-main-capture-content');
      if (!element) return;

      // Temporarily reset scroll position of the canvas container to avoid html2canvas cutoff bugs
      const scrollLeft = canvasContainerRef.current ? canvasContainerRef.current.scrollLeft : 0;
      const scrollTop = canvasContainerRef.current ? canvasContainerRef.current.scrollTop : 0;
      if (canvasContainerRef.current) {
        canvasContainerRef.current.scrollLeft = 0;
        canvasContainerRef.current.scrollTop = 0;
      }

      await new Promise(r => setTimeout(r, 60));

      const bounds = getDiagramBounds(activeTabKey, code);

      const fullCanvas = await html2canvas(element, {
        backgroundColor: activeTheme === 'dark' ? '#121212' : '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const wrapper = clonedDoc.getElementById('se-main-capture-content');
          const inner = clonedDoc.getElementById('se-main-canvas-inner');
          if (wrapper && inner) {
            inner.style.transform = 'none';
            const reqW = (bounds.width + bounds.x + 100) + 'px';
            const reqH = (bounds.height + bounds.y + 100) + 'px';
            wrapper.style.width = reqW;
            wrapper.style.height = reqH;
            inner.style.width = reqW;
            inner.style.height = reqH;

            let parent = wrapper.parentElement;
            while (parent && parent.tagName !== 'BODY') {
              parent.style.overflow = 'visible';
              parent.style.maxHeight = 'none';
              parent.style.maxWidth = 'none';
              parent.style.height = 'auto';
              parent.style.width = 'auto';
              parent = parent.parentElement;
            }
          }
        }
      });

      // Restore scroll positions
      if (canvasContainerRef.current) {
        canvasContainerRef.current.scrollLeft = scrollLeft;
        canvasContainerRef.current.scrollTop = scrollTop;
      }

      // Perform dynamic in-memory canvas cropping to avoid DOM offset bugs
      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = bounds.width * 2;
      cropCanvas.height = bounds.height * 2;
      const ctx = cropCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          fullCanvas,
          bounds.x * 2,
          bounds.y * 2,
          bounds.width * 2,
          bounds.height * 2,
          0,
          0,
          bounds.width * 2,
          bounds.height * 2
        );

        // Draw watermark directly onto the cropped canvas in the bottom-right corner
        // This approach is 100% reliable regardless of DOM structure or zoom level
        const W = cropCanvas.width;
        const H = cropCanvas.height;
        const pad = 20 * 2; // 20px logical, x2 for scale
        const logoSize = 32 * 2;
        const fontSize = 22 * 2;
        const gap = 10 * 2;
        const sophiaText = 'Sophia';
        const pathText = 'Path';

        // Resolve the exact live theme colors from CSS variables — matches navbar exactly
        const rootStyle = getComputedStyle(document.documentElement);
        const colorMain = rootStyle.getPropertyValue('--primary-main').trim();
        const colorDark = rootStyle.getPropertyValue('--primary-dark').trim();

        // Load logo first so we can read its true natural dimensions
        const logoImage = new Image();
        logoImage.src = logoImg;
        await new Promise((resolve) => {
          logoImage.onload = resolve;
          logoImage.onerror = resolve;
        });

        // Compute logo width that preserves aspect ratio at the target height
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

        // Replicate the exact navbar split-color logo using an offscreen canvas:
        // 1. Draw left half in --primary-main, right half in --primary-dark
        // 2. Use the logo PNG as a mask (destination-in) to cut it to the logo shape
        if (logoImage.complete && logoImage.naturalWidth > 0) {
          const offscreen = document.createElement('canvas');
          // Size the offscreen canvas to the logo's true aspect-ratio dimensions
          offscreen.width = logoW;
          offscreen.height = logoH;
          const offCtx = offscreen.getContext('2d');

          // Left half: --primary-main
          offCtx.fillStyle = colorMain;
          offCtx.fillRect(0, 0, logoW / 2, logoH);

          // Right half: --primary-dark
          offCtx.fillStyle = colorDark;
          offCtx.fillRect(logoW / 2, 0, logoW / 2, logoH);

          // Clip to logo shape using the PNG as a mask (no stretching)
          offCtx.globalCompositeOperation = 'destination-in';
          offCtx.drawImage(logoImage, 0, 0, logoW, logoH);

          // Paint the split-colored logo onto the main canvas
          ctx.globalAlpha = 0.5;
          ctx.drawImage(offscreen, startX, logoY, logoW, logoH);
        }

        // Draw "Sophia" in --primary-main (exact navbar color)
        ctx.globalAlpha = 0.5;
        ctx.font = `900 ${fontSize}px "Outfit", sans-serif`;
        ctx.fillStyle = colorMain;
        ctx.fillText(sophiaText, startX + logoW + gap, textBaselineY);

        // Draw "Path" in --primary-dark (exact navbar color)
        ctx.fillStyle = colorDark;
        ctx.fillText(pathText, startX + logoW + gap + sophiaWidth, textBaselineY);

        ctx.restore();
      }

      const link = document.createElement('a');
      link.download = `${activeTabKey}_diagram.png`;
      link.href = cropCanvas.toDataURL('image/png');
      link.click();
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
      if (!trimmed || trimmed.startsWith('%%')) return;

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
      if (!trimmed || trimmed.startsWith('%%')) return;

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
    const entityW = 150;
    const entityH = 50;

    // Helper to calculate maximum radius of attributes for an entity
    function getEntityRadius(entity) {
      const numFields = entity.fields ? entity.fields.length : 0;
      if (numFields === 0) return 40; // minimum radius
      
      let currentFieldIdx = 0;
      let layerIndex = 0;
      while (currentFieldIdx < numFields) {
        const R = 120 + layerIndex * 90;
        const maxInLayer = Math.floor((2 * Math.PI * R) / 95);
        const countInThisLayer = Math.min(maxInLayer, numFields - currentFieldIdx);
        currentFieldIdx += countInThisLayer;
        layerIndex++;
      }
      return 120 + (layerIndex - 1) * 90 + 50; // radius plus padding
    }

    // Precalculate radii
    const radii = {};
    entities.forEach(ent => {
      radii[ent.name] = getEntityRadius(ent);
    });
    
    // 1. Initialize positions in a larger circle to prevent initial overlapping
    const N = entities.length;
    entities.forEach((entity, idx) => {
      const angle = (2 * Math.PI * idx) / Math.max(1, N);
      const R = 600; // Increased starting radius
      positions[entity.name] = {
        x: 800 + R * Math.cos(angle),
        y: 800 + R * Math.sin(angle)
      };
    });

    // 2. Build connection list
    const adj = {};
    entities.forEach(ent => adj[ent.name] = []);
    relationships.forEach(rel => {
      if (adj[rel.source] && adj[rel.target]) {
        adj[rel.source].push(rel.target);
        adj[rel.target].push(rel.source);
      }
    });

    // 3. Force-directed iterations
    const iterations = 150; // Increased iterations for stability
    const repScale = 300000; // Increased repulsion scale
    const attScale = 0.08;

    for (let iter = 0; iter < iterations; iter++) {
      const dx = {};
      const dy = {};
      entities.forEach(e => {
        dx[e.name] = 0;
        dy[e.name] = 0;
      });

      // Calculate repulsive forces between all pairs of nodes
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const u = entities[i].name;
          const v = entities[j].name;
          const xDist = positions[u].x - positions[v].x;
          const yDist = positions[u].y - positions[v].y;
          const dist = Math.sqrt(xDist * xDist + yDist * yDist) + 1;

          const minDist = radii[u] + radii[v] + 60; // Minimum safe distance based on attributes
          if (dist < minDist) {
            // Apply extremely strong push if overlapping boundaries
            const force = (repScale * 3) * (minDist - dist) / dist;
            const fx = (xDist / dist) * force;
            const fy = (yDist / dist) * force;
            dx[u] += fx;
            dy[u] += fy;
            dx[v] -= fx;
            dy[v] -= fy;
          } else {
            const force = repScale / (dist * dist);
            const fx = (xDist / dist) * force;
            const fy = (yDist / dist) * force;
            dx[u] += fx;
            dy[u] += fy;
            dx[v] -= fx;
            dy[v] -= fy;
          }
        }
      }

      // Calculate attractive forces along relationships
      relationships.forEach(rel => {
        const u = rel.source;
        const v = rel.target;
        if (!positions[u] || !positions[v]) return;
        const xDist = positions[u].x - positions[v].x;
        const yDist = positions[u].y - positions[v].y;
        const dist = Math.sqrt(xDist * xDist + yDist * yDist) + 1;

        const k = radii[u] + radii[v] + 80; // Ideal distance based on entity sizes
        const force = (dist - k) * attScale;
        const fx = (xDist / dist) * force;
        const fy = (yDist / dist) * force;

        dx[u] -= fx;
        dy[u] -= fy;
        dx[v] += fx;
        dy[v] += fy;
      });

      // Update positions with cooling temperature
      const temp = Math.max(1, 20 * (1 - iter / iterations));
      entities.forEach(e => {
        const name = e.name;
        const dispX = Math.max(-temp * 15, Math.min(temp * 15, dx[name]));
        const dispY = Math.max(-temp * 15, Math.min(temp * 15, dy[name]));
        
        positions[name].x += dispX;
        positions[name].y += dispY;
      });
    }

    // 4. Shift and normalize coordinates to fit beautifully on the canvas starting at (200, 200)
    let minX = Infinity;
    let minY = Infinity;
    entities.forEach(e => {
      if (positions[e.name].x < minX) minX = positions[e.name].x;
      if (positions[e.name].y < minY) minY = positions[e.name].y;
    });

    const shiftX = 200 - minX;
    const shiftY = 200 - minY;

    entities.forEach(e => {
      positions[e.name].x += shiftX;
      positions[e.name].y += shiftY;
    });

    // 5. Layout the attributes radially around each entity card
    entities.forEach(entity => {
      const coord = positions[entity.name];
      const cx = coord.x + entityW / 2;
      const cy = coord.y + entityH / 2;
      const fields = entity.fields || [];
      const numFields = fields.length;
      
      let currentFieldIdx = 0;
      let layerIndex = 0;
      
      while (currentFieldIdx < numFields) {
        const R = 120 + layerIndex * 90;
        const maxInLayer = Math.floor((2 * Math.PI * R) / 95);
        const countInThisLayer = Math.min(maxInLayer, numFields - currentFieldIdx);
        
        for (let j = 0; j < countInThisLayer; j++) {
          const f = fields[currentFieldIdx + j];
          const attrKey = `${entity.name}::attr::${f.name}`;
          const startAngle = -Math.PI / 2 + (layerIndex * Math.PI / 6);
          const angle = startAngle + (2 * Math.PI * j) / countInThisLayer;
          positions[attrKey] = {
            x: cx + R * Math.cos(angle),
            y: cy + R * Math.sin(angle)
          };
        }
        currentFieldIdx += countInThisLayer;
        layerIndex++;
      }
    });

    // 6. Layout relationship diamonds at the midpoints
    relationships.forEach(rel => {
      const relKey = `${rel.source}::rel::${rel.target}`;
      const start = positions[rel.source] || { x: 200, y: 200 };
      const end = positions[rel.target] || { x: 200, y: 200 };
      const cx1 = start.x + entityW / 2;
      const cy1 = start.y + entityH / 2;
      const cx2 = end.x + entityW / 2;
      const cy2 = end.y + entityH / 2;

      positions[relKey] = {
        x: (cx1 + cx2) / 2,
        y: (cy1 + cy2) / 2
      };
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
  function computeUseCaseAutoLayout(actors, usecases, links) {
    if (usecases.length === 0 && actors.length === 0) return {};

    const UC_W = 200;
    const UC_H = 50;
    const UC_GAP_PRIMARY  = 28;   // vertical gap between primary UCs
    const UC_GAP_SECONDARY = 22;  // vertical gap between secondary UCs
    const UC_GROUP_GAP    = 18;   // extra gap between secondary UC groups
    const AC_H = 90;
    const LEFT_X          = 80;   // left edge of the actor column
    const MARGIN_TOP      = 80;
    const ACTOR_COL_WIDTH = 220;  // horizontal gap between actor columns in hierarchy

    const positions  = {};
    const actorIds   = new Set(actors.map(a => a.id));
    const ucIds      = new Set(usecases.map(u => u.id));

    // ── Step 0: Determine Actor Hierarchy & Levels ───────────────────────
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

    // Compute levels (depths) safely
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

    // Group/traverse actors hierarchically so child actors are organized
    const visited = new Set();
    const sortedActors = [];

    const traverseActor = (actorId) => {
      if (visited.has(actorId)) return;
      visited.add(actorId);
      
      const actorObj = actors.find(a => a.id === actorId);
      if (actorObj) {
        sortedActors.push(actorObj);
      }
      
      const kids = childrenMap[actorId] || [];
      kids.sort((a, b) => {
        const idxA = actors.findIndex(x => x.id === a);
        const idxB = actors.findIndex(x => x.id === b);
        return idxA - idxB;
      });
      kids.forEach(traverseActor);
    };

    // Find all root actors (level 0)
    const roots = actors.filter(a => actorLevels[a.id] === 0);

    // Sort roots: those with children first, then those without
    roots.sort((a, b) => {
      const hasKidsA = (childrenMap[a.id] && childrenMap[a.id].length > 0) ? 1 : 0;
      const hasKidsB = (childrenMap[b.id] && childrenMap[b.id].length > 0) ? 1 : 0;
      if (hasKidsA !== hasKidsB) {
        return hasKidsB - hasKidsA;
      }
      return actors.indexOf(a) - actors.indexOf(b);
    });

    // Traverse roots to construct the sorted actors list
    roots.forEach(r => traverseActor(r.id));
    actors.forEach(a => {
      if (!visited.has(a.id)) {
        sortedActors.push(a);
      }
    });

    // Calculate maximum actor level to determine primary column X coordinate dynamically
    const maxActorLevel = sortedActors.length > 0 ? Math.max(...sortedActors.map(a => actorLevels[a.id] || 0)) : 0;
    const PRIMARY_COL_X   = Math.max(850, LEFT_X + maxActorLevel * ACTOR_COL_WIDTH + 500);
    const SECONDARY_COL_X = PRIMARY_COL_X + 480;

    // ── Step 1: split links ──────────────────────────────────────────────
    const ucUcLinks    = links.filter(l => ucIds.has(l.source) && ucIds.has(l.target));
    const actorUcLinks = links.filter(l => actorIds.has(l.source) || actorIds.has(l.target));

    // ── Step 2: classify use cases ───────────────────────────────────────
    // Primary = any UC that has at least one direct actor link
    const primaryUcIds = new Set();
    actorUcLinks.forEach(l => {
      const ucId = actorIds.has(l.source) ? l.target : l.source;
      if (ucIds.has(ucId)) primaryUcIds.add(ucId);
    });
    // Secondary = all remaining UCs (only connected via uc↔uc links)
    const secondaryUcIds = new Set([...ucIds].filter(id => !primaryUcIds.has(id)));

    const primaryUcs   = usecases.filter(uc => primaryUcIds.has(uc.id));
    const secondaryUcs = usecases.filter(uc => secondaryUcIds.has(uc.id));

    // ── Step 3: order primary UCs ────────────────────────────────────────
    // Each primary UC is tagged with the earliest actor-index that connects to it.
    // This groups UCs under the actor that "owns" them, preserving declaration/hierarchical order.
    const ucFirstActorIdx = {};
    primaryUcs.forEach(uc => {
      let minIdx = Infinity;
      actorUcLinks.forEach(l => {
        const ucId     = actorIds.has(l.source) ? l.target  : l.source;
        const actorId  = actorIds.has(l.source) ? l.source  : l.target;
        if (ucId === uc.id) {
          const aIdx = sortedActors.findIndex(a => a.id === actorId);
          if (aIdx !== -1 && aIdx < minIdx) minIdx = aIdx;
        }
      });
      ucFirstActorIdx[uc.id] = minIdx === Infinity ? 9999 : minIdx;
    });
    primaryUcs.sort((a, b) => {
      const diff = ucFirstActorIdx[a.id] - ucFirstActorIdx[b.id];
      return diff !== 0 ? diff : usecases.indexOf(a) - usecases.indexOf(b);
    });

    // ── Step 4: lay out primary UCs in the centre column ─────────────────
    let primaryY = MARGIN_TOP;
    const primaryYCenter = {}; // ucId → Y of the ellipse's centre
    primaryUcs.forEach(uc => {
      positions[uc.id] = { x: PRIMARY_COL_X - UC_W / 2, y: primaryY };
      primaryYCenter[uc.id] = primaryY + UC_H / 2;
      primaryY += UC_H + UC_GAP_PRIMARY;
    });
    const primaryEndY = primaryY;

    // ── Step 5: order secondary UCs by their nearest primary UC ──────────
    // Walk up the uc↔uc graph to find each secondary UC's primary ancestor.
    const getParentPrimary = (ucId, depth = 0) => {
      if (depth > 20) return null;
      const parentLink = ucUcLinks.find(
        l => (l.source === ucId && ucIds.has(l.target)) ||
             (l.target === ucId && ucIds.has(l.source))
      );
      if (!parentLink) return null;
      const parentId = parentLink.source === ucId ? parentLink.target : parentLink.source;
      if (primaryUcIds.has(parentId)) return parentId;
      // Recurse: the parent is also secondary — walk up further
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
    // Each group of secondaries is vertically centred at the parent's Y so
    // the connection lines stay as horizontal as possible.
    // A top-down collision pass then nudges groups down just enough to avoid
    // overlapping with the group above, keeping them as close as possible.

    // Build groups: Map<parentPrimaryId | null, secondaryUc[]>
    const secGroups = new Map();
    secondaryUcs.forEach(uc => {
      const parent = ucParentPrimary[uc.id] ?? null;
      if (!secGroups.has(parent)) secGroups.set(parent, []);
      secGroups.get(parent).push(uc);
    });

    // Process groups in top-to-bottom order (same as primaryUcs order)
    const orderedParents = [
      ...primaryUcs.map(p => p.id).filter(id => secGroups.has(id)),
      ...(secGroups.has(null) ? [null] : [])
    ];

    let prevGroupBottom = -Infinity; // bottom Y of the previous placed group

    orderedParents.forEach(parentId => {
      const group = secGroups.get(parentId) || [];
      if (group.length === 0) return;

      const parentCenterY = parentId ? (primaryYCenter[parentId] ?? MARGIN_TOP) : MARGIN_TOP;
      const groupH = group.length * UC_H + (group.length - 1) * UC_GAP_SECONDARY;

      // Ideal top: centre the group around the parent's Y
      let groupTop = parentCenterY - groupH / 2;

      // Collision avoidance: never overlap the group placed just above
      const minTop = prevGroupBottom + UC_GAP_SECONDARY;
      if (groupTop < minTop) groupTop = minTop;

      group.forEach((uc, idx) => {
        positions[uc.id] = {
          x: SECONDARY_COL_X - UC_W / 2,
          y: groupTop + idx * (UC_H + UC_GAP_SECONDARY)
        };
      });

      prevGroupBottom = groupTop + groupH;
    });

    // ── Step 7: position each actor vertically & horizontally ───────────
    sortedActors.forEach(actor => {
      const connectedYs = actorUcLinks
        .filter(l => l.source === actor.id || l.target === actor.id)
        .map(l => {
          const ucId = l.source === actor.id ? l.target : l.source;
          return primaryYCenter[ucId] ?? null;
        })
        .filter(y => y !== null);

      let centerY;
      if (connectedYs.length > 0) {
        centerY = connectedYs.reduce((a, b) => a + b, 0) / connectedYs.length;
      } else {
        // Fallback: place near parent if possible
        const parentId = parentMap[actor.id];
        if (parentId && positions[parentId]) {
          centerY = positions[parentId].y + AC_H / 2 + 30;
        } else {
          centerY = MARGIN_TOP + (primaryEndY - MARGIN_TOP) / 2;
        }
      }

      const actorX = LEFT_X + (actorLevels[actor.id] || 0) * ACTOR_COL_WIDTH;
      positions[actor.id] = { x: actorX, y: centerY - AC_H / 2 };
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
      if (!trimmed || trimmed.startsWith('%%')) return;

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
        if (!trimmed) return;

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

  // Bezier routing math helpers matching Java UML playground
  // Bezier routing math helpers matching Java UML playground
  const getBestConnectionPoints = (p1, p2, w1 = 250, h1 = 200, w2 = 250, h2 = 200, allRelations = [], currentRelation = null) => {
    const anchorsA = [
      { x: p1.x + w1 / 2, y: p1.y, side: 'top' },
      { x: p1.x + w1 / 2, y: p1.y + h1, side: 'bottom' },
      { x: p1.x, y: p1.y + h1 / 2, side: 'left' },
      { x: p1.x + w1, y: p1.y + h1 / 2, side: 'right' }
    ];

    const anchorsB = [
      { x: p2.x + w2 / 2, y: p2.y, side: 'top' },
      { x: p2.x + w2 / 2, y: p2.y + h2, side: 'bottom' },
      { x: p2.x, y: p2.y + h2 / 2, side: 'left' },
      { x: p2.x + w2, y: p2.y + h2 / 2, side: 'right' }
    ];

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
          if (activeTabKey === 'usecase') {
            const { actors } = parseUseCase(code);
            const isSrcActor = actors.some(a => a.id === r.source);
            const isTgtActor = actors.some(a => a.id === r.target);
            rw1 = isSrcActor ? 60 : 200; rh1 = isSrcActor ? 90 : 50;
            rw2 = isTgtActor ? 60 : 200; rh2 = isTgtActor ? 90 : 50;
          } else if (activeTabKey === 'er') {
            const { entities } = parseER(code);
            const getEH = (name) => {
              const ent = entities.find(e => e.name === name);
              return 38 + 12 + (ent?.fields?.length || 0) * 28 + 8;
            };
            rh1 = getEH(r.source);
            rh2 = getEH(r.target);
          }

          const rAnchorsA = [
            { x: srcPos.x + rw1 / 2, y: srcPos.y, side: 'top' },
            { x: srcPos.x + rw1 / 2, y: srcPos.y + rh1, side: 'bottom' },
            { x: srcPos.x, y: srcPos.y + rh1 / 2, side: 'left' },
            { x: srcPos.x + rw1, y: srcPos.y + rh1 / 2, side: 'right' }
          ];
          const rAnchorsB = [
            { x: tgtPos.x + rw2 / 2, y: tgtPos.y, side: 'top' },
            { x: tgtPos.x + rw2 / 2, y: tgtPos.y + rh2, side: 'bottom' },
            { x: tgtPos.x, y: tgtPos.y + rh2 / 2, side: 'left' },
            { x: tgtPos.x + rw2, y: tgtPos.y + rh2 / 2, side: 'right' }
          ];

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
        sameSideConnections.sort((a, b) => a.centerX - b.centerX);
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

      if (totalCount > 1 && connIdx !== -1 && !isTargetActor) {
        const factor = (connIdx + 0.5) / totalCount;
        if (bestB.side === 'top' || bestB.side === 'bottom') {
          bestB = {
            ...bestB,
            x: p2.x + w2 * factor
          };
        } else {
          bestB = {
            ...bestB,
            y: p2.y + h2 * factor
          };
        }
      }
    }

    // Distribute connections if multiple share same source side (A)
    if (allRelations && allRelations.length > 0 && currentRelation) {
      const aRelations = allRelations.filter(r => r.source === currentRelation.source || r.target === currentRelation.source);
      const sameSideConnectionsA = [];

      aRelations.forEach(r => {
        const srcPos = nodePositions[r.source];
        const tgtPos = nodePositions[r.target];
        if (srcPos && tgtPos) {
          let rw1 = 250, rh1 = 160, rw2 = 250, rh2 = 160;
          if (activeTabKey === 'usecase') {
            const { actors } = parseUseCase(code);
            const isSrcActor = actors.some(a => a.id === r.source);
            const isTgtActor = actors.some(a => a.id === r.target);
            rw1 = isSrcActor ? 60 : 200; rh1 = isSrcActor ? 90 : 50;
            rw2 = isTgtActor ? 60 : 200; rh2 = isTgtActor ? 90 : 50;
          } else if (activeTabKey === 'er') {
            const { entities } = parseER(code);
            const getEH = (name) => {
              const ent = entities.find(e => e.name === name);
              return 38 + 12 + (ent?.fields?.length || 0) * 28 + 8;
            };
            rh1 = getEH(r.source);
            rh2 = getEH(r.target);
          }

          const rAnchorsA = [
            { x: srcPos.x + rw1 / 2, y: srcPos.y, side: 'top' },
            { x: srcPos.x + rw1 / 2, y: srcPos.y + rh1, side: 'bottom' },
            { x: srcPos.x, y: srcPos.y + rh1 / 2, side: 'left' },
            { x: srcPos.x + rw1, y: srcPos.y + rh1 / 2, side: 'right' }
          ];
          const rAnchorsB = [
            { x: tgtPos.x + rw2 / 2, y: tgtPos.y, side: 'top' },
            { x: tgtPos.x + rw2 / 2, y: tgtPos.y + rh2, side: 'bottom' },
            { x: tgtPos.x, y: tgtPos.y + rh2 / 2, side: 'left' },
            { x: tgtPos.x + rw2, y: tgtPos.y + rh2 / 2, side: 'right' }
          ];

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

      if (totalCountA > 1 && connIdxA !== -1 && !isSourceActor) {
        const factor = (connIdxA + 0.5) / totalCountA;
        if (bestA.side === 'top' || bestA.side === 'bottom') {
          bestA = {
            ...bestA,
            x: p1.x + w1 * factor
          };
        } else {
          bestA = {
            ...bestA,
            y: p1.y + h1 * factor
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
      const coord = nodePositions[entity.name] || { x: (entIdx % 3) * 450 + 200, y: Math.floor(entIdx / 3) * 360 + 200 };
      const cx = coord.x + entityW / 2;
      const cy = coord.y + entityH / 2;
      const fields = entity.fields || [];
      const numFields = fields.length;
      
      // Calculate concentric default positions to prevent overlaps
      let currentFieldIdx = 0;
      let layerIndex = 0;
      const defaultPositions = {};
      
      while (currentFieldIdx < numFields) {
        const R = 120 + layerIndex * 90;
        const maxInLayer = Math.floor((2 * Math.PI * R) / 95);
        const countInThisLayer = Math.min(maxInLayer, numFields - currentFieldIdx);
        
        for (let j = 0; j < countInThisLayer; j++) {
          const f = fields[currentFieldIdx + j];
          const startAngle = -Math.PI / 2 + (layerIndex * Math.PI / 6);
          const angle = startAngle + (2 * Math.PI * j) / countInThisLayer;
          defaultPositions[f.name] = {
            x: cx + R * Math.cos(angle),
            y: cy + R * Math.sin(angle)
          };
        }
        currentFieldIdx += countInThisLayer;
        layerIndex++;
      }

      fields.forEach((f, fIdx) => {
        const attrKey = `${entity.name}::attr::${f.name}`;
        const defPos = defaultPositions[f.name] || { x: cx, y: cy };
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

      const cx1 = start.x + entityW / 2;
      const cy1 = start.y + entityH / 2;
      const cx2 = end.x + entityW / 2;
      const cy2 = end.y + entityH / 2;

      const defaultMx = (cx1 + cx2) / 2;
      const defaultMy = (cy1 + cy2) / 2;

      const relKey = `${rel.source}::rel::${rel.target}`;
      const mx = nodePositions[relKey]?.x ?? defaultMx;
      const my = nodePositions[relKey]?.y ?? defaultMy;

      const pts1 = getBestConnectionPoints(start, { x: mx, y: my }, entityW, entityH, 0, 0);
      const pts2 = getBestConnectionPoints({ x: mx, y: my }, end, 0, 0, entityW, entityH);

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
        const coord = nodePositions[uc.id] || { x: 420, y: idx * 110 + 100 };
        if (coord.x < minUcX) minUcX = coord.x;
        if (coord.x + 200 > maxUcX) maxUcX = coord.x + 200;
        if (coord.y < minUcY) minUcY = coord.y;
        if (coord.y + 50 > maxUcY) maxUcY = coord.y + 50;
      });

      const paddingLeft = 60;
      const paddingRight = 40;
      const paddingTop = 70;
      const paddingBottom = 45;

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
          fill="rgba(255, 255, 255, 0.02)"
          stroke="rgba(61, 92, 255, 0.2)"
          strokeWidth="2"
          rx="16"
        />
        <text 
          x={boxX + boxWidth / 2} 
          y={boxY + 25} 
          fill="rgba(255,255,255,0.4)" 
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

          const w1 = isSourceActor ? 60 : 200;
          const h1 = isSourceActor ? 90 : 50;
          const w2 = isTargetActor ? 60 : 200;
          const h2 = isTargetActor ? 90 : 50;

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
              <line x1={x} y1="80" x2={x} y2={diagHeight - 60} stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="6,6" />
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
                  stroke="rgba(0,255,204,0.3)"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                />
                <rect
                  x={startX + 20}
                  y={y - 12}
                  width="270"
                  height="24"
                  rx="6"
                  fill="var(--background-default)"
                  stroke="rgba(0,255,204,0.5)"
                  strokeWidth="1"
                />
                <text
                  x={startX + 32}
                  y={y + 5}
                  fill="#00FFCC"
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
                stroke={isResponseOrDisplay ? '#00FFCC' : 'var(--text-primary)'}
                strokeWidth="1.5"
                strokeDasharray={isResponseOrDisplay ? '4,4' : '0'}
              />
              {x2 > x1 ? (
                <polygon points={`${x2},${y} ${x2 - 8},${y - 4} ${x2 - 8},${y + 4}`} fill={isResponseOrDisplay ? '#00FFCC' : 'var(--text-primary)'} />
              ) : (
                <polygon points={`${x2},${y} ${x2 + 8},${y - 4} ${x2 + 8},${y + 4}`} fill={isResponseOrDisplay ? '#00FFCC' : 'var(--text-primary)'} />
              )}
              <text
                x={(x1 + x2) / 2}
                y={y - 8}
                fill={isResponseOrDisplay ? '#00FFCC' : 'var(--text-primary)'}
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
              background: activeTabKey === 'gantt' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.25)',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden',
              boxSizing: 'border-box'
            }}
          >
            <Typography variant="subtitle2" style={{ fontWeight: 800, marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              SOURCE CODE ({activeTabTitle})
            </Typography>
            <Box style={{
              flexGrow: 1,
              borderRadius: '12px',
              overflow: 'hidden',
              border: activeTabKey === 'gantt' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--divider)',
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
              background: activeTabKey === 'gantt' ? 'rgba(10, 10, 20, 0.05)' : 'rgba(10, 10, 20, 0.2)',
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

              <Box style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '2px', border: '1px solid rgba(255, 255, 255, 0.05)', zIndex: 5, alignItems: 'center' }}>
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
                        onClick={() => {
                          const { entities, relationships } = parseER(code);
                          const autoPositions = computeERAutoLayout(entities, relationships);
                          setNodePositions(autoPositions);
                        }}
                        style={{
                          marginRight: '8px',
                          borderRadius: '6px',
                          textTransform: 'none',
                          height: '28px',
                          fontSize: '0.72rem',
                          color: '#00FFCC',
                          borderColor: '#00FFCC',
                          fontWeight: 700,
                          letterSpacing: '0.02em'}}
                      >
                        ✦ Auto Layout
                      </Button>
                    </Tooltip>
                  </>
                )}
                {activeTabKey === 'usecase' && (
                  <>
                    <Button variant="contained" size="small" color="primary" startIcon={<AddIcon style={{ fontSize: '0.9rem' }} />} onClick={() => setIsAddActorOpen(true)} style={{ marginRight: '4px', marginLeft: '4px', borderRadius: '6px', textTransform: 'none', height: '28px', fontSize: '0.72rem', background: 'var(--primary-main)', fontWeight: 800 }}>
                      Add Actor
                    </Button>
                    <Button variant="contained" size="small" color="primary" startIcon={<AddIcon style={{ fontSize: '0.9rem' }} />} onClick={() => setIsAddUseCaseOpen(true)} style={{ marginRight: '8px', borderRadius: '6px', textTransform: 'none', height: '28px', fontSize: '0.72rem', background: 'var(--primary-main)', fontWeight: 800 }}>
                      Add Use Case
                    </Button>
                    <Tooltip title="Auto-arrange all actors and use cases into a clean layout">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          const { actors, usecases, links } = parseUseCase(code);
                          const autoPositions = computeUseCaseAutoLayout(actors, usecases, links);
                          setNodePositions(prev => ({ ...prev, ...autoPositions }));
                          // Clear all usecase waypoints so connectors reset to clean straight lines
                          setUsecaseWaypoints({});
                        }}
                        style={{
                          marginRight: '8px',
                          borderRadius: '6px',
                          textTransform: 'none',
                          height: '28px',
                          fontSize: '0.72rem',
                          color: '#00FFCC',
                          borderColor: '#00FFCC',
                          fontWeight: 700,
                          letterSpacing: '0.02em'}}
                      >
                        ✦ Auto Layout
                      </Button>
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
                      style={{ height: '28px', color: '#fff', fontSize: '0.75rem', marginRight: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}
                      MenuProps={{ PaperProps: { style: { backgroundColor: '#1e1e1e', color: '#fff' } } }}
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
                  <IconButton size="small" onClick={() => setZoomScale(prev => Math.min(2.0, prev + 0.1))} style={{ color: '#fff' }}>
                    <ZoomInIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Zoom Out">
                  <IconButton size="small" onClick={() => setZoomScale(prev => Math.max(0.2, prev - 0.1))} style={{ color: '#fff' }}>
                    <ZoomOutIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reset View">
                  <IconButton size="small" onClick={() => { setZoomScale(1.0); if (canvasContainerRef.current) { canvasContainerRef.current.scrollLeft = 0; canvasContainerRef.current.scrollTop = 0; } }} style={{ color: '#fff' }}>
                    <ResetIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Canvas'}>
                  <IconButton size="small" onClick={() => setIsFullscreen(!isFullscreen)} style={{ color: '#fff' }}>
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
                background: (activeTabKey === 'sequence' || activeTabKey === 'gantt')
                  ? 'var(--background-default)'
                  : 'var(--background-default) linear-gradient(var(--divider) 1px, transparent 1px), linear-gradient(90deg, var(--divider) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
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
                    backgroundImage: (activeTabKey === 'sequence' || activeTabKey === 'gantt')
                      ? 'none'
                      : 'linear-gradient(var(--divider) 1px, transparent 1px), linear-gradient(90deg, var(--divider) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
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
                      </defs>

                      {activeTabKey === 'er' && renderERDiagram()}
                      {activeTabKey === 'usecase' && renderUseCaseDiagram()}
                    </svg>

                    {/* Sequence and Gantt have internal SVG wrapper structures */}
                    {activeTabKey === 'sequence' && renderSequenceDiagram()}
                    {activeTabKey === 'gantt' && renderGanttChart()}

                    {/* DRAGGABLE NODE CARDS OVERLAY (HTML siblings for ER and Use Case) */}
                    {activeTabKey === 'er' && parseER(code).entities.map((entity, idx) => {
                      const coord = nodePositions[entity.name] || { x: (idx % 3) * 450 + 200, y: Math.floor(idx / 3) * 360 + 200 };
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
                            width: '150px',
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
                            cursor: draggingNode === actor.id ? 'grabbing' : 'grab',
                            zIndex: draggingNode === actor.id ? 10 : 3,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            userSelect: 'none'
                          }}
                        >
                          <svg width="60" height="100" viewBox="-30 -50 60 100" style={{ overflow: 'visible' }}>
                            <circle cx="0" cy="-30" r="12" fill="var(--background-paper)" stroke="var(--primary-main)" strokeWidth="3" />
                            <line x1="0" y1="-18" x2="0" y2="15" stroke="var(--primary-main)" strokeWidth="3" />
                            <line x1="-20" y1="-8" x2="20" y2="-8" stroke="var(--primary-main)" strokeWidth="3" />
                            <line x1="0" y1="15" x2="-15" y2="40" stroke="var(--primary-main)" strokeWidth="3" />
                            <line x1="0" y1="15" x2="15" y2="40" stroke="var(--primary-main)" strokeWidth="3" />
                          </svg>
                          <Typography variant="caption" style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
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
                  </div>
                </Box>
              </Box>

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
              Software Engineering Lab
            </Typography>
            <Typography variant="caption" style={{ color: 'var(--text-secondary)' }}>
              Model database structures, user interfaces interactions, operational logic, and timelines.
            </Typography>
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Typography variant="subtitle2" style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              Diagram Type:
            </Typography>
            <FormControl size="small" style={{ minWidth: '200px' }}>
              <Select
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  height: '34px',
                  fontSize: '0.85rem',
                  fieldset: { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: 'var(--primary-main) !important' },
                  '&.Mui-focused fieldset': { borderColor: 'var(--primary-main) !important' },
                  '& .MuiSelect-select': { padding: '6px 12px' }
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      background: 'rgba(30, 30, 56, 0.95)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#ffffff'
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

          <Box style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<CopyIcon />}
              onClick={handleCopyCode}
              style={{
                borderColor: 'rgba(255,255,255,0.1)',
                color: '#fff',
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
                      background: 'rgba(30, 30, 56, 0.95)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#ffffff'
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

              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadPreviewPng} style={{ borderRadius: '12px', fontWeight: 800, height: '40px', textTransform: 'none' }}>
                Download PNG
              </Button>
              <Button variant="contained" color="primary" onClick={() => setIsPreviewOpen(false)} style={{ borderRadius: '12px', fontWeight: 800, height: '40px', textTransform: 'none' }}>
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
                    backgroundImage: (activeTabKey === 'sequence' || activeTabKey === 'gantt')
                      ? 'none'
                      : 'linear-gradient(var(--divider) 1px, transparent 1px), linear-gradient(90deg, var(--divider) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
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
                      </defs>

                      {activeTabKey === 'er' && renderERDiagram()}
                      {activeTabKey === 'usecase' && renderUseCaseDiagram()}
                    </svg>

                    {/* Sequence and Gantt have internal SVG wrapper structures */}
                    {activeTabKey === 'sequence' && renderSequenceDiagram()}
                    {activeTabKey === 'gantt' && renderGanttChart()}

                    {/* DRAGGABLE NODE CARDS OVERLAY (HTML siblings for ER and Use Case) */}
                    {activeTabKey === 'er' && parseER(code).entities.map((entity, idx) => {
                      const coord = nodePositions[entity.name] || { x: (idx % 3) * 450 + 200, y: Math.floor(idx / 3) * 360 + 200 };
                      return (
                        <div
                          key={idx}
                          className="se-node-card er-entity-card"
                          style={{
                            position: 'absolute',
                            left: `${coord.x}px`,
                            top: `${coord.y}px`,
                            width: '150px',
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
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            userSelect: 'none',
                            zIndex: 3
                          }}
                        >
                          <svg width="60" height="100" viewBox="-30 -50 60 100" style={{ overflow: 'visible' }}>
                            <circle cx="0" cy="-30" r="12" fill="var(--background-paper)" stroke="var(--primary-main)" strokeWidth="3" />
                            <line x1="0" y1="-18" x2="0" y2="15" stroke="var(--primary-main)" strokeWidth="3" />
                            <line x1="-20" y1="-8" x2="20" y2="-8" stroke="var(--primary-main)" strokeWidth="3" />
                            <line x1="0" y1="15" x2="-15" y2="40" stroke="var(--primary-main)" strokeWidth="3" />
                            <line x1="0" y1="15" x2="15" y2="40" stroke="var(--primary-main)" strokeWidth="3" />
                          </svg>
                          <Typography variant="caption" style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
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
        </>
      )}
      </Dialog>
    );
  }

  return (
    <Box style={{ width: '100%', height: '100vh', background: '#111122', boxSizing: 'border-box' }}>
      <Box style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', alignItems: 'stretch' }}>
        <Paper square style={{ padding: '16px', background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" style={{ fontWeight: 900, color: 'var(--primary-main)' }}>
            Software Engineering Lab (Standalone View)
          </Typography>
        </Paper>
        <Box style={{ flexGrow: 1, position: 'relative' }}>
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default SoftwareEngineeringLab;
