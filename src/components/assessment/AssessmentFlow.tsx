
import React, { useState } from 'react';
import { AssessmentStep, useAssessmentFlow } from '@/hooks/assessment/useAssessmentFlow';
import TestEntryStep from './TestEntryStep';
import WelcomeStep from './WelcomeStep';
import RecordingStep from './RecordingStep';
import ProcessingStep from './ProcessingStep';
import ResultsStep from './ResultsStep';
import AdminControls from './AdminControls';

interface AssessmentFlowProps {
  onTakeFullAssessment: () => void;
}

const AssessmentFlow: React.FC<AssessmentFlowProps> = ({ onTakeFullAssessment }) => {
  const [showAdminControls, setShowAdminControls] = useState(false);
  
  // Initialize the assessment flow
  const {
    // State
    currentStep,
    studentInfo,
    emailResults,
    sessionId,
    currentPrompt,
    currentPromptIndex,
    finalResult,
    bypassScoringDelay,
    showRawScoring,
    isProcessing,
    detailedFeedback,
    promptHistory,
    
    // Methods
    initializeAssessment,
    startAssessment,
    handleResponseComplete,
    skipToNextPrompt,
    finishAssessment,
    resetAssessment,
    toggleAdminReviewMode,
    handleStudentInfoSubmit,
    
    // Configuration
    totalPrompts
  } = useAssessmentFlow({
    promptsCount: 10,
    requiredConsistentScores: 4,
    showAdminControls: true
  });
  
  // Toggle admin controls visibility with keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Alt+D to toggle admin controls
      if (e.ctrlKey && e.altKey && e.key === 'd') {
        setShowAdminControls(!showAdminControls);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAdminControls]);

  // Render the appropriate step
  const renderStep = () => {
    switch (currentStep) {
      case AssessmentStep.ENTRY:
        return (
          <TestEntryStep 
            onStart={initializeAssessment}
            onStudentInfoSubmit={handleStudentInfoSubmit}
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
            onReset={resetAssessment}
            onTakeFullAssessment={onTakeFullAssessment}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {renderStep()}
      
      {showAdminControls && (
        <AdminControls 
          onToggleBypass={toggleAdminReviewMode}
          bypassEnabled={bypassScoringDelay}
          onShowRawScoring={toggleAdminReviewMode}
          rawScoringEnabled={showRawScoring}
        />
      )}
    </div>
  );
};

export default AssessmentFlow;
