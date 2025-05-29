
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, AlertCircle, CheckCircle, Volume2, BookOpen } from 'lucide-react';
import { AssessmentResult } from '@/types/assessment';
import { analyzeMistakes } from '@/utils/assessment/mistakesAnalysis';
import WaveformVisualization from './WaveformVisualization';
import VocabularyEnhancements from './VocabularyEnhancements';
import MistakeCategory from './mistakes/MistakeCategory';

interface MistakesAnalysisProps {
  result: AssessmentResult;
  onDownloadPDF?: () => void;
}

interface TimestampError {
  start: number;
  end: number;
  type: 'phoneme' | 'pause' | 'disfluency';
  message: string;
  phoneme?: string;
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
        
        <CardContent>
          <Tabs defaultValue="mistakes" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mistakes">Mistakes & Issues</TabsTrigger>
              <TabsTrigger value="audio">
                <Volume2 className="h-4 w-4 mr-2" />
                Audio Timeline
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
        <p>This analysis combines automated detection with MFA pronunciation analysis when available.</p>
        <p>Pronunciation scoring uses Montreal Forced Alignment for detailed phoneme-level feedback.</p>
      </div>
    </div>
  );
};

export default MistakesAnalysis;
