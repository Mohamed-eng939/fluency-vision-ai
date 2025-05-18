
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
      <div className="text-lg font-medium mb-6 text-assessment-blue">
        {prompt.text}
      </div>
      
      <div className="text-sm text-gray-500 mb-2">
        Category: <span className="text-assessment-blue">{category}</span> | 
        Difficulty: <span className="text-assessment-blue">{prompt.difficulty}</span> | 
        Time: <span className="text-assessment-blue">{prompt.timeLimit} min</span>
      </div>
    </>
  );
};

export default PromptHeader;
