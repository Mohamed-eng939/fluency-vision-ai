import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Save, AlertTriangle } from 'lucide-react';
import { AssessmentResult, AssessmentMetrics } from '@/types/assessment';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ScoreOverrideProps {
  result: AssessmentResult;
  sessionId: string;
  onOverrideComplete: (updatedResult: AssessmentResult) => void;
}

interface OverrideData {
  scores: Partial<AssessmentMetrics>;
  notes: Record<string, string>;
  reason: string;
}

const ScoreOverride: React.FC<ScoreOverrideProps> = ({
  result,
  sessionId,
  onOverrideComplete
}) => {
  const { toast } = useToast();
  const [isOverriding, setIsOverriding] = useState(false);
  const [overrideData, setOverrideData] = useState<OverrideData>({
    scores: { ...result.metrics },
    notes: {},
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const skillLabels = {
    fluency: 'Fluency',
    grammar: 'Grammar',
    vocabulary: 'Vocabulary',
    pronunciation: 'Pronunciation',
    prosody: 'Prosody',
    coherence: 'Coherence',
    syntax: 'Syntax'
  } as const;

  const handleScoreChange = (skill: keyof AssessmentMetrics, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
      setOverrideData(prev => ({
        ...prev,
        scores: { ...prev.scores, [skill]: numValue }
      }));
    }
  };

  const handleNoteChange = (skill: keyof AssessmentMetrics, note: string) => {
    setOverrideData(prev => ({
      ...prev,
      notes: { ...prev.notes, [skill]: note }
    }));
  };

  const calculateOverriddenTotalScore = () => {
    const scores = overrideData.scores;
    const skillWeights = {
      fluency: 1.4,
      grammar: 1.3,
      vocabulary: 1.2,
      coherence: 1.0,
      syntax: 0.7,
      prosody: 0.8,
      pronunciation: 0.6
    };
    
    const totalWeight = Object.values(skillWeights).reduce((sum, weight) => sum + weight, 0);
    const weightedScore = (
      (scores.fluency || 0) * skillWeights.fluency +
      (scores.grammar || 0) * skillWeights.grammar +
      (scores.vocabulary || 0) * skillWeights.vocabulary +
      (scores.pronunciation || 0) * skillWeights.pronunciation +
      (scores.prosody || 0) * skillWeights.prosody +
      (scores.coherence || 0) * skillWeights.coherence +
      (scores.syntax || 0) * skillWeights.syntax
    ) / totalWeight;
    
    return Math.round(weightedScore * 10);
  };

  const determineCEFRFromScore = (score: number) => {
    if (score >= 95) return 'C2';
    if (score >= 85) return 'C1+';
    if (score >= 80) return 'C1';
    if (score >= 75) return 'B2+';
    if (score >= 65) return 'B2';
    if (score >= 55) return 'B1+';
    if (score >= 50) return 'B1';
    if (score >= 45) return 'A2+';
    if (score >= 35) return 'A2';
    if (score >= 25) return 'A1+';
    if (score >= 15) return 'A1';
    return 'Pre-A1';
  };

  const handleSubmitOverride = async () => {
    setIsSubmitting(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Insert score override
      const { error } = await supabase
        .from('assessor_reviews')
        .insert({
          session_id: sessionId,
          assessor_id: user.user.id,
          override_scores: overrideData.scores as any,
          assessor_feedback: overrideData.notes as any,
          recommendation: overrideData.reason,
          review_status: 'approved'
        });

      if (error) throw error;

      // Calculate new totals
      const newTotalScore = calculateOverriddenTotalScore();
      const newCEFRLevel = determineCEFRFromScore(newTotalScore);

      // Create updated result
      const updatedResult: AssessmentResult = {
        ...result,
        metrics: overrideData.scores as AssessmentMetrics,
        totalScore: newTotalScore,
        cefrLevel: newCEFRLevel
      };

      toast({
        title: "Score Override Applied",
        description: `Scores updated successfully. New CEFR level: ${newCEFRLevel}`,
      });

      onOverrideComplete(updatedResult);
      setIsOverriding(false);
    } catch (error) {
      console.error('Error applying score override:', error);
      toast({
        title: "Override Failed",
        description: "Failed to apply score override. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOverriding) {
    return (
      <Button 
        onClick={() => setIsOverriding(true)}
        variant="outline"
        className="gap-2"
      >
        <Shield className="h-4 w-4" />
        Edit Scores
      </Button>
    );
  }

  const newTotalScore = calculateOverriddenTotalScore();
  const newCEFRLevel = determineCEFRFromScore(newTotalScore);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Score Override Interface
        </CardTitle>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This will permanently modify the assessment scores. Provide clear justification for any changes.
          </AlertDescription>
        </Alert>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Score Override Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(skillLabels).map(([skill, label]) => (
            <div key={skill} className="space-y-3">
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <Label htmlFor={`score-${skill}`}>
                    {label} Score (0-10)
                  </Label>
                  <Input
                    id={`score-${skill}`}
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={overrideData.scores[skill as keyof AssessmentMetrics] || ''}
                    onChange={(e) => handleScoreChange(skill as keyof AssessmentMetrics, e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Original: {result.metrics[skill as keyof AssessmentMetrics]?.toFixed(1)}
                </div>
              </div>
              
              <div>
                <Label htmlFor={`note-${skill}`}>
                  Rationale for {label}
                </Label>
                <Textarea
                  id={`note-${skill}`}
                  placeholder={`Explain why the ${label.toLowerCase()} score was modified...`}
                  value={overrideData.notes[skill] || ''}
                  onChange={(e) => handleNoteChange(skill as keyof AssessmentMetrics, e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Overall Reason */}
        <div>
          <Label htmlFor="override-reason">
            Overall Override Reason
          </Label>
          <Textarea
            id="override-reason"
            placeholder="Provide a summary of why this override was necessary..."
            value={overrideData.reason}
            onChange={(e) => setOverrideData(prev => ({ ...prev, reason: e.target.value }))}
            rows={3}
          />
        </div>

        {/* Score Preview */}
        <Card className="bg-muted">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-destructive">
                  {result.totalScore}
                </div>
                <div className="text-sm text-muted-foreground">Original Score</div>
                <div className="text-sm font-medium">{result.cefrLevel}</div>
              </div>
              <div className="text-2xl font-bold">→</div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {newTotalScore}
                </div>
                <div className="text-sm text-muted-foreground">New Score</div>
                <div className="text-sm font-medium">{newCEFRLevel}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button 
            variant="outline" 
            onClick={() => setIsOverriding(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitOverride}
            disabled={isSubmitting || !overrideData.reason.trim()}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Applying...' : 'Apply Override'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreOverride;