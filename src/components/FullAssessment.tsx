import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { useToast } from './ui/use-toast';
import { 
  FullAssessment, 
  AssessmentResult 
} from '../types/assessment';
import { calculateRubricScore, generateAssessmentResult } from '../utils/scoring';
import StudentInfoForm from './assessment/StudentInfoForm';

// Import our new components
import AssessmentHeader from './assessment/AssessmentHeader';
import TaskInstructions from './assessment/TaskInstructions';
import ActiveTask from './assessment/ActiveTask';
import ReportGenerator from './reports/ReportGenerator';
import { Button } from './ui/button';

interface FullAssessmentProps {
  assessment: FullAssessment;
  onComplete: (result?: AssessmentResult) => void;
  onExit: () => void;
}

interface StudentInfo {
  name: string;
  email?: string;
  institution?: string;
  sessionId: string;
  countryCode: string;
  phoneNumber: string;
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
  const [taskResults, setTaskResults] = useState<Record<string, { score: number; criteriaScores: Record<string, number> }>>({});
  const [finalResult, setFinalResult] = useState<AssessmentResult | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const { toast } = useToast();
  
  const currentSection = assessment.sections[currentSectionIndex];
  const currentTask = currentSection?.tasks[currentTaskIndex];
  const questions = currentTask?.questionsList || [];
  
  const handleStudentInfoComplete = (info: StudentInfo) => {
    setStudentInfo(info);
  };
  
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
      const result = calculateFinalResult();
      setFinalResult(result);
      setShowReport(true);
      onComplete(result);
      return;
    }
    
    // Reset task state
    setIsTaskActive(false);
    setTimeRemaining(null);
  };
  
  // Calculate final assessment result
  const calculateFinalResult = () => {
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
    const basicResult = generateAssessmentResult(averageCriteriaScores, totalScore);
    
    // Add additional metadata for the report
    const fullResult = {
      ...basicResult,
      sessionId: studentInfo?.sessionId || `F-${Date.now().toString(36)}`,
      assessmentType: 'full' as const,
      assessmentName: assessment.description || "Full Assessment",
      learnerName: studentInfo?.name || "Anonymous Learner",
      dateOfTest: new Date().toLocaleDateString()
    };
    
    return fullResult as AssessmentResult;
  };
  
  // Calculate progress percentage
  const totalTasks = assessment.sections.reduce((acc, section) => acc + section.tasks.length, 0);
  const completedTasks = currentSectionIndex * currentSection.tasks.length + currentTaskIndex;
  const progressPercentage = (completedTasks / totalTasks) * 100;
  
  // Show student registration form if no student info
  if (!studentInfo) {
    return (
      <div className="w-full max-w-4xl mx-auto my-8">
        <StudentInfoForm 
          onComplete={handleStudentInfoComplete} 
          isFullAssessment={true}
        />
      </div>
    );
  }
  
  // Show the report view if assessment is complete
  if (showReport && finalResult) {
    return (
      <div className="w-full max-w-4xl mx-auto my-8">
        <h1 className="text-2xl font-bold mb-6">Assessment Complete</h1>
        <ReportGenerator 
          result={finalResult}
          isFullAssessment={true}
          fullAssessmentData={assessment}
          learnerName={finalResult.learnerName || "Anonymous Learner"}
          sessionId={finalResult.sessionId || `F-${Date.now().toString(36)}`}
        />
        <div className="flex justify-center mt-6">
          <Button onClick={onExit}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <AssessmentHeader 
        assessment={assessment}
        currentSectionIndex={currentSectionIndex}
        currentTaskIndex={currentTaskIndex}
        progressPercentage={progressPercentage}
        onExit={onExit}
      />
      
      <Card>
        <CardContent className="p-6">
          {!isTaskActive ? (
            <TaskInstructions 
              currentTask={currentTask} 
              startTask={startTask} 
            />
          ) : (
            <ActiveTask
              currentTask={currentTask}
              timeRemaining={timeRemaining}
              answers={answers}
              handleAnswer={handleAnswer}
              handleTaskComplete={handleTaskComplete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FullAssessmentComponent;
