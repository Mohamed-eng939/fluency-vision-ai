import React, { useRef } from 'react';
import { AssessmentResult, AudioAnalysisResult, FullAssessment } from '@/types/assessment';
import QuickAssessmentReport from './QuickAssessmentReport';
import FullAssessmentReport from './FullAssessmentReport';
import ReportDownloadButton from './ReportDownloadButton';
import { usePdfGeneration } from '@/hooks/reports/usePdfGeneration';

interface ReportGeneratorProps {
  result: AssessmentResult;
  audioAnalysis?: AudioAnalysisResult;
  isFullAssessment?: boolean;
  fullAssessmentData?: FullAssessment;
  learnerName?: string;
  sessionId?: string;
  promptHistory?: { prompt: any; result?: AssessmentResult }[];
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  result,
  audioAnalysis,
  isFullAssessment = false,
  fullAssessmentData,
  learnerName = 'Anonymous Learner',
  sessionId = `S-${Date.now().toString(36)}`,
  promptHistory = []
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const dateOfTest = new Date().toLocaleDateString();

  const { isGeneratingPDF, handleDownloadReport } = usePdfGeneration({
    learnerName,
    sessionId,
    dateOfTest,
    isFullAssessment: isFullAssessment || false,
    promptHistory: promptHistory || []
  });

  const handleDownload = () => {
    handleDownloadReport(reportRef);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-assessment-blue">
            {isFullAssessment ? 'Full Assessment Report' : 'Quick Assessment Report'}
          </h2>
          <p className="text-muted-foreground">
            Comprehensive analysis for {learnerName}
          </p>
        </div>

        <div className="flex gap-3">
          <ReportDownloadButton
            onDownload={handleDownload}
            isGenerating={isGeneratingPDF}
            isFullAssessment={isFullAssessment}
          />
        </div>
      </div>

      <div ref={reportRef} className="bg-white p-6 rounded-lg shadow-md">
        {isFullAssessment ? (
          <FullAssessmentReport
            result={result}
            fullAssessmentData={fullAssessmentData}
            learnerName={learnerName}
            sessionId={sessionId}
            dateOfTest={dateOfTest}
            audioAnalysis={audioAnalysis}
          />
        ) : (
          <QuickAssessmentReport
            result={result}
            audioAnalysis={audioAnalysis}
            learnerName={learnerName}
            sessionId={sessionId}
            dateOfTest={dateOfTest}
          />
        )}
      </div>
    </div>
  );
};

export default ReportGenerator;
