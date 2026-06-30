
import React from 'react';
import { AssessmentResult, AudioAnalysisResult, CEFRLevel, FullAssessment } from '@/types/assessment';
import ReportHeader from './sections/ReportHeader';
import CandidateProfile from './sections/CandidateProfile';
import CEFRBadge from './elements/CEFRBadge';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Languages, Mic, BookOpen } from 'lucide-react';

interface FullAssessmentReportProps {
  result: AssessmentResult;
  fullAssessmentData?: FullAssessment;
  audioAnalysis?: AudioAnalysisResult;
  learnerName: string;
  sessionId: string;
  dateOfTest: string;
}

const getCEFRBadgeColor = (level: string) => {
  const colors: Record<string, string> = {
    'A1': 'bg-orange-100 text-orange-800',
    'A2': 'bg-amber-100 text-amber-800',
    'B1': 'bg-teal-100 text-teal-800',
    'B2': 'bg-emerald-100 text-emerald-800',
    'C1': 'bg-blue-100 text-blue-800',
    'C2': 'bg-purple-100 text-purple-800'
  };
  return colors[level] || 'bg-gray-100 text-gray-800';
};

const FullAssessmentReport: React.FC<FullAssessmentReportProps> = ({
  result,
  learnerName,
  sessionId,
  dateOfTest
}) => {
  const { cefrLevel } = result;

  // Extract the 3 real scoring criteria from audioAnalysis
  const grammarApi = result.audioAnalysis?.grammarApiAnalysis;
  const grammarCefr = grammarApi?.apiUsed ? grammarApi.cefr : null;
  const grammarScores = grammarApi?.apiUsed ? grammarApi.scores : null;

  const fluencyApi = result.audioAnalysis?.fluencyApiAnalysis;
  const fluencyCefr = fluencyApi?.apiUsed ? fluencyApi.cefr : null;
  const fluencySpm = fluencyApi?.apiUsed ? (fluencyApi as any).spm : null;

  const vocabCefr = result.audioAnalysis?.cefrVocabularyLevel || null;
  const vocabDistribution = result.audioAnalysis?.vocabularyDistribution || {};

  return (
    <div className="report-container space-y-8 print:text-black">
      <ReportHeader title="Assessment Report" />
      
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <CandidateProfile
            name={learnerName}
            sessionId={sessionId}
            dateOfTest={dateOfTest}
            overallScore={0}
            cefrLevel={cefrLevel}
          />
        </div>
        <div className="flex justify-center items-start">
          <CEFRBadge level={cefrLevel as CEFRLevel} size="large" />
        </div>
      </div>
      
      {/* 3-Criteria Breakdown */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Scoring Breakdown</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Results from Grammar API, Fluency API, and Vocabulary Analysis only
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Grammar */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Languages className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Grammar</h3>
              {grammarCefr && (
                <Badge className={`ml-auto ${getCEFRBadgeColor(grammarCefr)}`}>{grammarCefr}</Badge>
              )}
            </div>
            {grammarScores ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Accuracy</span><span>{(grammarScores.accuracy * 100).toFixed(0)}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Complexity</span><span>{(grammarScores.complexity * 100).toFixed(0)}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Lexical</span><span>{(grammarScores.lexical * 100).toFixed(0)}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Structure</span><span>{(grammarScores.structure * 100).toFixed(0)}%</span></div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not available</p>
            )}
          </div>

          {/* Fluency */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Mic className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Fluency</h3>
              {fluencyCefr && (
                <Badge className={`ml-auto ${getCEFRBadgeColor(fluencyCefr)}`}>{fluencyCefr}</Badge>
              )}
            </div>
            {fluencyCefr ? (
              <div className="space-y-2 text-sm">
                {fluencySpm && <div className="flex justify-between"><span className="text-muted-foreground">SPM</span><span>{fluencySpm}</span></div>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not available</p>
            )}
          </div>

          {/* Vocabulary */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Vocabulary</h3>
              {vocabCefr && (
                <Badge className={`ml-auto ${getCEFRBadgeColor(vocabCefr)}`}>{vocabCefr}</Badge>
              )}
            </div>
            {Object.keys(vocabDistribution).length > 0 ? (
              <div className="space-y-1 text-sm">
                {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => {
                  const count = vocabDistribution[level] || 0;
                  if (count === 0) return null;
                  return (
                    <div key={level} className="flex justify-between">
                      <span className="text-muted-foreground">{level} words</span>
                      <span>{count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not available</p>
            )}
          </div>
        </div>
      </Card>
      
      <div className="text-center text-sm text-muted-foreground mt-8 pt-4 border-t">
        <p>English Placement Assessment Report</p>
        <p>Report Date: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default FullAssessmentReport;
