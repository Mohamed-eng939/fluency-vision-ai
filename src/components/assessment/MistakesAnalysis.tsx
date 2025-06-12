
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, AlertCircle, CheckCircle, Volume2, BookOpen, Activity, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AssessmentResult } from '@/types/assessment';
import { analyzeMistakes } from '@/utils/assessment/mistakesAnalysis';
import WaveformVisualization from './WaveformVisualization';
import VocabularyEnhancements from './VocabularyEnhancements';
import ProsodyPanel from './ProsodyPanel';
import MistakeCategory from './mistakes/MistakeCategory';

interface MistakesAnalysisProps {
  result: AssessmentResult;
  promptHistory?: { prompt: any; result?: AssessmentResult }[];
  onDownloadPDF?: () => void;
}

interface TimestampError {
  start: number;
  end: number;
  type: 'phoneme' | 'pause' | 'disfluency';
  message: string;
  phoneme?: string;
}

const MistakesAnalysis: React.FC<MistakesAnalysisProps> = ({ 
  result, 
  promptHistory = [], 
  onDownloadPDF 
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Aggregate mistakes from all responses in prompt history
  const mistakeCategories = useMemo(() => {
    const allMistakes: any[] = [];
    
    // Include current result
    if (result.transcript) {
      const currentMistakes = analyzeMistakes(result);
      allMistakes.push(...currentMistakes);
    }
    
    // Include all historical results
    promptHistory.forEach((item) => {
      if (item.result?.transcript) {
        const historicalMistakes = analyzeMistakes(item.result);
        allMistakes.push(...historicalMistakes);
      }
    });

    // Merge mistakes by category
    const mergedCategories: Record<string, any> = {};
    
    allMistakes.forEach(category => {
      if (mergedCategories[category.name]) {
        mergedCategories[category.name].mistakes.push(...category.mistakes);
      } else {
        mergedCategories[category.name] = { ...category };
      }
    });

    return Object.values(mergedCategories);
  }, [result, promptHistory]);

  const toggleSection = (sectionName: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const totalMistakes = mistakeCategories.reduce((total, category) => total + category.mistakes.length, 0);
  const totalResponses = 1 + promptHistory.length;

  // Check if this is a fallback CEFR level (default B1 when scoring fails)
  const isFallbackCEFR = result.cefrLevel === 'B1' && result.totalScore < 50;

  // Convert pronunciation data to waveform errors
  const waveformErrors: TimestampError[] = useMemo(() => {
    const errors: TimestampError[] = [];
    
    // Add pronunciation errors from MFA data
    if (result.audioAnalysis?.pronunciationDetails?.problematic_phonemes) {
      result.audioAnalysis.pronunciationDetails.problematic_phonemes.forEach(phoneme => {
        if (phoneme.start !== undefined && phoneme.end !== undefined) {
          errors.push({
            start: phoneme.start,
            end: phoneme.end,
            type: 'phoneme',
            message: `Pronunciation issue with /${phoneme.phone}/ sound`,
            phoneme: phoneme.phone
          });
        }
      });
    }

    return errors;
  }, [result.audioAnalysis]);

  if (totalMistakes === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Great Job!</h3>
          <p className="text-gray-600">
            No significant mistakes were detected across your {totalResponses} response{totalResponses !== 1 ? 's' : ''}.
          </p>
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
                {isFallbackCEFR && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-blue-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Some scores were estimated due to technical limitations</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Found {totalMistakes} areas for improvement across {mistakeCategories.length} categories 
                from {totalResponses} response{totalResponses !== 1 ? 's' : ''}
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
        
        <CardContent>
          <Tabs defaultValue="mistakes" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="mistakes">Mistakes & Issues</TabsTrigger>
              <TabsTrigger value="audio">
                <Volume2 className="h-4 w-4 mr-2" />
                Audio Timeline
              </TabsTrigger>
              <TabsTrigger value="prosody">
                <Activity className="h-4 w-4 mr-2" />
                Prosody
              </TabsTrigger>
              <TabsTrigger value="vocabulary">
                <BookOpen className="h-4 w-4 mr-2" />
                Vocabulary
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="mistakes" className="space-y-4 mt-4">
              {mistakeCategories.map((category) => (
                <MistakeCategory
                  key={category.name}
                  category={category}
                  isOpen={openSections[category.name]}
                  onToggle={() => toggleSection(category.name)}
                />
              ))}
            </TabsContent>
            
            <TabsContent value="audio" className="mt-4">
              <WaveformVisualization
                audioUrl={result.audioUrl}
                errors={waveformErrors}
                duration={result.duration || 10}
              />
            </TabsContent>
            
            <TabsContent value="prosody" className="mt-4">
              <ProsodyPanel audioAnalysis={result.audioAnalysis} />
            </TabsContent>
            
            <TabsContent value="vocabulary" className="mt-4">
              <VocabularyEnhancements
                transcript={result.transcript || ''}
                currentCefrLevel={result.cefrLevel}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-gray-500">
        <p>This analysis combines automated detection with MFA pronunciation analysis and prosody evaluation.</p>
        <p>Pronunciation scoring uses Montreal Forced Alignment for detailed phoneme-level feedback.</p>
        {isFallbackCEFR && (
          <p className="text-blue-600 mt-1">
            ⓘ Some scores were estimated using fallback methods due to technical limitations.
          </p>
        )}
      </div>
    </div>
  );
};

export default MistakesAnalysis;
