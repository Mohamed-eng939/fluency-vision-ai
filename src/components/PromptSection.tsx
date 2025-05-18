
import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { SpeakingPrompt } from '../types/assessment';
import { mockPrompts, getPromptsByLevel } from '../utils/speaking/promptUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';

interface PromptSectionProps {
  onPromptSelect: (prompt: SpeakingPrompt) => void;
  selectedPrompt: SpeakingPrompt | null;
}

const PromptSection: React.FC<PromptSectionProps> = ({ onPromptSelect, selectedPrompt }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Group prompts by CEFR level
  const promptsByLevel: Record<string, SpeakingPrompt[]> = {
    "A1": mockPrompts.filter(p => p.cefrLevel === "A1"),
    "A2": mockPrompts.filter(p => p.cefrLevel === "A2"),
    "B1": mockPrompts.filter(p => p.cefrLevel === "B1"),
    "B2": mockPrompts.filter(p => p.cefrLevel === "B2"),
    "C1": mockPrompts.filter(p => p.cefrLevel === "C1"),
    "C2": mockPrompts.filter(p => p.cefrLevel === "C2"),
  };
  
  // Get filtered prompts based on active tab
  const getFilteredPrompts = () => {
    if (activeTab === "all") {
      return mockPrompts;
    }
    return promptsByLevel[activeTab] || [];
  };
  
  const handlePromptSelect = (prompt: SpeakingPrompt) => {
    onPromptSelect(prompt);
    setIsExpanded(false);
  };

  // Function to get color for CEFR level badges
  const getCEFRLevelColor = (level: string | undefined) => {
    if (!level) return "bg-gray-200";
    
    switch(level) {
      case 'A1': return "bg-red-100 text-red-800";
      case 'A2': return "bg-orange-100 text-orange-800";
      case 'B1': return "bg-yellow-100 text-yellow-800";
      case 'B2': return "bg-green-100 text-green-800";
      case 'C1': return "bg-blue-100 text-blue-800";
      case 'C2': return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100";
    }
  };
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-assessment-blue">Speaking Task</h2>
      
      {selectedPrompt ? (
        <Card className="border-2 border-assessment-teal">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="uppercase text-xs font-semibold text-gray-500">
                {selectedPrompt.category} - {selectedPrompt.topic || selectedPrompt.difficulty}
              </span>
              <div className="flex items-center gap-2">
                <Badge className={getCEFRLevelColor(selectedPrompt.cefrLevel)}>
                  {selectedPrompt.cefrLevel || selectedPrompt.difficulty}
                </Badge>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {selectedPrompt.timeLimit}s
                </span>
              </div>
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
        <div className="mt-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="w-full">
              <TabsTrigger value="all">All Levels</TabsTrigger>
              <TabsTrigger value="A1">A1</TabsTrigger>
              <TabsTrigger value="A2">A2</TabsTrigger>
              <TabsTrigger value="B1">B1</TabsTrigger>
              <TabsTrigger value="B2">B2</TabsTrigger>
              <TabsTrigger value="C1">C1</TabsTrigger>
              <TabsTrigger value="C2">C2</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getFilteredPrompts().map((prompt) => (
              <Card 
                key={prompt.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedPrompt?.id === prompt.id ? 'border-2 border-assessment-teal bg-assessment-teal/5' : ''
                }`}
                onClick={() => handlePromptSelect(prompt)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="uppercase text-xs font-semibold text-gray-500">
                      {prompt.category} - {prompt.topic || prompt.difficulty}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge className={getCEFRLevelColor(prompt.cefrLevel)}>
                        {prompt.cefrLevel || prompt.difficulty}
                      </Badge>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {prompt.timeLimit}s
                      </span>
                    </div>
                  </div>
                  <p className="text-sm">{prompt.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptSection;
