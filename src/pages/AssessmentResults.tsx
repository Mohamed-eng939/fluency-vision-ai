import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Clock, FileText, AudioLines, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const AssessmentResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('sessionId');
  
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [review, setReview] = useState<any>(null);
  const [expandedResponses, setExpandedResponses] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!sessionId) {
      toast.error('No session ID provided');
      navigate('/');
      return;
    }
    fetchResults();
  }, [sessionId]);

  const fetchResults = async () => {
    try {
      setIsLoading(true);

      // Fetch session details
      const { data: sessionData, error: sessionError } = await supabase
        .from('assessment_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData);

      // Fetch responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('assessment_responses')
        .select('*')
        .eq('session_id', sessionId)
        .order('prompt_order');

      if (responsesError) throw responsesError;
      setResponses(responsesData || []);

      // Fetch assessor review if available
      const { data: reviewData } = await supabase
        .from('assessor_reviews')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setReview(reviewData);

    } catch (error: any) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load assessment results');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleResponse = (responseId: string) => {
    const newExpanded = new Set(expandedResponses);
    if (newExpanded.has(responseId)) {
      newExpanded.delete(responseId);
    } else {
      newExpanded.add(responseId);
    }
    setExpandedResponses(newExpanded);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-assessment-blue mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading your assessment results...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-lg text-gray-600 mb-4">Assessment not found</p>
            <Button onClick={() => navigate('/')}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if reviewed by looking at reviewed_at timestamp AND if there's a review record
  const isReviewed = (session.reviewed_at && review) || session.status === 'approved' || session.status === 'rejected';
  const finalCEFR = review?.override_scores?.final_cefr_level || session.overall_cefr_level;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/')} className="mb-4">
            ← Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-assessment-blue mb-2">Assessment Results</h1>
          <p className="text-gray-600">Completed on {formatDate(session.created_at)}</p>
        </div>

        {/* Status Banner */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isReviewed ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <Clock className="h-6 w-6 text-yellow-600" />
                )}
                <div>
                  <p className="font-medium text-lg">
                    {isReviewed ? 'Assessment Reviewed' : 'Under Review'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isReviewed 
                      ? `Reviewed on ${formatDate(session.reviewed_at)}`
                      : 'Your assessment is being reviewed by our assessors'
                    }
                  </p>
                </div>
              </div>
              <Badge className={isReviewed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {session.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Overall Scores */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Overall Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Overall Score</p>
                <p className="text-3xl font-bold text-assessment-blue">
                  {Math.round(session.overall_score || 0)}/100
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">CEFR Level</p>
                <Badge className={`text-lg px-3 py-1 ${getCEFRColor(finalCEFR)}`}>
                  {finalCEFR || 'N/A'}
                </Badge>
                {review?.override_scores?.is_overridden && (
                  <p className="text-xs text-gray-500 mt-1">Assessor adjusted</p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Session Type</p>
                <Badge variant="outline">{session.session_type}</Badge>
              </div>
            </div>

            {/* Skill Scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              {session.fluency_score && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Fluency</p>
                  <p className="text-xl font-semibold">{Math.round(session.fluency_score)}</p>
                </div>
              )}
              {session.pronunciation_score && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Pronunciation</p>
                  <p className="text-xl font-semibold">{Math.round(session.pronunciation_score)}</p>
                </div>
              )}
              {session.grammar_score && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Grammar</p>
                  <p className="text-xl font-semibold">{Math.round(session.grammar_score)}</p>
                </div>
              )}
              {session.vocabulary_score && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Vocabulary</p>
                  <p className="text-xl font-semibold">{Math.round(session.vocabulary_score)}</p>
                </div>
              )}
              {session.coherence_score && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Coherence</p>
                  <p className="text-xl font-semibold">{Math.round(session.coherence_score)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assessor Feedback */}
        {review && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Assessor Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">General Feedback</p>
                  <p className="text-gray-600">{review.assessor_feedback}</p>
                </div>
                
                {review.recommendation && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Recommendations</p>
                    <p className="text-gray-600">{review.recommendation}</p>
                  </div>
                )}

                {review.override_scores?.override_reason && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Level Adjustment Note</p>
                    <p className="text-sm text-blue-800">{review.override_scores.override_reason}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Individual Responses */}
        <Card>
          <CardHeader>
            <CardTitle>Individual Responses ({responses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {responses.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No individual responses available</p>
            ) : (
              <div className="space-y-3">
                {responses.map((response, index) => (
                  <Collapsible key={response.id}>
                    <Card className="border">
                      <CollapsibleTrigger 
                        className="w-full"
                        onClick={() => toggleResponse(response.id)}
                      >
                        <div className="p-4 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="bg-assessment-blue text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div className="text-left">
                              <p className="font-medium">Response {index + 1}</p>
                              {response.cefr_level && (
                                <Badge className={`text-xs mt-1 ${getCEFRColor(response.cefr_level)}`}>
                                  {response.cefr_level}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {expandedResponses.has(response.id) ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="px-4 pb-4 space-y-3 border-t pt-3">
                          {/* Audio Player */}
                          {response.audio_url && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <AudioLines className="h-4 w-4" />
                                <span>Your Recording</span>
                              </div>
                              <audio controls className="w-full">
                                <source src={response.audio_url} type="audio/webm" />
                                Your browser does not support the audio element.
                              </audio>
                            </div>
                          )}

                          {/* Transcript */}
                          {response.transcript && (
                            <div>
                              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                <FileText className="h-4 w-4" />
                                <span>Transcript</span>
                              </div>
                              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                                {response.transcript}
                              </p>
                            </div>
                          )}

                          {/* Assessor Notes */}
                          {response.detailed_feedback?.assessor_notes && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="text-sm font-medium text-blue-900 mb-1">Assessor Notes</p>
                              <p className="text-sm text-blue-800">
                                {response.detailed_feedback.assessor_notes}
                              </p>
                            </div>
                          )}

                          {/* Scores for this response */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t">
                            {response.overall_score && (
                              <div>
                                <p className="text-xs text-gray-600">Overall</p>
                                <p className="font-semibold">{Math.round(response.overall_score)}</p>
                              </div>
                            )}
                            {response.fluency_score && (
                              <div>
                                <p className="text-xs text-gray-600">Fluency</p>
                                <p className="font-semibold">{Math.round(response.fluency_score)}</p>
                              </div>
                            )}
                            {response.pronunciation_score && (
                              <div>
                                <p className="text-xs text-gray-600">Pronunciation</p>
                                <p className="font-semibold">{Math.round(response.pronunciation_score)}</p>
                              </div>
                            )}
                            {response.grammar_score && (
                              <div>
                                <p className="text-xs text-gray-600">Grammar</p>
                                <p className="font-semibold">{Math.round(response.grammar_score)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssessmentResults;
