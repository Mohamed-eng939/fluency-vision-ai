
import React from 'react';
import { AssessmentQuestion, TestTask } from '../../types/assessment';
import QuestionRenderer from './QuestionRenderer';

interface QuestionContainerProps {
  questions: AssessmentQuestion[];
  currentTask: TestTask;
  answers: Record<string, any>;
  handleAnswer: (questionId: string, value: any) => void;
}

const QuestionContainer: React.FC<QuestionContainerProps> = ({
  questions,
  currentTask,
  answers,
  handleAnswer
}) => {
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">
          No questions available for this task.
        </div>
      </div>
    );
  }

  // Remove duplicates by filtering questions with unique IDs
  const uniqueQuestions = questions.filter((question, index, self) => 
    index === self.findIndex(q => q.id === question.id)
  );
  
  return (
    <div className="space-y-6">
      {uniqueQuestions.map((question) => (
        <div key={question.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-medium mb-3">{question.text}</h3>
          
          {question.audioUrl && (
            <div className="mb-4">
              <audio controls className="w-full">
                <source src={question.audioUrl} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          
          {question.imageUrl && (
            <div className="mb-4">
              <img 
                src={question.imageUrl} 
                alt="Question visual" 
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}
          
          <QuestionRenderer 
            question={question}
            taskId={currentTask.id}
            answer={answers[`${currentTask.id}-${question.id}`]}
            onAnswer={handleAnswer}
          />
        </div>
      ))}
    </div>
  );
};

export default QuestionContainer;
