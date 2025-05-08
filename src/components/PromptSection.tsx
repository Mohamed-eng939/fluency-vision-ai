
import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { SpeakingPrompt } from '../types/assessment';
import { mockPrompts } from '../utils/assessmentUtils';

interface PromptSectionProps {
  onPromptSelect: (prompt: SpeakingPrompt) => void;
  selectedPrompt: SpeakingPrompt | null;
}

const PromptSection: React.FC<PromptSectionProps> = ({ onPromptSelect, selectedPrompt }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handlePromptSelect = (prompt: SpeakingPrompt) => {
    onPromptSelect(prompt);
    setIsExpanded(false);
  };
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-assessment-blue">Speaking Task</h2>
      
      {selectedPrompt ? (
        <Card className="border-2 border-assessment-teal">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="uppercase text-xs font-semibold text-gray-500">
                {selectedPrompt.category} - {selectedPrompt.difficulty}
              </span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                {selectedPrompt.timeLimit}s
              </span>
            </div>
            <p className="text-lg font-medium">{selectedPrompt.text}</p>
            <Button 
              variant="outline" 
              className="mt-4 text-sm"
              onClick={() => setIsExpanded(true)}
            >
              Change Prompt
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-8">
          <p className="mb-4 text-gray-600">Select a speaking prompt to begin your assessment</p>
          <Button 
            className="bg-assessment-teal hover:bg-assessment-lightBlue text-white"
            onClick={() => setIsExpanded(true)}
          >
            Browse Prompts
          </Button>
        </div>
      )}
      
      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockPrompts.map((prompt) => (
            <Card 
              key={prompt.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedPrompt?.id === prompt.id ? 'border-2 border-assessment-teal bg-assessment-teal/5' : ''
              }`}
              onClick={() => handlePromptSelect(prompt as SpeakingPrompt)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="uppercase text-xs font-semibold text-gray-500">
                    {prompt.category} - {prompt.difficulty}
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {prompt.timeLimit}s
                  </span>
                </div>
                <p className="text-sm">{prompt.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromptSection;
