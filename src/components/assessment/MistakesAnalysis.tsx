
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Download, ChevronDown, ChevronRight, AlertCircle, CheckCircle, Lightbulb, Volume2, Clock } from 'lucide-react';
import { AssessmentResult } from '@/types/assessment';
import { analyzeMistakes } from '@/utils/assessment/mistakesAnalysis';

interface MistakesAnalysisProps {
  result: AssessmentResult;
  onDownloadPDF?: () => void;
}

interface MistakeItem {
  original: string;
  correction: string;
  suggestion: string;
  cefrLevel?: string;
  context?: string;
  phoneme?: string;
  issue?: string;
  startTime?: number;
  endTime?: number;
}

interface MistakeCategory {
  name: string;
  mistakes: MistakeItem[];
  icon: React.ReactNode;
  color: string;
  summaryStats?: {
    wordAccuracy?: number;
    phonemeAccuracy?: number;
    speechRate?: number;
    targetSpeechRate?: string;
    overallScore?: number;
    cefrLevel?: string;
  };
}

const MistakesAnalysis: React.FC<MistakesAnalysisProps> = ({ result, onDownloadPDF }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const mistakeCategories = useMemo(() => {
    if (!result.transcript) return [];
    return analyzeMistakes(result);
  }, [result]);

  const toggleSection = (sectionName: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const totalMistakes = mistakeCategories.reduce((total, category) => total + category.mistakes.length, 0);

  const formatTime = (seconds: number) => {
    return `${seconds.toFixed(1)}s`;
  };

  if (totalMistakes === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Great Job!</h3>
          <p className="text-gray-600">No significant mistakes were detected in your response.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Check My Mistakes
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Found {totalMistakes} areas for improvement across {mistakeCategories.length} categories
              </p>
            </div>
            {onDownloadPDF && (
              <Button variant="outline" size="sm" onClick={onDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {mistakeCategories.map((category) => (
            <Collapsible
              key={category.name}
              open={openSections[category.name]}
              onOpenChange={() => toggleSection(category.name)}
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    {category.icon}
                    <span className="font-medium">{category.name}</span>
                    <Badge variant="secondary" className={category.color}>
                      {category.mistakes.length} issue{category.mistakes.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  {openSections[category.name] ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="mt-3 space-y-4">
                  {/* Summary stats for pronunciation */}
                  {category.summaryStats && (
                    <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-blue-800 mb-3">Pronunciation Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {category.summaryStats.overallScore && (
                          <div>
                            <span className="text-gray-600">Overall Score:</span>
                            <div className="font-semibold text-blue-700">
                              {category.summaryStats.overallScore.toFixed(1)}/9 ({category.summaryStats.cefrLevel})
                            </div>
                          </div>
                        )}
                        {category.summaryStats.wordAccuracy && (
                          <div>
                            <span className="text-gray-600">Word Accuracy:</span>
                            <div className="font-semibold text-blue-700">
                              {(category.summaryStats.wordAccuracy * 100).toFixed(0)}%
                            </div>
                          </div>
                        )}
                        {category.summaryStats.phonemeAccuracy && (
                          <div>
                            <span className="text-gray-600">Sound Accuracy:</span>
                            <div className="font-semibold text-blue-700">
                              {(category.summaryStats.phonemeAccuracy * 100).toFixed(0)}%
                            </div>
                          </div>
                        )}
                        {category.summaryStats.speechRate && (
                          <div>
                            <span className="text-gray-600">Speech Rate:</span>
                            <div className="font-semibold text-blue-700">
                              {category.summaryStats.speechRate.toFixed(0)} wpm
                              {category.summaryStats.targetSpeechRate && (
                                <div className="text-xs text-gray-500">
                                  Target: {category.summaryStats.targetSpeechRate}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {category.mistakes.map((mistake, index) => (
                    <div key={index} className="border-l-4 border-red-200 pl-4 py-2 bg-red-50/50 rounded-r">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                          <div className="flex-1">
                            {mistake.phoneme ? (
                              <div>
                                <span className="font-medium text-red-700">Sound Issue: </span>
                                <span className="text-red-600 font-mono">/{mistake.phoneme}/</span>
                                {mistake.issue && (
                                  <span className="text-red-600 ml-2">({mistake.issue})</span>
                                )}
                                {mistake.startTime !== undefined && mistake.endTime !== undefined && (
                                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(mistake.startTime)} - {formatTime(mistake.endTime)}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <span className="font-medium text-red-700">Original: </span>
                                <span className="text-red-600">"{mistake.original}"</span>
                                {mistake.context && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Context: {mistake.context}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <div>
                            <span className="font-medium text-green-700">
                              {mistake.phoneme ? 'Practice Tip: ' : 'Correction: '}
                            </span>
                            <span className="text-green-600">
                              {mistake.phoneme ? mistake.suggestion : `"${mistake.correction}"`}
                            </span>
                          </div>
                        </div>
                        
                        {!mistake.phoneme && (
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />
                            <div className="flex-1">
                              <span className="font-medium text-blue-700">Suggestion: </span>
                              <span className="text-blue-600">{mistake.suggestion}</span>
                              {mistake.cefrLevel && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {mistake.cefrLevel}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-gray-500">
        <p>This analysis combines automated detection with MFA pronunciation analysis when available.</p>
        <p>Pronunciation scoring uses Montreal Forced Alignment for detailed phoneme-level feedback.</p>
      </div>
    </div>
  );
};

export default MistakesAnalysis;
