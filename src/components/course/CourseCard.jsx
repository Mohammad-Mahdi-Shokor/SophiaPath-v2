import React from 'react';

const CourseCard = ({ course }) => {
  const progress = (course.progress?.completedLessons || 0) / course.totalLessons * 100;
  
  return (
    <div className="course-card">
      <div className="course-header">
        <img src={course.imageUrl} alt={course.title} className="course-image" />
        <div className="course-info">
          <h3 className="course-title">{course.title}</h3>
          <p className="course-description">{course.description}</p>
        </div>
      </div>
      
      <div className="course-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="progress-text">
          {course.progress?.completedLessons || 0}/{course.totalLessons} lessons
        </span>
      </div>
      
      <div className="course-sections">
        <h4>What you'll learn:</h4>
        <ul>
          {course.sections.slice(0, 3).map((section, index) => (
            <li key={section.id || index}>✓ {section.title}</li>
          ))}
          {course.sections.length > 3 && (
            <li>+ {course.sections.length - 3} more topics</li>
          )}
        </ul>
      </div>
      
      <button className="course-button">
        {(course.progress?.completedLessons || 0) > 0 ? 'Continue Learning' : 'Start Course'}
      </button>
    </div>
  );
};

export default CourseCard;