
import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { CheckCircle, ArrowRight, Clock, Book } from 'lucide-react';
import { FullAssessment, TestTask } from '../types/assessment';

interface FullAssessmentProps {
  assessment: FullAssessment;
  onComplete: () => void;
  onExit: () => void;
}

interface TaskQuestion {
  id: string;
  text: string;
  options?: string[];
  imageUrl?: string;
  audioUrl?: string;
}

const FullAssessmentComponent: React.FC<FullAssessmentProps> = ({ assessment, onComplete, onExit }) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTaskActive, setIsTaskActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const currentSection = assessment.sections[currentSectionIndex];
  const currentTask = currentSection?.tasks[currentTaskIndex];
  
  // Sample questions for each task - in a real app, these would come from an API or database
  const [questions] = useState<Record<string, TaskQuestion[]>>({
    'a1-listening': [
      { 
        id: 'q1', 
        text: 'Listen to the phrase and select the matching image.', 
        audioUrl: '/sample-audio.mp3',
        options: ['A person eating breakfast', 'A person reading a book', 'A person walking a dog']
      },
      { 
        id: 'q2', 
        text: 'Listen and choose the correct picture.', 
        audioUrl: '/sample-audio-2.mp3',
        options: ['A woman driving a car', 'A family at the beach', 'A student in a classroom']
      }
    ],
    'a1-reading': [
      {
        id: 'q1',
        text: 'Match the word "apple" with the correct image.',
        options: ['🍎', '🍌', '🍇', '🍊']
      },
      {
        id: 'q2',
        text: 'Match the word "house" with the correct image.',
        options: ['🏠', '🏢', '🏫', '🏕️']
      }
    ]
  });
  
  // Start the task timer
  const startTask = () => {
    setIsTaskActive(true);
    setTimeRemaining(currentTask.timeLimit * 60); // convert to seconds
    
    // Start the timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time runs out
          handleTaskComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Cleanup timer on component unmount or when task changes
    return () => clearInterval(timer);
  };
  
  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [`${currentTask.id}-${questionId}`]: value
    }));
  };
  
  const handleTaskComplete = () => {
    // In a real app, you would save the answers here
    console.log('Task completed:', currentTask.id, answers);
    
    // Move to the next task or section
    if (currentTaskIndex < currentSection.tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    } else if (currentSectionIndex < assessment.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentTaskIndex(0);
    } else {
      // Assessment complete
      onComplete();
    }
    
    // Reset task state
    setIsTaskActive(false);
    setTimeRemaining(null);
  };
  
  // Format time from seconds to MM:SS
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const totalTasks = assessment.sections.reduce((acc, section) => acc + section.tasks.length, 0);
  const completedTasks = currentSectionIndex * currentSection.tasks.length + currentTaskIndex;
  const progressPercentage = (completedTasks / totalTasks) * 100;
  
  // Render questions for the current task
  const renderTaskQuestions = () => {
    const taskQuestions = questions[currentTask.id] || [];
    
    return (
      <div className="space-y-6">
        {taskQuestions.map((question) => (
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
            
            {question.options && (
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <label 
                    key={index} 
                    className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input 
                      type="radio" 
                      name={`question-${question.id}`} 
                      value={option}
                      onChange={() => handleAnswer(question.id, option)}
                      checked={answers[`${currentTask.id}-${question.id}`] === option}
                      className="mr-2"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render task instructions or task content based on state
  const renderTaskContent = () => {
    if (!isTaskActive) {
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
            <div className="mt-4 flex items-center justify-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {currentTask.timeLimit} minutes
              </span>
              <span className="px-2 py-1 bg-gray-100 rounded-full">
                {currentTask.questions} questions
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
    }
    
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
        
        {renderTaskQuestions()}
        
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
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-assessment-blue">{assessment.title}</h1>
        <div className="flex items-center gap-2 mt-1">
          <Progress value={progressPercentage} className="h-2 flex-1" />
          <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
        </div>
        
        <div className="flex justify-between items-center mt-2 text-sm">
          <div>
            Section: {currentSectionIndex + 1}/{assessment.sections.length} - 
            Task: {currentTaskIndex + 1}/{currentSection.tasks.length}
          </div>
          <Button variant="ghost" size="sm" onClick={onExit}>
            Save & Exit
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          {renderTaskContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default FullAssessmentComponent;
