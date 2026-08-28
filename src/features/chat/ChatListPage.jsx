import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Badge,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  ListItem,
  IconButton,
  Menu,
  MenuItem,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  Forum as ForumIcon,
  Group as GroupIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { socialStore } from '../../data/socialStore';
// Local date formatting helpers
const parseSafeTime = (dateVal) => {
  if (!dateVal) return 0;
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? 0 : d.getTime();
};

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
import './Chat.css';

const ChatListPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0); // 0 = Direct Messages, 1 = Groups
  
  // Starred messages states
  const [starredMessages, setStarredMessages] = useState([]);
  const [starredMenuAnchor, setStarredMenuAnchor] = useState(null);

  const loadStarredMessages = () => {
    const list = JSON.parse(localStorage.getItem('starred_messages_list') || '[]');
    setStarredMessages(list);
  };

  const handleOpenStarredMenu = (e) => {
    loadStarredMessages();
    setStarredMenuAnchor(e.currentTarget);
  };

  const handleCloseStarredMenu = () => {
    setStarredMenuAnchor(null);
  };

  useEffect(() => {
    loadStarredMessages();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [lastMessageTimes, setLastMessageTimes] = useState({});
  const [dmUnseenCounts, setDmUnseenCounts] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Direct Chat Menu & Archive states
  const [chatMenuAnchor, setChatMenuAnchor] = useState(null);
  const [chatMenuTargetUserId, setChatMenuTargetUserId] = useState(null);
  const [groupMenuAnchor, setGroupMenuAnchor] = useState(null);
  const [groupMenuTargetId, setGroupMenuTargetId] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [settingsTrigger, setSettingsTrigger] = useState(0);

  // Group state
  const [groups, setGroups] = useState([]);
  const [activeTypingStates, setActiveTypingStates] = useState({ directTyping: {}, groupTyping: {} });
  const [openCreateGroup, setOpenCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]); // array of userIds
  const [messageSearchResults, setMessageSearchResults] = useState([]);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'groups') {
      setActiveTab(1);
    } else if (tabParam === 'dms') {
      setActiveTab(0);
    }
  }, [location]);

  useEffect(() => {
    if (activeTab === 0 && searchQuery.trim()) {
      const delayDebounce = setTimeout(async () => {
        const results = await socialStore.searchMessages(user.id, searchQuery);
        setMessageSearchResults(results);
      }, 400);
      return () => clearTimeout(delayDebounce);
    } else {
      setMessageSearchResults([]);
    }
  }, [searchQuery, activeTab, user?.id]);

  const isUserOnline = (otherUser) => {
    if (!otherUser || !otherUser.lastActiveTime) return false;
    const diffMs = Date.now() - parseSafeTime(otherUser.lastActiveTime);
    return diffMs < 12000;
  };

  const matchNameQuery = (fullName, username, queryStr) => {
    const q = queryStr.toLowerCase().trim();
    if (!q) return true;
    const words = `${fullName} ${username}`.toLowerCase().split(/[\s_.-]+/);
    return words.some(w => w.startsWith(q));
  };

  const loadSocialData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      // 1. Fetch all users from the backend
      const usersRes = await fetch('/users', { headers });
      if (!usersRes.ok) throw new Error('Failed to fetch users');
      const usersList = await usersRes.json();

      const typingStates = await socialStore.getActiveTypingStates(user.id);
      if (typingStates) {
        setActiveTypingStates(typingStates);
      }

      // 2. Fetch all active conversations for the current user (for DM last messages)
      const convRes = await fetch(`/api/chat/user/${user.id}/conversations`, { headers });
      let conversations = [];
      if (convRes.ok) {
        conversations = await convRes.json();
      }

      const msgPreviews = {};
      const msgTimes = {};
      conversations.forEach(c => {
        const otherId = c.userId1 === user.id ? c.userId2 : c.userId1;
        const clearMsgId = localStorage.getItem(`sophiapath_clear_msg_id_${user.id}_${otherId}`);
        const clearTime = localStorage.getItem(`sophiapath_clear_time_${user.id}_${otherId}`);
        
        let isCleared = false;
        if (c.lastMessage) {
          if (clearMsgId && String(c.lastMessage.id) === String(clearMsgId)) {
            isCleared = true;
          } else if (clearTime && parseSafeTime(c.lastMessageTime) <= parseSafeTime(clearTime)) {
            isCleared = true;
          }
        } else if (clearTime && parseSafeTime(c.lastMessageTime) <= parseSafeTime(clearTime)) {
          isCleared = true;
        }
        
        if (!isCleared) {
          msgTimes[otherId] = c.lastMessageTime;
          if (c.lastMessage) {
            const isImg = c.lastMessage.message?.startsWith('[IMAGE]:');
            const cleanText = isImg ? '📷 Photo' : c.lastMessage.message;
            msgPreviews[otherId] = c.lastMessage.senderId === user.id
              ? `You: ${cleanText}`
              : cleanText;
          }
        }
      });

      const dmUnseenCountsObj = {};
      await Promise.all(conversations.map(async (c) => {
        const otherId = c.userId1 === user.id ? c.userId2 : c.userId1;
        try {
          const res = await fetch(`/api/chat/conversation/${user.id}/${otherId}`, { headers });
          if (res.ok) {
            const rawMsgs = await res.json();
            const clearMsgId = localStorage.getItem(`sophiapath_clear_msg_id_${user.id}_${otherId}`);
            const clearTime = localStorage.getItem(`sophiapath_clear_time_${user.id}_${otherId}`);
            
            let msgs = rawMsgs;
            if (clearMsgId) {
              const clearIdx = rawMsgs.findIndex(m => String(m.id) === String(clearMsgId));
              if (clearIdx !== -1) {
                msgs = rawMsgs.slice(clearIdx + 1);
              } else if (clearTime) {
                msgs = rawMsgs.filter(m => parseSafeTime(m.timestamp) > parseSafeTime(clearTime));
              }
            } else if (clearTime) {
              msgs = rawMsgs.filter(m => parseSafeTime(m.timestamp) > parseSafeTime(clearTime));
            }

            let lastSeenId = localStorage.getItem(`sophiapath_last_seen_id_${user.id}_${otherId}`);
            let lastSeen = localStorage.getItem(`sophiapath_last_seen_${user.id}_${otherId}`);
            
            if (!lastSeen) {
              const nowStr = new Date().toISOString();
              localStorage.setItem(`sophiapath_last_seen_${user.id}_${otherId}`, nowStr);
              lastSeen = nowStr;
              if (msgs.length > 0) {
                const lastMsgId = String(msgs[msgs.length - 1].id);
                localStorage.setItem(`sophiapath_last_seen_id_${user.id}_${otherId}`, lastMsgId);
                lastSeenId = lastMsgId;
              }
            }

            const lastSeenIdx = lastSeenId ? msgs.findIndex(m => String(m.id) === String(lastSeenId)) : -1;
            const unseenCount = lastSeenIdx !== -1
              ? msgs.slice(lastSeenIdx + 1).filter(m => Number(m.senderId) !== Number(user.id)).length
              : msgs.filter(m => 
                  Number(m.senderId) !== Number(user.id) && 
                  parseSafeTime(m.timestamp) > parseSafeTime(lastSeen)
                ).length;
            dmUnseenCountsObj[otherId] = unseenCount;
          }
        } catch (e) {
          console.error("Failed to fetch conversation history for", otherId, e);
        }
      }));
      setDmUnseenCounts(dmUnseenCountsObj);

      // Exclude current user and admins (roleID === 3)
      const filteredUsers = usersList.filter(u => u.id !== user.id && u.roleID !== 3);

      setAllUsers(filteredUsers);
      setLastMessages(msgPreviews);
      setLastMessageTimes(msgTimes);

      // 3. Fetch groups from our local store
      if (user?.id) {
        const joinedGroups = await socialStore.getGroups(user.id);
        setGroups(joinedGroups);
      }
    } catch (err) {
      console.error('Failed to load chat data:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadSocialData(false);
      const interval = setInterval(() => loadSocialData(true), 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const activeDms = useMemo(() => {
    if (!user || !user.id) return [];
    return allUsers.filter(u => {
      const otherId = u.id;
      const lastMsgTime = lastMessageTimes[otherId];
      if (!lastMsgTime) return false;

      // Check if blocked by target or we blocked them
      const isBlockedByTarget = u.blockedUserIds?.includes(String(user.id));
      const isBlockedByMe = user.blockedUserIds?.includes(String(otherId));
      if (isBlockedByTarget || isBlockedByMe) return false;

      // Check if archived
      const archivedList = JSON.parse(localStorage.getItem(`sophiapath_archived_chats_${user.id}`) || '[]');
      if (archivedList.includes(otherId)) return false;

      // Check if deleted
      const deletedObj = JSON.parse(localStorage.getItem(`sophiapath_deleted_chats_${user.id}`) || '{}');
      const deleteTime = deletedObj[otherId];
      if (deleteTime && parseSafeTime(lastMsgTime) <= parseSafeTime(deleteTime)) {
        return false;
      }

      return true;
    });
  }, [allUsers, lastMessageTimes, user?.blockedUserIds, user?.id, settingsTrigger]);

  const archivedDms = useMemo(() => {
    if (!user || !user.id) return [];
    return allUsers.filter(u => {
      const otherId = u.id;
      const lastMsgTime = lastMessageTimes[otherId];
      if (!lastMsgTime) return false;

      // Check if blocked by target or we blocked them
      const isBlockedByTarget = u.blockedUserIds?.includes(String(user.id));
      const isBlockedByMe = user.blockedUserIds?.includes(String(otherId));
      if (isBlockedByTarget || isBlockedByMe) return false;

      // Check if archived
      const archivedList = JSON.parse(localStorage.getItem(`sophiapath_archived_chats_${user.id}`) || '[]');
      if (!archivedList.includes(otherId)) return false;

      // Check if deleted
      const deletedObj = JSON.parse(localStorage.getItem(`sophiapath_deleted_chats_${user.id}`) || '{}');
      const deleteTime = deletedObj[otherId];
      if (deleteTime && parseSafeTime(lastMsgTime) <= parseSafeTime(deleteTime)) {
        return false;
      }

      return true;
    });
  }, [allUsers, lastMessageTimes, user?.blockedUserIds, user?.id, settingsTrigger]);

  const filteredUsersList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      // Return active chats sorted by last message time (newest first)
      return [...activeDms].sort((a, b) => {
        const timeA = parseSafeTime(lastMessageTimes[a.id]);
        const timeB = parseSafeTime(lastMessageTimes[b.id]);
        return timeB - timeA;
      });
    }

    const matches = allUsers.filter(u => {
      return matchNameQuery(u.fullname || u.name || '', u.username || '', searchQuery);
    });

    // Sort by last message time (newest first)
    return matches.sort((a, b) => {
      const timeA = parseSafeTime(lastMessageTimes[a.id]);
      const timeB = parseSafeTime(lastMessageTimes[b.id]);
      if (timeA !== timeB) return timeB - timeA;
      const nameA = (a.fullname || a.name || a.username || '').toLowerCase();
      const nameB = (b.fullname || b.name || b.username || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [allUsers, searchQuery, activeDms, lastMessageTimes]);

  const filteredGroupsList = useMemo(() => {
    const deletedObj = JSON.parse(localStorage.getItem(`sophiapath_deleted_groups_${user?.id}`) || '{}');
    return groups.filter(g => {
      const deleteTime = deletedObj[g.id];
      if (deleteTime) {
        const sortedMsgs = g.messages && g.messages.length > 0
          ? [...g.messages].sort((a, b) => parseSafeTime(a.timestamp) - parseSafeTime(b.timestamp))
          : [];
        const lastMessage = sortedMsgs.length > 0 ? sortedMsgs[sortedMsgs.length - 1] : null;
        const lastMsgTime = lastMessage ? lastMessage.timestamp : g.createdAt || new Date(0).toISOString();
        if (parseSafeTime(lastMsgTime) <= parseSafeTime(deleteTime)) {
          return false;
        }
      }
      const name = (g.name || '').toLowerCase();
      return name.includes(searchQuery.toLowerCase());
    });
  }, [groups, searchQuery, user?.id, settingsTrigger]);

  const handleUserClick = (targetUser) => {
    const normalizedTarget = {
      id: targetUser.id,
      name: targetUser.fullname || targetUser.name || targetUser.username,
      avatar: localStorage.getItem(`avatar_${targetUser.id}`) || targetUser.avatar || '',
      username: targetUser.username
    };
    navigate(`/chat/${targetUser.id}`, { state: { targetUser: normalizedTarget } });
  };

  const handleGroupClick = (group) => {
    navigate(`/group/${group.id}`, { state: { group } });
  };

  const getLastMessage = (otherId) => {
    return lastMessages[otherId] || "Start a conversation...";
  };

  const handleOpenChatMenu = (e, targetUserId) => {
    e.stopPropagation();
    e.preventDefault();
    setChatMenuAnchor(e.currentTarget);
    setChatMenuTargetUserId(targetUserId);
  };

  const handleCloseChatMenu = () => {
    setChatMenuAnchor(null);
    setChatMenuTargetUserId(null);
  };

  const handleArchiveChat = () => {
    if (!chatMenuTargetUserId) return;
    const archivedList = JSON.parse(localStorage.getItem(`sophiapath_archived_chats_${user.id}`) || '[]');
    if (!archivedList.includes(chatMenuTargetUserId)) {
      archivedList.push(chatMenuTargetUserId);
      localStorage.setItem(`sophiapath_archived_chats_${user.id}`, JSON.stringify(archivedList));
    }
    setSettingsTrigger(prev => prev + 1);
    handleCloseChatMenu();
  };

  const handleUnarchiveChat = (targetUserId) => {
    const archivedList = JSON.parse(localStorage.getItem(`sophiapath_archived_chats_${user.id}`) || '[]');
    const updated = archivedList.filter(id => id !== targetUserId);
    localStorage.setItem(`sophiapath_archived_chats_${user.id}`, JSON.stringify(updated));
    setSettingsTrigger(prev => prev + 1);
  };

  const handleDeleteChat = () => {
    if (!chatMenuTargetUserId) return;
    const deletedObj = JSON.parse(localStorage.getItem(`sophiapath_deleted_chats_${user.id}`) || '{}');
    const lastMsgTime = lastMessageTimes[chatMenuTargetUserId];
    deletedObj[chatMenuTargetUserId] = lastMsgTime || new Date(0).toISOString();
    localStorage.setItem(`sophiapath_deleted_chats_${user.id}`, JSON.stringify(deletedObj));
    // Remove starred messages for this chat
    let starred = JSON.parse(localStorage.getItem('starred_messages_list') || '[]');
    starred = starred.filter(m => String(m.chatPartnerId) !== String(chatMenuTargetUserId));
    localStorage.setItem('starred_messages_list', JSON.stringify(starred));
    setSettingsTrigger(prev => prev + 1);
    handleCloseChatMenu();
  };

  const handleOpenGroupMenu = (e, groupId) => {
    e.stopPropagation();
    e.preventDefault();
    setGroupMenuAnchor(e.currentTarget);
    setGroupMenuTargetId(groupId);
  };

  const handleCloseGroupMenu = () => {
    setGroupMenuAnchor(null);
    setGroupMenuTargetId(null);
  };

  const handleDeleteGroup = () => {
    if (!groupMenuTargetId) return;
    const deletedObj = JSON.parse(localStorage.getItem(`sophiapath_deleted_groups_${user.id}`) || '{}');
    const g = groups.find(group => group.id === groupMenuTargetId);
    let lastMsgTime = null;
    if (g) {
      const sortedMsgs = g.messages && g.messages.length > 0
        ? [...g.messages].sort((a, b) => parseSafeTime(a.timestamp) - parseSafeTime(b.timestamp))
        : [];
      const lastMessage = sortedMsgs.length > 0 ? sortedMsgs[sortedMsgs.length - 1] : null;
      lastMsgTime = lastMessage ? lastMessage.timestamp : g.createdAt;
    }
    deletedObj[groupMenuTargetId] = lastMsgTime || new Date(0).toISOString();
    localStorage.setItem(`sophiapath_deleted_groups_${user.id}`, JSON.stringify(deletedObj));
    // Remove starred messages for this group
    let starred = JSON.parse(localStorage.getItem('starred_messages_list') || '[]');
    starred = starred.filter(m => String(m.groupId) !== String(groupMenuTargetId));
    localStorage.setItem('starred_messages_list', JSON.stringify(starred));
    setSettingsTrigger(prev => prev + 1);
    handleCloseGroupMenu();
  };

  const handleCreateGroupSubmit = async () => {
    if (!groupName.trim()) return;
    
    // Call our local store to write the new group
    const creatorName = user.fullname || user.name || user.username || "You";
    await socialStore.createGroup(
      groupName,
      groupDescription,
      selectedMembers,
      user.id,
      creatorName
    );

    // Reset fields & reload groups
    setGroupName('');
    setGroupDescription('');
    setSelectedMembers([]);
    setOpenCreateGroup(false);
    
    // Reload local state
    const joinedGroups = await socialStore.getGroups(user.id);
    setGroups(joinedGroups);
  };

  const toggleSelectMember = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  return (
    <Box className="chat-list-container">
      <Paper className="chat-list-card glass-panel-strong">
        
        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, val) => {
              setActiveTab(val);
              setSearchQuery('');
              navigate(`/chats?tab=${val === 1 ? 'groups' : 'dms'}`, { replace: true });
            }}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="Direct Messages" icon={<ForumIcon sx={{ fontSize: 18 }} />} iconPosition="start" sx={{ minHeight: 48 }} />
            <Tab label="Group Chats" icon={<GroupIcon sx={{ fontSize: 18 }} />} iconPosition="start" sx={{ minHeight: 48 }} />
          </Tabs>

          <Stack direction="row" spacing={1} alignItems="center">
            {activeTab === 1 && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setOpenCreateGroup(true)}
                sx={{
                  borderRadius: 4,
                  textTransform: 'none',
                  
                  fontWeight: 600
                }}
              >
                Create Group
              </Button>
            )}

            {/* Starred Messages Dropdown Menu */}
            <IconButton onClick={handleOpenStarredMenu} sx={{ border: '1.5px solid var(--divider)', borderRadius: 1.5, p: 0.75 }}>
              <StarIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
            </IconButton>
          </Stack>

          <Menu
            anchorEl={starredMenuAnchor}
            open={Boolean(starredMenuAnchor)}
            onClose={handleCloseStarredMenu}
            PaperProps={{
              sx: { width: 320, maxHeight: 400, borderRadius: 1.5, mt: 1 }
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid var(--divider)' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Starred Messages</Typography>
            </Box>
            {starredMessages.length === 0 ? (
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">No starred messages yet.</Typography>
              </MenuItem>
            ) : (
              starredMessages.map((msg) => (
                <MenuItem
                  key={msg.id}
                  onClick={() => {
                    handleCloseStarredMenu();
                    if (msg.type === 'group') {
                      navigate(`/group/${msg.groupId}?messageId=${msg.id}`);
                    } else {
                      navigate(`/chat/${msg.chatPartnerId}?messageId=${msg.id}`);
                    }
                  }}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                    py: 1.5,
                    whiteSpace: 'normal'
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5, width: '100%' }}>
                    <Avatar src={msg.senderAvatar} sx={{ width: 18, height: 18 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{msg.senderName}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      {msg.type === 'group' ? 'Group' : 'DM'}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.primary" sx={{
                    fontSize: '0.825rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {msg.text?.startsWith('[IMAGE]:') ? '[Image Message]' : msg.text}
                  </Typography>
                </MenuItem>
              ))
            )}
          </Menu>
        </Box>

        {/* Search Bar */}
        <Box className="chat-list-header-new" sx={{ borderBottom: 'none' }}>
          <Box className="chat-search-wrapper" sx={{ mt: 1 }}>
            <TextField
              fullWidth
              placeholder={activeTab === 0 ? "Search learners..." : "Search groups..."}
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="chat-search-field"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 3 }
              }}
            />
          </Box>
        </Box>

        {/* Feed List */}
        <List className="chat-list" sx={{ pt: 0 }}>
          {loading ? (
            <Box className="chat-empty-state">
              <Typography variant="body2">Loading chats...</Typography>
            </Box>
          ) : activeTab === 0 ? (
            /* DIRECT MESSAGES LIST */
            (filteredUsersList.length > 0 || archivedDms.length > 0) ? (
              <>
                {filteredUsersList.map((otherUser) => {
                  const userAvatar = localStorage.getItem(`avatar_${otherUser.id}`) || otherUser.avatar || '';
                  const displayName = otherUser.fullname || otherUser.name || otherUser.username || '?';
                  const initials = displayName.charAt(0).toUpperCase();
                  
                  const isBlockedByTarget = otherUser.blockedUserIds?.includes(String(user.id));
                  const isBlockedByMe = user.blockedUserIds?.includes(String(otherUser.id));
                  const isOnline = isUserOnline(otherUser);
                  const badgeColor = (isBlockedByTarget || isBlockedByMe) ? "default" : (isOnline ? "success" : "default");

                  return (
                    <ListItem 
                      key={otherUser.id} 
                      disablePadding
                      secondaryAction={
                        !isBlockedByTarget && !isBlockedByMe && (
                          <IconButton 
                            edge="end" 
                            size="small" 
                            onClick={(e) => handleOpenChatMenu(e, otherUser.id)}
                            sx={{ color: 'var(--text-secondary)', mr: 1 }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        )
                      }
                    >
                      <ListItemButton
                        onClick={() => !isBlockedByTarget && handleUserClick(otherUser)}
                        disabled={isBlockedByTarget}
                        className="chat-list-item-new"
                        sx={{ opacity: (isBlockedByTarget || isBlockedByMe) ? 0.6 : 1, width: '100%' }}
                      >
                        <ListItemAvatar>
                          <Badge 
                            overlap="circular" 
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            variant="dot"
                            color={badgeColor}
                            className="status-badge"
                          >
                            <Avatar 
                              src={userAvatar} 
                              className="chat-avatar"
                              sx={{ bgcolor: (isBlockedByTarget || isBlockedByMe) ? 'var(--text-disabled)' : 'primary.main', color: 'white', fontWeight: 'bold' }}
                            >
                              {!userAvatar && initials}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box className="chat-item-header">
                              <Typography className="chat-item-name" variant="subtitle2"
                                sx={{ color: (isBlockedByTarget || isBlockedByMe) ? 'var(--text-disabled)' : 'var(--text-primary)', fontWeight: 700 }}
                              >
                                {displayName}
                                {isBlockedByMe && ' (Blocked)'}
                                {isBlockedByTarget && ' (You were blocked)'}
                              </Typography>
                              {!isBlockedByTarget && !isBlockedByMe && lastMessageTimes[otherUser.id] && (
                                <Typography variant="caption" className="chat-item-time">
                                  {formatLogTime(lastMessageTimes[otherUser.id])}
                                </Typography>
                              )}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                              <Typography variant="body2" noWrap sx={{ flex: 1, pr: 1, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                {isBlockedByMe ? 'You blocked this user.' :
                                 isBlockedByTarget ? 'You cannot message this user.' :
                                 activeTypingStates.directTyping[otherUser.id] ? (
                                   <span style={{ color: '#2e7d32', fontWeight: 600 }}>Typing...</span>
                                 ) : localStorage.getItem(`sophiapath_draft_chat_${user.id}_${otherUser.id}`) ? (
                                   <span>
                                     <span style={{ color: '#2e7d32', fontWeight: 600 }}>Draft: </span>
                                     <span style={{ color: 'var(--text-secondary)' }}>
                                       {localStorage.getItem(`sophiapath_draft_chat_${user.id}_${otherUser.id}`)}
                                     </span>
                                   </span>
                                 ) : getLastMessage(otherUser.id)}
                              </Typography>
                              {dmUnseenCounts[otherUser.id] > 0 && (
                                <Box sx={{ minWidth: 20, height: 20, borderRadius: '10px', bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, px: 0.6, flexShrink: 0 }}>
                                  {dmUnseenCounts[otherUser.id]}
                                </Box>
                              )}
                            </Box>
                          }
                          primaryTypographyProps={{ component: 'div' }}
                          secondaryTypographyProps={{ component: 'div' }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}

                {messageSearchResults.length > 0 && (
                  <Box sx={{ mt: 3, px: 2, width: '100%' }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 700, 
                        color: 'primary.main', 
                        textTransform: 'uppercase', 
                        fontSize: '0.75rem', 
                        letterSpacing: '0.05em', 
                        mb: 1 
                      }}
                    >
                      Message Matches
                    </Typography>
                    <List sx={{ p: 0 }}>
                      {messageSearchResults.map((msg) => {
                        const partnerId = msg.senderId === user.id ? msg.recipientId : msg.senderId;
                        const otherUser = allUsers.find(u => Number(u.id) === Number(partnerId)) || {
                          id: partnerId,
                          fullname: msg.senderUsername,
                          username: msg.senderUsername
                        };
                        const userAvatar = localStorage.getItem(`avatar_${otherUser.id}`) || otherUser.avatar || '';
                        const displayName = otherUser.fullname || otherUser.name || otherUser.username || '?';
                        const initials = displayName.charAt(0).toUpperCase();
                        
                        const isImg = msg.message.startsWith('[IMAGE]:');
                        const previewText = isImg ? '📷 Photo' : msg.message;

                        return (
                          <ListItem key={msg.id} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                              onClick={() => navigate(`/chat/${partnerId}?messageId=${msg.id}`)}
                              className="chat-list-item-new"
                              sx={{ width: '100%', borderRadius: 2 }}
                            >
                              <ListItemAvatar>
                                <Avatar src={userAvatar} sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 'bold' }}>
                                  {!userAvatar && initials}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box className="chat-item-header">
                                    <Typography className="chat-item-name" variant="subtitle2" sx={{ fontWeight: 600 }}>
                                      {displayName}
                                    </Typography>
                                    <Typography variant="caption" className="chat-item-time">
                                      {formatLogTime(msg.timestamp)}
                                    </Typography>
                                  </Box>
                                }
                                secondary={
                                  <Typography variant="body2" color="text.secondary" noWrap>
                                    {msg.senderId === user.id ? 'You: ' : `${msg.senderUsername}: `}{previewText}
                                  </Typography>
                                }
                                primaryTypographyProps={{ component: 'div' }}
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Box>
                )}

                {archivedDms.length > 0 && (
                  <Box sx={{ mt: 2, px: 2, width: '100%' }}>
                    <Button 
                      onClick={() => setShowArchived(!showArchived)} 
                      variant="text" 
                      size="small" 
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      {showArchived ? "Hide Archived Chats" : `Show Archived Chats (${archivedDms.length})`}
                    </Button>
                    {showArchived && (
                      <List sx={{ mt: 1 }}>
                        {archivedDms.map((otherUser) => {
                          const userAvatar = localStorage.getItem(`avatar_${otherUser.id}`) || otherUser.avatar || '';
                          const displayName = otherUser.fullname || otherUser.name || otherUser.username || '?';
                          const initials = displayName.charAt(0).toUpperCase();

                          return (
                            <ListItem
                              key={otherUser.id}
                              disablePadding
                              secondaryAction={
                                <Button 
                                  size="small" 
                                  variant="outlined" 
                                  onClick={() => handleUnarchiveChat(otherUser.id)}
                                  sx={{ textTransform: 'none', py: 0.25, borderRadius: 2 }}
                                >
                                  Unarchive
                                </Button>
                              }
                            >
                              <ListItemButton 
                                onClick={() => handleUserClick(otherUser)}
                                className="chat-list-item-new"
                                sx={{ width: '100%' }}
                              >
                                <ListItemAvatar>
                                  <Avatar src={userAvatar} sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                                    {!userAvatar && initials}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText 
                                  primary={displayName}
                                  secondary="Archived"
                                />
                              </ListItemButton>
                            </ListItem>
                          );
                        })}
                      </List>
                    )}
                  </Box>
                )}
              </>
            ) : (
              <Box className="chat-empty-state">
                <ForumIcon sx={{ fontSize: 64, opacity: 0.1, mb: 2 }} />
                <Typography variant="h6">No active chats</Typography>
                <Typography variant="body2">Use the search bar above to find a learner and start a conversation!</Typography>
              </Box>
            )
          ) : (
            /* GROUPS LIST */
            filteredGroupsList.length > 0 ? (
              filteredGroupsList.map((group) => {
                const displayName = group.name || '?';
                const initials = displayName.substring(0, 2).toUpperCase();
                const clearMsgId = localStorage.getItem(`sophiapath_clear_msg_id_${user.id}_${group.id}`);
                const clearTime = localStorage.getItem(`sophiapath_clear_time_${user.id}_${group.id}`);
                
                let clearedMsgs = group.messages || [];
                if (clearMsgId) {
                  const clearIdx = clearedMsgs.findIndex(m => String(m.id) === String(clearMsgId));
                  if (clearIdx !== -1) {
                    clearedMsgs = clearedMsgs.slice(clearIdx + 1);
                  } else if (clearTime) {
                    clearedMsgs = clearedMsgs.filter(m => parseSafeTime(m.timestamp) > parseSafeTime(clearTime));
                  }
                } else if (clearTime) {
                  clearedMsgs = clearedMsgs.filter(m => parseSafeTime(m.timestamp) > parseSafeTime(clearTime));
                }
                const sortedMsgs = clearedMsgs.length > 0
                  ? [...clearedMsgs].sort((a, b) => parseSafeTime(a.timestamp) - parseSafeTime(b.timestamp))
                  : [];
                const lastMessage = sortedMsgs.length > 0 ? sortedMsgs[sortedMsgs.length - 1] : null;
                const lastMsgTime = lastMessage ? lastMessage.timestamp : null;
                const isImg = lastMessage?.text?.startsWith('[IMAGE]:');
                const cleanText = isImg ? '📷 Photo' : (lastMessage?.text || '');
                const lastMsgText = lastMessage 
                  ? `${lastMessage.senderId === user.id ? 'You: ' : `${lastMessage.senderUsername || 'Member'}: `}${cleanText}`
                  : "No messages yet...";

                let lastSeenId = localStorage.getItem(`sophiapath_last_seen_id_${user.id}_${group.id}`);
                let lastSeen = localStorage.getItem(`sophiapath_last_seen_${user.id}_${group.id}`);
                
                if (!lastSeen) {
                  const nowStr = new Date().toISOString();
                  localStorage.setItem(`sophiapath_last_seen_${user.id}_${group.id}`, nowStr);
                  lastSeen = nowStr;
                  if (sortedMsgs.length > 0) {
                    const lastMsgId = String(sortedMsgs[sortedMsgs.length - 1].id);
                    localStorage.setItem(`sophiapath_last_seen_id_${user.id}_${group.id}`, lastMsgId);
                    lastSeenId = lastMsgId;
                  }
                }

                const lastSeenIdx = lastSeenId ? sortedMsgs.findIndex(m => String(m.id) === String(lastSeenId)) : -1;
                const groupUnseenCount = lastSeenIdx !== -1
                  ? sortedMsgs.slice(lastSeenIdx + 1).filter(m => Number(m.senderId) !== Number(user.id)).length
                  : sortedMsgs.filter(m => 
                      Number(m.senderId) !== Number(user.id) && 
                      parseSafeTime(m.timestamp) > parseSafeTime(lastSeen)
                    ).length;

                return (
                  <ListItem
                    key={group.id}
                    disablePadding
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        size="small" 
                        onClick={(e) => handleOpenGroupMenu(e, group.id)}
                        sx={{ color: 'var(--text-secondary)', mr: 1 }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemButton 
                      onClick={() => handleGroupClick(group)}
                      className="chat-list-item-new"
                      sx={{ width: '100%' }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          src={group.avatar} 
                          className="chat-avatar"
                          sx={{ bgcolor: 'primary.light', color: 'white', fontWeight: 'bold', borderRadius: 4 }}
                        >
                          {!group.avatar && initials}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={
                          <Box className="chat-item-header">
                            <Typography className="chat-item-name" variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {displayName}
                            </Typography>
                            {lastMsgTime ? (
                              <Typography variant="caption" className="chat-item-time">
                                {formatLogTime(lastMsgTime)}
                              </Typography>
                            ) : (
                              <Typography variant="caption" className="chat-item-time" sx={{ bgcolor: 'action.hover', px: 1, py: 0.25, borderRadius: 2, fontSize: '0.7rem' }}>
                                {group.members.length} members
                              </Typography>
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <Typography variant="body2" noWrap sx={{ flex: 1, pr: 1, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                              {activeTypingStates.groupTyping[group.id]?.length > 0 ? (
                                <span style={{ color: '#2e7d32', fontWeight: 600 }}>
                                  {activeTypingStates.groupTyping[group.id].map(u => u.username).join(', ')} {activeTypingStates.groupTyping[group.id].length === 1 ? 'is' : 'are'} typing...
                                </span>
                              ) : localStorage.getItem(`sophiapath_draft_group_${user.id}_${group.id}`) ? (
                                <span>
                                  <span style={{ color: '#2e7d32', fontWeight: 600 }}>Draft: </span>
                                  <span style={{ color: 'var(--text-secondary)' }}>
                                    {localStorage.getItem(`sophiapath_draft_group_${user.id}_${group.id}`)}
                                  </span>
                                </span>
                              ) : lastMsgText}
                            </Typography>
                            {groupUnseenCount > 0 && (
                              <Box sx={{ minWidth: 20, height: 20, borderRadius: '10px', bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, px: 0.6, flexShrink: 0 }}>
                                {groupUnseenCount}
                              </Box>
                            )}
                          </Box>
                        }
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })
            ) : (
              <Box className="chat-empty-state">
                <GroupIcon sx={{ fontSize: 64, opacity: 0.1, mb: 2 }} />
                <Typography variant="h6">No groups joined</Typography>
                <Typography variant="body2">Create a new group and invite your learning squad!</Typography>
              </Box>
            )
          )}
        </List>
      </Paper>

      {/* CREATE GROUP DIALOG */}
      <Dialog 
        open={openCreateGroup} 
        onClose={() => setOpenCreateGroup(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, bgcolor: 'background.paper', position: 'relative' }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pr: 7 }}>
          <IconButton
            onClick={() => setOpenCreateGroup(false)}
            sx={{ position: 'absolute', right: 16, top: 16, color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
          Create New Group
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Group Name"
              placeholder="e.g. UML Study Group"
              fullWidth
              size="small"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
            <TextField
              label="Description"
              placeholder="What is this group about?"
              fullWidth
              multiline
              rows={2}
              size="small"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
            />

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
              Select Members
            </Typography>
            <Divider />

            <FormGroup sx={{ maxHeight: 200, overflowY: 'auto', pr: 1 }}>
              {activeDms.map((learner) => {
                const isBlockedByLearner = learner.blockedUserIds?.includes(String(user.id));
                return (
                  <FormControlLabel
                    key={learner.id}
                    control={
                      <Checkbox 
                        checked={selectedMembers.includes(learner.id)} 
                        disabled={isBlockedByLearner}
                        onChange={() => !isBlockedByLearner && toggleSelectMember(learner.id)}
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
                    sx={{ py: 0.5, borderBottom: '1px solid rgba(0,0,0,0.02)' }}
                  />
                );
              })}
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCreateGroupSubmit} 
            variant="contained" 
            disabled={!groupName.trim()}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={chatMenuAnchor}
        open={Boolean(chatMenuAnchor)}
        onClose={handleCloseChatMenu}
        PaperProps={{
          sx: { borderRadius: 3}
        }}
      >
        <MenuItem onClick={handleArchiveChat} sx={{ fontSize: '0.85rem' }}>
          Archive Chat
        </MenuItem>
        <MenuItem onClick={handleDeleteChat} sx={{ color: 'error.main', fontSize: '0.85rem' }}>
          Delete Chat (For You)
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={groupMenuAnchor}
        open={Boolean(groupMenuAnchor)}
        onClose={handleCloseGroupMenu}
        PaperProps={{
          sx: { borderRadius: 3}
        }}
      >
        <MenuItem onClick={handleDeleteGroup} sx={{ color: 'error.main', fontSize: '0.85rem' }}>
          Delete Group (For You)
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ChatListPage;
