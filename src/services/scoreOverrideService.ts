import { supabase } from '@/integrations/supabase/client';
import { AssessmentMetrics } from '@/types/assessment';

export interface ScoreOverrideData {
  sessionId: string;
  responseId?: string;
  overrideScores: Partial<AssessmentMetrics>;
  overrideNotes: Record<string, string>;
  originalScores: AssessmentMetrics;
  overrideReason: string;
}

export interface ScoreOverrideRecord {
  id: string;
  session_id: string;
  response_id?: string;
  override_scores: any;
  override_notes: any;
  original_scores: any;
  overridden_by: string;
  overridden_at: string;
  override_reason: string;
  is_active: boolean;
}

class ScoreOverrideService {
  /**
   * Create a new score override
   */
  async createOverride(data: ScoreOverrideData): Promise<ScoreOverrideRecord> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const { data: override, error } = await supabase
      .from('score_overrides')
      .insert({
        session_id: data.sessionId,
        response_id: data.responseId,
        override_scores: data.overrideScores as any,
        override_notes: data.overrideNotes as any,
        original_scores: data.originalScores as any,
        overridden_by: user.user.id,
        override_reason: data.overrideReason
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create override: ${error.message}`);
    }

    return override;
  }

  /**
   * Get the latest active override for a session
   */
  async getSessionOverride(sessionId: string): Promise<ScoreOverrideRecord | null> {
    const { data, error } = await supabase
      .from('score_overrides')
      .select('*')
      .eq('session_id', sessionId)
      .eq('is_active', true)
      .order('overridden_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch override: ${error.message}`);
    }

    return data;
  }

  /**
   * Check if a session has any active overrides
   */
  async hasSessionOverride(sessionId: string): Promise<boolean> {
    const override = await this.getSessionOverride(sessionId);
    return override !== null;
  }

  /**
   * Get all overrides for a session (history)
   */
  async getSessionOverrideHistory(sessionId: string): Promise<ScoreOverrideRecord[]> {
    const { data, error } = await supabase
      .from('score_overrides')
      .select(`
        *,
        profiles!overridden_by(name, email)
      `)
      .eq('session_id', sessionId)
      .order('overridden_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch override history: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Deactivate an override (instead of deleting)
   */
  async deactivateOverride(overrideId: string): Promise<void> {
    const { error } = await supabase
      .from('score_overrides')
      .update({ is_active: false })
      .eq('id', overrideId);

    if (error) {
      throw new Error(`Failed to deactivate override: ${error.message}`);
    }
  }

  /**
   * Calculate weighted score using the new skill weights
   */
  calculateWeightedScore(metrics: Partial<AssessmentMetrics>): number {
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
      (metrics.fluency || 0) * skillWeights.fluency +
      (metrics.grammar || 0) * skillWeights.grammar +
      (metrics.vocabulary || 0) * skillWeights.vocabulary +
      (metrics.pronunciation || 0) * skillWeights.pronunciation +
      (metrics.prosody || 0) * skillWeights.prosody +
      (metrics.coherence || 0) * skillWeights.coherence +
      (metrics.syntax || 0) * skillWeights.syntax
    ) / totalWeight;
    
    return Math.round(weightedScore * 10); // Convert to percentage
  }

  /**
   * Determine CEFR level from percentage score
   */
  determineCEFRLevel(score: number): string {
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
  }
}

export const scoreOverrideService = new ScoreOverrideService();