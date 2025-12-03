import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
  Download
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
  // Extract Grammar API data
  const grammarAnalysis = result.audioAnalysis?.grammarApiAnalysis;
  const grammarScore = grammarAnalysis?.accuracy ?? result.metrics.grammar;
  const grammarCefr = grammarAnalysis?.cefr ?? result.cefrLevel;
  const grammarRange = grammarAnalysis?.range ?? 0;
  const grammarErrors = grammarAnalysis?.detailedErrors as GrammarError[] ?? [];
  const grammarComments = grammarAnalysis?.comments ?? [];
  const grammarApiUsed = grammarAnalysis?.apiUsed ?? false;

  // Extract Vocabulary data from audioMetrics
  const vocabularyScore = result.metrics.vocabulary;
  const vocabularyCefr = result.audioAnalysis?.cefrVocabularyLevel ?? result.cefrLevel;
  const vocabularyDistribution = result.audioAnalysis?.vocabularyDistribution ?? {};
  const vocabularyJustification = result.audioAnalysis?.vocabularyJustification ?? '';
  const lexicalDiversity = result.audioAnalysis?.lexicalDiversity ?? 0;

  // Calculate Overall CEFR from Grammar and Vocabulary
  const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const grammarIndex = cefrLevels.indexOf(grammarCefr);
  const vocabIndex = cefrLevels.indexOf(vocabularyCefr);
  const averageIndex = Math.round((grammarIndex + vocabIndex) / 2);
  const overallCefr = cefrLevels[averageIndex] || result.cefrLevel;

  // Calculate overall score (average of grammar and vocabulary)
  const overallScore = ((grammarScore + vocabularyScore) / 2).toFixed(1);

  // Get CEFR color
  const getCefrColor = (level: string) => {
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

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-emerald-500';
    if (score >= 6) return 'bg-teal-500';
    if (score >= 4) return 'bg-amber-500';
    return 'bg-red-500';
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
      {/* Overall Score Card */}
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
            <div className="text-5xl font-bold text-primary mb-2">{overallScore}</div>
            <div className="text-muted-foreground">Overall Score (out of 10)</div>
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

        {/* Grammar Tab */}
        <TabsContent value="grammar">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <Languages className="h-5 w-5 text-primary" />
                  Grammar Analysis
                </span>
                <Badge className={`${getCefrColor(grammarCefr)} text-white`}>
                  {grammarCefr}
                </Badge>
              </CardTitle>
              {grammarApiUsed && (
                <p className="text-xs text-muted-foreground">
                  Powered by Grammar Service API
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Accuracy Score */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Accuracy</span>
                  <span className="text-sm font-bold">{grammarScore.toFixed(1)}/10</span>
                </div>
                <Progress 
                  value={grammarScore * 10} 
                  className={`h-3 ${getScoreColor(grammarScore)}`}
                />
              </div>

              {/* Range Score */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Grammar Range</span>
                  <span className="text-sm font-bold">{grammarRange.toFixed(1)}/10</span>
                </div>
                <Progress 
                  value={grammarRange * 10} 
                  className={`h-3 ${getScoreColor(grammarRange)}`}
                />
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vocabulary Tab */}
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
                Based on CEFR Word List
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vocabulary Score */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Vocabulary Score</span>
                  <span className="text-sm font-bold">{vocabularyScore.toFixed(1)}/10</span>
                </div>
                <Progress 
                  value={vocabularyScore * 10} 
                  className={`h-3 ${getScoreColor(vocabularyScore)}`}
                />
              </div>

              {/* Lexical Diversity */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Lexical Diversity</span>
                  <span className="text-sm font-bold">{(lexicalDiversity * 100).toFixed(0)}%</span>
                </div>
                <Progress 
                  value={lexicalDiversity * 100} 
                  className={`h-3 ${lexicalDiversity > 0.6 ? 'bg-emerald-500' : lexicalDiversity > 0.4 ? 'bg-amber-500' : 'bg-red-500'}`}
                />
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

        {/* Errors Tab */}
        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Grammar & Spelling Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {grammarErrors.length === 0 ? (
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
                          {error.better.join(' / ')}
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
