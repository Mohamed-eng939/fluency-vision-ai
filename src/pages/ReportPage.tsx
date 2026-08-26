import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Award, MessageSquare } from 'lucide-react';
import { downloadReportPdf } from '@/utils/reports/reportPdf';
import { useToast } from '@/hooks/use-toast';
import { useBrandingContext } from '@/contexts/branding/BrandingContext';
import { supabase } from '@/integrations/supabase/client';
import ReportHeader from '@/components/reports/ReportHeader';
import ReportFooter from '@/components/reports/ReportFooter';

const getCEFRColor = (level: string) => {
  const colors: Record<string, string> = {
    'A1': 'bg-orange-500', 'A2': 'bg-amber-500', 'B1': 'bg-teal-500',
    'B2': 'bg-emerald-500', 'C1': 'bg-blue-600', 'C2': 'bg-purple-500',
  };
  return colors[level] || 'bg-muted';
};

const getCEFRBadgeColor = (level: string) => {
  const colors: Record<string, string> = {
    'A1': 'bg-orange-100 text-orange-800', 'A2': 'bg-amber-100 text-amber-800',
    'B1': 'bg-teal-100 text-teal-800', 'B2': 'bg-emerald-100 text-emerald-800',
    'C1': 'bg-blue-100 text-blue-800', 'C2': 'bg-purple-100 text-purple-800',
  };
  return colors[level] || 'bg-gray-100 text-gray-800';
};

const shortRef = (id: string) => (id || '').replace(/-/g, '').slice(0, 8).toUpperCase();

interface Criteria { grammar: string | null; fluency: string | null; vocabulary: string | null; }

interface ReportData {
  id: string;
  name: string;
  email: string;
  date: string;
  cefr: string;
  reviewStatus: string | null;
  feedback: string | null;
  recommendation: string | null;
  criteria: Criteria | null;
}

const ReportPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const brand = useBrandingContext();
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
          .select(`*, profiles:user_id (full_name, email)`)
          .eq('id', reportId)
          .single();

        if (sessionError || !session) {
          setError('Assessment not found');
          setIsLoading(false);
          return;
        }

        // Latest assessor review for this session (RLS: admin all, assessor own,
        // learner own via policy). Holds the human feedback + final grades.
        const { data: reviews } = await supabase
          .from('assessor_reviews')
          .select('review_status, assessor_feedback, recommendation, override_scores, created_at')
          .eq('session_id', reportId)
          .order('created_at', { ascending: false })
          .limit(1);
        const review = (reviews && reviews[0]) || null;
        const os = (review?.override_scores as any) || {};

        const profiles = session.profiles as { full_name?: string; email?: string } | null;
        const studentInfo = session.student_info as { name?: string; email?: string } | null;

        const criteria: Criteria | null =
          os.grammar_cefr || os.fluency_cefr || os.vocabulary_cefr
            ? { grammar: os.grammar_cefr ?? null, fluency: os.fluency_cefr ?? null, vocabulary: os.vocabulary_cefr ?? null }
            : null;

        setReport({
          id: session.id,
          name: profiles?.full_name || studentInfo?.name || 'Anonymous User',
          email: profiles?.email || studentInfo?.email || 'N/A',
          date: new Date(session.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
          }),
          cefr: session.overall_cefr_level || os.final_cefr_level || 'N/A',
          reviewStatus: review?.review_status ?? null,
          feedback: review?.assessor_feedback ?? null,
          recommendation: review?.recommendation ?? null,
          criteria,
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
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const reference = shortRef(report.id);

  const handleDownloadPDF = () => {
    try {
      downloadReportPdf(
        {
          name: report.name,
          email: report.email,
          date: report.date,
          reference,
          cefr: report.cefr,
          reviewStatus: report.reviewStatus,
          feedback: report.feedback,
          recommendation: report.recommendation,
          criteria: report.criteria,
          brandName: brand.displayName,
        },
        `assessment-report-${reference}.pdf`,
      );
      toast({ title: 'Report Downloaded', description: 'Assessment report saved as PDF.' });
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast({ title: 'Download Failed', description: 'There was a problem generating the PDF.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ReportHeader reportType="Assessment Report" onDownloadPDF={handleDownloadPDF} />

      <div className="container mx-auto py-8 px-6 max-w-4xl">
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
                <p className="text-xs text-muted-foreground">Reference</p>
                <p className="font-medium font-mono">{reference}</p>
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

        {/* Skill breakdown (only when the assessor graded per-criterion) */}
        {report.criteria && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Skill Breakdown</CardTitle>
              <CardDescription>Assessor's CEFR grade per criterion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {([['Grammar', report.criteria.grammar], ['Fluency', report.criteria.fluency], ['Vocabulary', report.criteria.vocabulary]] as const).map(([label, val]) => (
                  <div key={label} className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    {val ? <Badge className={getCEFRBadgeColor(val)}>{val}</Badge> : <span className="text-xs text-muted-foreground">—</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assessor Feedback (replaces the old response-by-response section) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" /> Assessor Feedback
            </CardTitle>
            <CardDescription>Comments and recommendation from the human reviewer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.reviewStatus && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Review status</p>
                <Badge variant="outline" className="capitalize">{report.reviewStatus.replace(/_/g, ' ')}</Badge>
              </div>
            )}
            {report.feedback ? (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Feedback</p>
                <p className="text-sm whitespace-pre-wrap">{report.feedback}</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Awaiting assessor review.</p>
            )}
            {report.recommendation && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Recommendation</p>
                <p className="text-sm whitespace-pre-wrap">{report.recommendation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <ReportFooter reportId={reference} />
      </div>
    </div>
  );
};

export default ReportPage;
