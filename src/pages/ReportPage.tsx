import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Languages, Mic, BookOpen, Award } from 'lucide-react';
import { generateReportPdf } from '@/utils/reports/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ReportHeader from '@/components/reports/ReportHeader';
import ReportFooter from '@/components/reports/ReportFooter';

const getCEFRColor = (level: string) => {
  const colors: Record<string, string> = {
    'A1': 'bg-orange-500',
    'A2': 'bg-amber-500',
    'B1': 'bg-teal-500',
    'B2': 'bg-emerald-500',
    'C1': 'bg-blue-600',
    'C2': 'bg-purple-500'
  };
  return colors[level] || 'bg-muted';
};

const getCEFRBadgeColor = (level: string) => {
  const colors: Record<string, string> = {
    'A1': 'bg-orange-100 text-orange-800',
    'A2': 'bg-amber-100 text-amber-800',
    'B1': 'bg-teal-100 text-teal-800',
    'B2': 'bg-emerald-100 text-emerald-800',
    'C1': 'bg-blue-100 text-blue-800',
    'C2': 'bg-purple-100 text-purple-800'
  };
  return colors[level] || 'bg-gray-100 text-gray-800';
};

interface ReportData {
  id: string;
  name: string;
  email: string;
  date: string;
  cefr: string;
  responses: any[];
}

const ReportPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [report, setReport] = useState<ReportData | null>(null);
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
        const { data: session, error: sessionError } = await supabase
          .from('assessment_sessions')
          .select(`
            *,
            profiles:user_id (full_name, email),
            assessment_responses (*)
          `)
          .eq('id', reportId)
          .single();

        if (sessionError || !session) {
          setError('Assessment not found');
          setIsLoading(false);
          return;
        }

        const profiles = session.profiles as { full_name?: string; email?: string } | null;
        const studentInfo = session.student_info as { name?: string; email?: string } | null;

        setReport({
          id: session.id,
          name: profiles?.full_name || studentInfo?.name || 'Anonymous User',
          email: profiles?.email || studentInfo?.email || 'N/A',
          date: new Date(session.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          }),
          cefr: session.overall_cefr_level || 'N/A',
          responses: (session.assessment_responses as any[]) || [],
        });
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Failed to load assessment report');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading report...</span>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive">Report Not Found</CardTitle>
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

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      await generateReportPdf(reportRef.current, {
        fileName: `assessment-report-${report.id}-${report.name.replace(/\s+/g, '-')}.pdf`,
        learnerName: report.name,
        sessionId: report.id,
        dateOfTest: report.date,
      });
      toast({ title: 'Report Downloaded', description: 'Assessment report has been downloaded successfully.' });
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast({ title: 'Download Failed', description: 'There was a problem generating the PDF.', variant: 'destructive' });
    }
  };

  /** Extract per-response scoring from stored JSON fields */
  const getResponseScoringData = (response: any) => {
    const feedback = response.detailed_feedback || {};
    const analysis = response.mistakes_analysis || {};
    
    const grammarApi = analysis.grammarApiAnalysis || feedback.grammarApiAnalysis;
    const grammarCefr = grammarApi?.apiUsed ? grammarApi.cefr : null;
    const grammarScores = grammarApi?.apiUsed ? grammarApi.scores : null;
    
    const fluencyApi = analysis.fluencyApiAnalysis || feedback.fluencyApiAnalysis;
    const fluencyCefr = fluencyApi?.apiUsed ? fluencyApi.cefr : null;
    const fluencySpm = fluencyApi?.apiUsed ? fluencyApi.spm : null;
    const fluencySyllables = fluencyApi?.apiUsed ? fluencyApi.syllables : null;
    
    const vocabCefr = analysis.cefrVocabularyLevel || feedback.cefrVocabularyLevel || null;
    
    return { grammarCefr, grammarScores, fluencyCefr, fluencySpm, fluencySyllables, vocabCefr };
  };

  return (
    <div className="min-h-screen bg-background">
      <ReportHeader 
        reportType="Assessment Report"
        onDownloadPDF={handleDownloadPDF}
      />

      <div ref={reportRef} className="container mx-auto py-8 px-6 max-w-4xl">
        {/* Candidate Info */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium">{report.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{report.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium">{report.date}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Session ID</p>
                <p className="font-medium text-xs">{report.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall CEFR */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground mb-2">Overall CEFR Level</p>
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getCEFRColor(report.cefr)} text-white mb-3`}>
                <span className="text-3xl font-bold">{report.cefr}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Based on Grammar, Fluency, and Vocabulary scoring engines
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Per-Response Breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Response-by-Response Analysis</CardTitle>
            <CardDescription>Detailed scoring from each assessment response</CardDescription>
          </CardHeader>
          <CardContent>
            {report.responses.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No responses recorded</p>
            ) : (
              <div className="space-y-4">
                {report.responses
                  .sort((a: any, b: any) => a.prompt_order - b.prompt_order)
                  .map((response: any, index: number) => {
                    const scoring = getResponseScoringData(response);
                    return (
                      <div key={response.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium">Response {index + 1}</span>
                          {response.cefr_level && (
                            <Badge className={getCEFRBadgeColor(response.cefr_level)}>
                              {response.cefr_level}
                            </Badge>
                          )}
                        </div>

                        {response.transcript && (
                          <div className="bg-muted/50 p-3 rounded-lg mb-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Transcript</p>
                            <p className="text-sm">{response.transcript}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-3 rounded-lg bg-muted/30">
                            <Languages className="h-4 w-4 mx-auto mb-1 text-primary" />
                            <p className="text-xs text-muted-foreground">Grammar</p>
                            {scoring.grammarCefr ? (
                              <Badge className={`mt-1 ${getCEFRBadgeColor(scoring.grammarCefr)}`}>
                                {scoring.grammarCefr}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">N/A</span>
                            )}
                          </div>
                          <div className="text-center p-3 rounded-lg bg-muted/30">
                            <Mic className="h-4 w-4 mx-auto mb-1 text-primary" />
                            <p className="text-xs text-muted-foreground">Fluency</p>
                            {scoring.fluencyCefr ? (
                              <>
                                <Badge className={`mt-1 ${getCEFRBadgeColor(scoring.fluencyCefr)}`}>
                                  {scoring.fluencyCefr}
                                </Badge>
                                {scoring.fluencySpm && (
                                  <p className="text-xs text-muted-foreground mt-1">{scoring.fluencySpm} SPM</p>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">N/A</span>
                            )}
                          </div>
                          <div className="text-center p-3 rounded-lg bg-muted/30">
                            <BookOpen className="h-4 w-4 mx-auto mb-1 text-primary" />
                            <p className="text-xs text-muted-foreground">Vocabulary</p>
                            {scoring.vocabCefr ? (
                              <Badge className={`mt-1 ${getCEFRBadgeColor(scoring.vocabCefr)}`}>
                                {scoring.vocabCefr}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">N/A</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        <ReportFooter reportId={report.id} />
      </div>
    </div>
  );
};

export default ReportPage;
