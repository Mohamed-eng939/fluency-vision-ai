
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import RecordingFlowController from './RecordingFlowController';
import PromptSection from '@/components/PromptSection';
import { SpeakingPrompt, AudioAnalysisResult } from '@/types/assessment';
import StudentInfoForm from './StudentInfoForm';
import { useToast } from '@/components/ui/use-toast';

interface QuickAssessmentSectionProps {
  selectedPrompt: SpeakingPrompt | null;
  onPromptSelect: (prompt: SpeakingPrompt) => void;
  onRecordingComplete: (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => void;
  isProcessing: boolean;
}

interface StudentInfo {
  name: string;
  email?: string;
  institution?: string;
  sessionId: string;
}

const QuickAssessmentSection: React.FC<QuickAssessmentSectionProps> = ({
  selectedPrompt,
  onPromptSelect,
  onRecordingComplete,
  isProcessing
}) => {
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const { toast } = useToast();
  
  const handleStudentInfoComplete = (info: StudentInfo) => {
    setStudentInfo(info);
    toast({
      title: "Registration Complete",
      description: "You can now select a prompt to begin your assessment."
    });
  };
  
  if (!studentInfo) {
    return (
      <div className="w-full max-w-lg mx-auto my-8">
        <StudentInfoForm onComplete={handleStudentInfoComplete} />
      </div>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-assessment-blue">
            Quick Speaking Assessment
          </h2>
          <div className="text-sm">
            <div>Session ID: <span className="font-mono">{studentInfo.sessionId}</span></div>
            <div>Name: {studentInfo.name}</div>
          </div>
        </div>
        
        {!selectedPrompt ? (
          <PromptSection onPromptSelect={onPromptSelect} />
        ) : (
          <RecordingFlowController 
            prompt={selectedPrompt}
            onComplete={onRecordingComplete}
            onCancel={() => onPromptSelect(selectedPrompt)}
            isProcessing={isProcessing}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default QuickAssessmentSection;
