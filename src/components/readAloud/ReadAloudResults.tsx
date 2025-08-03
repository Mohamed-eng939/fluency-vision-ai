import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReadAloudResult } from '@/data/readAloud/sentenceBank';
import { aggregateReadAloudScores } from '@/utils/readAloud/pronunciationScoring';

interface ReadAloudResultsProps {
  results: ReadAloudResult[];
}

export const ReadAloudResults: React.FC<ReadAloudResultsProps> = ({ results }) => {
  const aggregated = aggregateReadAloudScores(results);
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Read Aloud Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold">{aggregated.averageScore.toFixed(1)}/5.0</div>
          <Badge variant="secondary" className="text-lg px-4 py-1">
            CEFR Level: {aggregated.cefrLevel}
          </Badge>
        </div>
        
        {/* Error Summary */}
        {Object.keys(aggregated.errorSummary).length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Areas for Improvement:</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(aggregated.errorSummary).map(([errorType, count]) => (
                <div key={errorType} className="flex justify-between p-2 bg-muted rounded">
                  <span className="capitalize">{errorType}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Individual Results */}
        <div>
          <h3 className="font-medium mb-2">Sentence Scores:</h3>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div key={result.sentenceId} className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="text-sm">Sentence {index + 1}</span>
                <span className="font-medium">{result.score.toFixed(1)}/5.0</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};