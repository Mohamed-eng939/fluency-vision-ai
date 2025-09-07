
import React, { useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AssessmentResult, AudioAnalysisResult } from '@/types/assessment';
import AssessmentResults from './AssessmentResults';
import ProcessingResults from './ProcessingResults';
import CEFRSkillsBreakdown from '@/components/reports/sections/CEFRSkillsBreakdown';
import { useSessionManagement } from '@/hooks/assessment/useSessionManagement';

interface ResultsStepProps {
  result: AssessmentResult | null;
  detailedFeedback: Record<string, string> | null;
  promptHistory?: { prompt: any; result?: AssessmentResult }[];
  showRawScoring: boolean;
  isProcessing: boolean;
  processingProgress?: { current: number; total: number };
  onReset: () => void;
  onTakeFullAssessment: () => void;
}

const ResultsStep: React.FC<ResultsStepProps> = ({
  result,
  detailedFeedback,
  promptHistory = [],
  showRawScoring,
  isProcessing,
  processingProgress = { current: 0, total: 0 },
  onReset,
  onTakeFullAssessment
}) => {
  const { storeAssessmentData } = useSessionManagement();
  const [storageError, setStorageError] = React.useState<string | null>(null);
  
  console.log("ResultsStep rendering with result:", result, "isProcessing:", isProcessing);
  
  // Fallback storage: if we have a result but no evidence of storage, try to store it
  useEffect(() => {
    if (result && !isProcessing) {
      console.log("🔍 ResultsStep: Checking if we need to store assessment data...");
      
      // Simple check: if we have a result, try to store it as a fallback
      // This ensures data gets saved even if the main flow missed it somehow
      const studentInfo = {
        name: result.learnerName || 'Anonymous User',
        sessionId: result.sessionId,
        email: '', // Will be filled by the session management
      };
      
      console.log("💾 ResultsStep: Attempting fallback storage of assessment data");
      storeAssessmentData(studentInfo, promptHistory, result)
        .then(() => {
          console.log("✅ ResultsStep: Fallback storage successful");
          setStorageError(null);
        })
        .catch((error) => {
          console.log("❌ ResultsStep: Fallback storage failed:", error);
          setStorageError(error?.message || error?.toString() || "Failed to save assessment data");
        });
    }
  }, [result, isProcessing, promptHistory, storeAssessmentData]);
  
  // Show processing state if still processing
  if (isProcessing) {
    return (
      <ProcessingResults
        current={processingProgress.current}
        total={processingProgress.total}
        isProcessing={isProcessing}
      />
    );
  }
  
  if (!result) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <h2 className="text-2xl font-bold text-assessment-blue">Assessment Complete</h2>
            <p className="text-gray-600">Processing your results...</p>
          </CardHeader>
          
          <CardContent className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-b-2 border-assessment-blue mx-auto mb-4"></div>
            <p>Generating your assessment report...</p>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={onReset}>
              Start New Assessment
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Convert AssessmentMetrics to Record<string, number>
  const skillScores: Record<string, number> = {
    grammar: result.metrics.grammar,
    fluency: result.metrics.fluency,
    vocabulary: result.metrics.vocabulary,
    pronunciation: result.metrics.pronunciation,
    prosody: result.metrics.prosody,
    coherence: result.metrics.coherence,
    syntax: result.metrics.syntax
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <h2 className="text-2xl font-bold text-assessment-blue">Assessment Results</h2>
          <p className="text-gray-600">Your English speaking proficiency level</p>
        </CardHeader>
        
        <CardContent>
          {/* Storage Error Display */}
          {storageError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-semibold mb-2">Data Storage Error</h3>
              <p className="text-red-700 text-sm">{storageError}</p>
              <p className="text-red-600 text-xs mt-2">
                Your assessment results are displayed but may not be saved to the database.
              </p>
            </div>
          )}
          
          {/* Enhanced CEFR Skills Breakdown */}
          {(result as any)?.cefrLevels && (
            <div className="mb-6">
              <CEFRSkillsBreakdown
                skillScores={skillScores}
                cefrLevels={(result as any).cefrLevels}
                overallCEFR={(result as any).overallCEFR}
                showRadarChart={true}
              />
            </div>
          )}
          
          <AssessmentResults
            result={result}
            isProcessing={false}
            detailedFeedback={detailedFeedback}
            promptHistory={promptHistory}
            onReset={() => {}}
            onTakeFullAssessment={() => {}}
          />
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button variant="outline" onClick={onReset}>
            Take Another Assessment
          </Button>
          <Button onClick={onTakeFullAssessment}>
            Take Full Assessment
          </Button>
        </CardFooter>
      </Card>
      
      {showRawScoring && promptHistory.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <h3 className="text-lg font-semibold">Admin View: Raw Scoring Data</h3>
            <p className="text-xs text-muted-foreground">
              Detailed scoring information for each prompt response
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {promptHistory.map((item, index) => (
              <div key={index} className="p-4 border rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">Q{index + 1}: {item.prompt.cefrLevel} Prompt</h4>
                    <p className="text-sm">{item.prompt.text}</p>
                  </div>
                  {item.result && (
                    <div className="text-right">
                      <span className="text-xs bg-assessment-blue/10 text-assessment-blue px-2 py-1 rounded-full">
                        Scored as {(item.result as any).overallCEFR || item.result.cefrLevel}
                      </span>
                    </div>
                  )}
                </div>
                
                {item.result?.audioAnalysis && (
                  <div className="mt-3 border-t pt-3">
                    <p className="text-xs font-medium mb-1">Audio Analysis</p>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-36">
                      {JSON.stringify({
                        wpm: item.result.audioAnalysis.wpm,
                        totalWords: item.result.audioAnalysis.totalWords,
                        speakingDuration: item.result.audioAnalysis.speakingDuration,
                        pauseRatio: item.result.audioAnalysis.pauseRatio,
                        fluencyScore: item.result.audioAnalysis.fluencyScore
                      }, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResultsStep;
