import React, { useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { AssessmentResult } from '@/types/assessment';
import ProcessingResults from './ProcessingResults';
import { useSessionManagement } from '@/hooks/assessment/useSessionManagement';
import { supabase } from '@/integrations/supabase/client';

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

/**
 * Post-test screen for the student. The learner NO LONGER sees an immediate
 * score — the result is reviewed by a human assessor first and emailed to the
 * student. We show a thank-you + "within 24 hours" note here. The result is
 * still saved in the background (storeAssessmentData). Admin/testing builds can
 * still inspect the raw scoring via `showRawScoring`.
 */
const ResultsStep: React.FC<ResultsStepProps> = ({
  result,
  promptHistory = [],
  showRawScoring,
  isProcessing,
  processingProgress = { current: 0, total: 0 },
  onReset,
}) => {
  const { storeAssessmentData } = useSessionManagement();
  const [storageAttempted, setStorageAttempted] = React.useState<string | null>(null);

  // Fallback storage: if we have a result but no evidence of storage, try once.
  useEffect(() => {
    if (result && !isProcessing && result.sessionId && storageAttempted !== result.sessionId) {
      setStorageAttempted(result.sessionId);
      const studentInfo = {
        name: result.learnerName || 'Anonymous User',
        sessionId: result.sessionId,
        email: '',
      };
      storeAssessmentData(studentInfo, promptHistory, result).catch((error) => {
        console.log('❌ ResultsStep: Fallback storage failed:', error);
      });
    }
  }, [result, isProcessing, promptHistory, storeAssessmentData, storageAttempted]);

  // Partner handoff: if this session came from a /t/:token invite, link the
  // finished session back to it so the partner can retrieve the result.
  useEffect(() => {
    if (!result?.sessionId || isProcessing) return;
    let token: string | null = null;
    try { token = sessionStorage.getItem('invite_token'); } catch { return; }
    if (!token) return;
    supabase.functions
      .invoke('assessment-invite', { body: { action: 'link', token, session_id: result.sessionId } })
      .finally(() => {
        try {
          sessionStorage.removeItem('invite_token');
          sessionStorage.removeItem('invite_brand');
          sessionStorage.removeItem('invite_candidate');
        } catch { /* ignore */ }
      });
  }, [result?.sessionId, isProcessing]);

  if (isProcessing) {
    return (
      <ProcessingResults
        current={processingProgress.current}
        total={processingProgress.total}
        isProcessing={isProcessing}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center pt-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-assessment-teal/10">
            <CheckCircle2 className="h-9 w-9 text-assessment-teal" />
          </div>
          <h2 className="text-2xl font-bold text-assessment-blue">Thank you!</h2>
        </CardHeader>

        <CardContent className="text-center pb-6 space-y-3">
          <p className="text-gray-700">Your assessment has been submitted successfully.</p>
          <p className="text-gray-600">
            Our team will review your responses and share your results with you{' '}
            <span className="font-semibold">within 24 hours</span>.
          </p>
        </CardContent>

        <CardFooter className="flex justify-center pb-10">
          <Button variant="outline" onClick={onReset}>Done</Button>
        </CardFooter>
      </Card>

      {/* Admin/testing only: raw per-prompt scoring (never shown to students). */}
      {showRawScoring && promptHistory.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <h3 className="text-lg font-semibold">Admin View: Raw Scoring Data</h3>
            <p className="text-xs text-muted-foreground">Detailed scoring information for each prompt response</p>
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
                        fluencyScore: item.result.audioAnalysis.fluencyScore,
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
