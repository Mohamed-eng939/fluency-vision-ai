
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, BookOpen } from 'lucide-react';
import { analyzeVocabularyEnhancements } from '@/utils/assessment/vocabulary/vocabularyEnhancer';

interface VocabularyEnhancementsProps {
  transcript: string;
  currentCefrLevel: string;
}

const VocabularyEnhancements: React.FC<VocabularyEnhancementsProps> = ({
  transcript,
  currentCefrLevel
}) => {
  const analysis = analyzeVocabularyEnhancements(transcript, currentCefrLevel);

  if (analysis.enhancements.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BookOpen className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Great Vocabulary!</h3>
          <p className="text-gray-600">Your vocabulary usage is appropriate for your level.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Vocabulary Enhancement Opportunities
          </CardTitle>
          <p className="text-sm text-gray-600">
            Suggestions to elevate your vocabulary from {analysis.averageWordLevel} to {currentCefrLevel} level
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Vocabulary Level Distribution */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-3">Vocabulary Level Analysis</h4>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-sm">
              {Object.entries(analysis.levelDistribution).map(([level, count]) => (
                <div key={level} className="text-center">
                  <div className="text-xs text-gray-500">{level}</div>
                  <div className="font-semibold text-blue-700">{count}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Average level: <span className="font-semibold">{analysis.averageWordLevel}</span>
            </div>
          </div>

          {/* Enhancement Suggestions */}
          {analysis.enhancements.map((enhancement, index) => (
            <div key={index} className="border-l-4 border-blue-200 pl-4 py-2 bg-blue-50/30 rounded-r">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-blue-700">Instead of:</span>
                      <span className="font-mono text-red-600">"{enhancement.original}"</span>
                    </div>
                    <p className="text-sm text-blue-600 mb-2">{enhancement.reason}</p>
                  </div>
                </div>
                
                <div className="ml-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-green-700">Try these alternatives:</span>
                    <Badge variant="outline" className="text-xs">
                      {enhancement.targetLevel} level
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {enhancement.suggestions.map((suggestion, idx) => (
                      <div key={idx} className="bg-white border rounded p-2">
                        <div className="font-medium text-green-600">"{suggestion}"</div>
                        <div className="text-sm text-gray-600 italic">
                          {enhancement.examples[idx]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <BookOpen className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-yellow-800">Pro Tip:</div>
                <div className="text-yellow-700">
                  Practice using one new word from each suggestion in your next conversation. 
                  This will help you naturally incorporate higher-level vocabulary into your speech.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VocabularyEnhancements;
