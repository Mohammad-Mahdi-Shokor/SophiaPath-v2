import React, { useState } from 'react';

const Lesson = ({ lesson, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    if (selectedAnswer === lesson.questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    
    if (currentQuestion < lesson.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setQuizCompleted(true);
      if (onComplete && score + 1 >= lesson.questions.length * 0.8) {
        onComplete();
      }
    }
  };

  if (lesson.completed) {
    return (
      <div className="lesson completed">
        <h3>{lesson.title} ✅</h3>
        <p>Lesson completed!</p>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="lesson quiz-result">
        <h3>{lesson.title}</h3>
        <p>Your score: {score}/{lesson.questions.length}</p>
        <button onClick={() => onComplete && onComplete()}>
          Mark as Complete
        </button>
      </div>
    );
  }

  const currentQ = lesson.questions[currentQuestion];

  return (
    <div className="lesson">
      <h3>{lesson.title}</h3>
      <div className="question">
        <p>{currentQ.question}</p>
        <div className="options">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              className={`option ${selectedAnswer === index ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(index)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <button 
        className="next-button"
        onClick={handleNext}
        disabled={selectedAnswer === null}
      >
        {currentQuestion === lesson.questions.length - 1 ? 'Finish' : 'Next'}
      </button>
      <div className="progress">
        Question {currentQuestion + 1} of {lesson.questions.length}
      </div>
    </div>
  );
};

export default Lesson;