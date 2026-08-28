import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Avatar,
  Card,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  IconButton,
  Tab,
  Tabs,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu
} from '@mui/material';

export const COMMUNITY_CATEGORIES = [
  'Software Engineering',
  'Artificial Intelligence & ML',
  'Data Science & Analytics',
  'Cybersecurity & Networking',
  'Mobile Development',
  'Cloud Computing & DevOps',
  'Web Development',
  'UI/UX Design',
  'Blockchain & Web3',
  'Product Management',
  'Mathematics & Statistics',
  'Physics & Astronomy',
  'Chemistry & Material Sciences',
  'Biology & Biotechnology',
  'Medicine & Health Sciences',
  'Economics & Finance',
  'History & Social Sciences',
  'Languages & Linguistics',
  'Art & Creative Writing',
  'Business & Entrepreneurship'
];

export const CATEGORY_STYLES = {
  'Software Engineering': { icon: '💻', color: '#3D5CFF', bg: 'rgba(61,92,255,0.08)' },
  'Artificial Intelligence & ML': { icon: '🧠', color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
  'Data Science & Analytics': { icon: '📊', color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  'Cybersecurity & Networking': { icon: '🛡️', color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
  'Mobile Development': { icon: '📱', color: '#EC4899', bg: 'rgba(236,72,153,0.08)' },
  'Cloud Computing & DevOps': { icon: '☁️', color: '#0EA5E9', bg: 'rgba(14,165,233,0.08)' },
  'Web Development': { icon: '🌐', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  'UI/UX Design': { icon: '🎨', color: '#F43F5E', bg: 'rgba(244,63,94,0.08)' },
  'Blockchain & Web3': { icon: '⛓️', color: '#6366F1', bg: 'rgba(99,102,241,0.08)' },
  'Product Management': { icon: '🚀', color: '#14B8A6', bg: 'rgba(20,184,166,0.08)' },
  'Mathematics & Statistics': { icon: '📐', color: '#06B6D4', bg: 'rgba(6,182,212,0.08)' },
  'Physics & Astronomy': { icon: '🌌', color: '#3F51B5', bg: 'rgba(63,81,181,0.08)' },
  'Chemistry & Material Sciences': { icon: '🧪', color: '#4CAF50', bg: 'rgba(76,175,80,0.08)' },
  'Biology & Biotechnology': { icon: '🧬', color: '#009688', bg: 'rgba(0,150,136,0.08)' },
  'Medicine & Health Sciences': { icon: '🏥', color: '#E91E63', bg: 'rgba(233,30,99,0.08)' },
  'Economics & Finance': { icon: '📈', color: '#FF5722', bg: 'rgba(255,87,34,0.08)' },
  'History & Social Sciences': { icon: '🏛️', color: '#795548', bg: 'rgba(121,85,72,0.08)' },
  'Languages & Linguistics': { icon: '🗣️', color: '#9C27B0', bg: 'rgba(156,39,176,0.08)' },
  'Art & Creative Writing': { icon: '✍️', color: '#673AB7', bg: 'rgba(103,58,183,0.08)' },
  'Business & Entrepreneurship': { icon: '💼', color: '#607D8B', bg: 'rgba(96,125,139,0.08)' }
};
import {
  Search as SearchIcon,
  Add as AddIcon,
  People as PeopleIcon,
  ExitToApp as ExitIcon,
  Login as LoginIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Bookmark as BookmarkIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { socialStore } from '../../data/socialStore';
import { useAuth } from '../../context/AuthContext';
import { AllowedFor } from '../../components/AllowedFor';
import './Community.css';

const CommunityListPage = () => {
  const { user, refreshUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState(() => localStorage.getItem('sophiapath_community_search_query') || '');
  const [communities, setCommunities] = useState([]);

  // Role Application State (FR-S-46)
  const [menuAnchor, setMenuAnchor] = useState(null);
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
        title: "Moderator Position Application",
        fullName: user?.name || user?.username || "Anonymous Applicant",
        description: `Moderator candidacy request.`,
        requestedRole: 2, // Moderator
        reasons: reasonsPayload,
        reasonableQuestions: "Not Applicable",
        courseId: null
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
  
  // Tabs & Lists
  const [activeTab, setActiveTab] = useState(() => Number(localStorage.getItem('sophiapath_community_active_tab') || '0'));
  const [savedQuestions, setSavedQuestions] = useState([]);

  // Rules dialog states
  const [rulesCommunity, setRulesCommunity] = useState(null);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false);

  // NSFW age check states
  const [openAgeWarning, setOpenAgeWarning] = useState(false);
  const [nsfwCommunityToJoin, setNsfwCommunityToJoin] = useState(null);

  // Leave & Ownership transfer states
  const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
  const [selectedLeaveCommunity, setSelectedLeaveCommunity] = useState(null);
  const [selectedNewOwnerId, setSelectedNewOwnerId] = useState('');

  const [openCreate, setOpenCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('⭐');
  const [category, setCategory] = useState('Software Engineering');

  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIcon, setEditIcon] = useState('⭐');

  // Custom Alert Modal state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showCustomAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const myOwnedCommunitiesCount = useMemo(() => {
    if (!user) return 0;
    return communities.filter(c => Number(c.ownerId) === Number(user.id)).length;
  }, [communities, user]);

  const handleOpenCreateClick = () => {
    if (user?.roleID === 2 && myOwnedCommunitiesCount >= 3) {
      showCustomAlert("Creation Limit Reached", "As a moderator, you can only create at most 3 communities.");
      return;
    }
    setOpenCreate(true);
  };

  // Custom Confirmation Dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [onConfirmCallback, setOnConfirmCallback] = useState(null);

  const showConfirmDialog = (title, message, callback) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setOnConfirmCallback(() => callback);
    setConfirmOpen(true);
  };
  
  const navigate = useNavigate();

  const loadSavedPosts = async () => {
    try {
      const savedIds = JSON.parse(localStorage.getItem('saved_posts_list') || '[]');
      if (savedIds.length > 0) {
        const posts = await Promise.all(
          savedIds.map(async (id) => {
            try {
              return await socialStore.getQuestionById(id);
            } catch (err) {
              return null;
            }
          })
        );
        const validPosts = posts.filter(Boolean);
        setSavedQuestions(validPosts);

        // Clean up stale IDs
        const validIds = validPosts.map(p => p.id);
        if (validIds.length !== savedIds.length) {
          localStorage.setItem('saved_posts_list', JSON.stringify(validIds));
        }
      } else {
        setSavedQuestions([]);
      }
    } catch (e) {
      console.error(e);
      setSavedQuestions([]);
    }
  };

  const loadCommunities = async () => {
    const list = await socialStore.getCommunities();
    setCommunities(list || []);
  };

  useEffect(() => {
    refreshUser();
    loadCommunities();
    loadSavedPosts();
  }, []);

  const filteredCommunities = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return communities;
    return communities.filter(c => {
      const nameWords = (c.name || '').toLowerCase().split(/\s+/);
      const descWords = (c.description || '').toLowerCase().split(/\s+/);
      return nameWords.some(w => w.startsWith(q)) || descWords.some(w => w.startsWith(q));
    });
  }, [communities, searchQuery]);

  const handleToggleJoin = async (e, community) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      if (community.isJoined) {
        setSelectedLeaveCommunity(community);
        setSelectedNewOwnerId('');
        setOpenLeaveDialog(true);
      } else {
        if (community.isNSFW && !user?.ageCheckedNSFW) {
          setNsfwCommunityToJoin(community);
          setOpenAgeWarning(true);
          return;
        }
        
        if (community.rules && community.rules.length > 0) {
          setRulesCommunity(community);
          setRulesAccepted(false);
          setRulesDialogOpen(true);
        } else {
          await socialStore.toggleJoinCommunity(community.id);
          loadCommunities();
          navigate(`/communities/${community.id}`);
        }
      }
    } catch (err) {
      showCustomAlert("Action Failed", err.message);
    }
  };

  const handleRulesJoinSubmit = async () => {
    if (!rulesCommunity || !rulesAccepted) return;
    try {
      const communityId = rulesCommunity.id;
      await socialStore.toggleJoinCommunity(communityId);
      setRulesDialogOpen(false);
      setRulesCommunity(null);
      setRulesAccepted(false);
      loadCommunities();
      navigate(`/communities/${communityId}`);
    } catch (err) {
      showCustomAlert("Action Failed", err.message);
    }
  };

  const handleCreateSubmit = async () => {
    if (!name.trim()) return;
    try {
      const created = await socialStore.createCommunity(name, description, icon, false, false, [], category);
      if (created) {
        setName('');
        setDescription('');
        setIcon('⭐');
        setCategory('Software Engineering');
        setOpenCreate(false);
        loadCommunities();
        navigate(`/communities/${created.id}`);
      }
    } catch (err) {
      showCustomAlert("Action Failed", err.message);
    }
  };

  const handleEditClick = (e, community) => {
    e.stopPropagation();
    setEditId(community.id);
    setEditName(community.name);
    setEditDescription(community.description || '');
    setEditIcon(community.icon || '💻');
    setOpenEdit(true);
  };

  const handleEditSubmit = async () => {
    if (!editName.trim()) return;
    const updated = await socialStore.updateCommunity(editId, editName, editDescription, editIcon);
    if (updated) {
      setOpenEdit(false);
      loadCommunities();
    }
  };

  const handleDeleteClick = async (e, communityId) => {
    e.stopPropagation();
    showConfirmDialog(
      "Delete Community?",
      "Are you sure you want to delete this community? This action is permanent and will delete all rooms and posts.",
      async () => {
        const deleted = await socialStore.deleteCommunity(communityId);
        if (deleted) {
          loadCommunities();
        }
      }
    );
  };

  const displayCommunities = useMemo(() => {
    if (activeTab === 0) {
      const joined = filteredCommunities.filter(c => c.isJoined);
      try {
        const visits = JSON.parse(localStorage.getItem('sophiapath_community_visits') || '{}');
        return joined.sort((a, b) => {
          const timeA = visits[a.id] || 0;
          const timeB = visits[b.id] || 0;
          return timeB - timeA;
        });
      } catch (e) {
        return joined;
      }
    } else if (activeTab === 1) {
      return filteredCommunities
        .filter(c => !c.isJoined && !c.isPrivate)
        .sort((a, b) => (b.membersCount || 0) - (a.membersCount || 0));
    }
    return [];
  }, [filteredCommunities, activeTab]);

  return (
    <Box className="community-list-container">
      
      {/* Top Header Controls */}
      <Box className="community-list-header" sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'stretch' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            placeholder="Search communities..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              localStorage.setItem('sophiapath_community_search_query', val);
            }}
            sx={{ width: { xs: '100%', sm: 300 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: { borderRadius: 3, bgcolor: 'background.paper' }
            }}
          />

          {Number(user?.roleID) !== 2 && Number(user?.roleID) !== 3 && (
            <IconButton
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                color: 'var(--text-secondary)',
                border: '1px solid rgba(255,255,255,0.08)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              title="More Options"
            >
              <MoreVertIcon />
            </IconButton>
          )}
          
          <AllowedFor roles={[2, 3]}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={async (e) => {
                e.currentTarget.blur();
                await refreshUser();
                handleOpenCreateClick();
              }}
              sx={{
                borderRadius: 4,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Create Community
            </Button>
          </AllowedFor>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(e, val) => {
            setActiveTab(val);
            localStorage.setItem('sophiapath_community_active_tab', String(val));
          }}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="My Communities" sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab label="Discover" sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab label="Saved Posts" sx={{ textTransform: 'none', fontWeight: 700 }} />
        </Tabs>
      </Box>

      {/* Main Content Area based on Tab */}
      {activeTab !== 2 ? (
        <Box className="community-grid">
          {displayCommunities.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', width: '100%', gridColumn: '1 / -1' }}>
              <Typography color="text.secondary">
                {activeTab === 0 
                  ? "You haven't joined any communities yet. Switch to the Discover tab to find one!" 
                  : "No communities found."}
              </Typography>
            </Box>
          ) : (
            displayCommunities.map((c) => (
              <Box 
                key={c.id} 
                className="community-card"
                onClick={() => navigate(`/communities/${c.id}`)}
                sx={{ cursor: 'pointer', borderRadius: 2, position: 'relative' }}
              >

                {/* Banner gradient */}
                <Box className="community-card-banner" sx={{ background: c.bannerColor }}>
                  <Box className="community-card-icon-wrapper">
                    {c.icon}
                  </Box>
                </Box>
                
                {/* Content info */}
                <Box className="community-card-content">
                  <Typography variant="h5" className="community-card-name">
                    {c.name}
                  </Typography>
                  <Typography variant="body2" className="community-card-desc">
                    {c.description}
                  </Typography>

                  {/* Category, Privacy, NSFW tags */}
                  <Stack direction="row" spacing={0.8} sx={{ mt: 1.5, mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                    <Box 
                      sx={{ 
                        bgcolor: (CATEGORY_STYLES[c.category] || CATEGORY_STYLES['Software Engineering']).bg, 
                        color: (CATEGORY_STYLES[c.category] || CATEGORY_STYLES['Software Engineering']).color, 
                        px: 1, 
                        py: 0.3, 
                        borderRadius: 1.5, 
                        fontSize: '0.68rem', 
                        fontWeight: 700, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 0.5 
                      }}
                    >
                      {(CATEGORY_STYLES[c.category] || CATEGORY_STYLES['Software Engineering']).icon} {c.category || 'Software Engineering'}
                    </Box>
                    <Box 
                      sx={{ 
                        bgcolor: 'action.hover', 
                        color: 'text.secondary', 
                        px: 1, 
                        py: 0.3, 
                        borderRadius: 1.5, 
                        fontSize: '0.68rem', 
                        fontWeight: 700, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 0.5,
                        border: '1px solid var(--divider)'
                      }}
                    >
                      {c.isPrivate ? '🔒 Private' : '🌐 Public'}
                    </Box>
                    {c.isNSFW && (
                      <Box 
                        sx={{ 
                          bgcolor: '#ef4444', 
                          color: 'white', 
                          px: 1, 
                          py: 0.3, 
                          borderRadius: 1.5, 
                          fontSize: '0.68rem', 
                          fontWeight: 800, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 0.5 
                        }}
                      >
                        ⚠️ {c.nsfwAgeLimit || 18}+ NSFW
                      </Box>
                    )}
                  </Stack>

                  {/* Footer info */}
                  <Box className="community-card-footer">
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'var(--text-secondary)' }}>
                      <PeopleIcon sx={{ fontSize: 18 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {c.membersCount} members
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={0.5} alignItems="center">
                      {Number(c.ownerId) === Number(user?.id) && (
                        <>
                          <IconButton size="small" onClick={(e) => handleEditClick(e, c)} color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={(e) => handleDeleteClick(e, c.id)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                      <Button
                        size="small"
                        variant={c.isJoined ? "outlined" : "contained"}
                        color={c.isJoined ? "error" : "primary"}
                        onClick={(e) => handleToggleJoin(e, c)}
                        startIcon={c.isJoined ? <ExitIcon /> : <LoginIcon />}
                        sx={{
                          borderRadius: 3,
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 2
                        }}
                      >
                        {c.isJoined ? "Leave" : "Join"}
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              </Box>
            ))
          )}
        </Box>
      ) : (
        /* Saved Posts Tab View */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {savedQuestions.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2, border: '1px solid var(--divider)' }}>
              <Typography color="text.secondary">You haven't saved any posts yet.</Typography>
            </Box>
          ) : (
            savedQuestions.map((post) => (
              <Card
                key={post.id}
                onClick={() => navigate(`/communities/${post.room?.communityId || post.communityId || 1}/room/${post.roomId || 1}/question/${post.id}`)}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  cursor: 'pointer',
                  border: '1px solid var(--divider)',

                  position: 'relative',
                  '&:hover': {
                    borderColor: 'var(--primary-color)',
                    bgcolor: 'rgba(61,92,255,0.01)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    {post.title}
                  </Typography>
                  <BookmarkIcon sx={{ color: '#f59e0b' }} />
                </Stack>
                
                <Typography variant="body2" color="text.secondary" sx={{
                  mb: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {post.content?.replace(/!\[Image Attachment\]\(([^)]*)\)/g, '').replace(/\[([^\]]*)\]\(([^)]*)\)/g, '$1') || ''}
                </Typography>

                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar src={post.authorAvatar} sx={{ width: 24, height: 24 }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {post.authorName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    • Saved Post
                  </Typography>
                </Stack>
              </Card>
            ))
          )}
        </Box>
      )}

      {/* Rules Acknowledgment Dialog */}
      <Dialog
        open={rulesDialogOpen}
        onClose={() => setRulesDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          📄 Community Rules
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please read and agree to follow the rules of <strong>{rulesCommunity?.name}</strong> before joining.
          </Typography>
          <List dense sx={{ border: '1px solid var(--divider)', borderRadius: 1.5, p: 1, mb: 2, bgcolor: 'rgba(0,0,0,0.01)' }}>
            {rulesCommunity?.rules?.map((rule, idx) => (
              <ListItem key={idx} sx={{ py: 0.5 }}>
                <ListItemText primary={`${idx + 1}. ${rule}`} primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />
              </ListItem>
            ))}
          </List>
          <FormControlLabel
            control={
              <Checkbox
                checked={rulesAccepted}
                onChange={(e) => setRulesAccepted(e.target.checked)}
                color="primary"
              />
            }
            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>I agree to follow these rules</Typography>}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            disabled={!rulesAccepted}
            onClick={handleRulesJoinSubmit}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Agree & Join
          </Button>
          <Button
            variant="outlined"
            onClick={() => setRulesDialogOpen(false)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Age Restriction warning dialog */}
      <Dialog
        open={openAgeWarning}
        onClose={() => setOpenAgeWarning(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, p: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', color: 'error.main' }}>
          ⚠️ 18+ NSFW Content Check
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
            This community contains adult content. Please confirm you are at least 18 years old to join.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              if (nsfwCommunityToJoin) {
                try {
                  if (nsfwCommunityToJoin.rules && nsfwCommunityToJoin.rules.length > 0) {
                    setRulesCommunity(nsfwCommunityToJoin);
                    setRulesAccepted(false);
                    setRulesDialogOpen(true);
                  } else {
                    const communityId = nsfwCommunityToJoin.id;
                    await socialStore.toggleJoinCommunity(communityId);
                    loadCommunities();
                    navigate(`/communities/${communityId}`);
                  }
                } catch (err) {
                  showCustomAlert("Action Failed", err.message);
                }
              }
              setOpenAgeWarning(false);
              setNsfwCommunityToJoin(null);
            }}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            I am 18+
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setOpenAgeWarning(false);
              setNsfwCommunityToJoin(null);
            }}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Go Back
          </Button>
        </DialogActions>
      </Dialog>

      {/* CREATE COMMUNITY DIALOG */}
      <Dialog 
        open={openCreate} 
        onClose={() => setOpenCreate(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, position: 'relative' },
          elevation: 6
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pr: 7 }}>
          <IconButton
            onClick={() => setOpenCreate(false)}
            sx={{ position: 'absolute', right: 16, top: 16, color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
          Create Learning Community
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Community Name"
            placeholder="e.g. Software Architecture"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            InputProps={{ sx: { borderRadius: 1.5 } }}
            inputProps={{ maxLength: 50 }}
          />
          <TextField
            label="Description"
            placeholder="What is this community's learning focus?"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            InputProps={{ sx: { borderRadius: 1.5 } }}
            inputProps={{ maxLength: 300 }}
          />

          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value)}
              sx={{ borderRadius: 1.5 }}
              MenuProps={{
                PaperProps: {
                  elevation: 1,
                  sx: {
                    maxHeight: 300}
                }
              }}
            >
              {COMMUNITY_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2">Select Community Icon:</Typography>
            {['⭐', '🌟', '🏫', '📚', '🎯', '🔥'].map((emoji) => (
              <Button
                key={emoji}
                variant={icon === emoji ? "contained" : "outlined"}
                sx={{
                  minWidth: 40,
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  fontSize: '1.2rem',
                  p: 0
                }}
                onClick={() => setIcon(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCreateSubmit} 
            variant="contained" 
            disabled={!name.trim()}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT COMMUNITY DIALOG */}
      <Dialog 
        open={openEdit} 
        onClose={() => setOpenEdit(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, position: 'relative' },
          elevation: 6
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pr: 7 }}>
          <IconButton
            onClick={() => setOpenEdit(false)}
            sx={{ position: 'absolute', right: 16, top: 16, color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
          Edit Learning Community
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Community Name"
            placeholder="e.g. Software Architecture"
            fullWidth
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
            InputProps={{ sx: { borderRadius: 1.5 } }}
            inputProps={{ maxLength: 50 }}
          />
          <TextField
            label="Description"
            placeholder="What is this community's learning focus?"
            fullWidth
            multiline
            rows={3}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            InputProps={{ sx: { borderRadius: 1.5 } }}
            inputProps={{ maxLength: 300 }}
          />

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2">Select Community Icon:</Typography>
            {['⭐', '🌟', '🏫', '📚', '🎯', '🔥'].map((emoji) => (
              <Button
                key={emoji}
                variant={editIcon === emoji ? "contained" : "outlined"}
                sx={{
                  minWidth: 40,
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  fontSize: '1.2rem',
                  p: 0
                }}
                onClick={() => setEditIcon(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained" 
            disabled={!editName.trim()}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Theme Alert Dialog */}
      <Dialog 
        open={alertOpen} 
        onClose={() => setAlertOpen(false)}
        PaperProps={{ sx: { borderRadius: 2.5, p: 1, maxWidth: 360 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>{alertTitle}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            {alertMessage}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => setAlertOpen(false)}
            fullWidth
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Okay
          </Button>
        </DialogActions>
      </Dialog>

      {/* Themed Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: 2.5, p: 1, maxWidth: 340 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>{confirmTitle}</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
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

      {/* Leave Community Dialog */}
      <Dialog
        open={openLeaveDialog}
        onClose={() => {
          setOpenLeaveDialog(false);
          setSelectedLeaveCommunity(null);
          setSelectedNewOwnerId('');
        }}
        PaperProps={{ sx: { borderRadius: 2.5, p: 1, maxWidth: 360 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Leave Community</DialogTitle>
        <DialogContent>
          {selectedLeaveCommunity && Number(selectedLeaveCommunity.ownerId) === Number(user?.id) ? (
            (() => {
              const mods = (selectedLeaveCommunity.members || []).filter(m => 
                selectedLeaveCommunity.moderatorIds?.includes(String(m.id)) && Number(m.id) !== Number(user?.id)
              );
              
              if (mods.length === 0) {
                return (
                  <Stack spacing={2} sx={{ mt: 1 }}>
                    <Typography sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      You are the owner of this community. You cannot leave without assigning another owner, and there are currently no moderators to promote to owner.
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem', color: 'primary.main', fontWeight: 600 }}>
                      Please promote at least one member to Moderator inside the community first.
                    </Typography>
                  </Stack>
                );
              }
              
              return (
                <Stack spacing={2} sx={{ mt: 1 }}>
                  <Typography sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    As the owner, you must assign another owner from one of the moderators before you can leave.
                  </Typography>
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <InputLabel id="select-new-owner-label">Select New Owner</InputLabel>
                    <Select
                      labelId="select-new-owner-label"
                      value={selectedNewOwnerId}
                      label="Select New Owner"
                      onChange={(e) => setSelectedNewOwnerId(e.target.value)}
                      sx={{ borderRadius: 1.5 }}
                    >
                      {mods.map(mod => {
                        const name = mod.fullname || mod.name || mod.username || `User #${mod.id}`;
                        return (
                          <MenuItem key={mod.id} value={mod.id}>
                            {name}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Stack>
              );
            })()
          ) : (
            <Typography sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Are you sure you want to leave <strong>{selectedLeaveCommunity?.name}</strong>?
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1.5 }}>
          <Button 
            variant="outlined" 
            onClick={() => {
              setOpenLeaveDialog(false);
              setSelectedLeaveCommunity(null);
              setSelectedNewOwnerId('');
            }}
            fullWidth
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Cancel
          </Button>
          {selectedLeaveCommunity && Number(selectedLeaveCommunity.ownerId) === Number(user?.id) ? (
            (() => {
              const mods = (selectedLeaveCommunity.members || []).filter(m => 
                selectedLeaveCommunity.moderatorIds?.includes(String(m.id)) && Number(m.id) !== Number(user?.id)
              );
              
              if (mods.length === 0) {
                return (
                  <Button 
                    variant="contained" 
                    onClick={() => {
                      setOpenLeaveDialog(false);
                      setSelectedLeaveCommunity(null);
                    }}
                    fullWidth
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                  >
                    Okay
                  </Button>
                );
              }
              
              return (
                <Button 
                  variant="contained" 
                  color="error"
                  disabled={!selectedNewOwnerId}
                  onClick={async () => {
                    try {
                      // 1. Transfer ownership
                      const updatedComm = await socialStore.updateCommunity(
                        selectedLeaveCommunity.id,
                        selectedLeaveCommunity.name,
                        selectedLeaveCommunity.description,
                        selectedLeaveCommunity.icon,
                        selectedLeaveCommunity.isPrivate,
                        selectedLeaveCommunity.isNSFW,
                        selectedLeaveCommunity.rules,
                        selectedLeaveCommunity.category,
                        selectedLeaveCommunity.maxMembers,
                        selectedLeaveCommunity.nsfwAgeLimit,
                        Number(selectedNewOwnerId)
                      );
                      
                      if (updatedComm) {
                        // 2. Leave community
                        await socialStore.toggleJoinCommunity(selectedLeaveCommunity.id);
                        setOpenLeaveDialog(false);
                        setSelectedLeaveCommunity(null);
                        setSelectedNewOwnerId('');
                        loadCommunities();
                      } else {
                        showCustomAlert("Error", "Failed to transfer ownership.");
                      }
                    } catch (err) {
                      showCustomAlert("Error", err.message);
                    }
                  }}
                  fullWidth
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                >
                  Transfer & Leave
                </Button>
              );
            })()
          ) : (
            <Button 
              variant="contained" 
              color="error"
              onClick={async () => {
                try {
                  await socialStore.toggleJoinCommunity(selectedLeaveCommunity.id);
                  setOpenLeaveDialog(false);
                  setSelectedLeaveCommunity(null);
                  loadCommunities();
                } catch (err) {
                  showCustomAlert("Action Failed", err.message);
                }
              }}
              fullWidth
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              Leave
            </Button>
          )}
        </DialogActions>
      </Dialog>
      {/* Community Options Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{
          style: {
            background: 'var(--background-paper)',
            color: 'var(--text-primary)',
            border: '1px solid rgba(255,255,255,0.08)'}
        }}
      >
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            setDialogOpen(true);
          }}
          style={{ fontWeight: 700 }}
        >
          Apply for moderator position
        </MenuItem>
      </Menu>

      {/* Moderator Application Dialog */}
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
          Apply for Moderator Position
        </DialogTitle>
        <form onSubmit={handleAppSubmit}>
          <DialogContent>
            <Typography variant="body2" style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              You are applying to become a Community Moderator. Please upload your CV and fill in the contact details.
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

export default CommunityListPage;
