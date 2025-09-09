import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Star, AudioLines, FileText, User } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

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
  const [overrideScores, setOverrideScores] = useState({
    overall_score: '',
    fluency_score: '',
    grammar_score: '',
    pronunciation_score: '',
    vocabulary_score: '',
    coherence_score: ''
  });

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

      // Prepare override scores (only include non-empty values)
      const scoreOverrides = Object.entries(overrideScores).reduce((acc, [key, value]) => {
        if (value && !isNaN(Number(value))) {
          acc[key] = Number(value);
        }
        return acc;
      }, {} as Record<string, number>);

      const { data, error } = await supabase
        .from('assessor_reviews')
        .insert({
          session_id: assessmentDetails.session.id,
          review_status: reviewStatus,
          assessor_feedback: assessorFeedback,
          recommendation: recommendation,
          override_scores: Object.keys(scoreOverrides).length > 0 ? scoreOverrides : null
        });

      if (error) {
        throw error;
      }

      // Update session status if approved/rejected
      if (reviewStatus === 'approved' || reviewStatus === 'rejected') {
        await supabase
          .from('assessment_sessions')
          .update({
            status: reviewStatus,
            reviewed_at: new Date().toISOString(),
            has_score_override: Object.keys(scoreOverrides).length > 0
          })
          .eq('id', assessmentDetails.session.id);
      }

      toast.success('Review submitted successfully');
      onReviewSubmitted();
      onClose();
      
      // Reset form
      setAssessorFeedback('');
      setRecommendation('');
      setReviewStatus('approved');
      setOverrideScores({
        overall_score: '',
        fluency_score: '',
        grammar_score: '',
        pronunciation_score: '',
        vocabulary_score: '',
        coherence_score: ''
      });

    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
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

          {/* Responses Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AudioLines className="h-5 w-5" />
                Student Responses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {responses.map((response, index) => (
                  <div key={response.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Response {index + 1}</span>
                      <Badge variant="outline" className="text-xs">
                        {response.cefr_level || 'N/A'}
                      </Badge>
                    </div>
                    {response.transcript && (
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Transcript:</strong> {response.transcript}
                      </p>
                    )}
                    {response.audio_url && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <AudioLines className="h-3 w-3" />
                        <span>Audio available</span>
                        {response.audio_duration && (
                          <span>({Math.round(response.audio_duration)}s)</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
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

              {/* Score Overrides */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Score Overrides (Optional)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="overall-override" className="text-xs">Overall Score</Label>
                    <Input
                      id="overall-override"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      value={overrideScores.overall_score}
                      onChange={(e) => setOverrideScores(prev => ({ ...prev, overall_score: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fluency-override" className="text-xs">Fluency</Label>
                    <Input
                      id="fluency-override"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      value={overrideScores.fluency_score}
                      onChange={(e) => setOverrideScores(prev => ({ ...prev, fluency_score: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="grammar-override" className="text-xs">Grammar</Label>
                    <Input
                      id="grammar-override"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      value={overrideScores.grammar_score}
                      onChange={(e) => setOverrideScores(prev => ({ ...prev, grammar_score: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pronunciation-override" className="text-xs">Pronunciation</Label>
                    <Input
                      id="pronunciation-override"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      value={overrideScores.pronunciation_score}
                      onChange={(e) => setOverrideScores(prev => ({ ...prev, pronunciation_score: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vocabulary-override" className="text-xs">Vocabulary</Label>
                    <Input
                      id="vocabulary-override"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      value={overrideScores.vocabulary_score}
                      onChange={(e) => setOverrideScores(prev => ({ ...prev, vocabulary_score: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="coherence-override" className="text-xs">Coherence</Label>
                    <Input
                      id="coherence-override"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      value={overrideScores.coherence_score}
                      onChange={(e) => setOverrideScores(prev => ({ ...prev, coherence_score: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmitReview} disabled={isSubmitting || !assessorFeedback.trim()}>
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