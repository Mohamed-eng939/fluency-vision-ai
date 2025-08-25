import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IPAComparison } from '@/utils/ipa/ipaTranscriptionService';

interface IPAComparisonProps {
  comparison: IPAComparison;
  sentence: string;
}

export const IPAComparisonComponent: React.FC<IPAComparisonProps> = ({ 
  comparison, 
  sentence 
}) => {
  const renderIPAWithHighlights = (
    ipa: string, 
    differences: IPAComparison['differences'], 
    isExpected: boolean
  ) => {
    const phonemes = ipa.replace(/\s/g, '').split('');
    
    return (
      <div className="font-mono text-lg leading-relaxed">
        {phonemes.map((phoneme, index) => {
          const difference = differences.find(d => d.position === index);
          let className = 'inline-block px-1';
          
          if (difference) {
            if (isExpected) {
              className += ' bg-red-100 text-red-800 border-b-2 border-red-400';
            } else {
              className += ' bg-orange-100 text-orange-800 border-b-2 border-orange-400';
            }
          } else {
            className += ' bg-green-100 text-green-800';
          }
          
          return (
            <span key={index} className={className} title={difference?.type}>
              {phoneme}
            </span>
          );
        })}
      </div>
    );
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'bg-green-500';
    if (accuracy >= 80) return 'bg-yellow-500';
    if (accuracy >= 70) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getAccuracyLabel = (accuracy: number) => {
    if (accuracy >= 90) return 'Excellent';
    if (accuracy >= 80) return 'Good';
    if (accuracy >= 70) return 'Needs Work';
    return 'Poor';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>IPA Pronunciation Analysis</span>
          <Badge 
            className={`text-white ${getAccuracyColor(comparison.accuracy)}`}
          >
            {comparison.accuracy.toFixed(1)}% - {getAccuracyLabel(comparison.accuracy)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Original Sentence */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">
            Original Sentence:
          </h4>
          <p className="text-base font-medium">{sentence}</p>
        </div>

        {/* Expected IPA */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">
            Expected Pronunciation (IPA):
          </h4>
          {renderIPAWithHighlights(
            comparison.expected.ipa, 
            comparison.differences, 
            true
          )}
        </div>

        {/* Actual IPA */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">
            Your Pronunciation (IPA):
          </h4>
          {renderIPAWithHighlights(
            comparison.actual.ipa, 
            comparison.differences, 
            false
          )}
        </div>

        {/* Legend */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-sm text-muted-foreground mb-2">
            Legend:
          </h4>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 bg-green-100 border border-green-300 rounded"></span>
              <span>Correct</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 bg-red-100 border-b-2 border-red-400 rounded"></span>
              <span>Expected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 bg-orange-100 border-b-2 border-orange-400 rounded"></span>
              <span>Your pronunciation</span>
            </div>
          </div>
        </div>

        {/* Error Summary */}
        {comparison.differences.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">
              Pronunciation Errors ({comparison.differences.length}):
            </h4>
            <div className="space-y-2">
              {comparison.differences.slice(0, 5).map((diff, index) => (
                <div key={index} className="text-sm flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {diff.type}
                  </Badge>
                  <span>
                    {diff.type === 'substitution' && 
                      `Expected /${diff.expectedPhoneme}/, said /${diff.actualPhoneme}/`
                    }
                    {diff.type === 'omission' && 
                      `Missing /${diff.expectedPhoneme}/`
                    }
                    {diff.type === 'insertion' && 
                      `Added extra /${diff.actualPhoneme}/`
                    }
                  </span>
                </div>
              ))}
              {comparison.differences.length > 5 && (
                <p className="text-xs text-muted-foreground">
                  And {comparison.differences.length - 5} more errors...
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};