import React from 'react';

const AchievementCard = ({ achievement }) => {
  const progressPercentage = (achievement.progress / achievement.target) * 100;
  const isUnlocked = achievement.progress >= achievement.target;

  return (
    <div className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
      <div className="achievement-icon">
        <span>{achievement.icon}</span>
      </div>
      <div className="achievement-content">
        <h4>{achievement.name}</h4>
        <p>{achievement.description}</p>
        <div className="achievement-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          <span className="progress-text">
            {achievement.progress}/{achievement.target}
          </span>
        </div>
        {isUnlocked && <span className="badge">Unlocked! 🎉</span>}
      </div>
    </div>
  );
};

export default AchievementCard;