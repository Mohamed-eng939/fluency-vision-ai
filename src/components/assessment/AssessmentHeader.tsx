
import React from 'react';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { FullAssessment } from '../../types/assessment';

interface AssessmentHeaderProps {
  assessment: FullAssessment;
  currentSectionIndex: number;
  currentTaskIndex: number;
  progressPercentage: number;
  onExit: () => void;
}

const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({
  assessment,
  currentSectionIndex,
  currentTaskIndex,
  progressPercentage,
  onExit
}) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-assessment-blue">{assessment.title}</h1>
      <div className="flex items-center gap-2 mt-1">
        <Progress value={progressPercentage} className="h-2 flex-1" />
        <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
      </div>
      
      <div className="flex justify-between items-center mt-2 text-sm">
        <div>
          Section: {currentSectionIndex + 1}/{assessment.sections.length} - 
          Task: {currentTaskIndex + 1}/{assessment.sections[currentSectionIndex].tasks.length}
        </div>
        <Button variant="ghost" size="sm" onClick={onExit}>
          Save & Exit
        </Button>
      </div>
    </div>
  );
};

export default AssessmentHeader;
