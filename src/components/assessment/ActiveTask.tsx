
import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { TestTask, AssessmentQuestion } from '../../types/assessment';
import QuestionContainer from './QuestionContainer';

interface ActiveTaskProps {
  currentTask: TestTask;
  timeRemaining: number | null;
  answers: Record<string, any>;
  handleAnswer: (questionId: string, value: any) => void;
  handleTaskComplete: () => void;
}

const ActiveTask: React.FC<ActiveTaskProps> = ({
  currentTask,
  timeRemaining,
  answers,
  handleAnswer,
  handleTaskComplete,
}) => {
  const questions = currentTask.questionsList || [];
  
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">{currentTask.title}</h2>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-assessment-teal" />
          <span className={`font-medium ${timeRemaining && timeRemaining < 60 ? 'text-assessment-error' : ''}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>
      
      <QuestionContainer 
        questions={questions}
        currentTask={currentTask}
        answers={answers}
        handleAnswer={handleAnswer}
      />
      
      <div className="flex justify-end mt-6">
        <Button
          className="bg-assessment-teal hover:bg-assessment-lightBlue text-white"
          onClick={handleTaskComplete}
        >
          Submit Task <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ActiveTask;
