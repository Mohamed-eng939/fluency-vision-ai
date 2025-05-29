
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Lightbulb, Clock } from 'lucide-react';
import { MistakeItem as MistakeItemType } from './types';

interface MistakeItemProps {
  mistake: MistakeItemType;
  index: number;
}

const MistakeItem: React.FC<MistakeItemProps> = ({ mistake, index }) => {
  const formatTime = (seconds: number) => {
    return `${seconds.toFixed(1)}s`;
  };

  return (
    <div key={index} className="border-l-4 border-red-200 pl-4 py-2 bg-red-50/50 rounded-r">
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
          <div className="flex-1">
            {mistake.phoneme ? (
              <div>
                <span className="font-medium text-red-700">Sound Issue: </span>
                <span className="text-red-600 font-mono">/{mistake.phoneme}/</span>
                {mistake.issue && (
                  <span className="text-red-600 ml-2">({mistake.issue})</span>
                )}
                {mistake.startTime !== undefined && mistake.endTime !== undefined && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {formatTime(mistake.startTime)} - {formatTime(mistake.endTime)}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <span className="font-medium text-red-700">Original: </span>
                <span className="text-red-600">"{mistake.original}"</span>
                {mistake.context && (
                  <div className="text-xs text-gray-500 mt-1">
                    Context: {mistake.context}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
          <div>
            <span className="font-medium text-green-700">
              {mistake.phoneme ? 'Practice Tip: ' : 'Correction: '}
            </span>
            <span className="text-green-600">
              {mistake.phoneme ? mistake.suggestion : `"${mistake.correction}"`}
            </span>
          </div>
        </div>
        
        {!mistake.phoneme && (
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />
            <div className="flex-1">
              <span className="font-medium text-blue-700">Suggestion: </span>
              <span className="text-blue-600">{mistake.suggestion}</span>
              {mistake.cefrLevel && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {mistake.cefrLevel}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MistakeItem;
