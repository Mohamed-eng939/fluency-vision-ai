/**
 * Fluency Analysis API Service
 * Calls fluency API via Edge Function proxy to avoid CORS issues
 */

import { supabase } from '@/integrations/supabase/client';

export interface FluencyApiRequest {
  transcript: string;
  duration_seconds: number;
}

export interface FluencyApiResponse {
  syllables: number;
  spm: number;  // Syllables per minute
  cefr_level: string;  // "A1", "A2", "B1", etc.
}

/**
 * Analyze fluency using Edge Function proxy
 */
export async function analyzeFluencyWithApi(
  transcript: string,
  durationSeconds: number
): Promise<FluencyApiResponse> {
  const { data, error } = await supabase.functions.invoke('fluency-proxy', {
    body: { transcript, duration_seconds: durationSeconds },
  });

  if (error) {
    throw new Error(`Fluency API error: ${error.message}`);
  }

  if (data?.error) {
    throw new Error(`Fluency API error: ${data.error}`);
  }

  return data;
}
