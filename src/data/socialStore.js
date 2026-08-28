// Frontend Store service making REST API calls to the NestJS backend.

const getUserId = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payloadBase64 = token.split('.')[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);
    return Number(payload.sub);
  } catch (e) {
    return null;
  }
};

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const initLocalCommunities = () => {
  if (!localStorage.getItem('sophia_communities')) {
    const initialCommunities = [
      {
        id: 1,
        name: 'Computer Science',
        description: 'The general hub for computer science topics, software engineering theory, and computer systems.',
        icon: '💻',
        bannerColor: 'linear-gradient(135deg, #3D5CFF 0%, #7C8DFF 100%)',
        membersCount: 142,
        members: []
      },
      {
        id: 2,
        name: 'Cybersecurity Labs',
        description: 'Discussing network defense, security labs, web exploit scripts, cryptography, and server hardening.',
        icon: '🛡️',
        bannerColor: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        membersCount: 88,
        members: []
      },
      {
        id: 3,
        name: 'Philosophy & Logic',
        description: 'Debate logical fallacies, critical thinking paradigms, and argumentative analysis techniques.',
        icon: '🏛️',
        bannerColor: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        membersCount: 54,
        members: []
      }
    ];
    localStorage.setItem('sophia_communities', JSON.stringify(initialCommunities));
  }

  if (!localStorage.getItem('sophia_rooms')) {
    const initialRooms = [
      { id: 1, communityId: 1, name: 'general-cs', description: 'General discussions, CS concepts, and software engineering questions.' },
      { id: 2, communityId: 1, name: 'java-oop-design', description: 'Discuss object-oriented design patterns, UML structures, and Java interfaces.' },
      { id: 3, communityId: 1, name: 'web-technologies', description: 'Everything about HTML5, CSS3, DOM trees, and Javascript rendering cycles.' },
      { id: 4, communityId: 2, name: 'xss-csrf-help', description: 'Stuck on a cross-site scripting or csrf token challenge? Discuss tips here.' },
      { id: 5, communityId: 2, name: 'cryptography-math', description: 'Explore Enigma machines, Caesar cipher formulas, and RSA encryption algorithms.' },
      { id: 6, communityId: 3, name: 'logical-fallacies', description: 'Spot strawmans, ad-hominems, slippery slopes, and match arguments.' }
    ];
    localStorage.setItem('sophia_rooms', JSON.stringify(initialRooms));
  }

  if (!localStorage.getItem('sophia_questions')) {
    const initialQuestions = [
      {
        id: 1,
        roomId: 2,
        title: 'Why is composition preferred over inheritance in Java OOP design?',
        content: 'I am studying for the Java OOP module and keep reading that composition is more flexible than class inheritance. Can someone explain this in detail? When should I strictly use inheritance over composition, or is it always better to compose? An example with UML would be awesome.',
        authorId: 2,
        authorName: 'Alice Johnson',
        authorAvatar: '',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        upvotes: 2,
        upvotedUsers: [3, 4],
        downvotedUsers: [],
        commentsCount: 0
      },
      {
        id: 2,
        roomId: 2,
        title: 'Abstract class vs Interface in Java 8 and beyond',
        content: 'With default methods in interfaces, does Java 8 blur the line between abstract classes and interfaces? When should we choose one over the other now? Since we can write method bodies in both, what is the primary architectural difference?',
        authorId: 3,
        authorName: 'Bob Smith',
        authorAvatar: '',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        upvotes: 1,
        upvotedUsers: [2],
        downvotedUsers: [],
        commentsCount: 0
      },
      {
        id: 3,
        roomId: 4,
        title: 'Stuck on XSS lab filter bypass',
        content: 'I\'m trying to bypass a simple HTML input filter that sanitizes the word `<script>`. I tried uppercase `<SCRIPT>` and it seems to work, but is there a better way to trigger alert() without using `<script>` tags at all? Maybe image onerror handlers?',
        authorId: 4,
        authorName: 'Charlie Brown',
        authorAvatar: '',
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
        upvotes: 1,
        upvotedUsers: [1],
        downvotedUsers: [],
        commentsCount: 0
      }
    ];
    localStorage.setItem('sophia_questions', JSON.stringify(initialQuestions));
  }

  if (!localStorage.getItem('sophia_comments')) {
    localStorage.setItem('sophia_comments', JSON.stringify([]));
  }

  if (!localStorage.getItem('sophia_replies')) {
    localStorage.setItem('sophia_replies', JSON.stringify([]));
  }
};

export const socialStore = {
  // --- GROUPS ---
  getGroups: async (userId) => {
    try {
      const res = await fetch(`/api/groups/user/${userId}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to load groups');
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  getGroupById: async (groupId, userId) => {
    try {
      const url = userId ? `/api/groups/${groupId}?userId=${userId}` : `/api/groups/${groupId}`;
      const res = await fetch(url, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to load group details');
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  createGroup: async (name, description, memberIds, creatorId, creatorName) => {
    try {
      const res = await fetch('/api/groups/create', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name,
          description,
          memberIds: memberIds.map(Number),
          creatorId: Number(creatorId),
          creatorName
        })
      });
      if (!res.ok) throw new Error('Failed to create group');
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  sendGroupMessage: async (groupId, senderId, senderName, senderAvatar, text, replyToId = null, replyToMessage = null, replyToUsername = null, forwarded = false, pollQuestion = null, pollOptions = null) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/send-message`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          senderId: Number(senderId),
          senderName,
          senderAvatar,
          text,
          replyToId,
          replyToMessage,
          replyToUsername,
          forwarded,
          pollQuestion,
          pollOptions
        })
      });
      if (!res.ok) throw new Error('Failed to send group message');
      const data = await res.json();
      return data.message;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  pinGroupMessage: async (messageId, pin) => {
    try {
      const res = await fetch(`/api/groups/message/${messageId}/pin`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ pin })
      });
      if (!res.ok) throw new Error('Failed to pin group message');
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  deleteGroupMessage: async (messageId, userId) => {
    try {
      const res = await fetch(`/api/groups/message/${messageId}?userId=${userId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete group message');
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  editGroupMessage: async (messageId, text, userId) => {
    try {
      const res = await fetch(`/api/groups/message/${messageId}/edit`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ text, userId: Number(userId) })
      });
      if (!res.ok) throw new Error('Failed to edit group message');
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  editDirectMessage: async (messageId, text, userId) => {
    try {
      const res = await fetch(`/api/chat/message/${messageId}/edit`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ text, userId: Number(userId) })
      });
      if (!res.ok) throw new Error('Failed to edit direct message');
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  setGroupTypingStatus: async (groupId, userId, username, typing) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/typing`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId: Number(userId), username, typing })
      });
      if (!res.ok) throw new Error('Failed to set group typing status');
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  getGroupTypingStatus: async (groupId) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/typing`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to get group typing status');
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  joinGroupByLink: async (token, userId) => {
    try {
      const res = await fetch(`/api/groups/join-by-link/${token}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId: Number(userId) })
      });
      if (!res.ok) throw new Error('Failed to join group via invite link');
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  getActiveTypingStates: async (userId) => {
    try {
      const res = await fetch(`/api/chat/users/${userId}/active-typing-states`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch active typing states');
      return await res.json();
    } catch (e) {
      console.error(e);
      return { directTyping: {}, groupTyping: {} };
    }
  },

  addGroupMembers: async (groupId, memberIds) => {
    try {
      const userId = getUserId();
      const res = await fetch(`/api/groups/${groupId}/add-members`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          memberIds: memberIds.map(Number),
          userId: Number(userId)
        })
      });
      if (!res.ok) throw new Error('Failed to add group members');
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  makeGroupAdmin: async (groupId, userId) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/make-admin`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          userId: Number(userId)
        })
      });
      if (!res.ok) throw new Error('Failed to make group admin');
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  removeGroupAdmin: async (groupId, userId) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/remove-admin`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          userId: Number(userId)
        })
      });
      if (!res.ok) throw new Error('Failed to remove group admin');
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  removeGroupMember: async (groupId, userId) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/remove-member`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          userId: Number(userId)
        })
      });
      if (!res.ok) throw new Error('Failed to remove group member');
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  updateGroupDetails: async (groupId, userId, updates) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/update`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          userId: Number(userId),
          updates
        })
      });
      if (!res.ok) throw new Error('Failed to update group details');
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // --- DIRECT CHAT ---
  getChatHistory: async (userId1, userId2) => {
    try {
      const res = await fetch(`/api/chat/conversation/${userId1}/${userId2}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to load chat history');
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  sendDirectMessage: async (senderId, recipientId, message, username, avatar, replyToId = null, replyToMessage = null, replyToUsername = null, forwarded = false) => {
    try {
      const res = await fetch('/api/chat/send-message', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          senderId: Number(senderId),
          recipientId: Number(recipientId),
          message,
          username,
          avatar,
          replyToId,
          replyToMessage,
          replyToUsername,
          forwarded
        })
      });
      if (!res.ok) throw new Error('Failed to send message');
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  pinMessage: async (messageId, pin) => {
    try {
      const res = await fetch(`/api/chat/message/${messageId}/pin`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ pin })
      });
      if (!res.ok) throw new Error('Failed to pin message');
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  deleteMessage: async (messageId, userId) => {
    try {
      const res = await fetch(`/api/chat/message/${messageId}?userId=${userId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete message');
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  searchMessages: async (userId, query) => {
    try {
      const res = await fetch(`/api/chat/user/${userId}/search-messages?query=${encodeURIComponent(query)}`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to search messages');
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  updateTypingStatus: async (userId, recipientId, username, typing) => {
    try {
      const res = await fetch('/api/chat/typing', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          userId: Number(userId),
          recipientId: Number(recipientId),
          username,
          typing
        })
      });
      if (!res.ok) throw new Error('Failed to update typing status');
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  getTypingStatus: async (userId, otherUserId) => {
    try {
      const res = await fetch(`/api/chat/typing/${userId}/${otherUserId}`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to get typing status');
      return await res.json();
    } catch (e) {
      console.error(e);
      return { typing: false };
    }
  },
  getCommunities: async () => {
    try {
      const userId = getUserId();
      const res = await fetch(`/api/communities?userId=${userId}`, { headers: getHeaders() });
      if (!res.ok) return [];
      const list = await res.json();
      return list.map(c => ({
        ...c,
        isJoined: c.members?.some(m => Number(m.id) === Number(userId))
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  getCommunityById: async (communityId) => {
    const res = await fetch(`/api/communities/${communityId}`, { headers: getHeaders() });
    if (!res.ok) return null;
    const c = await res.json();
    const userId = getUserId();
    return {
      ...c,
      isJoined: c.members?.some(m => Number(m.id) === Number(userId))
    };
  },

  toggleJoinCommunity: async (communityId) => {
    const userId = getUserId();
    const res = await fetch(`/api/communities/${communityId}/join`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to join community.");
    }
    return res.json();
  },

  createCommunity: async (name, description, icon, isPrivate = false, isNSFW = false, rules = [], category = 'Software Engineering', maxMembers = 1000) => {
    const ownerId = getUserId();
    const res = await fetch('/api/communities/create', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, description, icon, ownerId, isPrivate, isNSFW, rules, category, maxMembers })
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to create community.");
    }
    return res.json();
  },

  createRoom: async (communityId, name, description) => {
    const creatorId = getUserId();
    const res = await fetch(`/api/communities/${communityId}/create-room`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, description, creatorId })
    });
    if (!res.ok) return null;
    return res.json();
  },

  getQuestions: async (roomId, sortBy = 'hot') => {
    const userId = getUserId();
    const res = await fetch(`/api/communities/rooms/${roomId}/questions?sortBy=${sortBy}&userId=${userId}`, {
      headers: getHeaders()
    });
    if (!res.ok) return [];
    const questions = await res.json();
    return questions.map(q => ({
      ...q,
      userUpvoted: q.upvotedUsers?.includes(userId),
      userDownvoted: q.downvotedUsers?.includes(userId)
    }));
  },

  getQuestionById: async (questionId) => {
    const userId = getUserId();
    const res = await fetch(`/api/communities/questions/${questionId}`, { headers: getHeaders() });
    if (!res.ok) return null;
    const q = await res.json();
    return {
      ...q,
      userUpvoted: q.upvotedUsers?.includes(userId),
      userDownvoted: q.downvotedUsers?.includes(userId)
    };
  },

  createQuestion: async (roomId, title, content, author, pollQuestion = null, pollOptions = null) => {
    const res = await fetch(`/api/communities/rooms/${roomId}/questions/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        title,
        content,
        authorId: Number(author.id),
        authorName: author.name || author.fullname || author.username || 'learner',
        authorAvatar: author.avatar || '',
        pollQuestion,
        pollOptions
      })
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.message || "Failed to create post.");
      return null;
    }
    return res.json();
  },

  upvoteQuestion: async (questionId, userId) => {
    const res = await fetch(`/api/communities/questions/${questionId}/upvote`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId: Number(userId) })
    });
    if (!res.ok) return null;
    return res.json();
  },

  downvoteQuestion: async (questionId, userId) => {
    const res = await fetch(`/api/communities/questions/${questionId}/downvote`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId: Number(userId) })
    });
    if (!res.ok) return null;
    return res.json();
  },

  getComments: async (questionId) => {
    const userId = getUserId();
    const res = await fetch(`/api/communities/questions/${questionId}/comments`, {
      headers: getHeaders()
    });
    if (!res.ok) return [];
    const list = await res.json();
    return list.map(c => ({
      ...c,
      userUpvoted: c.upvotedUsers?.includes(userId),
      userDownvoted: c.downvotedUsers?.includes(userId),
      replies: (c.replies || []).map(r => ({
        ...r,
        userUpvoted: r.upvotedUsers?.includes(userId),
        userDownvoted: r.downvotedUsers?.includes(userId)
      })).sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
    }));
  },

  addComment: async (questionId, content, author) => {
    const res = await fetch(`/api/communities/questions/${questionId}/comments/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        content,
        authorId: Number(author.id),
        authorName: author.name || author.fullname || author.username || 'learner',
        authorAvatar: author.avatar || ''
      })
    });
    if (!res.ok) return null;
    return res.json();
  },

  addReply: async (questionId, commentId, content, author, parentReplyId) => {
    const res = await fetch(`/api/communities/comments/${commentId}/replies/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        content,
        authorId: Number(author.id),
        authorName: author.name || author.fullname || author.username || 'learner',
        authorAvatar: author.avatar || '',
        parentReplyId: parentReplyId ? Number(parentReplyId) : undefined
      })
    });
    if (!res.ok) return null;
    return res.json();
  },

  upvoteComment: async (questionId, commentId, userId) => {
    const res = await fetch(`/api/communities/comments/${commentId}/upvote`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId: Number(userId) })
    });
    if (!res.ok) return null;
    return res.json();
  },

  downvoteComment: async (questionId, commentId, userId) => {
    const res = await fetch(`/api/communities/comments/${commentId}/downvote`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId: Number(userId) })
    });
    if (!res.ok) return null;
    return res.json();
  },

  approveQuestion: async (questionId) => {
    const userId = getUserId();
    const res = await fetch(`/api/communities/questions/${questionId}/approve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });
    if (!res.ok) return null;
    return res.json();
  },

  addModerator: async (communityId, moderatorId) => {
    const res = await fetch(`/api/communities/${communityId}/add-moderator`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ moderatorId: Number(moderatorId) })
    });
    if (!res.ok) return null;
    return res.json();
  },

  removeModerator: async (communityId, moderatorId) => {
    const res = await fetch(`/api/communities/${communityId}/remove-moderator`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ moderatorId: Number(moderatorId) })
    });
    if (!res.ok) return null;
    return res.json();
  },

  removeMember: async (communityId, memberId) => {
    const res = await fetch(`/api/communities/${communityId}/remove-member`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ memberId: Number(memberId) })
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to remove member.");
    }
    return res.json();
  },

  timeoutUser: async (communityId, targetUserId, durationMinutes) => {
    const res = await fetch(`/api/communities/${communityId}/timeout`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ targetUserId: Number(targetUserId), durationMinutes: Number(durationMinutes) })
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to timeout user.");
    }
    return res.json();
  },

  banUser: async (communityId, targetUserId, reason) => {
    const res = await fetch(`/api/communities/${communityId}/ban`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ targetUserId: Number(targetUserId), reason })
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to ban user.");
    }
    return res.json();
  },

  unbanUser: async (communityId, targetUserId) => {
    const res = await fetch(`/api/communities/${communityId}/unban`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ targetUserId: Number(targetUserId) })
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to unban user.");
    }
    return res.json();
  },

  getBlacklist: async (communityId) => {
    const res = await fetch(`/api/communities/${communityId}/blacklist`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to get blacklist.");
    }
    return res.json();
  },

  getMyStatus: async (communityId) => {
    const res = await fetch(`/api/communities/${communityId}/my-status`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) {
      return { isTimedOut: false, isBanned: false };
    }
    return res.json();
  },

  getUserProfile: async (userId) => {
    const res = await fetch(`/users/${userId}/profile`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to fetch user profile.");
    }
    return res.json();
  },

  updateCommunity: async (communityId, name, description, icon, isPrivate, isNSFW, rules, category, maxMembers, nsfwAgeLimit, ownerId = undefined) => {
    const res = await fetch(`/api/communities/${communityId}/update`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, description, icon, isPrivate, isNSFW, rules, category, maxMembers, nsfwAgeLimit, ownerId })
    });
    if (!res.ok) return null;
    return res.json();
  },

  deleteCommunity: async (communityId) => {
    const userId = getUserId();
    const res = await fetch(`/api/communities/${communityId}/delete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });
    return res.ok;
  },

  updateQuestion: async (questionId, title, content, pollQuestion = null, pollOptions = null) => {
    const res = await fetch(`/api/communities/questions/${questionId}/update`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, content, pollQuestion, pollOptions })
    });
    if (!res.ok) return null;
    return res.json();
  },

  deleteQuestion: async (questionId) => {
    const userId = getUserId();
    const res = await fetch(`/api/communities/questions/${questionId}/delete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });
    return res.ok;
  },

  updateComment: async (commentId, content) => {
    const res = await fetch(`/api/communities/comments/${commentId}/update`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content })
    });
    if (!res.ok) return null;
    return res.json();
  },

  deleteComment: async (commentId) => {
    const userId = getUserId();
    const res = await fetch(`/api/communities/comments/${commentId}/delete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });
    return res.ok;
  },

  updateReply: async (replyId, content) => {
    const res = await fetch(`/api/communities/replies/${replyId}/update`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content })
    });
    if (!res.ok) return null;
    return res.json();
  },

  deleteReply: async (replyId) => {
    const userId = getUserId();
    const res = await fetch(`/api/communities/replies/${replyId}/delete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });
    return res.ok;
  },

  votePostPoll: async (postId, optionIndex) => {
    const userId = getUserId();
    const res = await fetch(`/api/communities/questions/${postId}/vote-poll`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, optionIndex })
    });
    if (!res.ok) return null;
    return res.json();
  },

  joinCommunityByInvite: async (communityId) => {
    const userId = getUserId();
    const res = await fetch(`/api/communities/${communityId}/join-invite`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });
    if (!res.ok) return null;
    return res.json();
  },

  voteGroupPoll: async (messageId, optionIndex) => {
    const userId = getUserId();
    const res = await fetch(`/api/groups/message/${messageId}/vote-poll`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, optionIndex })
    });
    if (!res.ok) return null;
    return res.json();
  },

  getUserConversations: async () => {
    const userId = getUserId();
    const res = await fetch(`/api/chat/user/${userId}/conversations`, { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  }
};
