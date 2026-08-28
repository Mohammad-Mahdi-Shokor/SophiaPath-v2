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
  Popover,
  InputAdornment,
  Badge,
  Menu,
  MenuItem,
  Snackbar,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Checkbox,
  Tab,
  Tabs
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Fingerprint as FingerprintIcon,
  CalendarToday as CalendarIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  AttachFile as AttachFileIcon,
  InsertEmoticon as EmojiIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
  PushPin as PushPinIcon,
  Reply as ReplyIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  ForwardToInbox as ForwardIcon,
  Star as StarIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
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

const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, blockUser, unblockUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const [openProfile, setOpenProfile] = useState(false);
  const [targetUserDetails, setTargetUserDetails] = useState(null);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState('');
  const [lightboxName, setLightboxName] = useState('');
  const [lightboxIsProfile, setLightboxIsProfile] = useState(false);
  
  const hasInitialScrolled = useRef(false);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [emojiAnchor, setEmojiAnchor] = useState(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorImageSrc, setEditorImageSrc] = useState('');
  const [pendingImagesQueue, setPendingImagesQueue] = useState([]);

  // New Chat States
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [highlightMessageId, setHighlightMessageId] = useState(null);
  const [openPinnedDialog, setOpenPinnedDialog] = useState(false);
  
  // Context Menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuMessage, setMenuMessage] = useState(null);

  const [headerMenuAnchor, setHeaderMenuAnchor] = useState(null);
  const [openClearConfirm, setOpenClearConfirm] = useState(false);
  const [clearTrigger, setClearTrigger] = useState(0);

  // Advanced features states
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

  const initialMessageIds = useRef(new Set());

  const displayedMessages = useMemo(() => {
    const clearMsgId = localStorage.getItem(`sophiapath_clear_msg_id_${user?.id}_${userId}`);
    const clearTime = localStorage.getItem(`sophiapath_clear_time_${user?.id}_${userId}`);
    
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
  }, [messages, userId, user?.id, clearTrigger]);

  const [sessionLastSeenId, setSessionLastSeenId] = useState(null);
  const [sessionLastSeen, setSessionLastSeen] = useState(null);

  useEffect(() => {
    initialMessageIds.current = new Set();
  }, [userId]);

  useEffect(() => {
    if (!userId || !user?.id) return;
    const lastId = localStorage.getItem(`sophiapath_last_seen_id_${user.id}_${userId}`);
    const stored = localStorage.getItem(`sophiapath_last_seen_${user.id}_${userId}`);
    setSessionLastSeenId(lastId);
    setSessionLastSeen(stored || new Date().toISOString());
  }, [userId, user?.id]);

  useEffect(() => {
    if (userId && user?.id && displayedMessages.length > 0) {
      const lastMsg = displayedMessages[displayedMessages.length - 1];
      if (lastMsg) {
        localStorage.setItem(`sophiapath_last_seen_id_${user.id}_${userId}`, String(lastMsg.id));
        localStorage.setItem(`sophiapath_last_seen_${user.id}_${userId}`, new Date().toISOString());
      }
    }
  }, [userId, user?.id, displayedMessages]);
  
  // Dialog / Reply / Snackbar states
  const [openForwardDialog, setOpenForwardDialog] = useState(false);
  const [replyingMessage, setReplyingMessage] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  const sendBase64ImageMessage = async (editedBase64) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const finalMsg = `[IMAGE]:${editedBase64}`;
      const payload = {
        senderId: Number(user.id),
        recipientId: Number(userId),
        message: finalMsg,
        username: user.username || 'learner',
        avatar: user.avatar || ''
      };

      const res = await fetch('/api/chat/send-message', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const responseData = await res.json();
        const msg = responseData.message;
        const newMessage = {
          id: msg.id,
          senderId: msg.senderId,
          text: msg.message,
          timestamp: msg.timestamp,
          delivered: msg.delivered,
          read: msg.read,
          pinned: msg.pinned,
          deleted: msg.deleted,
          replyToId: msg.replyToId,
          replyToMessage: msg.replyToMessage,
          replyToUsername: msg.replyToUsername,
          forwarded: msg.forwarded
        };
        setMessages(prev => [...prev, newMessage]);
        
        // Unarchive check
        const archivedList = JSON.parse(localStorage.getItem(`sophiapath_archived_chats_${user.id}`) || '[]');
        if (archivedList.includes(Number(userId)) || archivedList.includes(String(userId))) {
          const updated = archivedList.filter(id => Number(id) !== Number(userId));
          localStorage.setItem(`sophiapath_archived_chats_${user.id}`, JSON.stringify(updated));
        }
      }
    } catch (err) {
      console.error('Failed to send image:', err);
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




  const targetUser = location.state?.targetUser || { id: userId, name: 'User' };
  const resolvedUser = targetUserDetails || targetUser;
  const resolvedAvatar = localStorage.getItem(`avatar_${userId}`) || resolvedUser.avatar || '';
  const displayName = resolvedUser.fullname || resolvedUser.name || resolvedUser.username || 'User';
  const initials = displayName.charAt(0).toUpperCase();

  // Load target user profile details from backend
  useEffect(() => {
    const fetchTargetDetails = async () => {
      try {
        const res = await fetch('/users');
        if (res.ok) {
          const usersList = await res.json();
          const nonAdmins = (usersList || []).filter(u => u.roleID !== 3);
          setAllUsers(nonAdmins);
          const found = nonAdmins.find(u => Number(u.id) === Number(userId));
          if (found) {
            setTargetUserDetails(found);
          }
        }
      } catch (err) {
        console.error('Failed to load target user details:', err);
      }
    };
    if (userId) {
      fetchTargetDetails();
    }
  }, [userId]);

  // Load messages from backend API
  useEffect(() => {
    const fetchChatMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const res = await fetch(`/api/chat/conversation/${user?.id}/${userId}`, { headers });
        if (res.ok) {
          const chatHistory = await res.json();
          // Map backend ChatMessage properties to frontend expectations
          const mapped = chatHistory.map(msg => ({
            id: msg.id,
            senderId: msg.senderId,
            text: msg.message,
            timestamp: msg.timestamp,
            delivered: msg.delivered,
            read: msg.read,
            pinned: msg.pinned,
            deleted: msg.deleted,
            replyToId: msg.replyToId,
            replyToMessage: msg.replyToMessage,
            replyToUsername: msg.replyToUsername,
            forwarded: msg.forwarded
          }));

          const deletedObj = JSON.parse(localStorage.getItem(`sophiapath_deleted_chats_${user.id}`) || '{}');
          const deleteTime = deletedObj[userId];
          const clearMsgId = localStorage.getItem(`sophiapath_clear_msg_id_${user.id}_${userId}`);
          const clearTime = localStorage.getItem(`sophiapath_clear_time_${user.id}_${userId}`);
          
          let filtered = mapped;
          if (deleteTime) {
            filtered = filtered.filter(msg => parseSafeTime(msg.timestamp) > parseSafeTime(deleteTime));
          }
          if (clearMsgId) {
            const clearIdx = filtered.findIndex(m => String(m.id) === String(clearMsgId));
            if (clearIdx !== -1) {
              filtered = filtered.slice(clearIdx + 1);
            } else if (clearTime) {
              filtered = filtered.filter(msg => parseSafeTime(msg.timestamp) > parseSafeTime(clearTime));
            }
          } else if (clearTime) {
            filtered = filtered.filter(msg => parseSafeTime(msg.timestamp) > parseSafeTime(clearTime));
          }

          setMessages(filtered);
        }

        // Fetch other user's typing status
        const typingRes = await fetch(`/api/chat/typing/${user?.id}/${userId}`, { headers });
        if (typingRes.ok) {
          const typingData = await typingRes.json();
          setIsOtherUserTyping(typingData.typing);
        }
      } catch (err) {
        console.error('Failed to load chat history or typing status:', err);
      }
    };

    if (user?.id && userId) {
      fetchChatMessages();
      
      // Setup a basic polling interval for real-time emulation since we are on REST
      const interval = setInterval(fetchChatMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [user?.id, userId]);

  // Load draft and reset state on user/chat swap
  useEffect(() => {
    if (user?.id && userId) {
      const draft = localStorage.getItem(`sophiapath_draft_chat_${user.id}_${userId}`) || '';
      setInputText(draft);
      prevMessagesLengthRef.current = 0;
      setNewMessagesCount(0);
      firstUnseenMsgId.current = null;
      hasInitialScrolled.current = false;
    }
  }, [userId, user?.id]);

  // Smart scrolling on message load
  useEffect(() => {
    if (displayedMessages.length > 0) {
      const prevLength = prevMessagesLengthRef.current;
      const newMsgs = displayedMessages.slice(prevLength);

      if (prevLength === 0) {
        // Initial load
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

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottomBtn(isScrolledUp);

    // Clear unseen counts if user scrolled back to bottom
    if (!isScrolledUp) {
      setNewMessagesCount(0);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setNewMessagesCount(0);
  };

  // Typing Emitters
  const typingTimeoutRef = useRef(null);
  const lastTypingStatusRef = useRef(false);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const sendTypingStatus = async (typing) => {
    if (!user?.id || !userId) return;
    if (lastTypingStatusRef.current === typing) return;
    lastTypingStatusRef.current = typing;

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      await fetch('/api/chat/typing', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: Number(user.id),
          recipientId: Number(userId),
          username: user.username || 'learner',
          typing
        })
      });
    } catch (err) {
      console.error('Failed to update typing status:', err);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);
    if (user?.id && userId) {
      localStorage.setItem(`sophiapath_draft_chat_${user.id}_${userId}`, val);
    }
    sendTypingStatus(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 3000);
  };

  // Scroll and highlight
  const handleScrollToMessage = (msgId) => {
    const element = document.getElementById(`msg-${msgId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightMessageId(msgId);
      setTimeout(() => {
        setHighlightMessageId(null);
      }, 2000);
    }
  };

  const handleScrollBottomClick = () => {
    if (newMessagesCount > 0 && firstUnseenMsgId.current) {
      handleScrollToMessage(firstUnseenMsgId.current);
      setNewMessagesCount(0);
    } else {
      scrollToBottom();
    }
  };

  const handleEmojiClick = (emoji) => {
    const newVal = inputText + emoji;
    setInputText(newVal);
    if (user?.id && userId) {
      localStorage.setItem(`sophiapath_draft_chat_${user.id}_${userId}`, newVal);
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
      handleScrollToMessage(matches[0]);
    }
  };

  const handleNextSearchMatch = () => {
    if (searchMatches.length === 0) return;
    const nextIdx = (searchMatchIndex + 1) % searchMatches.length;
    setSearchMatchIndex(nextIdx);
    handleScrollToMessage(searchMatches[nextIdx]);
  };

  const handlePrevSearchMatch = () => {
    if (searchMatches.length === 0) return;
    const prevIdx = (searchMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setSearchMatchIndex(prevIdx);
    handleScrollToMessage(searchMatches[prevIdx]);
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
      const res = await socialStore.deleteMessage(id, user.id);
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
            chatPartnerId: userId,
            type: 'direct',
            text: textToStore,
            senderName: Number(msg.senderId) === Number(user?.id) ? 'You' : (targetUserDetails?.fullname || targetUserDetails?.name || targetUserDetails?.username || 'user'),
            senderAvatar: Number(msg.senderId) === Number(user?.id) ? user.avatar : targetUserDetails?.avatar,
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

  // Multi forward functionality integrated directly into handleForwardMessage

  // Auto scroll to message from query parameter on load
  const queryParams = new URLSearchParams(location.search);
  const searchMessageId = queryParams.get('messageId');

  useEffect(() => {
    if (displayedMessages.length > 0 && searchMessageId) {
      const timeout = setTimeout(() => {
        handleScrollToMessage(searchMessageId);
        navigate(location.pathname, { replace: true });
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [displayedMessages.length, searchMessageId]);

  // Context Menu Actions
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
      const success = await socialStore.pinMessage(menuMessage.id, newPinState);
      if (success) {
        setMessages(prev => prev.map(m => m.id === menuMessage.id ? { ...m, pinned: newPinState } : m));
        setSnackbarMessage(newPinState ? "Message pinned!" : "Message unpinned!");
        setOpenSnackbar(true);
      }
    }
    handleCloseMenu();
  };

  const handleDeleteMessage = async () => {
    if (menuMessage && Number(menuMessage.senderId) === Number(user?.id)) {
      const success = await socialStore.deleteMessage(menuMessage.id, user.id);
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
    const senderName = user.fullname || user.name || user.username || "You";

    if (selectionMode) {
      let count = 0;
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
      setSelectedMessageIds(new Set());
      setSelectionMode(false);
    } else {
      if (!menuMessage) return;
      const cleanText = menuMessage.text;

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
      setMenuMessage(null);
    }
    setOpenForwardDialog(false);
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
        chatPartnerId: userId,
        type: 'direct',
        text: textToStore,
        senderName: Number(menuMessage.senderId) === Number(user?.id) ? 'You' : (targetUserDetails?.fullname || targetUserDetails?.name || targetUserDetails?.username || 'user'),
        senderAvatar: Number(menuMessage.senderId) === Number(user?.id) ? user.avatar : targetUserDetails?.avatar,
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    if (editingMessage) {
      try {
        const updated = await socialStore.editDirectMessage(editingMessage.id, inputText.trim(), user.id);
        if (updated) {
          setMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, text: updated.message, edited: true } : m));
          setEditingMessage(null);
          setInputText('');
          if (user?.id && userId) {
            localStorage.removeItem(`sophiapath_draft_chat_${user.id}_${userId}`);
          }
          setSnackbarMessage("Message updated!");
          setOpenSnackbar(true);
        }
      } catch (err) {
        console.error('Failed to edit message:', err);
      }
      return;
    }

    try {
      let finalMsg = inputText;
      if (selectedImage) {
        finalMsg = `[IMAGE]:${selectedImage}${inputText ? `|${inputText}` : ''}`;
      }

      const responseData = await socialStore.sendDirectMessage(
        user.id,
        userId,
        finalMsg,
        user.username || 'learner',
        user.avatar || '',
        replyingMessage ? replyingMessage.id : null,
        replyingMessage ? (replyingMessage.text.startsWith('[IMAGE]:') ? '📷 Photo' : replyingMessage.text) : null,
        replyingMessage ? (replyingMessage.senderId === user.id ? 'You' : resolvedUser.username) : null,
        false
      );

      if (responseData && responseData.success) {
        const archivedList = JSON.parse(localStorage.getItem(`sophiapath_archived_chats_${user.id}`) || '[]');
        if (archivedList.includes(Number(userId)) || archivedList.includes(String(userId))) {
          const updated = archivedList.filter(id => Number(id) !== Number(userId));
          localStorage.setItem(`sophiapath_archived_chats_${user.id}`, JSON.stringify(updated));
        }

        const msg = responseData.message;
        
        const newMessage = {
          id: msg.id,
          senderId: msg.senderId,
          text: msg.message,
          timestamp: msg.timestamp,
          delivered: msg.delivered,
          read: msg.read,
          pinned: msg.pinned,
          deleted: msg.deleted,
          replyToId: msg.replyToId,
          replyToMessage: msg.replyToMessage,
          replyToUsername: msg.replyToUsername,
          forwarded: msg.forwarded
        };

        setMessages(prev => [...prev, newMessage]);
        setSessionLastSeenId(null);
        setSessionLastSeen(new Date().toISOString());
        setInputText('');
        if (user?.id && userId) {
          localStorage.removeItem(`sophiapath_draft_chat_${user.id}_${userId}`);
        }
        setSelectedImage(null);
        setReplyingMessage(null);
        firstUnseenMsgId.current = null;

        // Turn off typing immediately
        sendTypingStatus(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const isUserOnline = (otherUser) => {
    if (!otherUser || !otherUser.lastActiveTime) return false;
    const diffMs = Date.now() - parseSafeTime(otherUser.lastActiveTime);
    return diffMs < 12000;
  };

  const isBlockedByTarget = targetUserDetails?.blockedUserIds?.includes(String(user?.id));
  const isBlockedByMe = user?.blockedUserIds?.includes(String(userId));
  const isOnline = targetUserDetails && isUserOnline(targetUserDetails);
  const badgeColor = (isBlockedByTarget || isBlockedByMe) ? "default" : (isOnline ? "success" : "default");
  
  let statusText = isOnline ? "Online" : "Offline";
  if (isBlockedByMe) statusText = "Blocked";
  else if (isBlockedByTarget) statusText = "You were blocked";

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <Typography color="text.secondary">Loading chat context...</Typography>
      </Box>
    );
  }

  return (
    <Box className="chat-page-container">
      <Paper className="chat-window glass-panel-strong" sx={{ position: 'relative' }}>
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
            <IconButton onClick={() => navigate('/chats?tab=dms')} className="chat-back-btn">
              <ArrowBackIcon />
            </IconButton>
            
            <Box 
              sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
              onClick={() => setOpenProfile(true)}
            >
              <Badge 
                overlap="circular" 
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                color={badgeColor}
                className="status-badge"
              >
                <Avatar 
                  src={resolvedAvatar} 
                  className="chat-header-avatar"
                  sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold', cursor: resolvedAvatar ? 'pointer' : 'default' }}
                  onClick={(e) => {
                    if (resolvedAvatar) {
                      e.stopPropagation();
                      setLightboxUrl(resolvedAvatar);
                      setLightboxIsProfile(true);
                      setLightboxOpen(true);
                    }
                  }}
                >
                  {!resolvedAvatar && initials}
                </Avatar>
              </Badge>
              <Box>
                <Typography variant="h6" className="chat-header-name">{displayName}</Typography>
                <Typography variant="caption" className="chat-header-status">
                  {statusText} • View Profile
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
              sx={{ color: 'var(--text-primary)', ml: 'auto' }}
            >
              <SearchIcon />
            </IconButton>
            <IconButton 
              onClick={(e) => setHeaderMenuAnchor(e.currentTarget)} 
              sx={{ color: 'var(--text-primary)' }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
        )}

        {/* Find in Chat Search Bar */}
        {searchOpen && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: 'background.paper', borderBottom: '1px solid var(--divider)', zIndex: 10 }}>
            <TextField
              size="small"
              placeholder="Search in chat..."
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

        {/* Pinned Messages Banner */}
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

        <Box 
          className="chat-messages"
          ref={scrollContainerRef}
          onScroll={handleScroll}
          sx={{ position: 'relative' }}
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

              const isImageMsg = msg.text?.startsWith('[IMAGE]:') && !msg.deleted;
              let imageUrl = '';
              let caption = '';
              if (isImageMsg) {
                const parts = msg.text.substring(8).split('|');
                imageUrl = parts[0];
                caption = parts[1] || '';
              }

              const isMe = Number(msg.senderId) === Number(user.id);
              
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
                    sx={{ gap: 1.5, mb: 1, alignItems: 'flex-end' }}
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
                        src={resolvedAvatar} 
                        sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'primary.main', cursor: resolvedAvatar ? 'pointer' : 'default', mb: 0.5 }}
                        onClick={() => {
                          if (resolvedAvatar) {
                            setLightboxUrl(resolvedAvatar);
                            setLightboxName(displayName);
                            setLightboxOpen(true);
                          }
                        }}
                      >
                        {!resolvedAvatar && initials}
                      </Avatar>
                    )}
                    <Paper 
                      className={`message-bubble ${isMe ? 'me' : 'other'} ${msg.id === highlightMessageId ? 'pulse-highlight' : ''}`}
                      onClick={(e) => {
                        if (selectionMode) {
                          toggleSelectMessage(msg.id);
                        } else {
                          handleMessageBubbleClick(e, msg);
                        }
                      }}
                      sx={{
                        transition: 'all 0.5s ease',
                        cursor: msg.deleted ? 'default' : 'pointer',
                        position: 'relative',
                        border: msg.id === highlightMessageId ? '1.5px solid #FFD54F' : 'none',
                        
                        backgroundColor: msg.id === highlightMessageId 
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
                            color: isMe ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                            mb: 0.5
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
                            borderLeft: `3px solid ${isMe ? '#fff' : 'var(--primary-color)'}`,
                            pl: 1, 
                            mb: 1, 
                            cursor: 'pointer',
                            bgcolor: isMe ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.03)',
                            borderRadius: '0 4px 4px 0',
                            p: 0.75
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', color: isMe ? '#fff' : 'primary.main' }}>
                            {msg.replyToUsername}
                          </Typography>
                          <Typography variant="caption" sx={{ color: isMe ? 'rgba(255,255,255,0.8)' : 'text.secondary', display: 'block' }} noWrap>
                            {msg.replyToMessage}
                          </Typography>
                        </Box>
                      )}

                      {msg.deleted ? (
                        <Typography variant="body1" sx={{ fontStyle: 'italic', color: isMe ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>
                          This message was deleted
                        </Typography>
                      ) : isImageMsg ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <img 
                            src={imageUrl} 
                            alt="chat attachment"
                            style={{ maxWidth: '240px', maxHeight: '240px', borderRadius: 8, cursor: 'pointer', objectFit: 'cover' }} 
                            onClick={(e) => {
                              e.stopPropagation();
                              setLightboxUrl(imageUrl);
                              setLightboxName(Number(msg.senderId) === Number(user?.id) ? 'You' : displayName);
                              setLightboxIsProfile(false);
                              setLightboxOpen(true);
                            }}
                          />
                          {caption && <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{caption}</Typography>}
                        </Box>
                      ) : (
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
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
                        {isMe && !msg.deleted && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {msg.read ? (
                              <DoneAllIcon sx={{ fontSize: 13, color: '#FFD54F' }} />
                            ) : msg.delivered ? (
                              <DoneAllIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }} />
                            ) : (
                              <DoneIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }} />
                            )}
                          </Box>
                        )}
                      </Box>
                    </Paper>
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
          <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'action.hover', borderTop: '1px solid var(--divider)' }}>
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
                Replying to {replyingMessage.senderId === user.id ? 'You' : resolvedUser.username}
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
            <IconButton size="small" onClick={() => { setEditingMessage(null); setInputText(''); if (user?.id && userId) { localStorage.removeItem(`sophiapath_draft_chat_${user.id}_${userId}`); } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {isOtherUserTyping && (
          <Box sx={{ px: 2.5, py: 0.75, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'background.paper', borderTop: '1px solid var(--divider)' }}>
            <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              {resolvedUser.fullname || resolvedUser.username} is typing
            </Typography>
            <Box className="typing-dots" sx={{ display: 'flex', gap: 0.35 }}>
              <span className="dot" style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'var(--text-secondary)', display: 'inline-block' }}></span>
              <span className="dot" style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'var(--text-secondary)', display: 'inline-block' }}></span>
              <span className="dot" style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'var(--text-secondary)', display: 'inline-block' }}></span>
            </Box>
          </Box>
        )}

        <Box className="chat-input-area">
          <TextField
            fullWidth
            placeholder={selectedImage ? "Add a caption..." : "Type a message..."}
            variant="outlined"
            multiline
            maxRows={4}
            value={inputText}
            onChange={handleInputChange}
            className="chat-text-field"
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
                </InputAdornment>
              )
            }}
          />
          <IconButton 
            color="primary" 
            onClick={handleSendMessage}
            className="chat-send-btn"
            disabled={!inputText.trim() && !selectedImage}
          >
            <SendIcon />
          </IconButton>
        </Box>

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

      {/* Other User Profile Dialog */}
      <Dialog open={openProfile} onClose={() => setOpenProfile(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2, position: 'relative' } }}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', pt: 3, pr: 7 }}>
          <IconButton
            onClick={() => setOpenProfile(false)}
            sx={{ position: 'absolute', right: 16, top: 16, color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
          Learner Profile
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', pb: 3 }}>
          <Tabs value={profileTab} onChange={(e, val) => setProfileTab(val)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Info" sx={{ textTransform: 'none', fontWeight: 600 }} />
            <Tab label="Media & Links" sx={{ textTransform: 'none', fontWeight: 600 }} />
          </Tabs>

          {profileTab === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={localStorage.getItem(`avatar_${userId}`) || targetUserDetails?.avatar || ''}
                sx={{ width: 100, height: 100, mb: 2, bgcolor: 'primary.main', fontSize: '2.5rem', fontWeight: 'bold', cursor: (localStorage.getItem(`avatar_${userId}`) || targetUserDetails?.avatar) ? 'pointer' : 'default' }}
                onClick={() => {
                  const url = localStorage.getItem(`avatar_${userId}`) || targetUserDetails?.avatar || '';
                  if (url) {
                    setLightboxUrl(url);
                    setLightboxIsProfile(true);
                    setLightboxOpen(true);
                  }
                }}
              >
                {!(localStorage.getItem(`avatar_${userId}`) || targetUserDetails?.avatar) && initials}
              </Avatar>
              
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {targetUserDetails?.fullname || displayName}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {targetUserDetails?.tag || 'Sophiapath Learner'}
              </Typography>

              <Divider sx={{ width: '100%', mb: 3 }} />

              <Stack spacing={2} sx={{ width: '100%', px: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FingerprintIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Username</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      @{targetUserDetails?.username || targetUser.username || 'learner'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PersonIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Gender / Age</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {targetUserDetails?.gender || 'Rather Not Say'} • {targetUserDetails?.age || 20} years old
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CalendarIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Joined</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {targetUserDetails?.dateTime ? formatDate(targetUserDetails.dateTime) : 'Recently'}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
              {user.id !== Number(userId) && (
                <Button
                  variant="outlined"
                  color={user.blockedUserIds?.includes(String(userId)) ? "primary" : "error"}
                  onClick={async () => {
                    const isBlocked = user.blockedUserIds?.includes(String(userId));
                    if (isBlocked) {
                      await unblockUser(userId);
                    } else {
                      await blockUser(userId);
                    }
                    setOpenProfile(false);
                  }}
                  sx={{ mt: 3, borderRadius: 3, textTransform: 'none', width: '90%' }}
                >
                  {user.blockedUserIds?.includes(String(userId)) ? "Unblock User" : "Block User"}
                </Button>
              )}
            </Box>
          ) : (
            <Box sx={{ width: '100%' }}>
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
                              setLightboxName(Number(m.senderId) === Number(user?.id) ? 'You' : displayName);
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
          {lightboxName || displayName}
        </Typography>
        {lightboxUrl ? (
          <img 
            src={lightboxUrl} 
            alt={displayName} 
            style={{ width: '100%', maxHeight: '400px', borderRadius: '12px', objectFit: 'cover' }}
          />
        ) : (
          <Avatar sx={{ width: 200, height: 200, fontSize: '5rem', bgcolor: 'primary.main', fontWeight: 'bold', mb: 2 }}>
            {initials}
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
                const senderName = msg.senderId === user.id ? 'You' : resolvedUser.username;
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
                    onClick={() => handleForwardMessage(target)}
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
            Are you sure you want to clear your chat history with this user? This action cannot be undone.
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
                localStorage.setItem(`sophiapath_clear_msg_id_${user.id}_${userId}`, String(lastMsg.id));
                localStorage.setItem(`sophiapath_clear_time_${user.id}_${userId}`, lastMsg.timestamp);
              } else {
                localStorage.setItem(`sophiapath_clear_time_${user.id}_${userId}`, new Date(0).toISOString());
                localStorage.removeItem(`sophiapath_clear_msg_id_${user.id}_${userId}`);
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
    </Box>
  );
};

export default ChatPage;
