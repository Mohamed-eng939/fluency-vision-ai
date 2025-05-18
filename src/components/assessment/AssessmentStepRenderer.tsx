
import React from 'react';
import { AssessmentStep } from '@/hooks/assessment/useAssessmentFlow';
import TestEntryStep from './TestEntryStep';
import WelcomeStep from './WelcomeStep';
import RecordingStep from './RecordingStep';
import ProcessingStep from './ProcessingStep';
import ResultsStep from './ResultsStep';
import AssessmentOptions from './AssessmentOptions';
import { StudentInfo } from '@/hooks/assessment';
import { SpeakingPrompt, AssessmentResult, AudioAnalysisResult } from '@/types/assessment';

interface AssessmentStepRendererProps {
  currentStep: AssessmentStep;
  showAssessmentOptions: boolean;
  studentInfo: StudentInfo | null;
  currentPrompt: SpeakingPrompt | null;
  currentPromptIndex: number;
  totalPrompts: number;
  finalResult: AssessmentResult | null;
  isProcessing: boolean;
  emailResults: boolean;
  detailedFeedback: Record<string, string> | null;
  promptHistory: any[];
  showRawScoring: boolean;
  showAdminControls: boolean;

  // Methods
  onSelectQuickAssessment: () => void;
  initializeAssessment: (withEmail: boolean) => void;
  onStudentInfoSubmit: (info: StudentInfo) => void;
  startAssessment: () => void;
  handleResponseComplete: (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => void;
  skipToNextPrompt: () => void;
  finishAssessment: (result: AssessmentResult | null) => void;
  resetAssessment: () => void;
  toggleAdminReviewMode: () => void;
  onTakeFullAssessment: () => void;
}

const AssessmentStepRenderer: React.FC<AssessmentStepRendererProps> = ({
  currentStep,
  showAssessmentOptions,
  studentInfo,
  currentPrompt,
  currentPromptIndex,
  totalPrompts,
  finalResult,
  isProcessing,
  emailResults,
  detailedFeedback,
  promptHistory,
  showRawScoring,
  showAdminControls,
  onSelectQuickAssessment,
  initializeAssessment,
  onStudentInfoSubmit,
  startAssessment,
  handleResponseComplete,
  skipToNextPrompt,
  finishAssessment,
  resetAssessment,
  toggleAdminReviewMode,
  onTakeFullAssessment
}) => {
  // If showing assessment options, render those first
  if (showAssessmentOptions) {
    return (
      <AssessmentOptions
        onSelectQuickAssessment={onSelectQuickAssessment}
      />
    );
  }

  switch (currentStep) {
    case AssessmentStep.ENTRY:
      return (
        <TestEntryStep 
          onStart={initializeAssessment}
          onStudentInfoSubmit={onStudentInfoSubmit}
        />
      );
    
    case AssessmentStep.WELCOME:
      return (
        <WelcomeStep 
          onStart={startAssessment}
        />
      );
    
    case AssessmentStep.RECORDING:
      if (!currentPrompt) return null;
      
      return (
        <RecordingStep 
          prompt={currentPrompt}
          currentIndex={currentPromptIndex}
          totalPrompts={totalPrompts}
          onRecordingComplete={handleResponseComplete}
          onPause={() => {}} // This would be implemented for pausing functionality
          onFinishNow={() => finishAssessment(finalResult)}
          onNext={skipToNextPrompt}
          isProcessing={isProcessing}
        />
      );
    
    case AssessmentStep.PROCESSING:
      return (
        <ProcessingStep 
          hasEmail={emailResults}
          email={studentInfo?.email}
          onBypassProcessing={toggleAdminReviewMode}
          isAdmin={showAdminControls}
        />
      );
    
    case AssessmentStep.RESULTS:
      return (
        <ResultsStep 
          result={finalResult}
          detailedFeedback={detailedFeedback}
          promptHistory={promptHistory}
          showRawScoring={showRawScoring && showAdminControls}
          onReset={() => {
            resetAssessment();
          }}
          onTakeFullAssessment={onTakeFullAssessment}
        />
      );
    
    default:
      return null;
  }
};

export default AssessmentStepRenderer;
