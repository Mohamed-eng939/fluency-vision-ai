
import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { generateReportPdf } from '@/utils/reports/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
import { reportData } from '@/data/reportData';
import ReportHeader from '@/components/reports/ReportHeader';
import ReportInfo from '@/components/reports/ReportInfo';
import SkillsBreakdown from '@/components/reports/SkillsBreakdown';
import ReportCharts from '@/components/reports/ReportCharts';
import EnhancedFeedbackSection from '@/components/reports/EnhancedFeedbackSection';
import FeedbackSection from '@/components/reports/FeedbackSection';
import ReportFooter from '@/components/reports/ReportFooter';

const ReportPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const report = reportId ? reportData[reportId] : null;

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Report Not Found</CardTitle>
            <CardDescription>The requested assessment report could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine if this is a full assessment based on the data structure
  const isFullAssessment = report.assessmentType === 'full' || report.overallCefr;
  
  // Use the scores directly from the report data
  const reportScores = report.scores || {};

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      const reportType = isFullAssessment ? 'full' : 'quick';
      await generateReportPdf(reportRef.current, {
        fileName: `${reportType}-assessment-report-${report.id}-${report.name.replace(/\s+/g, '-')}.pdf`,
        learnerName: report.name,
        sessionId: report.id,
        dateOfTest: report.date,
      });
      
      toast({
        title: 'Report Downloaded',
        description: 'Assessment report has been downloaded successfully.',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Download Failed',
        description: 'There was a problem generating the PDF. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const reportType = isFullAssessment ? 'Full Assessment Report' : 'Quick Assessment Report';

  return (
    <div className="min-h-screen bg-gray-50">
      <ReportHeader 
        reportType={reportType}
        onDownloadPDF={handleDownloadPDF}
      />

      <div ref={reportRef} className="container mx-auto py-8 px-6 max-w-4xl">
        <ReportInfo report={report} />
        
        <SkillsBreakdown scores={reportScores} isFullAssessment={isFullAssessment} />

        <ReportCharts 
          scores={reportScores}
          isFullAssessment={isFullAssessment}
        />

        {isFullAssessment ? (
          <FeedbackSection feedback={report.feedback?.overall || 'No overall feedback available.'} />
        ) : (
          <EnhancedFeedbackSection 
            scores={reportScores}
            cefrLevel={report.cefr}
            name={report.name}
          />
        )}

        <ReportFooter reportId={report.id} />
      </div>
    </div>
  );
};

export default ReportPage;
