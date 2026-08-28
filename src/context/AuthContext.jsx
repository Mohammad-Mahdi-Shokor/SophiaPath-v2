import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getStoredToken = () => {
    return localStorage.getItem('auth_token') || localStorage.getItem('token');
  };

  const setStoredToken = (token) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('token', token);
  };

  const removeStoredToken = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    return allowedRoles.includes(Number(user.roleID));
  };

  const handleAuthError = () => {
    removeStoredToken();
    setUser(null);
  };

  // Helper to fetch user courses and grades from backend
  const fetchUserProgress = async (token) => {
    try {
      // 1. Fetch registered courses
      const regRes = await fetch('/courses/me/registrations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!regRes.ok) return { registeredCourses: [], quizScores: {}, courseLessons: {} };

      const registrations = await regRes.json();
      const registeredCourses = registrations.map(r => r.course.title);

      // 2. Fetch grades for each registration
      const quizScores = {};
      const courseLessons = {};
      for (const reg of registrations) {
        try {
          const gradesRes = await fetch(`/courses/me/courses/${reg.course.id}/grades`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (gradesRes.ok) {
            const grades = await gradesRes.json();
            courseLessons[reg.course.title.toLowerCase()] = grades;
            grades.forEach(g => {
              if (g.done || g.grade !== null) {
                // Map to frontend lessonId score structure
                quizScores[g.lessonId] = (g.grade !== null && g.grade !== undefined) ? Number(g.grade) : (g.done ? 100 : 0);
              }
            });
          }
        } catch (err) {
          console.error(`Failed to fetch grades for course ${reg.course.id}:`, err);
        }
      }

      return { registeredCourses, quizScores, courseLessons };
    } catch (err) {
      console.error('Failed to fetch user progress:', err);
      return { registeredCourses: [], quizScores: {}, courseLessons: {} };
    }
  };

  const syncAvatarIfNeeded = (userData, token) => {
    const localAv = localStorage.getItem(`avatar_${userData.id}`);
    if (localAv && !userData.avatar) {
      fetch('/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avatar: localAv })
      }).catch(err => console.error("Self-healing avatar sync failed:", err));
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = getStoredToken();
      if (savedToken) {
        try {
          const res = await fetch('/users/me', {
            headers: {
              'Authorization': `Bearer ${savedToken}`
            }
          });
          if (res.ok) {
            const userData = await res.json();
            syncAvatarIfNeeded(userData, savedToken);
            const progress = await fetchUserProgress(savedToken);

            const finalRoleId = userData.roleID ?? 0;
            const finalCourses = userData.assignedCourseIds ? userData.assignedCourseIds.map(Number) : [];

            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.fullname,
              username: userData.username,
              roleID: finalRoleId,
              assignedCourseIds: finalCourses,
              age: userData.age,
              gender: userData.gender,
              tag: userData.tag,
              xp: userData.xp ?? 0,
              level: userData.level ?? 1,
              levelName: userData.levelName ?? 'Beginner',
              joinedDate: userData.dateTime,
              avatar: localStorage.getItem(`avatar_${userData.id}`) || userData.avatar || '',
              achievementIds: userData.achievementIds ?? [],
              streak: userData.streak ?? 0,
              groupsCreatedCount: userData.groupsCreatedCount ?? 0,
              commentsCreatedCount: userData.commentsCreatedCount ?? 0,
              postsApprovedCount: userData.postsApprovedCount ?? 0,
              commentsDeletedCount: userData.commentsDeletedCount ?? 0,
              ...progress
            });
          } else {
            // Token expired or invalid
            handleAuthError();
          }
        } catch (err) {
          console.error('Init auth error:', err);
          handleAuthError();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier, password) => {
    try {
      let email = identifier ? identifier.trim().toLowerCase() : '';

      // Handle username-to-email conversion
      if (identifier && !identifier.includes('@')) {
        try {
          const usersRes = await fetch('/users');
          if (usersRes.ok) {
            const usersList = await usersRes.json();
            const foundUser = usersList.find(
              (u) => u.username && u.username.toLowerCase() === identifier.toLowerCase()
            );
            if (foundUser && foundUser.email) {
              email = foundUser.email.trim().toLowerCase();
            }
          }
        } catch (e) {
          console.error('Username resolution error:', e);
        }
      }

      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const err = await res.json();
        return { success: false, message: err.message || 'Invalid username/email or password' };
      }

      const { accessToken } = await res.json();
      setStoredToken(accessToken);

      // Fetch user profile info
      const meRes = await fetch('/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (meRes.ok) {
        const userData = await meRes.json();
        const progress = await fetchUserProgress(accessToken);

        // Migrate pending registration avatar if exists
        const pendingAvatar = localStorage.getItem(`pending_avatar_${userData.email}`);
        if (pendingAvatar) {
          localStorage.setItem(`avatar_${userData.id}`, pendingAvatar);
          localStorage.removeItem(`pending_avatar_${userData.email}`);
        }

        syncAvatarIfNeeded(userData, accessToken);

        const finalRoleId = userData.roleID ?? 0;
        const finalCourses = userData.assignedCourseIds ? userData.assignedCourseIds.map(Number) : [];

        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.fullname,
          username: userData.username,
          roleID: finalRoleId,
          assignedCourseIds: finalCourses,
          age: userData.age,
          gender: userData.gender,
          tag: userData.tag,
          xp: userData.xp ?? 0,
          level: userData.level ?? 1,
          levelName: userData.levelName ?? 'Beginner',
          joinedDate: userData.dateTime,
          avatar: localStorage.getItem(`avatar_${userData.id}`) || userData.avatar || '',
          achievementIds: userData.achievementIds ?? [],
          streak: userData.streak ?? 0,
          groupsCreatedCount: userData.groupsCreatedCount ?? 0,
          commentsCreatedCount: userData.commentsCreatedCount ?? 0,
          postsApprovedCount: userData.postsApprovedCount ?? 0,
          commentsDeletedCount: userData.commentsDeletedCount ?? 0,
          ...progress
        });
        return { success: true };
      }
      return { success: false, message: 'Failed to retrieve profile data' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'Network error or backend offline' };
    }
  };

  const register = async (userData) => {
    try {
      const email = userData.email ? userData.email.trim().toLowerCase() : '';
      const password = userData.password;
      const fullname = userData.fullname || userData.name || "Learner";
      
      const username = userData.username || email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      const validUsername = username.length >= 4 ? username : (username + "1234").slice(0, 4);

      const payload = {
        email,
        password,
        username: validUsername,
        fullname,
        tag: userData.tag || "Learner",
        gender: userData.gender || "Rather Not Say",
        age: userData.age ? Number(userData.age) : 20,
        avatar: userData.avatar || ''
      };

      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        return { success: false, message: err.message || 'Registration failed' };
      }

      if (userData.avatar) {
        localStorage.setItem(`pending_avatar_${email}`, userData.avatar);
      }

      // Auto-login after registration
      return await login(email, password);
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, message: 'Network error or backend offline' };
    }
  };

  const logout = () => {
    setUser(null);
    removeStoredToken();
  };

  const deleteAccount = () => {
    // Delete account locally & clean token
    logout();
  };

  const updateQuizScore = async (lessonId, score) => {
    if (!user) return;
    const numScore = Number(score);

    // Optimistically update local AuthContext state with high score
    setUser(prev => {
      if (!prev) return prev;
      const currentScores = prev.quizScores || {};
      const previousHighScore = currentScores[lessonId] !== undefined ? currentScores[lessonId] : 0;
      const newHighScore = Math.max(previousHighScore, numScore);

      if (currentScores[lessonId] !== newHighScore) {
        return {
          ...prev,
          quizScores: {
            ...currentScores,
            [lessonId]: newHighScore
          }
        };
      }
      return prev;
    });

    const token = getStoredToken();
    if (!token) return;

    try {
      const res = await fetch(`/courses/me/lessons/${lessonId}/grade`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ grade: numScore })
      });

      if (res.ok) {
        await refreshUser();
      } else if (res.status === 401) {
        handleAuthError();
      }
    } catch (err) {
      console.error('updateQuizScore error:', err);
    }
  };

  const registerCourse = async (courseTitle) => {
    if (!user) return;
    const token = getStoredToken();
    if (!token) return;

    try {
      // 1. Fetch courses to match the title
      const coursesRes = await fetch('/courses');
      if (!coursesRes.ok) {
        if (coursesRes.status === 401) handleAuthError();
        return;
      }

      const coursesList = await coursesRes.json();
      const course = coursesList.find(c => c.title.toLowerCase() === courseTitle.toLowerCase());

      if (course) {
        // 2. Call register API
        const regRes = await fetch(`/courses/me/register/${course.id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (regRes.ok) {
          setUser(prev => ({
            ...prev,
            registeredCourses: [...(prev.registeredCourses || []), courseTitle]
          }));
          await refreshUser();
        } else if (regRes.status === 401) {
          handleAuthError();
        }
      }
    } catch (err) {
      console.error('registerCourse error:', err);
    }
  };
  
  const unregisterCourse = async (courseTitle) => {
    if (!user) return;
    const token = getStoredToken();
    if (!token) return;

    try {
      // 1. Fetch courses to match the title
      const coursesRes = await fetch('/courses');
      if (!coursesRes.ok) {
        if (coursesRes.status === 401) handleAuthError();
        return;
      }

      const coursesList = await coursesRes.json();
      const course = coursesList.find(c => c.title.toLowerCase() === courseTitle.toLowerCase());

      if (course) {
        // 2. Call unregister API
        const regRes = await fetch(`/courses/me/register/${course.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (regRes.ok) {
          setUser(prev => ({
            ...prev,
            registeredCourses: (prev.registeredCourses || []).filter(
              title => title.toLowerCase() !== courseTitle.toLowerCase()
            )
          }));
          await refreshUser();
        } else if (regRes.status === 401) {
          handleAuthError();
        }
      }
    } catch (err) {
      console.error('unregisterCourse error:', err);
    }
  };

  const updateProfile = async (profileData) => {
    if (!user) return { success: false, message: 'Not logged in' };
    const token = getStoredToken();
    if (!token) return { success: false, message: 'No token' };

    try {
      const payload = {};
      if (profileData.name !== undefined) payload.fullname = profileData.name;
      if (profileData.username !== undefined) payload.username = profileData.username;
      if (profileData.tag !== undefined) payload.tag = profileData.tag;
      if (profileData.gender !== undefined) payload.gender = profileData.gender;
      if (profileData.age !== undefined) payload.age = Number(profileData.age);
      if (profileData.avatar !== undefined) payload.avatar = profileData.avatar;

      const res = await fetch('/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        if (res.status === 401) handleAuthError();
        const err = await res.json();
        return { success: false, message: err.message || 'Update failed' };
      }

      const updatedUser = await res.json();
      
      if (profileData.avatar) {
        localStorage.setItem(`avatar_${user.id}`, profileData.avatar);
      }

      setUser(prev => ({
        ...prev,
        name: updatedUser.fullname,
        username: updatedUser.username,
        tag: updatedUser.tag,
        gender: updatedUser.gender,
        age: updatedUser.age,
        xp: updatedUser.xp !== undefined ? updatedUser.xp : prev.xp,
        level: updatedUser.level !== undefined ? updatedUser.level : prev.level,
        levelName: updatedUser.levelName !== undefined ? updatedUser.levelName : prev.levelName,
        avatar: profileData.avatar || prev.avatar
      }));

      return { success: true };
    } catch (err) {
      console.error('updateProfile error:', err);
      return { success: false, message: 'Network error or backend offline' };
    }
  };

  const blockUser = async (targetUserId) => {
    if (!user) return { success: false, message: 'Not logged in' };
    const token = getStoredToken();
    if (!token) return { success: false, message: 'No token' };

    try {
      const res = await fetch(`/users/${targetUserId}/block`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) handleAuthError();
        const err = await res.json();
        return { success: false, message: err.message || 'Block failed' };
      }

      const updatedUser = await res.json();
      setUser(prev => ({
        ...prev,
        blockedUserIds: updatedUser.blockedUserIds || []
      }));
      return { success: true };
    } catch (err) {
      console.error('blockUser error:', err);
      return { success: false, message: 'Network error or backend offline' };
    }
  };

  const unblockUser = async (targetUserId) => {
    if (!user) return { success: false, message: 'Not logged in' };
    const token = getStoredToken();
    if (!token) return { success: false, message: 'No token' };

    try {
      const res = await fetch(`/users/${targetUserId}/unblock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) handleAuthError();
        const err = await res.json();
        return { success: false, message: err.message || 'Unblock failed' };
      }

      const updatedUser = await res.json();
      setUser(prev => ({
        ...prev,
        blockedUserIds: updatedUser.blockedUserIds || []
      }));
      return { success: true };
    } catch (err) {
      console.error('unblockUser error:', err);
      return { success: false, message: 'Network error or backend offline' };
    }
  };

  const refreshUser = async () => {
    const savedToken = getStoredToken();
    if (!savedToken) return;
    try {
      // 1. Silently refresh the token to catch any database-side role changes
      let currentToken = savedToken;
      try {
        const refreshRes = await fetch('/auth/refresh', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${savedToken}`
          }
        });
        if (refreshRes.ok) {
          const { accessToken } = await refreshRes.json();
          setStoredToken(accessToken);
          currentToken = accessToken;
        }
      } catch (err) {
        console.warn('Silent token refresh failed:', err);
      }

      // 2. Fetch the latest user profile details
      const res = await fetch('/users/me', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      if (res.ok) {
        const userData = await res.json();
        const progress = await fetchUserProgress(currentToken);
        const finalRoleId = userData.roleID ?? 0;
        const finalCourses = userData.assignedCourseIds ? userData.assignedCourseIds.map(Number) : [];

        setUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            email: userData.email || prev.email,
            username: userData.username || prev.username,
            xp: userData.xp ?? 0,
            level: userData.level ?? 1,
            levelName: userData.levelName ?? 'Beginner',
            name: userData.fullname || prev.name,
            roleID: finalRoleId,
            assignedCourseIds: finalCourses,
            tag: userData.tag || prev.tag,
            gender: userData.gender || prev.gender,
            age: userData.age || prev.age,
            achievementIds: userData.achievementIds ?? [],
            streak: userData.streak ?? 0,
            joinedDate: userData.dateTime ?? prev.joinedDate,
            groupsCreatedCount: userData.groupsCreatedCount ?? 0,
            commentsCreatedCount: userData.commentsCreatedCount ?? 0,
            postsApprovedCount: userData.postsApprovedCount ?? 0,
            commentsDeletedCount: userData.commentsDeletedCount ?? 0,
            ...progress
          };
        });
      } else if (res.status === 401) {
        handleAuthError();
      }
    } catch (err) {
      console.error('refreshUser error:', err);
    }
  };

  const unlockAchievement = async (achievementId) => {
    const activeToken = getStoredToken();
    if (!activeToken) return;
    try {
      const res = await fetch('/users/me/achievements', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ achievementId }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            achievementIds: data.achievementIds || [],
          };
        });
      }
    } catch (err) {
      console.error('Failed to unlock achievement:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, deleteAccount, updateQuizScore, registerCourse, unregisterCourse, updateProfile, blockUser, unblockUser, refreshUser, unlockAchievement, loading, hasRole }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
