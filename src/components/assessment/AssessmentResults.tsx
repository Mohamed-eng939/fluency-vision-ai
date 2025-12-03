import React from 'react';
import SimplifiedAssessmentResults from './SimplifiedAssessmentResults';
import { AssessmentResult } from '@/types/assessment';

interface AssessmentResultsProps {
  result: AssessmentResult;
  isProcessing: boolean;
  detailedFeedback: Record<string, string> | null;
  promptHistory?: { prompt: any; result?: AssessmentResult }[];
  onReset: () => void;
  onTakeFullAssessment: () => void;
}

const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  result,
  isProcessing,
  onReset,
  onTakeFullAssessment
}) => {
  return (
    <SimplifiedAssessmentResults
      result={result}
      isProcessing={isProcessing}
      onReset={onReset}
      onTakeFullAssessment={onTakeFullAssessment}
    />
  );
};

export default AssessmentResults;
