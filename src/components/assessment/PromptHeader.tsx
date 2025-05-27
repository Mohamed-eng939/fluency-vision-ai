
import React from 'react';
import { SpeakingPrompt } from '@/types/assessment';

interface PromptHeaderProps {
  prompt: SpeakingPrompt;
  promptInfo?: {
    cefrLevel: string;
    category: string;
  };
}

const PromptHeader: React.FC<PromptHeaderProps> = ({ prompt, promptInfo }) => {
  // Use either the promptInfo or get directly from prompt
  const cefrLevel = promptInfo?.cefrLevel || prompt.cefrLevel;
  const category = promptInfo?.category || prompt.category;
  
  return (
    <>
      <div className="text-lg font-medium mb-4 text-assessment-blue">
        {prompt.text}
      </div>
      
      {prompt.hint && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
          <div className="text-sm text-blue-800">
            <strong>Hint:</strong> {prompt.hint}
          </div>
        </div>
      )}
      
      <div className="text-sm text-gray-500 mb-2">
        Category: <span className="text-assessment-blue">{category}</span> | 
        Difficulty: <span className="text-assessment-blue">{prompt.difficulty}</span> | 
        Time: <span className="text-assessment-blue">{prompt.timeLimit} seconds</span>
        {prompt.cefrLevel && (
          <> | Level: <span className="text-assessment-blue">{prompt.cefrLevel}</span></>
        )}
      </div>
    </>
  );
};

export default PromptHeader;
