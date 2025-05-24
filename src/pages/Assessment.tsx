
import React, { useState, useEffect } from 'react';
import { getFullAssessmentTests } from '@/utils/assessmentUtils';
import FullAssessmentIntro from '@/components/FullAssessmentIntro';
import FullAssessment from '@/components/FullAssessment';
import AssessmentFlow from '@/components/assessment/AssessmentFlow';
import { useSearchParams } from 'react-router-dom';

const AssessmentPage: React.FC = () => {
  // Get the enhanced full assessment tests
  const fullAssessmentTests = getFullAssessmentTests();
  const [searchParams] = useSearchParams();
  
  // Track if we should show the full assessment
  const [showFullAssessment, setShowFullAssessment] = useState(false);
  const [showFullAssessmentIntro, setShowFullAssessmentIntro] = useState(false);
  
  // Check URL parameters for login/signup
  useEffect(() => {
    const login = searchParams.get('login');
    const signup = searchParams.get('signup');
    
    if (login === 'true') {
      console.log('Login requested via URL');
    }
    
    if (signup === 'true') {
      console.log('Signup requested via URL');
    }
  }, [searchParams]);
  
  const handleStartFullAssessment = () => {
    setShowFullAssessment(true);
    setShowFullAssessmentIntro(false);
  };

  const handleFullAssessmentComplete = () => {
    setShowFullAssessment(false);
  };

  const handleFullAssessmentExit = () => {
    setShowFullAssessment(false);
    setShowFullAssessmentIntro(false);
  };

  const handleShowFullAssessmentIntro = () => {
    setShowFullAssessmentIntro(true);
  };

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
        onClose={handleFullAssessmentExit}
      />
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:max-w-5xl">
      <h1 className="text-3xl font-bold text-assessment-blue mb-6">
        LinguaSpeak AI Assessment
      </h1>
      
      <AssessmentFlow 
        onTakeFullAssessment={handleShowFullAssessmentIntro}
      />
    </div>
  );
};

export default AssessmentPage;
