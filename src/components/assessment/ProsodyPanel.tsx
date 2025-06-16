
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AudioAnalysisResult } from '@/types/assessment';
import { Activity, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import FallbackWarning from '@/components/ui/FallbackWarning';
import { isProsodyFallback } from '@/utils/assessment/prosodyFallback';

interface ProsodyPanelProps {
  audioAnalysis?: AudioAnalysisResult;
}

const ProsodyPanel: React.FC<ProsodyPanelProps> = ({ audioAnalysis }) => {
  const prosodyData = audioAnalysis?.prosodyAnalysis;
  
  if (!prosodyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-assessment-teal" />
            Prosody Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-gray-500">
            <AlertCircle className="h-8 w-8 mr-2" />
            <p>Prosody analysis not available for this recording.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const isFallback = isProsodyFallback(prosodyData);
  
  // Calculate relative scores for visualization
  const pitchVariationScore = Math.min(100, (prosodyData.pitch_std_dev / 40) * 100);
  const tempoScore = Math.min(100, (prosodyData.tempo_bpm / 200) * 100);
  
  const getCEFRColor = (level: string) => {
    switch (level) {
      case 'A1':
      case 'A2':
        return 'bg-red-100 text-red-800';
      case 'B1':
        return 'bg-yellow-100 text-yellow-800';
      case 'B2':
        return 'bg-blue-100 text-blue-800';
      case 'C1':
      case 'C2':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-assessment-teal" />
          Prosody Analysis
          {prosodyData.cefr_level && (
            <Badge className={getCEFRColor(prosodyData.cefr_level)}>
              {prosodyData.cefr_level}
            </Badge>
          )}
          {isFallback && (
            <FallbackWarning 
              type="prosody" 
              reason={prosodyData.fallbackReason || 'External API unavailable'} 
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pitch Analysis */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Pitch Variation</span>
            </div>
            <span className="text-sm text-gray-600">
              {prosodyData.pitch_std_dev.toFixed(1)} Hz
            </span>
          </div>
          <Progress value={pitchVariationScore} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">
            Mean: {prosodyData.pitch_mean.toFixed(1)} Hz | Std Dev: {prosodyData.pitch_std_dev.toFixed(1)} Hz
          </p>
        </div>
        
        {/* Tempo Analysis */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              <span className="font-medium">Speech Tempo</span>
            </div>
            <span className="text-sm text-gray-600">
              {prosodyData.tempo_bpm.toFixed(0)} BPM
            </span>
          </div>
          <Progress value={tempoScore} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">
            Beats per minute based on syllable timing
          </p>
        </div>
        
        {/* OpenSMILE Features or Fallback Message */}
        <div>
          <h4 className="font-medium mb-2">
            {isFallback ? 'Analysis Method' : 'Advanced Acoustic Features'}
          </h4>
          <div className={`p-3 rounded-md ${isFallback ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}>
            <pre className={`text-xs whitespace-pre-wrap ${isFallback ? 'text-amber-700' : 'text-gray-600'}`}>
              {prosodyData.opensmile_features}
            </pre>
          </div>
        </div>
        
        {/* CEFR Level Explanation */}
        {prosodyData.cefr_level && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
            <h4 className="font-medium text-blue-800 mb-1">
              Prosody CEFR Level: {prosodyData.cefr_level}
              {isFallback && <span className="text-xs ml-2">(Estimated)</span>}
            </h4>
            <p className="text-sm text-blue-700">
              {getProsodyExplanation(prosodyData.cefr_level)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function getProsodyExplanation(level: string): string {
  switch (level) {
    case 'A2':
      return 'Speech shows limited pitch variation and slower tempo. Focus on practicing natural rhythm and intonation patterns.';
    case 'B1':
      return 'Moderate prosodic features with some natural variation. Continue working on stress patterns and emotional expression.';
    case 'B2':
      return 'Good prosodic control with natural pitch variation and appropriate tempo. Shows developing fluency.';
    case 'C1':
      return 'Excellent prosodic features with rich pitch variation and natural tempo. Speech sounds very fluent and native-like.';
    default:
      return 'Prosodic analysis shows your speech rhythm and intonation patterns.';
  }
}

export default ProsodyPanel;
