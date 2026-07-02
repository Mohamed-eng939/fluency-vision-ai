import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Star, AudioLines, FileText, User, AlertCircle, CheckCircle, Languages, Mic, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cefrToNumber, numberToCefr, type CEFRLevel } from '@/utils/scoring/cefrUtils';
import { useAuth } from '@/contexts/auth';

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
  const [responseReviews, setResponseReviews] = useState<Record<string, { cefr_level: string; notes: string }>>({});
  const [finalCEFRLevel, setFinalCEFRLevel] = useState<string>('');
  const [finalCEFRReason, setFinalCEFRReason] = useState('');
  const [calculatedCEFR, setCalculatedCEFR] = useState<string>('');

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

    try {
      setIsSubmitting(true);

      const responseUpdatePromises = Object.entries(responseReviews).map(([responseId, review]) => {
        const updateData: any = {};
        
        if (review.cefr_level) {
          updateData.cefr_level = review.cefr_level;
        }
        
        if (review.notes) {
          updateData.detailed_feedback = {
            ...(assessmentDetails.responses.find((r: any) => r.id === responseId)?.detailed_feedback || {}),
            assessor_notes: review.notes
          };
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

      const reviewData: any = {
        session_id: assessmentDetails.session.id,
        review_status: reviewStatus,
        assessor_feedback: assessorFeedback,
        recommendation: recommendation,
        override_scores: {
          final_cefr_level: finalCEFRLevel,
          calculated_average: calculatedCEFR,
          is_overridden: isOverridden,
          override_reason: isOverridden ? finalCEFRReason : null
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
          overall_cefr_level: finalCEFRLevel as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
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
            quality_rating: humanCefr ? cefrToNumber(humanCefr as CEFRLevel) : null,
            scores: {
              system_cefr: systemCefr || null,
              human_cefr: humanCefr || null,
              is_overridden: !!rReview?.cefr_level && rReview.cefr_level !== systemCefr,
              session_is_overridden: isOverridden,
              final_session_cefr: finalCEFRLevel,
              calculated_session_cefr: calculatedCEFR,
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

    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResponseReviewChange = (responseId: string, field: 'cefr_level' | 'notes', value: string) => {
    setResponseReviews(prev => ({
      ...prev,
      [responseId]: {
        ...prev[responseId],
        cefr_level: field === 'cefr_level' ? value : (prev[responseId]?.cefr_level || ''),
        notes: field === 'notes' ? value : (prev[responseId]?.notes || '')
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

  if (!assessmentDetails) return null;

  const { session, responses } = assessmentDetails;
  const reviewedCount = Object.keys(responseReviews).length;
  const totalResponses = responses?.length || 0;
  const isOverridden = finalCEFRLevel && finalCEFRLevel !== calculatedCEFR;

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
                    {session.profiles?.full_name || session.student_info?.name || 'Anonymous User'}
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
              </div>
            </CardContent>
          </Card>

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
                  <div className="mt-1">
                    <Badge className={`text-lg px-3 py-1 ${getCEFRColor(session.overall_cefr_level || '')}`}>
                      {session.overall_cefr_level || 'N/A'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Responses</Label>
                  <p className="text-sm text-muted-foreground">{responses.length} recorded</p>
                </div>
              </div>

              {/* Show only Grammar, Fluency, Vocabulary as CEFR levels from session metadata */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Languages className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground mb-1">Grammar</p>
                  {session.overall_cefr_level ? (
                    <Badge className={getCEFRColor(session.overall_cefr_level)}>
                      {session.overall_cefr_level}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">N/A</span>
                  )}
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Mic className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground mb-1">Fluency</p>
                  {session.overall_cefr_level ? (
                    <Badge className={getCEFRColor(session.overall_cefr_level)}>
                      {session.overall_cefr_level}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">N/A</span>
                  )}
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <BookOpen className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground mb-1">Vocabulary</p>
                  {session.overall_cefr_level ? (
                    <Badge className={getCEFRColor(session.overall_cefr_level)}>
                      {session.overall_cefr_level}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">N/A</span>
                  )}
                </div>
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

                      {/* Per-response scoring: Grammar, Fluency, Vocabulary CEFR only */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                        <div className="text-center p-2 rounded bg-muted/30">
                          <p className="text-xs text-muted-foreground">Grammar</p>
                          {scoring.grammarCefr ? (
                            <Badge className={`text-xs mt-1 ${getCEFRColor(scoring.grammarCefr)}`}>{scoring.grammarCefr}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">N/A</span>
                          )}
                        </div>
                        <div className="text-center p-2 rounded bg-muted/30">
                          <p className="text-xs text-muted-foreground">Fluency</p>
                          {scoring.fluencyCefr ? (
                            <Badge className={`text-xs mt-1 ${getCEFRColor(scoring.fluencyCefr)}`}>{scoring.fluencyCefr}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">N/A</span>
                          )}
                          {scoring.fluencySpm && (
                            <p className="text-xs text-muted-foreground mt-1">{scoring.fluencySpm} SPM</p>
                          )}
                        </div>
                        <div className="text-center p-2 rounded bg-muted/30">
                          <p className="text-xs text-muted-foreground">Vocabulary</p>
                          {scoring.vocabCefr ? (
                            <Badge className={`text-xs mt-1 ${getCEFRColor(scoring.vocabCefr)}`}>{scoring.vocabCefr}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">N/A</span>
                          )}
                        </div>
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
