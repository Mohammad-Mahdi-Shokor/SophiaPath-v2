import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Paper, Tabs, Tab, Button, CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import './LearningPage.css';

import cppIcon from '../assets/sections/cpp.png';
import dataStIcon from '../assets/sections/datast.png';
import oopIcon from '../assets/sections/oop.png';
import cryptoIcon from '../assets/sections/cryptography.png';
import introCyberIcon from '../assets/sections/IntroToCybersecurity.png';
import commonVulnIcon from '../assets/sections/commonVulnerabilities.png';

const getSectionImage = (title) => {
  if (!title) return null;
  const t = title.toLowerCase();
  if (t.includes('c++') || t.includes('cpp')) return cppIcon;
  if (t.includes('data structure')) return dataStIcon;
  if (t.includes('object') || t.includes('oop')) return oopIcon;
  if (t.includes('crypto')) return cryptoIcon;
  if (t.includes('intro') && t.includes('cyber')) return introCyberIcon;
  if (t.includes('vulnerab')) return commonVulnIcon;
  return null;
};

const CourseSectionsPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCourseId, setActiveCourseId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/courses');
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
          
          const csCourse = data.find(c => c.title.toLowerCase().includes('computer science'));
          if (csCourse) setActiveCourseId(csCourse.id);
          else if (data.length > 0) setActiveCourseId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleTabChange = (e, newValue) => {
    setActiveCourseId(newValue);
  };

  const selectedCourse = courses.find(c => c.id === activeCourseId);
  const sections = selectedCourse?.sections || [];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeCourseId} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1rem',
              color: 'var(--text-secondary)'
            },
            '& .Mui-selected': {
              color: 'var(--primary-main)'
            }
          }}
        >
          {courses.map(course => (
            <Tab key={course.id} label={course.title} value={course.id} />
          ))}
        </Tabs>
      </Box>

      <Typography variant="h5" sx={{ mb: 3, fontWeight: 800, color: 'var(--text-primary)' }}>
        {selectedCourse?.title} Sections
      </Typography>

      {sections.length > 0 ? (
        <div className="learning-course-grid">
          {sections.map((section, index) => (
            <Paper 
              key={section.id}
              className="learning-course-card glass-panel"
              elevation={0}
              onClick={() => navigate(`/learning-path/${activeCourseId}`, { state: { initialSectionIndex: index } })}
              style={{ position: 'relative' }}
            >
              <img
                src={getSectionImage(section.title) || ''}
                alt=""
                className="learning-course-card-bg"
                style={{ maxWidth: '80%', maxHeight: '170px' }}
              />

              <div className="learning-course-content-box">
                <Typography variant="h5" className="learning-course-title">
                  {section.title}
                </Typography>

                <div className="learning-course-footer">
                  <div className="learning-course-cta">
                    <span>Start Section</span>
                    <PlayArrowIcon fontSize="small" />
                  </div>
                </div>
              </div>
            </Paper>
          ))}
        </div>
      ) : (
        <Paper className="learning-empty-state glass-panel" elevation={0}>
          <Typography variant="h6">No sections available</Typography>
          <Typography variant="body2">
            There are currently no sections to display for this course.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default CourseSectionsPage;
