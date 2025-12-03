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
  XCircle
} from 'lucide-react';
import { AssessmentResult } from '@/types/assessment';

interface SimplifiedAssessmentResultsProps {
  result: AssessmentResult;
  isProcessing: boolean;
  onReset: () => void;
  onTakeFullAssessment: () => void;
}

interface GrammarError {
  type: 'grammar' | 'spelling';
  bad: string;
  better: string[];
  description: string;
  offset: number;
  length: number;
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
  const grammarAccuracy = grammarApiUsed ? grammarAnalysis.accuracy : null;
  const grammarRange = grammarApiUsed ? grammarAnalysis.range : null;
  const grammarErrors = grammarApiUsed ? (grammarAnalysis.detailedErrors as GrammarError[] ?? []) : [];
  const grammarComments = grammarApiUsed ? (grammarAnalysis.comments ?? []) : [];
  const grammarErrorMessage = !grammarApiUsed ? grammarAnalysis?.error : null;

  // Extract Vocabulary data - CEFR mapping only, NO numeric scores
  const vocabularyCefr = result.audioAnalysis?.cefrVocabularyLevel ?? 'A1';
  const vocabularyDistribution = result.audioAnalysis?.vocabularyDistribution ?? {};
  const vocabularyJustification = result.audioAnalysis?.vocabularyJustification ?? '';
  const lexicalDiversity = result.audioAnalysis?.lexicalDiversity ?? 0;
  const recognizedWordCount = result.audioAnalysis?.recognizedWordCount ?? 0;
  const unrecognizedWordCount = result.audioAnalysis?.unrecognizedWordCount ?? 0;
  const totalWordCount = result.audioAnalysis?.totalWordCount ?? 0;

  // Calculate Overall CEFR from Grammar and Vocabulary
  const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  
  let overallCefr: string;
  if (grammarApiUsed && grammarCefr) {
    // Both available - average them
    const grammarIndex = cefrLevels.indexOf(grammarCefr);
    const vocabIndex = cefrLevels.indexOf(vocabularyCefr);
    const averageIndex = Math.round((grammarIndex + vocabIndex) / 2);
    overallCefr = cefrLevels[averageIndex] || vocabularyCefr;
  } else {
    // Only vocabulary available
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

  if (isProcessing) {
    return (
      <Card className="mb-8">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse text-primary">
            <p className="text-lg font-medium">Analyzing your response...</p>
            <p className="text-sm mt-2 text-muted-foreground">
              Processing grammar and vocabulary analysis.
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
            <div className="text-muted-foreground text-sm">
              {grammarApiUsed 
                ? 'Based on Grammar API and Vocabulary Analysis'
                : 'Based on Vocabulary Analysis (Grammar API unavailable)'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="grammar" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="grammar" className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Grammar
          </TabsTrigger>
          <TabsTrigger value="vocabulary" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Vocabulary
          </TabsTrigger>
          <TabsTrigger value="errors" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Errors ({grammarErrors.length})
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
              {grammarApiUsed ? (
                <>
                  {/* API Results - displayed exactly as received */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{grammarAccuracy?.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">Accuracy (0-10)</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{grammarRange?.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">Range (0-10)</div>
                    </div>
                  </div>

                  {/* Error Count */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Errors Found</span>
                      <Badge variant={grammarErrors.length === 0 ? "default" : "destructive"}>
                        {grammarErrors.length}
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

        {/* Errors Tab - API errors only */}
        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Grammar & Spelling Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!grammarApiUsed ? (
                <div className="text-center py-8">
                  <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">Error analysis not available</p>
                  <p className="text-sm text-muted-foreground">Grammar API was not accessible.</p>
                </div>
              ) : grammarErrors.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                  <p className="text-lg font-medium">No errors found!</p>
                  <p className="text-muted-foreground">Your grammar and spelling are correct.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {grammarErrors.map((error, idx) => (
                    <div key={idx} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={error.type === 'grammar' ? 'default' : 'secondary'}>
                          {error.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-destructive line-through font-medium">
                          {error.bad}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-emerald-600 font-medium">
                          {Array.isArray(error.better) ? error.better.join(' / ') : error.better}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{error.description}</p>
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
