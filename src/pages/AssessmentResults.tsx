import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Clock, FileText, AudioLines, ChevronDown, ChevronUp, User, BookOpen, AlertCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { generateRecommendations } from '@/utils/scoring/recommendationsGenerator';

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

  // Generate learning recommendations based on scores
  const metrics = {
    fluency: session.fluency_score || 0,
    grammar: session.grammar_score || 0,
    pronunciation: session.pronunciation_score || 0,
    prosody: 0,
    vocabulary: session.vocabulary_score || 0,
    syntax: 0,
    coherence: session.coherence_score || 0,
  };
  const recommendations = generateRecommendations(metrics, 3);

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

        {/* Student Information */}
        {session.student_info && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {session.student_info.name && (
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{session.student_info.name}</p>
                  </div>
                )}
                {session.student_info.email && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{session.student_info.email}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assessor Feedback - Prominent Display */}
        {review && (
          <Card className="mb-6 border-2 border-assessment-blue shadow-lg">
            <CardHeader className="bg-gradient-to-r from-assessment-blue/10 to-assessment-lightBlue/10">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CheckCircle className="h-6 w-6 text-assessment-blue" />
                Professional Assessor Review
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Expert feedback and personalized recommendations from your assessor
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Assessor's Notes/Feedback */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-5 w-5 text-assessment-blue" />
                    <h3 className="text-lg font-semibold text-gray-900">Assessor's Notes</h3>
                  </div>
                  <div className="bg-blue-50 border-l-4 border-assessment-blue p-5 rounded-r-lg">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {review.assessor_feedback || 'No detailed notes provided'}
                    </p>
                  </div>
                </div>
                
                {/* Assessor Recommendations */}
                {review.recommendation && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Assessor's Recommendations</h3>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-r-lg">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {review.recommendation}
                      </p>
                    </div>
                  </div>
                )}

                {/* Level Adjustment Explanation */}
                {review.override_scores?.override_reason && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Level Adjustment Note</h3>
                    </div>
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-lg">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {review.override_scores.override_reason}
                      </p>
                    </div>
                  </div>
                )}

                {/* Review Metadata */}
                <Separator />
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                  <span>Review Status: <Badge variant="outline" className="ml-1">{review.review_status}</Badge></span>
                  {review.reviewed_at && (
                    <span>Reviewed: {formatDate(review.reviewed_at)}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Learning Recommendations */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Personalized Learning Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="border-l-4 border-assessment-blue pl-4">
                  <p className="font-medium text-gray-900 mb-2">Focus Area: {rec.area}</p>
                  <ul className="space-y-1">
                    {rec.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-assessment-blue mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                        <div className="px-4 pb-4 space-y-4 border-t pt-4">
                          {/* Audio Player */}
                          {response.audio_url && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <AudioLines className="h-4 w-4" />
                                <span>Your Recording</span>
                                {response.audio_duration && (
                                  <span className="text-xs">({Math.round(response.audio_duration)}s)</span>
                                )}
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
                              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FileText className="h-4 w-4" />
                                <span>Transcript</span>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-800 leading-relaxed">{response.transcript}</p>
                              </div>
                            </div>
                          )}

                          {/* Scores for this response */}
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-3">Performance Scores</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
                              {response.overall_score !== null && response.overall_score !== undefined && (
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Overall</p>
                                  <p className="text-xl font-bold text-assessment-blue">{Math.round(response.overall_score)}</p>
                                </div>
                              )}
                              {response.fluency_score !== null && response.fluency_score !== undefined && (
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Fluency</p>
                                  <p className="text-xl font-bold text-assessment-blue">{Math.round(response.fluency_score)}</p>
                                </div>
                              )}
                              {response.pronunciation_score !== null && response.pronunciation_score !== undefined && (
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Pronunciation</p>
                                  <p className="text-xl font-bold text-assessment-blue">{Math.round(response.pronunciation_score)}</p>
                                </div>
                              )}
                              {response.grammar_score !== null && response.grammar_score !== undefined && (
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Grammar</p>
                                  <p className="text-xl font-bold text-assessment-blue">{Math.round(response.grammar_score)}</p>
                                </div>
                              )}
                              {response.vocabulary_score !== null && response.vocabulary_score !== undefined && (
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Vocabulary</p>
                                  <p className="text-xl font-bold text-assessment-blue">{Math.round(response.vocabulary_score)}</p>
                                </div>
                              )}
                              {response.coherence_score !== null && response.coherence_score !== undefined && (
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Coherence</p>
                                  <p className="text-xl font-bold text-assessment-blue">{Math.round(response.coherence_score)}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Detailed Feedback */}
                          {response.detailed_feedback && Object.keys(response.detailed_feedback).length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                <BookOpen className="h-4 w-4" />
                                <span>Detailed Feedback</span>
                              </div>
                              <div className="space-y-3">
                                {Object.entries(response.detailed_feedback).map(([key, value]) => {
                                  if (typeof value === 'string' && value.trim()) {
                                    return (
                                      <div key={key} className="bg-blue-50 p-3 rounded-lg">
                                        <p className="text-xs font-semibold text-blue-900 uppercase mb-1">
                                          {key.replace(/_/g, ' ')}
                                        </p>
                                        <p className="text-sm text-blue-800">{value}</p>
                                      </div>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            </div>
                          )}

                          {/* Mistakes Analysis */}
                          {response.mistakes_analysis && Object.keys(response.mistakes_analysis).length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                <AlertCircle className="h-4 w-4" />
                                <span>Mistakes & Areas for Improvement</span>
                              </div>
                              <div className="space-y-2">
                                {Object.entries(response.mistakes_analysis).map(([category, mistakes]: [string, any]) => {
                                  if (Array.isArray(mistakes) && mistakes.length > 0) {
                                    return (
                                      <div key={category} className="border border-orange-200 bg-orange-50 p-3 rounded-lg">
                                        <p className="text-sm font-semibold text-orange-900 mb-2 capitalize">
                                          {category.replace(/_/g, ' ')}
                                        </p>
                                        <ul className="space-y-1 ml-4">
                                          {mistakes.map((mistake: any, idx: number) => (
                                            <li key={idx} className="text-sm text-orange-800 list-disc">
                                              {typeof mistake === 'string' ? mistake : mistake.description || JSON.stringify(mistake)}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            </div>
                          )}
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
