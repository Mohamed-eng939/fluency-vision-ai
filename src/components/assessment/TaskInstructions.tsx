
import React from 'react';
import { Book, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { TestTask } from '../../types/assessment';

interface TaskInstructionsProps {
  currentTask: TestTask;
  startTask: () => void;
}

const TaskInstructions: React.FC<TaskInstructionsProps> = ({ 
  currentTask,
  startTask
}) => {
  return (
    <div className="text-center py-8">
      <div className="bg-assessment-blue/5 p-6 rounded-lg mb-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-3 flex items-center justify-center gap-2">
          <Book className="h-5 w-5 text-assessment-teal" />
          {currentTask.title}
        </h2>
        <p className="mb-4">{currentTask.description}</p>
        <div className="border-l-4 border-assessment-teal pl-4 py-2 bg-white rounded">
          <h3 className="font-medium text-assessment-blue mb-1">Instructions:</h3>
          <p className="text-gray-700">{currentTask.instructions}</p>
        </div>
        
        {currentTask.objective && (
          <div className="mt-3 text-left">
            <h3 className="font-medium text-assessment-blue mb-1">Objective:</h3>
            <p className="text-gray-700">{currentTask.objective}</p>
          </div>
        )}
        
        {currentTask.rubric && (
          <div className="mt-3 text-left">
            <h3 className="font-medium text-assessment-blue mb-1">Assessment Criteria:</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              {currentTask.rubric.criteria.map((criterion, idx) => (
                <li key={idx}>{criterion}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              <span className="font-medium">Cognitive Tag:</span> {currentTask.rubric.cognitiveTag}
            </p>
            <p className="text-xs text-gray-500">
              <span className="font-medium">Language Functions:</span> {currentTask.rubric.languageFunctions.join(', ')}
            </p>
          </div>
        )}
        
        <div className="mt-4 flex items-center justify-center gap-3 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {currentTask.timeLimit} minutes
          </span>
          <span className="px-2 py-1 bg-gray-100 rounded-full">
            {currentTask.questionsList ? currentTask.questionsList.length : currentTask.questions} questions
          </span>
        </div>
      </div>
      <Button 
        className="bg-assessment-teal hover:bg-assessment-lightBlue text-white"
        onClick={startTask}
      >
        Start Task
      </Button>
    </div>
  );
};

export default TaskInstructions;
