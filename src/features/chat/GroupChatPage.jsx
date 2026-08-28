import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  TextField,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Menu,
  MenuItem,
  Popover,
  InputAdornment,
  Switch,
  Alert,
  Snackbar,
  Tabs,
  Tab
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  InfoOutlined as InfoIcon,
  PersonAddOutlined as AddPersonIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Fingerprint as FingerprintIcon,
  CalendarToday as CalendarIcon,
  AlternateEmail as EmailIcon,
  AttachFile as AttachFileIcon,
  InsertEmoticon as EmojiIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  PhotoCamera as CameraIcon,
  PushPin as PushPinIcon,
  ContentCopy as CopyIcon,
  Reply as ReplyIcon,
  ForwardToInbox as ForwardIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  Poll as PollIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { socialStore } from '../../data/socialStore';
import ImageEditorModal from './ImageEditorModal';
// Local date helper utilities
const parseSafeDate = (dateVal) => {
  if (!dateVal) return null;
  if (dateVal instanceof Date) return isNaN(dateVal.getTime()) ? null : dateVal;
  let d = new Date(dateVal);
  if (!isNaN(d.getTime())) return d;
  if (typeof dateVal === 'string') {
    let sanitized = dateVal.trim().replace(' ', 'T');
    if (!sanitized.endsWith('Z') && !sanitized.includes('+') && !sanitized.includes('-')) {
      sanitized += 'Z';
    }
    d = new Date(sanitized);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
};

const parseSafeTime = (dateVal) => {
  const d = parseSafeDate(dateVal);
  return d ? d.getTime() : 0;
};

const formatDate = (dateVal) => {
  const d = parseSafeDate(dateVal);
  if (!d) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatDateDivider = (dateVal) => {
  const d = parseSafeDate(dateVal);
  if (!d) return '';
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffTime = today.getTime() - msgDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const formatLogTime = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};
import './Chat.css';

const GroupChatPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, blockUser, unblockUser } = useAuth();

  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  // Modals state
  const [openInfo, setOpenInfo] = useState(false);
  const [openAddMembers, setOpenAddMembers] = useState(false);
  const [replyingMessage, setReplyingMessage] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuMessage, setMenuMessage] = useState(null);
  const [openForwardDialog, setOpenForwardDialog] = useState(false);
  const [openPinnedDialog, setOpenPinnedDialog] = useState(false);
  const [searchMessageId, setSearchMessageId] = useState(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedNewMembers, setSelectedNewMembers] = useState([]);

  // Advanced features states
  const [groupTypingUsers, setGroupTypingUsers] = useState([]);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const prevMessagesLengthRef = useRef(0);
  const firstUnseenMsgId = useRef(null);
  const [emojiUsage, setEmojiUsage] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sophiapath_emoji_usage') || '{}');
    } catch {
      return {};
    }
  });
  const [editingMessage, setEditingMessage] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMatches, setSearchMatches] = useState([]);
  const [searchMatchIndex, setSearchMatchIndex] = useState(0);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState(new Set());
  const [profileTab, setProfileTab] = useState(0);
  const [mentionSearchQuery, setMentionSearchQuery] = useState('');
  const [showMentionsList, setShowMentionsList] = useState(false);
  const [openLeaveConfirm, setOpenLeaveConfirm] = useState(false);
  const [openAssignAdminDialog, setOpenAssignAdminDialog] = useState(false);
  const [selectedAdminToAssign, setSelectedAdminToAssign] = useState('');

  const [headerMenuAnchor, setHeaderMenuAnchor] = useState(null);
  const [openClearConfirm, setOpenClearConfirm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [clearTrigger, setClearTrigger] = useState(0);

  const initialMessageIds = useRef(new Set());

  const displayedMessages = useMemo(() => {
    const clearMsgId = localStorage.getItem(`sophiapath_clear_msg_id_${user?.id}_${groupId}`);
    const clearTime = localStorage.getItem(`sophiapath_clear_time_${user?.id}_${groupId}`);
    
    let filtered = messages;
    if (clearMsgId) {
      const clearIdx = messages.findIndex(m => String(m.id) === String(clearMsgId));
      if (clearIdx !== -1) {
        filtered = messages.slice(clearIdx + 1);
      } else if (clearTime) {
        filtered = messages.filter(m => parseSafeTime(m.timestamp) > parseSafeTime(clearTime));
      }
    } else if (clearTime) {
      filtered = messages.filter(m => parseSafeTime(m.timestamp) > parseSafeTime(clearTime));
    }

    if (filtered.length > 0 && initialMessageIds.current.size === 0) {
      filtered.forEach(m => initialMessageIds.current.add(String(m.id)));
    }
    return filtered;
  }, [messages, groupId, user?.id, clearTrigger]);

  const [sessionLastSeenId, setSessionLastSeenId] = useState(null);
  const [sessionLastSeen, setSessionLastSeen] = useState(null);

  useEffect(() => {
    initialMessageIds.current = new Set();
  }, [groupId]);

  useEffect(() => {
    if (!groupId || !user?.id) return;
    const lastId = localStorage.getItem(`sophiapath_last_seen_id_${user.id}_${groupId}`);
    const stored = localStorage.getItem(`sophiapath_last_seen_${user.id}_${groupId}`);
    setSessionLastSeenId(lastId);
    setSessionLastSeen(stored || new Date().toISOString());
  }, [groupId, user?.id]);

  useEffect(() => {
    if (groupId && user?.id && displayedMessages.length > 0) {
      const lastMsg = displayedMessages[displayedMessages.length - 1];
      if (lastMsg) {
        localStorage.setItem(`sophiapath_last_seen_id_${user.id}_${groupId}`, String(lastMsg.id));
        localStorage.setItem(`sophiapath_last_seen_${user.id}_${groupId}`, new Date().toISOString());
      }
    }
  }, [groupId, user?.id, displayedMessages]);

  // Lightbox / Detail view states for group members
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState('');
  const [lightboxName, setLightboxName] = useState('');
  const [lightboxIsProfile, setLightboxIsProfile] = useState(false);

  const [selectedMemberInfo, setSelectedMemberInfo] = useState(null);
  const [openMemberInfo, setOpenMemberInfo] = useState(false);

  // Group Poll States
  const [openGroupPollCreator, setOpenGroupPollCreator] = useState(false);
  const [groupPollQuestion, setGroupPollQuestion] = useState('');
  const [groupPollOptions, setGroupPollOptions] = useState(['', '']);

  // Group Details Editing States
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDescription, setEditGroupDescription] = useState('');
  const [editGroupAvatar, setEditGroupAvatar] = useState('');
  const [editOnlyAdminsCanEdit, setEditOnlyAdminsCanEdit] = useState(false);
  const [editOnlyAdminsCanSendMessages, setEditOnlyAdminsCanSendMessages] = useState(false);
  const [editOnlyAdminsCanAddMembers, setEditOnlyAdminsCanAddMembers] = useState(false);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  const groupAvatarInputRef = useRef(null);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  const handleAvatarFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Group profile picture must be smaller than 2MB.');
      return;
    }

    setAvatarError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      setEditGroupAvatar(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleAvatarFile(e.target.files[0]);
    }
  };

  const handleAvatarDragOver = (e) => {
    e.preventDefault();
    setIsDraggingAvatar(true);
  };

  const handleAvatarDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingAvatar(false);
  };

  const handleAvatarDrop = (e) => {
    e.preventDefault();
    setIsDraggingAvatar(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAvatarFile(e.dataTransfer.files[0]);
    }
  };

  const triggerAvatarFileInput = () => {
    if (groupAvatarInputRef.current) {
      groupAvatarInputRef.current.click();
    }
  };

  useEffect(() => {
    if (openInfo && group) {
      setEditGroupName(group.name || '');
      setEditGroupDescription(group.description || '');
      setEditGroupAvatar(group.avatar || '');
      setEditOnlyAdminsCanEdit(!!group.onlyAdminsCanEdit);
      setEditOnlyAdminsCanSendMessages(!!group.onlyAdminsCanSendMessages);
      setEditOnlyAdminsCanAddMembers(!!group.onlyAdminsCanAddMembers);
      setIsEditingGroup(false);
      setAvatarError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openInfo]);

  const handleSaveGroupDetails = async () => {
    if (!editGroupName.trim()) return;
    const updates = {
      name: editGroupName,
      description: editGroupDescription,
      avatar: editGroupAvatar
    };
    if (isAdmin) {
      updates.onlyAdminsCanEdit = editOnlyAdminsCanEdit;
      updates.onlyAdminsCanSendMessages = editOnlyAdminsCanSendMessages;
      updates.onlyAdminsCanAddMembers = editOnlyAdminsCanAddMembers;
    }
    const updated = await socialStore.updateGroupDetails(groupId, user.id, updates);
    if (updated) {
      setGroup(updated);
      setIsEditingGroup(false);
      loadGroupDetails();
    }
  };

  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [emojiAnchor, setEmojiAnchor] = useState(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorImageSrc, setEditorImageSrc] = useState('');
  const [pendingImagesQueue, setPendingImagesQueue] = useState([]);

  const sendBase64ImageMessage = async (editedBase64) => {
    try {
      const finalMsg = `[IMAGE]:${editedBase64}`;
      const msg = await socialStore.sendGroupMessage(
        groupId,
        user.id,
        user.username || 'learner',
        user.avatar || '',
        finalMsg
      );

      if (msg) {
        setMessages(prev => [...prev, msg]);
      }
    } catch (err) {
      console.error('Failed to send group image:', err);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const promises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(dataUrls => {
      setPendingImagesQueue(dataUrls);
      setEditorOpen(true);
    });
    e.target.value = '';
  };

  const handleScrollToMessage = (msgId) => {
    setSearchMessageId(Number(msgId));
    setHighlightedMessageId(Number(msgId));
    setTimeout(() => {
      setHighlightedMessageId(null);
    }, 2500);
  };

  useEffect(() => {
    if (searchMessageId) {
      const el = document.getElementById(`msg-${searchMessageId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setSearchMessageId(null);
      }
    }
  }, [searchMessageId, displayedMessages]);

  // Auto scroll to message from query parameter on load
  const queryParams = new URLSearchParams(location.search);
  const qMessageId = queryParams.get('messageId');

  useEffect(() => {
    if (displayedMessages.length > 0 && qMessageId) {
      const timeout = setTimeout(() => {
        handleScrollToMessage(qMessageId);
        navigate(location.pathname, { replace: true });
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [displayedMessages.length, qMessageId]);

  const handleMessageBubbleClick = (event, msg) => {
    if (msg.deleted) return;
    setMenuAnchor(event.currentTarget);
    setMenuMessage(msg);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setMenuMessage(null);
  };

  const handleCopyMessage = () => {
    if (menuMessage) {
      const cleanText = menuMessage.text.startsWith('[IMAGE]:') 
        ? menuMessage.text.split('|')[1] || '' 
        : menuMessage.text;
      navigator.clipboard.writeText(cleanText);
      setSnackbarMessage("Copied to clipboard!");
      setOpenSnackbar(true);
    }
    handleCloseMenu();
  };

  const handlePinToggle = async () => {
    if (menuMessage) {
      const newPinState = !menuMessage.pinned;
      const success = await socialStore.pinGroupMessage(menuMessage.id, newPinState);
      if (success) {
        setMessages(prev => prev.map(m => m.id === menuMessage.id ? { ...m, pinned: newPinState } : m));
        setSnackbarMessage(newPinState ? "Message pinned!" : "Message unpinned!");
        setOpenSnackbar(true);
      }
    }
    handleCloseMenu();
  };

  const handleDeleteMessage = async () => {
    if (menuMessage && Number(menuMessage.senderId) === Number(user.id)) {
      const success = await socialStore.deleteGroupMessage(menuMessage.id, user.id);
      if (success) {
        setMessages(prev => prev.map(m => m.id === menuMessage.id ? { ...m, deleted: true, text: 'This message was deleted' } : m));
        setSnackbarMessage("Message deleted!");
        setOpenSnackbar(true);
        // Remove from starred messages list
        let starred = JSON.parse(localStorage.getItem('starred_messages_list') || '[]');
        starred = starred.filter(m => String(m.id) !== String(menuMessage.id));
        localStorage.setItem('starred_messages_list', JSON.stringify(starred));
      }
    }
    handleCloseMenu();
  };

  const handleForwardClick = () => {
    setOpenForwardDialog(true);
    setMenuAnchor(null);
  };

  const handleForwardMessage = async (recipient) => {
    if (!menuMessage) return;
    const cleanText = menuMessage.text;
    const senderName = user.fullname || user.name || user.username || "You";

    const res = await socialStore.sendDirectMessage(
      user.id,
      recipient.id,
      cleanText,
      senderName,
      user.avatar || '',
      null,
      null,
      null,
      true
    );

    if (res && res.success) {
      setSnackbarMessage(`Forwarded to ${recipient.fullname || recipient.username}`);
      setOpenSnackbar(true);
    }
    setOpenForwardDialog(false);
    setMenuMessage(null);
  };

  const handleReplyClick = () => {
    setReplyingMessage(menuMessage);
    handleCloseMenu();
  };

  const handleStarToggle = () => {
    if (!menuMessage) return;
    let list = JSON.parse(localStorage.getItem('starred_messages_list') || '[]');
    const isStarred = list.some(m => String(m.id) === String(menuMessage.id));
    if (isStarred) {
      list = list.filter(m => String(m.id) !== String(menuMessage.id));
      setSnackbarMessage("Message unstarred!");
    } else {
      const isImg = menuMessage.text?.startsWith('[IMAGE]:');
      const textToStore = isImg ? '[IMAGE]:' : menuMessage.text;
      list.push({
        id: menuMessage.id,
        groupId: groupId,
        type: 'group',
        text: textToStore,
        senderName: Number(menuMessage.senderId) === Number(user?.id) ? 'You' : (menuMessage.senderName || 'user'),
        senderAvatar: menuMessage.senderAvatar,
        timestamp: menuMessage.timestamp
      });
      setSnackbarMessage("Message starred!");
    }
    
    // Clean existing entries with heavy image strings to free up storage space
    const cleaned = list.map(m => {
      if (m.text && m.text.startsWith('[IMAGE]:') && m.text.length > 500) {
        return { ...m, text: '[IMAGE]:' };
      }
      return m;
    });

    try {
      localStorage.setItem('starred_messages_list', JSON.stringify(cleaned));
    } catch (err) {
      console.warn("Storage quota exceeded, pruning avatar cache and starred list...", err);
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith('avatar_')) {
            localStorage.removeItem(key);
          }
        }
        localStorage.setItem('starred_messages_list', JSON.stringify(cleaned));
      } catch {
        try {
          localStorage.setItem('starred_messages_list', JSON.stringify(cleaned.slice(-10)));
        } catch {
          localStorage.removeItem('starred_messages_list');
        }
      }
    }
    setOpenSnackbar(true);
    handleCloseMenu();
  };

  const handleSendGroupPoll = async () => {
    if (!groupPollQuestion.trim()) return;
    const cleanOpts = groupPollOptions.filter(o => o.trim() !== '');
    if (cleanOpts.length < 2) return;

    await socialStore.sendGroupMessage(
      groupId,
      user.id,
      user.username || 'learner',
      user.avatar || '',
      `[POLL]: ${groupPollQuestion}`,
      null,
      null,
      null,
      false,
      groupPollQuestion,
      cleanOpts
    );

    setGroupPollQuestion('');
    setGroupPollOptions(['', '']);
    setOpenGroupPollCreator(false);
    loadGroupDetails();
  };



  // Member dropdown menu anchor state
  const [memberMenuAnchor, setMemberMenuAnchor] = useState(null);
  const [menuTargetMember, setMenuTargetMember] = useState(null);

  const handleOpenMemberMenu = (event, member) => {
    event.stopPropagation();
    setMemberMenuAnchor(event.currentTarget);
    setMenuTargetMember(member);
  };

  const handleCloseMemberMenu = () => {
    setMemberMenuAnchor(null);
    setMenuTargetMember(null);
  };

  const handleToggleAdmin = async () => {
    if (!menuTargetMember || !group) return;
    const isTargetAdmin = group.adminIds?.includes(String(menuTargetMember.id));
    let updated;
    if (isTargetAdmin) {
      updated = await socialStore.removeGroupAdmin(groupId, menuTargetMember.id);
    } else {
      updated = await socialStore.makeGroupAdmin(groupId, menuTargetMember.id);
    }
    if (updated) {
      setGroup(updated);
    }
    handleCloseMemberMenu();
  };

  const sortedMembers = useMemo(() => {
    if (!group || !group.members || !user) return [];
    return [...group.members].sort((a, b) => {
      const aId = Number(a.id);
      const bId = Number(b.id);
      const myId = Number(user.id);
      const creatorId = Number(group.createdBy);

      // 1. "You" check
      if (aId === myId && bId !== myId) return -1;
      if (bId === myId && aId !== myId) return 1;

      // 2. Creator check
      if (aId === creatorId && bId !== creatorId) return -1;
      if (bId === creatorId && aId !== creatorId) return 1;

      // 3. Admin status check
      const aAdmin = group.adminIds?.includes(String(aId));
      const bAdmin = group.adminIds?.includes(String(bId));
      if (aAdmin && !bAdmin) return -1;
      if (!aAdmin && bAdmin) return 1;

      // 4. Alphabetical by name
      const aName = (a.fullname || a.name || a.username || '').toLowerCase();
      const bName = (b.fullname || b.name || b.username || '').toLowerCase();
      return aName.localeCompare(bName);
    });
  }, [group?.members, group?.adminIds, group?.createdBy, user?.id]);

  const handleRemoveMember = async () => {
    if (!menuTargetMember || !group) return;
    const updated = await socialStore.removeGroupMember(groupId, menuTargetMember.id);
    if (updated) {
      setGroup(updated);
    }
    handleCloseMemberMenu();
  };

  const handleViewMemberInfo = () => {
    if (!menuTargetMember) return;
    setSelectedMemberInfo(menuTargetMember);
    setOpenMemberInfo(true);
    handleCloseMemberMenu();
  };

  const handleViewMemberAvatar = () => {
    if (!menuTargetMember) return;
    const avatarUrl = localStorage.getItem(`avatar_${menuTargetMember.id}`) || menuTargetMember.avatar || '';
    setLightboxUrl(avatarUrl);
    setLightboxName(menuTargetMember.fullname || menuTargetMember.name || menuTargetMember.username || 'User');
    setLightboxIsProfile(true);
    setLightboxOpen(true);
    handleCloseMemberMenu();
  };

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const hasInitialScrolled = useRef(false);

  // Load group details and users
  const loadGroupDetails = async () => {
    const data = await socialStore.getGroupById(groupId, user?.id);
    if (data) {
      if (user?.id) {
        const isMember = data.members?.some(m => Number(m.id) === Number(user?.id));
        if (!isMember) {
          navigate('/chats?tab=groups');
          return;
        }

        // Initialize or update local clear chat time to their join timestamp
        const clearKey = `sophiapath_clear_time_${user.id}_${groupId}`;
        const storedClearTime = localStorage.getItem(clearKey);
        try {
          const joinTimes = data.memberJoinTimes ? JSON.parse(data.memberJoinTimes) : {};
          const userJoinTime = joinTimes[user.id];
          if (userJoinTime) {
            if (!storedClearTime || parseSafeTime(storedClearTime) < parseSafeTime(userJoinTime)) {
              localStorage.setItem(clearKey, userJoinTime);
              setClearTrigger(prev => prev + 1);
            }
          } else {
            if (!storedClearTime) {
              localStorage.setItem(clearKey, new Date().toISOString());
              setClearTrigger(prev => prev + 1);
            }
          }
        } catch {
          if (!storedClearTime) {
            localStorage.setItem(clearKey, new Date().toISOString());
            setClearTrigger(prev => prev + 1);
          }
        }
      }
      setGroup(data);
      setMessages(data.messages || []);
    } else {
      if (user?.id) {
        navigate('/chats?tab=groups');
        return;
      }
    }
    const typing = await socialStore.getGroupTypingStatus(groupId);
    if (typing) {
      const typingOthers = typing.filter(t => Number(t.userId) !== Number(user?.id));
      setGroupTypingUsers(typingOthers);
    }
  };

  useEffect(() => {
    if (groupId) {
      loadGroupDetails();
      const interval = setInterval(loadGroupDetails, 3000);
      return () => clearInterval(interval);
    }
  }, [groupId, user?.id]);

  // Load all users to be able to add members
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        // 1. Fetch all users
        const usersRes = await fetch('/users', { headers });
        if (!usersRes.ok) return;
        const allUsersList = await usersRes.json();
        const nonAdmins = (allUsersList || []).filter(u => u.roleID !== 3);

        // 2. Fetch conversations
        const conversations = await socialStore.getUserConversations();
        
        // 3. Extract active partner IDs
        const partnerIds = conversations.map(c => {
          return Number(c.userId1) === Number(user.id) ? Number(c.userId2) : Number(c.userId1);
        });

        // 4. Filter nonAdmins to only include active partners
        const activeContacts = nonAdmins.filter(u => partnerIds.includes(Number(u.id)));

        // 5. Exclude current members of this group
        if (group) {
          const filtered = activeContacts.filter(u => !group.members.some(m => Number(m.id) === Number(u.id)));
          setAllUsers(filtered);
        } else {
          setAllUsers(activeContacts.filter(u => Number(u.id) !== Number(user.id)));
        }
      } catch (err) {
        console.error('Failed to fetch active contacts:', err);
      }
    };
    if (openAddMembers || openInfo) {
      fetchUsers();
    }
  }, [openAddMembers, openInfo, group]);



  // Load draft and reset state on group change
  useEffect(() => {
    if (user?.id && groupId) {
      const draft = localStorage.getItem(`sophiapath_draft_group_${user.id}_${groupId}`) || '';
      setInputText(draft);
      prevMessagesLengthRef.current = 0;
      setNewMessagesCount(0);
      firstUnseenMsgId.current = null;
      hasInitialScrolled.current = false;
      setShowMentionsList(false);
    }
  }, [groupId, user?.id]);

  // Smart scrolling on messages load
  useEffect(() => {
    if (displayedMessages.length > 0) {
      const prevLength = prevMessagesLengthRef.current;
      const newMsgs = displayedMessages.slice(prevLength);

      if (prevLength === 0) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        hasInitialScrolled.current = true;
      } else if (newMsgs.length > 0) {
        const lastMsg = newMsgs[newMsgs.length - 1];
        const isSentByMe = Number(lastMsg.senderId) === Number(user?.id);
        const isNearBottom = scrollContainerRef.current
          ? (scrollContainerRef.current.scrollHeight - scrollContainerRef.current.scrollTop - scrollContainerRef.current.clientHeight < 200)
          : true;

        if (isSentByMe || isNearBottom) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 80);
          setNewMessagesCount(0);
          firstUnseenMsgId.current = null;
        } else {
          const unseen = newMsgs.filter(m => Number(m.senderId) !== Number(user?.id)).length;
          if (unseen > 0) {
            setNewMessagesCount(prev => prev + unseen);
            if (!firstUnseenMsgId.current) {
              const firstUnseen = newMsgs.find(m => Number(m.senderId) !== Number(user?.id));
              if (firstUnseen) {
                firstUnseenMsgId.current = firstUnseen.id;
              }
            }
          }
        }
      }
      prevMessagesLengthRef.current = displayedMessages.length;
    }
  }, [displayedMessages, user?.id]);

  const lastTypingStatusRef = useRef(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const sendGroupTypingStatus = async (typing) => {
    if (!user?.id || !groupId) return;
    if (lastTypingStatusRef.current === typing) return;
    lastTypingStatusRef.current = typing;
    await socialStore.setGroupTypingStatus(groupId, user.id, user.username || 'learner', typing);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);
    if (user?.id && groupId) {
      localStorage.setItem(`sophiapath_draft_group_${user.id}_${groupId}`, val);
    }

    const mentionMatch = val.match(/@(\w*)$/);
    if (mentionMatch) {
      setMentionSearchQuery(mentionMatch[1]);
      setShowMentionsList(true);
    } else {
      setShowMentionsList(false);
    }

    sendGroupTypingStatus(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendGroupTypingStatus(false);
    }, 3000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || !group) return;

    if (editingMessage) {
      try {
        const updated = await socialStore.editGroupMessage(editingMessage.id, inputText.trim(), user.id);
        if (updated) {
          setMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, text: updated.message, edited: true } : m));
          setEditingMessage(null);
          setInputText('');
          if (user?.id && groupId) {
            localStorage.removeItem(`sophiapath_draft_group_${user.id}_${groupId}`);
          }
          setSnackbarMessage("Message updated!");
          setOpenSnackbar(true);
        }
      } catch (err) {
        console.error('Failed to edit group message:', err);
      }
      return;
    }

    const senderName = user.fullname || user.name || user.username || "You";
    const senderAvatar = user.avatar || "";

    let finalMsg = inputText;
    if (selectedImage) {
      finalMsg = `[IMAGE]:${selectedImage}${inputText ? `|${inputText}` : ''}`;
    }

    const replyToId = replyingMessage ? String(replyingMessage.id) : null;
    const replyToMessage = replyingMessage ? (replyingMessage.text.startsWith('[IMAGE]:') ? '📷 Photo' : replyingMessage.text) : null;
    const replyToUsername = replyingMessage ? replyingMessage.senderName : null;

    const msg = await socialStore.sendGroupMessage(
      groupId,
      user.id,
      senderName,
      senderAvatar,
      finalMsg,
      replyToId,
      replyToMessage,
      replyToUsername,
      false // forwarded
    );

    if (msg) {
      setMessages(prev => [...prev, msg]);
      setSessionLastSeenId(null);
      setSessionLastSeen(new Date().toISOString());
      setInputText('');
      if (user?.id && groupId) {
        localStorage.removeItem(`sophiapath_draft_group_${user.id}_${groupId}`);
      }
      setSelectedImage(null);
      setReplyingMessage(null);
      firstUnseenMsgId.current = null;
      
      // Stop typing status
      sendGroupTypingStatus(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottomBtn(isScrolledUp);
    if (!isScrolledUp) {
      setNewMessagesCount(0);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setNewMessagesCount(0);
  };

  const handleScrollBottomClick = () => {
    if (newMessagesCount > 0 && firstUnseenMsgId.current) {
      const el = document.getElementById(`msg-${firstUnseenMsgId.current}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setNewMessagesCount(0);
    } else {
      scrollToBottom();
    }
  };

  const handleEmojiClick = (emoji) => {
    const newVal = inputText + emoji;
    setInputText(newVal);
    if (user?.id && groupId) {
      localStorage.setItem(`sophiapath_draft_group_${user.id}_${groupId}`, newVal);
    }
    const updated = { ...emojiUsage, [emoji]: (emojiUsage[emoji] || 0) + 1 };
    setEmojiUsage(updated);
    localStorage.setItem('sophiapath_emoji_usage', JSON.stringify(updated));
  };

  const frequentlyUsedEmojis = useMemo(() => {
    return Object.entries(emojiUsage)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 12);
  }, [emojiUsage]);

  const handleFindSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchMatches([]);
      setSearchMatchIndex(0);
      return;
    }
    const matches = displayedMessages
      .filter(m => !m.deleted && m.text && m.text.toLowerCase().includes(query.toLowerCase()))
      .map(m => m.id);
    setSearchMatches(matches);
    setSearchMatchIndex(0);
    if (matches.length > 0) {
      const el = document.getElementById(`msg-${matches[0]}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleNextSearchMatch = () => {
    if (searchMatches.length === 0) return;
    const nextIdx = (searchMatchIndex + 1) % searchMatches.length;
    setSearchMatchIndex(nextIdx);
    const el = document.getElementById(`msg-${searchMatches[nextIdx]}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handlePrevSearchMatch = () => {
    if (searchMatches.length === 0) return;
    const prevIdx = (searchMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setSearchMatchIndex(prevIdx);
    const el = document.getElementById(`msg-${searchMatches[prevIdx]}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const toggleSelectMessage = (msgId) => {
    setSelectedMessageIds(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) {
        next.delete(msgId);
      } else {
        next.add(msgId);
      }
      return next;
    });
  };

  const handleMultiDelete = async () => {
    let successCount = 0;
    const idsToDelete = Array.from(selectedMessageIds).filter(id => {
      const msg = messages.find(m => String(m.id) === String(id));
      return msg && Number(msg.senderId) === Number(user?.id);
    });

    if (idsToDelete.length === 0) {
      setSnackbarMessage("No messages sent by you are selected.");
      setOpenSnackbar(true);
      return;
    }

    for (const id of idsToDelete) {
      const res = await socialStore.deleteGroupMessage(id, user.id);
      if (res) {
        setMessages(prev => prev.map(m => String(m.id) === String(id) ? { ...m, deleted: true, text: 'This message was deleted' } : m));
        successCount++;
        // Remove from starred messages list
        let starred = JSON.parse(localStorage.getItem('starred_messages_list') || '[]');
        starred = starred.filter(m => String(m.id) !== String(id));
        localStorage.setItem('starred_messages_list', JSON.stringify(starred));
      }
    }

    setSnackbarMessage(`Deleted ${successCount} messages.`);
    setOpenSnackbar(true);
    setSelectedMessageIds(new Set());
    setSelectionMode(false);
  };

  const handleMultiStar = () => {
    let list = JSON.parse(localStorage.getItem('starred_messages_list') || '[]');
    let count = 0;
    
    selectedMessageIds.forEach(id => {
      const msg = messages.find(m => String(m.id) === String(id));
      if (msg && !msg.deleted) {
        const isStarred = list.some(m => String(m.id) === String(msg.id));
        if (!isStarred) {
          const isImg = msg.text?.startsWith('[IMAGE]:');
          const textToStore = isImg ? '[IMAGE]:' : msg.text;
          list.push({
            id: msg.id,
            groupId: groupId,
            type: 'group',
            text: textToStore,
            senderName: msg.senderName,
            senderAvatar: msg.senderAvatar,
            timestamp: msg.timestamp
          });
          count++;
        }
      }
    });

    localStorage.setItem('starred_messages_list', JSON.stringify(list));
    setSnackbarMessage(`Starred ${count} messages.`);
    setOpenSnackbar(true);
    setSelectedMessageIds(new Set());
    setSelectionMode(false);
  };

  const handleMultiForward = () => {
    setOpenForwardDialog(true);
  };

  const handleMultiForwardSubmit = async (recipient) => {
    let count = 0;
    const senderName = user.fullname || user.name || user.username || "You";

    for (const id of Array.from(selectedMessageIds)) {
      const msg = messages.find(m => String(m.id) === String(id));
      if (msg && !msg.deleted) {
        await socialStore.sendDirectMessage(
          user.id,
          recipient.id,
          msg.text,
          senderName,
          user.avatar || '',
          null,
          null,
          null,
          true
        );
        count++;
      }
    }

    setSnackbarMessage(`Forwarded ${count} messages to ${recipient.fullname || recipient.username}`);
    setOpenSnackbar(true);
    setOpenForwardDialog(false);
    setSelectedMessageIds(new Set());
    setSelectionMode(false);
  };

  const handleLeaveGroupValidation = () => {
    if (!group || !user) return;
    
    const creatorId = Number(group.createdBy);
    const adminIdsList = group.adminIds || [];
    const isUserAdmin = Number(user.id) === creatorId || adminIdsList.includes(String(user.id));
    
    if (isUserAdmin) {
      const currentAdmins = group.members.filter(m => 
        Number(m.id) === creatorId || adminIdsList.includes(String(m.id))
      );
      
      if (currentAdmins.length === 1 && String(currentAdmins[0].id) === String(user.id)) {
        const otherMembers = group.members.filter(m => String(m.id) !== String(user.id));
        if (otherMembers.length > 0) {
          setSelectedAdminToAssign(otherMembers[0].id);
          setOpenAssignAdminDialog(true);
          return;
        }
      }
    }
    
    setOpenLeaveConfirm(true);
  };

  const handleAssignAdminAndLeave = async () => {
    if (!selectedAdminToAssign) return;
    try {
      await socialStore.makeGroupAdmin(groupId, selectedAdminToAssign);
      const success = await socialStore.removeGroupMember(groupId, user.id);
      if (success) {
        setOpenAssignAdminDialog(false);
        navigate('/chats?tab=groups');
      } else {
        setSnackbarMessage("Failed to leave group.");
        setOpenSnackbar(true);
      }
    } catch (err) {
      console.error("Failed to assign admin and leave:", err);
    }
  };

  const handleNormalLeaveGroup = async () => {
    try {
      const success = await socialStore.removeGroupMember(groupId, user.id);
      if (success) {
        setOpenLeaveConfirm(false);
        navigate('/chats?tab=groups');
      } else {
        setSnackbarMessage("Failed to leave group.");
        setOpenSnackbar(true);
      }
    } catch (err) {
      console.error("Failed to leave group:", err);
    }
  };

  const handleAddMembersSubmit = async () => {
    if (selectedNewMembers.length === 0) return;
    
    await socialStore.addGroupMembers(groupId, selectedNewMembers);
    setSelectedNewMembers([]);
    setOpenAddMembers(false);
    loadGroupDetails();
  };

  if (!user) {
    return (
      <Box className="chat-page-container">
        <Paper className="chat-window glass-panel-strong">
          <Box className="chat-empty-state">
            <Typography variant="body1">Loading authentication context...</Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  if (!group) {
    return (
      <Box className="chat-page-container">
        <Paper className="chat-window glass-panel-strong">
          <Box className="chat-empty-state">
            <Typography variant="body1">Loading Group Chat...</Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  const isCreator = group && Number(group.createdBy) === Number(user?.id) && group.adminIds?.includes(String(user?.id));
  const isAdmin = group && group.adminIds?.includes(String(user?.id));
  const canEditGroupDetails = group && (!group.onlyAdminsCanEdit || isAdmin);
  const canSendMessage = group && (!group.onlyAdminsCanSendMessages || isAdmin);
  const canAddMembers = group && (!group.onlyAdminsCanAddMembers || isAdmin);
  const initials = group.name.substring(0, 2).toUpperCase();

  return (
    <Box className="chat-page-container">
      <Paper className="chat-window glass-panel-strong" sx={{ position: 'relative' }}>
        
        {/* Header */}
        {selectionMode ? (
          <Box className="chat-header" sx={{ bgcolor: 'primary.dark', color: 'white' }}>
            <IconButton onClick={() => { setSelectionMode(false); setSelectedMessageIds(new Set()); }} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, ml: 2, color: 'white', fontWeight: 600 }}>
              Selected: {selectedMessageIds.size} message(s)
            </Typography>
            <IconButton onClick={handleMultiStar} sx={{ color: 'white', mr: 1 }}>
              <StarIcon />
            </IconButton>
            <IconButton onClick={handleMultiForward} sx={{ color: 'white', mr: 1 }}>
              <ForwardIcon />
            </IconButton>
            <IconButton onClick={handleMultiDelete} sx={{ color: '#ff5252', mr: 1 }}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ) : (
          <Box className="chat-header">
            <IconButton onClick={() => navigate('/chats?tab=groups')} className="chat-back-btn">
              <ArrowBackIcon />
            </IconButton>
            
            <Box 
              sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', flexGrow: 1 }}
              onClick={() => setOpenInfo(true)}
            >
              <Avatar 
                src={group.avatar} 
                className="chat-header-avatar"
                sx={{ bgcolor: 'primary.light', color: 'white', fontWeight: 'bold', borderRadius: 4 }}
              >
                {!group.avatar && initials}
              </Avatar>
              <Box>
                <Typography variant="h6" className="chat-header-name">{group.name}</Typography>
                <Typography variant="caption" className="chat-header-status">
                  {group.members.length} members • View Info
                </Typography>
              </Box>
            </Box>

            <IconButton 
              onClick={() => {
                setSearchOpen(prev => {
                  if (prev) {
                    setSearchQuery('');
                    setSearchMatches([]);
                  }
                  return !prev;
                });
              }} 
              sx={{ color: 'var(--text-primary)' }}
            >
              <SearchIcon />
            </IconButton>

            <IconButton onClick={() => setOpenInfo(true)} sx={{ color: 'var(--text-primary)' }}>
              <InfoIcon />
            </IconButton>

            <IconButton onClick={(e) => setHeaderMenuAnchor(e.currentTarget)} sx={{ color: 'var(--text-primary)' }}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        )}

        {/* Find in Group Chat Search Bar */}
        {searchOpen && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: 'background.paper', borderBottom: '1px solid var(--divider)', zIndex: 10 }}>
            <TextField
              size="small"
              placeholder="Search in group chat..."
              value={searchQuery}
              onChange={(e) => handleFindSearch(e.target.value)}
              sx={{ flexGrow: 1 }}
              autoFocus
            />
            {searchMatches.length > 0 && (
              <Typography variant="caption" sx={{ minWidth: '60px', textAlign: 'center', fontWeight: 600 }}>
                {searchMatchIndex + 1} of {searchMatches.length}
              </Typography>
            )}
            <IconButton size="small" onClick={handlePrevSearchMatch} disabled={searchMatches.length === 0}>
              <ArrowUpwardIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleNextSearchMatch} disabled={searchMatches.length === 0}>
              <ArrowDownwardIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchMatches([]); }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {displayedMessages.filter(m => m.pinned && !m.deleted).length > 0 && (
          <Box sx={{ 
            bgcolor: 'background.paper', 
            borderBottom: '1px solid var(--divider)', 
            p: 1, 
            px: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            zIndex: 10
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              📌 Pinned Messages ({displayedMessages.filter(m => m.pinned && !m.deleted).length})
            </Typography>
            <Button 
              size="small" 
              onClick={() => setOpenPinnedDialog(true)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              View Pinned
            </Button>
          </Box>
        )}

        {/* Message Feed */}
        <Box 
          className="chat-messages"
          ref={scrollContainerRef}
          onScroll={handleScroll}
          sx={{ position: 'relative', px: 3, py: 2 }}
        >
          {(() => {
            let renderedUnseenBar = false;
            let prevDateStr = null;
            const lastSeenIndex = sessionLastSeenId
              ? displayedMessages.findIndex(m => String(m.id) === String(sessionLastSeenId))
              : -1;

            return displayedMessages.map((msg, msgIdx) => {
              const d = parseSafeDate(msg.timestamp);
              const dateStr = d ? d.toDateString() : '';
              const showDateDivider = dateStr && dateStr !== prevDateStr;
              prevDateStr = dateStr;

              const isSystem = Number(msg.senderId) === 0 || msg.senderName === 'System';
              if (isSystem) {
                return (
                  <React.Fragment key={msg.id}>
                    {showDateDivider && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', my: 2 }}>
                        <Box sx={{ bgcolor: 'action.hover', color: 'text.secondary', px: 2, py: 0.5, borderRadius: 3, fontSize: '0.75rem', fontWeight: 600 }}>
                          {formatDateDivider(msg.timestamp)}
                        </Box>
                      </Box>
                    )}
                    <Box
                      id={`msg-${msg.id}`}
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%',
                        my: 1.5
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: 'action.hover',
                          color: 'text.secondary',
                          px: 2,
                          py: 0.5,
                          borderRadius: 4,
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          border: '1px solid',
                          borderColor: 'divider',
                          textAlign: 'center',
                          maxWidth: '80%'
                        }}
                      >
                        {msg.text}
                      </Box>
                    </Box>
                  </React.Fragment>
                );
              }

              const isMe = Number(msg.senderId) === Number(user.id);
              const senderInitials = msg.senderName.charAt(0).toUpperCase();

              const isAfterLastSeen = lastSeenIndex !== -1
                ? msgIdx > lastSeenIndex
                : sessionLastSeen
                  ? parseSafeTime(msg.timestamp) > parseSafeTime(sessionLastSeen)
                  : false;

              const isUnseen = !isMe && isAfterLastSeen && initialMessageIds.current.has(String(msg.id));
              const showUnseenBar = (isUnseen || String(msg.id) === String(firstUnseenMsgId.current)) && !renderedUnseenBar;
              if (showUnseenBar) {
                renderedUnseenBar = true;
              }

              return (
                <React.Fragment key={msg.id}>
                  {showDateDivider && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', my: 2 }}>
                      <Box sx={{ bgcolor: 'action.hover', color: 'text.secondary', px: 2, py: 0.5, borderRadius: 3, fontSize: '0.75rem', fontWeight: 600 }}>
                        {formatDateDivider(msg.timestamp)}
                      </Box>
                    </Box>
                  )}
                  {showUnseenBar && (
                    <Box 
                      className="unseen-messages-bar" 
                      sx={{ 
                        width: '100%', 
                        py: 1, 
                        my: 2, 
                        bgcolor: 'color-mix(in srgb, var(--primary-main) 8%, transparent)', 
                        borderTop: '1px solid color-mix(in srgb, var(--primary-main) 15%, transparent)', 
                        borderBottom: '1px solid color-mix(in srgb, var(--primary-main) 15%, transparent)', 
                        color: 'var(--primary-main)',
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        letterSpacing: '0.05em',
                        borderRadius: 1,
                        backdropFilter: 'blur(4px)'}}
                    >
                      Unseen Messages
                    </Box>
                  )}
                  <Box 
                    id={`msg-${msg.id}`}
                    className={`message-bubble-wrapper ${isMe ? 'is-me' : 'is-other'}`}
                    sx={{ mb: 2, display: 'flex', alignItems: 'flex-end', gap: 1 }}
                  >
                    {selectionMode && (
                      <Checkbox
                        checked={selectedMessageIds.has(msg.id)}
                        onChange={() => toggleSelectMessage(msg.id)}
                        sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }}
                      />
                    )}
                    {!isMe && (
                      <Avatar 
                        src={msg.senderAvatar} 
                        sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'primary.main', cursor: msg.senderAvatar ? 'pointer' : 'default' }}
                        onClick={() => {
                          if (msg.senderAvatar) {
                            setLightboxUrl(msg.senderAvatar);
                            setLightboxName(msg.senderName);
                            setLightboxOpen(true);
                          }
                        }}
                      >
                        {!msg.senderAvatar && senderInitials}
                      </Avatar>
                    )}
<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                      {!isMe && (
                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)', mb: 0.25, ml: 1, fontSize: '0.75rem' }}>
                          {msg.senderName}
                        </Typography>
                      )}
                      <Paper 
                        id={`msg-${msg.id}`}
                        onClick={(e) => {
                          if (selectionMode) {
                            toggleSelectMessage(msg.id);
                          } else {
                            handleMessageBubbleClick(e, msg);
                          }
                        }}
                        className={`message-bubble ${isMe ? 'me' : 'other'} ${highlightedMessageId === msg.id ? 'pulse-highlight' : ''}`} 
                        sx={{ 
                          mt: 0, 
                          maxWidth: '100% !important', 
                          width: 'fit-content', 
                          wordBreak: 'break-word',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.5s ease',
                          border: highlightedMessageId === msg.id ? '1.5px solid #FFD54F' : 'none',
                          
                          backgroundColor: highlightedMessageId === msg.id 
                            ? '#FFF9C4 !important' 
                            : undefined
                        }}
                      >
                        {msg.forwarded && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 0.5, 
                              fontStyle: 'italic', 
                              opacity: 0.7, 
                              fontSize: '0.68rem', 
                              mb: 0.5,
                              color: isMe ? 'rgba(255,255,255,0.8)' : 'text.secondary'
                            }}
                          >
                            <ForwardIcon sx={{ fontSize: 12 }} /> Forwarded
                          </Typography>
                        )}

                        {msg.replyToId && (
                          <Box 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleScrollToMessage(msg.replyToId);
                            }}
                            sx={{ 
                              bgcolor: isMe ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.05)', 
                              borderLeft: `3px solid ${isMe ? '#fff' : 'var(--primary-color)'}`, 
                              p: 0.75, 
                              mb: 0.75, 
                              borderRadius: 1, 
                              cursor: 'pointer',
                              opacity: 0.9,
                              '&:hover': { opacity: 1 }
                            }}
                          >
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontWeight: 700, 
                                color: isMe ? '#fff' : 'primary.main', 
                                display: 'block',
                                fontSize: '0.7rem'
                              }}
                            >
                              Replying to {msg.replyToUsername || 'User'}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: isMe ? 'rgba(255,255,255,0.9)' : 'text.secondary', 
                                display: 'block', 
                                maxWidth: '240px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {msg.replyToMessage}
                            </Typography>
                          </Box>
                        )}

                        {msg.deleted ? (
                          <Typography variant="body1" sx={{ fontStyle: 'italic', color: isMe ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>
                            This message was deleted
                          </Typography>
                        ) : msg.pollQuestion ? (() => {
                          let opts = [];
                          try {
                            opts = typeof msg.pollOptions === 'string' ? JSON.parse(msg.pollOptions) : msg.pollOptions;
                          } catch {
                            opts = msg.pollOptions || [];
                          }

                          let votes = {};
                          try {
                            votes = typeof msg.pollVotes === 'string' ? JSON.parse(msg.pollVotes) : msg.pollVotes || {};
                          } catch {
                            votes = {};
                          }

                          const totalVotes = Object.keys(votes || {}).length;
                          const userVoteVal = votes[user?.id] !== undefined ? votes[user?.id] : votes[String(user?.id)];
                          const hasVoted = userVoteVal !== undefined;

                          const handleVote = async (optionIndex) => {
                            await socialStore.voteGroupPoll(msg.id, optionIndex);
                            loadGroupDetails();
                          };

                          return (
                            <Box sx={{ minWidth: 200, mt: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, color: isMe ? '#fff' : 'text.primary' }}>
                                📊 {msg.pollQuestion}
                              </Typography>
                              <Stack spacing={1}>
                                {opts.map((opt, oIdx) => {
                                  const optVotes = Object.values(votes || {}).filter(v => Number(v) === oIdx).length;
                                  const pct = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
                                  const isUserChoice = hasVoted && Number(userVoteVal) === oIdx;
                                  return (
                                    <Box
                                      key={oIdx}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (!hasVoted) handleVote(oIdx);
                                      }}
                                      sx={{
                                        position: 'relative',
                                        p: 1.25,
                                        borderRadius: 2,
                                        border: '1.5px solid',
                                        borderColor: isUserChoice 
                                          ? (isMe ? '#fff' : 'primary.main') 
                                          : 'divider',
                                        cursor: hasVoted ? 'default' : 'pointer',
                                        overflow: 'hidden',
                                        '&:hover': {
                                          bgcolor: hasVoted ? 'transparent' : 'action.hover'
                                        }
                                      }}
                                    >
                                      {/* Progress bar fill */}
                                      <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        bottom: 0,
                                        width: `${pct}%`,
                                        bgcolor: isMe ? 'rgba(255,255,255,0.15)' : 'rgba(61,92,255,0.08)',
                                        zIndex: 0,
                                        transition: 'width 0.3s ease'
                                      }} />
                                      
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: isMe ? '#fff' : 'text.primary' }}>
                                          {opt}
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: isMe ? 'rgba(255,255,255,0.9)' : 'text.secondary' }}>
                                          {optVotes} ({pct}%)
                                        </Typography>
                                      </Box>
                                    </Box>
                                  );
                                })}
                              </Stack>
                              <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.8, color: isMe ? 'rgba(255,255,255,0.9)' : 'text.secondary' }}>
                                Total votes: {totalVotes}
                              </Typography>
                            </Box>
                          );
                        })() : msg.text?.startsWith('[IMAGE]:') ? (() => {
                          const parts = msg.text.substring(8).split('|');
                          const imageUrl = parts[0];
                          const caption = parts[1] || '';
                          return (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <img 
                                src={imageUrl} 
                                alt="group attachment"
                                style={{ maxWidth: '240px', maxHeight: '240px', borderRadius: 8, cursor: 'pointer', objectFit: 'cover' }} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLightboxUrl(imageUrl);
                                  setLightboxName(Number(msg.senderId) === Number(user?.id) ? 'You' : msg.senderName);
                                  setLightboxIsProfile(false);
                                  setLightboxOpen(true);
                                }}
                              />
                              {caption && (
                                <Typography variant="body1" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                  {caption}
                                </Typography>
                              )}
                            </Box>
                          );
                        })() : (
                          <Typography variant="body1" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                            {searchOpen && searchQuery.trim() ? (() => {
                              const q = searchQuery.trim();
                              const parts = msg.text.split(new RegExp(`(${q.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi'));
                              return parts.map((part, i) => 
                                part.toLowerCase() === q.toLowerCase() 
                                  ? <mark key={i} style={{ backgroundColor: '#FFF59D', color: '#000000', padding: '2px 4px', borderRadius: '2px' }}>{part}</mark> 
                                  : part
                              );
                            })() : msg.text}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 0.5, gap: 0.5 }}>
                          {msg.pinned && (
                            <PushPinIcon sx={{ fontSize: 11, color: isMe ? 'rgba(255,255,255,0.7)' : 'text.secondary', transform: 'rotate(45deg)' }} />
                          )}
                          <Typography variant="caption" className="message-time">
                            {msg.edited && <span style={{ marginRight: 4, fontStyle: 'italic', opacity: 0.8 }}>(edited)</span>}
                            {formatLogTime(msg.timestamp)}
                          </Typography>
                        </Box>
                      </Paper>
                    </Box>
                  </Box>
                </React.Fragment>
              );
            });
          })()}
          <div ref={messagesEndRef} />
        </Box>

        {showScrollBottomBtn && (
          <Box sx={{ position: 'absolute', bottom: 85, right: 24, zIndex: 10 }}>
            <IconButton
              onClick={handleScrollBottomClick}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  transform: 'scale(1.15)'},
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'}}
            >
              <KeyboardArrowDownIcon />
            </IconButton>
            {newMessagesCount > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  bgcolor: '#2e7d32',
                  color: 'white',
                  borderRadius: '50%',
                  minWidth: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  px: 0.5,
                  
                  border: '1.5px solid white'
                }}
              >
                {newMessagesCount}
              </Box>
            )}
          </Box>
        )}

        <Divider />

        <input 
          type="file" 
          multiple
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*" 
          onChange={handleImageSelect} 
        />

        {selectedImage && (
          <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'action.hover', borderTop: '1px solid divider' }}>
            <img src={selectedImage} alt="preview" style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="caption" color="text.secondary">Selected Image</Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={() => {
                setEditorImageSrc(selectedImage);
                setEditorOpen(true);
              }}
              sx={{ mr: 0.5 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => setSelectedImage(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {replyingMessage && (
          <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'action.hover', borderTop: '1px solid var(--divider)', borderBottom: '1px solid var(--divider)' }}>
            <Box sx={{ borderLeft: '3px solid var(--primary-color)', pl: 1, flexGrow: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', display: 'block' }}>
                Replying to {replyingMessage.senderId === user.id ? 'You' : replyingMessage.senderName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: '300px' }}>
                {replyingMessage.text.startsWith('[IMAGE]:') ? '📷 Photo' : replyingMessage.text}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setReplyingMessage(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {editingMessage && (
          <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'action.hover', borderTop: '1px solid var(--divider)', borderBottom: '1px solid var(--divider)' }}>
            <Box sx={{ borderLeft: '3px solid #f59e0b', pl: 1, flexGrow: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#f59e0b', display: 'block' }}>
                Editing Message
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: '300px' }}>
                {editingMessage.text}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => { setEditingMessage(null); setInputText(''); if (user?.id && groupId) { localStorage.removeItem(`sophiapath_draft_group_${user.id}_${groupId}`); } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {showMentionsList && group && (
          <Paper sx={{ maxHeight: 200, overflowY: 'auto', borderTop: '1px solid var(--divider)', borderBottom: '1px solid var(--divider)', zIndex: 10 }}>
            <List size="small" sx={{ p: 0 }}>
              {group.members
                .filter(m => {
                  const nameStr = (m.fullname || m.name || m.username || '').toLowerCase();
                  return nameStr.includes(mentionSearchQuery.toLowerCase());
                })
                .map(member => (
                  <ListItemButton
                    key={member.id}
                    onClick={() => {
                      const lastIndex = inputText.lastIndexOf('@');
                      const newText = inputText.substring(0, lastIndex) + `@${member.username} `;
                      setInputText(newText);
                      setShowMentionsList(false);
                    }}
                    sx={{ py: 1 }}
                  >
                    <ListItemAvatar>
                      <Avatar src={localStorage.getItem(`avatar_${member.id}`) || member.avatar || ''} sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                        {(member.fullname || member.name || member.username || 'U').charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={`@${member.username}`} secondary={member.fullname || member.name} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} secondaryTypographyProps={{ variant: 'caption' }} />
                  </ListItemButton>
                ))}
            </List>
          </Paper>
        )}

        {groupTypingUsers.length > 0 && (
          <Box sx={{ px: 2.5, py: 0.75, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'background.paper', borderTop: '1px solid var(--divider)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {groupTypingUsers.map((u, index) => (
                <Avatar 
                  key={u.userId} 
                  src={localStorage.getItem(`avatar_${u.userId}`) || u.avatar || ''} 
                  sx={{ 
                    width: 24, 
                    height: 24, 
                    fontSize: '0.65rem', 
                    border: '1.5px solid white', 
                    marginLeft: index > 0 ? -1 : 0,
                    zIndex: groupTypingUsers.length - index 
                  }}
                >
                  {u.username.charAt(0).toUpperCase()}
                </Avatar>
              ))}
            </Box>
            <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              {groupTypingUsers.map(u => u.username).join(', ')} {groupTypingUsers.length === 1 ? 'is' : 'are'} typing
            </Typography>
            <Box className="typing-dots" sx={{ display: 'flex', gap: 0.35 }}>
              <span className="dot" style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'var(--text-secondary)', display: 'inline-block' }}></span>
              <span className="dot" style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'var(--text-secondary)', display: 'inline-block' }}></span>
              <span className="dot" style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'var(--text-secondary)', display: 'inline-block' }}></span>
            </Box>
          </Box>
        )}

        {!canSendMessage ? (
          <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'action.disabledBackground', borderTop: '1px solid divider' }}>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              Only admins can send messages to this group.
            </Typography>
          </Box>
        ) : (
          <Box className="chat-input-area">
            <TextField
              fullWidth
              placeholder={selectedImage ? "Add a caption..." : "Message group..."}
              value={inputText}
              onChange={handleInputChange}
              variant="outlined"
              multiline
              maxRows={4}
              className="chat-input-field"
              InputProps={{
                sx: { borderRadius: 4, pl: 1 },
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton 
                      size="small" 
                      onClick={(e) => setEmojiAnchor(e.currentTarget)}
                      sx={{ color: 'var(--text-secondary)' }}
                    >
                      <EmojiIcon fontSize="small" />
                    </IconButton>

                    <IconButton 
                      size="small" 
                      onClick={() => fileInputRef.current.click()}
                      sx={{ color: 'var(--text-secondary)' }}
                    >
                      <AttachFileIcon fontSize="small" />
                    </IconButton>

                    <IconButton 
                      size="small" 
                      onClick={() => setOpenGroupPollCreator(true)}
                      sx={{ color: 'var(--text-secondary)' }}
                    >
                      <PollIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <IconButton 
              onClick={handleSendMessage}
              className="chat-send-btn animate-fade-in"
              disabled={!inputText.trim() && !selectedImage}
            >
              <SendIcon />
            </IconButton>
          </Box>
        )}

        <Popover
          open={Boolean(emojiAnchor)}
          anchorEl={emojiAnchor}
          onClose={() => setEmojiAnchor(null)}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left'}}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left'}}
          PaperProps={{ sx: { p: 1.5, borderRadius: 3,  maxWidth: 280 } }}
        >
          {frequentlyUsedEmojis.length > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', px: 0.5, display: 'block', mb: 0.5 }}>
                Frequently Used
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0.5 }}>
                {frequentlyUsedEmojis.map(emoji => (
                  <IconButton 
                    key={`freq-${emoji}`} 
                    size="small" 
                    onClick={() => handleEmojiClick(emoji)}
                    sx={{ fontSize: '1.25rem' }}
                  >
                    {emoji}
                  </IconButton>
                ))}
              </Box>
              <Divider sx={{ my: 1 }} />
            </Box>
          )}
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', px: 0.5, display: 'block', mb: 0.5 }}>
            All Emojis
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0.5, p: 0.5 }}>
            {['😀', '😂', '😍', '😎', '😭', '😡', '👍', '👎', '❤️', '🎉', '🔥', '🚀', '🤔', '👏', '🌟', '🙏', '💯', '✨'].map(emoji => (
              <IconButton 
                key={emoji} 
                size="small" 
                onClick={() => handleEmojiClick(emoji)}
                sx={{ fontSize: '1.25rem' }}
              >
                {emoji}
              </IconButton>
            ))}
          </Box>
        </Popover>


      </Paper>

      {/* GROUP INFO DIALOG */}
      <Dialog 
        open={openInfo} 
        onClose={() => setOpenInfo(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, position: 'relative' }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 7 }}>
          <IconButton
            onClick={() => setOpenInfo(false)}
            sx={{ position: 'absolute', right: 16, top: 16, color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
          <span>Group Information</span>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {canEditGroupDetails && !isEditingGroup && (
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => setIsEditingGroup(true)}
                sx={{ textTransform: 'none', borderRadius: 3 }}
              >
                Edit
              </Button>
            )}
            {canAddMembers && (
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<AddPersonIcon />}
                onClick={() => setOpenAddMembers(true)}
                sx={{ textTransform: 'none', borderRadius: 3 }}
              >
                Add
              </Button>
            )}
          </Box>
        </DialogTitle>
        {isEditingGroup ? (
          <>
            <DialogContent dividers>
              <Stack spacing={2} sx={{ py: 1 }}>
                {/* Custom Avatar Upload Zone (matching ProfilePage) */}
                <Box className="avatar-upload-section" sx={{ mb: 3 }}>
                  <input
                    type="file"
                    ref={groupAvatarInputRef}
                    onChange={handleAvatarFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  
                  <Box 
                    className={`avatar-dropzone ${isDraggingAvatar ? 'dragging' : ''}`}
                    onDragOver={handleAvatarDragOver}
                    onDragLeave={handleAvatarDragLeave}
                    onDrop={handleAvatarDrop}
                    onClick={triggerAvatarFileInput}
                  >
                    <Avatar
                      src={editGroupAvatar}
                      className="avatar-preview"
                      sx={{
                        width: '100%',
                        height: '100%',
                        fontSize: '2rem',
                        bgcolor: 'primary.light'
                      }}
                    >
                      {editGroupName ? editGroupName.charAt(0).toUpperCase() : 'G'}
                    </Avatar>
                    <Box className="avatar-hover-overlay">
                      <CameraIcon sx={{ fontSize: 32 }} />
                    </Box>
                  </Box>

                  {avatarError && (
                    <Alert severity="warning" className="avatar-error-alert" sx={{ mt: 1, py: 0, px: 2, borderRadius: 2 }}>
                      {avatarError}
                    </Alert>
                  )}
                </Box>

                <TextField
                  label="Group Name"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  fullWidth
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: 3 } }}
                />
                
                <TextField
                  label="Group Description"
                  value={editGroupDescription}
                  onChange={(e) => setEditGroupDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: 3 } }}
                />

                {isAdmin && (
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={editOnlyAdminsCanEdit}
                          onChange={(e) => setEditOnlyAdminsCanEdit(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Only admins can modify group details"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={editOnlyAdminsCanSendMessages}
                          onChange={(e) => setEditOnlyAdminsCanSendMessages(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Only admins can send messages"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={editOnlyAdminsCanAddMembers}
                          onChange={(e) => setEditOnlyAdminsCanAddMembers(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Only admins can add members"
                    />
                  </Stack>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button 
                onClick={() => setIsEditingGroup(false)} 
                variant="outlined"
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveGroupDetails} 
                variant="contained" 
                disabled={!editGroupName.trim()}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Save
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', pb: 3 }}>
              <Tabs value={profileTab} onChange={(e, val) => setProfileTab(val)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="Info" sx={{ textTransform: 'none', fontWeight: 600 }} />
                <Tab label="Media" sx={{ textTransform: 'none', fontWeight: 600 }} />
                <Tab label="Invite" sx={{ textTransform: 'none', fontWeight: 600 }} />
              </Tabs>

              {profileTab === 0 ? (
                <Stack spacing={2} sx={{ py: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <Avatar 
                      src={group.avatar} 
                      sx={{ width: 72, height: 72, fontSize: '2rem', bgcolor: 'primary.light', borderRadius: 4, cursor: group.avatar ? 'pointer' : 'default' }}
                      onClick={() => {
                        if (group.avatar) {
                          setLightboxUrl(group.avatar);
                          setLightboxName(group.name);
                          setLightboxIsProfile(true);
                          setLightboxOpen(true);
                        }
                      }}
                    >
                      {initials}
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{group.name}</Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      {group.description || "No description provided."}
                    </Typography>
                  </Box>

                  <Divider />

                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Group Members ({group.members.length})
                  </Typography>

                  <List sx={{ maxHeight: 250, overflowY: 'auto' }}>
                    {sortedMembers.map((member) => {
                      const memberId = Number(member.id);
                      const isUserMe = memberId === Number(user.id);
                      const memberAvatar = localStorage.getItem(`avatar_${memberId}`) || member.avatar || '';
                      const memberName = member.fullname || member.name || member.username || `User #${memberId}`;
                      const isTargetAdmin = group.adminIds?.includes(String(memberId));
                      const roleLabel = isTargetAdmin ? "Admin" : "Member";
                      
                      return (
                        <ListItem 
                          key={memberId} 
                          sx={{ px: 0, py: 0.5 }}
                          secondaryAction={
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleOpenMemberMenu(e, member)}
                              sx={{ color: 'var(--text-secondary)' }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar 
                              src={memberAvatar} 
                              sx={{ width: 32, height: 32, fontSize: '0.85rem', cursor: memberAvatar ? 'pointer' : 'default' }}
                              onClick={() => {
                                if (memberAvatar) {
                                  setLightboxUrl(memberAvatar);
                                  setLightboxName(memberName);
                                  setLightboxIsProfile(true);
                                  setLightboxOpen(true);
                                }
                              }}
                            >
                              {!memberAvatar && memberName.charAt(0).toUpperCase()}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={isUserMe ? `${memberName} (You)` : memberName} 
                            secondary={roleLabel}
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                  
                  <Divider />

                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={handleLeaveGroupValidation}
                    sx={{ mt: 2, borderRadius: 3, textTransform: 'none' }}
                  >
                    Leave Group
                  </Button>
                </Stack>
              ) : profileTab === 1 ? (
                <Box sx={{ width: '100%', py: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Media</Typography>
                  {(() => {
                    const imageMsgs = displayedMessages.filter(m => !m.deleted && m.text && m.text.startsWith('[IMAGE]:'));
                    if (imageMsgs.length === 0) {
                      return <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>No shared media</Typography>;
                    }
                    return (
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 3 }}>
                        {imageMsgs.map(m => {
                          const url = m.text.substring(8).split('|')[0];
                          return (
                            <Box key={m.id} sx={{ aspectRatio: '1/1', overflow: 'hidden', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                              <img 
                                src={url} 
                                alt="shared" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                                onClick={() => {
                                  setLightboxUrl(url);
                                  setLightboxName(Number(m.senderId) === Number(user?.id) ? 'You' : m.senderName);
                                  setLightboxIsProfile(false);
                                  setLightboxOpen(true);
                                }}
                              />
                            </Box>
                          );
                        })}
                      </Box>
                    );
                  })()}

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Links</Typography>
                  {(() => {
                    const urlRegex = /(https?:\/\/[^\s]+)/gi;
                    const linkMsgs = displayedMessages.filter(m => !m.deleted && m.text && urlRegex.test(m.text));
                    if (linkMsgs.length === 0) {
                      return <Typography variant="body2" color="text.secondary">No shared links</Typography>;
                    }
                    return (
                      <Stack spacing={1}>
                        {linkMsgs.map(m => {
                          const matches = m.text.match(urlRegex);
                          return matches.map((url, idx) => (
                            <Box key={`${m.id}-${idx}`} sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, border: '1px solid', borderColor: 'divider', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', fontSize: '0.85rem', textDecoration: 'none', wordBreak: 'break-all' }}>
                                {url}
                              </a>
                            </Box>
                          ));
                        })}
                      </Stack>
                    );
                  })()}
                </Box>
              ) : (
                <Box sx={{ width: '100%', py: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, alignSelf: 'flex-start' }}>Group Invite Link</Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Share this link to invite others to join your group path.
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1, p: 1, bgcolor: 'action.hover', border: '1px dashed', borderColor: 'primary.main', borderRadius: 2 }}>
                    <LinkIcon color="primary" />
                    <Typography variant="caption" sx={{ flexGrow: 1, wordBreak: 'break-all', fontWeight: 600 }}>
                      {`${window.location.origin}/group/join/${group.inviteToken || 'no-token'}`}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/group/join/${group.inviteToken || ''}`);
                      setSnackbarMessage("Invite link copied to clipboard!");
                      setOpenSnackbar(true);
                    }}
                    sx={{ textTransform: 'none', borderRadius: 3 }}
                  >
                    Copy Link
                  </Button>
                </Box>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* ADD MEMBERS DIALOG */}
      <Dialog 
        open={openAddMembers} 
        onClose={() => setOpenAddMembers(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, position: 'relative' }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pr: 7 }}>
          <IconButton
            onClick={() => setOpenAddMembers(false)}
            sx={{ position: 'absolute', right: 16, top: 16, color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
          Add Members
        </DialogTitle>
        <DialogContent dividers>
          {allUsers.length > 0 ? (
            <FormGroup sx={{ maxHeight: 250, overflowY: 'auto' }}>
              {allUsers.map((learner) => {
                const isBlockedByLearner = learner.blockedUserIds?.includes(String(user.id));
                return (
                  <FormControlLabel
                    key={learner.id}
                    control={
                      <Checkbox 
                        checked={selectedNewMembers.includes(learner.id)} 
                        disabled={isBlockedByLearner}
                        onChange={() => {
                          if (isBlockedByLearner) return;
                          setSelectedNewMembers(prev => 
                            prev.includes(learner.id) 
                              ? prev.filter(id => id !== learner.id) 
                              : [...prev, learner.id]
                          );
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: isBlockedByLearner ? 0.5 : 1 }}>
                        <Avatar 
                          src={localStorage.getItem(`avatar_${learner.id}`) || learner.avatar} 
                          sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                        >
                          {(learner.fullname || learner.name || learner.username).charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2">
                          {learner.fullname || learner.name || learner.username} {isBlockedByLearner && " (Unavailable)"}
                        </Typography>
                      </Box>
                    }
                    sx={{ py: 0.5 }}
                  />
                );
              })}
            </FormGroup>
          ) : (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
              All available learners are already members of this group.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleAddMembersSubmit} 
            variant="contained" 
            disabled={selectedNewMembers.length === 0}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Add Selected
          </Button>
        </DialogActions>
      </Dialog>

      {/* MEMBER ACTIONS CONTEXT MENU */}
      <Menu
        anchorEl={memberMenuAnchor}
        open={Boolean(memberMenuAnchor)}
        onClose={handleCloseMemberMenu}
        PaperProps={{ sx: { borderRadius: 1, minWidth: 160} }}
      >
        <MenuItem 
          onClick={handleToggleAdmin}
          disabled={
            !group || 
            !group.adminIds?.includes(String(user.id)) ||
            (menuTargetMember && Number(menuTargetMember.id) === Number(user.id))
          }
          sx={{ fontSize: '0.9rem' }}
        >
          {menuTargetMember && group.adminIds?.includes(String(menuTargetMember.id)) ? "Remove Admin" : "Make Admin"}
        </MenuItem>
        
        <MenuItem 
          onClick={handleRemoveMember}
          disabled={
            !group || 
            !group.adminIds?.includes(String(user.id)) ||
            (menuTargetMember && Number(menuTargetMember.id) === Number(user.id))
          }
          sx={{ fontSize: '0.9rem', color: 'error.main' }}
        >
          Remove Member
        </MenuItem>
        
        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={handleViewMemberInfo} sx={{ fontSize: '0.9rem' }}>
          View Info
        </MenuItem>
        
        <MenuItem onClick={handleViewMemberAvatar} sx={{ fontSize: '0.9rem' }}>
          View Profile Picture
        </MenuItem>
      </Menu>

      {/* MEMBER INFO DIALOG */}
      <Dialog 
        open={openMemberInfo} 
        onClose={() => setOpenMemberInfo(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, position: 'relative' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, textAlign: 'center', pt: 3, pr: 7 }}>
          <IconButton
            onClick={() => setOpenMemberInfo(false)}
            sx={{ position: 'absolute', right: 16, top: 16, color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
          Learner Profile
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 3 }}>
          <Avatar
            src={selectedMemberInfo ? (localStorage.getItem(`avatar_${selectedMemberInfo.id}`) || selectedMemberInfo.avatar || '') : ''}
            sx={{ 
              width: 90, 
              height: 90, 
              mb: 2, 
              bgcolor: 'primary.main', 
              fontSize: '2.2rem', 
              fontWeight: 'bold',
              cursor: selectedMemberInfo ? 'pointer' : 'default'
            }}
            onClick={() => {
              if (selectedMemberInfo) {
                const url = localStorage.getItem(`avatar_${selectedMemberInfo.id}`) || selectedMemberInfo.avatar || '';
                setLightboxUrl(url);
                setLightboxName(selectedMemberInfo.fullname || selectedMemberInfo.name || selectedMemberInfo.username || 'User');
                setLightboxIsProfile(true);
                setLightboxOpen(true);
              }
            }}
          >
            {selectedMemberInfo && !(localStorage.getItem(`avatar_${selectedMemberInfo.id}`) || selectedMemberInfo.avatar) && 
              (selectedMemberInfo.fullname || selectedMemberInfo.name || selectedMemberInfo.username || 'U').charAt(0).toUpperCase()
            }
          </Avatar>
          
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {selectedMemberInfo?.fullname || selectedMemberInfo?.name || selectedMemberInfo?.username || 'User'}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {selectedMemberInfo?.tag || 'Sophiapath Learner'}
          </Typography>

          <Divider sx={{ width: '100%', mb: 2.5 }} />

          <Stack spacing={2} sx={{ width: '100%', px: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FingerprintIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">Username</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  @{selectedMemberInfo?.username || 'learner'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <EmailIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">Email Address</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedMemberInfo?.email || 'N/A'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PersonIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">Gender / Age</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedMemberInfo?.gender || 'Rather Not Say'} • {selectedMemberInfo?.age || 20} years old
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CalendarIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">Joined</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedMemberInfo?.dateTime ? formatDate(selectedMemberInfo.dateTime) : 'Recently'}
                </Typography>
              </Box>
            </Box>
          </Stack>
          {selectedMemberInfo && user.id !== Number(selectedMemberInfo.id) && (
            <Button
              variant="outlined"
              color={user.blockedUserIds?.includes(String(selectedMemberInfo.id)) ? "primary" : "error"}
              onClick={async () => {
                const isBlocked = user.blockedUserIds?.includes(String(selectedMemberInfo.id));
                if (isBlocked) {
                  await unblockUser(selectedMemberInfo.id);
                } else {
                  await blockUser(selectedMemberInfo.id);
                }
                setOpenMemberInfo(false);
              }}
              sx={{ mt: 3, borderRadius: 3, textTransform: 'none', width: '90%' }}
            >
              {user.blockedUserIds?.includes(String(selectedMemberInfo.id)) ? "Unblock User" : "Block User"}
            </Button>
          )}
        </DialogContent>
      </Dialog>

      {/* PROFILE PICTURE LIGHTBOX */}
      <Dialog 
        open={lightboxOpen} 
        onClose={() => setLightboxOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          {lightboxName}
        </Typography>
        {lightboxUrl ? (
          <img 
            src={lightboxUrl} 
            alt={lightboxName} 
            style={{ width: '100%', maxHeight: '400px', borderRadius: '12px', objectFit: 'cover' }}
          />
        ) : (
          <Avatar sx={{ width: 200, height: 200, fontSize: '5rem', bgcolor: 'primary.main', fontWeight: 'bold', mb: 2 }}>
            {lightboxName.charAt(0).toUpperCase()}
          </Avatar>
        )}
        <Stack direction="row" spacing={2} sx={{ mt: 2.5, width: '100%', justifyContent: 'center' }}>
          <Button 
            onClick={() => setLightboxOpen(false)} 
            variant="outlined" 
            sx={{ px: 3, textTransform: 'none', borderRadius: 2 }}
          >
            Close
          </Button>
          {lightboxUrl && !lightboxIsProfile && (
            <Button
              onClick={() => {
                setEditorImageSrc(lightboxUrl);
                setEditorOpen(true);
                setLightboxOpen(false);
              }}
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              sx={{ px: 3, textTransform: 'none', borderRadius: 2 }}
            >
              Edit Image
            </Button>
          )}
        </Stack>
      </Dialog>

      <ImageEditorModal
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setPendingImagesQueue([]); }}
        images={pendingImagesQueue}
        imageSrc={editorImageSrc}
        onSend={(editedImages) => {
          editedImages.forEach(img => {
            sendBase64ImageMessage(img);
          });
          setEditorOpen(false);
          setPendingImagesQueue([]);
        }}
      />

      {/* Context Menu on Message Bubbles */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        PaperProps={{ sx: { borderRadius: 1 } }}
      >
        <MenuItem onClick={handleReplyClick}>
          <ReplyIcon sx={{ mr: 1, fontSize: 20 }} /> Reply
        </MenuItem>
        <MenuItem onClick={handleStarToggle}>
          <StarIcon sx={{ mr: 1, fontSize: 20, color: '#f59e0b' }} /> {
            JSON.parse(localStorage.getItem('starred_messages_list') || '[]').some(m => String(m.id) === String(menuMessage?.id)) 
              ? "Unstar Message" 
              : "Star Message"
          }
        </MenuItem>
        <MenuItem onClick={handleCopyMessage}>
          <CopyIcon sx={{ mr: 1, fontSize: 20 }} /> Copy
        </MenuItem>
        <MenuItem onClick={handlePinToggle}>
          <PushPinIcon sx={{ mr: 1, fontSize: 20, transform: 'rotate(45deg)' }} /> {menuMessage?.pinned ? "Unpin" : "Pin"}
        </MenuItem>
        <MenuItem onClick={handleForwardClick}>
          <ForwardIcon sx={{ mr: 1, fontSize: 20 }} /> Forward
        </MenuItem>
        {Number(menuMessage?.senderId) === Number(user?.id) && !menuMessage?.text?.startsWith('[IMAGE]:') && (
          <MenuItem onClick={() => { setEditingMessage(menuMessage); setInputText(menuMessage.text); handleCloseMenu(); }}>
            <EditIcon sx={{ mr: 1, fontSize: 20 }} /> Edit
          </MenuItem>
        )}
        <MenuItem onClick={() => { setSelectionMode(true); setSelectedMessageIds(new Set([menuMessage.id])); handleCloseMenu(); }}>
          <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} /> Select Messages
        </MenuItem>
        {Number(menuMessage?.senderId) === Number(user?.id) && (
          <MenuItem onClick={handleDeleteMessage} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1, fontSize: 20 }} /> Delete
          </MenuItem>
        )}
      </Menu>

      {/* Pinned Messages List Dialog */}
      <Dialog open={openPinnedDialog} onClose={() => setOpenPinnedDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2, position: 'relative' } }}>
        <DialogTitle sx={{ fontWeight: 'bold', pr: 7 }}>
          <IconButton
            onClick={() => setOpenPinnedDialog(false)}
            sx={{ position: 'absolute', right: 16, top: 16, color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
          Pinned Messages
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {messages.filter(m => m.pinned && !m.deleted).length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              No pinned messages
            </Box>
          ) : (
            <List>
              {messages.filter(m => m.pinned && !m.deleted).map(msg => {
                const isImg = msg.text.startsWith('[IMAGE]:');
                const cleanText = isImg ? '📷 Photo' : msg.text;
                const senderName = msg.senderId === user.id ? 'You' : msg.senderName;
                return (
                  <ListItemButton 
                    key={msg.id}
                    onClick={() => {
                      setOpenPinnedDialog(false);
                      handleScrollToMessage(msg.id);
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: msg.senderId === user.id ? 'primary.main' : 'secondary.main', width: 32, height: 32, fontSize: '0.85rem' }}>
                        {senderName.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={cleanText}
                      secondary={`${senderName} • ${formatLogTime(msg.timestamp)}`}
                      primaryTypographyProps={{ variant: 'body2', noWrap: true, sx: { fontWeight: 500 } }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Forward Message Dialog */}
      <Dialog open={openForwardDialog} onClose={() => setOpenForwardDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2, position: 'relative' } }}>
        <DialogTitle sx={{ fontWeight: 'bold', pr: 7 }}>
          <IconButton
            onClick={() => setOpenForwardDialog(false)}
            sx={{ position: 'absolute', right: 16, top: 16, color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
          Forward Message
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <List>
            {allUsers
              .filter(u => u.id !== user?.id && !user?.blockedUserIds?.includes(String(u.id)) && !u.blockedUserIds?.includes(String(user?.id)))
              .map(target => {
                const uAvatar = localStorage.getItem(`avatar_${target.id}`) || target.avatar || '';
                const uName = target.fullname || target.name || target.username || '?';
                return (
                  <ListItemButton 
                    key={target.id}
                    onClick={() => {
                      if (selectionMode) {
                        handleMultiForwardSubmit(target);
                      } else {
                        handleForwardMessage(target);
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={uAvatar} sx={{ width: 36, height: 36 }}>
                        {!uAvatar && uName.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={uName} 
                      secondary={`@${target.username}`}
                      primaryTypographyProps={{ variant: 'body2', sx: { fontWeight: 600 } }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItemButton>
                );
              })}
          </List>
        </DialogContent>
      </Dialog>

      {/* Snackbar alerts */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      {/* Group Poll Creator Dialog */}
      <Dialog
        open={openGroupPollCreator}
        onClose={() => setOpenGroupPollCreator(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          📊 Create Group Poll
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, maxHeight: 280, overflowY: 'auto' }}>
          <TextField
            label="Poll Question"
            placeholder="Ask a question..."
            fullWidth
            value={groupPollQuestion}
            onChange={(e) => setGroupPollQuestion(e.target.value)}
            InputProps={{ sx: { borderRadius: 1.5 } }}
            inputProps={{ maxLength: 100 }}
          />
          {groupPollOptions.map((opt, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                label={`Option ${index + 1}`}
                placeholder={`Enter option ${index + 1}`}
                fullWidth
                value={opt}
                onChange={(e) => {
                  const next = [...groupPollOptions];
                  next[index] = e.target.value;
                  setGroupPollOptions(next);
                }}
                InputProps={{ sx: { borderRadius: 1.5 } }}
                inputProps={{ maxLength: 50 }}
              />
              <IconButton 
                color="error" 
                onClick={() => setGroupPollOptions(groupPollOptions.filter((_, idx) => idx !== index))}
                sx={{ border: '1px solid var(--divider)', borderRadius: 1.5, width: 40, height: 40 }}
              >
                ✕
              </IconButton>
            </Box>
          ))}
          <Button
            size="small"
            onClick={() => setGroupPollOptions([...groupPollOptions, ''])}
            sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
          >
            + Add Option
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            disabled={!groupPollQuestion.trim() || groupPollOptions.filter(o => o.trim() !== '').length < 2}
            onClick={handleSendGroupPoll}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Send Poll
          </Button>
          <Button
            variant="outlined"
            onClick={() => setOpenGroupPollCreator(false)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Header More Options Menu */}
      <Menu
        anchorEl={headerMenuAnchor}
        open={Boolean(headerMenuAnchor)}
        onClose={() => setHeaderMenuAnchor(null)}
        PaperProps={{ sx: { borderRadius: 1.5} }}
      >
        <MenuItem onClick={() => {
          setHeaderMenuAnchor(null);
          setOpenClearConfirm(true);
        }} sx={{ fontSize: '0.85rem' }}>
          Clear Chat History
        </MenuItem>
        <MenuItem onClick={() => {
          setHeaderMenuAnchor(null);
          setOpenDeleteConfirm(true);
        }} sx={{ color: 'error.main', fontSize: '0.85rem' }}>
          {isCreator ? "Delete Group" : "Leave Group"}
        </MenuItem>
      </Menu>

      {/* Clear Chat Confirmation Dialog */}
      <Dialog
        open={openClearConfirm}
        onClose={() => setOpenClearConfirm(false)}
        PaperProps={{ sx: { borderRadius: 2.5, p: 1, maxWidth: 340 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Clear chat history?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            Are you sure you want to clear this group's chat history? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1.5 }}>
          <Button 
            variant="outlined" 
            onClick={() => setOpenClearConfirm(false)}
            fullWidth
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={() => {
              const lastMsg = messages[messages.length - 1];
              if (lastMsg) {
                localStorage.setItem(`sophiapath_clear_msg_id_${user.id}_${groupId}`, String(lastMsg.id));
                localStorage.setItem(`sophiapath_clear_time_${user.id}_${groupId}`, lastMsg.timestamp);
              } else {
                localStorage.setItem(`sophiapath_clear_time_${user.id}_${groupId}`, new Date(0).toISOString());
                localStorage.removeItem(`sophiapath_clear_msg_id_${user.id}_${groupId}`);
              }
              setClearTrigger(prev => prev + 1);
              setOpenClearConfirm(false);
            }}
            fullWidth
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Clear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Leave/Delete Group Confirmation Dialog */}
      <Dialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        PaperProps={{ sx: { borderRadius: 2.5, p: 1, maxWidth: 340 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          {isCreator ? "Delete Group?" : "Leave Group?"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            {isCreator 
              ? "Are you sure you want to delete this group for you? This will hide the group from your list."
              : "Are you sure you want to leave this group chat?"}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1.5 }}>
          <Button 
            variant="outlined" 
            onClick={() => setOpenDeleteConfirm(false)}
            fullWidth
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={async () => {
              if (isCreator) {
                // Delete for user locally
                const deletedObj = JSON.parse(localStorage.getItem(`sophiapath_deleted_groups_${user.id}`) || '{}');
                deletedObj[groupId] = new Date().toISOString();
                localStorage.setItem(`sophiapath_deleted_groups_${user.id}`, JSON.stringify(deletedObj));
              } else {
                // Leave group on the backend/locally
                await socialStore.removeGroupMember(groupId, user.id);
                // Also hide group
                const deletedObj = JSON.parse(localStorage.getItem(`sophiapath_deleted_groups_${user.id}`) || '{}');
                deletedObj[groupId] = new Date().toISOString();
                localStorage.setItem(`sophiapath_deleted_groups_${user.id}`, JSON.stringify(deletedObj));
              }
              // Remove starred messages for this group
              let starred = JSON.parse(localStorage.getItem('starred_messages_list') || '[]');
              starred = starred.filter(m => String(m.groupId) !== String(groupId));
              localStorage.setItem('starred_messages_list', JSON.stringify(starred));

              setOpenDeleteConfirm(false);
              navigate('/chats?tab=groups');
            }}
            fullWidth
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            {isCreator ? "Delete" : "Leave"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Leave Group Confirm Dialog */}
      <Dialog open={openLeaveConfirm} onClose={() => setOpenLeaveConfirm(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Leave Group?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to leave this group?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setOpenLeaveConfirm(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleNormalLeaveGroup} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Leave
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Admin Dialog */}
      <Dialog open={openAssignAdminDialog} onClose={() => setOpenAssignAdminDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Assign Admin Required</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You are the only admin in this group. Before leaving, you must assign another group member to be the admin.
          </Typography>
          {group && (
            <TextField
              select
              label="Select New Admin"
              fullWidth
              value={selectedAdminToAssign}
              onChange={(e) => setSelectedAdminToAssign(e.target.value)}
              SelectProps={{ native: true }}
              InputProps={{ sx: { borderRadius: 2 } }}
            >
              {group.members
                .filter(m => String(m.id) !== String(user?.id))
                .map(m => (
                  <option key={m.id} value={m.id}>
                    {m.fullname || m.name || m.username}
                  </option>
                ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setOpenAssignAdminDialog(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleAssignAdminAndLeave} disabled={!selectedAdminToAssign} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Assign & Leave
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroupChatPage;
