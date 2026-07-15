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

  return (
    <Alert className="border-amber-200 bg-amber-50 text-amber-800 mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        {fallbackInfo.scoringUnavailable ? (
          <>
            <span className="font-medium">Provisional result:</span> part of this response
            couldn't be scored automatically, so this level is provisional and pending
            human review.
          </>
        ) : (
          <>
            <span className="font-medium">Assessment Note:</span> Some scoring modules used
            fallback logic due to audio or data quality issues. Scores may be less precise
            than usual.
          </>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default FallbackWarning;