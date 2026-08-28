import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { socialStore } from '../../data/socialStore';

const GroupJoinLinkHandler = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const joinGroup = async () => {
      if (!user) {
        setError('Please log in first to join the group.');
        return;
      }
      try {
        const group = await socialStore.joinGroupByLink(token, user.id);
        if (group) {
          localStorage.setItem(`sophiapath_clear_time_${user.id}_${group.id}`, new Date().toISOString());
          navigate(`/group/${group.id}`);
        } else {
          setError('Failed to join group. The invite link may be invalid or expired.');
        }
      } catch (err) {
        setError('An error occurred while joining the group.');
      }
    };

    if (token && user) {
      joinGroup();
    } else if (!user) {
      setError('Please log in to join this group.');
    }
  }, [token, user, navigate]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
        {error ? (
          <Typography color="error" variant="h6">
            {error}
          </Typography>
        ) : (
          <Box>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">Joining group, please wait...</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default GroupJoinLinkHandler;
