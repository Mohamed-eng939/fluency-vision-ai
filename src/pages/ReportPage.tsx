
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
  
  // Prepare comprehensive scores for both assessment types
  const prepareScores = () => {
    if (isFullAssessment) {
      // For full assessments, ensure we have all skills including core skills + listening/reading/writing
      return {
        fluency: report.scores?.fluency || 65,
        grammar: report.scores?.grammar || 70,
        vocabulary: report.scores?.vocabulary || 68,
        pronunciation: report.scores?.pronunciation || 72,
        prosody: report.scores?.prosody || 66,
        coherence: report.scores?.coherence || 69,
        structure: report.scores?.structure || 67,
        listening: report.scores?.listening || report.scores?.Listening || 75,
        reading: report.scores?.reading || report.scores?.Reading || 78,
        writing: report.scores?.writing || report.scores?.Writing || 73,
        ...report.scores
      };
    } else {
      // For quick assessments, focus on speaking skills
      return {
        fluency: report.scores?.fluency || report.speakingSkills?.fluency || 65,
        grammar: report.scores?.grammar || report.speakingSkills?.grammar || 70,
        vocabulary: report.scores?.vocabulary || report.speakingSkills?.vocabulary || 68,
        pronunciation: report.scores?.pronunciation || report.speakingSkills?.pronunciation || 72,
        prosody: report.scores?.prosody || report.speakingSkills?.prosody || 66,
        coherence: report.scores?.coherence || report.speakingSkills?.coherence || 69,
        structure: report.scores?.structure || report.speakingSkills?.structure || 67,
        ...report.scores,
        ...report.speakingSkills
      };
    }
  };

  const normalizedScores = prepareScores();
  
  // Prepare chart data
  const skillChartData = Object.entries(normalizedScores).map(([skill, score]) => ({
    skill: skill.charAt(0).toUpperCase() + skill.slice(1),
    score: typeof score === 'number' ? (score > 10 ? score : score * 10) : 0
  }));

  const radarChartData = skillChartData.map(item => ({
    ...item,
    fullMark: 100
  }));

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
        
        <SkillsBreakdown scores={normalizedScores} isFullAssessment={isFullAssessment} />

        <ReportCharts 
          skillChartData={skillChartData}
          radarChartData={radarChartData}
          isFullAssessment={isFullAssessment}
        />

        {isFullAssessment ? (
          <FeedbackSection feedback={report.feedback} />
        ) : (
          <EnhancedFeedbackSection 
            scores={normalizedScores}
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
