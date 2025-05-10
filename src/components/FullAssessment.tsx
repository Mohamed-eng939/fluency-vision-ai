
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { CheckCircle, ArrowRight, Clock, Book, Mic, MicOff } from 'lucide-react';
import { 
  FullAssessment, 
  TestTask, 
  AssessmentQuestion, 
  QuestionType,
  AssessmentResult 
} from '../types/assessment';
import { calculateRubricScore, generateAssessmentResult } from '../utils/scoringUtils';
import { useToast } from '../components/ui/use-toast';

interface FullAssessmentProps {
  assessment: FullAssessment;
  onComplete: (result?: AssessmentResult) => void;
  onExit: () => void;
}

const FullAssessmentComponent: React.FC<FullAssessmentProps> = ({ 
  assessment, 
  onComplete, 
  onExit 
}) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTaskActive, setIsTaskActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [taskResults, setTaskResults] = useState<Record<string, { score: number; criteriaScores: Record<string, number> }>>({});
  const { toast } = useToast();
  
  const currentSection = assessment.sections[currentSectionIndex];
  const currentTask = currentSection?.tasks[currentTaskIndex];
  const questions = currentTask?.questionsList || [];
  
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
    // Calculate scores based on rubrics
    const taskAnswers: Record<string, any> = {};
    const taskQuestionsWithIds = questions.map(q => ({ ...q, id: `${currentTask.id}-${q.id}` }));
    
    // Extract answers for current task
    Object.keys(answers).forEach(key => {
      if (key.startsWith(`${currentTask.id}-`)) {
        const questionId = key.replace(`${currentTask.id}-`, '');
        taskAnswers[questionId] = answers[key];
      }
    });
    
    // Calculate scores if there are questions
    if (questions.length > 0) {
      const result = calculateRubricScore(taskAnswers, questions);
      
      // Store the result
      setTaskResults(prev => ({
        ...prev,
        [currentTask.id]: result
      }));
      
      // Show score in toast
      toast({
        title: "Task Completed",
        description: `Score: ${Math.round(result.score)}%`,
      });
    }
    
    // Move to the next task or section
    if (currentTaskIndex < currentSection.tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    } else if (currentSectionIndex < assessment.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentTaskIndex(0);
    } else {
      // Assessment complete - calculate final result
      const finalResult = calculateFinalResult();
      onComplete(finalResult);
      return;
    }
    
    // Reset task state
    setIsTaskActive(false);
    setTimeRemaining(null);
    setAudioBlob(null);
  };
  
  // Calculate final assessment result
  const calculateFinalResult = (): AssessmentResult => {
    // Aggregate all criteria scores
    const allCriteriaScores: Record<string, number[]> = {};
    let totalScoreSum = 0;
    let totalTasksWithScores = 0;
    
    // Collect all scores
    Object.values(taskResults).forEach(result => {
      totalScoreSum += result.score;
      totalTasksWithScores++;
      
      // Collect criteria scores
      Object.entries(result.criteriaScores).forEach(([criterion, score]) => {
        if (!allCriteriaScores[criterion]) {
          allCriteriaScores[criterion] = [];
        }
        allCriteriaScores[criterion].push(score);
      });
    });
    
    // Calculate average score
    const totalScore = totalTasksWithScores > 0 
      ? Math.round(totalScoreSum / totalTasksWithScores)
      : 0;
    
    // Calculate average for each criterion
    const averageCriteriaScores: Record<string, number> = {};
    Object.entries(allCriteriaScores).forEach(([criterion, scores]) => {
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      averageCriteriaScores[criterion] = average;
    });
    
    // Generate final assessment result
    return generateAssessmentResult(averageCriteriaScores, totalScore);
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
  
  // Start audio recording for speaking tasks
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];
      
      recorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Render questions based on their type
  const renderQuestion = (question: AssessmentQuestion) => {
    switch(question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
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
        );
        
      case 'matching':
        return (
          <div className="space-y-4">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="font-medium">{option}</span>
                <select
                  className="border rounded p-2 flex-1"
                  onChange={(e) => {
                    const currentAnswers = answers[`${currentTask.id}-${question.id}`] || {};
                    handleAnswer(question.id, {
                      ...currentAnswers,
                      [option]: e.target.value
                    });
                  }}
                  value={
                    (answers[`${currentTask.id}-${question.id}`] || {})[option] || ""
                  }
                >
                  <option value="">Select a match</option>
                  {question.options?.map((matchOption, i) => (
                    <option key={i} value={matchOption}>{matchOption}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        );
        
      case 'gap-fill':
        // Simple implementation - in a real app, this would be more sophisticated
        return (
          <div className="p-4 border rounded-lg">
            <textarea
              className="w-full p-3 border rounded"
              rows={5}
              placeholder="Fill in the blanks..."
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              value={answers[`${currentTask.id}-${question.id}`] || ""}
            />
          </div>
        );
        
      case 'short-answer':
        return (
          <div className="p-4 border rounded-lg">
            <textarea
              className="w-full p-3 border rounded"
              rows={3}
              placeholder="Type your answer..."
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              value={answers[`${currentTask.id}-${question.id}`] || ""}
            />
          </div>
        );
        
      case 'paragraph-writing':
      case 'essay-writing':
      case 'long-answer':
        return (
          <div className="p-4 border rounded-lg">
            <Textarea
              className="w-full min-h-[150px]"
              placeholder="Write your response..."
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              value={answers[`${currentTask.id}-${question.id}`] || ""}
            />
          </div>
        );
        
      case 'image-selection':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {question.options?.map((option, index) => (
              <div 
                key={index}
                className={`p-2 border rounded-lg cursor-pointer ${
                  answers[`${currentTask.id}-${question.id}`] === option 
                    ? 'border-assessment-teal bg-assessment-teal/10' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleAnswer(question.id, option)}
              >
                <img 
                  src={`/images/${option}`} 
                  alt={`Option ${index + 1}`}
                  className="w-full h-32 object-contain mb-2"
                />
                <div className="text-center text-sm">{option}</div>
              </div>
            ))}
          </div>
        );
        
      case 'audio-recording':
        return (
          <div className="p-6 border rounded-lg text-center">
            {!audioBlob ? (
              <div className="space-y-4">
                <div className="text-lg font-medium">Record your response</div>
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={isRecording ? "bg-red-500 hover:bg-red-600" : "bg-assessment-teal hover:bg-assessment-lightBlue"}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4 mr-2" /> Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" /> Start Recording
                    </>
                  )}
                </Button>
                {isRecording && (
                  <div className="text-sm text-red-500 animate-pulse">
                    Recording in progress...
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-lg font-medium text-assessment-teal">Recording complete</div>
                <audio controls className="w-full">
                  <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
                <Button
                  onClick={() => {
                    setAudioBlob(null);
                    handleAnswer(question.id, null);
                  }}
                  variant="outline"
                >
                  Delete & Re-record
                </Button>
              </div>
            )}
          </div>
        );
        
      case 'heading-matching':
      case 'note-completion':
      case 'summary-completion':
        // For simplicity, these are implemented similar to gap-fill
        return (
          <div className="p-4 border rounded-lg">
            <textarea
              className="w-full p-3 border rounded"
              rows={5}
              placeholder={`Complete the ${question.type.replace('-', ' ')}...`}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              value={answers[`${currentTask.id}-${question.id}`] || ""}
            />
          </div>
        );
        
      default:
        return (
          <div className="p-4 border border-red-300 rounded-lg bg-red-50 text-red-700">
            Question type '{question.type}' not supported yet
          </div>
        );
    }
  };

  // Render questions for the current task
  const renderTaskQuestions = () => {
    if (!questions.length) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-500">
            No questions available for this task.
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {questions.map((question) => (
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
            
            {renderQuestion(question)}
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
                {questions.length || currentTask.questions} questions
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
