import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

export const AssessmentStorageDemo = () => {
  const [storedResponses, setStoredResponses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStoredData = async () => {
    setIsLoading(true);
    try {
      const { data: responses, error } = await supabase
        .from('responses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching responses:', error);
      } else {
        setStoredResponses(responses || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleResult = {
    prompt: {
      id: 'demo-prompt',
      text: 'Tell me about your favorite book.'
    },
    result: {
      metrics: {
        fluency: 7.5,
        grammar: 8.0,
        pronunciation: 7.8,
        vocabulary: 8.2,
        syntax: 7.6,
        coherence: 8.1,
        prosody: 7.9
      },
      totalScore: 77.3,
      cefrLevel: 'B2',
      transcript: 'My favorite book is To Kill a Mockingbird because it explores important themes about justice and moral courage.',
      duration: 45,
      confidenceScore: 0.85,
      audioAnalysis: {
        wpm: 120,
        pauseCount: 3,
        pauseRatio: 0.15
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📊 Assessment Storage Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={fetchStoredData} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'View Stored Assessments'}
            </Button>
          </div>

          <div className="grid gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Sample Assessment Result:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="font-medium">Fluency:</span> {sampleResult.result.metrics.fluency}/10
                </div>
                <div>
                  <span className="font-medium">Grammar:</span> {sampleResult.result.metrics.grammar}/10
                </div>
                <div>
                  <span className="font-medium">Pronunciation:</span> {sampleResult.result.metrics.pronunciation}/10
                </div>
                <div>
                  <span className="font-medium">Vocabulary:</span> {sampleResult.result.metrics.vocabulary}/10
                </div>
                <div>
                  <span className="font-medium">Coherence:</span> {sampleResult.result.metrics.coherence}/10
                </div>
                <div>
                  <span className="font-medium">Prosody:</span> {sampleResult.result.metrics.prosody}/10
                </div>
                <div>
                  <span className="font-medium">Total Score:</span> {sampleResult.result.totalScore}/100
                </div>
                <div>
                  <Badge variant="secondary">CEFR: {sampleResult.result.cefrLevel}</Badge>
                </div>
              </div>
            </div>

            {storedResponses.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Stored Responses ({storedResponses.length}):</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {storedResponses.map((response) => (
                    <div key={response.id} className="p-3 border rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm">
                          <strong>Assessment ID:</strong> {response.assessment_id}
                        </div>
                        <Badge variant={response.is_final ? 'default' : 'secondary'}>
                          {response.is_final ? 'Final' : 'Individual'}
                        </Badge>
                      </div>
                      {response.scores && (
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>CEFR: {response.scores.cefr_level}</div>
                          <div>Score: {response.scores.total_score}</div>
                          <div>Fluency: {response.scores.fluency}</div>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(response.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};