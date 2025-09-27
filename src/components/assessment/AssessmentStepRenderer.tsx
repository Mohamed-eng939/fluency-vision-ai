
import React from 'react';
import { AssessmentStep } from '@/hooks/assessment/useAssessmentFlow';
import { ReadAloudStage } from '@/hooks/assessment/types/assessmentTypes';
import TestEntryStep from './TestEntryStep';
import WelcomeStep from './WelcomeStep';
import RecordingStep from './RecordingStep';
import ProcessingResults from './ProcessingResults';
import ResultsStep from './ResultsStep';
import AssessmentOptions from './AssessmentOptions';
import ReadAloudAssessmentStep from './ReadAloudAssessmentStep';
import { StudentInfo } from '@/hooks/assessment';
import { SpeakingPrompt, AssessmentResult, AudioAnalysisResult } from '@/types/assessment';

// Helper function to calculate read aloud task index within CEFR level
const getReadAloudTaskIndex = (currentPromptIndex: number, cefrLevel: string): number => {
  // Calculate how many prompts come before the current CEFR level
  const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const currentLevelIndex = levelOrder.indexOf(cefrLevel);
  
  // Count prompts per level: A1(4+3), A2(2+3), B1(5+3), B2(6+3), C1(6+3)
  const promptsPerLevel = [7, 5, 8, 9, 9]; // speaking + read aloud per level
  
  let promptsBeforeCurrentLevel = 0;
  for (let i = 0; i < currentLevelIndex; i++) {
    promptsBeforeCurrentLevel += promptsPerLevel[i];
  }
  
  // Find the read aloud start for current level
  const speakingPromptsInLevel = [4, 2, 5, 6, 6][currentLevelIndex];
  const readAloudStartInLevel = promptsBeforeCurrentLevel + speakingPromptsInLevel;
  
  // Calculate the index within the read aloud tasks of this level (0-2)
  return currentPromptIndex - readAloudStartInLevel;
};

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
  processingProgress?: { current: number; total: number };
  sessionId?: string;
  processBatchAndFinish?: () => void;
  readAloudStage: ReadAloudStage;

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
  processingProgress,
  sessionId,
  processBatchAndFinish,
  readAloudStage,
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

    case AssessmentStep.READ_ALOUD_LOADING:
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Preparing Read-Aloud A1 stage...</p>
        </div>
      );
    
    case AssessmentStep.RECORDING:
      if (!currentPrompt) return null;
      
      // If current prompt is a Read Aloud task, redirect to READ_aloud component
      if (currentPrompt.isReadAloud) {
        // Calculate read aloud task index within the current CEFR level
        const cefrLevel = currentPrompt.cefrLevel || 'A1';
        const readAloudTaskIndex = getReadAloudTaskIndex(currentPromptIndex, cefrLevel);
        
        return (
          <ReadAloudAssessmentStep
            sessionId={sessionId || ''}
            currentIndex={readAloudTaskIndex}
            totalTasks={3} // 3 sentences per CEFR level
            cefrLevel={cefrLevel}
            onComplete={(audioBlob, transcript, audioAnalysis) => {
              // Store Read Aloud result with complete AudioAnalysisResult structure
              handleResponseComplete(audioBlob, transcript, audioAnalysis);
            }}
            onNext={skipToNextPrompt}
            onFinish={() => processBatchAndFinish?.()}
          />
        );
      }
      
      return (
        <RecordingStep 
          prompt={currentPrompt}
          currentIndex={currentPromptIndex}
          totalPrompts={totalPrompts} // Show progress for all 38 questions
          onRecordingComplete={handleResponseComplete}
          onPause={() => {}} // This would be implemented for pausing functionality
          onFinishNow={() => processBatchAndFinish?.()}
          onNext={skipToNextPrompt}
          isProcessing={isProcessing}
        />
      );

    case AssessmentStep.READ_ALOUD:
      // Handle Read-Aloud stage with all 15 sentences
      if (readAloudStage.ready && !readAloudStage.done) {
        const currentItem = readAloudStage.items[readAloudStage.currentIndex];
        if (!currentItem || !sessionId) return null;
        
        return (
          <div className="space-y-6">
            {/* Read-Aloud Header */}
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Read Aloud – {currentItem.band}</h2>
              <p className="text-muted-foreground">
                Item {readAloudStage.currentIndex + 1}/{readAloudStage.totalItems}
              </p>
            </div>
            
            {/* Current sentence display */}
            <div className="bg-muted/50 p-6 rounded-lg text-center">
              <p className="text-lg font-medium mb-4">Please read this sentence aloud:</p>
              <div className="text-xl font-semibold text-primary p-4 bg-background rounded-lg border">
                {currentItem.text}
              </div>
            </div>
            
            {/* Recording controls */}
            <RecordingStep 
              prompt={{
                id: currentItem.sentence_id,
                text: currentItem.text,
                cefrLevel: currentItem.band as any,
                category: 'read_aloud',
                isReadAloud: true
              } as SpeakingPrompt}
              currentIndex={readAloudStage.currentIndex}
              totalPrompts={readAloudStage.totalItems}
              onRecordingComplete={handleResponseComplete}
              onPause={() => {}}
              onFinishNow={() => processBatchAndFinish?.()}
              onNext={skipToNextPrompt}
              isProcessing={isProcessing}
            />
          </div>
        );
      }
      
      // Fallback for other read-aloud scenarios
      if (!sessionId || !currentPrompt) return null;
      
      return (
        <ReadAloudAssessmentStep
          sessionId={sessionId}
          currentIndex={getReadAloudTaskIndex(currentPromptIndex, currentPrompt.cefrLevel || 'A1')}
          totalTasks={3} // 3 sentences per CEFR level
          cefrLevel={currentPrompt.cefrLevel || 'A1'}
          onComplete={(audioBlob, transcript, audioAnalysis) => {
            // Store Read Aloud result with complete AudioAnalysisResult structure
            handleResponseComplete(audioBlob, transcript, audioAnalysis);
          }}
          onNext={skipToNextPrompt}
          onFinish={() => processBatchAndFinish?.()}
        />
      );
    
    case AssessmentStep.PROCESSING:
      return (
        <ProcessingResults 
          current={processingProgress?.current || 0}
          total={processingProgress?.total || 0}
          isProcessing={isProcessing}
        />
      );
    
    case AssessmentStep.RESULTS:
      return (
        <ResultsStep 
          result={finalResult}
          detailedFeedback={detailedFeedback}
          promptHistory={promptHistory}
          showRawScoring={showRawScoring && showAdminControls}
          isProcessing={isProcessing}
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
