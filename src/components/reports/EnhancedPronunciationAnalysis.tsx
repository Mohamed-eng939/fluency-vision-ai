
import React, { useRef } from 'react';
import WaveformVisualization, { WaveformVisualizationRef } from '../assessment/WaveformVisualization';
import PronunciationRadarChart from './PronunciationRadarChart';

interface TimestampError {
  start: number;
  end: number;
  type: 'phoneme' | 'pause' | 'disfluency';
  message: string;
  phoneme?: string;
}

interface PronunciationData {
  wordAccuracy: number;
  phonemeAccuracy: number;
  speechRate: number;
  targetSpeechRate: string;
  overallScore: number;
  cefrLevel: string;
}

interface EnhancedPronunciationAnalysisProps {
  pronunciationData: PronunciationData;
  audioUrl?: string;
  waveformErrors: TimestampError[];
  duration: number;
}

const EnhancedPronunciationAnalysis: React.FC<EnhancedPronunciationAnalysisProps> = ({
  pronunciationData,
  audioUrl,
  waveformErrors,
  duration
}) => {
  const waveformRef = useRef<WaveformVisualizationRef>(null);

  return (
    <div className="pronunciation-analysis-section mt-8">
      <h3 className="text-xl font-semibold mb-4 text-assessment-blue">Enhanced Pronunciation Analysis</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-medium mb-2">Audio Timeline Analysis</h4>
          <WaveformVisualization
            ref={waveformRef}
            audioUrl={audioUrl}
            errors={waveformErrors}
            duration={duration}
            forPDF={false}
          />
        </div>
        
        <div>
          <h4 className="text-lg font-medium mb-2">Pronunciation Profile</h4>
          <PronunciationRadarChart
            pronunciationData={pronunciationData}
            forPDF={false}
          />
        </div>
      </div>
    </div>
  );
};

export default EnhancedPronunciationAnalysis;
