
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { AssessmentResult } from '../types/assessment';
import { AudioWaveform, Clock, Mic, Volume2, Award } from 'lucide-react';

interface AssessmentReportProps {
  result: AssessmentResult;
  isLoading: boolean;
}

const AssessmentReport: React.FC<AssessmentReportProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse text-assessment-blue">
            <p className="text-lg font-medium">Analyzing your speaking skills...</p>
            <p className="text-sm mt-2 text-gray-600">
              Our AI is processing your recording. This may take a few moments.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const { metrics, totalScore, cefrLevel, feedback, audioUrl, duration, speechRate, confidenceScore, transcript } = result;
  
  // Helper function to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-teal-500';
    if (score >= 4) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  // Helper function to format time
  const formatTime = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex justify-between items-center text-assessment-blue">
          <span>Speaking Assessment Results</span>
          <span className="text-lg font-bold">{totalScore}% ({cefrLevel})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {/* Audio player if available */}
        {audioUrl && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium mb-2 flex justify-between items-center">
              <span className="flex items-center gap-1">
                <AudioWaveform className="h-4 w-4 text-assessment-teal" />
                Your Recording
              </span>
              {duration && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {formatTime(duration)}
                </span>
              )}
            </div>
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
        
        {/* Enhanced metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Speaking Metrics</h3>
            {Object.entries(metrics).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm capitalize">{key}</span>
                  <span className="text-sm font-medium">{value.toFixed(1)}/10</span>
                </div>
                <Progress 
                  value={value * 10} 
                  className={`h-2 ${getScoreColor(value)}`}
                />
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Speech Analysis</h3>
            
            {/* Speech rate */}
            {speechRate && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm flex items-center gap-1">
                    <Mic className="h-4 w-4 text-assessment-blue" />
                    Speech Rate
                  </span>
                  <span className="text-sm font-medium">{Math.round(speechRate)} WPM</span>
                </div>
                <div className="text-xs text-gray-500">
                  {speechRate < 120 && "Your speech rate is quite slow. Try to speak more fluently."}
                  {speechRate >= 120 && speechRate <= 180 && "Your speech rate is at a good conversational pace."}
                  {speechRate > 180 && "Your speech rate is quite fast. Consider slowing down for clarity."}
                </div>
              </div>
            )}
            
            {/* Confidence score */}
            {confidenceScore !== undefined && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm flex items-center gap-1">
                    <Volume2 className="h-4 w-4 text-assessment-blue" />
                    Clarity
                  </span>
                  <span className="text-sm font-medium">{Math.round(confidenceScore * 100)}%</span>
                </div>
                <Progress 
                  value={confidenceScore * 100} 
                  className={`h-2 mb-1 ${
                    confidenceScore > 0.8 ? 'bg-green-500' : 
                    confidenceScore > 0.6 ? 'bg-amber-500' : 
                    'bg-red-500'
                  }`}
                />
                <div className="text-xs text-gray-500">
                  {confidenceScore > 0.8 && "Your speech is very clear and easily understood."}
                  {confidenceScore <= 0.8 && confidenceScore > 0.6 && "Your speech is mostly clear with some areas that could be improved."}
                  {confidenceScore <= 0.6 && "Your speech clarity needs improvement. Focus on clear pronunciation."}
                </div>
              </div>
            )}
            
            {/* CEFR Level */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm flex items-center gap-1">
                  <Award className="h-4 w-4 text-assessment-blue" />
                  CEFR Level
                </span>
                <span className="text-sm font-medium">{cefrLevel}</span>
              </div>
              <div className="text-xs text-gray-500">
                {feedback.overall}
              </div>
            </div>
          </div>
        </div>
        
        {/* Transcript if available */}
        {transcript && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Transcript</h3>
            <p className="text-sm text-gray-700">{transcript}</p>
          </div>
        )}
        
        {/* Feedback */}
        <div>
          <h3 className="text-sm font-medium mb-3">Detailed Feedback</h3>
          <div className="space-y-3">
            {Object.entries(feedback).filter(([key]) => key !== 'overall').map(([key, value]) => (
              <div key={key} className="p-3 bg-gray-50 rounded">
                <h4 className="text-sm font-medium capitalize">{key}</h4>
                <p className="text-sm text-gray-600">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentReport;
