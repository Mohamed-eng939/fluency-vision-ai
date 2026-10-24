import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Star, AudioLines, FileText, User, AlertCircle, CheckCircle, Languages, Mic, BookOpen, GraduationCap, Eye, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cefrToNumber, numberToCefr, type CEFRLevel } from '@/utils/scoring/cefrUtils';
import { useAuth } from '@/contexts/auth';
import { trackLabel, type Track } from '@/data/assessment/tracks';
import {
  PROGRAMS,
  programConfig,
  levelsFor,
  getLevel,
  type Track as ProgramTrack,
} from '@/data/programLevels';
import PerformanceReport from '@/components/reports/PerformanceReport';
import {
  assembleReport,
  headerDefaultsFromSession,
  studentStatedNeed,
  formatReportDate,
  programHasReport,
  type ReportHeader,
} from '@/data/report';

interface AssessmentDetails {
  session: any;
  responses: any[];
}

interface AssessmentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentDetails: AssessmentDetails | null;
  onReviewSubmitted: () => void;
}

const getCEFRColor = (level: string) => {
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

const AssessmentReviewModal: React.FC<AssessmentReviewModalProps> = ({
  isOpen,
  onClose,
  assessmentDetails,
  onReviewSubmitted
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected' | 'needs_revision'>('approved');
  const [assessorFeedback, setAssessorFeedback] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [responseReviews, setResponseReviews] = useState<Record<string, {
    cefr_level: string;
    notes: string;
    grammar_cefr: string;
    fluency_cefr: string;
    vocabulary_cefr: string;
  }>>({});
  const [finalCEFRLevel, setFinalCEFRLevel] = useState<string>('');
  const [finalCEFRReason, setFinalCEFRReason] = useState('');
  const [calculatedCEFR, setCalculatedCEFR] = useState<string>('');
  // Assessor's top-level grades for the three criteria (editable).
  const [criteria, setCriteria] = useState<{ grammar: string; fluency: string; vocabulary: string }>({
    grammar: '', fluency: '', vocabulary: '',
  });

  // ── Performance report (Upedia program placement) ──────────────────────────
  const [program, setProgram] = useState<string>('');
  const [subtrack, setSubtrack] = useState<ProgramTrack | ''>('');
  const [levelCode, setLevelCode] = useState<string>('');
  const [goals, setGoals] = useState('');
  const [otherPrograms, setOtherPrograms] = useState('');
  const [recommendTrack, setRecommendTrack] = useState(false);
  const [header, setHeader] = useState<ReportHeader>({
    date: formatReportDate(), name: '', age: '', nationality: '', residency: '', occupation: '', track: '',
  });
  const [showPreview, setShowPreview] = useState(false);

  // On-demand "AI rubric read" (second opinion) per response, from rubric-rater.
  const [aiReads, setAiReads] = useState<Record<string, { loading: boolean; data?: any; error?: string }>>({});

  const pConfig = program ? programConfig(program) : null;
  const levelOptions = program ? levelsFor(program, subtrack || null) : [];
  const selectedLevel = program && levelCode ? getLevel(program, levelCode, subtrack || null) : null;
  const autoBand = selectedLevel?.cefr_band || '';

  // Seed the criteria dropdowns from the session's level when a test opens.
  useEffect(() => {
    const lvl = assessmentDetails?.session?.overall_cefr_level;
    if (lvl) {
      setCriteria((c) => ({
        grammar: c.grammar || lvl,
        fluency: c.fluency || lvl,
        vocabulary: c.vocabulary || lvl,
      }));
    }
  }, [assessmentDetails]);

  // Seed the report header + goals from the student's form/account, and suggest
  // a program from their age-track (tester can change any of it).
  useEffect(() => {
    const session = assessmentDetails?.session;
    if (!session) return;
    const defs = headerDefaultsFromSession(session);
    setHeader((prev) => ({
      date: prev.date || defs.date || formatReportDate(),
      name: prev.name || defs.name || '',
      age: prev.age || defs.age || '',
      nationality: prev.nationality || defs.nationality || '',
      residency: prev.residency || defs.residency || '',
      occupation: prev.occupation || defs.occupation || '',
      track: prev.track || '',
    }));
    const need = studentStatedNeed(session);
    if (need) setGoals((g) => g || need);
    // Pre-select a program from the age-track (adults→General English).
    const trk = session.student_info?.track;
    const guess = trk === 'kids' ? 'Kids' : trk === 'teens' ? 'Teens' : trk === 'adults' ? 'General English' : '';
    if (guess) {
      setProgram((p) => p || guess);
      const cfg = programConfig(guess);
      if (cfg && cfg.tracks.length === 1) setSubtrack((s) => s || (cfg.tracks[0] as ProgramTrack));
    }
  }, [assessmentDetails]);

  useEffect(() => {
    const reviewedLevels = Object.values(responseReviews)
      .map(r => r.cefr_level)
      .filter(Boolean);
    
    if (reviewedLevels.length > 0) {
      const numericLevels = reviewedLevels.map(level => cefrToNumber(level as CEFRLevel));
      const average = numericLevels.reduce((a, b) => a + b, 0) / numericLevels.length;
      const calculatedLevel = numberToCefr(average);
      setCalculatedCEFR(calculatedLevel);
      
      if (!finalCEFRLevel) {
        setFinalCEFRLevel(calculatedLevel);
      }
    } else if (assessmentDetails?.session?.overall_cefr_level && !finalCEFRLevel) {
      setFinalCEFRLevel(assessmentDetails.session.overall_cefr_level);
    }
  }, [responseReviews, finalCEFRLevel, assessmentDetails]);

  const handleSubmitReview = async () => {
    if (!assessmentDetails?.session?.id) {
      toast.error('No assessment selected');
      return;
    }

    if (!assessorFeedback.trim()) {
      toast.error('Please provide feedback');
      return;
    }

    if (!program) {
      toast.error('Please choose the Upedia program for this placement');
      return;
    }
    if (pConfig?.hasLevels && !levelCode) {
      toast.error(`Please choose the ${program} level`);
      return;
    }

    try {
      setIsSubmitting(true);

      const responseUpdatePromises = Object.entries(responseReviews).map(([responseId, review]) => {
        const updateData: any = {};
        
        if (review.cefr_level) {
          updateData.cefr_level = review.cefr_level;
        }

        // Persist the assessor's per-criterion CEFR grades + notes into the
        // response's detailed_feedback — these are the human labels per criterion.
        const existingFeedback = assessmentDetails.responses.find((r: any) => r.id === responseId)?.detailed_feedback || {};
        const assessorGrades: any = {};
        if (review.grammar_cefr) assessorGrades.assessor_grammar_cefr = review.grammar_cefr;
        if (review.fluency_cefr) assessorGrades.assessor_fluency_cefr = review.fluency_cefr;
        if (review.vocabulary_cefr) assessorGrades.assessor_vocabulary_cefr = review.vocabulary_cefr;
        if (review.notes) assessorGrades.assessor_notes = review.notes;
        if (Object.keys(assessorGrades).length > 0) {
          updateData.detailed_feedback = { ...existingFeedback, ...assessorGrades };
        }

        if (Object.keys(updateData).length > 0) {
          return supabase
            .from('assessment_responses')
            .update(updateData)
            .eq('id', responseId);
        }
        return null;
      }).filter(Boolean);

      if (responseUpdatePromises.length > 0) {
        await Promise.all(responseUpdatePromises);
      }

      const isOverridden = finalCEFRLevel !== calculatedCEFR;

      // Assemble the student-facing performance report (snapshotting the level
      // content). Programs without a ladder (Business / IELTS Prep) still record
      // the placement; their report is header-only.
      const recommendNote =
        recommendTrack && suggestedTrack
          ? `Recommended track change: this student scored above the ${trackLabel(studentTrack!)} ceiling — consider the ${trackLabel(suggestedTrack)} track.`
          : null;
      const reportPayload = assembleReport({
        program,
        subtrack: subtrack || null,
        levelCode,
        header: { ...header, track: subtrack || header.track || '' },
        goals,
        feedback: assessorFeedback,
        otherPrograms,
        recommendTrackChange: recommendNote,
        criteria,
        overallCefr: finalCEFRLevel,
      });

      const reviewData: any = {
        session_id: assessmentDetails.session.id,
        review_status: reviewStatus,
        assessor_feedback: assessorFeedback,
        recommendation: recommendation,
        report: reportPayload,
        override_scores: {
          final_cefr_level: finalCEFRLevel,
          calculated_average: calculatedCEFR,
          is_overridden: isOverridden,
          override_reason: isOverridden ? finalCEFRReason : null,
          grammar_cefr: criteria.grammar || null,
          fluency_cefr: criteria.fluency || null,
          vocabulary_cefr: criteria.vocabulary || null
        }
      };

      if (user?.id) {
        reviewData.assessor_id = user.id;
      }

      const { error } = await supabase
        .from('assessor_reviews')
        .insert(reviewData);

      if (error) throw error;

      const { error: updateError } = await supabase
        .from('assessment_sessions')
        .update({
          status: reviewStatus as 'approved' | 'rejected' | 'under_review',
          reviewed_at: new Date().toISOString(),
          overall_cefr_level: finalCEFRLevel as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2',
          program,
          program_subtrack: subtrack || null,
          upedia_level: levelCode || null,
          has_score_override: isOverridden,
        })
        .eq('id', assessmentDetails.session.id);

      if (updateError) {
        console.error('❌ Failed to update session status:', updateError);
        toast.error('Failed to update session status');
        throw updateError;
      }

      // Write training_data — one row per response, capturing the human-vs-system
      // CEFR comparison that is the core training signal for the ML flywheel.
      // Failures are logged but never abort the review itself.
      const trainingInserts = assessmentDetails.responses
        .filter((r: any) => r.transcript || r.user_response)
        .map((r: any) => {
          const rReview = responseReviews[r.id];
          const humanCefr = rReview?.cefr_level || finalCEFRLevel;
          const systemCefr = r.cefr_level;
          // Per-criterion system values + the assessor's per-criterion grades
          // (falling back to the system value when the assessor left it as-is).
          const sysScoring = getResponseScoringData(r);
          const humanGrammar = rReview?.grammar_cefr || sysScoring.grammarCefr || null;
          const humanFluency = rReview?.fluency_cefr || sysScoring.fluencyCefr || null;
          const humanVocab = rReview?.vocabulary_cefr || sysScoring.vocabCefr || null;
          // The AI rubric read for this response, if the tester pulled one.
          const aiRub = aiReads[r.id]?.data?.rubric || null;
          const aiFeat = aiReads[r.id]?.data?.features || null;
          return {
            response_id: r.id,
            transcript: r.transcript || null,
            user_response: r.user_response || r.transcript || null,
            prompt_text: r.prompt_identifier || null,
            assessor_feedback: [
              assessorFeedback || null,
              rReview?.notes ? `Response note: ${rReview.notes}` : null
            ].filter(Boolean).join('\n') || null,
            organization_id: (assessmentDetails.session as any).organization_id || null,
            // CEFR ordinal 0..6 (Pre-A1..C2); clamp defensively so one odd grade
            // can never fail the whole training_data batch (the DB CHECK allows 0..6).
            quality_rating: humanCefr ? Math.max(0, Math.min(6, cefrToNumber(humanCefr as CEFRLevel))) : null,
            scores: {
              system_cefr: systemCefr || null,
              human_cefr: humanCefr || null,
              system_grammar_cefr: sysScoring.grammarCefr || null,
              system_fluency_cefr: sysScoring.fluencyCefr || null,
              system_vocabulary_cefr: sysScoring.vocabCefr || null,
              human_grammar_cefr: humanGrammar,
              human_fluency_cefr: humanFluency,
              human_vocabulary_cefr: humanVocab,
              is_overridden: !!rReview?.cefr_level && rReview.cefr_level !== systemCefr,
              session_is_overridden: isOverridden,
              override_reason: isOverridden ? (finalCEFRReason || null) : null,
              // LLM rubric-rater read (second opinion) + the text fluency features,
              // captured so we can measure LLM-vs-human agreement over time.
              llm_cefr: aiRub?.overall_cefr || null,
              llm_grammar_cefr: aiRub?.grammar_cefr || null,
              llm_fluency_cefr: aiRub?.fluency_cefr || null,
              llm_vocabulary_cefr: aiRub?.vocabulary_cefr || null,
              llm_confidence: typeof aiRub?.confidence === 'number' ? aiRub.confidence : null,
              fluency_features: aiFeat || null,
              final_session_cefr: finalCEFRLevel,
              calculated_session_cefr: calculatedCEFR,
              // Upedia-scale labels so the dataset can train toward Upedia's own
              // scale later, not only CEFR (swappable-scale principle).
              program: program || null,
              program_subtrack: subtrack || null,
              upedia_level: levelCode || null,
              upedia_band: autoBand || null,
              audio_url: r.audio_url || null,
              overall_score: r.overall_score || null,
              grammar_score: r.grammar_score || null,
              fluency_score: r.fluency_score || null,
              vocabulary_score: r.vocabulary_score || null
            }
          };
        });

      if (trainingInserts.length > 0) {
        const { error: trainingError } = await supabase
          .from('training_data')
          .insert(trainingInserts);
        if (trainingError) {
          console.error('⚠️ [training_data] Failed to write training signal:', trainingError);
        }
      }

      toast.success(`Review submitted successfully - Final Level: ${finalCEFRLevel}`);
      
      onClose();
      setTimeout(() => { onReviewSubmitted(); }, 500);
      
      setAssessorFeedback('');
      setRecommendation('');
      setReviewStatus('approved');
      setResponseReviews({});
      setFinalCEFRLevel('');
      setFinalCEFRReason('');
      setCalculatedCEFR('');
      setCriteria({ grammar: '', fluency: '', vocabulary: '' });
      setProgram('');
      setSubtrack('');
      setLevelCode('');
      setGoals('');
      setOtherPrograms('');
      setRecommendTrack(false);
      setShowPreview(false);
      setHeader({ date: formatReportDate(), name: '', age: '', nationality: '', residency: '', occupation: '', track: '' });

    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProgramChange = (p: string) => {
    setProgram(p);
    const cfg = programConfig(p);
    setSubtrack(cfg && cfg.tracks.length === 1 ? (cfg.tracks[0] as ProgramTrack) : '');
    setLevelCode('');
  };

  const handleSubtrackChange = (t: ProgramTrack) => {
    setSubtrack(t);
    setLevelCode('');
  };

  const handleResponseReviewChange = (
    responseId: string,
    field: 'cefr_level' | 'notes' | 'grammar_cefr' | 'fluency_cefr' | 'vocabulary_cefr',
    value: string
  ) => {
    setResponseReviews(prev => ({
      ...prev,
      [responseId]: {
        cefr_level: prev[responseId]?.cefr_level || '',
        notes: prev[responseId]?.notes || '',
        grammar_cefr: prev[responseId]?.grammar_cefr || '',
        fluency_cefr: prev[responseId]?.fluency_cefr || '',
        vocabulary_cefr: prev[responseId]?.vocabulary_cefr || '',
        [field]: value,
      }
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  /** Extract per-response scoring data from detailed_feedback / mistakes_analysis */
  const getResponseScoringData = (response: any) => {
    const feedback = response.detailed_feedback || {};
    const analysis = response.mistakes_analysis || {};
    
    // Grammar data from API
    const grammarApi = analysis.grammarApiAnalysis || feedback.grammarApiAnalysis;
    const grammarCefr = grammarApi?.apiUsed ? grammarApi.cefr : null;
    const grammarScores = grammarApi?.apiUsed ? grammarApi.scores : null;
    
    // Fluency data from API
    const fluencyApi = analysis.fluencyApiAnalysis || feedback.fluencyApiAnalysis;
    const fluencyCefr = fluencyApi?.apiUsed ? fluencyApi.cefr : null;
    const fluencySpm = fluencyApi?.apiUsed ? fluencyApi.spm : null;
    const fluencySyllables = fluencyApi?.apiUsed ? fluencyApi.syllables : null;
    
    // Vocabulary data
    const vocabCefr = analysis.cefrVocabularyLevel || feedback.cefrVocabularyLevel || null;
    
    return { grammarCefr, grammarScores, fluencyCefr, fluencySpm, fluencySyllables, vocabCefr };
  };

  /**
   * Pull an AI rubric read (second opinion) for one response. This is advisory —
   * it never auto-grades; the tester compares, then decides. Its read is also
   * captured into training_data so we can measure LLM-vs-human agreement.
   */
  const fetchAiRead = async (response: any) => {
    setAiReads((prev) => ({ ...prev, [response.id]: { loading: true } }));
    try {
      const { data, error } = await supabase.functions.invoke('rubric-rater', {
        body: {
          transcript: response.transcript || '',
          duration_seconds: response.audio_duration || null,
          prompt_text: response.prompt_text || response.prompt_identifier || '',
          question_type: response.question_type || '',
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Rater failed');
      setAiReads((prev) => ({ ...prev, [response.id]: { loading: false, data } }));
    } catch (e: any) {
      setAiReads((prev) => ({ ...prev, [response.id]: { loading: false, error: e?.message || 'Failed' } }));
      toast.error('AI rubric read failed — grade manually.');
    }
  };

  /** Copy the AI read's levels into the tester's editable grades (still editable). */
  const applyAiRead = (responseId: string, rubric: any) => {
    if (!rubric) return;
    setResponseReviews((prev) => ({
      ...prev,
      [responseId]: {
        cefr_level: rubric.overall_cefr || prev[responseId]?.cefr_level || '',
        notes: prev[responseId]?.notes || '',
        grammar_cefr: rubric.grammar_cefr || prev[responseId]?.grammar_cefr || '',
        fluency_cefr: rubric.fluency_cefr || prev[responseId]?.fluency_cefr || '',
        vocabulary_cefr: rubric.vocabulary_cefr || prev[responseId]?.vocabulary_cefr || '',
      },
    }));
    toast.success('AI levels copied in — adjust anything you disagree with.');
  };

  if (!assessmentDetails) return null;

  const { session, responses } = assessmentDetails;
  const reviewedCount = Object.keys(responseReviews).length;
  const totalResponses = responses?.length || 0;
  const isOverridden = finalCEFRLevel && finalCEFRLevel !== calculatedCEFR;

  // Age-based placement info carried on the session's student_info.
  const studentInfo = session.student_info || {};
  const studentTrack = studentInfo.track as Track | undefined;
  const suggestedTrack = studentInfo.suggestedTrack as Track | undefined;
  const placementNote = studentInfo.placementNote as string | undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Review Assessment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-muted-foreground">
                    {session.student_info?.name?.trim() || session.profiles?.full_name || 'Anonymous User'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">
                    {session.profiles?.email || session.student_info?.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Test Date</Label>
                  <p className="text-sm text-muted-foreground">{formatDate(session.created_at)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Session Type</Label>
                  <Badge variant="outline">{session.session_type}</Badge>
                </div>
                {studentTrack && (
                  <div>
                    <Label className="text-sm font-medium">Test Track</Label>
                    <div>
                      <Badge className="bg-assessment-blue/10 text-assessment-blue border-transparent">
                        {trackLabel(studentTrack)}
                      </Badge>
                    </div>
                  </div>
                )}
                {typeof studentInfo.age === 'number' && (
                  <div>
                    <Label className="text-sm font-medium">Age</Label>
                    <p className="text-sm text-muted-foreground">{studentInfo.age}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Age-track placement suggestion (e.g. a teen who scored above A2).
              The human assessor decides — the system never moves a student. */}
          {suggestedTrack && (
            <Card className="border-amber-300 bg-amber-50/50">
              <CardContent className="py-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-800">
                    Possible track change — consider {trackLabel(suggestedTrack)}
                  </p>
                  <p className="text-amber-700">
                    {placementNote ||
                      `This student scored above the ${trackLabel(studentTrack!)} test ceiling. Consider placing them in the ${trackLabel(suggestedTrack)} track.`}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Scores - Only 3 criteria with CEFR */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Assessment Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-sm font-medium">Overall CEFR Level</Label>
                  <Select value={finalCEFRLevel} onValueChange={setFinalCEFRLevel}>
                    <SelectTrigger className="mt-1 h-9 w-32"><SelectValue placeholder="Level" /></SelectTrigger>
                    <SelectContent>
                      {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground mt-1">System: {session.overall_cefr_level || '—'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Responses</Label>
                  <p className="text-sm text-muted-foreground">{responses.length} recorded</p>
                </div>
              </div>

              {/* Assessor grades the three criteria — editable, A1–C2 */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                {([
                  { key: 'grammar' as const, label: 'Grammar', Icon: Languages },
                  { key: 'fluency' as const, label: 'Fluency', Icon: Mic },
                  { key: 'vocabulary' as const, label: 'Vocabulary', Icon: BookOpen },
                ]).map(({ key, label, Icon }) => (
                  <div key={key} className="text-center p-3 rounded-lg bg-muted/50">
                    <Icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <Select value={criteria[key]} onValueChange={(v) => setCriteria((c) => ({ ...c, [key]: v }))}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Level" /></SelectTrigger>
                      <SelectContent>
                        {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Individual Response Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AudioLines className="h-5 w-5" />
                  Review Each Response
                </span>
                <Badge variant="outline">
                  {reviewedCount}/{totalResponses} Reviewed
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {responses.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
                  <div>
                    <p className="font-medium">Loading Audio Responses...</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Checking for audio recordings in storage...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {responses.map((response, index) => {
                    const scoring = getResponseScoringData(response);
                    return (
                    <div key={response.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">Response {index + 1}</span>
                        <div className="flex items-center gap-2">
                          {responseReviews[response.id]?.cefr_level && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {response.cefr_level && (
                            <Badge variant="outline" className="text-xs">
                              Original: {response.cefr_level}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Audio Player */}
                      {response.audio_url && (
                        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <AudioLines className="h-4 w-4" />
                            <span>Audio Recording</span>
                            {response.audio_duration && (
                              <span>({Math.round(response.audio_duration)}s)</span>
                            )}
                          </div>
                          <audio controls className="w-full h-10" preload="metadata">
                            <source src={response.audio_url} type="audio/webm" />
                            <source src={response.audio_url} type="audio/mp3" />
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      )}
                      
                      {response.transcript && (
                        <div className="bg-muted/50 rounded p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Transcript:</p>
                          <p className="text-sm">{response.transcript}</p>
                        </div>
                      )}

                      {/* AI rubric read — an on-demand SECOND OPINION. Advisory
                          only: the tester compares and decides. Captured into
                          training_data to measure LLM-vs-human agreement. */}
                      {response.transcript && (() => {
                        const ai = aiReads[response.id];
                        const rub = ai?.data?.rubric;
                        return (
                          <div className="rounded-lg border border-purple-200 bg-purple-50/40 p-3">
                            {!ai && (
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 text-xs text-purple-900">
                                  <Sparkles className="h-4 w-4" />
                                  <span>Want a second opinion? Get the AI's rubric read, then decide for yourself.</span>
                                </div>
                                <Button size="sm" variant="outline" className="h-8 shrink-0" onClick={() => fetchAiRead(response)}>
                                  AI rubric read
                                </Button>
                              </div>
                            )}
                            {ai?.loading && (
                              <div className="flex items-center gap-2 text-xs text-purple-900">
                                <Loader2 className="h-4 w-4 animate-spin" /> Reading the response…
                              </div>
                            )}
                            {ai?.error && (
                              <div className="flex items-center justify-between gap-2 text-xs text-red-700">
                                <span>AI read failed — grade manually.</span>
                                <Button size="sm" variant="outline" className="h-7" onClick={() => fetchAiRead(response)}>Retry</Button>
                              </div>
                            )}
                            {rub && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="flex items-center gap-1 text-xs font-semibold text-purple-900">
                                    <Sparkles className="h-3.5 w-3.5" /> AI rubric read
                                  </span>
                                  <Badge className={getCEFRColor(rub.grammar_cefr)}>G {rub.grammar_cefr || '—'}</Badge>
                                  <Badge className={getCEFRColor(rub.fluency_cefr)}>F {rub.fluency_cefr || '—'}</Badge>
                                  <Badge className={getCEFRColor(rub.vocabulary_cefr)}>V {rub.vocabulary_cefr || '—'}</Badge>
                                  <Badge variant="outline" className="border-purple-300">Overall {rub.overall_cefr || '—'}</Badge>
                                  <span className="text-[11px] text-muted-foreground">confidence {rub.confidence ?? '—'}%</span>
                                </div>
                                {rub.rationale?.overall && (
                                  <p className="text-[11px] text-slate-700"><span className="font-medium">Why:</span> {rub.rationale.overall}</p>
                                )}
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] text-muted-foreground">Advisory — no audio, so pronunciation isn’t judged. You are the decision-maker.</span>
                                  <Button size="sm" variant="outline" className="h-7 shrink-0" onClick={() => applyAiRead(response.id, rub)}>
                                    Use these grades
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Per-response scoring: the assessor grades Grammar,
                          Fluency, and Vocabulary as CEFR. Each dropdown is
                          pre-filled with the system's value (shown as "System: X")
                          and is editable A1–C1. */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                        {([
                          { key: 'grammar_cefr' as const, label: 'Grammar', sys: scoring.grammarCefr },
                          { key: 'fluency_cefr' as const, label: 'Fluency', sys: scoring.fluencyCefr },
                          { key: 'vocabulary_cefr' as const, label: 'Vocabulary', sys: scoring.vocabCefr },
                        ]).map(({ key, label, sys }) => (
                          <div key={key} className="p-2 rounded bg-muted/30">
                            <p className="text-xs text-muted-foreground text-center mb-1">{label}</p>
                            <Select
                              value={responseReviews[response.id]?.[key] || (sys ?? '')}
                              onValueChange={(value) => handleResponseReviewChange(response.id, key, value)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A1">A1</SelectItem>
                                <SelectItem value="A2">A2</SelectItem>
                                <SelectItem value="B1">B1</SelectItem>
                                <SelectItem value="B2">B2</SelectItem>
                                <SelectItem value="C1">C1</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-[10px] text-muted-foreground text-center mt-1">
                              System: {sys || '—'}
                              {key === 'fluency_cefr' && scoring.fluencySpm ? ` · ${scoring.fluencySpm} SPM` : ''}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                        <div>
                          <Label htmlFor={`cefr-${response.id}`} className="text-xs mb-1">
                            Assessor CEFR Level
                          </Label>
                          <Select 
                            value={responseReviews[response.id]?.cefr_level || ''}
                            onValueChange={(value) => handleResponseReviewChange(response.id, 'cefr_level', value)}
                          >
                            <SelectTrigger id={`cefr-${response.id}`} className="h-9">
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A1">A1</SelectItem>
                              <SelectItem value="A2">A2</SelectItem>
                              <SelectItem value="B1">B1</SelectItem>
                              <SelectItem value="B2">B2</SelectItem>
                              <SelectItem value="C1">C1</SelectItem>
                              <SelectItem value="C2">C2</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="col-span-1">
                          <Label htmlFor={`notes-${response.id}`} className="text-xs mb-1">
                            Assessor Notes
                          </Label>
                          <Textarea
                            id={`notes-${response.id}`}
                            placeholder="Add your notes..."
                            value={responseReviews[response.id]?.notes || ''}
                            onChange={(e) => handleResponseReviewChange(response.id, 'notes', e.target.value)}
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Final Result Calculation & Override */}
          <Card className={isOverridden ? "border-amber-300 bg-amber-50/30" : "border-green-300 bg-green-50/30"}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Final CEFR Assessment
                </span>
                {isOverridden && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Manual Override
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Honest training-signal guidance: the human decision here is what
                  the system learns from. No ML runs yet — this is how the dataset
                  is built toward eventually placing without a reviewer. */}
              <div className="rounded-lg border border-assessment-blue/30 bg-assessment-blue/5 p-3 text-xs text-slate-700 space-y-1">
                <p className="font-semibold text-assessment-blue">🧠 Your review trains the system</p>
                <p>
                  Every review you submit is saved as a labelled example — the system learns from
                  <strong> your</strong> judgement, not its own. To make that signal count:
                </p>
                <ul className="list-disc ml-4 space-y-0.5">
                  <li>Grade <strong>Grammar, Fluency and Vocabulary</strong> on what you actually hear — don’t just accept the auto values.</li>
                  <li>When the auto level is wrong, <strong>override it</strong> and give a specific reason (e.g. “relies on memorised phrases, little spontaneous range” — not just “sounds B1”). Corrections are the most valuable signal.</li>
                  <li>Be consistent: the same evidence should get the same level. Agreement between reviewers is what eventually lets the system place on its own.</li>
                </ul>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {reviewedCount === totalResponses ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
                <span>
                  {reviewedCount === totalResponses 
                    ? "All responses reviewed" 
                    : `Please review remaining ${totalResponses - reviewedCount} response(s)`}
                </span>
              </div>

              {(calculatedCEFR || session.overall_cefr_level) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">
                      {calculatedCEFR ? 'Auto-Calculated Level' : 'Current Session Level'}
                    </Label>
                    <div className="mt-1">
                      <Badge className={getCEFRColor(calculatedCEFR || session.overall_cefr_level)}>
                        {calculatedCEFR || session.overall_cefr_level}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {calculatedCEFR 
                          ? `Based on average of ${reviewedCount} reviewed response${reviewedCount !== 1 ? 's' : ''}`
                          : 'Original assessment result'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="final-cefr" className="text-sm font-medium">
                      Final CEFR Level *
                    </Label>
                    <Select value={finalCEFRLevel} onValueChange={setFinalCEFRLevel}>
                      <SelectTrigger id="final-cefr" className="mt-1">
                        <SelectValue placeholder="Confirm or override level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A1">A1 - Beginner</SelectItem>
                        <SelectItem value="A2">A2 - Elementary</SelectItem>
                        <SelectItem value="B1">B1 - Intermediate</SelectItem>
                        <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                        <SelectItem value="C1">C1 - Advanced</SelectItem>
                        <SelectItem value="C2">C2 - Proficient</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {isOverridden && (
                <div>
                  <Label htmlFor="override-reason" className="text-sm font-medium">
                    Override Reasoning *
                  </Label>
                  <Textarea
                    id="override-reason"
                    placeholder="Please explain why you are overriding the calculated level..."
                    value={finalCEFRReason}
                    onChange={(e) => setFinalCEFRReason(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                  {!finalCEFRReason && (
                    <p className="text-xs text-amber-600 mt-1">
                      Reasoning is required when overriding the calculated level
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Assessment Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="review-status">Review Status</Label>
                <Select value={reviewStatus} onValueChange={(value: any) => setReviewStatus(value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="needs_revision">Needs Revision</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assessor-feedback">Assessor Feedback *</Label>
                <Textarea
                  id="assessor-feedback"
                  placeholder="Provide detailed feedback on the assessment..."
                  value={assessorFeedback}
                  onChange={(e) => setAssessorFeedback(e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="recommendation">Recommendations</Label>
                <Textarea
                  id="recommendation"
                  placeholder="Provide learning recommendations for the student..."
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Upedia placement & performance report. The tester confirms the
              program + level; the report's skills/objectives come from that
              level, the header from the student's info, and Goals/Feedback/
              Other Programs from the tester. */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Upedia Placement &amp; Performance Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs mb-1">Program *</Label>
                  <Select value={program} onValueChange={handleProgramChange}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Choose program" /></SelectTrigger>
                    <SelectContent>
                      {PROGRAMS.map((p) => (
                        <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {pConfig?.note && <p className="text-[11px] text-muted-foreground mt-1">{pConfig.note}</p>}
                </div>

                {pConfig && pConfig.tracks.length > 1 && (
                  <div>
                    <Label className="text-xs mb-1">Track *</Label>
                    <Select value={subtrack} onValueChange={(v) => handleSubtrackChange(v as ProgramTrack)}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Private / Group" /></SelectTrigger>
                      <SelectContent>
                        {pConfig.tracks.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {pConfig?.hasLevels && (
                  <div>
                    <Label className="text-xs mb-1">Level *</Label>
                    <Select value={levelCode} onValueChange={setLevelCode} disabled={!program}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Choose level" /></SelectTrigger>
                      <SelectContent className="max-h-72">
                        {levelOptions.map((l) => (
                          <SelectItem key={l.level_code} value={l.level_code}>
                            {l.stage ? `${l.stage} · ` : ''}{l.level_code}{l.cefr_band ? ` (${l.cefr_band})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {autoBand && (
                      <p className="text-[11px] text-muted-foreground mt-1">Suggested band: <span className="font-medium">{autoBand}</span></p>
                    )}
                  </div>
                )}
              </div>

              {pConfig && !pConfig.hasReport && (
                <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
                  {program} has no performance report — the student is placed by their General (or equivalent) test score. The placement is still recorded.
                </div>
              )}

              {/* Teen (or similar) scored above A2 → recommend an adult track. */}
              {suggestedTrack && (
                <label className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={recommendTrack}
                    onChange={(e) => setRecommendTrack(e.target.checked)}
                  />
                  <span>Recommend a track change — this student scored above the {trackLabel(studentTrack!)} ceiling; include a note suggesting the {trackLabel(suggestedTrack)} track on the report.</span>
                </label>
              )}

              {/* Report header — pre-filled from the student's form/account,
                  editable by the tester (e.g. occupation isn't collected yet). */}
              <div>
                <Label className="text-xs font-medium">Report header</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  <Input placeholder="Name" value={header.name} onChange={(e) => setHeader((h) => ({ ...h, name: e.target.value }))} />
                  <Input placeholder="Age" value={header.age} onChange={(e) => setHeader((h) => ({ ...h, age: e.target.value }))} />
                  <Input placeholder="Nationality" value={header.nationality} onChange={(e) => setHeader((h) => ({ ...h, nationality: e.target.value }))} />
                  <Input placeholder="Residency" value={header.residency} onChange={(e) => setHeader((h) => ({ ...h, residency: e.target.value }))} />
                  <Input placeholder="Occupation" value={header.occupation} onChange={(e) => setHeader((h) => ({ ...h, occupation: e.target.value }))} />
                  <Input placeholder="Date" value={header.date} onChange={(e) => setHeader((h) => ({ ...h, date: e.target.value }))} />
                </div>
              </div>

              <div>
                <Label htmlFor="report-goals" className="text-xs mb-1">Goals</Label>
                <Textarea
                  id="report-goals"
                  placeholder="The student's goals / what they need from the course…"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  rows={2}
                />
                {studentStatedNeed(session) && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Student stated: “{studentStatedNeed(session)}”
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="report-other" className="text-xs mb-1">Other Programs</Label>
                <Textarea
                  id="report-other"
                  placeholder="Eligible programs the student may switch to…"
                  value={otherPrograms}
                  onChange={(e) => setOtherPrograms(e.target.value)}
                  rows={2}
                />
              </div>

              <p className="text-[11px] text-muted-foreground">
                The report's <span className="font-medium">Feedback</span> section uses the Assessor Feedback above.
              </p>

              <Button type="button" variant="outline" size="sm" onClick={() => setShowPreview((v) => !v)}>
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Hide preview' : 'Preview report'}
              </Button>

              {showPreview && program && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <PerformanceReport
                    report={assembleReport({
                      program,
                      subtrack: subtrack || null,
                      levelCode,
                      header: { ...header, track: subtrack || header.track || '' },
                      goals,
                      feedback: assessorFeedback,
                      otherPrograms,
                      recommendTrackChange:
                        recommendTrack && suggestedTrack
                          ? `Recommended track change: this student scored above the ${trackLabel(studentTrack!)} ceiling — consider the ${trackLabel(suggestedTrack)} track.`
                          : null,
                      criteria,
                      overallCefr: finalCEFRLevel,
                    })}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitReview} 
            disabled={
              isSubmitting ||
              !assessorFeedback.trim() ||
              !finalCEFRLevel ||
              !program ||
              (!!pConfig?.hasLevels && !levelCode) ||
              (isOverridden && !finalCEFRReason.trim())
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentReviewModal;
