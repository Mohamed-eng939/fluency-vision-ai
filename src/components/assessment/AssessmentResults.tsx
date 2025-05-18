
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import EnhancedAssessmentReport from '@/components/EnhancedAssessmentReport';
import ReportGenerator from '@/components/reports/ReportGenerator';
import { AssessmentResult } from '@/types/assessment';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText } from 'lucide-react';

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
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="summary">Results Summary</TabsTrigger>
        <TabsTrigger value="report">
          <FileText className="h-4 w-4 mr-2" />
          Full Report
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="summary">
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
      </TabsContent>
      
      <TabsContent value="report">
        <ReportGenerator
          result={result}
          audioAnalysis={result.audioAnalysis}
          learnerName={result.learnerName || "Anonymous Learner"}
          sessionId={result.sessionId || `S-${Date.now().toString(36)}`}
        />
        
        <div className="mt-6 flex justify-center">
          <Button 
            onClick={onReset}
            variant="outline" 
            className="mr-4"
          >
            Take Another Assessment
          </Button>
          <Button 
            onClick={onTakeFullAssessment}
            className="bg-assessment-teal hover:bg-assessment-lightBlue text-white"
          >
            Take Full Assessment
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default AssessmentResults;
