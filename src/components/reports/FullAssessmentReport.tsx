
import React from 'react';
import { AssessmentResult, AudioAnalysisResult, CEFRLevel, FullAssessment } from '@/types/assessment';
import ReportHeader from './sections/ReportHeader';
import CandidateProfile from './sections/CandidateProfile';
import FullSkillsOverview from './sections/FullSkillsOverview';
import SpeechAnalysis from './sections/SpeechAnalysis';
import SpeakerConsistency from './sections/SpeakerConsistency';
import LearningRecommendations from './sections/LearningRecommendations';
import CEFRBadge from './elements/CEFRBadge';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import SkillScoresOverview from './sections/SkillScoresOverview';
import { mapScoreToCEFR } from '@/utils/reports/reportUtils';

interface FullAssessmentReportProps {
  result: AssessmentResult;
  fullAssessmentData?: FullAssessment;
  audioAnalysis?: AudioAnalysisResult;
  learnerName: string;
  sessionId: string;
  dateOfTest: string;
}

const FullAssessmentReport: React.FC<FullAssessmentReportProps> = ({
  result,
  fullAssessmentData,
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
    syntax: feedback?.syntax || 'No feedback available',
    listening: feedback?.listening || 'No feedback available',
    reading: feedback?.reading || 'No feedback available',
    writing: feedback?.writing || 'No feedback available',
  };

  return (
    <div className="report-container space-y-8 print:text-black">
      <ReportHeader title="Full Assessment Report" />
      
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
        <h2 className="text-xl font-bold mb-4 text-assessment-blue border-b pb-2">Communication Skills Assessment</h2>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="speaking">Speaking</TabsTrigger>
            <TabsTrigger value="listening">Listening</TabsTrigger>
            <TabsTrigger value="reading">Reading</TabsTrigger>
            <TabsTrigger value="writing">Writing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <FullSkillsOverview 
              metrics={metrics}
              justifications={justifications}
              assessmentSections={fullAssessmentData?.sections || []}
            />
          </TabsContent>
          
          <TabsContent value="speaking">
            <div className="space-y-6">
              <SkillScoresOverview 
                metrics={metrics}
                justifications={{
                  fluency: justifications.fluency,
                  grammar: justifications.grammar,
                  vocabulary: justifications.vocabulary,
                  pronunciation: justifications.pronunciation,
                  coherence: justifications.coherence,
                  syntax: justifications.syntax
                }}
                title="Speaking Skills"
              />
              
              {audioAnalysis && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Speech Analysis</h3>
                  <SpeechAnalysis audioAnalysis={audioAnalysis} compact={true} />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="listening">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Listening Skills</h3>
              <p className="mb-4">Overall Listening Score: {metrics.listening !== undefined ? Math.round(metrics.listening * 10) : 'Not Available'}%</p>
              <p className="mb-2">CEFR Level: {metrics.listening !== undefined ? mapScoreToCEFR(metrics.listening * 10) : 'Not Assessed'}</p>
              <p>{justifications.listening}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="reading">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Reading Skills</h3>
              <p className="mb-4">Overall Reading Score: {metrics.reading !== undefined ? Math.round(metrics.reading * 10) : 'Not Available'}%</p>
              <p className="mb-2">CEFR Level: {metrics.reading !== undefined ? mapScoreToCEFR(metrics.reading * 10) : 'Not Assessed'}</p>
              <p>{justifications.reading}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="writing">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Writing Skills</h3>
              <p className="mb-4">Overall Writing Score: {metrics.writing !== undefined ? Math.round(metrics.writing * 10) : 'Not Available'}%</p>
              <p className="mb-2">CEFR Level: {metrics.writing !== undefined ? mapScoreToCEFR(metrics.writing * 10) : 'Not Assessed'}</p>
              <p>{justifications.writing}</p>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="border rounded p-3">
                  <h4 className="font-medium">Coherence and Cohesion</h4>
                  <p className="text-sm">{justifications.coherence}</p>
                </div>
                <div className="border rounded p-3">
                  <h4 className="font-medium">Grammar and Syntax</h4>
                  <p className="text-sm">{justifications.grammar}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
      
      {audioAnalysis && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 text-assessment-blue border-b pb-2">Speaker Verification</h2>
          <SpeakerConsistency 
            micTestCompleted={true}
            confidenceScore={100} // Placeholder
            mismatchDetected={false} // Placeholder
          />
        </Card>
      )}
      
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 text-assessment-blue border-b pb-2">Learning Recommendations</h2>
        <LearningRecommendations 
          metrics={metrics}
          cefrLevel={cefrLevel as CEFRLevel}
          isQuickAssessment={false}
          assessmentSections={fullAssessmentData?.sections || []}
        />
      </Card>
      
      <div className="text-center text-sm text-gray-500 mt-8 pt-4 border-t">
        <p>This report is generated by LinguaSpeak AI Assessment System</p>
        <p>Report Date: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default FullAssessmentReport;
