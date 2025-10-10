import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Star, AudioLines, FileText, User, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { cefrToNumber, numberToCefr, type CEFRLevel } from '@/utils/scoring/cefrUtils';

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

const AssessmentReviewModal: React.FC<AssessmentReviewModalProps> = ({
  isOpen,
  onClose,
  assessmentDetails,
  onReviewSubmitted
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected' | 'needs_revision'>('approved');
  const [assessorFeedback, setAssessorFeedback] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [responseReviews, setResponseReviews] = useState<Record<string, { cefr_level: string; notes: string }>>({});
  const [finalCEFRLevel, setFinalCEFRLevel] = useState<string>('');
  const [finalCEFRReason, setFinalCEFRReason] = useState('');
  const [calculatedCEFR, setCalculatedCEFR] = useState<string>('');

  // Calculate average CEFR whenever response reviews change, or use session level as fallback
  useEffect(() => {
    const reviewedLevels = Object.values(responseReviews)
      .map(r => r.cefr_level)
      .filter(Boolean);
    
    if (reviewedLevels.length > 0) {
      const numericLevels = reviewedLevels.map(level => cefrToNumber(level as CEFRLevel));
      const average = numericLevels.reduce((a, b) => a + b, 0) / numericLevels.length;
      const calculatedLevel = numberToCefr(average);
      setCalculatedCEFR(calculatedLevel);
      
      // Set final level to calculated if not manually set
      if (!finalCEFRLevel) {
        setFinalCEFRLevel(calculatedLevel);
      }
    } else if (assessmentDetails?.session?.overall_cefr_level && !finalCEFRLevel) {
      // If no individual responses reviewed, use session-level CEFR as default
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

      // Update individual responses with assessor reviews
      const responseUpdatePromises = Object.entries(responseReviews).map(([responseId, review]) => {
        const updateData: any = {};
        
        if (review.cefr_level) {
          updateData.cefr_level = review.cefr_level;
        }
        
        if (review.notes) {
          // Store assessor notes in detailed_feedback
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

      // Check if final level was overridden
      const isOverridden = finalCEFRLevel !== calculatedCEFR;

      // Get current user for assessor_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Insert assessor review
      const { error } = await supabase
        .from('assessor_reviews')
        .insert({
          session_id: assessmentDetails.session.id,
          assessor_id: user.id,
          review_status: reviewStatus,
          assessor_feedback: assessorFeedback,
          recommendation: recommendation,
          override_scores: {
            final_cefr_level: finalCEFRLevel,
            calculated_average: calculatedCEFR,
            is_overridden: isOverridden,
            override_reason: isOverridden ? finalCEFRReason : null
          }
        });

      if (error) {
        throw error;
      }

      // Update session status and final CEFR level
      if (reviewStatus === 'approved' || reviewStatus === 'rejected') {
        await supabase
          .from('assessment_sessions')
          .update({
            status: reviewStatus,
            reviewed_at: new Date().toISOString(),
            overall_cefr_level: finalCEFRLevel
          })
          .eq('id', assessmentDetails.session.id);
      }

      toast.success(`Review submitted successfully - Final Level: ${finalCEFRLevel}`);
      onReviewSubmitted();
      onClose();
      
      // Reset form
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCEFRColor = (level: string) => {
    const colors = {
      'A1': 'bg-red-100 text-red-800',
      'A2': 'bg-orange-100 text-orange-800',
      'B1': 'bg-yellow-100 text-yellow-800',
      'B2': 'bg-green-100 text-green-800',
      'C1': 'bg-blue-100 text-blue-800',
      'C2': 'bg-purple-100 text-purple-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!assessmentDetails) {
    return null;
  }

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
                  <p className="text-sm text-gray-600">
                    {session.profiles?.full_name || session.student_info?.name || 'Anonymous User'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-600">
                    {session.profiles?.email || session.student_info?.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Test Date</Label>
                  <p className="text-sm text-gray-600">{formatDate(session.created_at)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Session Type</Label>
                  <Badge variant="outline">{session.session_type}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Current Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Overall Score</Label>
                  <p className="text-lg font-semibold text-blue-600">
                    {Math.round(session.overall_score || 0)}/100
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">CEFR Level</Label>
                  <Badge className={getCEFRColor(session.overall_cefr_level)}>
                    {session.overall_cefr_level || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Responses</Label>
                  <p className="text-sm text-gray-600">{responses.length} recorded</p>
                </div>
                {session.fluency_score && (
                  <div>
                    <Label className="text-sm font-medium">Fluency</Label>
                    <p className="text-sm font-semibold">{Math.round(session.fluency_score)}/100</p>
                  </div>
                )}
                {session.grammar_score && (
                  <div>
                    <Label className="text-sm font-medium">Grammar</Label>
                    <p className="text-sm font-semibold">{Math.round(session.grammar_score)}/100</p>
                  </div>
                )}
                {session.pronunciation_score && (
                  <div>
                    <Label className="text-sm font-medium">Pronunciation</Label>
                    <p className="text-sm font-semibold">{Math.round(session.pronunciation_score)}/100</p>
                  </div>
                )}
                {session.vocabulary_score && (
                  <div>
                    <Label className="text-sm font-medium">Vocabulary</Label>
                    <p className="text-sm font-semibold">{Math.round(session.vocabulary_score)}/100</p>
                  </div>
                )}
                {session.coherence_score && (
                  <div>
                    <Label className="text-sm font-medium">Coherence</Label>
                    <p className="text-sm font-semibold">{Math.round(session.coherence_score)}/100</p>
                  </div>
                )}
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
                    <p className="font-medium text-gray-900">Loading Audio Responses...</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Checking for audio recordings in storage...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {responses.map((response, index) => (
                  <div key={response.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Response {index + 1}</span>
                      <div className="flex items-center gap-2">
                        {responseReviews[response.id]?.cefr_level && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {response.reconstructed && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            Audio Only
                          </Badge>
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
                      <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                          <AudioLines className="h-4 w-4" />
                          <span>Audio Recording</span>
                          {response.audio_duration && (
                            <span className="text-slate-500">({Math.round(response.audio_duration)}s)</span>
                          )}
                        </div>
                        <audio 
                          controls 
                          className="w-full h-10"
                          preload="metadata"
                        >
                          <source src={response.audio_url} type="audio/webm" />
                          <source src={response.audio_url} type="audio/mp3" />
                          <source src={response.audio_url} type="audio/wav" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                    
                    {response.transcript && (
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs font-medium text-gray-600 mb-1">Transcript:</p>
                        <p className="text-sm text-gray-800">{response.transcript}</p>
                      </div>
                    )}

                    {response.reconstructed && !response.transcript && (
                      <div className="bg-amber-50 rounded p-3 border border-amber-200">
                        <p className="text-xs font-medium text-amber-700">
                          ℹ️ No transcript available - This response was reconstructed from audio storage
                        </p>
                      </div>
                    )}

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
                      
                      <div className="col-span-2">
                        <Label htmlFor={`notes-${response.id}`} className="text-xs mb-1">
                          Assessor Notes
                        </Label>
                        <Textarea
                          id={`notes-${response.id}`}
                          placeholder="Add your notes for this response..."
                          value={responseReviews[response.id]?.notes || ''}
                          onChange={(e) => handleResponseReviewChange(response.id, 'notes', e.target.value)}
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  ))}
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
              {/* Progress Info */}
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

              {/* Calculated CEFR or Session CEFR */}
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
                    <Select 
                      value={finalCEFRLevel}
                      onValueChange={setFinalCEFRLevel}
                    >
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

              {/* Override Reasoning */}
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
              {/* Review Status */}
              <div>
                <Label htmlFor="review-status">Review Status</Label>
                <Select value={reviewStatus} onValueChange={(value: any) => setReviewStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="needs_revision">Needs Revision</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assessor Feedback */}
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

              {/* Recommendation */}
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