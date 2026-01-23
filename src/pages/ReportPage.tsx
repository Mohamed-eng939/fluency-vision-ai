import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { generateReportPdf } from '@/utils/reports/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ReportHeader from '@/components/reports/ReportHeader';
import ReportInfo from '@/components/reports/ReportInfo';
import SkillsBreakdown from '@/components/reports/SkillsBreakdown';
import ReportCharts from '@/components/reports/ReportCharts';
import EnhancedFeedbackSection from '@/components/reports/EnhancedFeedbackSection';
import FeedbackSection from '@/components/reports/FeedbackSection';
import ReportFooter from '@/components/reports/ReportFooter';

interface AssessmentReport {
  id: string;
  name: string;
  email: string;
  date: string;
  assessmentType: 'quick' | 'full';
  scores: {
    overall?: number;
    fluency?: number;
    grammar?: number;
    pronunciation?: number;
    vocabulary?: number;
    coherence?: number;
  };
  cefr: string;
  overallCefr?: string;
  feedback?: {
    overall?: string;
  };
}

const ReportPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [report, setReport] = useState<AssessmentReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) {
        setError('No report ID provided');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching report for session ID:', reportId);

        // Fetch assessment session data
        const { data: session, error: sessionError } = await supabase
          .from('assessment_sessions')
          .select(`
            *,
            profiles:user_id (
              full_name,
              email
            ),
            assessment_responses (
              *
            )
          `)
          .eq('id', reportId)
          .single();

        if (sessionError) {
          console.error('Error fetching session:', sessionError);
          setError('Assessment not found');
          setIsLoading(false);
          return;
        }

        if (!session) {
          setError('Assessment not found');
          setIsLoading(false);
          return;
        }

        // Convert database session to report format
        const profiles = session.profiles as { full_name?: string; email?: string } | null;
        const studentInfo = session.student_info as { name?: string; email?: string } | null;
        const metadata = session.metadata as { feedback?: string } | null;
        
        const reportData: AssessmentReport = {
          id: session.id,
          name: profiles?.full_name || studentInfo?.name || 'Anonymous User',
          email: profiles?.email || studentInfo?.email || 'N/A',
          date: new Date(session.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          assessmentType: session.session_type === 'quick_assessment' ? 'quick' : 'full',
          scores: {
            overall: session.overall_score || 0,
            fluency: session.fluency_score || undefined,
            grammar: session.grammar_score || undefined,
            pronunciation: session.pronunciation_score || undefined,
            vocabulary: session.vocabulary_score || undefined,
            coherence: session.coherence_score || undefined,
          },
          cefr: session.overall_cefr_level || 'N/A',
          overallCefr: session.overall_cefr_level,
          feedback: {
            overall: metadata?.feedback || 'Assessment completed successfully. Detailed feedback will be provided by your instructor.'
          }
        };

        setReport(reportData);
      } catch (error) {
        console.error('Error fetching report:', error);
        setError('Failed to load assessment report');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading report...</span>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Report Not Found</CardTitle>
            <CardDescription>{error || 'The requested assessment report could not be found.'}</CardDescription>
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
  const isFullAssessment = report.assessmentType === 'full' || !!report.overallCefr;
  
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