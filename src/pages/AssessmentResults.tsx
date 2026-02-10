import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Clock, FileText, AudioLines, ChevronDown, ChevronUp, User, BookOpen, AlertCircle, TrendingUp, Languages, Mic } from 'lucide-react';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';

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

      const { data: sessionData, error: sessionError } = await supabase
        .from('assessment_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData);

      const { data: responsesData, error: responsesError } = await supabase
        .from('assessment_responses')
        .select('*')
        .eq('session_id', sessionId)
        .order('prompt_order');

      if (responsesError) throw responsesError;
      setResponses(responsesData || []);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  /** Extract per-response scoring from detailed_feedback/mistakes_analysis */
  const getResponseScoringData = (response: any) => {
    const feedback = response.detailed_feedback || {};
    const analysis = response.mistakes_analysis || {};
    
    const grammarApi = analysis.grammarApiAnalysis || feedback.grammarApiAnalysis;
    const grammarCefr = grammarApi?.apiUsed ? grammarApi.cefr : null;
    const grammarScores = grammarApi?.apiUsed ? grammarApi.scores : null;
    const grammarComments = grammarApi?.apiUsed ? (grammarApi.comments ?? []) : [];
    
    const fluencyApi = analysis.fluencyApiAnalysis || feedback.fluencyApiAnalysis;
    const fluencyCefr = fluencyApi?.apiUsed ? fluencyApi.cefr : null;
    const fluencySpm = fluencyApi?.apiUsed ? fluencyApi.spm : null;
    const fluencySyllables = fluencyApi?.apiUsed ? fluencyApi.syllables : null;
    
    const vocabCefr = analysis.cefrVocabularyLevel || feedback.cefrVocabularyLevel || null;
    
    return { grammarCefr, grammarScores, grammarComments, fluencyCefr, fluencySpm, fluencySyllables, vocabCefr };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading your assessment results...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-lg text-muted-foreground mb-4">Assessment not found</p>
            <Button onClick={() => navigate('/')}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isReviewed = (session.reviewed_at && review) || session.status === 'approved' || session.status === 'rejected';
  const finalCEFR = review?.override_scores?.final_cefr_level || session.overall_cefr_level;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/')} className="mb-4">
            ← Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-primary mb-2">Assessment Results</h1>
          <p className="text-muted-foreground">Completed on {formatDate(session.created_at)}</p>
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
                  <p className="text-sm text-muted-foreground">
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

        {/* Overall CEFR - Only 3 criteria */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Overall Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Overall CEFR Level</p>
                <Badge className={`text-2xl px-6 py-2 ${getCEFRColor(finalCEFR)}`}>
                  {finalCEFR || 'N/A'}
                </Badge>
                {review?.override_scores?.is_overridden && (
                  <p className="text-xs text-muted-foreground mt-2">Assessor adjusted</p>
                )}
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground mb-4">
              Based on Grammar API, Fluency API, and Vocabulary Analysis
            </p>
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
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{session.student_info.name}</p>
                  </div>
                )}
                {session.student_info.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{session.student_info.email}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assessor Feedback */}
        {review && (
          <Card className="mb-6 border-2 border-primary shadow-lg">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CheckCircle className="h-6 w-6 text-primary" />
                Professional Assessor Review
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Expert feedback and personalized recommendations
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Assessor's Notes</h3>
                  </div>
                  <div className="bg-blue-50 border-l-4 border-primary p-5 rounded-r-lg">
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {review.assessor_feedback || 'No detailed notes provided'}
                    </p>
                  </div>
                </div>
                
                {review.recommendation && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold">Recommendations</h3>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-r-lg">
                      <p className="leading-relaxed whitespace-pre-wrap">{review.recommendation}</p>
                    </div>
                  </div>
                )}

                {review.override_scores?.override_reason && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <h3 className="text-lg font-semibold">Level Adjustment Note</h3>
                    </div>
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-lg">
                      <p className="leading-relaxed whitespace-pre-wrap">{review.override_scores.override_reason}</p>
                    </div>
                  </div>
                )}

                <Separator />
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                  <span>Review Status: <Badge variant="outline" className="ml-1">{review.review_status}</Badge></span>
                  {review.reviewed_at && <span>Reviewed: {formatDate(review.reviewed_at)}</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Individual Responses - showing only Grammar, Fluency, Vocabulary CEFR */}
        <Card>
          <CardHeader>
            <CardTitle>Individual Responses ({responses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {responses.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No individual responses available</p>
            ) : (
              <div className="space-y-3">
                {responses.map((response, index) => {
                  const scoring = getResponseScoringData(response);
                  return (
                  <Collapsible key={response.id}>
                    <Card className="border">
                      <CollapsibleTrigger 
                        className="w-full"
                        onClick={() => toggleResponse(response.id)}
                      >
                        <div className="p-4 flex items-center justify-between hover:bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
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
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="px-4 pb-4 space-y-4 border-t pt-4">
                          {/* Audio Player */}
                          {response.audio_url && (
                            <div className="bg-muted/50 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
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
                              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                                <FileText className="h-4 w-4" />
                                <span>Transcript</span>
                              </div>
                              <div className="bg-muted/50 p-4 rounded-lg">
                                <p className="leading-relaxed">{response.transcript}</p>
                              </div>
                            </div>
                          )}

                          {/* Scores - Only Grammar, Fluency, Vocabulary CEFR */}
                          <div>
                            <p className="text-sm font-medium mb-3">Performance</p>
                            <div className="grid grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg">
                              <div className="text-center">
                                <Languages className="h-5 w-5 mx-auto mb-1 text-primary" />
                                <p className="text-xs text-muted-foreground mb-1">Grammar</p>
                                {scoring.grammarCefr ? (
                                  <Badge className={getCEFRColor(scoring.grammarCefr)}>{scoring.grammarCefr}</Badge>
                                ) : (
                                  <span className="text-sm text-muted-foreground">N/A</span>
                                )}
                              </div>
                              <div className="text-center">
                                <Mic className="h-5 w-5 mx-auto mb-1 text-primary" />
                                <p className="text-xs text-muted-foreground mb-1">Fluency</p>
                                {scoring.fluencyCefr ? (
                                  <>
                                    <Badge className={getCEFRColor(scoring.fluencyCefr)}>{scoring.fluencyCefr}</Badge>
                                    {scoring.fluencySpm && (
                                      <p className="text-xs text-muted-foreground mt-1">{scoring.fluencySpm} SPM</p>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-sm text-muted-foreground">N/A</span>
                                )}
                              </div>
                              <div className="text-center">
                                <BookOpen className="h-5 w-5 mx-auto mb-1 text-primary" />
                                <p className="text-xs text-muted-foreground mb-1">Vocabulary</p>
                                {scoring.vocabCefr ? (
                                  <Badge className={getCEFRColor(scoring.vocabCefr)}>{scoring.vocabCefr}</Badge>
                                ) : (
                                  <span className="text-sm text-muted-foreground">N/A</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Grammar comments if available */}
                          {scoring.grammarComments.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Grammar Feedback</p>
                              <div className="space-y-2">
                                {scoring.grammarComments.map((comment: string, idx: number) => (
                                  <div key={idx} className="bg-muted/50 p-3 rounded-lg text-sm">
                                    {comment}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssessmentResults;
