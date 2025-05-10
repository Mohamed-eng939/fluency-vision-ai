
import React from 'react';
import AssessmentReport from './AssessmentReport';
import DetailedFeedback from './DetailedFeedback';
import { AssessmentResult } from '../types/assessment';
import { Card, CardContent } from './ui/card';

interface EnhancedAssessmentReportProps {
  result: AssessmentResult;
  isLoading?: boolean;
  detailedFeedback?: Record<string, string> | null;
}

const EnhancedAssessmentReport: React.FC<EnhancedAssessmentReportProps> = ({
  result,
  isLoading,
  detailedFeedback
}) => {
  return (
    <div className="space-y-6">
      <AssessmentReport result={result} isLoading={isLoading} />
      
      {detailedFeedback && (
        <Card>
          <CardContent className="p-6">
            <DetailedFeedback result={result} detailedFeedback={detailedFeedback} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedAssessmentReport;
