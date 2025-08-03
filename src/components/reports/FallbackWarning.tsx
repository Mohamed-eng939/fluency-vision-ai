import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { FallbackInfo } from '@/types/assessment/results';

interface FallbackWarningProps {
  fallbackInfo?: FallbackInfo;
}

const FallbackWarning: React.FC<FallbackWarningProps> = ({ fallbackInfo }) => {
  if (!fallbackInfo) return null;
  
  const hasFallbacks = Object.values(fallbackInfo).some(value => value === true);
  
  if (!hasFallbacks) return null;

  const activeFallbacks = [];
  if (fallbackInfo.prosodyFallback) activeFallbacks.push('prosody');
  if (fallbackInfo.coherenceFallback) activeFallbacks.push('coherence');

  return (
    <Alert className="border-amber-200 bg-amber-50 text-amber-800 mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <span className="font-medium">Assessment Note:</span> One or more modules ({activeFallbacks.join(', ')}) used fallback logic due to audio or data issues. Scores may be less precise for these components.
      </AlertDescription>
    </Alert>
  );
};

export default FallbackWarning;