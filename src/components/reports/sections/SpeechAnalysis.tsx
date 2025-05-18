
import React from 'react';
import { AudioAnalysisResult } from '@/utils/audio/types';
import { Progress } from '@/components/ui/progress';
import { Info } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface SpeechAnalysisProps {
  audioAnalysis: AudioAnalysisResult;
  compact?: boolean;
}

const SpeechAnalysis: React.FC<SpeechAnalysisProps> = ({ 
  audioAnalysis,
  compact = false 
}) => {
  const metrics = [
    {
      name: 'Words Per Minute',
      value: Math.round(audioAnalysis.wpm),
      info: 'Rate of speech measured in words per minute',
      suffix: 'wpm'
    },
    {
      name: 'Syllables Per Minute',
      value: Math.round(audioAnalysis.syllablesPerMinute || 0),
      info: 'Rate of speech measured in syllables per minute',
      suffix: 'spm'
    },
    {
      name: 'Pause Ratio',
      value: Math.round(audioAnalysis.pauseRatio * 100),
      info: 'Percentage of time spent in pauses',
      suffix: '%',
      progress: true,
      progressMax: 100
    },
    {
      name: 'Mean Length of Runs',
      value: audioAnalysis.mlrScore?.toFixed(1) || '0.0',
      info: 'Average number of syllables between pauses',
      suffix: 'syllables'
    },
    {
      name: 'Articulation Rate',
      value: audioAnalysis.articulationRate?.toFixed(1) || '0.0',
      info: 'Speed of articulation excluding pauses',
      suffix: 'syl/sec'
    },
    {
      name: 'Hesitation Words',
      value: audioAnalysis.hesitationCount || 0,
      info: 'Number of filler words (um, uh, etc.)',
      suffix: ''
    },
    {
      name: 'Repetitions',
      value: audioAnalysis.repetitionCount || 0,
      info: 'Number of repeated words or phrases',
      suffix: ''
    }
  ];

  if (compact) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {metrics.map((metric) => (
          <div key={metric.name} className="border rounded p-2">
            <div className="flex justify-between items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <span className="text-sm font-medium">{metric.name}</span>
                      <Info className="h-3 w-3 ml-1 text-gray-400" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{metric.info}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="font-bold mt-1">
              {metric.value}
              <span className="text-sm font-normal ml-1 text-gray-600">{metric.suffix}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Timing Metrics</h3>
          {metrics.slice(0, 3).map((metric) => (
            <div key={metric.name} className="border rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <span className="font-medium">{metric.name}</span>
                        <Info className="h-4 w-4 ml-1 text-gray-400" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">{metric.info}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-bold">
                  {metric.value}
                  <span className="text-sm font-normal ml-1 text-gray-600">{metric.suffix}</span>
                </span>
              </div>
              {metric.progress && (
                <Progress value={Math.min(metric.value, metric.progressMax || 100)} className="h-2 mt-1" />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Fluency Indicators</h3>
          {metrics.slice(3).map((metric) => (
            <div key={metric.name} className="border rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <span className="font-medium">{metric.name}</span>
                        <Info className="h-4 w-4 ml-1 text-gray-400" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">{metric.info}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-bold">
                  {metric.value}
                  <span className="text-sm font-normal ml-1 text-gray-600">{metric.suffix}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <h3 className="font-semibold mb-2">Additional Analysis</h3>
        <div className="text-sm">
          <p className="mb-2">
            <span className="font-medium">Total Duration:</span> {audioAnalysis.totalDuration?.toFixed(1) || 0} seconds
          </p>
          <p className="mb-2">
            <span className="font-medium">Speaking Duration:</span> {audioAnalysis.speakingDuration?.toFixed(1) || 0} seconds
          </p>
          <p>
            <span className="font-medium">Pause Count:</span> {audioAnalysis.pauseCount || 0}
          </p>
          {audioAnalysis.fluencyJustification && (
            <div className="mt-3 border-l-4 border-assessment-teal pl-3 py-1 bg-assessment-teal/5">
              <p>{audioAnalysis.fluencyJustification}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeechAnalysis;
