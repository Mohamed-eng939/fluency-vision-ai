
import React from 'react';
import { Button } from '@/components/ui/button';
import EnhancedAssessmentReport from '@/components/EnhancedAssessmentReport';
import { AssessmentResult } from '@/types/assessment';

interface AssessmentResultsProps {
  result: AssessmentResult;
  isProcessing: boolean;
  detailedFeedback: Record<string, string> | null;
  onReset: () => void;
  onTakeFullAssessment: () => void;
}

const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  result,
  isProcessing,
  detailedFeedback,
  onReset,
  onTakeFullAssessment
}) => {
  return (
    <>
      <EnhancedAssessmentReport 
        result={result}
        isLoading={isProcessing} 
        detailedFeedback={detailedFeedback}
      />
      
      <div className="mt-6 flex justify-center">
        <Button 
          onClick={onReset}
          variant="outline" 
          className="mr-4"
        >
          Take Another Quick Assessment
        </Button>
        <Button 
          onClick={onTakeFullAssessment}
          className="bg-assessment-teal hover:bg-assessment-lightBlue text-white"
        >
          Take Full Assessment
        </Button>
      </div>
    </>
  );
};

export default AssessmentResults;
