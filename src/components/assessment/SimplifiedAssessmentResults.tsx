import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Languages, 
  Award, 
  AlertCircle, 
  CheckCircle2,
  FileText,
  XCircle,
  Mic
} from 'lucide-react';
import { AssessmentResult } from '@/types/assessment';

interface SimplifiedAssessmentResultsProps {
  result: AssessmentResult;
  isProcessing: boolean;
  onReset: () => void;
  onTakeFullAssessment: () => void;
}

const SimplifiedAssessmentResults: React.FC<SimplifiedAssessmentResultsProps> = ({
  result,
  isProcessing,
  onReset,
  onTakeFullAssessment
}) => {
  // Extract Grammar API data - NO fallbacks
  const grammarAnalysis = result.audioAnalysis?.grammarApiAnalysis;
  const grammarApiUsed = grammarAnalysis?.apiUsed === true;
  const grammarCefr = grammarApiUsed ? grammarAnalysis.cefr : null;
  const grammarScores = grammarApiUsed ? grammarAnalysis.scores : null;
  const grammarErrorCount = grammarApiUsed ? grammarAnalysis.errors : 0;
  const grammarComments = grammarApiUsed ? (grammarAnalysis.comments ?? []) : [];
  const grammarErrorMessage = !grammarApiUsed ? (grammarAnalysis as any)?.error : null;

  // Extract Fluency API data - NO fallbacks
  const fluencyAnalysis = result.audioAnalysis?.fluencyApiAnalysis;
  const fluencyApiUsed = fluencyAnalysis?.apiUsed === true;
  const fluencyCefr = fluencyApiUsed ? fluencyAnalysis.cefr : null;
  const fluencySyllables = fluencyApiUsed ? (fluencyAnalysis as any).syllables : null;
  const fluencySpm = fluencyApiUsed ? (fluencyAnalysis as any).spm : null;
  const fluencyErrorMessage = !fluencyApiUsed ? (fluencyAnalysis as any)?.error : null;

  // Extract Vocabulary data - CEFR mapping only, NO numeric scores
  const vocabularyCefr = result.audioAnalysis?.cefrVocabularyLevel ?? 'A1';
  const vocabularyDistribution = result.audioAnalysis?.vocabularyDistribution ?? {};
  const vocabularyJustification = result.audioAnalysis?.vocabularyJustification ?? '';
  const lexicalDiversity = result.audioAnalysis?.lexicalDiversity ?? 0;
  const recognizedWordCount = result.audioAnalysis?.recognizedWordCount ?? 0;
  const unrecognizedWordCount = result.audioAnalysis?.unrecognizedWordCount ?? 0;
  const totalWordCount = result.audioAnalysis?.totalWordCount ?? 0;

  // Calculate Overall CEFR from Grammar, Fluency, and Vocabulary
  const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  
  const availableCefrLevels: string[] = [];
  if (grammarApiUsed && grammarCefr) availableCefrLevels.push(grammarCefr);
  if (fluencyApiUsed && fluencyCefr) availableCefrLevels.push(fluencyCefr);
  availableCefrLevels.push(vocabularyCefr);

  let overallCefr: string;
  if (availableCefrLevels.length > 0) {
    const totalIndex = availableCefrLevels.reduce((sum, level) => {
      return sum + cefrLevels.indexOf(level);
    }, 0);
    const averageIndex = Math.round(totalIndex / availableCefrLevels.length);
    overallCefr = cefrLevels[averageIndex] || vocabularyCefr;
  } else {
    overallCefr = vocabularyCefr;
  }

  // Get CEFR color
  const getCefrColor = (level: string | null) => {
    if (!level) return 'bg-muted';
    switch (level) {
      case 'C2': return 'bg-purple-500';
      case 'C1': return 'bg-blue-600';
      case 'B2': return 'bg-emerald-500';
      case 'B1': return 'bg-teal-500';
      case 'A2': return 'bg-amber-500';
      case 'A1': return 'bg-orange-500';
      default: return 'bg-muted';
    }
  };

  // Get sources text
  const getSourcesText = () => {
    const sources: string[] = [];
    if (grammarApiUsed) sources.push('Grammar API');
    if (fluencyApiUsed) sources.push('Fluency API');
    sources.push('Vocabulary Analysis');
    return `Based on ${sources.join(', ')}`;
  };

  if (isProcessing) {
    return (
      <Card className="mb-8">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse text-primary">
            <p className="text-lg font-medium">Analyzing your response...</p>
            <p className="text-sm mt-2 text-muted-foreground">
              Processing grammar, fluency, and vocabulary analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall CEFR Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Assessment Results
            </span>
            <Badge className={`${getCefrColor(overallCefr)} text-white text-lg px-4 py-1`}>
              {overallCefr}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-3xl font-bold text-primary mb-2">Overall CEFR Level</div>
            <div className="text-muted-foreground text-sm">{getSourcesText()}</div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="grammar" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="grammar" className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Grammar
          </TabsTrigger>
          <TabsTrigger value="fluency" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Fluency
          </TabsTrigger>
          <TabsTrigger value="vocabulary" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Vocabulary
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Feedback
          </TabsTrigger>
        </TabsList>

        {/* Grammar Tab - API data only */}
        <TabsContent value="grammar">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <Languages className="h-5 w-5 text-primary" />
                  Grammar Analysis
                </span>
                {grammarApiUsed && grammarCefr && (
                  <Badge className={`${getCefrColor(grammarCefr)} text-white`}>
                    {grammarCefr}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Powered by Grammar Service API
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {grammarApiUsed && grammarScores ? (
                <>
                  {/* API Results - displayed exactly as received */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{(grammarScores.accuracy * 100).toFixed(0)}%</div>
                      <div className="text-xs text-muted-foreground">Accuracy</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{(grammarScores.complexity * 100).toFixed(0)}%</div>
                      <div className="text-xs text-muted-foreground">Complexity</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{(grammarScores.lexical * 100).toFixed(0)}%</div>
                      <div className="text-xs text-muted-foreground">Lexical</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{(grammarScores.structure * 100).toFixed(0)}%</div>
                      <div className="text-xs text-muted-foreground">Structure</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{(grammarScores.final * 100).toFixed(0)}%</div>
                      <div className="text-xs text-muted-foreground">Final Score</div>
                    </div>
                  </div>

                  {/* Error Count */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Errors Found</span>
                      <Badge variant={grammarErrorCount === 0 ? "default" : "destructive"}>
                        {grammarErrorCount}
                      </Badge>
                    </div>
                  </div>

                  {/* Comments from API */}
                  {grammarComments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Feedback</h4>
                      <div className="space-y-2">
                        {grammarComments.map((comment, idx) => (
                          <div key={idx} className="bg-muted/50 p-3 rounded-lg text-sm">
                            {comment}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Grammar API not available - show message */
                <div className="text-center py-8">
                  <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">Grammar Analysis Not Available</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {grammarErrorMessage || 'The grammar service could not be reached.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fluency Tab - API data only */}
        <TabsContent value="fluency">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <Mic className="h-5 w-5 text-primary" />
                  Fluency Analysis
                </span>
                {fluencyApiUsed && fluencyCefr && (
                  <Badge className={`${getCefrColor(fluencyCefr)} text-white`}>
                    {fluencyCefr}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Powered by Fluency Service API
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {fluencyApiUsed && fluencyCefr ? (
                <div className="space-y-6">
                  <div className="text-center py-4">
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getCefrColor(fluencyCefr)} text-white mb-4`}>
                      <span className="text-3xl font-bold">{fluencyCefr}</span>
                    </div>
                    <p className="text-lg font-medium">Fluency Level</p>
                  </div>

                  {/* Fluency Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{fluencySyllables ?? '-'}</div>
                      <div className="text-xs text-muted-foreground">Syllables</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{fluencySpm ?? '-'}</div>
                      <div className="text-xs text-muted-foreground">Syllables per Minute</div>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm text-center">
                    Based on speech patterns and timing analysis
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">Fluency Analysis Not Available</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {fluencyErrorMessage || 'The fluency service could not be reached.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vocabulary Tab - CEFR mapping only, NO numeric scores */}
        <TabsContent value="vocabulary">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Vocabulary Analysis
                </span>
                <Badge className={`${getCefrColor(vocabularyCefr)} text-white`}>
                  {vocabularyCefr}
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Based on CEFR Word List Mapping
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Word Recognition Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">{totalWordCount}</div>
                  <div className="text-xs text-muted-foreground">Total Words</div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-emerald-600">{recognizedWordCount}</div>
                  <div className="text-xs text-muted-foreground">Recognized</div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-amber-600">{unrecognizedWordCount}</div>
                  <div className="text-xs text-muted-foreground">Not in List</div>
                </div>
              </div>

              {/* Lexical Diversity */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Lexical Diversity</span>
                  <span className="text-sm font-bold">{(lexicalDiversity * 100).toFixed(0)}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ratio of unique words to total words
                </p>
              </div>

              {/* CEFR Distribution */}
              {Object.keys(vocabularyDistribution).length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">CEFR Word Distribution</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => {
                      const count = vocabularyDistribution[level] || 0;
                      return (
                        <div key={level} className="bg-muted/50 p-2 rounded text-center">
                          <Badge className={`${getCefrColor(level)} text-white mb-1`}>
                            {level}
                          </Badge>
                          <div className="text-lg font-bold">{count}</div>
                          <div className="text-xs text-muted-foreground">words</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Justification */}
              {vocabularyJustification && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Analysis Details</h4>
                  <div className="text-sm whitespace-pre-line text-muted-foreground">
                    {vocabularyJustification}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Tab - Comments from APIs */}
        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Feedback & Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {grammarComments.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                  <p className="text-lg font-medium">Great job!</p>
                  <p className="text-muted-foreground">No specific improvement suggestions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {grammarComments.map((comment, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <p className="text-sm">{comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transcript */}
      {result.transcript && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Your Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm bg-muted/50 p-4 rounded-lg">{result.transcript}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-4">
        <Button onClick={onReset} variant="outline">
          Take Another Assessment
        </Button>
        <Button onClick={onTakeFullAssessment} className="bg-primary hover:bg-primary/90">
          Take Full Assessment
        </Button>
      </div>
    </div>
  );
};

export default SimplifiedAssessmentResults;
