import React, { useRef, useMemo, useState } from 'react';
import { AssessmentResult, AudioAnalysisResult, FullAssessment } from '@/types/assessment';
import QuickAssessmentReport from './QuickAssessmentReport';
import FullAssessmentReport from './FullAssessmentReport';
import EnhancedPronunciationAnalysis from './EnhancedPronunciationAnalysis';
import ReportDownloadButton from './ReportDownloadButton';
import ScoreOverride from '../assessment/ScoreOverride';
import { useAuth } from '@/contexts/auth';
import { usePdfGeneration } from '@/hooks/reports/usePdfGeneration';

interface ReportGeneratorProps {
  result: AssessmentResult;
  audioAnalysis?: AudioAnalysisResult;
  isFullAssessment?: boolean;
  fullAssessmentData?: FullAssessment;
  learnerName?: string;
  sessionId?: string;
  promptHistory?: { prompt: any; result?: AssessmentResult }[];
}

interface TimestampError {
  start: number;
  end: number;
  type: 'phoneme' | 'pause' | 'disfluency';
  message: string;
  phoneme?: string;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  result,
  audioAnalysis,
  isFullAssessment = false,
  fullAssessmentData,
  learnerName = 'Anonymous Learner',
  sessionId = `S-${Date.now().toString(36)}`,
  promptHistory = []
}) => {
  const { user } = useAuth();
  const [currentResult, setCurrentResult] = useState(result);
  const reportRef = useRef<HTMLDivElement>(null);
  const dateOfTest = new Date().toLocaleDateString();

  // Check if user has admin/assessor permissions
  const canOverrideScores = user?.role === 'admin' || user?.role === 'assessor';

  const { isGeneratingPDF, handleDownloadReport } = usePdfGeneration({
    learnerName,
    sessionId,
    dateOfTest,
    isFullAssessment: isFullAssessment || false,
    promptHistory: promptHistory || []
  });

  // Convert pronunciation data to waveform errors
  const waveformErrors = useMemo(() => {
    const errors: TimestampError[] = [];
    
    if (currentResult.audioAnalysis?.pronunciationDetails?.problematic_phonemes) {
      currentResult.audioAnalysis.pronunciationDetails.problematic_phonemes.forEach(phoneme => {
        if (phoneme.start !== undefined && phoneme.end !== undefined) {
          errors.push({
            start: phoneme.start,
            end: phoneme.end,
            type: 'phoneme' as const,
            message: `Pronunciation issue with /${phoneme.phone}/ sound`,
            phoneme: phoneme.phone
          });
        }
      });
    }

    return errors;
  }, [currentResult.audioAnalysis]);

  const pronunciationData = useMemo(() => {
    const details = currentResult.audioAnalysis?.pronunciationDetails;
    if (!details) return null;

    return {
      wordAccuracy: details.word_accuracy || 0,
      phonemeAccuracy: details.phoneme_accuracy || 0,
      speechRate: details.speech_rate || 0,
      targetSpeechRate: details.cefr_level ? `${details.cefr_level} level` : 'B1 level',
      overallScore: details.pronunciation_score || 0,
      cefrLevel: details.cefr_level || 'B1'
    };
  }, [currentResult.audioAnalysis]);

  // Handle score override completion
  const handleScoreOverrideComplete = (updatedResult: AssessmentResult) => {
    setCurrentResult(updatedResult);
  };

  const handleDownload = () => {
    handleDownloadReport(reportRef, waveformErrors);
  };

  return (
    <div className="space-y-4">
      {/* Header with download button and admin controls */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-assessment-blue">
            {isFullAssessment ? 'Full Assessment Report' : 'Quick Assessment Report'}
          </h2>
          <p className="text-muted-foreground">
            Comprehensive analysis for {learnerName}
          </p>
        </div>
        
        <div className="flex gap-3">
          {canOverrideScores && sessionId && (
            <ScoreOverride 
              result={currentResult}
              sessionId={sessionId}
              onOverrideComplete={handleScoreOverrideComplete}
            />
          )}
          <ReportDownloadButton
            onDownload={handleDownload}
            isGenerating={isGeneratingPDF}
            isFullAssessment={isFullAssessment}
          />
        </div>
      </div>
      
      <div ref={reportRef} className="bg-white p-6 rounded-lg shadow-md">
        {isFullAssessment ? (
          <FullAssessmentReport 
            result={currentResult}
            fullAssessmentData={fullAssessmentData}
            learnerName={learnerName}
            sessionId={sessionId}
            dateOfTest={dateOfTest}
            audioAnalysis={audioAnalysis}
          />
        ) : (
          <QuickAssessmentReport 
            result={currentResult}
            audioAnalysis={audioAnalysis}
            learnerName={learnerName}
            sessionId={sessionId}
            dateOfTest={dateOfTest}
          />
        )}

        {/* Enhanced Pronunciation Analysis Section for PDF */}
        {pronunciationData && (
          <EnhancedPronunciationAnalysis
            pronunciationData={pronunciationData}
            audioUrl={currentResult.audioUrl}
            waveformErrors={waveformErrors}
            duration={currentResult.duration || 10}
          />
        )}
      </div>
    </div>
  );
};

export default ReportGenerator;