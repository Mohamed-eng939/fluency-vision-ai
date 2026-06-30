
import React from 'react';
import { AssessmentResult, AudioAnalysisResult, CEFRLevel } from '@/types/assessment';
import ReportHeader from './sections/ReportHeader';
import CandidateProfile from './sections/CandidateProfile';
import SkillScoresOverview from './sections/SkillScoresOverview';
import SpeechAnalysis from './sections/SpeechAnalysis';
import SpeakerConsistency from './sections/SpeakerConsistency';
import LearningRecommendations from './sections/LearningRecommendations';
import CEFRBadge from './elements/CEFRBadge';
import FallbackWarning from './FallbackWarning';
import { Card } from '../ui/card';

interface QuickAssessmentReportProps {
  result: AssessmentResult;
  audioAnalysis?: AudioAnalysisResult;
  learnerName: string;
  sessionId: string;
  dateOfTest: string;
}

const QuickAssessmentReport: React.FC<QuickAssessmentReportProps> = ({
  result,
  audioAnalysis,
  learnerName,
  sessionId,
  dateOfTest
}) => {
  const { cefrLevel, metrics, totalScore, feedback } = result;
  
  // Extract justifications for each skill
  const justifications = {
    fluency: feedback?.fluency || 'No feedback available',
    grammar: feedback?.grammar || 'No feedback available',
    vocabulary: feedback?.vocabulary || 'No feedback available',
    pronunciation: feedback?.pronunciation || 'No feedback available',
    coherence: feedback?.coherence || 'No feedback available',
    syntax: feedback?.syntax || 'No feedback available'
  };

  return (
    <div className="report-container space-y-8 print:text-black">
      <ReportHeader title="Quick Assessment Report" />
      
      <FallbackWarning fallbackInfo={result.fallbackInfo} />
      
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <CandidateProfile
            name={learnerName}
            sessionId={sessionId}
            dateOfTest={dateOfTest}
            overallScore={totalScore}
            cefrLevel={cefrLevel}
          />
        </div>
        <div className="flex justify-center items-start">
          <CEFRBadge level={cefrLevel as CEFRLevel} size="large" />
        </div>
      </div>
      
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 text-assessment-blue border-b pb-2">Speaking Skills Assessment</h2>
        <SkillScoresOverview 
          metrics={metrics}
          justifications={justifications}
        />
      </Card>
      
      {audioAnalysis && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 text-assessment-blue border-b pb-2">Speech Analysis</h2>
          <SpeechAnalysis audioAnalysis={audioAnalysis} />
        </Card>
      )}
      
      {audioAnalysis && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 text-assessment-blue border-b pb-2">Speaker Verification</h2>
          <SpeakerConsistency 
            micTestCompleted={true} // Assuming mic test was completed
            confidenceScore={100} // Placeholder, replace with actual data when available
            mismatchDetected={false} // Placeholder, replace with actual data when available
          />
        </Card>
      )}
      
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 text-assessment-blue border-b pb-2">Learning Recommendations</h2>
        <LearningRecommendations 
          metrics={metrics}
          cefrLevel={cefrLevel as CEFRLevel}
          isQuickAssessment={true}
        />
      </Card>
      
      <div className="text-center text-sm text-gray-500 mt-8 pt-4 border-t">
        <p>English Placement Assessment Report</p>
        <p>Report Date: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default QuickAssessmentReport;
