
import React from 'react';
import { getFullAssessmentTests } from '@/utils/assessmentUtils';
import FullAssessmentIntro from '@/components/FullAssessmentIntro';
import FullAssessment from '@/components/FullAssessment';
import AssessmentOptions from '@/components/assessment/AssessmentOptions';
import QuickAssessmentSection from '@/components/assessment/QuickAssessmentSection';
import AssessmentResults from '@/components/assessment/AssessmentResults';
import { useAssessmentState } from '@/hooks/useAssessmentState';

const AssessmentPage: React.FC = () => {
  // Get the enhanced full assessment tests
  const fullAssessmentTests = getFullAssessmentTests();
  
  // Use our custom hook to manage assessment state
  const {
    selectedPrompt,
    assessmentResult,
    isProcessing,
    showFullAssessment,
    showFullAssessmentIntro,
    detailedFeedback,
    handlePromptSelect,
    handleRecordingComplete,
    handleStartFullAssessment,
    handleFullAssessmentComplete,
    handleFullAssessmentExit,
    handleReset,
    handleShowFullAssessmentIntro,
    handleCloseFullAssessmentIntro
  } = useAssessmentState();

  if (showFullAssessment) {
    return (
      <FullAssessment 
        assessment={fullAssessmentTests[0]} 
        onComplete={handleFullAssessmentComplete}
        onExit={handleFullAssessmentExit}
      />
    );
  }

  if (showFullAssessmentIntro) {
    return (
      <FullAssessmentIntro 
        assessment={fullAssessmentTests[0]} 
        onStartAssessment={handleStartFullAssessment}
        onClose={handleCloseFullAssessmentIntro}
      />
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:max-w-5xl">
      <h1 className="text-3xl font-bold text-assessment-blue mb-6">
        LinguaSpeak AI Assessment
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {!assessmentResult ? (
            <QuickAssessmentSection
              selectedPrompt={selectedPrompt}
              onPromptSelect={handlePromptSelect}
              onRecordingComplete={handleRecordingComplete}
              isProcessing={isProcessing}
            />
          ) : (
            <AssessmentResults
              result={assessmentResult}
              isProcessing={isProcessing}
              detailedFeedback={detailedFeedback}
              onReset={handleReset}
              onTakeFullAssessment={handleShowFullAssessmentIntro}
            />
          )}
        </div>
        
        <div className="lg:col-span-1">
          <AssessmentOptions
            onSelectQuickAssessment={() => {
              handleCloseFullAssessmentIntro();
              handleReset();
            }}
            onSelectFullAssessment={handleShowFullAssessmentIntro}
            showFullAssessmentIntro={showFullAssessmentIntro}
          />
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;
