
import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FallbackWarningProps {
  type: 'prosody' | 'coherence';
  reason: string;
  className?: string;
}

const FallbackWarning: React.FC<FallbackWarningProps> = ({ type, reason, className }) => {
  const message = type === 'prosody' 
    ? `Prosody analysis used local estimation - ${reason}`
    : `Coherence analysis used local estimation - ${reason}`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center ${className}`}>
            <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
            <span className="text-xs text-amber-600">Estimated</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FallbackWarning;
