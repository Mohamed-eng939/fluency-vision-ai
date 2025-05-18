
import React, { useEffect, useRef } from 'react';
import { AssessmentResult, AudioAnalysisResult, FullAssessment } from '@/types/assessment';
import QuickAssessmentReport from './QuickAssessmentReport';
import FullAssessmentReport from './FullAssessmentReport';
import { generateReportPdf } from '@/utils/reports/pdfGenerator';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportGeneratorProps {
  result: AssessmentResult;
  audioAnalysis?: AudioAnalysisResult;
  isFullAssessment?: boolean;
  fullAssessmentData?: FullAssessment;
  learnerName?: string;
  sessionId?: string;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  result,
  audioAnalysis,
  isFullAssessment = false,
  fullAssessmentData,
  learnerName = 'Anonymous Learner',
  sessionId = `S-${Date.now().toString(36)}`
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const dateOfTest = new Date().toLocaleDateString();

  const handleDownloadReport = async () => {
    if (!reportRef.current) return;
    
    try {
      const reportType = isFullAssessment ? 'full' : 'quick';
      await generateReportPdf(reportRef.current, {
        fileName: `${reportType}-assessment-report-${sessionId}.pdf`,
        learnerName,
        sessionId,
        dateOfTest,
      });
      
      toast({
        title: 'Report Downloaded',
        description: 'Your assessment report has been downloaded successfully.',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Download Failed',
        description: 'There was a problem generating your report. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-assessment-blue">
          {isFullAssessment ? 'Full Assessment Report' : 'Quick Assessment Report'}
        </h2>
        <Button 
          onClick={handleDownloadReport} 
          className="bg-assessment-teal hover:bg-assessment-lightBlue"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
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
